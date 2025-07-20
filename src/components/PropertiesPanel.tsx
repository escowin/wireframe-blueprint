import React from 'react'
import { Shape } from '../types'
import './PropertiesPanel.scss'

interface PropertiesPanelProps {
  selectedShape?: Shape | null
  onShapeUpdate?: (shape: Shape) => void
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedShape,
  onShapeUpdate
}) => {
  if (!selectedShape) {
    return (
      <div className="properties-panel">
        <div className="properties-empty">
          <p>Select a shape to edit its properties</p>
        </div>
      </div>
    )
  }

  const handlePropertyChange = (property: keyof Shape, value: any) => {
    if (!onShapeUpdate) return
    
    const updatedShape = {
      ...selectedShape,
      [property]: value
    }
    onShapeUpdate(updatedShape)
  }

  const elementTags = [
    'div', 'main', 'section', 'header', 'nav', 'aside', 'footer', 'article'
  ]

  const borderStyles = ['solid', 'dotted', 'dashed']

  return (
    <div className="properties-panel">
      <div className="properties-header">
        <h3>Properties</h3>
        <span className="shape-type">{selectedShape.type}</span>
      </div>

      <div className="properties-content">
        <div className="property-group">
          <label className="property-label">Element Tag</label>
          <select
            className="select"
            value={selectedShape.elementTag}
            onChange={(e) => handlePropertyChange('elementTag', e.target.value)}
          >
            {elementTags.map(tag => (
              <option key={tag} value={tag}>
                &lt;{tag}&gt;
              </option>
            ))}
          </select>
        </div>

        <div className="property-group">
          <label className="property-label">Fill Color</label>
          <input
            type="color"
            className="input color-input"
            value={selectedShape.fillColor}
            onChange={(e) => handlePropertyChange('fillColor', e.target.value)}
          />
        </div>

        <div className="property-group">
          <label className="property-label">Border Color</label>
          <input
            type="color"
            className="input color-input"
            value={selectedShape.borderColor}
            onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
          />
        </div>

        <div className="property-group">
          <label className="property-label">Border Width</label>
          <input
            type="range"
            className="input range-input"
            min="0"
            max="10"
            value={selectedShape.borderWidth}
            onChange={(e) => handlePropertyChange('borderWidth', parseInt(e.target.value))}
          />
          <span className="range-value">{selectedShape.borderWidth}px</span>
        </div>

        <div className="property-group">
          <label className="property-label">Border Style</label>
          <select
            className="select"
            value={selectedShape.borderStyle}
            onChange={(e) => handlePropertyChange('borderStyle', e.target.value)}
          >
            {borderStyles.map(style => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </div>

        <div className="property-group">
          <label className="property-label">Position</label>
          <div className="position-inputs">
            <div className="position-input">
              <label>X</label>
              <input
                type="number"
                className="input"
                value={Math.round(selectedShape.position.x)}
                onChange={(e) => handlePropertyChange('position', {
                  ...selectedShape.position,
                  x: parseInt(e.target.value) || 0
                })}
              />
            </div>
            <div className="position-input">
              <label>Y</label>
              <input
                type="number"
                className="input"
                value={Math.round(selectedShape.position.y)}
                onChange={(e) => handlePropertyChange('position', {
                  ...selectedShape.position,
                  y: parseInt(e.target.value) || 0
                })}
              />
            </div>
          </div>
        </div>

        <div className="property-group">
          <label className="property-label">Size</label>
          <div className="size-inputs">
            <div className="size-input">
              <label>Width</label>
              <input
                type="number"
                className="input"
                value={Math.round(selectedShape.size.width)}
                onChange={(e) => handlePropertyChange('size', {
                  ...selectedShape.size,
                  width: parseInt(e.target.value) || 0
                })}
              />
            </div>
            <div className="size-input">
              <label>Height</label>
              <input
                type="number"
                className="input"
                value={Math.round(selectedShape.size.height)}
                onChange={(e) => handlePropertyChange('size', {
                  ...selectedShape.size,
                  height: parseInt(e.target.value) || 0
                })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertiesPanel 