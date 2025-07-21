import React from 'react'
import { ToolType } from '../types'
import './Toolbar.scss'

interface ToolbarProps {
  currentTool?: ToolType
  onToolChange?: (tool: ToolType) => void
  onExportPNG?: () => void
  onExportHTML?: () => void
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool = 'select',
  onToolChange,
  onExportPNG,
  onExportHTML
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
        <h3 className="toolbar-title">Actions</h3>
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