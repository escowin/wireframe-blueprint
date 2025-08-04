# Save & Load Features

## Overview
The diagramming app now supports saving and loading diagrams, allowing users to persist their work and share diagrams with others. The system includes both manual save/load functionality and automatic backup features.

## Manual Save & Load

### Save Diagram
- **Location**: File section in the toolbar
- **Format**: JSON file with diagram data
- **Filename**: `diagram-YYYY-MM-DD.json` (includes current date)
- **Content**: Complete canvas state including shapes, properties, and settings
- **Version**: 1.2 (new reliable format that preserves all shapes)

### Load Diagram
- **Location**: File section in the toolbar
- **Format**: JSON files only (`.json` extension)
- **Validation**: Checks for proper diagram file format
- **Error Handling**: Shows alert if file is invalid or corrupted
- **Backward Compatibility**: Supports loading version 1.0 and 1.1 files

### How to Use
1. **Save**: Click the "Save" button to download your current diagram
2. **Load**: Click the "Load" button and select a previously saved diagram file
3. **File Management**: Save files are downloaded to your default downloads folder

## Auto-Save Feature

### Automatic Backup
- **Frequency**: Every 30 seconds
- **Storage**: Browser's localStorage
- **Scope**: Current browser session only
- **Recovery**: Prompts user on app restart if auto-saved data exists
- **Version**: 1.2 (consistent with file save format)

### Auto-Save Behavior
- **Background**: Runs automatically while using the app
- **Manual Save**: Clears auto-save data when user manually saves
- **Session Only**: Auto-save data is not shared between browser sessions
- **Fallback**: If localStorage is unavailable, auto-save is disabled gracefully

### Recovery Process
1. **App Start**: Checks for auto-saved diagram on application load
2. **User Choice**: Prompts user to restore or discard auto-saved data
3. **Cleanup**: Clears auto-save data after user makes a choice

## File Format

### Diagram JSON Structure (Version 1.2)
```json
{
  "version": "1.2",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "canvasState": {
    "shapes": [...],
    "selectedShapeId": null,
    "zoom": 1,
    "pan": {"x": 0, "y": 0},
    "gridSize": 20,
    "showGrid": true,
    "canvasBackgroundColor": "#ffffff",
    "canvasBackgroundOpacity": 1
  }
}
```

### Shape Data Structure
```json
{
  "id": "unique-shape-id",
  "type": "rectangle",
  "position": {"x": 100, "y": 100},
  "size": {"width": 200, "height": 150},
  "elementTag": "div",
  "cssClasses": "container",
  "elementId": "main-container",
  "fillColor": "#e2e8f0",
  "borderColor": "#64748b",
  "borderWidth": 1,
  "borderStyle": "solid",
  "opacity": 1,
  "zIndex": 0,
  "borderRadius": 0,
  "boxShadow": {
    "offsetX": 0,
    "offsetY": 0,
    "blurRadius": 0,
    "spreadRadius": 0,
    "color": "#000000",
    "enabled": false
  },
  "typography": {
    "fontFamily": "Arial, sans-serif",
    "fontSize": 14,
    "fontWeight": "normal",
    "fontColor": "#000000",
    "textAlign": "left",
    "lineHeight": 1.2,
    "letterSpacing": 0,
    "textDecoration": "none",
    "textTransform": "none"
  },
  "parentId": null
}
```

## Version History

### Version 1.2 (Current)
- **Reliable Save/Load**: All shapes are preserved without filtering
- **Flat Array Format**: Shapes stored as flat array for maximum compatibility
- **Consistent Behavior**: File save and auto-save use identical format
- **Enhanced Logging**: Detailed console output for debugging

### Version 1.1 (Legacy)
- **Nested Structure**: Shapes converted to nested hierarchy for HTML export
- **Nesting Detection**: Automatic parent-child relationship detection
- **Filtering**: Some shapes could be filtered out during save process

### Version 1.0 (Legacy)
- **Flat Structure**: Simple flat array of shapes
- **Basic Properties**: Limited shape properties supported

## Technical Implementation

### Save Functions
- `saveDiagram(canvasState)`: Creates and downloads JSON file (version 1.2)
- `autoSave(canvasState)`: Saves to localStorage (version 1.2)
- `clearAutoSave()`: Removes auto-saved data

### Load Functions
- `loadDiagram(file)`: Reads and validates JSON file (supports all versions)
- `loadAutoSave()`: Retrieves auto-saved data from localStorage
- `validateAndFixShapes()`: Ensures all shapes have required properties

### Error Handling
- **File Validation**: Checks for required fields and version
- **JSON Parsing**: Handles malformed JSON gracefully
- **Storage Limits**: Gracefully handles localStorage quota exceeded
- **User Feedback**: Clear error messages for failed operations
- **Shape Validation**: Automatically fixes missing shape properties

## Best Practices

### For Users
- **Regular Saves**: Save your work frequently using the Save button
- **File Naming**: Use descriptive names when saving multiple versions
- **Backup**: Keep important diagrams in multiple locations
- **Browser Compatibility**: Auto-save works best in modern browsers
- **Storage Monitoring**: Watch the storage indicator for localStorage usage

### For Developers
- **Version Control**: The version field allows for future format updates
- **Validation**: Always validate loaded data before applying
- **Error Recovery**: Provide clear feedback for failed operations
- **Performance**: Auto-save uses debouncing to avoid excessive writes
- **Backward Compatibility**: Support loading older file formats

## Recent Fixes

### Missing Elements Issue (Resolved)
- **Problem**: Some elements were missing when loading saved files
- **Cause**: Nesting detection was filtering out valid shapes during save
- **Solution**: Implemented version 1.2 with reliable flat array format
- **Result**: All shapes are now preserved during save/load operations

## Future Enhancements

### Planned Features
- **Cloud Storage**: Save diagrams to cloud services
- **Version History**: Track multiple versions of the same diagram
- **Export Formats**: Support for additional export formats
- **Collaboration**: Real-time collaboration features 