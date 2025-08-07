import React from 'react'
import './AutoSaveModal.scss'

interface AutoSaveModalProps {
  isOpen: boolean
  onRestore: () => void
  onDiscard: () => void
}

const AutoSaveModal: React.FC<AutoSaveModalProps> = ({ isOpen, onRestore, onDiscard }) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className="auto-save-modal-overlay">
      <div className="auto-save-modal">
        <div className="auto-save-modal-header">
          <h3>Auto-Saved Diagram Found</h3>
        </div>
        <div className="auto-save-modal-content">
          <p>
            We found an auto-saved diagram from your previous session. 
            Would you like to restore it or start with a blank canvas?
          </p>
        </div>
        <div className="auto-save-modal-actions">
          <button 
            className="auto-save-modal-btn auto-save-modal-btn-secondary"
            onClick={onDiscard}
          >
            Start Fresh
          </button>
          <button 
            className="auto-save-modal-btn auto-save-modal-btn-primary"
            onClick={onRestore}
          >
            Restore Diagram
          </button>
        </div>
      </div>
    </div>
  )
}

export default AutoSaveModal 