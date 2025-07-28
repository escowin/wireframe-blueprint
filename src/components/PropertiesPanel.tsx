import React from 'react'
import { Shape } from '../types'
import { hexToRgba } from '../utils/helpers'
import './PropertiesPanel.scss'

interface PropertiesPanelProps {
  selectedShape?: Shape | null
  onShapeUpdate?: (shape: Shape) => void
  canvasState?: any
  onCanvasUpdate?: (updates: any) => void
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedShape,
  onShapeUpdate,
  canvasState,
  onCanvasUpdate
}) => {
  if (!selectedShape) {
    return (
      <div className="properties-panel">
        <div className="properties-header">
          <h3>Canvas Properties</h3>
        </div>
        <div className="properties-content">
          <div className="property-group">
            <label className="property-label">Background Color</label>
            <input
              type="color"
              className="input color-input"
              value={canvasState?.canvasBackgroundColor || '#ffffff'}
              onChange={(e) => onCanvasUpdate?.({ canvasBackgroundColor: e.target.value })}
            />
          </div>
          <div className="property-group">
            <label className="property-label">Background Opacity</label>
            <div className="opacity-control">
              <input
                type="range"
                className="input range-input"
                min="0"
                max="1"
                step="0.1"
                value={canvasState?.canvasBackgroundOpacity || 1}
                onChange={(e) => onCanvasUpdate?.({ canvasBackgroundOpacity: parseFloat(e.target.value) })}
              />
                             <div 
                 className="opacity-preview"
                 style={{
                   backgroundColor: hexToRgba(canvasState?.canvasBackgroundColor || '#ffffff', canvasState?.canvasBackgroundOpacity || 1)
                 }}
               />
              <span className="range-value">{Math.round((canvasState?.canvasBackgroundOpacity || 1) * 100)}%</span>
            </div>
          </div>
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
    // Semantic
    'div', 'main', 'section', 'header', 'nav', 'aside', 'footer', 'article', 'span',
    // Form Elements
    'form', 'button', 'input', 'label', 'textarea', 'select', 'option', 'fieldset', 'legend', 'checkbox', 'radio',
    // Lists
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    // Text
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'mark', 'small', 'sub', 'sup',
    // Media
    'img', 'video', 'audio', 'figure', 'figcaption',
    // Table
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
    // Interactive
    'details', 'summary', 'dialog', 'menu',
    // Data
    'data', 'time', 'code', 'pre', 'kbd', 'samp', 'var',
    // Links
    'a', 'link',
    // Meta
    'meta', 'title', 'style', 'script'
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
          <label className="property-label">CSS Classes</label>
          <input
            type="text"
            className="input"
            placeholder="e.g., container, wrapper, button-primary"
            value={selectedShape.cssClasses}
            onChange={(e) => handlePropertyChange('cssClasses', e.target.value)}
          />
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
          <label className="property-label">Opacity</label>
          <div className="opacity-control">
            <input
              type="range"
              className="input range-input"
              min="0"
              max="1"
              step="0.1"
              value={selectedShape.opacity}
              onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
            />
                         <div 
               className="opacity-preview"
               style={{
                 backgroundColor: hexToRgba(selectedShape.fillColor, selectedShape.opacity),
                 border: `1px solid ${selectedShape.borderColor}`
               }}
             />
            <span className="range-value">{Math.round(selectedShape.opacity * 100)}%</span>
          </div>
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