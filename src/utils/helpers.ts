import { Shape, Point } from '../types'

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

// Ensure shape has all required properties with defaults
const ensureShapeProperties = (shape: any): any => {
  return {
    ...shape,
    borderRadius: shape.borderRadius ?? 0,
    boxShadow: shape.boxShadow ?? {
      offsetX: 0,
      offsetY: 0,
      blurRadius: 0,
      spreadRadius: 0,
      color: '#000000',
      enabled: false
    },
    typography: shape.typography ?? {
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
}

// Generate HTML from shapes with nesting support
export const generateHTML = (shapes: any[]): string => {
  // Ensure all shapes have the new properties
  const shapesWithDefaults = shapes.map(ensureShapeProperties)
  
  // First, detect parent-child relationships based on spatial containment
  const shapesWithParents = detectNesting(shapesWithDefaults)
  
  // Build a tree structure
  const shapeTree = buildShapeTree(shapesWithParents)
  
  // Generate hierarchical HTML
  let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated Layout</title>\n</head>\n<body>\n'
  
  // Render root-level shapes (those without parents)
  shapeTree.forEach(node => {
    html += renderShapeNode(node, 2, shapesWithParents)
  })
  
  html += '</body>\n</html>'
  
  return html
}

// Detect parent-child relationships based on spatial containment
const detectNesting = (shapes: any[]): any[] => {
  // Filter out invalid shapes
  const validShapes = shapes.filter(shape => 
    shape && 
    shape.position && 
    shape.size && 
    typeof shape.position.x === 'number' && 
    typeof shape.position.y === 'number' &&
    typeof shape.size.width === 'number' && 
    typeof shape.size.height === 'number'
  )
  
  const sortedShapes = [...validShapes].sort((a, b) => a.zIndex - b.zIndex)
  
  return sortedShapes.map(shape => {
    // Find the best parent candidate
    const potentialParents = sortedShapes.filter(potentialParent => {
      if (potentialParent.id === shape.id) return false
      
      const parentLeft = potentialParent.position.x
      const parentTop = potentialParent.position.y
      const parentRight = parentLeft + potentialParent.size.width
      const parentBottom = parentTop + potentialParent.size.height
      
      const childLeft = shape.position.x
      const childTop = shape.position.y
      const childRight = childLeft + shape.size.width
      const childBottom = childTop + shape.size.height
      
      // Check if parent contains at least 50% of the child's area
      const childArea = shape.size.width * shape.size.height
      const overlapLeft = Math.max(parentLeft, childLeft)
      const overlapTop = Math.max(parentTop, childTop)
      const overlapRight = Math.min(parentRight, childRight)
      const overlapBottom = Math.min(parentBottom, childBottom)
      
      if (overlapRight <= overlapLeft || overlapBottom <= overlapTop) return false
      
      const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop)
      const overlapPercentage = overlapArea / childArea
      
      return overlapPercentage >= 0.5 // At least 50% overlap
    })
    
    // Choose the smallest parent that contains the shape
    const bestParent = potentialParents.length > 0 ? potentialParents.reduce((best, current) => {
      const bestArea = best.size.width * best.size.height
      const currentArea = current.size.width * current.size.height
      return currentArea < bestArea ? current : best
    }) : null
    
    return {
      ...shape,
      parentId: bestParent?.id || null
    }
  })
}

// Build a tree structure from shapes with parent relationships
const buildShapeTree = (shapes: any[]): any[] => {
  const shapeMap = new Map()
  const rootNodes: any[] = []
  
  // Create a map of all shapes
  shapes.forEach(shape => {
    if (shape && shape.id) {
      shapeMap.set(shape.id, { ...shape, children: [] })
    }
  })
  
  // Build parent-child relationships
  shapes.forEach(shape => {
    if (shape && shape.id) {
      if (shape.parentId) {
        const parent = shapeMap.get(shape.parentId)
        const child = shapeMap.get(shape.id)
        if (parent && child) {
          parent.children.push(child)
        }
      } else {
        const rootNode = shapeMap.get(shape.id)
        if (rootNode) {
          rootNodes.push(rootNode)
        }
      }
    }
  })
  
  return rootNodes
}

// Render a shape node and its children recursively
const renderShapeNode = (node: any, indentLevel: number, allShapes: any[]): string => {
  // Safety check for invalid nodes
  if (!node || !node.elementTag || !node.position || !node.size) {
    return ''
  }
  
  // Ensure node has all required properties
  const shape = ensureShapeProperties(node)
  
  const indent = '  '.repeat(indentLevel)
  
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
  
  // Build inline styles for comprehensive styling and typography
  let inlineStyles = ''
  
  // Basic styling
  if (shape.fillColor) {
    inlineStyles += `background-color: ${hexToRgba(shape.fillColor, shape.opacity || 1)}; `
  }
  if (shape.borderColor && shape.borderWidth) {
    inlineStyles += `border: ${shape.borderWidth}px ${shape.borderStyle || 'solid'} ${shape.borderColor}; `
  }
  if (shape.borderRadius !== undefined) {
    inlineStyles += `border-radius: ${shape.borderRadius}px; `
  }
  if (shape.zIndex !== undefined) {
    inlineStyles += `z-index: ${shape.zIndex}; `
  }
  
  // Box shadow
  if (shape.boxShadow && shape.boxShadow.enabled) {
    const shadow = shape.boxShadow
    inlineStyles += `box-shadow: ${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blurRadius}px ${shadow.spreadRadius}px ${shadow.color}; `
  }
  
  // Typography
  if (shape.typography) {
    const typo = shape.typography
    if (typo.fontFamily) inlineStyles += `font-family: ${typo.fontFamily}; `
    if (typo.fontSize) inlineStyles += `font-size: ${typo.fontSize}px; `
    if (typo.fontWeight) inlineStyles += `font-weight: ${typo.fontWeight}; `
    if (typo.fontColor) inlineStyles += `color: ${typo.fontColor}; `
    if (typo.textAlign) inlineStyles += `text-align: ${typo.textAlign}; `
    if (typo.lineHeight) inlineStyles += `line-height: ${typo.lineHeight}; `
    if (typo.letterSpacing) inlineStyles += `letter-spacing: ${typo.letterSpacing}px; `
    if (typo.textDecoration && typo.textDecoration !== 'none') inlineStyles += `text-decoration: ${typo.textDecoration}; `
    if (typo.textTransform && typo.textTransform !== 'none') inlineStyles += `text-transform: ${typo.textTransform}; `
  }
  
  // Add style attribute if we have styles
  if (inlineStyles.trim()) {
    attributes += ` style="${inlineStyles.trim()}"`
  }
  
  let html = `${indent}<${shape.elementTag}${attributes}>\n`
  
  // Add meaningful placeholder content based on element type
  const placeholderContent = getPlaceholderContent(shape.elementTag, shape.cssClasses, shape.elementId)
  if (placeholderContent) {
    html += `${indent}  ${placeholderContent}\n`
  }
  
  // Render children
  if (shape.children && shape.children.length > 0) {
    shape.children.forEach((child: any) => {
      html += renderShapeNode(child, indentLevel + 1, allShapes)
    })
  }
  
  html += `${indent}</${shape.elementTag}>\n`
  
  return html
}

// Generate meaningful placeholder content based on element type
const getPlaceholderContent = (elementTag: string, cssClasses: string, elementId: string): string => {
  const classes = cssClasses ? cssClasses.split(' ') : []
  
  // Check for specific class patterns
  if (classes.includes('title') || classes.includes('name')) {
    return `<!-- ${elementTag} title content -->`
  }
  
  if (classes.includes('stats')) {
    return `<!-- ${elementTag} statistics content -->`
  }
  
  if (classes.includes('list')) {
    return `<!-- ${elementTag} list items -->`
  }
  
  if (classes.includes('card')) {
    return `<!-- ${elementTag} card content -->`
  }
  
  // Element-specific content
  switch (elementTag) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return `<!-- ${elementTag} heading content -->`
    case 'nav':
      return `<!-- ${elementTag} navigation links -->`
    case 'main':
      return `<!-- ${elementTag} main content area -->`
    case 'section':
      return `<!-- ${elementTag} content section -->`
    case 'article':
      return `<!-- ${elementTag} article content -->`
    case 'header':
      return `<!-- ${elementTag} header content -->`
    case 'footer':
      return `<!-- ${elementTag} footer content -->`
    case 'aside':
      return `<!-- ${elementTag} sidebar content -->`
    case 'ul':
    case 'ol':
      return `<!-- ${elementTag} list items -->`
    case 'li':
      return `<!-- ${elementTag} list item content -->`
    case 'p':
      return `<!-- ${elementTag} paragraph content -->`
    case 'span':
      return `<!-- ${elementTag} inline content -->`
    case 'div':
      return `<!-- ${elementTag} container content -->`
    default:
      return `<!-- ${elementTag} content -->`
  }
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

// Convert flat shapes array to nested structure for better readability
export const convertToNestedStructure = (shapes: any[]): any => {
  // First, detect parent-child relationships based on spatial containment
  const shapesWithParents = detectNesting(shapes)
  
  // Build a tree structure
  const shapeTree = buildShapeTree(shapesWithParents)
  
  // Convert tree to nested object structure
  const convertNodeToNested = (node: any): any => {
    const nestedShape: any = {
      id: node.id,
      type: node.type,
      position: node.position,
      size: node.size,
      elementTag: node.elementTag,
      cssClasses: node.cssClasses,
      elementId: node.elementId,
      fillColor: node.fillColor,
      borderColor: node.borderColor,
      borderWidth: node.borderWidth,
      borderStyle: node.borderStyle,
      opacity: node.opacity,
      zIndex: node.zIndex
    }
    
    // Add children if they exist
    if (node.children && node.children.length > 0) {
      nestedShape.children = node.children.map((child: any) => convertNodeToNested(child))
    }
    
    return nestedShape
  }
  
  return shapeTree.map(node => convertNodeToNested(node))
}

// Convert nested structure back to flat array for canvas rendering
export const convertFromNestedStructure = (nestedShapes: any[]): any[] => {
  const flatShapes: any[] = []
  
  const flattenNode = (node: any, parentId?: string) => {
    const flatShape = {
      id: node.id,
      type: node.type,
      position: node.position,
      size: node.size,
      elementTag: node.elementTag,
      cssClasses: node.cssClasses,
      elementId: node.elementId,
      fillColor: node.fillColor,
      borderColor: node.borderColor,
      borderWidth: node.borderWidth,
      borderStyle: node.borderStyle,
      opacity: node.opacity,
      zIndex: node.zIndex,
      parentId: parentId || null
    }
    
    flatShapes.push(flatShape)
    
    // Process children
    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => {
        flattenNode(child, node.id)
      })
    }
  }
  
  nestedShapes.forEach(node => flattenNode(node))
  return flatShapes
}

// Save diagram as JSON file with nested structure
export const saveDiagram = (canvasState: any): void => {
  // Convert shapes to nested structure for better readability
  const nestedShapes = convertToNestedStructure(canvasState.shapes)
  
  const diagramData = {
    version: '1.1', // Updated version to indicate nested structure
    timestamp: new Date().toISOString(),
    canvasState: {
      ...canvasState,
      shapes: nestedShapes // Use nested structure instead of flat array
    }
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

// Load diagram from JSON file with support for both flat and nested structures
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
        
        const canvasState = diagramData.canvasState
        
        // Handle both old flat structure and new nested structure
        if (diagramData.version === '1.1' && Array.isArray(canvasState.shapes) && canvasState.shapes.length > 0 && canvasState.shapes[0].children !== undefined) {
          // New nested structure - convert back to flat for canvas rendering
          canvasState.shapes = convertFromNestedStructure(canvasState.shapes)
        }
        // Old flat structure (version 1.0) - use as is
        
        resolve(canvasState)
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

// Auto-save to localStorage with nested structure
export const autoSave = (canvasState: any): void => {
  try {
    // Convert shapes to nested structure for better readability
    const nestedShapes = convertToNestedStructure(canvasState.shapes)
    
    const autoSaveData = {
      version: '1.1', // Updated version to indicate nested structure
      timestamp: new Date().toISOString(),
      canvasState: {
        ...canvasState,
        shapes: nestedShapes // Use nested structure instead of flat array
      }
    }
    localStorage.setItem('diagram-autosave', JSON.stringify(autoSaveData))
  } catch (error) {
    console.warn('Failed to auto-save diagram:', error)
  }
}

// Load auto-saved diagram from localStorage with support for both structures
export const loadAutoSave = (): any | null => {
  try {
    const saved = localStorage.getItem('diagram-autosave')
    if (!saved) return null
    
    const autoSaveData = JSON.parse(saved)
    if (!autoSaveData.version || !autoSaveData.canvasState) {
      return null
    }
    
    const canvasState = autoSaveData.canvasState
    
    // Handle both old flat structure and new nested structure
    if (autoSaveData.version === '1.1' && Array.isArray(canvasState.shapes) && canvasState.shapes.length > 0 && canvasState.shapes[0].children !== undefined) {
      // New nested structure - convert back to flat for canvas rendering
      canvasState.shapes = convertFromNestedStructure(canvasState.shapes)
    }
    // Old flat structure (version 1.0) - use as is
    
    return canvasState
  } catch (error) {
    console.warn('Failed to load auto-saved diagram:', error)
    return null
  }
}

// Clear auto-saved diagram
export const clearAutoSave = (): void => {
  localStorage.removeItem('diagramAutoSave')
}

// Layer management functions
export const bringToFront = (shapes: any[], shapeId: string): any[] => {
  const maxZIndex = Math.max(...shapes.map(s => s.zIndex), 0)
  return shapes.map(shape => 
    shape.id === shapeId 
      ? { ...shape, zIndex: maxZIndex + 1 }
      : shape
  )
}

export const sendToBack = (shapes: any[], shapeId: string): any[] => {
  const minZIndex = Math.min(...shapes.map(s => s.zIndex), 0)
  return shapes.map(shape => 
    shape.id === shapeId 
      ? { ...shape, zIndex: minZIndex - 1 }
      : shape
  )
}

export const bringForward = (shapes: any[], shapeId: string): any[] => {
  const sortedShapes = [...shapes].sort((a, b) => a.zIndex - b.zIndex)
  const currentIndex = sortedShapes.findIndex(s => s.id === shapeId)
  
  if (currentIndex === -1 || currentIndex === sortedShapes.length - 1) {
    return shapes // Already at front or not found
  }
  
  const targetShape = sortedShapes[currentIndex]
  const nextShape = sortedShapes[currentIndex + 1]
  
  return shapes.map(shape => {
    if (shape.id === shapeId) {
      return { ...shape, zIndex: nextShape.zIndex + 1 }
    } else if (shape.id === nextShape.id) {
      return { ...shape, zIndex: targetShape.zIndex }
    }
    return shape
  })
}

export const sendBackward = (shapes: any[], shapeId: string): any[] => {
  const sortedShapes = [...shapes].sort((a, b) => a.zIndex - b.zIndex)
  const currentIndex = sortedShapes.findIndex(s => s.id === shapeId)
  
  if (currentIndex === -1 || currentIndex === 0) {
    return shapes // Already at back or not found
  }
  
  const targetShape = sortedShapes[currentIndex]
  const prevShape = sortedShapes[currentIndex - 1]
  
  return shapes.map(shape => {
    if (shape.id === shapeId) {
      return { ...shape, zIndex: prevShape.zIndex - 1 }
    } else if (shape.id === prevShape.id) {
      return { ...shape, zIndex: targetShape.zIndex }
    }
    return shape
  })
}

export const getLayerInfo = (shapes: any[], shapeId: string): { currentLayer: number; totalLayers: number; layerPosition: string } => {
  const sortedShapes = [...shapes].sort((a, b) => a.zIndex - b.zIndex)
  const currentIndex = sortedShapes.findIndex(s => s.id === shapeId)
  
  if (currentIndex === -1) {
    return { currentLayer: 0, totalLayers: shapes.length, layerPosition: 'Unknown' }
  }
  
  const totalLayers = sortedShapes.length
  const currentLayer = currentIndex + 1
  
  let layerPosition = 'Middle'
  if (currentLayer === 1) layerPosition = 'Bottom'
  else if (currentLayer === totalLayers) layerPosition = 'Top'
  
  return { currentLayer, totalLayers, layerPosition }
} 

// Enhanced nesting detection with visual feedback
export const findDropTarget = (shapes: Shape[], draggedShape: Shape, dropPoint: Point): {
  parentId: string | null
  isValid: boolean
  confidence: number
  previewPosition: Point
  reason?: string
} => {
  // Filter out the dragged shape and invalid shapes
  const potentialParents = shapes.filter(shape => 
    shape.id !== draggedShape.id &&
    shape && 
    shape.position && 
    shape.size && 
    typeof shape.position.x === 'number' && 
    typeof shape.position.y === 'number' &&
    typeof shape.size.width === 'number' && 
    typeof shape.size.height === 'number'
  )

  let bestTarget = {
    parentId: null as string | null,
    isValid: false,
    confidence: 0,
    previewPosition: dropPoint,
    reason: 'No suitable parent found'
  }

  potentialParents.forEach(parent => {
    const parentLeft = parent.position.x
    const parentTop = parent.position.y
    const parentRight = parentLeft + parent.size.width
    const parentBottom = parentTop + parent.size.height

    // More flexible bounds checking - allow some tolerance
    const tolerance = 5 // 5px tolerance for edge cases
    const isWithinBounds = dropPoint.x >= (parentLeft - tolerance) && 
                          dropPoint.x <= (parentRight + tolerance) && 
                          dropPoint.y >= (parentTop - tolerance) && 
                          dropPoint.y <= (parentBottom + tolerance)

    if (isWithinBounds) {
      // Calculate how well the dragged shape would fit
      const draggedShapeArea = draggedShape.size.width * draggedShape.size.height
      const parentArea = parent.size.width * parent.size.height
      
      // Calculate overlap if we place the shape at the drop point
      const overlapLeft = Math.max(parentLeft, dropPoint.x)
      const overlapTop = Math.max(parentTop, dropPoint.y)
      const overlapRight = Math.min(parentRight, dropPoint.x + draggedShape.size.width)
      const overlapBottom = Math.min(parentBottom, dropPoint.y + draggedShape.size.height)
      
      if (overlapRight > overlapLeft && overlapBottom > overlapTop) {
        const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop)
        const overlapPercentage = overlapArea / draggedShapeArea
        
        // More generous confidence calculation
        const sizeRatio = Math.min(draggedShapeArea / parentArea, parentArea / draggedShapeArea)
        const confidence = overlapPercentage * sizeRatio * 1.5 // Boost confidence by 50%
        
        if (confidence > bestTarget.confidence) {
          // Validate that this nesting would be valid
          const isValid = validateNesting(shapes, parent.id, draggedShape.id)
          
          bestTarget = {
            parentId: parent.id,
            isValid,
            confidence,
            previewPosition: {
              x: Math.max(parentLeft, Math.min(parentRight - draggedShape.size.width, dropPoint.x)),
              y: Math.max(parentTop, Math.min(parentBottom - draggedShape.size.height, dropPoint.y))
            },
            reason: isValid ? 'Valid nesting target' : 'Invalid nesting (circular reference)'
          }
        }
      } else {
        // Even if no overlap, still consider it if very close
        const distanceToParent = Math.min(
          Math.abs(dropPoint.x - parentLeft),
          Math.abs(dropPoint.x - parentRight),
          Math.abs(dropPoint.y - parentTop),
          Math.abs(dropPoint.y - parentBottom)
        )
        
        if (distanceToParent < 20) { // Within 20px
          const isValid = validateNesting(shapes, parent.id, draggedShape.id)
          const confidence = 0.1 // Low confidence but still valid
          
          if (confidence > bestTarget.confidence) {
            bestTarget = {
              parentId: parent.id,
              isValid,
              confidence,
              previewPosition: dropPoint,
              reason: isValid ? 'Close to parent boundary' : 'Invalid nesting'
            }
          }
        }
      }
    }
  })

  return bestTarget
}

// Real-time nesting validation
export const validateNesting = (shapes: Shape[], parentId: string, childId: string): boolean => {
  // Prevent self-nesting
  if (parentId === childId) return false
  
  // Check for circular references
  const checkCircularReference = (currentParentId: string, targetChildId: string): boolean => {
    if (currentParentId === targetChildId) return true
    
    const currentParent = shapes.find(s => s.id === currentParentId)
    if (!currentParent || !currentParent.parentId) return false
    
    return checkCircularReference(currentParent.parentId, targetChildId)
  }
  
  if (checkCircularReference(parentId, childId)) return false
  
  // Additional validation rules can be added here
  // For example, preventing nesting of certain shape types
  
  return true
}

// Get nesting indicators for visual display
export const getNestingIndicators = (shapes: Shape[]): Array<{
  parentId: string
  childIds: string[]
  level: number
}> => {
  const indicators: Array<{
    parentId: string
    childIds: string[]
    level: number
  }> = []
  
  const shapeMap = new Map<string, Shape>()
  shapes.forEach(shape => shapeMap.set(shape.id, shape))
  
  // Find all parent-child relationships
  shapes.forEach(shape => {
    if (shape.parentId) {
      const parent = shapeMap.get(shape.parentId)
      if (parent) {
        // Calculate nesting level
        let level = 0
        let currentParent = parent
        while (currentParent.parentId) {
          level++
          currentParent = shapeMap.get(currentParent.parentId)!
          if (!currentParent) break
        }
        
        // Add to indicators
        const existingIndicator = indicators.find(ind => ind.parentId === shape.parentId)
        if (existingIndicator) {
          existingIndicator.childIds.push(shape.id)
        } else {
          indicators.push({
            parentId: shape.parentId,
            childIds: [shape.id],
            level
          })
        }
      }
    }
  })
  
  return indicators
}

// Apply nesting relationship to shapes
export const applyNesting = (shapes: Shape[], childId: string, parentId: string | null): Shape[] => {
  return shapes.map(shape => 
    shape.id === childId 
      ? { ...shape, parentId: parentId || undefined }
      : shape
  )
}

// Get all children of a shape (recursive)
export const getChildren = (shapes: Shape[], parentId: string): Shape[] => {
  const directChildren = shapes.filter(shape => shape.parentId === parentId)
  const allChildren = [...directChildren]
  
  directChildren.forEach(child => {
    allChildren.push(...getChildren(shapes, child.id))
  })
  
  return allChildren
}

// Get all ancestors of a shape
export const getAncestors = (shapes: Shape[], shapeId: string): Shape[] => {
  const ancestors: Shape[] = []
  let currentShape = shapes.find(s => s.id === shapeId)
  
  while (currentShape && currentShape.parentId) {
    const parent = shapes.find(s => s.id === currentShape!.parentId)
    if (parent) {
      ancestors.unshift(parent)
      currentShape = parent
    } else {
      break
    }
  }
  
  return ancestors
} 