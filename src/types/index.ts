export interface Point {
  x: number
  y: number
}

export interface Shape {
  id: string
  type: 'rectangle' | 'circle'
  position: Point
  size: { width: number; height: number }
  elementTag: string
  elementId: string  // New property for element ID
  cssClasses: string  // Keep for CSS classes only
  fillColor: string
  borderColor: string
  borderWidth: number
  borderStyle: 'solid' | 'dotted' | 'dashed'
  opacity: number
  zIndex: number
  parentId?: string  // New property for nesting support
}

export interface CanvasState {
  shapes: Shape[]
  selectedShapeId: string | null
  zoom: number
  pan: Point
  gridSize: number
  showGrid: boolean
  showCssLabels: boolean
  canvasBackgroundColor: string
  canvasBackgroundOpacity: number
}

export type ToolType = 'select' | 'rectangle' | 'circle' 