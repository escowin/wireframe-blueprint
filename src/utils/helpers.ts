// Generate unique ID for shapes
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

// Export canvas as PNG image
export const exportAsPNG = (canvasElement: HTMLDivElement): void => {
  // Create a temporary canvas to render the diagram
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    console.error('Could not get canvas context')
    return
  }

  // Get the dimensions of the canvas element
  const rect = canvasElement.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height

  // Set background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Convert the DOM element to an image
  const data = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml">
        ${canvasElement.outerHTML}
      </div>
    </foreignObject>
  </svg>`

  const img = new Image()
  const svg = new Blob([data], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svg)

  img.onload = () => {
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)

    // Create download link
    const link = document.createElement('a')
    link.download = 'diagram.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  img.src = url
}

// Generate HTML from shapes
export const generateHTML = (shapes: any[]): string => {
  const sortedShapes = [...shapes].sort((a, b) => a.zIndex - b.zIndex)
  
  let html = '<body>\n'
  
  sortedShapes.forEach(shape => {
    const indent = '  '.repeat(1) // You can adjust indentation based on nesting
    const style = `style="position: absolute; left: ${shape.position.x}px; top: ${shape.position.y}px; width: ${shape.size.width}px; height: ${shape.size.height}px; background-color: ${shape.fillColor}; border: ${shape.borderWidth}px ${shape.borderStyle} ${shape.borderColor};"`
    
    html += `${indent}<${shape.elementTag} ${style}>\n`
    html += `${indent}</${shape.elementTag}>\n`
  })
  
  html += '</body>'
  
  return html
}

// Snap value to grid
export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize
}

// Clamp value between min and max
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
} 