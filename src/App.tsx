import { useState, useRef, useEffect } from 'react'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import PropertiesPanel from './components/PropertiesPanel'
import { CanvasState, Shape, ToolType } from './types'
import { exportAsPNG, exportAsHTML, saveDiagram, loadDiagram, autoSave, loadAutoSave, clearAutoSave, bringToFront, sendToBack, bringForward, sendBackward, checkLocalStorageUsage, validateAndFixShapes } from './utils/helpers'
import './App.scss'

function App() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasState, setCanvasState] = useState<CanvasState>({
    shapes: [],
    selectedShapeId: null,
    zoom: 1,
    pan: { x: 0, y: 0 },
    gridSize: 20,
    showGrid: true,
    showCssLabels: false,
    canvasBackgroundColor: '#ffffff',
    canvasBackgroundOpacity: 1
  })
  const [currentTool, setCurrentTool] = useState<ToolType>('select')
  const [storageUsage, setStorageUsage] = useState<{ used: number; total: number; available: number; percentage: number } | null>(null)

  // Load auto-saved diagram on app start
  useEffect(() => {
    const autoSavedState = loadAutoSave()
    if (autoSavedState) {
      const shouldRestore = window.confirm('Found an auto-saved diagram. Would you like to restore it?')
      if (shouldRestore) {
        setCanvasState(migrateCanvasState(autoSavedState))
      } else {
        clearAutoSave()
      }
    }
  }, [])

  // Check storage usage on mount and after auto-save
  useEffect(() => {
    const checkStorage = () => {
      const usage = checkLocalStorageUsage()
      setStorageUsage(usage)
      
      if (usage.percentage > 80) {
        console.warn(`localStorage is ${usage.percentage.toFixed(1)}% full. Consider clearing browser data.`)
      }
    }
    
    checkStorage()
    
    // Check storage usage every minute
    const interval = setInterval(checkStorage, 60000)
    return () => clearInterval(interval)
  }, [])

  // Auto-save diagram every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      autoSave(canvasState)
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [canvasState])

  // Migration function to handle existing shapes without new properties
  const migrateCanvasState = (canvasState: any): CanvasState => {
    return {
      ...canvasState,
      shapes: canvasState.shapes.map((shape: any) => ({
        ...shape,
        elementId: shape.elementId || '', // Add elementId if missing
        cssClasses: shape.cssClasses || '', // Ensure cssClasses is defined
        borderRadius: shape.borderRadius ?? 0, // Add border radius if missing
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
      }))
    }
  }

  const handleToolChange = (tool: ToolType) => {
    console.log('Tool changed to:', tool)
    setCurrentTool(tool)
  }

  const selectedShape = canvasState.shapes.find(shape => shape.id === canvasState.selectedShapeId) || null

  const handleShapeUpdate = (updatedShape: Shape) => {
    setCanvasState(prev => ({
      ...prev,
      shapes: prev.shapes.map(shape => 
        shape.id === updatedShape.id ? updatedShape : shape
      )
    }))
  }

  const handleShapesUpdate = (updatedShapes: Shape[]) => {
    setCanvasState(prev => ({
      ...prev,
      shapes: updatedShapes
    }))
  }

  const handleLayerAction = (action: 'front' | 'back' | 'forward' | 'backward') => {
    if (!selectedShape) return
    
    let updatedShapes: Shape[]
    
    switch (action) {
      case 'front':
        updatedShapes = bringToFront(canvasState.shapes, selectedShape.id)
        break
      case 'back':
        updatedShapes = sendToBack(canvasState.shapes, selectedShape.id)
        break
      case 'forward':
        updatedShapes = bringForward(canvasState.shapes, selectedShape.id)
        break
      case 'backward':
        updatedShapes = sendBackward(canvasState.shapes, selectedShape.id)
        break
      default:
        return
    }
    
    setCanvasState(prev => ({
      ...prev,
      shapes: updatedShapes
    }))
  }

  const handleCanvasUpdate = (updates: any) => {
    setCanvasState(prev => ({
      ...prev,
      ...updates
    }))
  }

  const handleExportPNG = () => {
    if (canvasRef.current) {
      exportAsPNG(canvasRef.current)
    }
  }

  const handleExportHTML = () => {
    exportAsHTML(canvasState.shapes)
  }

  const handleSave = () => {
    saveDiagram(canvasState)
    clearAutoSave() // Clear auto-save after manual save
  }

  const handleLoad = async (file: File) => {
    try {
      const loadedCanvasState = await loadDiagram(file)
      setCanvasState(migrateCanvasState(loadedCanvasState))
    } catch (error) {
      console.error('Failed to load diagram:', error)
      alert('Failed to load diagram. Please make sure you selected a valid diagram file.')
    }
  }

  const handleToggleCssLabels = () => {
    setCanvasState(prev => ({
      ...prev,
      showCssLabels: !prev.showCssLabels
    }))
  }

  return (
    <div className="app">
      <Toolbar 
        currentTool={currentTool}
        onToolChange={handleToolChange}
        onExportPNG={handleExportPNG}
        onExportHTML={handleExportHTML}
        onSave={handleSave}
        onLoad={handleLoad}
        showCssLabels={canvasState.showCssLabels}
        onToggleCssLabels={handleToggleCssLabels}
        selectedShape={selectedShape}
        onLayerAction={handleLayerAction}
      />
      <div className="app-main">
        <Canvas 
          ref={canvasRef}
          canvasState={canvasState}
          setCanvasState={setCanvasState}
          currentTool={currentTool}
        />
        <PropertiesPanel 
          selectedShape={selectedShape}
          onShapeUpdate={handleShapeUpdate}
          onShapesUpdate={handleShapesUpdate}
          canvasState={canvasState}
          onCanvasUpdate={handleCanvasUpdate}
        />
      </div>
      {storageUsage && (
        <div className="storage-indicator" style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: storageUsage.percentage > 80 ? '#ff6b6b' : '#51cf66',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          Storage: {storageUsage.percentage.toFixed(1)}% used
          {storageUsage.percentage > 80 && (
            <div style={{ fontSize: '10px', marginTop: '2px' }}>
              Consider clearing browser data
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App 