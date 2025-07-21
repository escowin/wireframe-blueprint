# Documentation Directory

This directory contains comprehensive documentation for the diagram application, including bug fixes, debugging guides, and development resources.

## 📁 Files

### Bug Fix Documentation
- **[`canvas-drawing-bug-fix.md`](./canvas-drawing-bug-fix.md)** - Complete documentation of the canvas drawing bug fix, including root cause analysis, solution implementation, and lessons learned.
- **[`select-tool-drag-resize-fix.md`](./select-tool-drag-resize-fix.md)** - Documentation of the select tool drag and resize functionality fix, including implementation details and testing procedures.

### Current Issues
- **[`resize-issues-documentation.md`](./resize-issues-documentation.md)** - Documentation of current resize functionality issues including mousewheel console errors and click & drag resize difficulty.

### Debugging Resources
- **[`debugging-guide.md`](./debugging-guide.md)** - Quick reference guide for debugging common canvas issues, including symptoms, solutions, and diagnostic commands.

## 🎯 Quick Navigation

### For Developers
- **New to the project?** Start with the [debugging guide](./debugging-guide.md) to understand common issues
- **Fixing a bug?** Check the [canvas drawing bug fix](./canvas-drawing-bug-fix.md) and [select tool fix](./select-tool-drag-resize-fix.md) for comprehensive solutions
- **Need quick fixes?** Use the debugging checklist in the [debugging guide](./debugging-guide.md)

### For QA/Testing
- **Testing canvas functionality?** Use the verification steps in the [bug fix documentation](./canvas-drawing-bug-fix.md) and [select tool documentation](./select-tool-drag-resize-fix.md)
- **Reporting issues?** Reference the debugging tools and diagnostic commands

## 🔧 Common Issues & Solutions

### Canvas Not Responding to Mouse Events
**Quick Fix**: Check canvas dimensions and CSS layout
**Reference**: [Debugging Guide - Canvas Not Receiving Mouse Events](./debugging-guide.md#issue-canvas-not-receiving-mouse-events)

### Drawing State Not Updating
**Quick Fix**: Verify useCallback dependencies and state management
**Reference**: [Debugging Guide - Drawing State Not Updating](./debugging-guide.md#issue-drawing-state-not-updating)

### Text Selection Interfering with Drawing
**Quick Fix**: Add CSS and JavaScript text selection prevention
**Reference**: [Debugging Guide - Text Selection Interfering](./debugging-guide.md#issue-text-selection-interfering)

### Resize Functionality Issues
**Quick Fix**: Check handle detection logic and mousewheel event handling
**Reference**: [Resize Issues Documentation](./resize-issues-documentation.md)

## 📋 Development Workflow

### When Debugging Canvas Issues
1. **Check visual debug elements** - Look for colored borders and debug boxes
2. **Review console logs** - Check for mouse events and canvas dimensions
3. **Verify CSS layout** - Ensure proper dimensions and positioning
4. **Test event handlers** - Confirm events are reaching the canvas

### Before Production Deployment
1. **Remove debug elements** - Clean up visual debugging and console logs
2. **Test functionality** - Verify drawing works in all scenarios
3. **Check performance** - Ensure no debug code impacts performance
4. **Update documentation** - Document any new issues or solutions

## 🚀 Quick Commands

### Check Canvas Dimensions
```javascript
// In browser console
const canvas = document.querySelector('.canvas')
const rect = canvas.getBoundingClientRect()
console.log('Canvas:', { width: rect.width, height: rect.height })
```

### Test Mouse Events
```javascript
// In browser console
const canvas = document.querySelector('.canvas')
canvas.addEventListener('click', () => console.log('Canvas clicked!'))
```

### Check CSS Styles
```javascript
// In browser console
const canvas = document.querySelector('.canvas')
const styles = window.getComputedStyle(canvas)
console.log('Canvas styles:', { width: styles.width, height: styles.height })
```

## 📝 Contributing

When adding new documentation:
1. **Use clear, descriptive filenames**
2. **Include comprehensive examples**
3. **Add quick reference sections**
4. **Update this README with new file references**
5. **Include version and date information**

## 🔄 Maintenance

### Regular Updates
- **Review debugging guides** monthly for accuracy
- **Update bug fix documentation** when new issues are resolved
- **Add new common issues** as they are discovered
- **Clean up outdated information** regularly

### Version Control
- **Tag documentation versions** with application releases
- **Archive old documentation** when no longer relevant
- **Maintain changelog** for documentation updates

---

**Last Updated**: [Current Date]  
**Version**: 1.0  
**Status**: ✅ Active 