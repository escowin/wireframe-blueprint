import React from 'react'
import { ToolType, Shape, AlignmentAction, CanvasState, GroupAction } from '../types'
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
  selectedShape?: Shape | null
  onLayerAction?: (action: 'front' | 'back' | 'forward' | 'backward') => void
  selectedShapeIds?: string[]
  onAlignmentAction?: (action: AlignmentAction) => void
  onGroupAction?: (action: GroupAction) => void
  canvasState?: CanvasState
  onCanvasUpdate?: (updates: any) => void
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool = 'select',
  onToolChange,
  onExportPNG,
  onExportHTML,
  onSave,
  onLoad,
  showCssLabels = false,
  onToggleCssLabels,
  selectedShape,
  onLayerAction,
  selectedShapeIds = [],
  onAlignmentAction,
  onGroupAction,
  canvasState,
  onCanvasUpdate
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

      {/* Layer Management Section */}
      {selectedShape && (
        <div className="toolbar-section">
          <h3 className="toolbar-title">Layers</h3>
          <div className="toolbar-actions">
            <div className="layer-buttons">
              <button
                className="btn btn--primary layer-btn"
                onClick={() => onLayerAction?.('front')}
                title="Bring to Front"
                disabled={!onLayerAction}
              >
                ↑ Front
              </button>
              <button
                className="btn btn--secondary layer-btn"
                onClick={() => onLayerAction?.('forward')}
                title="Bring Forward"
                disabled={!onLayerAction}
              >
                ↑
              </button>
              <button
                className="btn btn--secondary layer-btn"
                onClick={() => onLayerAction?.('backward')}
                title="Send Backward"
                disabled={!onLayerAction}
              >
                ↓
              </button>
              <button
                className="btn btn--primary layer-btn"
                onClick={() => onLayerAction?.('back')}
                title="Send to Back"
                disabled={!onLayerAction}
              >
                ↓ Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alignment Tools Section */}
      {selectedShapeIds.length > 0 && (
        <div className="toolbar-section">
          <h3 className="toolbar-title">Alignment</h3>
          <div className="toolbar-actions">
            <div className="alignment-buttons">
              {/* Horizontal Alignment */}
              <div className="alignment-row">
                <button
                  className="btn btn--secondary alignment-btn"
                  onClick={() => onAlignmentAction?.('align-left')}
                  title="Align Left"
                  disabled={selectedShapeIds.length < 2 || !onAlignmentAction}
                >
                  ⇤
                </button>
                <button
                  className="btn btn--secondary alignment-btn"
                  onClick={() => onAlignmentAction?.('align-center')}
                  title="Align Center"
                  disabled={selectedShapeIds.length < 2 || !onAlignmentAction}
                >
                  ⇔
                </button>
                <button
                  className="btn btn--secondary alignment-btn"
                  onClick={() => onAlignmentAction?.('align-right')}
                  title="Align Right"
                  disabled={selectedShapeIds.length < 2 || !onAlignmentAction}
                >
                  ⇥
                </button>
              </div>
              
              {/* Vertical Alignment */}
              <div className="alignment-row">
                <button
                  className="btn btn--secondary alignment-btn"
                  onClick={() => onAlignmentAction?.('align-top')}
                  title="Align Top"
                  disabled={selectedShapeIds.length < 2 || !onAlignmentAction}
                >
                  ⇧
                </button>
                <button
                  className="btn btn--secondary alignment-btn"
                  onClick={() => onAlignmentAction?.('align-middle')}
                  title="Align Middle"
                  disabled={selectedShapeIds.length < 2 || !onAlignmentAction}
                >
                  ⇕
                </button>
                <button
                  className="btn btn--secondary alignment-btn"
                  onClick={() => onAlignmentAction?.('align-bottom')}
                  title="Align Bottom"
                  disabled={selectedShapeIds.length < 2 || !onAlignmentAction}
                >
                  ⇩
                </button>
              </div>
              
              {/* Distribution */}
              <div className="alignment-row">
                <button
                  className="btn btn--secondary alignment-btn"
                  onClick={() => onAlignmentAction?.('distribute-horizontal')}
                  title="Distribute Horizontally"
                  disabled={selectedShapeIds.length < 3 || !onAlignmentAction}
                >
                  ⇹
                </button>
                <button
                  className="btn btn--secondary alignment-btn"
                  onClick={() => onAlignmentAction?.('distribute-vertical')}
                  title="Distribute Vertically"
                  disabled={selectedShapeIds.length < 3 || !onAlignmentAction}
                >
                  ⇳
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grouping Tools Section */}
      {selectedShapeIds.length > 0 && (
        <div className="toolbar-section">
          <h3 className="toolbar-title">Grouping</h3>
          <div className="toolbar-actions">
            <div className="grouping-buttons">
              <button
                className="btn btn--primary grouping-btn"
                onClick={() => onGroupAction?.('group')}
                title="Group Selected Shapes"
                disabled={selectedShapeIds.length < 2 || !onGroupAction}
              >
                📦 Group
              </button>
              <button
                className="btn btn--secondary grouping-btn"
                onClick={() => onGroupAction?.('ungroup')}
                title="Ungroup Selected Shapes"
                disabled={selectedShapeIds.length === 0 || !onGroupAction}
              >
                📦❌ Ungroup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snap Settings Section */}
      <div className="toolbar-section">
        <h3 className="toolbar-title">Snap Settings</h3>
        <div className="toolbar-actions">
          <div className="snap-buttons">
            <button
              className={`btn ${canvasState?.snapToGrid ? 'btn--primary' : 'btn--secondary'} snap-btn`}
              onClick={() => onAlignmentAction?.('snap-to-grid')}
              title="Toggle Snap to Grid"
              disabled={!onAlignmentAction}
            >
              Grid Snap
            </button>
            <button
              className={`btn ${canvasState?.snapToEdges ? 'btn--primary' : 'btn--secondary'} snap-btn`}
              onClick={() => onAlignmentAction?.('snap-to-edges')}
              title="Toggle Snap to Edges"
              disabled={!onAlignmentAction}
            >
              Edge Snap
            </button>
          </div>
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