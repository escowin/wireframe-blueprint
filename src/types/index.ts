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
  groupId?: string   // New property for grouping support
  
  // Comprehensive Styling Properties (Phase 2)
  borderRadius: number  // Border radius in pixels
  boxShadow: {
    offsetX: number
    offsetY: number
    blurRadius: number
    spreadRadius: number
    color: string
    enabled: boolean
  }
  
  // Typography Properties (Phase 2)
  typography: {
    fontFamily: string
    fontSize: number
    fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
    fontColor: string
    textAlign: 'left' | 'center' | 'right' | 'justify'
    lineHeight: number
    letterSpacing: number
    textDecoration: 'none' | 'underline' | 'line-through' | 'overline'
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  }
}

export interface Group {
  id: string
  name: string
  shapes: string[]  // Array of shape IDs in the group
  position: Point
  size: { width: number; height: number }
  zIndex: number
}

export interface CanvasState {
  shapes: Shape[]
  groups: Group[]
  selectedShapeId: string | null
  selectedShapeIds: string[]  // New property for multiple selection
  selectedGroupId: string | null
  zoom: number
  pan: Point
  gridSize: number
  showGrid: boolean
  showCssLabels: boolean
  canvasBackgroundColor: string
  canvasBackgroundOpacity: number
  // Alignment settings
  snapToGrid: boolean
  snapToEdges: boolean
  gridSnapSize: number
}

export type ToolType = 'select' | 'rectangle' | 'circle'

export type AlignmentAction = 
  | 'align-left' 
  | 'align-center' 
  | 'align-right' 
  | 'align-top' 
  | 'align-middle' 
  | 'align-bottom'
  | 'distribute-horizontal'
  | 'distribute-vertical'
  | 'snap-to-grid'
  | 'snap-to-edges'

export type GroupAction = 'group' | 'ungroup' 

export interface Template {
  id: string
  name: string
  description: string
  category: 'layout' | 'ui' | 'navigation' | 'content'
  shapes: Shape[]
  groups: Group[]
  thumbnail?: string
}

export interface TemplateCategory {
  id: string
  name: string
  description: string
  templates: Template[]
} 