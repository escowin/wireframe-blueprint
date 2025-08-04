import { useState, useRef, useEffect } from 'react'
import EnhancedCanvas from './components/EnhancedCanvas'
import Toolbar from './components/Toolbar'
import PropertiesPanel from './components/PropertiesPanel'
import VersionHistoryComponent from './components/VersionHistory'
import CanvasDemo from './components/CanvasDemo'
import { CanvasState, Shape, ToolType, AlignmentAction, GroupAction, VersionHistory } from './types'
import { exportAsPNG, exportAsHTML, saveDiagram, loadDiagram, autoSave, loadAutoSave, clearAutoSave, bringToFront, sendToBack, bringForward, sendBackward, checkLocalStorageUsage, validateAndFixShapes, alignShapes, distributeShapes, createGroup, ungroupShapes, canGroupShapes, canUngroupShapes, getSelectedGroupIds, applyTemplate } from './utils/helpers'
import { initializeVersionHistory, addVersionEntry, undoVersion, redoVersion, loadVersionHistory, saveVersionHistory, hasCanvasStateChanged, getChangeSummary } from './utils/versionHistory'
import './App.scss'

function App() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasState, setCanvasState] = useState<CanvasState>({
    shapes: [],
    groups: [],
    selectedShapeId: null,
    selectedShapeIds: [],
    selectedGroupId: null,
    zoom: 1,
    pan: { x: 0, y: 0 },
    gridSize: 20,
    showGrid: true,
    showCssLabels: false,
    canvasBackgroundColor: '#ffffff',
    canvasBackgroundOpacity: 1,
    // Alignment settings
    snapToGrid: true,
    snapToEdges: true,
    gridSnapSize: 20
  })
  const [currentTool, setCurrentTool] = useState<ToolType>('select')
  const [storageUsage, setStorageUsage] = useState<{ used: number; total: number; available: number; percentage: number } | null>(null)
  const [versionHistory, setVersionHistory] = useState<VersionHistory>(() => {
    const saved = loadVersionHistory()
    return saved || initializeVersionHistory(50)
  })
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [lastCanvasState, setLastCanvasState] = useState<CanvasState | null>(null)
  const [showDemo, setShowDemo] = useState(false)

  // Load auto-saved diagram on app start
  useEffect(() => {
    const autoSavedState = loadAutoSave()
    if (autoSavedState) {
      const shouldRestore = window.confirm('Found an auto-saved diagram. Would you like to restore it?')
      if (shouldRestore) {
        setCanvasState(migrateCanvasState(autoSavedState))
      } else {
        clearAutoSave()
      }
    }
  }, [])

  // Check storage usage on mount and after auto-save
  useEffect(() => {
    const checkStorage = () => {
      const usage = checkLocalStorageUsage()
      setStorageUsage(usage)
      
      if (usage.percentage > 80) {
        console.warn(`localStorage is ${usage.percentage.toFixed(1)}% full. Consider clearing browser data.`)
      }
    }
    
    checkStorage()
    
    // Check storage usage every minute
    const interval = setInterval(checkStorage, 60000)
    return () => clearInterval(interval)
  }, [])

  // Auto-save diagram every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      autoSave(canvasState)
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [canvasState])

  // Track canvas state changes for version history
  useEffect(() => {
    if (lastCanvasState && hasCanvasStateChanged(lastCanvasState, canvasState)) {
      const changeSummary = getChangeSummary(lastCanvasState, canvasState)
      const newHistory = addVersionEntry(versionHistory, canvasState, changeSummary, 'auto')
      setVersionHistory(newHistory)
      saveVersionHistory(newHistory)
    }
    setLastCanvasState(canvasState)
  }, [canvasState, lastCanvasState, versionHistory])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        handleUndo()
      } else if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
        event.preventDefault()
        handleRedo()
      } else if ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) {
        event.preventDefault()
        handleRedo()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [versionHistory]) // Add versionHistory as dependency

  // Migration function to handle existing shapes without new properties
  const migrateCanvasState = (canvasState: any): CanvasState => {
    return {
      ...canvasState,
      groups: canvasState.groups ?? [],
      selectedShapeIds: canvasState.selectedShapeIds ?? [],
      selectedGroupId: canvasState.selectedGroupId ?? null,
      snapToGrid: canvasState.snapToGrid ?? true,
      snapToEdges: canvasState.snapToEdges ?? true,
      gridSnapSize: canvasState.gridSnapSize ?? 20,
      shapes: canvasState.shapes.map((shape: any) => ({
        ...shape,
        elementId: shape.elementId || '', // Add elementId if missing
        cssClasses: shape.cssClasses || '', // Ensure cssClasses is defined
        groupId: shape.groupId || undefined, // Add groupId if missing
        borderRadius: shape.borderRadius ?? 0, // Add border radius if missing
        boxShadow: shape.boxShadow ?? {
          offsetX: 0,
          offsetY: 0,
          blurRadius: 0,
          spreadRadius: 0,
          color: '#000000',
          enabled: false
        },
        typography: shape.typography ?? {
          fontFamily: 'Arial, sans-serif',
          fontSize: 14,
          fontWeight: 'normal',
          fontColor: '#000000',
          textAlign: 'left',
          lineHeight: 1.2,
          letterSpacing: 0,
          textDecoration: 'none',
          textTransform: 'none'
        }
      }))
    }
  }

  const handleToolChange = (tool: ToolType) => {
    console.log('Tool changed to:', tool)
    setCurrentTool(tool)
  }

  const selectedShape = canvasState.shapes.find(shape => shape.id === canvasState.selectedShapeId) || null

  const handleShapeUpdate = (updatedShape: Shape) => {
    setCanvasState(prev => ({
      ...prev,
      shapes: prev.shapes.map(shape => 
        shape.id === updatedShape.id ? updatedShape : shape
      )
    }))
    // Add manual version entry for shape updates
    handleAddManualVersion('Updated shape properties', 'style')
  }

  const handleShapesUpdate = (updatedShapes: Shape[]) => {
    setCanvasState(prev => ({
      ...prev,
      shapes: updatedShapes
    }))
    // Add manual version entry for shape updates
    handleAddManualVersion('Updated multiple shapes', 'move')
  }

  const handleLayerAction = (action: 'front' | 'back' | 'forward' | 'backward') => {
    if (!selectedShape) return
    
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
    
    setCanvasState(prev => ({
      ...prev,
      shapes: updatedShapes
    }))
  }

  const handleAlignmentAction = (action: AlignmentAction) => {
    if (canvasState.selectedShapeIds.length === 0) return

    let updatedShapes: Shape[]
    
    switch (action) {
      case 'align-left':
      case 'align-center':
      case 'align-right':
      case 'align-top':
      case 'align-middle':
      case 'align-bottom':
        updatedShapes = alignShapes(canvasState.shapes, canvasState.selectedShapeIds, action)
        break
      case 'distribute-horizontal':
      case 'distribute-vertical':
        updatedShapes = distributeShapes(canvasState.shapes, canvasState.selectedShapeIds, action)
        break
      case 'snap-to-grid':
        setCanvasState(prev => ({
          ...prev,
          snapToGrid: !prev.snapToGrid
        }))
        return
      case 'snap-to-edges':
        setCanvasState(prev => ({
          ...prev,
          snapToEdges: !prev.snapToEdges
        }))
        return
      default:
        return
    }
    
    setCanvasState(prev => ({
      ...prev,
      shapes: updatedShapes
    }))
  }

  const handleSelectionChange = (selectedIds: string[]) => {
    setCanvasState(prev => ({
      ...prev,
      selectedShapeIds: selectedIds,
      selectedShapeId: selectedIds.length === 1 ? selectedIds[0] : null
    }))
  }

  const handleGroupAction = (action: GroupAction) => {
    try {
      switch (action) {
        case 'group':
          if (!canGroupShapes(canvasState.shapes, canvasState.selectedShapeIds)) {
            alert('Cannot group: At least 2 ungrouped shapes must be selected')
            return
          }
          
          const { shapes: updatedShapes, group } = createGroup(canvasState.shapes, canvasState.selectedShapeIds)
          setCanvasState(prev => ({
            ...prev,
            shapes: updatedShapes,
            groups: [...prev.groups, group],
            selectedShapeIds: [group.id], // Select the new group
            selectedGroupId: group.id
          }))
          handleAddManualVersion('Created group', 'group')
          break
          
        case 'ungroup':
          const groupIds = getSelectedGroupIds(canvasState.shapes, canvasState.selectedShapeIds)
          if (groupIds.length === 0) {
            alert('No groups found in selection')
            return
          }
          
          let finalShapes = canvasState.shapes
          let finalGroups = canvasState.groups
          
          // Ungroup all selected groups
          for (const groupId of groupIds) {
            const result = ungroupShapes(finalShapes, finalGroups, groupId)
            finalShapes = result.shapes
            finalGroups = result.groups
          }
          
          setCanvasState(prev => ({
            ...prev,
            shapes: finalShapes,
            groups: finalGroups,
            selectedShapeIds: [], // Clear selection after ungrouping
            selectedGroupId: null
          }))
          handleAddManualVersion('Ungrouped shapes', 'ungroup')
          break
          
        default:
          return
      }
    } catch (error) {
      console.error('Group action failed:', error)
      alert(`Group action failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleApplyTemplate = (templateId: string) => {
    try {
      const result = applyTemplate(templateId, canvasState.shapes, canvasState.groups)
      setCanvasState(prev => ({
        ...prev,
        shapes: result.shapes,
        groups: result.groups
      }))
      handleAddManualVersion('Applied template', 'template')
    } catch (error) {
      console.error('Template application failed:', error)
      alert(`Failed to apply template: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleCanvasUpdate = (updates: any) => {
    setCanvasState(prev => ({
      ...prev,
      ...updates
    }))
  }

  const handleExportPNG = () => {
    if (canvasRef.current) {
      exportAsPNG(canvasRef.current)
    }
  }

  const handleExportHTML = () => {
    exportAsHTML(canvasState.shapes)
  }

  const handleSave = () => {
    saveDiagram(canvasState)
    clearAutoSave() // Clear auto-save after manual save
  }

  const handleLoad = async (file: File) => {
    try {
      const loadedCanvasState = await loadDiagram(file)
      setCanvasState(migrateCanvasState(loadedCanvasState))
    } catch (error) {
      console.error('Failed to load diagram:', error)
      alert('Failed to load diagram. Please make sure you selected a valid diagram file.')
    }
  }

  const handleToggleCssLabels = () => {
    setCanvasState(prev => ({
      ...prev,
      showCssLabels: !prev.showCssLabels
    }))
  }

  // Version History Handlers
  const handleShowVersionHistory = () => {
    setShowVersionHistory(true)
  }

  const handleHideVersionHistory = () => {
    setShowVersionHistory(false)
  }

  const handleRestoreVersion = (restoredState: CanvasState) => {
    setCanvasState(restoredState)
    // Add a manual entry for the restore action
    const newHistory = addVersionEntry(versionHistory, restoredState, 'Restored from version history', 'restore')
    setVersionHistory(newHistory)
    saveVersionHistory(newHistory)
  }

  const handleUndo = () => {
    const result = undoVersion(versionHistory)
    if (result.canvasState) {
      setCanvasState(result.canvasState)
      setVersionHistory(result.history)
      saveVersionHistory(result.history)
    }
  }

  const handleRedo = () => {
    const result = redoVersion(versionHistory)
    if (result.canvasState) {
      setCanvasState(result.canvasState)
      setVersionHistory(result.history)
      saveVersionHistory(result.history)
    }
  }

  const handleAddManualVersion = (description: string, action: string = 'manual') => {
    const newHistory = addVersionEntry(versionHistory, canvasState, description, action)
    setVersionHistory(newHistory)
    saveVersionHistory(newHistory)
  }

  return (
    <div className="app">
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        zIndex: 1001,
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => setShowDemo(!showDemo)}
          style={{
            padding: '8px 16px',
            backgroundColor: showDemo ? '#ef4444' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {showDemo ? 'Hide Demo' : 'Show Canvas Demo'}
        </button>
      </div>
      
      {showDemo ? (
        <CanvasDemo />
      ) : (
        <>
          <Toolbar 
            currentTool={currentTool}
            onToolChange={handleToolChange}
            onExportPNG={handleExportPNG}
            onExportHTML={handleExportHTML}
            onSave={handleSave}
            onLoad={handleLoad}
            showCssLabels={canvasState.showCssLabels}
            onToggleCssLabels={handleToggleCssLabels}
            selectedShape={selectedShape}
            onLayerAction={handleLayerAction}
            selectedShapeIds={canvasState.selectedShapeIds}
            onAlignmentAction={handleAlignmentAction}
            onGroupAction={handleGroupAction}
            canvasState={canvasState}
            onCanvasUpdate={handleCanvasUpdate}
            onApplyTemplate={handleApplyTemplate}
            onShowVersionHistory={handleShowVersionHistory}
            onUndo={handleUndo}
            onRedo={handleRedo}
            versionHistory={versionHistory}
          />
      <div className="app-main">
        <EnhancedCanvas 
          ref={canvasRef}
          canvasState={canvasState}
          setCanvasState={setCanvasState}
          currentTool={currentTool}
          onSelectionChange={handleSelectionChange}
        />
        <PropertiesPanel 
          selectedShape={selectedShape}
          onShapeUpdate={handleShapeUpdate}
          onShapesUpdate={handleShapesUpdate}
          canvasState={canvasState}
          onCanvasUpdate={handleCanvasUpdate}
        />
      </div>
      
      {/* Version History Modal */}
      {showVersionHistory && (
        <VersionHistoryComponent
          history={versionHistory}
          onHistoryChange={setVersionHistory}
          onRestoreVersion={handleRestoreVersion}
          onClose={handleHideVersionHistory}
        />
      )}
      
      {storageUsage && (
        <div className="storage-indicator" style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: storageUsage.percentage > 80 ? '#ff6b6b' : '#51cf66',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          Storage: {storageUsage.percentage.toFixed(1)}% used
          {storageUsage.percentage > 80 && (
            <div style={{ fontSize: '10px', marginTop: '2px' }}>
              Consider clearing browser data
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  )
}

export default App 