// Test file to verify the attribute fix resolves the cut/paste propagation bug
// This simulates the scenario where a user cuts CSS classes and pastes into Element ID

// Simulate existing shapes without elementId property (old format)
const oldShapes = [
  {
    id: 'shape1',
    type: 'rectangle',
    position: { x: 50, y: 25 },
    size: { width: 800, height: 100 },
    elementTag: 'main',
    // elementId: undefined (missing in old format)
    cssClasses: '#lineups', // Old format: ID stored in cssClasses
    fillColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 1,
    borderStyle: 'solid',
    opacity: 1,
    zIndex: 0
  },
  {
    id: 'shape2',
    type: 'rectangle',
    position: { x: 80, y: 180 },
    size: { width: 350, height: 550 },
    elementTag: 'section',
    // elementId: undefined (missing in old format)
    cssClasses: '#unassigned-section', // Old format: ID stored in cssClasses
    fillColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderStyle: 'solid',
    opacity: 1,
    zIndex: 1
  }
]

// Migration function (same as in App.tsx)
const migrateCanvasState = (canvasState) => {
  return {
    ...canvasState,
    shapes: canvasState.shapes.map((shape) => ({
      ...shape,
      elementId: shape.elementId || '', // Add elementId if missing
      cssClasses: shape.cssClasses || '' // Ensure cssClasses is defined
    }))
  }
}

// Simulate property change with validation (same as in PropertiesPanel.tsx)
const handlePropertyChange = (shape, property, value) => {
  // Validate CSS selector syntax only for non-empty values
  if (property === 'elementId') {
    // Allow empty values, only validate if there's content
    if (value && value.trim() !== '') {
      const idRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/
      if (!idRegex.test(value)) {
        console.log(`❌ Invalid ID format: ${value}`)
        return shape // Don't update if invalid
      }
    }
  }

  if (property === 'cssClasses') {
    // Allow empty values, only validate if there's content
    if (value && value.trim() !== '') {
      const classRegex = /^[a-zA-Z][a-zA-Z0-9_-]*(\s+[a-zA-Z][a-zA-Z0-9_-]*)*$/
      if (!classRegex.test(value)) {
        console.log(`❌ Invalid class format: ${value}`)
        return shape // Don't update if invalid
      }
    }
  }

  return { ...shape, [property]: value }
}

// Test the migration
console.log('🧪 Testing attribute fix...\n')

// Step 1: Test migration of old shapes
console.log('1. Testing migration of old shapes:')
const migratedShapes = migrateCanvasState({ shapes: oldShapes }).shapes
console.log('Before migration:')
oldShapes.forEach(shape => {
  console.log(`  ${shape.elementTag}: elementId=${shape.elementId}, cssClasses=${shape.cssClasses}`)
})

console.log('\nAfter migration:')
migratedShapes.forEach(shape => {
  console.log(`  ${shape.elementTag}: elementId=${shape.elementId}, cssClasses=${shape.cssClasses}`)
})

// Step 2: Test the cut/paste scenario
console.log('\n2. Testing cut/paste scenario:')
let shape1 = migratedShapes[0]
let shape2 = migratedShapes[1]

console.log('Initial state:')
console.log(`  Shape1: elementId="${shape1.elementId}", cssClasses="${shape1.cssClasses}"`)
console.log(`  Shape2: elementId="${shape2.elementId}", cssClasses="${shape2.cssClasses}"`)

// Simulate cutting CSS classes from shape1
console.log('\nCutting CSS classes from shape1...')
const cutValue = shape1.cssClasses
shape1 = handlePropertyChange(shape1, 'cssClasses', '')
console.log(`  Shape1 after cut: elementId="${shape1.elementId}", cssClasses="${shape1.cssClasses}"`)

// Simulate pasting into Element ID of shape1
console.log('\nPasting into Element ID of shape1...')
shape1 = handlePropertyChange(shape1, 'elementId', cutValue)
console.log(`  Shape1 after paste: elementId="${shape1.elementId}", cssClasses="${shape1.cssClasses}"`)

// Verify shape2 is unaffected
console.log(`  Shape2 (should be unchanged): elementId="${shape2.elementId}", cssClasses="${shape2.cssClasses}"`)

// Step 3: Test validation
console.log('\n3. Testing validation:')
console.log('Testing valid ID:', handlePropertyChange(shape1, 'elementId', 'valid-id').elementId)
console.log('Testing invalid ID:', handlePropertyChange(shape1, 'elementId', '123-invalid').elementId)
console.log('Testing empty ID:', handlePropertyChange(shape1, 'elementId', '').elementId)

console.log('Testing valid classes:', handlePropertyChange(shape1, 'cssClasses', 'valid-class').cssClasses)
console.log('Testing invalid classes:', handlePropertyChange(shape1, 'cssClasses', '123-invalid').cssClasses)
console.log('Testing empty classes:', handlePropertyChange(shape1, 'cssClasses', '').cssClasses)

// Step 4: Test HTML generation
console.log('\n4. Testing HTML generation:')
function generateTestHTML(shapes) {
  let html = ''
  shapes.forEach(shape => {
    let attributes = ''
    
    // Add ID attribute if present
    if (shape.elementId && shape.elementId.trim()) {
      attributes += ` id="${shape.elementId.trim()}"`
    }
    
    // Add class attribute if present
    if (shape.cssClasses && shape.cssClasses.trim()) {
      attributes += ` class="${shape.cssClasses.trim()}"`
    }
    
    html += `<${shape.elementTag}${attributes}>\n`
  })
  return html
}

const finalShapes = [shape1, shape2]
console.log('Generated HTML:')
console.log(generateTestHTML(finalShapes))

console.log('\n✅ Test completed!')
console.log('Expected results:')
console.log('1. Migration should add empty elementId to old shapes')
console.log('2. Cut/paste should work without affecting other shapes')
console.log('3. Validation should allow empty values but reject invalid formats')
console.log('4. HTML generation should use proper id and class attributes') 