import { useState, useRef } from 'react'
import Canvas from './components/Canvas'
import Toolbar from './components/Toolbar'
import PropertiesPanel from './components/PropertiesPanel'
import { CanvasState, Shape, ToolType } from './types'
import { exportAsPNG, exportAsHTML } from './utils/helpers'
import './App.scss'

function App() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasState, setCanvasState] = useState<CanvasState>({
    shapes: [],
    selectedShapeId: null,
    zoom: 1,
    pan: { x: 0, y: 0 },
    gridSize: 20,
    showGrid: true
  })
  const [currentTool, setCurrentTool] = useState<ToolType>('select')

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

  const handleExportPNG = () => {
    if (canvasRef.current) {
      exportAsPNG(canvasRef.current)
    }
  }

  const handleExportHTML = () => {
    exportAsHTML(canvasState.shapes)
  }

  return (
    <div className="app">
      <Toolbar 
        currentTool={currentTool}
        onToolChange={handleToolChange}
        onExportPNG={handleExportPNG}
        onExportHTML={handleExportHTML}
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
        />
      </div>
    </div>
  )
}

export default App 