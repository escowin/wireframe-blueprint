# Select Tool Drag and Resize Bug Fix

## Issue Description

The select tool was not allowing users to drag or resize existing elements. When users clicked on shapes with the select tool active, the shapes would be selected but subsequent mouse movements were being blocked, preventing any drag or resize operations.

## Root Cause Analysis

The issue was in the `handleMouseMove` function in `Canvas.tsx`. The function was designed only for drawing new shapes and would return early if `isDrawing` was false:

```typescript
if (!isDrawing || !drawStart || !canvasRef.current) {
  console.log('Mouse move blocked:', { isDrawing, drawStart: !!drawStart, canvasRef: !!canvasRef.current })
  return
}
```

This meant that when the select tool was active and users tried to drag or resize shapes, the mouse move events were being ignored because the drawing state was not active.

## Solution Implementation

### 1. Added New State Variables

Added state variables to track drag and resize operations:

```typescript
const [isDragging, setIsDragging] = useState(false)
const [isResizing, setIsResizing] = useState(false)
const [dragStart, setDragStart] = useState<Point | null>(null)
const [resizeStart, setResizeStart] = useState<{ point: Point; shape: Shape } | null>(null)
const [resizeHandle, setResizeHandle] = useState<string>('') // 'nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'
```

### 2. Enhanced Mouse Down Handler

Modified the mouse down handler to detect drag and resize operations:

- **Shape Selection**: When clicking on a shape, it gets selected
- **Resize Detection**: Checks if the click is on resize handles (corners or edges)
- **Drag Detection**: If not clicking on handles, initiates drag operation

```typescript
if (currentTool === 'select') {
  // Handle selection, drag, and resize
  const clickedShape = canvasState.shapes.slice().reverse().find(shape => {
    // ... shape detection logic
  })

  if (clickedShape) {
    // Check if clicking on resize handles
    const handleSize = 8
    const isOnHandle = (x: number, y: number, handleX: number, handleY: number) => {
      return Math.abs(x - handleX) <= handleSize && Math.abs(y - handleY) <= handleSize
    }

    // Check corners and edges for resize handles
    if (isOnHandle(screenPoint.x, screenPoint.y, screenPos.x, screenPos.y)) {
      setResizeHandle('nw')
      setIsResizing(true)
      setResizeStart({ point: canvasPoint, shape: clickedShape })
    }
    // ... more handle checks
    else {
      // Start dragging
      setIsDragging(true)
      setDragStart(canvasPoint)
    }
  }
}
```

### 3. Enhanced Mouse Move Handler

Updated the mouse move handler to support three operations:

- **Drawing**: Original functionality for creating new shapes
- **Dragging**: Move selected shapes by calculating delta and updating position
- **Resizing**: Resize selected shapes based on handle type and delta

```typescript
// Handle dragging
if (isDragging && dragStart && canvasState.selectedShapeId) {
  const deltaX = canvasPoint.x - dragStart.x
  const deltaY = canvasPoint.y - dragStart.y
  
  setCanvasState(prev => ({
    ...prev,
    shapes: prev.shapes.map(shape => 
      shape.id === prev.selectedShapeId 
        ? { ...shape, position: { x: shape.position.x + deltaX, y: shape.position.y + deltaY } }
        : shape
    )
  }))
  
  setDragStart(canvasPoint)
}

// Handle resizing
if (isResizing && resizeStart && canvasState.selectedShapeId) {
  const deltaX = canvasPoint.x - resizeStart.point.x
  const deltaY = canvasPoint.y - resizeStart.point.y
  const originalShape = resizeStart.shape
  
  let newPosition = { ...originalShape.position }
  let newSize = { ...originalShape.size }
  
  switch (resizeHandle) {
    case 'nw':
      newPosition.x = originalShape.position.x + deltaX
      newPosition.y = originalShape.position.y + deltaY
      newSize.width = Math.max(10, originalShape.size.width - deltaX)
      newSize.height = Math.max(10, originalShape.size.height - deltaY)
      break
    // ... more cases for different handles
  }
  
  setCanvasState(prev => ({
    ...prev,
    shapes: prev.shapes.map(shape => 
      shape.id === prev.selectedShapeId 
        ? { ...shape, position: newPosition, size: newSize }
        : shape
    )
  }))
}
```

### 4. Enhanced Mouse Up Handler

Updated to reset all operation states:

```typescript
// Reset all states
setIsDrawing(false)
setDrawStart(null)
setIsDragging(false)
setIsResizing(false)
setDragStart(null)
setResizeStart(null)
setResizeHandle('')
```

### 5. Added Resize Handles UI

Added visual resize handles for selected shapes:

```typescript
{/* Render resize handles for selected shapes */}
{isSelected && currentTool === 'select' && (
  <>
    {/* Corner handles */}
    <div
      className="resize-handle resize-handle-nw"
      style={{
        position: 'absolute',
        left: screenPos.x - 4,
        top: screenPos.y - 4,
        width: 8,
        height: 8,
        backgroundColor: '#3b82f6',
        border: '1px solid white',
        cursor: 'nw-resize',
        zIndex: shape.zIndex + 1
      }}
    />
    {/* ... more handles */}
  </>
)}
```

### 6. Added CSS Styles

Added styles for resize handles in `Canvas.scss`:

```scss
.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: #3b82f6;
  border: 1px solid white;
  border-radius: 2px;
  z-index: 1000;
  pointer-events: auto;
  
  &:hover {
    background-color: #2563eb;
    transform: scale(1.2);
  }
  
  &.resize-handle-nw { cursor: nw-resize; }
  &.resize-handle-ne { cursor: ne-resize; }
  // ... more cursor styles
}
```

## Testing

### Verification Steps

1. **Select Tool Activation**:
   - Switch to select tool
   - Verify tool is active in toolbar

2. **Shape Selection**:
   - Click on existing shapes
   - Verify shapes get selected (blue outline appears)
   - Verify resize handles appear around selected shape

3. **Drag Functionality**:
   - Click and drag on selected shape (not on handles)
   - Verify shape moves with mouse
   - Verify shape position updates correctly

4. **Resize Functionality**:
   - Click and drag on resize handles
   - Verify shape resizes correctly
   - Test all handle types (corners and edges)
   - Verify minimum size constraints (10px)

5. **State Management**:
   - Verify drag/resize operations complete on mouse up
   - Verify states reset properly
   - Verify no memory leaks or stuck states

### Console Logs

The implementation includes comprehensive logging to help debug issues:

- Mouse down events with tool and state information
- Mouse move events with operation states
- Mouse up events with state reset confirmation
- Shape selection and operation initiation

## Files Modified

1. **`src/components/Canvas.tsx`**:
   - Added drag/resize state variables
   - Enhanced mouse event handlers
   - Added resize handles rendering
   - Updated shape interaction logic

2. **`src/components/Canvas.scss`**:
   - Added resize handle styles
   - Added hover effects
   - Added cursor styles for different handle types

## Lessons Learned

1. **Event Handler Design**: Mouse event handlers should be designed to handle multiple operation types, not just drawing
2. **State Management**: Clear separation of different operation states prevents conflicts
3. **Visual Feedback**: Resize handles provide clear visual indication of available interactions
4. **Coordinate Systems**: Proper conversion between screen and canvas coordinates is crucial for accurate operations
5. **Minimum Constraints**: Enforcing minimum sizes prevents shapes from becoming unusable

## Future Improvements

1. **Snap to Grid**: Add grid snapping for precise positioning
2. **Multi-Select**: Support selecting and operating on multiple shapes
3. **Keyboard Shortcuts**: Add keyboard modifiers for constrained operations
4. **Undo/Redo**: Add operation history for drag and resize actions
5. **Performance**: Optimize for large numbers of shapes

---

**Date**: December 2024  
**Status**: ✅ Fixed  
**Tested**: ✅ Functional  
**Performance**: ✅ No impact  
**Production Ready**: ✅ Yes 