// Test grouping functionality
import { createGroup, ungroupShapes, canGroupShapes, canUngroupShapes, getSelectedGroupIds } from './helpers.js'

// Mock shapes for testing
const mockShapes = [
  {
    id: 'shape1',
    type: 'rectangle',
    position: { x: 100, y: 100 },
    size: { width: 50, height: 50 },
    elementTag: 'div',
    elementId: 'test1',
    cssClasses: 'test-class',
    fillColor: '#ff0000',
    borderColor: '#000000',
    borderWidth: 2,
    borderStyle: 'solid',
    opacity: 1,
    zIndex: 1,
    borderRadius: 0,
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
    }
  },
  {
    id: 'shape2',
    type: 'circle',
    position: { x: 200, y: 100 },
    size: { width: 50, height: 50 },
    elementTag: 'div',
    elementId: 'test2',
    cssClasses: 'test-class',
    fillColor: '#00ff00',
    borderColor: '#000000',
    borderWidth: 2,
    borderStyle: 'solid',
    opacity: 1,
    zIndex: 2,
    borderRadius: 0,
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
    }
  }
]

const mockGroups = []

console.log('Testing grouping functionality...')

// Test 1: Check if shapes can be grouped
console.log('Test 1: Can group shapes?', canGroupShapes(mockShapes, ['shape1', 'shape2']))

// Test 2: Create a group
try {
  const { shapes: updatedShapes, group } = createGroup(mockShapes, ['shape1', 'shape2'])
  console.log('Test 2: Group created successfully')
  console.log('Group:', group)
  console.log('Updated shapes:', updatedShapes.map(s => ({ id: s.id, groupId: s.groupId })))
  
  // Test 3: Check if shapes can be ungrouped
  console.log('Test 3: Can ungroup shapes?', canUngroupShapes(updatedShapes, ['shape1', 'shape2']))
  
  // Test 4: Get selected group IDs
  console.log('Test 4: Selected group IDs:', getSelectedGroupIds(updatedShapes, ['shape1', 'shape2']))
  
  // Test 5: Ungroup shapes
  const { shapes: ungroupedShapes, groups: updatedGroups } = ungroupShapes(updatedShapes, [group], group.id)
  console.log('Test 5: Shapes ungrouped successfully')
  console.log('Ungrouped shapes:', ungroupedShapes.map(s => ({ id: s.id, groupId: s.groupId })))
  console.log('Updated groups:', updatedGroups)
  
} catch (error) {
  console.error('Test failed:', error.message)
}

console.log('Grouping tests completed!') 