import React, { useRef, useState, useCallback, forwardRef, useImperativeHandle, useEffect, useMemo } from 'react'
import { CanvasState, Shape, Point, ToolType, Group } from '../types'
import { generateId, hexToRgba, findDropTarget, validateNesting, applyNesting, getNestingIndicators, snapToGridPoint, snapToEdges, getGroupShapes, rafThrottle, debounce } from '../utils/helpers'
import { calculateViewport, getShapesToRender, getGroupsToRender, createVirtualizationStats, VirtualizationConfig } from '../utils/virtualization'
import CanvasRenderer from './CanvasRenderer'
import './Canvas.scss'

interface EnhancedCanvasProps {
  canvasState: CanvasState
  setCanvasState: (state: CanvasState | ((prev: CanvasState) => CanvasState)) => void
  currentTool: ToolType
  onSelectionChange?: (selectedIds: string[]) => void
}

const EnhancedCanvas = forwardRef<HTMLDivElement, EnhancedCanvasProps>(({ 
  canvasState, 
  setCanvasState, 
  currentTool, 
  onSelectionChange 
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<Point | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState<Point | null>(null)
  const [resizeStart, setResizeStart] = useState<{ point: Point; shape: Shape } | null>(null)
  const [resizeHandle, setResizeHandle] = useState<string>('')
  const [dragTarget, setDragTarget] = useState<string | null>(null)
  const [nestingPreview, setNestingPreview] = useState<{
    parentId: string | null
    isValid: boolean
    previewPosition: Point
  } | null>(null)
  const [nestingMessage, setNestingMessage] = useState<string | null>(null)
  const [selectionBox, setSelectionBox] = useState<{ start: Point; end: Point } | null>(null)
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 })
  
  // Panning state
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Point | null>(null)

  // Virtualization state
  const virtualizationStats = useMemo(() => createVirtualizationStats(), [])
  const virtualizationConfig: VirtualizationConfig = useMemo(() => ({
    bufferSize: 200,
    minShapeSize: 10
  }), [])

  useImperativeHandle(ref, () => containerRef.current!)

  // Update canvas dimensions
  const updateCanvasDimensions = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setCanvasDimensions({
        width: rect.width,
        height: rect.height
      })
    }
  }, [])

  useEffect(() => {
    updateCanvasDimensions()
    window.addEventListener('resize', updateCanvasDimensions)
    return () => window.removeEventListener('resize', updateCanvasDimensions)
  }, [updateCanvasDimensions])

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenPoint: Point): Point => {
    return {
      x: (screenPoint.x - canvasState.pan.x) / canvasState.zoom,
      y: (screenPoint.y - canvasState.pan.y) / canvasState.zoom
    }
  }, [canvasState.pan.x, canvasState.pan.y, canvasState.zoom])

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = useCallback((canvasPoint: Point): Point => {
    return {
      x: canvasPoint.x * canvasState.zoom + canvasState.pan.x,
      y: canvasPoint.y * canvasState.zoom + canvasState.pan.y
    }
  }, [canvasState.zoom, canvasState.pan.x, canvasState.pan.y])

  // Handle mouse down for drawing, dragging, and selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const screenPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    const canvasPoint = screenToCanvas(screenPoint)

    // Handle drawing tools
    if (currentTool === 'rectangle' || currentTool === 'circle') {
      setIsDrawing(true)
      setDrawStart(canvasPoint)
      return
    }

    // Handle selection and dragging
    if (currentTool === 'select') {
      // Check if clicking on a shape
      const clickedShape = findShapeAtPoint(canvasPoint)
      
      if (clickedShape) {
        if (e.shiftKey) {
          // Multi-select
          setCanvasState(prev => ({
            ...prev,
            selectedShapeIds: prev.selectedShapeIds.includes(clickedShape.id)
              ? prev.selectedShapeIds.filter(id => id !== clickedShape.id)
              : [...prev.selectedShapeIds, clickedShape.id]
          }))
        } else {
          // Single select
          setCanvasState(prev => ({
            ...prev,
            selectedShapeId: clickedShape.id,
            selectedShapeIds: [clickedShape.id]
          }))
        }
        
        // Start dragging
        setIsDragging(true)
        setDragStart(screenPoint)
        onSelectionChange?.(canvasState.selectedShapeIds)
      } else {
        // Clear selection if clicking on empty space
        if (!e.shiftKey) {
          setCanvasState(prev => ({
            ...prev,
            selectedShapeId: null,
            selectedShapeIds: []
          }))
          onSelectionChange?.([])
        }
        
        // Start selection box
        setSelectionBox({ start: canvasPoint, end: canvasPoint })
      }
    }
  }, [currentTool, canvasState.selectedShapeIds, screenToCanvas, setCanvasState, onSelectionChange])

  // Handle panning with Shift + Left Mouse Button
  const handleMouseDownPan = useCallback((e: React.MouseEvent) => {
    // Shift + Left mouse button for panning
    if (e.button === 0 && e.shiftKey) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }, [])

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const screenPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    const canvasPoint = screenToCanvas(screenPoint)

    // Handle drawing
    if (isDrawing && drawStart) {
      // Update temporary shape for drawing preview
      const width = Math.max(Math.abs(canvasPoint.x - drawStart.x), 10)
      const height = Math.max(Math.abs(canvasPoint.y - drawStart.y), 10)
      const position = {
        x: Math.min(drawStart.x, canvasPoint.x),
        y: Math.min(drawStart.y, canvasPoint.y)
      }

      const tempShape: Shape = {
        id: 'temp',
        type: currentTool === 'rectangle' ? 'rectangle' : 'circle',
        position,
        size: { width, height },
        elementTag: 'div',
        elementId: '',
        cssClasses: '',
        fillColor: '#e2e8f0',
        borderColor: '#64748b',
        borderWidth: 1,
        borderStyle: 'solid',
        opacity: 1,
        zIndex: canvasState.shapes.length,
        borderRadius: 0,
        boxShadow: {
          offsetX: 0,
          offsetY: 0,
          blurRadius: 0,
          spreadRadius: 0,
          color: '#000000',
          enabled: false
        },
        typography: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 14,
          fontWeight: 'normal',
          fontColor: '#000000',
          textAlign: 'left',
          lineHeight: 1.2,
          letterSpacing: 0,
          textDecoration: 'none',
          textTransform: 'none'
        }
      }

      setCanvasState(prev => ({
        ...prev,
        shapes: [...prev.shapes.filter(s => s.id !== 'temp'), tempShape]
      }))
    }

    // Handle panning
    if (isPanning && panStart) {
      const deltaX = e.clientX - panStart.x
      const deltaY = e.clientY - panStart.y

      setCanvasState(prev => ({
        ...prev,
        pan: {
          x: prev.pan.x + deltaX,
          y: prev.pan.y + deltaY
        }
      }))

      setPanStart({ x: e.clientX, y: e.clientY })
    }

    // Handle dragging
    if (isDragging && dragStart && canvasState.selectedShapeIds.length > 0) {
      const deltaX = screenPoint.x - dragStart.x
      const deltaY = screenPoint.y - dragStart.y
      const canvasDelta = {
        x: deltaX / canvasState.zoom,
        y: deltaY / canvasState.zoom
      }

      setCanvasState(prev => ({
        ...prev,
        shapes: prev.shapes.map(shape => {
          if (prev.selectedShapeIds.includes(shape.id)) {
            let newPosition = {
              x: shape.position.x + canvasDelta.x,
              y: shape.position.y + canvasDelta.y
            }

            // Apply snapping
            if (prev.snapToGrid) {
              newPosition = snapToGridPoint(newPosition, prev.gridSnapSize)
            }
            if (prev.snapToEdges) {
              newPosition = snapToEdges(prev.shapes.filter(s => !prev.selectedShapeIds.includes(s.id)), { ...shape, position: newPosition }, prev.gridSnapSize)
            }

            return { ...shape, position: newPosition }
          }
          return shape
        })
      }))

      setDragStart(screenPoint)
    }

    // Handle selection box
    if (selectionBox) {
      setSelectionBox(prev => prev ? { ...prev, end: canvasPoint } : null)
    }
  }, [
    isDrawing, drawStart, currentTool, canvasState.shapes.length, canvasState.selectedShapeIds,
    isDragging, dragStart, isPanning, panStart, canvasState.zoom, canvasState.snapToGrid, canvasState.snapToEdges,
    canvasState.gridSnapSize, selectionBox, screenToCanvas, setCanvasState
  ])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isDrawing && drawStart) {
      // Finalize drawing
      setCanvasState(prev => {
        const shapesWithoutTemp = prev.shapes.filter(s => s.id !== 'temp')
        const tempShape = prev.shapes.find(s => s.id === 'temp')
        
        if (tempShape) {
          const newShape: Shape = {
            ...tempShape,
            id: generateId(),
            zIndex: shapesWithoutTemp.length
          }
          
          return {
            ...prev,
            shapes: [...shapesWithoutTemp, newShape],
            selectedShapeId: newShape.id,
            selectedShapeIds: [newShape.id]
          }
        }
        
        return prev
      })
      
      setIsDrawing(false)
      setDrawStart(null)
      onSelectionChange?.(canvasState.selectedShapeIds)
    }

    if (isDragging) {
      setIsDragging(false)
      setDragStart(null)
    }

    if (selectionBox) {
      // Handle selection box completion
      const selectedShapes = getShapesInSelectionBox(selectionBox)
      if (selectedShapes.length > 0) {
        setCanvasState(prev => ({
          ...prev,
          selectedShapeIds: selectedShapes.map(s => s.id)
        }))
        onSelectionChange?.(selectedShapes.map(s => s.id))
      }
      setSelectionBox(null)
    }

    // Handle panning stop
    if (isPanning) {
      setIsPanning(false)
      setPanStart(null)
    }
  }, [
    isDrawing, drawStart, isDragging, selectionBox, isPanning, setCanvasState, onSelectionChange, canvasState.selectedShapeIds
  ])

  // Handle canvas click
  const handleCanvasClick = useCallback((point: Point) => {
    // Handle canvas background click
    if (currentTool === 'select') {
      setCanvasState(prev => ({
        ...prev,
        selectedShapeId: null,
        selectedShapeIds: []
      }))
      onSelectionChange?.([])
    }
  }, [currentTool, setCanvasState, onSelectionChange])

  // Handle shape click
  const handleShapeClick = useCallback((shapeId: string, point: Point) => {
    if (currentTool === 'select') {
      setCanvasState(prev => ({
        ...prev,
        selectedShapeId: shapeId,
        selectedShapeIds: [shapeId]
      }))
      onSelectionChange?.([shapeId])
    }
  }, [currentTool, setCanvasState, onSelectionChange])

  // Helper function to find shape at point
  const findShapeAtPoint = useCallback((point: Point): Shape | null => {
    // Check shapes in reverse z-index order (top to bottom)
    const sortedShapes = [...canvasState.shapes].sort((a, b) => b.zIndex - a.zIndex)
    
    for (const shape of sortedShapes) {
      if (point.x >= shape.position.x && 
          point.x <= shape.position.x + shape.size.width &&
          point.y >= shape.position.y && 
          point.y <= shape.position.y + shape.size.height) {
        return shape
      }
    }
    
    return null
  }, [canvasState.shapes])

  // Helper function to get shapes in selection box
  const getShapesInSelectionBox = useCallback((box: { start: Point; end: Point }): Shape[] => {
    const minX = Math.min(box.start.x, box.end.x)
    const maxX = Math.max(box.start.x, box.end.x)
    const minY = Math.min(box.start.y, box.end.y)
    const maxY = Math.max(box.start.y, box.end.y)

    return canvasState.shapes.filter(shape => {
      const shapeRight = shape.position.x + shape.size.width
      const shapeBottom = shape.position.y + shape.size.height
      
      return shape.position.x <= maxX && shapeRight >= minX &&
             shape.position.y <= maxY && shapeBottom >= minY
    })
  }, [canvasState.shapes])

  // Handle wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.1, Math.min(5, canvasState.zoom * delta))
    
    setCanvasState(prev => ({
      ...prev,
      zoom: newZoom
    }))
  }, [canvasState.zoom, setCanvasState])

  // Add wheel event listener with proper options
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.max(0.1, Math.min(5, canvasState.zoom * delta))
      
      setCanvasState(prev => ({
        ...prev,
        zoom: newZoom
      }))
    }

    container.addEventListener('wheel', wheelHandler, { passive: false })
    
    return () => {
      container.removeEventListener('wheel', wheelHandler)
    }
  }, [canvasState.zoom, setCanvasState])

  return (
    <div 
      ref={containerRef}
      className="canvas-container" 
      style={{ 
        minHeight: '400px', 
        minWidth: '400px',
        position: 'relative',
        backgroundColor: hexToRgba(canvasState.canvasBackgroundColor, canvasState.canvasBackgroundOpacity),
        overflow: 'hidden',
        cursor: isPanning ? 'grabbing' : 'default'
      }}
      onMouseDown={(e) => {
        // Handle panning first, before other mouse down logic
        handleMouseDownPan(e)
        // Only proceed with other mouse down logic if not panning (Shift + Left mouse)
        if (!(e.button === 0 && e.shiftKey)) {
          handleMouseDown(e)
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <CanvasRenderer
        canvasState={canvasState}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        onCanvasClick={handleCanvasClick}
        onShapeClick={handleShapeClick}
        className="canvas-renderer"
      />
      
      {/* Selection box overlay */}
      {selectionBox && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(selectionBox.start.x, selectionBox.end.x) * canvasState.zoom + canvasState.pan.x,
            top: Math.min(selectionBox.start.y, selectionBox.end.y) * canvasState.zoom + canvasState.pan.y,
            width: Math.abs(selectionBox.end.x - selectionBox.start.x) * canvasState.zoom,
            height: Math.abs(selectionBox.end.y - selectionBox.start.y) * canvasState.zoom,
            border: '1px dashed #007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        />
      )}
    </div>
  )
})

EnhancedCanvas.displayName = 'EnhancedCanvas'

export default EnhancedCanvas 