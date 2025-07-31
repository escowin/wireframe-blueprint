// Test file for layer management functions
const { bringToFront, sendToBack, bringForward, sendBackward, getLayerInfo } = require('./helpers.ts')

// Test data - shapes with different z-index values
const testShapes = [
  { id: 'shape1', zIndex: 1, type: 'rectangle' },
  { id: 'shape2', zIndex: 2, type: 'rectangle' },
  { id: 'shape3', zIndex: 3, type: 'circle' },
  { id: 'shape4', zIndex: 4, type: 'rectangle' }
]

console.log('=== Layer Management Test ===\n')

console.log('Original shapes order:')
testShapes.forEach(shape => {
  console.log(`${shape.id}: z-index ${shape.zIndex}`)
})

console.log('\n--- Testing bringToFront ---')
const frontResult = bringToFront(testShapes, 'shape2')
console.log('After bringing shape2 to front:')
frontResult.forEach(shape => {
  console.log(`${shape.id}: z-index ${shape.zIndex}`)
})

console.log('\n--- Testing sendToBack ---')
const backResult = sendToBack(testShapes, 'shape3')
console.log('After sending shape3 to back:')
backResult.forEach(shape => {
  console.log(`${shape.id}: z-index ${shape.zIndex}`)
})

console.log('\n--- Testing bringForward ---')
const forwardResult = bringForward(testShapes, 'shape1')
console.log('After bringing shape1 forward:')
forwardResult.forEach(shape => {
  console.log(`${shape.id}: z-index ${shape.zIndex}`)
})

console.log('\n--- Testing sendBackward ---')
const backwardResult = sendBackward(testShapes, 'shape4')
console.log('After sending shape4 backward:')
backwardResult.forEach(shape => {
  console.log(`${shape.id}: z-index ${shape.zIndex}`)
})

console.log('\n--- Testing getLayerInfo ---')
const layerInfo = getLayerInfo(testShapes, 'shape2')
console.log('Layer info for shape2:', layerInfo)

console.log('\n=== Test Complete ===') 