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
  cssClasses: string
  fillColor: string
  borderColor: string
  borderWidth: number
  borderStyle: 'solid' | 'dotted' | 'dashed'
  zIndex: number
}

export interface CanvasState {
  shapes: Shape[]
  selectedShapeId: string | null
  zoom: number
  pan: Point
  gridSize: number
  showGrid: boolean
}

export type ToolType = 'select' | 'rectangle' | 'circle' 