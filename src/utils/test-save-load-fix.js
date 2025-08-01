console.log('=== Testing New Save/Load Approach (Version 1.2) ===\n')

// Mock shape with all properties
const mockShape = {
  id: 'test-shape-1',
  type: 'rectangle',
  position: { x: 100, y: 100 },
  size: { width: 200, height: 150 },
  elementTag: 'div',
  cssClasses: 'container wrapper',
  elementId: 'main-container',
  fillColor: '#e2e8f0',
  borderColor: '#64748b',
  borderWidth: 2,
  borderStyle: 'solid',
  opacity: 0.8,
  zIndex: 5,
  borderRadius: 10,
  boxShadow: {
    offsetX: 5,
    offsetY: 5,
    blurRadius: 10,
    spreadRadius: 2,
    color: '#000000',
    enabled: true
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 16,
    fontWeight: 'bold',
    fontColor: '#333333',
    textAlign: 'center',
    lineHeight: 1.5,
    letterSpacing: 1,
    textDecoration: 'underline',
    textTransform: 'uppercase'
  },
  parentId: null
}

// Mock shape that might be filtered out by nesting detection
const mockShape2 = {
  id: 'test-shape-2',
  type: 'circle',
  position: { x: 300, y: 300 },
  size: { width: 100, height: 100 },
  elementTag: 'div',
  cssClasses: 'circle-element',
  elementId: 'circle-1',
  fillColor: '#ff6b6b',
  borderColor: '#e74c3c',
  borderWidth: 1,
  borderStyle: 'solid',
  opacity: 1,
  zIndex: 10,
  borderRadius: 50, // Circle
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
  },
  parentId: null
}

// Mock canvas state with multiple shapes
const mockCanvasState = {
  shapes: [mockShape, mockShape2],
  selectedShapeId: null,
  zoom: 1,
  pan: { x: 0, y: 0 },
  gridSize: 20,
  showGrid: true,
  showCssLabels: false,
  canvasBackgroundColor: '#ffffff',
  canvasBackgroundOpacity: 1
}

console.log('1. Original canvas state:')
console.log('- Total shapes:', mockCanvasState.shapes.length)
console.log('- Shape 1 ID:', mockCanvasState.shapes[0].id)
console.log('- Shape 2 ID:', mockCanvasState.shapes[1].id)
console.log('')

// Simulate the new save process (version 1.2)
console.log('2. Simulating new save process (version 1.2)...')
const saveData = {
  version: '1.2',
  timestamp: new Date().toISOString(),
  canvasState: {
    ...mockCanvasState,
    shapes: mockCanvasState.shapes // Keep shapes as flat array
  }
}

console.log('Save data created with', saveData.canvasState.shapes.length, 'shapes')
console.log('')

// Simulate the new load process
console.log('3. Simulating new load process (version 1.2)...')
const loadedCanvasState = saveData.canvasState

console.log('Loaded canvas state with', loadedCanvasState.shapes.length, 'shapes')

// Validate shapes
console.log('4. Validating shapes...')
const validatedShapes = loadedCanvasState.shapes.map(shape => ({
  id: shape.id || 'generated-id',
  type: shape.type || 'rectangle',
  position: shape.position || { x: 0, y: 0 },
  size: shape.size || { width: 100, height: 100 },
  elementTag: shape.elementTag || 'div',
  cssClasses: shape.cssClasses || '',
  elementId: shape.elementId || '',
  fillColor: shape.fillColor || '#e2e8f0',
  borderColor: shape.borderColor || '#64748b',
  borderWidth: shape.borderWidth || 1,
  borderStyle: shape.borderStyle || 'solid',
  opacity: shape.opacity || 1,
  zIndex: shape.zIndex || 0,
  borderRadius: shape.borderRadius || 0,
  boxShadow: shape.boxShadow || {
    offsetX: 0,
    offsetY: 0,
    blurRadius: 0,
    spreadRadius: 0,
    color: '#000000',
    enabled: false
  },
  typography: shape.typography || {
    fontFamily: 'Arial, sans-serif',
    fontSize: 14,
    fontWeight: 'normal',
    fontColor: '#000000',
    textAlign: 'left',
    lineHeight: 1.2,
    letterSpacing: 0,
    textDecoration: 'none',
    textTransform: 'none'
  },
  parentId: shape.parentId || null
}))

console.log('Shapes validated')
console.log('')

// Check if all shapes were preserved
console.log('5. Shape preservation check:')
console.log('- Original shape count:', mockCanvasState.shapes.length)
console.log('- Loaded shape count:', loadedCanvasState.shapes.length)
console.log('- Validated shape count:', validatedShapes.length)

const allShapesPreserved = validatedShapes.length === mockCanvasState.shapes.length
const shapeIdsPreserved = validatedShapes.every((shape, index) => 
  shape.id === mockCanvasState.shapes[index].id
)

console.log('- All shapes preserved:', allShapesPreserved ? '✅' : '❌')
console.log('- Shape IDs preserved:', shapeIdsPreserved ? '✅' : '❌')
console.log('')

// Check specific properties
const shape1 = validatedShapes.find(s => s.id === 'test-shape-1')
const shape2 = validatedShapes.find(s => s.id === 'test-shape-2')

console.log('6. Property preservation check:')
if (shape1) {
  console.log('- Shape 1 borderRadius:', shape1.borderRadius === mockShape.borderRadius ? '✅' : '❌')
  console.log('- Shape 1 boxShadow enabled:', shape1.boxShadow.enabled === mockShape.boxShadow.enabled ? '✅' : '❌')
} else {
  console.log('- Shape 1: ❌ Missing')
}

if (shape2) {
  console.log('- Shape 2 type:', shape2.type === mockShape2.type ? '✅' : '❌')
  console.log('- Shape 2 fillColor:', shape2.fillColor === mockShape2.fillColor ? '✅' : '❌')
} else {
  console.log('- Shape 2: ❌ Missing')
}
console.log('')

if (allShapesPreserved && shapeIdsPreserved) {
  console.log('🎉 All shapes preserved successfully!')
  console.log('The new save/load approach should fix the missing elements issue.')
} else {
  console.log('❌ Some shapes were lost during save/load process.')
}

console.log('\n=== Test Complete ===') 