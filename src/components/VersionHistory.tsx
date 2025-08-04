import React, { useState, useEffect } from 'react'
import { VersionHistory, VersionHistoryEntry, CanvasState } from '../types'
import { 
  getVersionHistoryInfo, 
  formatTimestamp, 
  getTimeAgo, 
  jumpToVersion,
  clearVersionHistory,
  saveVersionHistory
} from '../utils/versionHistory'
import './VersionHistory.scss'

interface VersionHistoryProps {
  history: VersionHistory
  onHistoryChange: (newHistory: VersionHistory) => void
  onRestoreVersion: (canvasState: CanvasState) => void
  onClose: () => void
}

const VersionHistoryComponent: React.FC<VersionHistoryProps> = ({
  history,
  onHistoryChange,
  onRestoreVersion,
  onClose
}) => {
  const [selectedEntry, setSelectedEntry] = useState<VersionHistoryEntry | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const historyInfo = getVersionHistoryInfo(history)
  
  // Filter entries based on search term
  const filteredEntries = historyInfo.recentEntries.filter(entry =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.action.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRestoreVersion = (entry: VersionHistoryEntry) => {
    const shouldRestore = window.confirm(
      `Are you sure you want to restore to "${entry.description}"? This will replace your current work.`
    )
    
    if (shouldRestore) {
      onRestoreVersion(entry.canvasState)
      onClose()
    }
  }

  const handleClearHistory = () => {
    if (showClearConfirm) {
      const newHistory = clearVersionHistory(history)
      onHistoryChange(newHistory)
      saveVersionHistory(newHistory)
      setShowClearConfirm(false)
    } else {
      setShowClearConfirm(true)
    }
  }

  const handleJumpToVersion = (entry: VersionHistoryEntry) => {
    const entryIndex = history.entries.findIndex(e => e.id === entry.id)
    if (entryIndex !== -1) {
      const result = jumpToVersion(history, entryIndex)
      onHistoryChange(result.history)
      if (result.canvasState) {
        onRestoreVersion(result.canvasState)
      }
    }
  }

  const getActionIcon = (action: string): string => {
    switch (action.toLowerCase()) {
      case 'add':
      case 'create':
        return '➕'
      case 'delete':
      case 'remove':
        return '🗑️'
      case 'move':
      case 'drag':
        return '↔️'
      case 'resize':
        return '⤡'
      case 'style':
      case 'color':
        return '🎨'
      case 'group':
        return '📦'
      case 'ungroup':
        return '📤'
      case 'align':
        return '📐'
      case 'template':
        return '📋'
      case 'import':
        return '📥'
      case 'export':
        return '📤'
      default:
        return '✏️'
    }
  }

  const getActionColor = (action: string): string => {
    switch (action.toLowerCase()) {
      case 'add':
      case 'create':
        return '#4caf50'
      case 'delete':
      case 'remove':
        return '#f44336'
      case 'move':
      case 'drag':
        return '#2196f3'
      case 'resize':
        return '#ff9800'
      case 'style':
      case 'color':
        return '#9c27b0'
      case 'group':
        return '#607d8b'
      case 'ungroup':
        return '#795548'
      case 'align':
        return '#00bcd4'
      case 'template':
        return '#8bc34a'
      default:
        return '#757575'
    }
  }

  return (
    <div className="version-history-overlay">
      <div className="version-history-modal">
        <div className="version-history-header">
          <h2>Version History</h2>
          <div className="version-history-actions">
            <button 
              className="btn-secondary"
              onClick={() => setShowClearConfirm(false)}
            >
              Cancel
            </button>
            <button 
              className="btn-danger"
              onClick={handleClearHistory}
            >
              {showClearConfirm ? 'Confirm Clear' : 'Clear History'}
            </button>
            <button 
              className="btn-primary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>

        <div className="version-history-content">
          <div className="version-history-search">
            <input
              type="text"
              placeholder="Search versions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="version-history-stats">
            <span>Total versions: {historyInfo.totalEntries}</span>
            <span>Current position: {historyInfo.currentIndex + 1}</span>
          </div>

          <div className="version-history-list">
            {filteredEntries.length === 0 ? (
              <div className="no-versions">
                <p>No versions found</p>
              </div>
            ) : (
              filteredEntries.map((entry, index) => (
                <div 
                  key={entry.id}
                  className={`version-entry ${entry.id === historyInfo.currentEntry?.id ? 'current' : ''}`}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="version-entry-header">
                    <div className="version-action">
                      <span 
                        className="action-icon"
                        style={{ color: getActionColor(entry.action) }}
                      >
                        {getActionIcon(entry.action)}
                      </span>
                      <span className="action-text">{entry.action}</span>
                    </div>
                    <div className="version-time">
                      <span className="time-ago">{getTimeAgo(entry.timestamp)}</span>
                      <span className="timestamp">{formatTimestamp(entry.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="version-description">
                    {entry.description}
                  </div>
                  
                  <div className="version-details">
                    <span>Shapes: {entry.canvasState.shapes.length}</span>
                    <span>Groups: {entry.canvasState.groups.length}</span>
                    <span>Zoom: {Math.round(entry.canvasState.zoom * 100)}%</span>
                  </div>
                  
                  <div className="version-actions">
                    <button
                      className="btn-small btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleJumpToVersion(entry)
                      }}
                    >
                      Jump
                    </button>
                    <button
                      className="btn-small btn-primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRestoreVersion(entry)
                      }}
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedEntry && (
          <div className="version-details-panel">
            <h3>Version Details</h3>
            <div className="detail-item">
              <strong>Description:</strong> {selectedEntry.description}
            </div>
            <div className="detail-item">
              <strong>Action:</strong> {selectedEntry.action}
            </div>
            <div className="detail-item">
              <strong>Timestamp:</strong> {formatTimestamp(selectedEntry.timestamp)}
            </div>
            <div className="detail-item">
              <strong>Shapes:</strong> {selectedEntry.canvasState.shapes.length}
            </div>
            <div className="detail-item">
              <strong>Groups:</strong> {selectedEntry.canvasState.groups.length}
            </div>
            <div className="detail-item">
              <strong>Canvas Zoom:</strong> {Math.round(selectedEntry.canvasState.zoom * 100)}%
            </div>
            <div className="detail-item">
              <strong>Grid Size:</strong> {selectedEntry.canvasState.gridSize}px
            </div>
            <div className="detail-item">
              <strong>Background:</strong> {selectedEntry.canvasState.canvasBackgroundColor}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VersionHistoryComponent 