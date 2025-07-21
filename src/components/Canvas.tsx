import React, { useRef, useState, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react'
import { CanvasState, Shape, Point, ToolType } from '../types'
import { generateId } from '../utils/helpers'
import './Canvas.scss'

interface CanvasProps {
  canvasState: CanvasState
  setCanvasState: (state: CanvasState | ((prev: CanvasState) => CanvasState)) => void
  currentTool: ToolType
}

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(({ canvasState, setCanvasState, currentTool }, ref) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<Point | null>(null)
  
  // New state for drag and resize functionality
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState<Point | null>(null)
  const [resizeStart, setResizeStart] = useState<{ point: Point; shape: Shape } | null>(null)
  const [resizeHandle, setResizeHandle] = useState<string>('') // 'nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'

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
  }, [canvasState.pan, canvasState.zoom])

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = useCallback((canvasPoint: Point): Point => {
    return {
      x: canvasPoint.x * canvasState.zoom + canvasState.pan.x,
      y: canvasPoint.y * canvasState.zoom + canvasState.pan.y
    }
  }, [canvasState.pan, canvasState.zoom])

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

      if (clickedShape) {
        // Check if clicking on resize handles
        const screenPos = canvasToScreen(clickedShape.position)
        const screenSize = {
          width: clickedShape.size.width * canvasState.zoom,
          height: clickedShape.size.height * canvasState.zoom
        }
        
        const handleSize = 8 // Size of resize handles
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

        setCanvasState(prev => ({
          ...prev,
          selectedShapeId: clickedShape.id
        }))
      } else {
        // Clicked on empty space, deselect
        setCanvasState(prev => ({
          ...prev,
          selectedShapeId: null
        }))
      }
    } else {
      // Start drawing
      setIsDrawing(true)
      setDrawStart(canvasPoint)
    }
  }, [currentTool, canvasState.shapes, screenToCanvas, canvasToScreen, setCanvasState, isDrawing])

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
        fillColor: '#e2e8f0',
        borderColor: '#64748b',
        borderWidth: 1,
        borderStyle: 'solid',
        zIndex: canvasState.shapes.length
      }

      // Update canvas with temporary shape
      setCanvasState(prev => ({
        ...prev,
        shapes: [...prev.shapes.filter(s => s.id !== 'temp'), tempShape]
      }))
    }
    
    // Handle dragging
    if (isDragging && dragStart && canvasState.selectedShapeId) {
      const deltaX = canvasPoint.x - dragStart.x
      const deltaY = canvasPoint.y - dragStart.y
      
      setCanvasState(prev => ({
        ...prev,
        shapes: prev.shapes.map(shape => 
          shape.id === prev.selectedShapeId 
            ? { ...shape, position: { x: shape.position.x + deltaX, y: shape.position.y + deltaY } }
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
      
      setCanvasState(prev => ({
        ...prev,
        shapes: prev.shapes.map(shape => 
          shape.id === prev.selectedShapeId 
            ? { ...shape, position: newPosition, size: newSize }
            : shape
        )
      }))
      
      setResizeStart({ point: canvasPoint, shape: originalShape })
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

    // Reset all states
    setIsDrawing(false)
    setDrawStart(null)
    setIsDragging(false)
    setIsResizing(false)
    setDragStart(null)
    setResizeStart(null)
    setResizeHandle('')
    
    // Restore text selection when drawing stops
    document.body.style.userSelect = ''
  }, [isDrawing, drawStart, isDragging, isResizing, setCanvasState])

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
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

  // Render grid
  const renderGrid = () => {
    if (!canvasState.showGrid) return null

    const gridSize = canvasState.gridSize * canvasState.zoom

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
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    )
  }

  // Render shapes
  const renderShapes = () => {
    return canvasState.shapes.map(shape => {
      const screenPos = canvasToScreen(shape.position)
      const screenSize = {
        width: shape.size.width * canvasState.zoom,
        height: shape.size.height * canvasState.zoom
      }

      const isSelected = shape.id === canvasState.selectedShapeId

      return (
        <React.Fragment key={shape.id}>
          <div
            className={`canvas-shape ${shape.type} ${isSelected ? 'selected' : ''}`}
            style={{
              position: 'absolute',
              left: screenPos.x,
              top: screenPos.y,
              width: screenSize.width,
              height: screenSize.height,
              backgroundColor: shape.fillColor,
              border: `${shape.borderWidth * canvasState.zoom}px ${shape.borderStyle} ${shape.borderColor}`,
              borderRadius: shape.type === 'circle' ? '50%' : '0',
              zIndex: shape.zIndex,
              cursor: isSelected ? 'move' : 'pointer'
            }}

          >
            <div className="shape-label">
              &lt;{shape.elementTag}&gt;
            </div>
          </div>
          
          {/* Render resize handles for selected shapes */}
          {isSelected && currentTool === 'select' && (
            <>
              {/* Corner handles */}
              <div
                className="resize-handle resize-handle-nw"
                style={{
                  position: 'absolute',
                  left: screenPos.x - 4,
                  top: screenPos.y - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#3b82f6',
                  border: '1px solid white',
                  cursor: 'nw-resize',
                  zIndex: shape.zIndex + 1
                }}
              />
              <div
                className="resize-handle resize-handle-ne"
                style={{
                  position: 'absolute',
                  left: screenPos.x + screenSize.width - 4,
                  top: screenPos.y - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#3b82f6',
                  border: '1px solid white',
                  cursor: 'ne-resize',
                  zIndex: shape.zIndex + 1
                }}
              />
              <div
                className="resize-handle resize-handle-sw"
                style={{
                  position: 'absolute',
                  left: screenPos.x - 4,
                  top: screenPos.y + screenSize.height - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#3b82f6',
                  border: '1px solid white',
                  cursor: 'sw-resize',
                  zIndex: shape.zIndex + 1
                }}
              />
              <div
                className="resize-handle resize-handle-se"
                style={{
                  position: 'absolute',
                  left: screenPos.x + screenSize.width - 4,
                  top: screenPos.y + screenSize.height - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#3b82f6',
                  border: '1px solid white',
                  cursor: 'se-resize',
                  zIndex: shape.zIndex + 1
                }}
              />
              
              {/* Edge handles */}
              <div
                className="resize-handle resize-handle-n"
                style={{
                  position: 'absolute',
                  left: screenPos.x + screenSize.width / 2 - 4,
                  top: screenPos.y - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#3b82f6',
                  border: '1px solid white',
                  cursor: 'n-resize',
                  zIndex: shape.zIndex + 1
                }}
              />
              <div
                className="resize-handle resize-handle-s"
                style={{
                  position: 'absolute',
                  left: screenPos.x + screenSize.width / 2 - 4,
                  top: screenPos.y + screenSize.height - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#3b82f6',
                  border: '1px solid white',
                  cursor: 's-resize',
                  zIndex: shape.zIndex + 1
                }}
              />
              <div
                className="resize-handle resize-handle-w"
                style={{
                  position: 'absolute',
                  left: screenPos.x - 4,
                  top: screenPos.y + screenSize.height / 2 - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#3b82f6',
                  border: '1px solid white',
                  cursor: 'w-resize',
                  zIndex: shape.zIndex + 1
                }}
              />
              <div
                className="resize-handle resize-handle-e"
                style={{
                  position: 'absolute',
                  left: screenPos.x + screenSize.width - 4,
                  top: screenPos.y + screenSize.height / 2 - 4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#3b82f6',
                  border: '1px solid white',
                  cursor: 'e-resize',
                  zIndex: shape.zIndex + 1
                }}
              />
            </>
          )}
        </React.Fragment>
      )
    })
  }


  
  return (
    <div 
      className="canvas-container" 
      style={{ 
        minHeight: '400px', 
        minWidth: '400px',
        position: 'relative'
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
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
                >
          
          {renderGrid()}
          {renderShapes()}
        </div>
      </div>
    )
})

export default Canvas 