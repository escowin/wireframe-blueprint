// Test file to demonstrate virtualization optimization
// This creates a large number of shapes to show the performance benefits

const { generateId } = require('./helpers')

// Generate a large number of test shapes
function generateTestShapes(count = 1000) {
  const shapes = []
  
  for (let i = 0; i < count; i++) {
    shapes.push({
      id: generateId(),
      type: i % 2 === 0 ? 'rectangle' : 'circle',
      position: {
        x: Math.random() * 5000 - 2500, // Spread across a large area
        y: Math.random() * 5000 - 2500
      },
      size: {
        width: 50 + Math.random() * 100,
        height: 50 + Math.random() * 100
      },
      elementTag: 'div',
      elementId: `shape-${i}`,
      cssClasses: `test-shape shape-${i % 5}`,
      fillColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      borderColor: '#000000',
      borderWidth: 2,
      borderStyle: 'solid',
      opacity: 0.8 + Math.random() * 0.2,
      zIndex: i,
      borderRadius: 5,
      boxShadow: {
        offsetX: 2,
        offsetY: 2,
        blurRadius: 4,
        spreadRadius: 0,
        color: 'rgba(0,0,0,0.3)',
        enabled: true
      },
      typography: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'normal',
        fontColor: '#000000',
        textAlign: 'center',
        lineHeight: 1.2,
        letterSpacing: 0,
        textDecoration: 'none',
        textTransform: 'none'
      }
    })
  }
  
  return shapes
}

// Generate test groups
function generateTestGroups(shapeCount = 1000, groupCount = 50) {
  const groups = []
  
  for (let i = 0; i < groupCount; i++) {
    const groupShapes = []
    const shapesPerGroup = Math.floor(shapeCount / groupCount)
    
    for (let j = 0; j < shapesPerGroup; j++) {
      const shapeIndex = i * shapesPerGroup + j
      if (shapeIndex < shapeCount) {
        groupShapes.push(`shape-${shapeIndex}`)
      }
    }
    
    groups.push({
      id: `group-${i}`,
      name: `Test Group ${i}`,
      shapes: groupShapes,
      position: {
        x: Math.random() * 4000 - 2000,
        y: Math.random() * 4000 - 2000
      },
      size: {
        width: 200 + Math.random() * 300,
        height: 200 + Math.random() * 300
      },
      zIndex: i
    })
  }
  
  return groups
}

// Test viewport calculations
function testViewportCalculation() {
  console.log('Testing viewport calculation...')
  
  const viewport = {
    left: -100,
    top: -100,
    right: 1100,
    bottom: 700,
    width: 1200,
    height: 800
  }
  
  const testShapes = generateTestShapes(100)
  const visibleShapes = testShapes.filter(shape => {
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
  })
  
  console.log(`Total shapes: ${testShapes.length}`)
  console.log(`Visible shapes: ${visibleShapes.length}`)
  console.log(`Reduction: ${((testShapes.length - visibleShapes.length) / testShapes.length * 100).toFixed(1)}%`)
}

// Performance test
function performanceTest() {
  console.log('Running performance test...')
  
  const shapeCounts = [100, 500, 1000, 2000]
  
  shapeCounts.forEach(count => {
    console.log(`\nTesting with ${count} shapes:`)
    
    const shapes = generateTestShapes(count)
    const viewport = {
      left: -100,
      top: -100,
      right: 1100,
      bottom: 700,
      width: 1200,
      height: 800
    }
    
    // Test without virtualization
    const startTime = performance.now()
    const allShapes = shapes.map(shape => ({ ...shape })) // Simulate rendering all shapes
    const endTime = performance.now()
    const allShapesTime = endTime - startTime
    
    // Test with virtualization
    const startTime2 = performance.now()
    const visibleShapes = shapes.filter(shape => {
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
    }).map(shape => ({ ...shape })) // Simulate rendering only visible shapes
    const endTime2 = performance.now()
    const visibleShapesTime = endTime2 - startTime2
    
    console.log(`  All shapes time: ${allShapesTime.toFixed(2)}ms`)
    console.log(`  Visible shapes time: ${visibleShapesTime.toFixed(2)}ms`)
    console.log(`  Performance improvement: ${((allShapesTime - visibleShapesTime) / allShapesTime * 100).toFixed(1)}%`)
    console.log(`  Shapes rendered: ${visibleShapes.length}/${count} (${((count - visibleShapes.length) / count * 100).toFixed(1)}% reduction)`)
  })
}

// Export functions for use in the main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateTestShapes,
    generateTestGroups,
    testViewportCalculation,
    performanceTest
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  console.log('Running virtualization tests...')
  testViewportCalculation()
  performanceTest()
} 