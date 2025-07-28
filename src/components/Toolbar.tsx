import React from 'react'
import { ToolType } from '../types'
import './Toolbar.scss'

interface ToolbarProps {
  currentTool?: ToolType
  onToolChange?: (tool: ToolType) => void
  onExportPNG?: () => void
  onExportHTML?: () => void
  onSave?: () => void
  onLoad?: (file: File) => void
  showCssLabels?: boolean
  onToggleCssLabels?: () => void
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool = 'select',
  onToolChange,
  onExportPNG,
  onExportHTML,
  onSave,
  onLoad,
  showCssLabels = false,
  onToggleCssLabels
}) => {
  const tools = [
    { id: 'select' as ToolType, label: 'Select', icon: '👆' },
    { id: 'rectangle' as ToolType, label: 'Rectangle', icon: '⬜' },
    { id: 'circle' as ToolType, label: 'Circle', icon: '⭕' }
  ]

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3 className="toolbar-title">Tools</h3>
        <div className="toolbar-tools">
          {tools.map(tool => (
            <button
              key={tool.id}
              className={`toolbar-tool ${currentTool === tool.id ? 'active' : ''}`}
              onClick={() => onToolChange?.(tool.id)}
              title={tool.label}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-label">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <h3 className="toolbar-title">File</h3>
        <div className="toolbar-actions">
          <button
            className="btn btn--primary"
            onClick={onSave}
            title="Save diagram"
          >
            Save
          </button>
          <label className="btn btn--secondary" title="Load diagram">
            Load
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file && onLoad) {
                  onLoad(file)
                }
                // Reset the input
                e.target.value = ''
              }}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="toolbar-section">
        <h3 className="toolbar-title">Export</h3>
        <div className="toolbar-actions">
          <button
            className="btn btn--primary"
            onClick={onExportPNG}
            title="Export as PNG"
          >
            Export PNG
          </button>
          <button
            className="btn btn--secondary"
            onClick={onExportHTML}
            title="Export as HTML"
          >
            Export HTML
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <h3 className="toolbar-title">Display</h3>
        <div className="toolbar-actions">
          <button
            className={`btn ${showCssLabels ? 'btn--primary' : 'btn--secondary'}`}
            onClick={onToggleCssLabels}
            title="Toggle CSS class labels"
          >
            {showCssLabels ? 'Hide CSS Labels' : 'Show CSS Labels'}
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <h3 className="toolbar-title">Help</h3>
        <div className="toolbar-help">
          <p className="help-text">
            <strong>Mouse Wheel:</strong> Zoom in/out<br />
            <strong>Middle Mouse:</strong> Pan canvas<br />
            <strong>Click & Drag:</strong> Draw shapes
          </p>
        </div>
      </div>
    </div>
  )
}

export default Toolbar 