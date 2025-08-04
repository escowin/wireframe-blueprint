import { Shape, Point, Group } from '../types'

export interface Viewport {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

export interface VirtualizationConfig {
  bufferSize: number // Extra pixels to render outside viewport
  minShapeSize: number // Minimum shape size to consider for virtualization
}

/**
 * Calculate the current viewport based on canvas dimensions, zoom, and pan
 */
export const calculateViewport = (
  canvasWidth: number,
  canvasHeight: number,
  zoom: number,
  pan: Point,
  bufferSize: number = 200
): Viewport => {
  const left = -pan.x / zoom - bufferSize
  const top = -pan.y / zoom - bufferSize
  const right = (-pan.x + canvasWidth) / zoom + bufferSize
  const bottom = (-pan.y + canvasHeight) / zoom + bufferSize

  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top
  }
}

/**
 * Check if a shape is visible within the viewport
 */
export const isShapeVisible = (shape: Shape, viewport: Viewport): boolean => {
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
}

/**
 * Check if a group is visible within the viewport
 */
export const isGroupVisible = (group: Group, viewport: Viewport): boolean => {
  const groupLeft = group.position.x
  const groupTop = group.position.y
  const groupRight = group.position.x + group.size.width
  const groupBottom = group.position.y + group.size.height

  return (
    groupRight >= viewport.left &&
    groupLeft <= viewport.right &&
    groupBottom >= viewport.top &&
    groupTop <= viewport.bottom
  )
}

/**
 * Get shapes that are currently visible in the viewport
 */
export const getVisibleShapes = (
  shapes: Shape[],
  viewport: Viewport,
  config: VirtualizationConfig = { bufferSize: 200, minShapeSize: 10 }
): Shape[] => {
  return shapes.filter(shape => {
    // Always include shapes that are too small to virtualize effectively
    if (shape.size.width < config.minShapeSize || shape.size.height < config.minShapeSize) {
      return true
    }
    
    return isShapeVisible(shape, viewport)
  })
}

/**
 * Get groups that are currently visible in the viewport
 */
export const getVisibleGroups = (
  groups: Group[],
  viewport: Viewport,
  config: VirtualizationConfig = { bufferSize: 200, minShapeSize: 10 }
): Group[] => {
  return groups.filter(group => {
    // Always include groups that are too small to virtualize effectively
    if (group.size.width < config.minShapeSize || group.size.height < config.minShapeSize) {
      return true
    }
    
    return isGroupVisible(group, viewport)
  })
}

/**
 * Get shapes that should be rendered based on visibility and selection state
 * This ensures selected shapes are always rendered even if outside viewport
 */
export const getShapesToRender = (
  shapes: Shape[],
  viewport: Viewport,
  selectedShapeIds: string[],
  selectedShapeId: string | null,
  config: VirtualizationConfig = { bufferSize: 200, minShapeSize: 10 }
): Shape[] => {
  const visibleShapes = getVisibleShapes(shapes, viewport, config)
  
  // Always include selected shapes, even if outside viewport
  const selectedShapes = shapes.filter(shape => 
    selectedShapeIds.includes(shape.id) || shape.id === selectedShapeId
  )
  
  // Combine visible and selected shapes, removing duplicates
  const allShapesToRender = [...visibleShapes, ...selectedShapes]
  const uniqueShapes = allShapesToRender.filter((shape, index, self) => 
    index === self.findIndex(s => s.id === shape.id)
  )
  
  return uniqueShapes
}

/**
 * Get groups that should be rendered based on visibility and selection state
 */
export const getGroupsToRender = (
  groups: Group[],
  viewport: Viewport,
  selectedGroupId: string | null,
  config: VirtualizationConfig = { bufferSize: 200, minShapeSize: 10 }
): Group[] => {
  const visibleGroups = getVisibleGroups(groups, viewport, config)
  
  // Always include selected group, even if outside viewport
  const selectedGroup = selectedGroupId ? groups.find(g => g.id === selectedGroupId) : null
  
  if (selectedGroup && !visibleGroups.find(g => g.id === selectedGroup.id)) {
    return [...visibleGroups, selectedGroup]
  }
  
  return visibleGroups
}

/**
 * Performance monitoring for virtualization
 */
export const createVirtualizationStats = () => {
  let totalShapes = 0
  let renderedShapes = 0
  let totalGroups = 0
  let renderedGroups = 0
  let lastUpdateTime = 0

  return {
    update: (stats: {
      totalShapes: number
      renderedShapes: number
      totalGroups: number
      renderedGroups: number
    }) => {
      totalShapes = stats.totalShapes
      renderedShapes = stats.renderedShapes
      totalGroups = stats.totalGroups
      renderedGroups = stats.renderedGroups
      lastUpdateTime = Date.now()
    },
    
    getStats: () => ({
      totalShapes,
      renderedShapes,
      totalGroups,
      renderedGroups,
      shapeReduction: totalShapes > 0 ? ((totalShapes - renderedShapes) / totalShapes * 100).toFixed(1) : '0',
      groupReduction: totalGroups > 0 ? ((totalGroups - renderedGroups) / totalGroups * 100).toFixed(1) : '0',
      lastUpdateTime
    }),
    
    logStats: function() {
      const stats = this.getStats()
      console.log(`Virtualization Stats: ${stats.renderedShapes}/${stats.totalShapes} shapes (${stats.shapeReduction}% reduction), ${stats.renderedGroups}/${stats.totalGroups} groups (${stats.groupReduction}% reduction)`)
    }
  }
} 