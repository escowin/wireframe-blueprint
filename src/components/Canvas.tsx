import React, { useRef, useState, useCallback, forwardRef, useImperativeHandle, useEffect, useMemo } from 'react'
import { CanvasState, Shape, Point, ToolType, Group } from '../types'
import { generateId, hexToRgba, findDropTarget, validateNesting, applyNesting, getNestingIndicators, snapToGridPoint, snapToEdges, getGroupShapes } from '../utils/helpers'
import './Canvas.scss'

interface CanvasProps {
  canvasState: CanvasState
  setCanvasState: (state: CanvasState | ((prev: CanvasState) => CanvasState)) => void
  currentTool: ToolType
  onSelectionChange?: (selectedIds: string[]) => void
}

// Optimized Shape Component with React.memo
interface ShapeComponentProps {
  shape: Shape
  isSelected: boolean
  hasChildren: boolean
  isChild: boolean
  zoom: number
  pan: Point
  currentTool: ToolType
  showCssLabels: boolean
  onResizeHandleClick: (e: React.MouseEvent, handleType: string, shape: Shape) => void
}

const ShapeComponent = React.memo<ShapeComponentProps>(({ 
  shape, 
  isSelected, 
  hasChildren, 
  isChild, 
  zoom, 
  pan, 
  currentTool, 
  showCssLabels,
  onResizeHandleClick 
}) => {
  // Memoize expensive calculations
  const screenPos = useMemo(() => ({
    x: shape.position.x * zoom + pan.x,
    y: shape.position.y * zoom + pan.y
  }), [shape.position.x, shape.position.y, zoom, pan.x, pan.y])

  const screenSize = useMemo(() => ({
    width: shape.size.width * zoom,
    height: shape.size.height * zoom
  }), [shape.size.width, shape.size.height, zoom])

  // Memoize complex style calculations
  const shapeStyles = useMemo(() => ({
    position: 'absolute' as const,
    left: screenPos.x,
    top: screenPos.y,
    width: screenSize.width,
    height: screenSize.height,
    backgroundColor: hexToRgba(shape.fillColor, shape.opacity),
    border: `${shape.borderWidth * zoom}px ${shape.borderStyle} ${shape.borderColor}`,
    borderRadius: shape.type === 'circle' ? '50%' : `${shape.borderRadius * zoom}px`,
    zIndex: shape.zIndex,
    cursor: isSelected ? 'move' : 'pointer',
    boxShadow: shape.boxShadow.enabled 
      ? `${shape.boxShadow.offsetX * zoom}px ${shape.boxShadow.offsetY * zoom}px ${shape.boxShadow.blurRadius * zoom}px ${shape.boxShadow.spreadRadius * zoom}px ${shape.boxShadow.color}`
      : 'none',
    fontFamily: shape.typography.fontFamily,
    fontSize: `${shape.typography.fontSize * zoom}px`,
    fontWeight: shape.typography.fontWeight,
    color: shape.typography.fontColor,
    textAlign: shape.typography.textAlign,
    lineHeight: shape.typography.lineHeight,
    letterSpacing: `${shape.typography.letterSpacing * zoom}px`,
    textDecoration: shape.typography.textDecoration,
    textTransform: shape.typography.textTransform
  }), [
    screenPos.x, screenPos.y, screenSize.width, screenSize.height,
    shape.fillColor, shape.opacity, shape.borderWidth, zoom, shape.borderStyle,
    shape.borderColor, shape.type, shape.borderRadius, shape.zIndex, isSelected,
    shape.boxShadow, shape.typography
  ])

  // Memoize CSS class string
  const shapeClassName = useMemo(() => {
    const classes = ['canvas-shape', shape.type]
    if (isSelected) classes.push('selected')
    if (hasChildren) classes.push('has-children')
    if (isChild) classes.push('is-child')
    return classes.join(' ')
  }, [shape.type, isSelected, hasChildren, isChild])

  // Memoize shape label
  const shapeLabel = useMemo(() => {
    if (showCssLabels) {
      return (
        <span>
          &lt;{shape.elementTag}
          {shape.elementId && `#${shape.elementId}`}
          {shape.cssClasses && shape.cssClasses.split(' ').map(cls => `.${cls}`).join('')}
          &gt;
        </span>
      )
    }
    return <span>&lt;{shape.elementTag}&gt;</span>
  }, [showCssLabels, shape.elementTag, shape.elementId, shape.cssClasses])

  // Memoize resize handles
  const resizeHandles = useMemo(() => {
    if (!isSelected || currentTool !== 'select') return null

    const handleStyle = {
      position: 'absolute' as const,
      width: 12,
      height: 12,
      backgroundColor: '#3b82f6',
      border: '1px solid white',
      zIndex: shape.zIndex + 1
    }

    return (
      <>
        {/* Corner handles */}
        <div
          className="resize-handle resize-handle-nw"
          style={{
            ...handleStyle,
            left: screenPos.x - 6,
            top: screenPos.y - 6,
            cursor: 'nw-resize'
          }}
          onMouseDown={(e) => onResizeHandleClick(e, 'nw', shape)}
        />
        <div
          className="resize-handle resize-handle-ne"
          style={{
            ...handleStyle,
            left: screenPos.x + screenSize.width - 6,
            top: screenPos.y - 6,
            cursor: 'ne-resize'
          }}
          onMouseDown={(e) => onResizeHandleClick(e, 'ne', shape)}
        />
        <div
          className="resize-handle resize-handle-sw"
          style={{
            ...handleStyle,
            left: screenPos.x - 6,
            top: screenPos.y + screenSize.height - 6,
            cursor: 'sw-resize'
          }}
          onMouseDown={(e) => onResizeHandleClick(e, 'sw', shape)}
        />
        <div
          className="resize-handle resize-handle-se"
          style={{
            ...handleStyle,
            left: screenPos.x + screenSize.width - 6,
            top: screenPos.y + screenSize.height - 6,
            cursor: 'se-resize'
          }}
          onMouseDown={(e) => onResizeHandleClick(e, 'se', shape)}
        />
        
        {/* Edge handles */}
        <div
          className="resize-handle resize-handle-n"
          style={{
            ...handleStyle,
            left: screenPos.x + screenSize.width / 2 - 6,
            top: screenPos.y - 6,
            cursor: 'n-resize'
          }}
          onMouseDown={(e) => onResizeHandleClick(e, 'n', shape)}
        />
        <div
          className="resize-handle resize-handle-s"
          style={{
            ...handleStyle,
            left: screenPos.x + screenSize.width / 2 - 6,
            top: screenPos.y + screenSize.height - 6,
            cursor: 's-resize'
          }}
          onMouseDown={(e) => onResizeHandleClick(e, 's', shape)}
        />
        <div
          className="resize-handle resize-handle-w"
          style={{
            ...handleStyle,
            left: screenPos.x - 6,
            top: screenPos.y + screenSize.height / 2 - 6,
            cursor: 'w-resize'
          }}
          onMouseDown={(e) => onResizeHandleClick(e, 'w', shape)}
        />
        <div
          className="resize-handle resize-handle-e"
          style={{
            ...handleStyle,
            left: screenPos.x + screenSize.width - 6,
            top: screenPos.y + screenSize.height / 2 - 6,
            cursor: 'e-resize'
          }}
          onMouseDown={(e) => onResizeHandleClick(e, 'e', shape)}
        />
      </>
    )
  }, [isSelected, currentTool, screenPos, screenSize, shape.zIndex, shape, onResizeHandleClick])

  return (
    <React.Fragment>
      <div className={shapeClassName} style={shapeStyles}>
        <div className="shape-label">
          {shapeLabel}
        </div>
      </div>
      {resizeHandles}
    </React.Fragment>
  )
})

ShapeComponent.displayName = 'ShapeComponent'

// Optimized Grid Component with React.memo
interface GridComponentProps {
  showGrid: boolean
  gridSize: number
  zoom: number
}

const GridComponent = React.memo<GridComponentProps>(({ showGrid, gridSize, zoom }) => {
  if (!showGrid) return null

  const memoizedGridSize = useMemo(() => gridSize * zoom, [gridSize, zoom])

  return (
    <svg
      className="canvas-grid"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    >
      <defs>
        <pattern
          id="grid"
          width={memoizedGridSize}
          height={memoizedGridSize}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${memoizedGridSize} 0 L 0 0 0 ${memoizedGridSize}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  )
})

GridComponent.displayName = 'GridComponent'

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(({ canvasState, setCanvasState, currentTool, onSelectionChange }, ref) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<Point | null>(null)
  
  // New state for drag and resize functionality
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState<Point | null>(null)
  const [resizeStart, setResizeStart] = useState<{ point: Point; shape: Shape } | null>(null)
  const [resizeHandle, setResizeHandle] = useState<string>('') // 'nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'

  // New state for nesting system
  const [dragTarget, setDragTarget] = useState<string | null>(null)
  const [nestingPreview, setNestingPreview] = useState<{
    parentId: string | null
    isValid: boolean
    previewPosition: Point
  } | null>(null)
  const [nestingMessage, setNestingMessage] = useState<string | null>(null)

  // Multiple selection state
  const [selectionBox, setSelectionBox] = useState<{ start: Point; end: Point } | null>(null)

  useImperativeHandle(ref, () => canvasRef.current!)

  // Cleanup effect to restore text selection when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.userSelect = ''
    }
  }, [])

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
  }, [canvasState.pan.x, canvasState.pan.y, canvasState.zoom])

  // Handle resize handle click
  const handleResizeHandleClick = useCallback((e: React.MouseEvent, handleType: string, shape: Shape) => {
    e.stopPropagation()
    
    if (!canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const screenPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    const canvasPoint = screenToCanvas(screenPoint)
    

    
    setResizeHandle(handleType)
    setIsResizing(true)
    setResizeStart({ point: canvasPoint, shape: shape })
    
    setCanvasState(prev => ({
      ...prev,
      selectedShapeId: shape.id
    }))
  }, [screenToCanvas, setCanvasState])

  // Handle mouse down on canvas
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) {
      return
    }

    // Only handle left mouse button for drawing and selection
    if (e.button !== 0) {
      return
    }

    // Prevent text selection when drawing
    if (currentTool !== 'select') {
      e.preventDefault()
      // Also prevent text selection globally during drawing
      document.body.style.userSelect = 'none'
    }

    const rect = canvasRef.current.getBoundingClientRect()
    const screenPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    const canvasPoint = screenToCanvas(screenPoint)

    if (currentTool === 'select') {
      // Handle selection, drag, and resize
      
      // Check for group selection first
      const clickedGroup = canvasState.groups.slice().reverse().find(group => {
        const screenPos = canvasToScreen(group.position)
        const screenSize = {
          width: group.size.width * canvasState.zoom,
          height: group.size.height * canvasState.zoom
        }
        return (
          screenPoint.x >= screenPos.x &&
          screenPoint.x <= screenPos.x + screenSize.width &&
          screenPoint.y >= screenPos.y &&
          screenPoint.y <= screenPos.y + screenSize.height
        )
      })

      // Check for shape selection
      const clickedShape = canvasState.shapes.slice().reverse().find(shape => {
        const screenPos = canvasToScreen(shape.position)
        const screenSize = {
          width: shape.size.width * canvasState.zoom,
          height: shape.size.height * canvasState.zoom
        }
        return (
          screenPoint.x >= screenPos.x &&
          screenPoint.x <= screenPos.x + screenSize.width &&
          screenPoint.y >= screenPos.y &&
          screenPoint.y <= screenPos.y + screenSize.height
        )
      })

      // Handle Ctrl/Cmd key for multiple selection
      const isMultiSelect = e.ctrlKey || e.metaKey
      
      if (clickedGroup) {
        // Group selection
        const groupShapeIds = clickedGroup.shapes
        if (isMultiSelect) {
          // Add/remove group shapes from selection
          const currentSelection = canvasState.selectedShapeIds || []
          const newSelection = currentSelection.includes(groupShapeIds[0]) 
            ? currentSelection.filter(id => !groupShapeIds.includes(id))
            : [...currentSelection, ...groupShapeIds]
          
          setCanvasState(prev => ({
            ...prev,
            selectedShapeIds: newSelection,
            selectedGroupId: clickedGroup.id
          }))
          onSelectionChange?.(newSelection)
        } else {
          // Select only the group
          setCanvasState(prev => ({
            ...prev,
            selectedShapeIds: groupShapeIds,
            selectedGroupId: clickedGroup.id
          }))
          onSelectionChange?.(groupShapeIds)
        }
        
        // Start dragging the group
        setIsDragging(true)
        setDragStart(canvasPoint)
      } else if (clickedShape) {
        // Check if clicking on resize handles
        const screenPos = canvasToScreen(clickedShape.position)
        const screenSize = {
          width: clickedShape.size.width * canvasState.zoom,
          height: clickedShape.size.height * canvasState.zoom
        }
        
        const handleSize = 12 // Size of resize handles - increased for better usability
        const isOnHandle = (x: number, y: number, handleX: number, handleY: number) => {
          return Math.abs(x - handleX) <= handleSize && Math.abs(y - handleY) <= handleSize
        }

        // Check corners first, then edges
        if (isOnHandle(screenPoint.x, screenPoint.y, screenPos.x, screenPos.y)) {
          setResizeHandle('nw')
          setIsResizing(true)
          setResizeStart({ point: canvasPoint, shape: clickedShape })
        } else if (isOnHandle(screenPoint.x, screenPoint.y, screenPos.x + screenSize.width, screenPos.y)) {
          setResizeHandle('ne')
          setIsResizing(true)
          setResizeStart({ point: canvasPoint, shape: clickedShape })
        } else if (isOnHandle(screenPoint.x, screenPoint.y, screenPos.x, screenPos.y + screenSize.height)) {
          setResizeHandle('sw')
          setIsResizing(true)
          setResizeStart({ point: canvasPoint, shape: clickedShape })
        } else if (isOnHandle(screenPoint.x, screenPoint.y, screenPos.x + screenSize.width, screenPos.y + screenSize.height)) {
          setResizeHandle('se')
          setIsResizing(true)
          setResizeStart({ point: canvasPoint, shape: clickedShape })
        } else if (isOnHandle(screenPoint.x, screenPoint.y, screenPos.x + screenSize.width / 2, screenPos.y)) {
          setResizeHandle('n')
          setIsResizing(true)
          setResizeStart({ point: canvasPoint, shape: clickedShape })
        } else if (isOnHandle(screenPoint.x, screenPoint.y, screenPos.x + screenSize.width / 2, screenPos.y + screenSize.height)) {
          setResizeHandle('s')
          setIsResizing(true)
          setResizeStart({ point: canvasPoint, shape: clickedShape })
        } else if (isOnHandle(screenPoint.x, screenPoint.y, screenPos.x, screenPos.y + screenSize.height / 2)) {
          setResizeHandle('w')
          setIsResizing(true)
          setResizeStart({ point: canvasPoint, shape: clickedShape })
        } else if (isOnHandle(screenPoint.x, screenPoint.y, screenPos.x + screenSize.width, screenPos.y + screenSize.height / 2)) {
          setResizeHandle('e')
          setIsResizing(true)
          setResizeStart({ point: canvasPoint, shape: clickedShape })
        } else {
          // Start dragging
          setIsDragging(true)
          setDragStart(canvasPoint)
        }

        // Handle shape selection
        if (isMultiSelect) {
          // Add/remove shape from selection
          const currentSelection = canvasState.selectedShapeIds || []
          const newSelection = currentSelection.includes(clickedShape.id)
            ? currentSelection.filter(id => id !== clickedShape.id)
            : [...currentSelection, clickedShape.id]
          
          setCanvasState(prev => ({
            ...prev,
            selectedShapeIds: newSelection,
            selectedShapeId: clickedShape.id
          }))
          onSelectionChange?.(newSelection)
        } else {
          // Select only this shape
          setCanvasState(prev => ({
            ...prev,
            selectedShapeIds: [clickedShape.id],
            selectedShapeId: clickedShape.id
          }))
          onSelectionChange?.([clickedShape.id])
        }
      } else {
        // Clicked on empty space, deselect
        setCanvasState(prev => ({
          ...prev,
          selectedShapeIds: [],
          selectedShapeId: null,
          selectedGroupId: null
        }))
        onSelectionChange?.([])
      }
    } else {
      // Start drawing
      setIsDrawing(true)
      setDrawStart(canvasPoint)
    }
  }, [currentTool, canvasState.shapes, canvasState.selectedShapeIds, screenToCanvas, canvasToScreen, setCanvasState, isDrawing, onSelectionChange])

  // Handle mouse move on canvas
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) {
      return
    }

    const rect = canvasRef.current.getBoundingClientRect()
    const screenPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    const canvasPoint = screenToCanvas(screenPoint)

    // Handle drawing
    if (isDrawing && drawStart) {
      // Update the temporary shape being drawn
      const width = Math.max(Math.abs(canvasPoint.x - drawStart.x), 10)
      const height = Math.max(Math.abs(canvasPoint.y - drawStart.y), 10)
      const position = {
        x: Math.min(drawStart.x, canvasPoint.x),
        y: Math.min(drawStart.y, canvasPoint.y)
      }

      // Create temporary shape for preview
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

      // Update canvas with temporary shape
      setCanvasState(prev => ({
        ...prev,
        shapes: [...prev.shapes.filter(s => s.id !== 'temp'), tempShape]
      }))
    }
    
    // Handle dragging with nesting detection
    if (isDragging && dragStart && canvasState.selectedShapeId) {
      const draggedShape = canvasState.shapes.find(s => s.id === canvasState.selectedShapeId)
      if (!draggedShape) return
      
      const deltaX = canvasPoint.x - dragStart.x
      const deltaY = canvasPoint.y - dragStart.y
      let newPosition = { 
        x: draggedShape.position.x + deltaX, 
        y: draggedShape.position.y + deltaY 
      }
      
      // Apply snapping
      if (canvasState.snapToGrid) {
        newPosition = snapToGridPoint(newPosition, canvasState.gridSnapSize)
      }
      
      if (canvasState.snapToEdges) {
        const tempShape = { ...draggedShape, position: newPosition }
        newPosition = snapToEdges(canvasState.shapes, tempShape, 5)
      }
      
      // Find potential drop target for nesting
      const dropTarget = findDropTarget(canvasState.shapes, draggedShape, newPosition)
      
      // Update nesting preview - lower threshold for easier nesting
      setNestingPreview(dropTarget.confidence > 0.1 ? {
        parentId: dropTarget.parentId,
        isValid: dropTarget.isValid,
        previewPosition: dropTarget.previewPosition
      } : null)
      
      // Update drag target for visual feedback
      setDragTarget(dropTarget.confidence > 0.1 ? dropTarget.parentId : null)
      
      // Update nesting message for user feedback
      if (dropTarget.confidence > 0.1) {
        if (!dropTarget.isValid) {
          setNestingMessage('Cannot nest: Circular reference detected')
        } else {
          setNestingMessage('Valid nesting target')
        }
      } else {
        setNestingMessage(null)
      }
      
      // Update shape position
      setCanvasState(prev => ({
        ...prev,
        shapes: prev.shapes.map(shape => 
          shape.id === prev.selectedShapeId 
            ? { ...shape, position: newPosition }
            : shape
        )
      }))
      
      setDragStart(canvasPoint)
    }
    
    // Handle resizing
    if (isResizing && resizeStart && canvasState.selectedShapeId) {
      const deltaX = canvasPoint.x - resizeStart.point.x
      const deltaY = canvasPoint.y - resizeStart.point.y
      const originalShape = resizeStart.shape
      

      
      let newPosition = { ...originalShape.position }
      let newSize = { ...originalShape.size }
      
      switch (resizeHandle) {
        case 'nw':
          newPosition.x = originalShape.position.x + deltaX
          newPosition.y = originalShape.position.y + deltaY
          newSize.width = Math.max(10, originalShape.size.width - deltaX)
          newSize.height = Math.max(10, originalShape.size.height - deltaY)
          break
        case 'ne':
          newPosition.y = originalShape.position.y + deltaY
          newSize.width = Math.max(10, originalShape.size.width + deltaX)
          newSize.height = Math.max(10, originalShape.size.height - deltaY)
          break
        case 'sw':
          newPosition.x = originalShape.position.x + deltaX
          newSize.width = Math.max(10, originalShape.size.width - deltaX)
          newSize.height = Math.max(10, originalShape.size.height + deltaY)
          break
        case 'se':
          newSize.width = Math.max(10, originalShape.size.width + deltaX)
          newSize.height = Math.max(10, originalShape.size.height + deltaY)
          break
        case 'n':
          newPosition.y = originalShape.position.y + deltaY
          newSize.height = Math.max(10, originalShape.size.height - deltaY)
          break
        case 's':
          newSize.height = Math.max(10, originalShape.size.height + deltaY)
          break
        case 'w':
          newPosition.x = originalShape.position.x + deltaX
          newSize.width = Math.max(10, originalShape.size.width - deltaX)
          break
        case 'e':
          newSize.width = Math.max(10, originalShape.size.width + deltaX)
          break
      }
      
      // Apply snapping to position and size
      if (canvasState.snapToGrid) {
        newPosition = snapToGridPoint(newPosition, canvasState.gridSnapSize)
        newSize.width = Math.round(newSize.width / canvasState.gridSnapSize) * canvasState.gridSnapSize
        newSize.height = Math.round(newSize.height / canvasState.gridSnapSize) * canvasState.gridSnapSize
      }
      

      
      setCanvasState(prev => ({
        ...prev,
        shapes: prev.shapes.map(shape => 
          shape.id === prev.selectedShapeId 
            ? { ...shape, position: newPosition, size: newSize }
            : shape
        )
      }))
      
      // DON'T update resizeStart here - this was causing the "tense" behavior
      // setResizeStart({ point: canvasPoint, shape: originalShape })
    }
  }, [isDrawing, drawStart, isDragging, isResizing, dragStart, resizeStart, resizeHandle, currentTool, screenToCanvas, canvasState.shapes.length, canvasState.selectedShapeId, setCanvasState])

  // Handle mouse up on canvas
  const handleMouseUp = useCallback(() => {
    if (isDrawing && drawStart) {
      // Finalize the shape
      setCanvasState(prev => {
        const tempShape = prev.shapes.find(s => s.id === 'temp')
        if (!tempShape) {
          return prev
        }

        // Only create shape if it's large enough
        if (tempShape.size.width < 10 || tempShape.size.height < 10) {
          return {
            ...prev,
            shapes: prev.shapes.filter(s => s.id !== 'temp')
          }
        }

        const finalShape: Shape = {
          ...tempShape,
          id: generateId(),
          zIndex: prev.shapes.length
        }

        return {
          ...prev,
          shapes: [...prev.shapes.filter(s => s.id !== 'temp'), finalShape],
          selectedShapeId: finalShape.id
        }
      })
    }

    // Apply nesting if we have a valid nesting preview
    if (isDragging && nestingPreview && nestingPreview.isValid && canvasState.selectedShapeId) {
      setCanvasState(prev => ({
        ...prev,
        shapes: applyNesting(prev.shapes, canvasState.selectedShapeId!, nestingPreview.parentId)
      }))
    }

    // Reset drawing and dragging states only
    setIsDrawing(false)
    setDrawStart(null)
    setIsDragging(false)
    setIsResizing(false)
    setDragStart(null)
    setResizeStart(null)
    setResizeHandle('')
    setDragTarget(null)
    setNestingPreview(null)
    setNestingMessage(null)
    
    // Restore text selection when drawing stops
    document.body.style.userSelect = ''
  }, [isDrawing, drawStart, isDragging, isResizing, resizeHandle, nestingPreview, canvasState.selectedShapeId, setCanvasState])

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.25, Math.min(4, canvasState.zoom * zoomFactor))
    
    setCanvasState(prev => ({
      ...prev,
      zoom: newZoom
    }))
  }, [canvasState.zoom, setCanvasState])

  // Handle pan with middle mouse button
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Point | null>(null)

  const handleMouseDownPan = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) { // Middle mouse button
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }, [])

  const handleMouseMovePan = useCallback((e: React.MouseEvent) => {
    if (!isPanning || !panStart) return

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
  }, [isPanning, panStart, setCanvasState])

  const handleMouseUpPan = useCallback(() => {
    setIsPanning(false)
    setPanStart(null)
  }, [])



  // Handle canvas click to deselect
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectionChange?.([])
    }
  }, [onSelectionChange])



  // Render shapes with memoization
  const renderShapes = useMemo(() => {
    return canvasState.shapes.map(shape => {
      const isSelected = canvasState.selectedShapeIds.includes(shape.id) || shape.id === canvasState.selectedShapeId
      
      // Check if shape has children or is a child
      const hasChildren = canvasState.shapes.some(s => s.parentId === shape.id)
      const isChild = shape.parentId !== undefined && shape.parentId !== null

      return (
        <ShapeComponent
          key={shape.id}
          shape={shape}
          isSelected={isSelected}
          hasChildren={hasChildren}
          isChild={isChild}
          zoom={canvasState.zoom}
          pan={canvasState.pan}
          currentTool={currentTool}
          showCssLabels={canvasState.showCssLabels}
          onResizeHandleClick={handleResizeHandleClick}
        />
      )
    })
  }, [
    canvasState.shapes,
    canvasState.selectedShapeIds,
    canvasState.selectedShapeId,
    canvasState.zoom,
    canvasState.pan,
    canvasState.showCssLabels,
    currentTool,
    handleResizeHandleClick
  ])

  // Render groups with memoization
  const renderGroups = useMemo(() => {
    return canvasState.groups.map(group => {
      const screenPos = canvasToScreen(group.position)
      const screenSize = {
        width: group.size.width * canvasState.zoom,
        height: group.size.height * canvasState.zoom
      }

      const isSelected = canvasState.selectedGroupId === group.id
      const groupShapes = getGroupShapes(canvasState.shapes, group.id)
      const allShapesSelected = groupShapes.every(shape => 
        canvasState.selectedShapeIds.includes(shape.id)
      )

      return (
        <div
          key={`group-${group.id}`}
          className={`canvas-group ${isSelected || allShapesSelected ? 'selected' : ''}`}
          style={{
            position: 'absolute',
            left: screenPos.x - 4,
            top: screenPos.y - 4,
            width: screenSize.width + 8,
            height: screenSize.height + 8,
            border: `2px ${isSelected || allShapesSelected ? 'dashed #3b82f6' : 'dashed #94a3b8'}`,
            borderRadius: '4px',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            pointerEvents: 'none',
            zIndex: group.zIndex - 1
          }}
        >
          {/* Group label */}
          <div
            className="group-label"
            style={{
              position: 'absolute',
              top: -20,
              left: 0,
              backgroundColor: isSelected || allShapesSelected ? '#3b82f6' : '#94a3b8',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}
          >
            {group.name} ({groupShapes.length})
          </div>
        </div>
      )
    })
  }, [
    canvasState.groups,
    canvasState.shapes,
    canvasState.selectedGroupId,
    canvasState.selectedShapeIds,
    canvasState.zoom,
    canvasToScreen
  ])

  // Render drop zone highlighting for nesting with memoization
  const renderDropZoneHighlight = useMemo(() => {
    if (!dragTarget || !nestingPreview) return null
    
    const targetShape = canvasState.shapes.find(s => s.id === dragTarget)
    if (!targetShape) return null
    
    const screenPos = canvasToScreen(targetShape.position)
    const screenSize = {
      width: targetShape.size.width * canvasState.zoom,
      height: targetShape.size.height * canvasState.zoom
    }
    
    return (
      <div
        className={`drop-zone-highlight ${nestingPreview.isValid ? 'valid' : 'invalid'}`}
        style={{
          position: 'absolute',
          left: screenPos.x - 4,
          top: screenPos.y - 4,
          width: screenSize.width + 8,
          height: screenSize.height + 8,
          border: `3px ${nestingPreview.isValid ? 'dashed #4ade80' : 'dashed #f87171'}`,
          borderRadius: targetShape.type === 'circle' ? '50%' : '4px',
          backgroundColor: nestingPreview.isValid ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
          pointerEvents: 'none',
          zIndex: 1000
        }}
      />
    )
  }, [dragTarget, nestingPreview, canvasState.shapes, canvasState.zoom, canvasToScreen])

  // Render nesting indicators with memoization
  const renderNestingIndicators = useMemo(() => {
    const indicators = getNestingIndicators(canvasState.shapes)
    
    return indicators.map(indicator => {
      const parentShape = canvasState.shapes.find(s => s.id === indicator.parentId)
      if (!parentShape) return null
      
      const screenPos = canvasToScreen(parentShape.position)
      const screenSize = {
        width: parentShape.size.width * canvasState.zoom,
        height: parentShape.size.height * canvasState.zoom
      }
      
      return (
        <div
          key={`nesting-${indicator.parentId}`}
          className="nesting-indicator"
          style={{
            position: 'absolute',
            left: screenPos.x + screenSize.width - 20,
            top: screenPos.y - 10,
            width: 20,
            height: 20,
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            zIndex: 999
          }}
          title={`Contains ${indicator.childIds.length} child element${indicator.childIds.length !== 1 ? 's' : ''}`}
        >
          {indicator.childIds.length}
        </div>
      )
    })
  }, [canvasState.shapes, canvasState.zoom, canvasToScreen])

  // Render nesting preview with memoization
  const renderNestingPreview = useMemo(() => {
    if (!nestingPreview || !canvasState.selectedShapeId) return null
    
    const selectedShape = canvasState.shapes.find(s => s.id === canvasState.selectedShapeId)
    if (!selectedShape) return null
    
    const screenPos = canvasToScreen(nestingPreview.previewPosition)
    const screenSize = {
      width: selectedShape.size.width * canvasState.zoom,
      height: selectedShape.size.height * canvasState.zoom
    }
    
    return (
      <div
        className={`nesting-preview ${nestingPreview.isValid ? 'valid' : 'invalid'}`}
        style={{
          position: 'absolute',
          left: screenPos.x,
          top: screenPos.y,
          width: screenSize.width,
          height: screenSize.height,
          border: `2px ${nestingPreview.isValid ? 'solid #4ade80' : 'solid #f87171'}`,
          borderRadius: selectedShape.type === 'circle' ? '50%' : `${selectedShape.borderRadius * canvasState.zoom}px`,
          backgroundColor: nestingPreview.isValid ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)',
          pointerEvents: 'none',
          zIndex: 1001
        }}
        title={nestingPreview.isValid ? 'Valid nesting target' : 'Invalid nesting - circular reference detected'}
      />
    )
  }, [nestingPreview, canvasState.selectedShapeId, canvasState.shapes, canvasState.zoom, canvasToScreen])

  // Render nesting status message with memoization
  const renderNestingMessage = useMemo(() => {
    if (!nestingMessage || !canvasState.selectedShapeId) return null
    
    const selectedShape = canvasState.shapes.find(s => s.id === canvasState.selectedShapeId)
    if (!selectedShape) return null
    
    const screenPos = canvasToScreen(selectedShape.position)
    
    return (
      <div
        className="nesting-message"
        style={{
          position: 'absolute',
          left: screenPos.x,
          top: screenPos.y - 30,
          backgroundColor: nestingMessage.includes('Cannot nest') ? '#fef2f2' : '#f0fdf4',
          color: nestingMessage.includes('Cannot nest') ? '#dc2626' : '#059669',
          border: `1px solid ${nestingMessage.includes('Cannot nest') ? '#fecaca' : '#bbf7d0'}`,
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '12px',
          fontWeight: '500',
          pointerEvents: 'none',
          zIndex: 1002,
          whiteSpace: 'nowrap'
        }}
      >
        {nestingMessage}
      </div>
    )
  }, [nestingMessage, canvasState.selectedShapeId, canvasState.shapes, canvasToScreen])

  return (
    <div 
      className="canvas-container" 
      style={{ 
        minHeight: '400px', 
        minWidth: '400px',
        position: 'relative',
        backgroundColor: hexToRgba(canvasState.canvasBackgroundColor, canvasState.canvasBackgroundOpacity)
      }}
    >
      
              <div
          ref={canvasRef}
          className="canvas"
          style={{ 
            minHeight: '400px', 
            minWidth: '400px',
            position: 'relative',
            zIndex: 1
          }}
          onMouseDown={(e) => {
            handleMouseDown(e)
            handleMouseDownPan(e)
          }}
          onMouseMove={(e) => {
            handleMouseMove(e)
            handleMouseMovePan(e)
          }}
          onMouseUp={(e) => {
            handleMouseUp()
            handleMouseUpPan()
          }}
          onClick={handleCanvasClick}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
                >
          
          <GridComponent 
            showGrid={canvasState.showGrid}
            gridSize={canvasState.gridSize}
            zoom={canvasState.zoom}
          />
          {renderGroups}
          {renderShapes}
          {renderDropZoneHighlight}
          {renderNestingIndicators}
          {renderNestingPreview}
          {renderNestingMessage}
        </div>
      </div>
    )
})

export default Canvas 