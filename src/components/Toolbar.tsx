import React from 'react'
import { ToolType, Shape, AlignmentAction, CanvasState, GroupAction, VersionHistory } from '../types'
import { getVersionHistoryInfo } from '../utils/versionHistory'
import Templates from './Templates'
import Tooltip from './Tooltip'
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
  onApplyTemplate?: (templateId: string) => void
  onShowVersionHistory?: () => void
  onUndo?: () => void
  onRedo?: () => void
  versionHistory?: VersionHistory
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
  onCanvasUpdate,
  onApplyTemplate,
  onShowVersionHistory,
  onUndo,
  onRedo,
  versionHistory
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
            <Tooltip key={tool.id} content={tool.label} position="right">
              <button
                className={`toolbar-tool ${currentTool === tool.id ? 'active' : ''}`}
                onClick={() => onToolChange?.(tool.id)}
              >
                <span className="tool-icon">{tool.icon}</span>
                <span className="tool-label">{tool.label}</span>
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Templates Section */}
      <div className="toolbar-section">
        <h3 className="toolbar-title">Templates</h3>
        <div className="toolbar-actions">
          <Templates onApplyTemplate={onApplyTemplate || (() => {})} />
        </div>
      </div>

      {/* Layer Management Section */}
      {selectedShape && (
        <div className="toolbar-section">
          <h3 className="toolbar-title">Layers</h3>
          <div className="toolbar-actions">
            <div className="layer-buttons">
              <Tooltip content="Bring to Front" position="right">
                <button
                  className="btn btn--primary layer-btn"
                  onClick={() => onLayerAction?.('front')}
                  disabled={!onLayerAction}
                >
                  ↑ Front
                </button>
              </Tooltip>
              <Tooltip content="Bring Forward" position="right">
                <button
                  className="btn btn--secondary layer-btn"
                  onClick={() => onLayerAction?.('forward')}
                  disabled={!onLayerAction}
                >
                  ↑
                </button>
              </Tooltip>
              <Tooltip content="Send Backward" position="right">
                <button
                  className="btn btn--secondary layer-btn"
                  onClick={() => onLayerAction?.('backward')}
                  disabled={!onLayerAction}
                >
                  ↓
                </button>
              </Tooltip>
              <Tooltip content="Send to Back" position="right">
                <button
                  className="btn btn--primary layer-btn"
                  onClick={() => onLayerAction?.('back')}
                  disabled={!onLayerAction}
                >
                  ↓ Back
                </button>
              </Tooltip>
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
                <Tooltip content="Align Left" position="top">
                  <button
                    className="btn btn--secondary alignment-btn"
                    onClick={() => onAlignmentAction?.('align-left')}
                    disabled={selectedShapeIds.length < 2 || !onAlignmentAction}
                  >
                    ⇤
                  </button>
                </Tooltip>
                <Tooltip content="Align Center" position="top">
                  <button
                    className="btn btn--secondary alignment-btn"
                    onClick={() => onAlignmentAction?.('align-center')}
                    disabled={selectedShapeIds.length < 2 || !onAlignmentAction}
                  >
                    ⇔
                  </button>
                </Tooltip>
                <Tooltip content="Align Right" position="top">
                  <button
                    className="btn btn--secondary alignment-btn"
                    onClick={() => onAlignmentAction?.('align-right')}
                    disabled={selectedShapeIds.length < 2 || !onAlignmentAction}
                  >
                    ⇥
                  </button>
                </Tooltip>
              </div>
              
              {/* Vertical Alignment */}
              <div className="alignment-row">
                <Tooltip content="Align Top" position="top">
                  <button
                    className="btn btn--secondary alignment-btn"
                    onClick={() => onAlignmentAction?.('align-top')}
                    disabled={selectedShapeIds.length < 2 || !onAlignmentAction}
                  >
                    ⇧
                  </button>
                </Tooltip>
                <Tooltip content="Align Middle" position="top">
                  <button
                    className="btn btn--secondary alignment-btn"
                    onClick={() => onAlignmentAction?.('align-middle')}
                    disabled={selectedShapeIds.length < 2 || !onAlignmentAction}
                  >
                    ⇕
                  </button>
                </Tooltip>
                <Tooltip content="Align Bottom" position="top">
                  <button
                    className="btn btn--secondary alignment-btn"
                    onClick={() => onAlignmentAction?.('align-bottom')}
                    disabled={selectedShapeIds.length < 2 || !onAlignmentAction}
                  >
                    ⇩
                  </button>
                </Tooltip>
              </div>
              
              {/* Distribution */}
              <div className="alignment-row">
                <Tooltip content="Distribute Horizontally" position="top">
                  <button
                    className="btn btn--secondary alignment-btn"
                    onClick={() => onAlignmentAction?.('distribute-horizontal')}
                    disabled={selectedShapeIds.length < 3 || !onAlignmentAction}
                  >
                    ⇹
                  </button>
                </Tooltip>
                <Tooltip content="Distribute Vertically" position="top">
                  <button
                    className="btn btn--secondary alignment-btn"
                    onClick={() => onAlignmentAction?.('distribute-vertical')}
                    disabled={selectedShapeIds.length < 3 || !onAlignmentAction}
                  >
                    ⇳
                  </button>
                </Tooltip>
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
              <Tooltip content="Group Selected Shapes" position="right">
                <button
                  className="btn btn--primary grouping-btn"
                  onClick={() => onGroupAction?.('group')}
                  disabled={selectedShapeIds.length < 2 || !onGroupAction}
                >
                  📦 Group
                </button>
              </Tooltip>
              <Tooltip content="Ungroup Selected Shapes" position="right">
                <button
                  className="btn btn--secondary grouping-btn"
                  onClick={() => onGroupAction?.('ungroup')}
                  disabled={selectedShapeIds.length === 0 || !onGroupAction}
                >
                  📦❌ Ungroup
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}

      {/* Snap Settings Section */}
      <div className="toolbar-section">
        <h3 className="toolbar-title">Snap Settings</h3>
        <div className="toolbar-actions">
          <div className="snap-buttons">
            <Tooltip content="Toggle Snap to Grid" position="right">
              <button
                className={`btn ${canvasState?.snapToGrid ? 'btn--primary' : 'btn--secondary'} snap-btn`}
                onClick={() => onAlignmentAction?.('snap-to-grid')}
                disabled={!onAlignmentAction}
              >
                Grid Snap
              </button>
            </Tooltip>
            <Tooltip content="Toggle Snap to Edges" position="right">
              <button
                className={`btn ${canvasState?.snapToEdges ? 'btn--primary' : 'btn--secondary'} snap-btn`}
                onClick={() => onAlignmentAction?.('snap-to-edges')}
                disabled={!onAlignmentAction}
              >
                Edge Snap
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="toolbar-section">
        <h3 className="toolbar-title">File</h3>
        <div className="toolbar-actions">
          <Tooltip content="Save diagram" position="right">
            <button
              className="btn btn--primary"
              onClick={onSave}
            >
              Save
            </button>
          </Tooltip>
          <Tooltip content="Load diagram" position="right">
            <label className="btn btn--secondary">
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
          </Tooltip>
        </div>
      </div>

      {/* Version History Section */}
      <div className="toolbar-section">
        <h3 className="toolbar-title">Version History</h3>
        <div className="toolbar-actions">
          <div className="version-history-buttons">
            <Tooltip content="Undo (Ctrl+Z)" position="right">
              <button
                className="btn btn--secondary version-btn"
                onClick={onUndo}
                disabled={!versionHistory || !getVersionHistoryInfo(versionHistory).canUndo}
              >
                ↩ Undo
              </button>
            </Tooltip>
            <Tooltip content="Redo (Ctrl+Y)" position="right">
              <button
                className="btn btn--secondary version-btn"
                onClick={onRedo}
                disabled={!versionHistory || !getVersionHistoryInfo(versionHistory).canRedo}
              >
                ↪ Redo
              </button>
            </Tooltip>
            <Tooltip content="View Version History" position="right">
              <button
                className="btn btn--primary version-btn"
                onClick={onShowVersionHistory}
                disabled={!versionHistory}
              >
                📋 History
              </button>
            </Tooltip>
          </div>
          {versionHistory && (
            <div className="version-info">
              <small>
                {getVersionHistoryInfo(versionHistory).totalEntries} versions
              </small>
            </div>
          )}
        </div>
      </div>

      <div className="toolbar-section">
        <h3 className="toolbar-title">Export</h3>
        <div className="toolbar-actions">
          <Tooltip content="Export as PNG" position="right">
            <button
              className="btn btn--primary"
              onClick={onExportPNG}
            >
              Export PNG
            </button>
          </Tooltip>
          <Tooltip content="Export as HTML" position="right">
            <button
              className="btn btn--secondary"
              onClick={onExportHTML}
            >
              Export HTML
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="toolbar-section">
        <h3 className="toolbar-title">Display</h3>
        <div className="toolbar-actions">
          <Tooltip content="Toggle CSS class labels" position="right">
            <button
              className={`btn ${showCssLabels ? 'btn--primary' : 'btn--secondary'}`}
              onClick={onToggleCssLabels}
            >
              {showCssLabels ? 'Hide CSS Labels' : 'Show CSS Labels'}
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="toolbar-section">
        <h3 className="toolbar-title">Help</h3>
        <div className="toolbar-help">
          <p className="help-text">
            <strong>Mouse Wheel:</strong> Zoom in/out<br />
            <strong>Shift + Left Mouse:</strong> Pan canvas<br />
            <strong>Click & Drag:</strong> Draw shapes
          </p>
        </div>
      </div>
    </div>
  )
}

export default Toolbar 