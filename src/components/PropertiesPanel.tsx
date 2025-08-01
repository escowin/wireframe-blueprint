import React from 'react'
import { Shape } from '../types'
import { hexToRgba, getLayerInfo, bringToFront, sendToBack, bringForward, sendBackward, getChildren, getAncestors, applyNesting } from '../utils/helpers'
import './PropertiesPanel.scss'

interface PropertiesPanelProps {
  selectedShape?: Shape | null
  onShapeUpdate?: (shape: Shape) => void
  canvasState?: any
  onCanvasUpdate?: (updates: any) => void
  onShapesUpdate?: (shapes: Shape[]) => void
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedShape,
  onShapeUpdate,
  canvasState,
  onCanvasUpdate,
  onShapesUpdate
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
    if (!selectedShape || !onShapeUpdate) return

    // Validate CSS selector syntax only for non-empty values
    if (property === 'elementId') {
      // ID validation: must start with letter, can contain letters, numbers, hyphens, underscores
      // Allow empty values, only validate if there's content
      if (value && value.trim() !== '') {
        const idRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/
        if (!idRegex.test(value)) {
          // Don't update if invalid - could show error message here
          return
        }
      }
    }

    if (property === 'cssClasses') {
      // Class validation: allow typing freely, only validate final result
      // Allow empty values, only validate if there's content
      if (value && value.trim() !== '') {
        // Clean the value: trim and normalize spaces
        const cleanedValue = value.trim().replace(/\s+/g, ' ')
        
        // Split by spaces and validate each class individually
        const classes = cleanedValue.split(' ').filter((cls: string) => cls.trim() !== '')
        const isValid = classes.every((cls: string) => /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(cls))
        
        if (!isValid) {
          // Don't update if invalid - could show error message here
          return
        }
        
        // Use the cleaned value (normalized spaces)
        const updatedShape = { ...selectedShape, [property]: cleanedValue }
        onShapeUpdate(updatedShape)
        return
      }
    }

    const updatedShape = { ...selectedShape, [property]: value }
    onShapeUpdate(updatedShape)
  }

  const handleLayerAction = (action: 'front' | 'back' | 'forward' | 'backward') => {
    if (!selectedShape || !canvasState?.shapes || !onShapesUpdate) return

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
    
    onShapesUpdate(updatedShapes)
  }

  const layerInfo = selectedShape && canvasState?.shapes 
    ? getLayerInfo(canvasState.shapes, selectedShape.id)
    : { currentLayer: 0, totalLayers: 0, layerPosition: 'Unknown' }

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
          <label className="property-label">Element ID</label>
          <input
            type="text"
            className="input"
            placeholder="e.g., main-content, header-nav, user-profile"
            value={selectedShape.elementId || ''}
            onChange={(e) => handlePropertyChange('elementId', e.target.value)}
          />
          <small className="property-help">Unique identifier (no spaces, starts with letter)</small>
        </div>

        <div className="property-group">
          <label className="property-label">CSS Classes</label>
          <input
            type="text"
            className="input"
            placeholder="e.g., container, wrapper, button-primary, card"
            value={selectedShape.cssClasses || ''}
            onChange={(e) => handlePropertyChange('cssClasses', e.target.value)}
          />
          <small className="property-help">Space-separated class names (no # prefix)</small>
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

        {/* Comprehensive Styling Section */}
        <div className="property-group">
          <label className="property-label">Border Radius</label>
          <input
            type="range"
            className="input range-input"
            min="0"
            max="50"
            value={selectedShape.borderRadius}
            onChange={(e) => handlePropertyChange('borderRadius', parseInt(e.target.value))}
          />
          <span className="range-value">{selectedShape.borderRadius}px</span>
        </div>

        <div className="property-group">
          <label className="property-label">Box Shadow</label>
          <div className="shadow-controls">
            <div className="shadow-toggle">
              <input
                type="checkbox"
                id="shadow-enabled"
                checked={selectedShape.boxShadow.enabled}
                onChange={(e) => handlePropertyChange('boxShadow', {
                  ...selectedShape.boxShadow,
                  enabled: e.target.checked
                })}
              />
              <label htmlFor="shadow-enabled">Enable Shadow</label>
            </div>
            
            {selectedShape.boxShadow.enabled && (
              <>
                <div className="shadow-inputs">
                  <div className="shadow-input">
                    <label>Offset X</label>
                    <input
                      type="range"
                      className="input range-input"
                      min="-20"
                      max="20"
                      value={selectedShape.boxShadow.offsetX}
                      onChange={(e) => handlePropertyChange('boxShadow', {
                        ...selectedShape.boxShadow,
                        offsetX: parseInt(e.target.value)
                      })}
                    />
                    <span className="range-value">{selectedShape.boxShadow.offsetX}px</span>
                  </div>
                  <div className="shadow-input">
                    <label>Offset Y</label>
                    <input
                      type="range"
                      className="input range-input"
                      min="-20"
                      max="20"
                      value={selectedShape.boxShadow.offsetY}
                      onChange={(e) => handlePropertyChange('boxShadow', {
                        ...selectedShape.boxShadow,
                        offsetY: parseInt(e.target.value)
                      })}
                    />
                    <span className="range-value">{selectedShape.boxShadow.offsetY}px</span>
                  </div>
                  <div className="shadow-input">
                    <label>Blur</label>
                    <input
                      type="range"
                      className="input range-input"
                      min="0"
                      max="30"
                      value={selectedShape.boxShadow.blurRadius}
                      onChange={(e) => handlePropertyChange('boxShadow', {
                        ...selectedShape.boxShadow,
                        blurRadius: parseInt(e.target.value)
                      })}
                    />
                    <span className="range-value">{selectedShape.boxShadow.blurRadius}px</span>
                  </div>
                  <div className="shadow-input">
                    <label>Spread</label>
                    <input
                      type="range"
                      className="input range-input"
                      min="0"
                      max="20"
                      value={selectedShape.boxShadow.spreadRadius}
                      onChange={(e) => handlePropertyChange('boxShadow', {
                        ...selectedShape.boxShadow,
                        spreadRadius: parseInt(e.target.value)
                      })}
                    />
                    <span className="range-value">{selectedShape.boxShadow.spreadRadius}px</span>
                  </div>
                </div>
                <div className="shadow-color">
                  <label>Shadow Color</label>
                  <input
                    type="color"
                    className="input color-input"
                    value={selectedShape.boxShadow.color}
                    onChange={(e) => handlePropertyChange('boxShadow', {
                      ...selectedShape.boxShadow,
                      color: e.target.value
                    })}
                  />
                </div>
              </>
            )}
          </div>
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

        {/* Typography Section */}
        <div className="property-group">
          <label className="property-label">Typography</label>
          <div className="typography-controls">
            <div className="typography-input">
              <label>Font Family</label>
              <select
                className="select"
                value={selectedShape.typography.fontFamily}
                onChange={(e) => handlePropertyChange('typography', {
                  ...selectedShape.typography,
                  fontFamily: e.target.value
                })}
              >
                <option value="Arial, sans-serif">Arial</option>
                <option value="Helvetica, sans-serif">Helvetica</option>
                <option value="Times New Roman, serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="Courier New, monospace">Courier New</option>
                <option value="Impact, sans-serif">Impact</option>
                <option value="Comic Sans MS, cursive">Comic Sans MS</option>
              </select>
            </div>
            
            <div className="typography-input">
              <label>Font Size</label>
              <input
                type="range"
                className="input range-input"
                min="8"
                max="72"
                value={selectedShape.typography.fontSize}
                onChange={(e) => handlePropertyChange('typography', {
                  ...selectedShape.typography,
                  fontSize: parseInt(e.target.value)
                })}
              />
              <span className="range-value">{selectedShape.typography.fontSize}px</span>
            </div>
            
            <div className="typography-input">
              <label>Font Weight</label>
              <select
                className="select"
                value={selectedShape.typography.fontWeight}
                onChange={(e) => handlePropertyChange('typography', {
                  ...selectedShape.typography,
                  fontWeight: e.target.value as any
                })}
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
                <option value="600">600</option>
                <option value="700">700</option>
                <option value="800">800</option>
                <option value="900">900</option>
              </select>
            </div>
            
            <div className="typography-input">
              <label>Font Color</label>
              <input
                type="color"
                className="input color-input"
                value={selectedShape.typography.fontColor}
                onChange={(e) => handlePropertyChange('typography', {
                  ...selectedShape.typography,
                  fontColor: e.target.value
                })}
              />
            </div>
            
            <div className="typography-input">
              <label>Text Align</label>
              <select
                className="select"
                value={selectedShape.typography.textAlign}
                onChange={(e) => handlePropertyChange('typography', {
                  ...selectedShape.typography,
                  textAlign: e.target.value as any
                })}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
            </div>
            
            <div className="typography-input">
              <label>Line Height</label>
              <input
                type="range"
                className="input range-input"
                min="0.5"
                max="3"
                step="0.1"
                value={selectedShape.typography.lineHeight}
                onChange={(e) => handlePropertyChange('typography', {
                  ...selectedShape.typography,
                  lineHeight: parseFloat(e.target.value)
                })}
              />
              <span className="range-value">{selectedShape.typography.lineHeight}</span>
            </div>
            
            <div className="typography-input">
              <label>Letter Spacing</label>
              <input
                type="range"
                className="input range-input"
                min="-2"
                max="10"
                value={selectedShape.typography.letterSpacing}
                onChange={(e) => handlePropertyChange('typography', {
                  ...selectedShape.typography,
                  letterSpacing: parseInt(e.target.value)
                })}
              />
              <span className="range-value">{selectedShape.typography.letterSpacing}px</span>
            </div>
            
            <div className="typography-input">
              <label>Text Decoration</label>
              <select
                className="select"
                value={selectedShape.typography.textDecoration}
                onChange={(e) => handlePropertyChange('typography', {
                  ...selectedShape.typography,
                  textDecoration: e.target.value as any
                })}
              >
                <option value="none">None</option>
                <option value="underline">Underline</option>
                <option value="line-through">Line Through</option>
                <option value="overline">Overline</option>
              </select>
            </div>
            
            <div className="typography-input">
              <label>Text Transform</label>
              <select
                className="select"
                value={selectedShape.typography.textTransform}
                onChange={(e) => handlePropertyChange('typography', {
                  ...selectedShape.typography,
                  textTransform: e.target.value as any
                })}
              >
                <option value="none">None</option>
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layer Management Section */}
        <div className="property-group">
          <label className="property-label">Layer Management</label>
          <div className="layer-info">
            <div className="layer-position">
              <span className="layer-label">Position:</span>
              <span className="layer-value">{layerInfo.layerPosition}</span>
            </div>
            <div className="layer-count">
              <span className="layer-label">Layer:</span>
              <span className="layer-value">{layerInfo.currentLayer} of {layerInfo.totalLayers}</span>
            </div>
          </div>
          
          <div className="layer-controls">
            <div className="layer-row">
              <button
                className="layer-btn layer-btn-primary"
                onClick={() => handleLayerAction('front')}
                disabled={layerInfo.layerPosition === 'Top'}
                title="Bring to Front"
              >
                ↑ Front
              </button>
              <button
                className="layer-btn layer-btn-secondary"
                onClick={() => handleLayerAction('forward')}
                disabled={layerInfo.layerPosition === 'Top'}
                title="Bring Forward"
              >
                ↑
              </button>
            </div>
            <div className="layer-row">
              <button
                className="layer-btn layer-btn-secondary"
                onClick={() => handleLayerAction('backward')}
                disabled={layerInfo.layerPosition === 'Bottom'}
                title="Send Backward"
              >
                ↓
              </button>
              <button
                className="layer-btn layer-btn-primary"
                onClick={() => handleLayerAction('back')}
                disabled={layerInfo.layerPosition === 'Bottom'}
                title="Send to Back"
              >
                ↓ Back
              </button>
            </div>
          </div>
          
          <div className="z-index-control">
            <label className="z-index-label">Z-Index</label>
            <input
              type="number"
              className="input z-index-input"
              value={selectedShape.zIndex}
              onChange={(e) => handlePropertyChange('zIndex', parseInt(e.target.value) || 0)}
              title="Direct z-index control"
            />
          </div>
        </div>

        {/* Nesting Information Section */}
        <div className="property-group">
          <label className="property-label">Nesting Information</label>
          
          {/* Parent Information */}
          <div className="nesting-info">
            <div className="nesting-parent">
              <span className="nesting-label">Parent:</span>
              <span className="nesting-value">
                {selectedShape.parentId ? (
                  <span className="has-parent">
                    {canvasState?.shapes.find((s: Shape) => s.id === selectedShape.parentId)?.elementTag || 'Unknown'} 
                    {canvasState?.shapes.find((s: Shape) => s.id === selectedShape.parentId)?.elementId && 
                      `#${canvasState.shapes.find((s: Shape) => s.id === selectedShape.parentId)?.elementId}`
                    }
                  </span>
                ) : (
                  <span className="no-parent">None (Root Level)</span>
                )}
              </span>
            </div>
            
            {/* Children Information */}
            <div className="nesting-children">
              <span className="nesting-label">Children:</span>
              <span className="nesting-value">
                {(() => {
                  const children = canvasState?.shapes.filter((s: Shape) => s.parentId === selectedShape.id) || []
                  return children.length > 0 ? (
                    <span className="has-children">
                      {children.length} element{children.length !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="no-children">None</span>
                  )
                })()}
              </span>
            </div>
          </div>
          
          {/* Nesting Controls */}
          <div className="nesting-controls">
            <div className="nesting-row">
              <button
                className="nesting-btn nesting-btn-remove"
                onClick={() => {
                  if (onShapesUpdate && selectedShape.parentId) {
                    const updatedShapes = applyNesting(canvasState.shapes, selectedShape.id, null)
                    onShapesUpdate(updatedShapes)
                  }
                }}
                disabled={!selectedShape.parentId}
                title="Remove from parent"
              >
                Remove from Parent
              </button>
            </div>
            
            {/* Parent Selection */}
            <div className="parent-selection">
              <label className="parent-label">Set Parent:</label>
              <select
                className="select parent-select"
                value={selectedShape.parentId || ''}
                onChange={(e) => {
                  if (onShapesUpdate) {
                    const newParentId = e.target.value || null
                    const updatedShapes = applyNesting(canvasState.shapes, selectedShape.id, newParentId)
                    onShapesUpdate(updatedShapes)
                  }
                }}
              >
                <option value="">No Parent (Root Level)</option>
                {canvasState?.shapes
                  .filter((s: Shape) => s.id !== selectedShape.id)
                  .map((shape: Shape) => {
                    const children = canvasState.shapes.filter((child: Shape) => child.parentId === shape.id)
                    const childCount = children.length
                    return (
                      <option key={shape.id} value={shape.id}>
                        {shape.elementTag}
                        {shape.elementId && `#${shape.elementId}`}
                        {shape.cssClasses && ` ${shape.cssClasses.split(' ').map((cls: string) => `.${cls}`).join('')}`}
                        {childCount > 0 && ` (${childCount} children)`}
                      </option>
                    )
                  })
                }
              </select>
              <small className="parent-help">
                Select a parent element to create a nested relationship. 
                Elements with children are marked with child count.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertiesPanel 