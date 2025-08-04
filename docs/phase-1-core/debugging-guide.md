# Canvas Debugging Quick Reference Guide

## 🚨 Common Canvas Issues & Solutions

### Issue: Canvas Not Receiving Mouse Events

**Symptoms**:
- Tool selection works but drawing doesn't
- No mouse event console logs
- Canvas appears to be "dead"

**Quick Fixes**:
1. **Check Canvas Dimensions**:
   ```typescript
   if (canvasRef.current) {
     const rect = canvasRef.current.getBoundingClientRect()
     console.log('Canvas dimensions:', {
       width: rect.width,
       height: rect.height,
       visible: rect.width > 0 && rect.height > 0
     })
   }
   ```

2. **Add Visual Debug Elements**:
   ```typescript
   <div style={{ 
     position: 'absolute', 
     top: '10px', 
     left: '10px', 
     background: 'red', 
     color: 'white', 
     padding: '5px',
     zIndex: 1000
   }}>
     Canvas Debug: {currentTool} | Drawing: {isDrawing ? 'Yes' : 'No'}
   </div>
   ```

3. **Verify CSS Layout**:
   ```scss
   .canvas-container {
     flex: 1;
     min-height: 400px;
     min-width: 400px;
     width: 100%;
     height: 100%;
   }
   
   .canvas {
     width: 100%;
     height: 100%;
     min-height: 400px;
     min-width: 400px;
   }
   ```

### Issue: Drawing State Not Updating

**Symptoms**:
- Mouse events work but `isDrawing` stays false
- No shape preview during drag

**Quick Fixes**:
1. **Check useCallback Dependencies**:
   ```typescript
   const handleMouseDown = useCallback((e: React.MouseEvent) => {
     // ... handler logic
   }, [currentTool, canvasState.shapes, screenToCanvas, canvasToScreen, setCanvasState, isDrawing])
   ```

2. **Add State Debugging**:
   ```typescript
   console.log('Drawing state:', { isDrawing, drawStart, currentTool })
   ```

### Issue: Text Selection Interfering

**Symptoms**:
- Text gets highlighted instead of drawing
- Drawing works but text selection occurs

**Quick Fixes**:
1. **Add CSS Prevention**:
   ```scss
   .canvas-container, .canvas {
     user-select: none;
     -webkit-user-select: none;
     -moz-user-select: none;
     -ms-user-select: none;
   }
   ```

2. **Add JavaScript Prevention**:
   ```typescript
   if (currentTool !== 'select') {
     e.preventDefault()
     document.body.style.userSelect = 'none'
   }
   ```

## 🔧 Debugging Tools

### Visual Debug Elements
```typescript
// Add these to Canvas component for debugging
<div style={{ 
  position: 'fixed', 
  top: '50px', 
  left: '50px', 
  background: 'lime', 
  color: 'black', 
  padding: '10px',
  zIndex: 9999
}}>
  DEBUG: Canvas is rendering
</div>
```

### Console Debugging
```typescript
// Add comprehensive logging
console.log('Canvas rendering with:', { currentTool, isDrawing, shapesCount: canvasState.shapes.length })
console.log('Mouse event:', { type: 'mousedown', currentTool, isDrawing })
console.log('Canvas dimensions:', { width: rect.width, height: rect.height })
```

### Event Testing
```typescript
// Test multiple event types
onMouseDown={() => console.log('Mouse down')}
onPointerDown={() => console.log('Pointer down')}
onClick={() => console.log('Click')}
onMouseEnter={() => console.log('Mouse enter')}
```

## 📋 Debugging Checklist

### Layout Issues
- [ ] Canvas container has proper dimensions
- [ ] Canvas element is visible and positioned
- [ ] No overlapping elements blocking events
- [ ] CSS flexbox layout is working

### Event Issues
- [ ] Mouse events are reaching the canvas
- [ ] Event handlers are properly bound
- [ ] useCallback dependencies are complete
- [ ] No event.preventDefault() blocking events

### State Issues
- [ ] Drawing state updates properly
- [ ] Tool selection works
- [ ] Shape creation logic executes
- [ ] State setters are working

### CSS Issues
- [ ] Text selection is prevented
- [ ] Cursor changes appropriately
- [ ] Elements are properly sized
- [ ] No conflicting styles

## 🎯 Quick Diagnostic Commands

### Check Canvas Dimensions
```javascript
// In browser console
const canvas = document.querySelector('.canvas')
const rect = canvas.getBoundingClientRect()
console.log('Canvas:', { width: rect.width, height: rect.height, visible: rect.width > 0 && rect.height > 0 })
```

### Check Event Listeners
```javascript
// In browser console
const canvas = document.querySelector('.canvas')
console.log('Event listeners:', getEventListeners(canvas))
```

### Check CSS Computed Styles
```javascript
// In browser console
const canvas = document.querySelector('.canvas')
const styles = window.getComputedStyle(canvas)
console.log('Canvas styles:', {
  width: styles.width,
  height: styles.height,
  position: styles.position,
  display: styles.display
})
```

## 🚀 Production Cleanup

### Remove Debug Elements
```typescript
// Remove these before production
- Visual debug borders and boxes
- Console.log statements
- Dimension checking code
- Event verification handlers
```

### Keep Essential Elements
```typescript
// Keep these for production
- Proper CSS dimensions
- Event handlers
- State management
- Error handling
```

---

**Last Updated**: [Current Date]  
**Version**: 1.0  
**Status**: ✅ Active 