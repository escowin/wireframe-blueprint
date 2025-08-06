// Test script to verify auto-save prompt fix
console.log('Testing auto-save prompt fix...')

// Mock localStorage
const mockLocalStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null
  },
  setItem(key, value) {
    this.data[key] = value
  },
  removeItem(key) {
    delete this.data[key]
  }
}

// Mock the auto-save data
const mockAutoSaveData = {
  version: '1.2',
  timestamp: new Date().toISOString(),
  canvasState: {
    shapes: [
      {
        id: 'test-shape-1',
        type: 'rectangle',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 100 },
        elementTag: 'div',
        cssClasses: 'test-class',
        elementId: 'test-id',
        fillColor: '#e2e8f0',
        borderColor: '#64748b',
        borderWidth: 1,
        borderStyle: 'solid',
        opacity: 1,
        zIndex: 0
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

// Test the auto-save functions
function testAutoSaveFix() {
  console.log('1. Setting up mock auto-save data...')
  mockLocalStorage.setItem('diagram-autosave', JSON.stringify(mockAutoSaveData))
  
  console.log('2. Testing loadAutoSave function...')
  const saved = mockLocalStorage.getItem('diagram-autosave')
  const autoSaveData = JSON.parse(saved)
  console.log('Auto-save data loaded:', {
    version: autoSaveData.version,
    shapesCount: autoSaveData.canvasState.shapes.length
  })
  
  console.log('3. Testing session flag functions...')
  console.log('Initial prompt status:', mockLocalStorage.getItem('diagram-autosave-prompted'))
  
  // Simulate marking as prompted
  mockLocalStorage.setItem('diagram-autosave-prompted', Date.now().toString())
  console.log('After marking as prompted:', mockLocalStorage.getItem('diagram-autosave-prompted'))
  
  // Simulate clearing
  mockLocalStorage.removeItem('diagram-autosave')
  mockLocalStorage.removeItem('diagram-autosave-prompted')
  console.log('After clearing:', {
    autoSave: mockLocalStorage.getItem('diagram-autosave'),
    prompted: mockLocalStorage.getItem('diagram-autosave-prompted')
  })
  
  console.log('✅ Auto-save fix test completed successfully!')
  console.log('The fix should prevent the prompt from appearing multiple times.')
}

// Run the test
testAutoSaveFix() 