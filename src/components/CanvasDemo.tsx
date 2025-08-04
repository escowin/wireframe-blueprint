import React, { useState, useEffect } from 'react'
import { CanvasState, Shape } from '../types'
import { generateId } from '../utils/helpers'
import CanvasRenderer from './CanvasRenderer'

const CanvasDemo: React.FC = () => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    shapes: [],
    groups: [],
    selectedShapeId: null,
    selectedShapeIds: [],
    selectedGroupId: null,
    zoom: 1,
    pan: { x: 0, y: 0 },
    gridSize: 20,
    showGrid: true,
    showCssLabels: false,
    canvasBackgroundColor: '#f8f9fa',
    canvasBackgroundOpacity: 1,
    snapToGrid: true,
    snapToEdges: true,
    gridSnapSize: 20
  })

  // Create demo shapes
  useEffect(() => {
    const demoShapes: Shape[] = [
      {
        id: generateId(),
        type: 'rectangle',
        position: { x: 50, y: 50 },
        size: { width: 120, height: 80 },
        elementTag: 'div',
        elementId: 'header',
        cssClasses: 'header-container',
        fillColor: '#3b82f6',
        borderColor: '#1d4ed8',
        borderWidth: 2,
        borderStyle: 'solid',
        opacity: 0.9,
        zIndex: 1,
        borderRadius: 8,
        boxShadow: {
          offsetX: 2,
          offsetY: 4,
          blurRadius: 8,
          spreadRadius: 0,
          color: 'rgba(0, 0, 0, 0.2)',
          enabled: true
        },
        typography: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 16,
          fontWeight: 'bold',
          fontColor: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.2,
          letterSpacing: 0,
          textDecoration: 'none',
          textTransform: 'uppercase'
        }
      },
      {
        id: generateId(),
        type: 'circle',
        position: { x: 250, y: 100 },
        size: { width: 100, height: 100 },
        elementTag: 'div',
        elementId: 'avatar',
        cssClasses: 'user-avatar',
        fillColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 3,
        borderStyle: 'solid',
        opacity: 0.8,
        zIndex: 2,
        borderRadius: 0,
        boxShadow: {
          offsetX: 0,
          offsetY: 2,
          blurRadius: 6,
          spreadRadius: 0,
          color: 'rgba(0, 0, 0, 0.15)',
          enabled: true
        },
        typography: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 14,
          fontWeight: 'normal',
          fontColor: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.2,
          letterSpacing: 0,
          textDecoration: 'none',
          textTransform: 'none'
        }
      },
      {
        id: generateId(),
        type: 'rectangle',
        position: { x: 50, y: 200 },
        size: { width: 300, height: 150 },
        elementTag: 'div',
        elementId: 'content',
        cssClasses: 'main-content',
        fillColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderStyle: 'solid',
        opacity: 1,
        zIndex: 0,
        borderRadius: 12,
        boxShadow: {
          offsetX: 0,
          offsetY: 4,
          blurRadius: 12,
          spreadRadius: 0,
          color: 'rgba(0, 0, 0, 0.1)',
          enabled: true
        },
        typography: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 14,
          fontWeight: 'normal',
          fontColor: '#374151',
          textAlign: 'left',
          lineHeight: 1.5,
          letterSpacing: 0,
          textDecoration: 'none',
          textTransform: 'none'
        }
      },
      {
        id: generateId(),
        type: 'rectangle',
        position: { x: 400, y: 50 },
        size: { width: 80, height: 40 },
        elementTag: 'button',
        elementId: 'submit',
        cssClasses: 'btn btn-primary',
        fillColor: '#ef4444',
        borderColor: '#dc2626',
        borderWidth: 1,
        borderStyle: 'solid',
        opacity: 0.9,
        zIndex: 3,
        borderRadius: 6,
        boxShadow: {
          offsetX: 0,
          offsetY: 2,
          blurRadius: 4,
          spreadRadius: 0,
          color: 'rgba(0, 0, 0, 0.1)',
          enabled: true
        },
        typography: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 12,
          fontWeight: 'bold',
          fontColor: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.2,
          letterSpacing: 0,
          textDecoration: 'none',
          textTransform: 'uppercase'
        }
      }
    ]

    setCanvasState(prev => ({
      ...prev,
      shapes: demoShapes
    }))
  }, [])

  const handleCanvasClick = (point: { x: number; y: number }) => {
    console.log('Canvas clicked at:', point)
  }

  const handleShapeClick = (shapeId: string, point: { x: number; y: number }) => {
    console.log('Shape clicked:', shapeId, 'at:', point)
    setCanvasState(prev => ({
      ...prev,
      selectedShapeId: shapeId,
      selectedShapeIds: [shapeId]
    }))
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#1f2937', marginBottom: '10px' }}>Canvas-Based Rendering Demo</h1>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          This demo showcases the new HTML5 Canvas-based rendering with advanced features:
        </p>
        <ul style={{ color: '#6b7280', marginBottom: '20px' }}>
          <li>Gradient fills for larger shapes</li>
          <li>Pattern fills for complex shapes</li>
          <li>Enhanced text rendering with backgrounds</li>
          <li>Text decorations (underline, line-through)</li>
          <li>Improved shadows and effects</li>
          <li>Better performance for complex diagrams</li>
        </ul>
      </div>
      
      <div style={{ 
        border: '2px solid #e5e7eb', 
        borderRadius: '8px', 
        overflow: 'hidden',
        backgroundColor: '#ffffff'
      }}>
        <CanvasRenderer
          canvasState={canvasState}
          width={800}
          height={500}
          onCanvasClick={handleCanvasClick}
          onShapeClick={handleShapeClick}
          className="demo-canvas"
        />
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>Features Demonstrated:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <strong>Header Container:</strong> Blue rectangle with gradient fill, shadow, and uppercase text
          </div>
          <div>
            <strong>User Avatar:</strong> Green circle with pattern fill and shadow effects
          </div>
          <div>
            <strong>Content Area:</strong> White rectangle with subtle shadow and clean typography
          </div>
          <div>
            <strong>Submit Button:</strong> Red button with solid fill and uppercase text
          </div>
        </div>
      </div>
    </div>
  )
}

export default CanvasDemo 