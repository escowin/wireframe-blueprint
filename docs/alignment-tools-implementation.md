# Alignment Tools Implementation

## Overview

The alignment tools feature has been successfully implemented in the diagram application, providing users with powerful layout and positioning capabilities. This implementation includes snap-to-grid, snap-to-edges, alignment tools, and distribution tools.

## Features Implemented

### 1. Snap to Grid
- **Functionality**: Automatically snaps shapes to a configurable grid
- **Grid Size**: Configurable (default: 20px)
- **Toggle**: Can be enabled/disabled via toolbar
- **Usage**: Applied during drag and resize operations

### 2. Snap to Edges
- **Functionality**: Snaps shapes to edges and centers of other shapes
- **Snap Distance**: 5px threshold
- **Targets**: Left, right, top, bottom edges and centers
- **Toggle**: Can be enabled/disabled via toolbar

### 3. Alignment Tools
- **Horizontal Alignment**:
  - Align Left (⇤): Aligns shapes to the left edge of the first selected shape
  - Align Center (⇔): Aligns shapes to the center of the first selected shape
  - Align Right (⇥): Aligns shapes to the right edge of the first selected shape
- **Vertical Alignment**:
  - Align Top (⇧): Aligns shapes to the top edge of the first selected shape
  - Align Middle (⇕): Aligns shapes to the middle of the first selected shape
  - Align Bottom (⇩): Aligns shapes to the bottom edge of the first selected shape

### 4. Distribution Tools
- **Distribute Horizontally (⇹)**: Evenly distributes 3+ shapes horizontally
- **Distribute Vertically (⇳)**: Evenly distributes 3+ shapes vertically

### 5. Multiple Selection
- **Single Click**: Selects a single shape
- **Ctrl/Cmd + Click**: Adds/removes shapes from selection
- **Canvas Click**: Deselects all shapes
- **Visual Feedback**: Selected shapes show selection indicators

## Technical Implementation

### 1. Type Definitions (`src/types/index.ts`)

```typescript
export interface CanvasState {
  // ... existing properties
  snapToGrid: boolean
  snapToEdges: boolean
  gridSnapSize: number
}

export type AlignmentAction = 
  | 'align-left' 
  | 'align-center' 
  | 'align-right' 
  | 'align-top' 
  | 'align-middle' 
  | 'align-bottom'
  | 'distribute-horizontal'
  | 'distribute-vertical'
  | 'snap-to-grid'
  | 'snap-to-edges'
```

### 2. Utility Functions (`src/utils/helpers.ts`)

#### Snap to Grid
```typescript
export const snapToGridValue = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize
}

export const snapToGridPoint = (point: Point, gridSize: number): Point => {
  return {
    x: snapToGridValue(point.x, gridSize),
    y: snapToGridValue(point.y, gridSize)
  }
}
```

#### Snap to Edges
```typescript
export const snapToEdges = (shapes: Shape[], targetShape: Shape, snapDistance: number = 5): Point => {
  // Implements edge and center snapping logic
}
```

#### Alignment
```typescript
export const alignShapes = (shapes: Shape[], selectedShapeIds: string[], alignment: string): Shape[] => {
  // Implements alignment logic for all alignment types
}
```

#### Distribution
```typescript
export const distributeShapes = (shapes: Shape[], selectedShapeIds: string[], distribution: string): Shape[] => {
  // Implements distribution logic for horizontal and vertical distribution
}
```

### 3. Component Updates

#### App Component (`src/App.tsx`)
- Added `selectedShapeIds` state for multiple selection
- Added `handleAlignmentAction` for processing alignment operations
- Added `handleSelectionChange` for managing selection state
- Updated props passed to Toolbar and Canvas components

#### Toolbar Component (`src/components/Toolbar.tsx`)
- Added alignment tools section with buttons for all alignment operations
- Added snap settings section with toggle buttons
- Implemented proper button states (enabled/disabled based on selection)
- Added comprehensive styling for alignment buttons

#### Canvas Component (`src/components/Canvas.tsx`)
- Added multiple selection support with Ctrl/Cmd + click
- Integrated snapping during drag and resize operations
- Added selection change callback
- Updated shape rendering to show multiple selection

### 4. Styling (`src/components/Toolbar.scss`)

```scss
// Alignment Tools Styles
.alignment-buttons {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  
  .alignment-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: $spacing-xs;
  }
}

// Snap Settings Styles
.snap-buttons {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}
```

## Usage Instructions

### Basic Alignment
1. **Select Multiple Shapes**: Click on shapes while holding Ctrl (or Cmd on Mac)
2. **Choose Alignment**: Use the alignment buttons in the toolbar
3. **Apply**: Click the desired alignment button (left, center, right, top, middle, bottom)

### Distribution
1. **Select 3+ Shapes**: Select at least 3 shapes using Ctrl/Cmd + click
2. **Choose Distribution**: Use the distribution buttons (horizontal or vertical)
3. **Apply**: Click the desired distribution button

### Snap Settings
1. **Toggle Grid Snap**: Click "Grid Snap" button to enable/disable
2. **Toggle Edge Snap**: Click "Edge Snap" button to enable/disable
3. **Visual Feedback**: Active snap settings show as primary buttons

### Keyboard Shortcuts
- **Ctrl/Cmd + Click**: Add/remove shape from selection
- **Click on Canvas**: Deselect all shapes
- **Drag**: Move shapes with snapping applied
- **Resize**: Resize shapes with snapping applied

## Testing

A comprehensive test suite has been created (`src/utils/test-alignment-tools.js`) that verifies:
- Snap to grid functionality
- Alignment operations
- Distribution calculations
- Edge case handling

## Performance Considerations

- Snapping calculations are optimized to only run during drag/resize operations
- Multiple selection state is managed efficiently
- Alignment operations are batched to minimize re-renders
- Grid snapping uses simple mathematical operations for speed

## Future Enhancements

Potential improvements for future iterations:
1. **Smart Guides**: Visual guides during alignment operations
2. **Custom Grid**: User-defined grid patterns
3. **Snap Lines**: Visual snap lines during dragging
4. **Alignment History**: Undo/redo for alignment operations
5. **Keyboard Shortcuts**: Direct keyboard shortcuts for alignment operations
6. **Alignment Presets**: Save and reuse alignment configurations

## Integration with Existing Features

The alignment tools integrate seamlessly with:
- **Nesting System**: Alignment works with nested shapes
- **Layer Management**: Aligned shapes maintain their layer order
- **Export System**: Aligned layouts are preserved in exports
- **Save/Load**: Alignment settings are saved with diagrams
- **Auto-save**: Alignment changes are automatically saved

## Conclusion

The alignment tools implementation provides a comprehensive set of layout and positioning features that significantly enhance the diagram creation experience. The implementation is robust, performant, and well-integrated with the existing codebase. 