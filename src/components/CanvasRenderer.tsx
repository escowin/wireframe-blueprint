import React, { useRef, useEffect, useCallback, useMemo } from 'react'
import { CanvasState, Shape, Point, Group } from '../types'
import { hexToRgba, getGroupShapes } from '../utils/helpers'

interface CanvasRendererProps {
  canvasState: CanvasState
  width: number
  height: number
  onCanvasClick?: (point: Point) => void
  onShapeClick?: (shapeId: string, point: Point) => void
  className?: string
}

interface RenderContext {
  ctx: CanvasRenderingContext2D
  zoom: number
  pan: Point
  width: number
  height: number
}

const CanvasRenderer: React.FC<CanvasRendererProps> = ({
  canvasState,
  width,
  height,
  onCanvasClick,
  onShapeClick,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shapesRef = useRef<Map<string, { shape: Shape; bounds: DOMRect }>>(new Map())

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

  // Create gradient fill
  const createGradient = useCallback((ctx: CanvasRenderingContext2D, shape: Shape, screenPos: Point, screenSize: { width: number; height: number }) => {
    // Create a simple linear gradient based on shape properties
    const gradient = ctx.createLinearGradient(
      screenPos.x, 
      screenPos.y, 
      screenPos.x + screenSize.width, 
      screenPos.y + screenSize.height
    )
    
    // Use the fill color and create a lighter variant for gradient
    const baseColor = shape.fillColor
    const lighterColor = hexToRgba(baseColor, Math.min(shape.opacity + 0.3, 1))
    const darkerColor = hexToRgba(baseColor, Math.max(shape.opacity - 0.2, 0.1))
    
    gradient.addColorStop(0, lighterColor)
    gradient.addColorStop(0.5, hexToRgba(baseColor, shape.opacity))
    gradient.addColorStop(1, darkerColor)
    
    return gradient
  }, [])

  // Create pattern fill
  const createPattern = useCallback((ctx: CanvasRenderingContext2D, shape: Shape, screenSize: { width: number; height: number }) => {
    // Create a simple pattern canvas
    const patternCanvas = document.createElement('canvas')
    const patternCtx = patternCanvas.getContext('2d')
    if (!patternCtx) return null

    const patternSize = Math.max(10, Math.min(20, Math.min(screenSize.width, screenSize.height) / 4))
    patternCanvas.width = patternSize
    patternCanvas.height = patternSize

    // Create a subtle pattern based on shape type
    patternCtx.fillStyle = hexToRgba(shape.fillColor, shape.opacity * 0.8)
    patternCtx.fillRect(0, 0, patternSize, patternSize)

    if (shape.type === 'circle') {
      // Circular pattern
      patternCtx.fillStyle = hexToRgba(shape.fillColor, shape.opacity * 0.4)
      patternCtx.beginPath()
      patternCtx.arc(patternSize / 2, patternSize / 2, patternSize / 4, 0, 2 * Math.PI)
      patternCtx.fill()
    } else {
      // Rectangular pattern
      patternCtx.fillStyle = hexToRgba(shape.fillColor, shape.opacity * 0.4)
      patternCtx.fillRect(patternSize / 4, patternSize / 4, patternSize / 2, patternSize / 2)
    }

    return ctx.createPattern(patternCanvas, 'repeat')
  }, [])

  // Draw a shape on the canvas
  const drawShape = useCallback((ctx: CanvasRenderingContext2D, shape: Shape, context: RenderContext) => {
    const { zoom, pan } = context
    
    // Calculate screen position and size
    const screenPos = canvasToScreen(shape.position)
    const screenSize = {
      width: shape.size.width * zoom,
      height: shape.size.height * zoom
    }

    // Save context state
    ctx.save()

    // Set up shadow if enabled
    if (shape.boxShadow.enabled) {
      ctx.shadowOffsetX = shape.boxShadow.offsetX * zoom
      ctx.shadowOffsetY = shape.boxShadow.offsetY * zoom
      ctx.shadowBlur = shape.boxShadow.blurRadius * zoom
      ctx.shadowColor = shape.boxShadow.color
    }

    // Create fill style (gradient, pattern, or solid)
    let fillStyle: string | CanvasGradient | CanvasPattern | null = null
    
    // Use gradient for shapes with certain properties
    if (shape.opacity > 0.8 && shape.size.width > 50 && shape.size.height > 50) {
      fillStyle = createGradient(ctx, shape, screenPos, screenSize)
    } else if (shape.size.width > 100 && shape.size.height > 100) {
      // Use pattern for larger shapes
      fillStyle = createPattern(ctx, shape, screenSize)
    }
    
    // Fallback to solid color
    if (!fillStyle) {
      fillStyle = hexToRgba(shape.fillColor, shape.opacity)
    }

    ctx.fillStyle = fillStyle
    ctx.strokeStyle = shape.borderColor
    ctx.lineWidth = shape.borderWidth * zoom

    // Set line style
    if (shape.borderStyle === 'dashed') {
      ctx.setLineDash([5 * zoom, 5 * zoom])
    } else if (shape.borderStyle === 'dotted') {
      ctx.setLineDash([2 * zoom, 2 * zoom])
    } else {
      ctx.setLineDash([])
    }

    // Draw shape based on type
    if (shape.type === 'circle') {
      // Draw circle
      const centerX = screenPos.x + screenSize.width / 2
      const centerY = screenPos.y + screenSize.height / 2
      const radius = Math.min(screenSize.width, screenSize.height) / 2

      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.fill()
      if (shape.borderWidth > 0) {
        ctx.stroke()
      }
    } else {
      // Draw rectangle
      ctx.beginPath()
      if (shape.borderRadius > 0) {
        const radius = shape.borderRadius * zoom
        ctx.roundRect(screenPos.x, screenPos.y, screenSize.width, screenSize.height, radius)
      } else {
        ctx.rect(screenPos.x, screenPos.y, screenSize.width, screenSize.height)
      }
      ctx.fill()
      if (shape.borderWidth > 0) {
        ctx.stroke()
      }
    }

    // Draw text for all shapes (even those without ID or classes)
    if (shape.elementTag) {
      // Create text background for better readability
      // Format text like the original DOM rendering: <tag#id.class1.class2>
      let text = ''
      if (canvasState.showCssLabels) {
        text = `<${shape.elementTag}`
        if (shape.elementId) {
          text += `#${shape.elementId}`
        }
        if (shape.cssClasses) {
          text += shape.cssClasses.split(' ').map(cls => `.${cls}`).join('')
        }
        text += '>'
      } else {
        text = `<${shape.elementTag}>`
      }
      // Use smaller font size for labels to match original styling
      const labelFontSize = Math.max(10, 12 * zoom) // $font-size-xs = 0.75rem = 12px
      ctx.font = `${shape.typography.fontWeight} ${labelFontSize}px ${shape.typography.fontFamily}`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'

      const textX = screenPos.x + 4
      const textY = screenPos.y + 2

      // Measure text for background
      const textMetrics = ctx.measureText(text)
      const textWidth = textMetrics.width
      const textHeight = labelFontSize

      // Draw text background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.fillRect(
        textX - 2,
        textY - 1,
        textWidth + 4,
        textHeight + 2
      )

      // Draw text with secondary color to match original styling
      ctx.fillStyle = '#64748b' // $text-secondary color
      
      // Apply text transformations
      let displayText = text
      if (shape.typography.textTransform === 'uppercase') {
        displayText = text.toUpperCase()
      } else if (shape.typography.textTransform === 'lowercase') {
        displayText = text.toLowerCase()
      } else if (shape.typography.textTransform === 'capitalize') {
        displayText = text.replace(/\b\w/g, l => l.toUpperCase())
      }

      ctx.fillText(displayText, textX, textY)

      // Apply text decoration
      if (shape.typography.textDecoration !== 'none') {
        ctx.strokeStyle = '#64748b' // $text-secondary color
        ctx.lineWidth = 1
        
        if (shape.typography.textDecoration === 'underline') {
          ctx.beginPath()
          ctx.moveTo(textX, textY + textHeight + 1)
          ctx.lineTo(textX + textWidth, textY + textHeight + 1)
          ctx.stroke()
        } else if (shape.typography.textDecoration === 'line-through') {
          ctx.beginPath()
          ctx.moveTo(textX, textY + textHeight / 2)
          ctx.lineTo(textX + textWidth, textY + textHeight / 2)
          ctx.stroke()
        }
      }
    }

    // Restore context state
    ctx.restore()

    // Store shape bounds for hit testing
    shapesRef.current.set(shape.id, {
      shape,
      bounds: new DOMRect(screenPos.x, screenPos.y, screenSize.width, screenSize.height)
    })
  }, [canvasToScreen, createGradient, createPattern])

  // Draw selection indicators
  const drawSelection = useCallback((ctx: CanvasRenderingContext2D, shape: Shape, context: RenderContext) => {
    const { zoom } = context
    const screenPos = canvasToScreen(shape.position)
    const screenSize = {
      width: shape.size.width * zoom,
      height: shape.size.height * zoom
    }

    ctx.save()
    ctx.strokeStyle = '#007bff'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])

    // Draw selection border
    ctx.strokeRect(screenPos.x - 2, screenPos.y - 2, screenSize.width + 4, screenSize.height + 4)

    // Draw resize handles
    const handleSize = 8
    const handles = [
      { x: screenPos.x - handleSize/2, y: screenPos.y - handleSize/2 }, // top-left
      { x: screenPos.x + screenSize.width - handleSize/2, y: screenPos.y - handleSize/2 }, // top-right
      { x: screenPos.x - handleSize/2, y: screenPos.y + screenSize.height - handleSize/2 }, // bottom-left
      { x: screenPos.x + screenSize.width - handleSize/2, y: screenPos.y + screenSize.height - handleSize/2 }, // bottom-right
      { x: screenPos.x + screenSize.width/2 - handleSize/2, y: screenPos.y - handleSize/2 }, // top
      { x: screenPos.x + screenSize.width/2 - handleSize/2, y: screenPos.y + screenSize.height - handleSize/2 }, // bottom
      { x: screenPos.x - handleSize/2, y: screenPos.y + screenSize.height/2 - handleSize/2 }, // left
      { x: screenPos.x + screenSize.width - handleSize/2, y: screenPos.y + screenSize.height/2 - handleSize/2 } // right
    ]

    ctx.fillStyle = '#007bff'
    ctx.setLineDash([])
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
    })

    ctx.restore()
  }, [canvasToScreen])

  // Draw grid
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, context: RenderContext) => {
    if (!canvasState.showGrid) return

    const { zoom, pan, width, height } = context
    const gridSize = canvasState.gridSize * zoom

    ctx.save()
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1

    // Calculate grid start and end points
    const startX = Math.floor(pan.x / gridSize) * gridSize
    const startY = Math.floor(pan.y / gridSize) * gridSize
    const endX = startX + width + gridSize
    const endY = startY + height + gridSize

    // Draw vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Draw horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    ctx.restore()
  }, [canvasState.showGrid, canvasState.gridSize])

  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Set canvas background
    ctx.fillStyle = hexToRgba(canvasState.canvasBackgroundColor, canvasState.canvasBackgroundOpacity)
    ctx.fillRect(0, 0, width, height)

    const context: RenderContext = {
      ctx,
      zoom: canvasState.zoom,
      pan: canvasState.pan,
      width,
      height
    }

    // Clear shape bounds for hit testing
    shapesRef.current.clear()

    // Draw grid
    drawGrid(ctx, context)

    // Sort shapes by z-index for proper layering
    const sortedShapes = [...canvasState.shapes].sort((a, b) => a.zIndex - b.zIndex)

    // Draw shapes
    sortedShapes.forEach(shape => {
      drawShape(ctx, shape, context)
    })

    // Draw selection indicators for selected shapes
    canvasState.selectedShapeIds.forEach(shapeId => {
      const shape = canvasState.shapes.find(s => s.id === shapeId)
      if (shape) {
        drawSelection(ctx, shape, context)
      }
    })
  }, [
    canvasState,
    width,
    height,
    drawGrid,
    drawShape,
    drawSelection
  ])

  // Handle canvas click for hit testing
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }

    // Check if any shape was clicked (reverse order for top-most first)
    const shapes = Array.from(shapesRef.current.entries()).reverse()
    for (const [shapeId, { bounds }] of shapes) {
      if (clickPoint.x >= bounds.left && clickPoint.x <= bounds.right &&
          clickPoint.y >= bounds.top && clickPoint.y <= bounds.bottom) {
        const canvasPoint = screenToCanvas(clickPoint)
        onShapeClick?.(shapeId, canvasPoint)
        return
      }
    }

    // If no shape was clicked, call canvas click handler
    const canvasPoint = screenToCanvas(clickPoint)
    onCanvasClick?.(canvasPoint)
  }, [screenToCanvas, onShapeClick, onCanvasClick])

  // Render when dependencies change
  useEffect(() => {
    render()
  }, [render])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      onClick={handleCanvasClick}
      style={{
        display: 'block',
        cursor: 'default'
      }}
    />
  )
}

export default CanvasRenderer 