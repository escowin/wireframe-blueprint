// Test to verify that CSS class input allows spaces
// This simulates the user typing in the CSS Classes field

// Simulate the validation logic from PropertiesPanel.tsx
const handlePropertyChange = (shape, property, value) => {
  if (property === 'cssClasses') {
    // Class validation: allow typing freely, only validate final result
    // Allow empty values, only validate if there's content
    if (value && value.trim() !== '') {
      // Clean the value: trim and normalize spaces
      const cleanedValue = value.trim().replace(/\s+/g, ' ')
      
      // Split by spaces and validate each class individually
      const classes = cleanedValue.split(' ').filter(cls => cls.trim() !== '')
      const isValid = classes.every(cls => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(cls))
      
      if (!isValid) {
        console.log(`❌ Invalid class format: ${value}`)
        return shape // Don't update if invalid - keep original value
      }
      
      // Use the cleaned value (normalized spaces)
      return { ...shape, [property]: cleanedValue }
    }
  }
  
  return { ...shape, [property]: value }
}

// Test cases
console.log('🧪 Testing CSS class input with spaces...\n')

let testShape = { id: 'test', cssClasses: 'original-class' }

// Test 1: Single class
console.log('1. Single class:')
testShape = handlePropertyChange(testShape, 'cssClasses', 'container')
console.log(`   Input: "container" → Output: "${testShape.cssClasses}"`)

// Test 2: Two classes with space
console.log('\n2. Two classes with space:')
testShape = handlePropertyChange(testShape, 'cssClasses', 'container wrapper')
console.log(`   Input: "container wrapper" → Output: "${testShape.cssClasses}"`)

// Test 3: Multiple classes with spaces
console.log('\n3. Multiple classes with spaces:')
testShape = handlePropertyChange(testShape, 'cssClasses', 'btn btn-primary btn-lg')
console.log(`   Input: "btn btn-primary btn-lg" → Output: "${testShape.cssClasses}"`)

// Test 4: Extra spaces (should be normalized)
console.log('\n4. Extra spaces (should be normalized):')
testShape = handlePropertyChange(testShape, 'cssClasses', 'container  wrapper   button')
console.log(`   Input: "container  wrapper   button" → Output: "${testShape.cssClasses}"`)

// Test 5: Invalid class (starts with number) - should keep previous value
console.log('\n5. Invalid class (starts with number) - should keep previous value:')
const previousValue = testShape.cssClasses
testShape = handlePropertyChange(testShape, 'cssClasses', 'container 123-invalid')
console.log(`   Input: "container 123-invalid" → Output: "${testShape.cssClasses}" (should be "${previousValue}")`)

// Test 6: Empty input
console.log('\n6. Empty input:')
testShape = handlePropertyChange(testShape, 'cssClasses', '')
console.log(`   Input: "" → Output: "${testShape.cssClasses}"`)

// Test 7: Just spaces
console.log('\n7. Just spaces:')
testShape = handlePropertyChange(testShape, 'cssClasses', '   ')
console.log(`   Input: "   " → Output: "${testShape.cssClasses}"`)

console.log('\n✅ Test completed!')
console.log('Expected results:')
console.log('1. Single class should work')
console.log('2. Multiple classes with spaces should work')
console.log('3. Extra spaces should be normalized to single spaces')
console.log('4. Invalid classes should be rejected and keep previous value')
console.log('5. Empty values should be allowed') 