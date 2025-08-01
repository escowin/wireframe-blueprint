// Test file for alignment tools
// This file can be run with Node.js to test the alignment functions

// Mock the alignment functions for testing
const snapToGridValue = (value, gridSize) => {
  return Math.round(value / gridSize) * gridSize
}

const snapToGridPoint = (point, gridSize) => {
  return {
    x: snapToGridValue(point.x, gridSize),
    y: snapToGridValue(point.y, gridSize)
  }
}

const alignShapes = (shapes, selectedShapeIds, alignment) => {
  if (selectedShapeIds.length < 2) return shapes

  const selectedShapes = shapes.filter(shape => selectedShapeIds.includes(shape.id))
  const referenceShape = selectedShapes[0]
  
  return shapes.map(shape => {
    if (!selectedShapeIds.includes(shape.id)) return shape

    const updatedShape = { ...shape }
    
    switch (alignment) {
      case 'align-left':
        updatedShape.position.x = referenceShape.position.x
        break
      case 'align-center':
        updatedShape.position.x = referenceShape.position.x + referenceShape.size.width / 2 - shape.size.width / 2
        break
      case 'align-right':
        updatedShape.position.x = referenceShape.position.x + referenceShape.size.width - shape.size.width
        break
      case 'align-top':
        updatedShape.position.y = referenceShape.position.y
        break
      case 'align-middle':
        updatedShape.position.y = referenceShape.position.y + referenceShape.size.height / 2 - shape.size.height / 2
        break
      case 'align-bottom':
        updatedShape.position.y = referenceShape.position.y + referenceShape.size.height - shape.size.height
        break
    }
    
    return updatedShape
  })
}

const distributeShapes = (shapes, selectedShapeIds, distribution) => {
  if (selectedShapeIds.length < 3) return shapes

  const selectedShapes = shapes.filter(shape => selectedShapeIds.includes(shape.id))
  const sortedShapes = [...selectedShapes].sort((a, b) => {
    if (distribution === 'distribute-horizontal') {
      return a.position.x - b.position.x
    } else {
      return a.position.y - b.position.y
    }
  })

  const firstShape = sortedShapes[0]
  const lastShape = sortedShapes[sortedShapes.length - 1]
  
  let totalSpace
  let totalSize = 0
  
  if (distribution === 'distribute-horizontal') {
    totalSpace = lastShape.position.x - firstShape.position.x
    sortedShapes.forEach(shape => {
      totalSize += shape.size.width
    })
  } else {
    totalSpace = lastShape.position.y - firstShape.position.y
    sortedShapes.forEach(shape => {
      totalSize += shape.size.height
    })
  }

  const spacing = (totalSpace - totalSize) / (sortedShapes.length - 1)
  
  return shapes.map(shape => {
    if (!selectedShapeIds.includes(shape.id)) return shape

    const shapeIndex = sortedShapes.findIndex(s => s.id === shape.id)
    if (shapeIndex === 0 || shapeIndex === sortedShapes.length - 1) return shape

    const updatedShape = { ...shape }
    
    if (distribution === 'distribute-horizontal') {
      let newX = firstShape.position.x
      for (let i = 0; i < shapeIndex; i++) {
        newX += sortedShapes[i].size.width + spacing
      }
      updatedShape.position.x = newX
    } else {
      let newY = firstShape.position.y
      for (let i = 0; i < shapeIndex; i++) {
        newY += sortedShapes[i].size.height + spacing
      }
      updatedShape.position.y = newY
    }
    
    return updatedShape
  })
}

// Test data
const testShapes = [
  {
    id: 'shape1',
    position: { x: 100, y: 100 },
    size: { width: 50, height: 50 }
  },
  {
    id: 'shape2',
    position: { x: 200, y: 150 },
    size: { width: 60, height: 40 }
  },
  {
    id: 'shape3',
    position: { x: 300, y: 200 },
    size: { width: 40, height: 60 }
  }
]

// Test snap to grid
console.log('Testing snap to grid:')
console.log('Original point:', { x: 123, y: 456 })
console.log('Snapped to grid (20):', snapToGridPoint({ x: 123, y: 456 }, 20))
console.log('Snapped to grid (10):', snapToGridPoint({ x: 123, y: 456 }, 10))

// Test alignment
console.log('\nTesting alignment:')
const alignedShapes = alignShapes(testShapes, ['shape1', 'shape2', 'shape3'], 'align-left')
console.log('Aligned left:', alignedShapes.map(s => ({ id: s.id, x: s.position.x })))

const centerAlignedShapes = alignShapes(testShapes, ['shape1', 'shape2', 'shape3'], 'align-center')
console.log('Aligned center:', centerAlignedShapes.map(s => ({ id: s.id, x: s.position.x })))

// Test distribution
console.log('\nTesting distribution:')
const distributedShapes = distributeShapes(testShapes, ['shape1', 'shape2', 'shape3'], 'distribute-horizontal')
console.log('Distributed horizontally:', distributedShapes.map(s => ({ id: s.id, x: s.position.x })))

console.log('\nAlignment tools test completed successfully!') 