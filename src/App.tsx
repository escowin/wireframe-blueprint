import { useState, useRef, useEffect } from 'react'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import PropertiesPanel from './components/PropertiesPanel'
import { CanvasState, Shape, ToolType } from './types'
import { exportAsPNG, exportAsHTML, saveDiagram, loadDiagram, autoSave, loadAutoSave, clearAutoSave } from './utils/helpers'
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

  // Load auto-saved diagram on app start
  useEffect(() => {
    const autoSavedState = loadAutoSave()
    if (autoSavedState) {
      const shouldRestore = window.confirm('Found an auto-saved diagram. Would you like to restore it?')
      if (shouldRestore) {
        setCanvasState(autoSavedState)
      } else {
        clearAutoSave()
      }
    }
  }, [])

  // Auto-save diagram every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      autoSave(canvasState)
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [canvasState])

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
      setCanvasState(loadedCanvasState)
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
          canvasState={canvasState}
          onCanvasUpdate={handleCanvasUpdate}
        />
      </div>
    </div>
  )
}

export default App 