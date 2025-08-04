import { CanvasState, VersionHistory, VersionHistoryEntry, VersionHistoryAction } from '../types'

// Generate unique ID for version entries
const generateVersionId = (): string => {
  return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create a deep copy of canvas state to avoid reference issues
const deepCloneCanvasState = (canvasState: CanvasState): CanvasState => {
  return JSON.parse(JSON.stringify(canvasState))
}

// Initialize version history
export const initializeVersionHistory = (maxEntries: number = 50): VersionHistory => {
  return {
    entries: [],
    currentIndex: -1,
    maxEntries
  }
}

// Add a new version entry
export const addVersionEntry = (
  history: VersionHistory,
  canvasState: CanvasState,
  description: string,
  action: string = 'manual'
): VersionHistory => {
  const newEntry: VersionHistoryEntry = {
    id: generateVersionId(),
    timestamp: Date.now(),
    description,
    canvasState: deepCloneCanvasState(canvasState),
    action
  }

  // Remove any entries after current index (for redo functionality)
  const entries = history.entries.slice(0, history.currentIndex + 1)
  
  // Add new entry
  entries.push(newEntry)
  
  // Limit the number of entries
  if (entries.length > history.maxEntries) {
    entries.shift() // Remove oldest entry
  } else {
    // Only increment index if we didn't remove an entry
    history.currentIndex = entries.length - 1
  }

  return {
    ...history,
    entries,
    currentIndex: entries.length - 1
  }
}

// Undo to previous version
export const undoVersion = (history: VersionHistory): { history: VersionHistory; canvasState: CanvasState | null } => {
  if (history.currentIndex <= 0) {
    return { history, canvasState: null }
  }

  const newIndex = history.currentIndex - 1
  const targetEntry = history.entries[newIndex]

  return {
    history: {
      ...history,
      currentIndex: newIndex
    },
    canvasState: deepCloneCanvasState(targetEntry.canvasState)
  }
}

// Redo to next version
export const redoVersion = (history: VersionHistory): { history: VersionHistory; canvasState: CanvasState | null } => {
  if (history.currentIndex >= history.entries.length - 1) {
    return { history, canvasState: null }
  }

  const newIndex = history.currentIndex + 1
  const targetEntry = history.entries[newIndex]

  return {
    history: {
      ...history,
      currentIndex: newIndex
    },
    canvasState: deepCloneCanvasState(targetEntry.canvasState)
  }
}

// Jump to specific version
export const jumpToVersion = (history: VersionHistory, targetIndex: number): { history: VersionHistory; canvasState: CanvasState | null } => {
  if (targetIndex < 0 || targetIndex >= history.entries.length) {
    return { history, canvasState: null }
  }

  const targetEntry = history.entries[targetIndex]

  return {
    history: {
      ...history,
      currentIndex: targetIndex
    },
    canvasState: deepCloneCanvasState(targetEntry.canvasState)
  }
}

// Clear version history
export const clearVersionHistory = (history: VersionHistory): VersionHistory => {
  return {
    ...history,
    entries: [],
    currentIndex: -1
  }
}

// Get version history info
export const getVersionHistoryInfo = (history: VersionHistory) => {
  return {
    totalEntries: history.entries.length,
    currentIndex: history.currentIndex,
    canUndo: history.currentIndex > 0,
    canRedo: history.currentIndex < history.entries.length - 1,
    currentEntry: history.entries[history.currentIndex] || null,
    recentEntries: history.entries.slice(-10).reverse() // Last 10 entries
  }
}

// Save version history to localStorage
export const saveVersionHistory = (history: VersionHistory): void => {
  try {
    localStorage.setItem('diagram_version_history', JSON.stringify(history))
  } catch (error) {
    console.warn('Failed to save version history:', error)
  }
}

// Load version history from localStorage
export const loadVersionHistory = (): VersionHistory | null => {
  try {
    const saved = localStorage.getItem('diagram_version_history')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (error) {
    console.warn('Failed to load version history:', error)
  }
  return null
}

// Auto-save version history
export const autoSaveVersionHistory = (history: VersionHistory): void => {
  saveVersionHistory(history)
}

// Get formatted timestamp
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// Get time ago string
export const getTimeAgo = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return `${seconds} second${seconds > 1 ? 's' : ''} ago`
}

// Check if two canvas states are different
export const hasCanvasStateChanged = (state1: CanvasState, state2: CanvasState): boolean => {
  return JSON.stringify(state1) !== JSON.stringify(state2)
}

// Create a summary of changes between two states
export const getChangeSummary = (oldState: CanvasState, newState: CanvasState): string => {
  const changes: string[] = []
  
  // Check for shape changes
  if (oldState.shapes.length !== newState.shapes.length) {
    changes.push(`${newState.shapes.length - oldState.shapes.length > 0 ? 'Added' : 'Removed'} ${Math.abs(newState.shapes.length - oldState.shapes.length)} shape${Math.abs(newState.shapes.length - oldState.shapes.length) > 1 ? 's' : ''}`)
  }
  
  // Check for group changes
  if (oldState.groups.length !== newState.groups.length) {
    changes.push(`${newState.groups.length - oldState.groups.length > 0 ? 'Added' : 'Removed'} ${Math.abs(newState.groups.length - oldState.groups.length)} group${Math.abs(newState.groups.length - oldState.groups.length) > 1 ? 's' : ''}`)
  }
  
  // Check for canvas property changes
  if (oldState.zoom !== newState.zoom) changes.push('Zoom changed')
  if (oldState.pan.x !== newState.pan.x || oldState.pan.y !== newState.pan.y) changes.push('Canvas moved')
  if (oldState.gridSize !== newState.gridSize) changes.push('Grid size changed')
  if (oldState.showGrid !== newState.showGrid) changes.push('Grid visibility toggled')
  if (oldState.canvasBackgroundColor !== newState.canvasBackgroundColor) changes.push('Background color changed')
  
  return changes.length > 0 ? changes.join(', ') : 'Minor changes'
} 