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
  
  let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated Layout</title>\n</head>\n<body>\n'
  
  sortedShapes.forEach(shape => {
    const indent = '  '.repeat(2)
    const style = `style="position: absolute; left: ${shape.position.x}px; top: ${shape.position.y}px; width: ${shape.size.width}px; height: ${shape.size.height}px; background-color: ${hexToRgba(shape.fillColor, shape.opacity)}; border: ${shape.borderWidth}px ${shape.borderStyle} ${shape.borderColor};"`
    const classAttr = shape.cssClasses ? ` class="${shape.cssClasses}"` : ''
    
    html += `${indent}<${shape.elementTag}${classAttr} ${style}>\n`
    html += `${indent}  <!-- ${shape.elementTag} content -->\n`
    html += `${indent}</${shape.elementTag}>\n`
  })
  
  html += '</body>\n</html>'
  
  return html
}

// Export HTML as file
export const exportAsHTML = (shapes: any[]): void => {
  const html = generateHTML(shapes)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.download = 'layout.html'
  link.href = url
  link.click()
  
  URL.revokeObjectURL(url)
}

// Snap value to grid
export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize
}

// Clamp value between min and max
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

// Convert hex color to rgba with opacity
export const hexToRgba = (hex: string, opacity: number): string => {
  // Remove the # if present
  const cleanHex = hex.replace('#', '')
  
  // Parse the hex values
  const r = parseInt(cleanHex.substr(0, 2), 16)
  const g = parseInt(cleanHex.substr(2, 2), 16)
  const b = parseInt(cleanHex.substr(4, 2), 16)
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// Save diagram as JSON file
export const saveDiagram = (canvasState: any): void => {
  const diagramData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    canvasState: canvasState
  }
  
  const jsonString = JSON.stringify(diagramData, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.download = `diagram-${new Date().toISOString().split('T')[0]}.json`
  link.href = url
  link.click()
  
  URL.revokeObjectURL(url)
}

// Load diagram from JSON file
export const loadDiagram = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const diagramData = JSON.parse(content)
        
        // Validate the file format
        if (!diagramData.version || !diagramData.canvasState) {
          throw new Error('Invalid diagram file format')
        }
        
        resolve(diagramData.canvasState)
      } catch (error) {
        reject(new Error('Failed to parse diagram file'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsText(file)
  })
}

// Auto-save to localStorage
export const autoSave = (canvasState: any): void => {
  try {
    const autoSaveData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      canvasState: canvasState
    }
    localStorage.setItem('diagram-autosave', JSON.stringify(autoSaveData))
  } catch (error) {
    console.warn('Failed to auto-save diagram:', error)
  }
}

// Load auto-saved diagram from localStorage
export const loadAutoSave = (): any | null => {
  try {
    const saved = localStorage.getItem('diagram-autosave')
    if (!saved) return null
    
    const autoSaveData = JSON.parse(saved)
    if (!autoSaveData.version || !autoSaveData.canvasState) {
      return null
    }
    
    return autoSaveData.canvasState
  } catch (error) {
    console.warn('Failed to load auto-saved diagram:', error)
    return null
  }
}

// Clear auto-saved diagram
export const clearAutoSave = (): void => {
  try {
    localStorage.removeItem('diagram-autosave')
  } catch (error) {
    console.warn('Failed to clear auto-save:', error)
  }
} 