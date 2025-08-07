import React from 'react'
import './AutoSaveModal.scss'

interface AutoSaveModalProps {
  isOpen: boolean
  onRestore: () => void
  onDiscard: () => void
}

const AutoSaveModal: React.FC<AutoSaveModalProps> = ({ isOpen, onRestore, onDiscard }) => {
  console.log('🎭 AutoSaveModal render - isOpen:', isOpen)
  
  if (!isOpen) {
    console.log('🎭 AutoSaveModal not rendering - isOpen is false')
    return null
  }

  const handleRestore = () => {
    console.log('🔄 AutoSaveModal: Restore button clicked')
    onRestore()
  }

  const handleDiscard = () => {
    console.log('🗑️ AutoSaveModal: Discard button clicked')
    onDiscard()
  }

  console.log('🎭 AutoSaveModal rendering modal')
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
            onClick={handleDiscard}
          >
            Start Fresh
          </button>
          <button 
            className="auto-save-modal-btn auto-save-modal-btn-primary"
            onClick={handleRestore}
          >
            Restore Diagram
          </button>
        </div>
      </div>
    </div>
  )
}

export default AutoSaveModal 