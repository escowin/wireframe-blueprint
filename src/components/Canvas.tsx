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
    if (!canvasRef.current) return

    // Only handle left mouse button for drawing and selection
    if (e.button !== 0) return

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
      // Handle selection
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

      setCanvasState(prev => ({
        ...prev,
        selectedShapeId: clickedShape?.id || null
      }))
    } else {
      // Start drawing
      console.log('Starting to draw:', { currentTool, canvasPoint })
      setIsDrawing(true)
      setDrawStart(canvasPoint)
    }
  }, [currentTool, canvasState.shapes, screenToCanvas, canvasToScreen, setCanvasState])

  // Handle mouse move on canvas
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !drawStart || !canvasRef.current) {
      console.log('Mouse move blocked:', { isDrawing, drawStart: !!drawStart, canvasRef: !!canvasRef.current })
      return
    }

    const rect = canvasRef.current.getBoundingClientRect()
    const screenPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
    const canvasPoint = screenToCanvas(screenPoint)

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
  }, [isDrawing, drawStart, currentTool, screenToCanvas, canvasState.shapes.length, setCanvasState])

  // Handle mouse up on canvas
  const handleMouseUp = useCallback(() => {
    if (isDrawing && drawStart) {
      console.log('Finalizing shape')
      // Finalize the shape
      setCanvasState(prev => {
        const tempShape = prev.shapes.find(s => s.id === 'temp')
        if (!tempShape) return prev

        // Only create shape if it's large enough
        if (tempShape.size.width < 10 || tempShape.size.height < 10) {
          console.log('Shape too small, removing temp shape')
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

    setIsDrawing(false)
    setDrawStart(null)
    
    // Restore text selection when drawing stops
    document.body.style.userSelect = ''
  }, [isDrawing, drawStart, setCanvasState])

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
        <div
          key={shape.id}
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
            cursor: 'pointer'
          }}
          onClick={(e) => {
            e.stopPropagation()
            if (currentTool === 'select') {
              setCanvasState(prev => ({
                ...prev,
                selectedShapeId: shape.id
              }))
            }
          }}
        >
          <div className="shape-label">
            &lt;{shape.elementTag}&gt;
          </div>
        </div>
      )
    })
  }

  return (
    <div className="canvas-container">
      <div
        ref={canvasRef}
        className="canvas"
        onMouseDown={(e) => {
          handleMouseDown(e)
          handleMouseDownPan(e)
        }}
        onMouseMove={(e) => {
          handleMouseMove(e)
          handleMouseMovePan(e)
        }}
        onMouseUp={() => {
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