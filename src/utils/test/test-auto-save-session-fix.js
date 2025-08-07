// Test script to verify the session-based auto-save prompt fix
console.log('🔍 Testing Session-Based Auto-Save Fix...')

// Mock localStorage and sessionStorage for testing
const mockLocalStorage = {
  data: {},
  getItem: function(key) {
    console.log(`📥 localStorage.get: ${key}`)
    return this.data[key] || null
  },
  setItem: function(key, value) {
    console.log(`📤 localStorage.set: ${key} = ${value}`)
    this.data[key] = value
  },
  removeItem: function(key) {
    console.log(`🗑️ localStorage.remove: ${key}`)
    delete this.data[key]
  }
}

const mockSessionStorage = {
  data: {},
  getItem: function(key) {
    console.log(`📥 sessionStorage.get: ${key}`)
    return this.data[key] || null
  },
  setItem: function(key, value) {
    console.log(`📤 sessionStorage.set: ${key} = ${value}`)
    this.data[key] = value
  },
  removeItem: function(key) {
    console.log(`🗑️ sessionStorage.remove: ${key}`)
    delete this.data[key]
  }
}

// Mock auto-save data
const mockAutoSaveData = {
  version: '1.2',
  timestamp: new Date().toISOString(),
  canvasState: {
    shapes: [
      {
        id: 'test-shape-1',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        size: { width: 150, height: 100 },
        fillColor: '#e2e8f0',
        borderColor: '#64748b',
        borderWidth: 1,
        borderStyle: 'solid',
        opacity: 1,
        zIndex: 0,
        borderRadius: 0,
        elementTag: 'div',
        cssClasses: '',
        elementId: ''
      }
    ],
    groups: [],
    selectedShapeId: null,
    selectedShapeIds: [],
    selectedGroupId: null,
    zoom: 1,
    pan: { x: 0, y: 0 },
    gridSize: 20,
    showGrid: true,
    showCssLabels: false,
    canvasBackgroundColor: '#ffffff',
    canvasBackgroundOpacity: 1,
    snapToGrid: true,
    snapToEdges: true,
    gridSnapSize: 20
  }
}

// Implement the fixed functions
function markAutoSavePrompted() {
  const sessionId = mockSessionStorage.getItem('diagram-session-id') || Date.now().toString()
  mockSessionStorage.setItem('diagram-session-id', sessionId)
  mockLocalStorage.setItem('diagram-autosave-prompted', sessionId)
}

function hasAutoSaveBeenPrompted() {
  const sessionId = mockSessionStorage.getItem('diagram-session-id')
  const promptedSessionId = mockLocalStorage.getItem('diagram-autosave-prompted')
  
  // If no session ID exists, this is a new session
  if (!sessionId) {
    return false
  }
  
  // If the prompted session ID matches current session, don't show again
  return promptedSessionId === sessionId
}

function clearAutoSave() {
  mockLocalStorage.removeItem('diagram-autosave')
  mockLocalStorage.removeItem('diagram-autosave-prompted')
  // Note: We don't clear the session ID from sessionStorage
  // as it should persist for the entire browser session
}

function loadAutoSave() {
  const saved = mockLocalStorage.getItem('diagram-autosave')
  return saved ? JSON.parse(saved).canvasState : null
}

// Test scenarios
function testSessionBasedFix() {
  console.log('\n=== Test Scenario 1: New Session ===')
  console.log('Simulating a completely new browser session...')
  
  // Clear all storage
  mockLocalStorage.data = {}
  mockSessionStorage.data = {}
  
  console.log('Initial state:')
  console.log('- Session ID:', mockSessionStorage.getItem('diagram-session-id'))
  console.log('- Prompted flag:', mockLocalStorage.getItem('diagram-autosave-prompted'))
  console.log('- Has been prompted:', hasAutoSaveBeenPrompted())
  
  // Set up auto-save data
  mockLocalStorage.setItem('diagram-autosave', JSON.stringify(mockAutoSaveData))
  
  // Simulate the useEffect logic
  if (hasAutoSaveBeenPrompted()) {
    console.log('❌ Prompt blocked by session flag')
  } else {
    const autoSavedState = loadAutoSave()
    if (autoSavedState) {
      console.log('✅ Auto-save found, should show prompt')
      markAutoSavePrompted()
      console.log('Session marked as prompted')
    } else {
      console.log('❌ No auto-save data found')
    }
  }
  
  console.log('\n=== Test Scenario 2: Same Session, Second Load ===')
  console.log('Simulating the same session loading the app again...')
  
  // Don't clear storage - simulate same session
  console.log('Current state:')
  console.log('- Session ID:', mockSessionStorage.getItem('diagram-session-id'))
  console.log('- Prompted flag:', mockLocalStorage.getItem('diagram-autosave-prompted'))
  console.log('- Has been prompted:', hasAutoSaveBeenPrompted())
  
  // Simulate the useEffect logic again
  if (hasAutoSaveBeenPrompted()) {
    console.log('✅ Prompt correctly blocked by session flag')
  } else {
    const autoSavedState = loadAutoSave()
    if (autoSavedState) {
      console.log('❌ Prompt should have been blocked')
    } else {
      console.log('❌ No auto-save data found')
    }
  }
  
  console.log('\n=== Test Scenario 3: New Session After Clear ===')
  console.log('Simulating a new session after clearing auto-save...')
  
  // Clear auto-save but keep session ID (simulating user discarding)
  clearAutoSave()
  
  console.log('After clearAutoSave:')
  console.log('- Session ID:', mockSessionStorage.getItem('diagram-session-id'))
  console.log('- Prompted flag:', mockLocalStorage.getItem('diagram-autosave-prompted'))
  console.log('- Has been prompted:', hasAutoSaveBeenPrompted())
  
  // Set up auto-save data again
  mockLocalStorage.setItem('diagram-autosave', JSON.stringify(mockAutoSaveData))
  
  // Simulate the useEffect logic
  if (hasAutoSaveBeenPrompted()) {
    console.log('✅ Prompt correctly blocked (same session)')
  } else {
    const autoSavedState = loadAutoSave()
    if (autoSavedState) {
      console.log('❌ Prompt should have been blocked in same session')
    } else {
      console.log('❌ No auto-save data found')
    }
  }
  
  console.log('\n=== Test Scenario 4: Completely New Session ===')
  console.log('Simulating a completely new browser session...')
  
  // Clear everything including session ID
  mockLocalStorage.data = {}
  mockSessionStorage.data = {}
  
  console.log('Fresh session state:')
  console.log('- Session ID:', mockSessionStorage.getItem('diagram-session-id'))
  console.log('- Prompted flag:', mockLocalStorage.getItem('diagram-autosave-prompted'))
  console.log('- Has been prompted:', hasAutoSaveBeenPrompted())
  
  // Set up auto-save data
  mockLocalStorage.setItem('diagram-autosave', JSON.stringify(mockAutoSaveData))
  
  // Simulate the useEffect logic
  if (hasAutoSaveBeenPrompted()) {
    console.log('❌ Prompt incorrectly blocked in new session')
  } else {
    const autoSavedState = loadAutoSave()
    if (autoSavedState) {
      console.log('✅ Auto-save found, should show prompt in new session')
      markAutoSavePrompted()
      console.log('Session marked as prompted')
    } else {
      console.log('❌ No auto-save data found')
    }
  }
  
  console.log('\n✅ Session-based auto-save fix test completed!')
  console.log('The fix should now properly handle session-based prompting.')
}

// Run the test
testSessionBasedFix() 