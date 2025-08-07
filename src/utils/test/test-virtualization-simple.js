// Simple test to verify virtualization functions
// This can be run in the browser console to test the virtualization logic

// Mock data for testing
const mockShapes = [
  {
    id: 'shape1',
    position: { x: 100, y: 100 },
    size: { width: 50, height: 50 }
  },
  {
    id: 'shape2',
    position: { x: 200, y: 200 },
    size: { width: 50, height: 50 }
  },
  {
    id: 'shape3',
    position: { x: 1000, y: 1000 }, // Outside viewport
    size: { width: 50, height: 50 }
  },
  {
    id: 'shape4',
    position: { x: 150, y: 150 },
    size: { width: 50, height: 50 }
  }
]

const mockGroups = [
  {
    id: 'group1',
    position: { x: 100, y: 100 },
    size: { width: 100, height: 100 }
  },
  {
    id: 'group2',
    position: { x: 2000, y: 2000 }, // Outside viewport
    size: { width: 100, height: 100 }
  }
]

const mockViewport = {
  left: 0,
  top: 0,
  right: 500,
  bottom: 500,
  width: 500,
  height: 500
}

// Test functions (these would be imported from virtualization.ts in the real app)
function isShapeVisible(shape, viewport) {
  const shapeLeft = shape.position.x
  const shapeTop = shape.position.y
  const shapeRight = shape.position.x + shape.size.width
  const shapeBottom = shape.position.y + shape.size.height

  return (
    shapeRight >= viewport.left &&
    shapeLeft <= viewport.right &&
    shapeBottom >= viewport.top &&
    shapeTop <= viewport.bottom
  )
}

function getShapesToRender(shapes, viewport, selectedShapeIds, selectedShapeId, config = { bufferSize: 200, minShapeSize: 10 }) {
  const visibleShapes = shapes.filter(shape => {
    if (shape.size.width < config.minShapeSize || shape.size.height < config.minShapeSize) {
      return true
    }
    return isShapeVisible(shape, viewport)
  })
  
  const selectedShapes = shapes.filter(shape => 
    selectedShapeIds.includes(shape.id) || shape.id === selectedShapeId
  )
  
  const allShapesToRender = [...visibleShapes, ...selectedShapes]
  const uniqueShapes = allShapesToRender.filter((shape, index, self) => 
    index === self.findIndex(s => s.id === shape.id)
  )
  
  return uniqueShapes
}

// Run tests
console.log('=== Virtualization Test ===')

console.log('1. Testing shape visibility:')
mockShapes.forEach((shape, index) => {
  const visible = isShapeVisible(shape, mockViewport)
  console.log(`  Shape ${index + 1}: ${visible ? 'Visible' : 'Hidden'} (${shape.position.x}, ${shape.position.y})`)
})

console.log('\n2. Testing shape rendering with no selection:')
const shapesToRender = getShapesToRender(mockShapes, mockViewport, [], null)
console.log(`  Total shapes: ${mockShapes.length}`)
console.log(`  Shapes to render: ${shapesToRender.length}`)
console.log(`  Reduction: ${((mockShapes.length - shapesToRender.length) / mockShapes.length * 100).toFixed(1)}%`)

console.log('\n3. Testing shape rendering with selection:')
const shapesToRenderWithSelection = getShapesToRender(mockShapes, mockViewport, ['shape3'], null)
console.log(`  Total shapes: ${mockShapes.length}`)
console.log(`  Shapes to render (with selection): ${shapesToRenderWithSelection.length}`)
console.log(`  Selected shape (shape3) should be included even though outside viewport`)

console.log('\n4. Testing with larger dataset:')
const largeShapes = []
for (let i = 0; i < 1000; i++) {
  largeShapes.push({
    id: `shape${i}`,
    position: { 
      x: Math.random() * 5000 - 2500, 
      y: Math.random() * 5000 - 2500 
    },
    size: { width: 50, height: 50 }
  })
}

const largeShapesToRender = getShapesToRender(largeShapes, mockViewport, [], null)
console.log(`  Large dataset - Total: ${largeShapes.length}, To render: ${largeShapesToRender.length}`)
console.log(`  Reduction: ${((largeShapes.length - largeShapesToRender.length) / largeShapes.length * 100).toFixed(1)}%`)

console.log('\n=== Test Complete ===')

// Export for use in browser console
window.virtualizationTest = {
  mockShapes,
  mockGroups,
  mockViewport,
  isShapeVisible,
  getShapesToRender
} 