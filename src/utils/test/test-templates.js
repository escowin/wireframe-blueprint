// Test file for templates functionality
import { getAllTemplates, getTemplateById, getTemplatesByCategory } from './templates.js'

console.log('Testing Templates Functionality...')

// Test 1: Get all templates
console.log('\n1. All Templates:')
const allTemplates = getAllTemplates()
console.log(`Found ${allTemplates.length} templates:`)
allTemplates.forEach(template => {
  console.log(`- ${template.name} (${template.category}): ${template.shapes.length} shapes`)
})

// Test 2: Get templates by category
console.log('\n2. Templates by Category:')
const layoutTemplates = getTemplatesByCategory('layout')
console.log(`Layout templates: ${layoutTemplates.length}`)
layoutTemplates.forEach(template => {
  console.log(`- ${template.name}`)
})

const navigationTemplates = getTemplatesByCategory('navigation')
console.log(`Navigation templates: ${navigationTemplates.length}`)
navigationTemplates.forEach(template => {
  console.log(`- ${template.name}`)
})

// Test 3: Get specific template
console.log('\n3. Specific Template:')
const headerTemplate = getTemplateById('header-basic')
if (headerTemplate) {
  console.log(`Header template found: ${headerTemplate.name}`)
  console.log(`Shapes: ${headerTemplate.shapes.length}`)
  console.log(`Groups: ${headerTemplate.groups.length}`)
} else {
  console.log('Header template not found')
}

// Test 4: Template structure validation
console.log('\n4. Template Structure Validation:')
allTemplates.forEach(template => {
  console.log(`\nTemplate: ${template.name}`)
  console.log(`- ID: ${template.id}`)
  console.log(`- Category: ${template.category}`)
  console.log(`- Shapes: ${template.shapes.length}`)
  console.log(`- Groups: ${template.groups.length}`)
  
  // Check if shapes have required properties
  template.shapes.forEach((shape, index) => {
    if (!shape.id || !shape.position || !shape.size) {
      console.log(`  ⚠️  Shape ${index} missing required properties`)
    }
  })
})

console.log('\n✅ Templates test completed!') 