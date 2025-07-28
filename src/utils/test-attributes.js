// Test file to demonstrate improved CSS selector attribute system
// This shows how the new system properly separates IDs and CSS classes

const testShapes = [
  {
    id: 'shape1',
    type: 'rectangle',
    position: { x: 50, y: 25 },
    size: { width: 800, height: 100 },
    elementTag: 'header',
    elementId: 'main-header',  // ✅ Proper ID attribute
    cssClasses: 'container header-wrapper',  // ✅ Proper CSS classes
    fillColor: '#e2e8f0',
    borderColor: '#64748b',
    borderWidth: 2,
    borderStyle: 'solid',
    opacity: 1,
    zIndex: 0
  },
  {
    id: 'shape2',
    type: 'rectangle',
    position: { x: 70, y: 45 },
    size: { width: 200, height: 40 },
    elementTag: 'h1',
    elementId: '',  // ✅ No ID
    cssClasses: 'title main-title',  // ✅ Multiple CSS classes
    fillColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderStyle: 'solid',
    opacity: 1,
    zIndex: 1
  },
  {
    id: 'shape3',
    type: 'rectangle',
    position: { x: 300, y: 45 },
    size: { width: 500, height: 60 },
    elementTag: 'nav',
    elementId: 'primary-nav',  // ✅ ID for navigation
    cssClasses: 'navigation menu',  // ✅ CSS classes for styling
    fillColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    borderStyle: 'solid',
    opacity: 1,
    zIndex: 1
  },
  {
    id: 'shape4',
    type: 'rectangle',
    position: { x: 50, y: 150 },
    size: { width: 800, height: 600 },
    elementTag: 'main',
    elementId: 'main-content',  // ✅ ID for main content
    cssClasses: 'container content-area',  // ✅ CSS classes
    fillColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderStyle: 'solid',
    opacity: 1,
    zIndex: 0
  },
  {
    id: 'shape5',
    type: 'rectangle',
    position: { x: 80, y: 180 },
    size: { width: 350, height: 550 },
    elementTag: 'section',
    elementId: 'unassigned-section',  // ✅ ID for specific section
    cssClasses: 'content-section',  // ✅ CSS class
    fillColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderStyle: 'solid',
    opacity: 1,
    zIndex: 1
  }
]

// Function to generate HTML with proper attributes
function generateHTMLWithAttributes(shapes) {
  let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Improved Attribute System Test</title>\n</head>\n<body>\n'
  
  shapes.forEach(shape => {
    const indent = '  '
    
    // Build attributes string
    let attributes = ''
    
    // Add ID attribute if present
    if (shape.elementId && shape.elementId.trim()) {
      attributes += ` id="${shape.elementId.trim()}"`
    }
    
    // Add class attribute if present
    if (shape.cssClasses && shape.cssClasses.trim()) {
      attributes += ` class="${shape.cssClasses.trim()}"`
    }
    
    const style = `style="position: absolute; left: ${shape.position.x}px; top: ${shape.position.y}px; width: ${shape.size.width}px; height: ${shape.size.height}px; background-color: ${shape.fillColor}; border: ${shape.borderWidth}px ${shape.borderStyle} ${shape.borderColor};"`
    
    html += `${indent}<${shape.elementTag}${attributes} ${style}>\n`
    html += `${indent}  <!-- ${shape.elementTag} content -->\n`
    html += `${indent}</${shape.elementTag}>\n`
  })
  
  html += '</body>\n</html>'
  return html
}

// Generate and display the HTML
const generatedHTML = generateHTMLWithAttributes(testShapes)
console.log('Generated HTML with improved attribute system:')
console.log(generatedHTML)

// Expected output:
/*
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Improved Attribute System Test</title>
</head>
<body>
  <header id="main-header" class="container header-wrapper" style="position: absolute; left: 50px; top: 25px; width: 800px; height: 100px; background-color: #e2e8f0; border: 2px solid #64748b;">
    <!-- header content -->
  </header>
  <h1 class="title main-title" style="position: absolute; left: 70px; top: 45px; width: 200px; height: 40px; background-color: #ffffff; border: 1px solid #e2e8f0;">
    <!-- h1 content -->
  </h1>
  <nav id="primary-nav" class="navigation menu" style="position: absolute; left: 300px; top: 45px; width: 500px; height: 60px; background-color: #f1f5f9; border: 1px solid #cbd5e1;">
    <!-- nav content -->
  </nav>
  <main id="main-content" class="container content-area" style="position: absolute; left: 50px; top: 150px; width: 800px; height: 600px; background-color: #ffffff; border: 1px solid #e2e8f0;">
    <!-- main content -->
  </main>
  <section id="unassigned-section" class="content-section" style="position: absolute; left: 80px; top: 180px; width: 350px; height: 550px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
    <!-- section content -->
  </section>
</body>
</html>
*/

console.log('\n✅ Key improvements:')
console.log('1. IDs use proper "id" attribute instead of "class"')
console.log('2. CSS classes use proper "class" attribute')
console.log('3. No more invalid HTML like "class="#unassigned-section""')
console.log('4. Proper CSS selector syntax validation')
console.log('5. Clear separation between IDs and classes in UI') 