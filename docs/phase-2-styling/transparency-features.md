# Transparency Features

## Overview
The diagramming app now supports transparent fill colors for shapes and transparent canvas backgrounds. This allows users to create more sophisticated designs with layered elements and transparent overlays while maintaining clear visibility of borders and labels.

## Shape Transparency

### Individual Shape Fill Opacity
- Each shape now has an `opacity` property that can be adjusted from 0% (completely transparent) to 100% (fully opaque)
- The opacity control is available in the Properties Panel when a shape is selected
- A visual preview shows the current opacity level with a checkerboard pattern background
- Opacity is applied only to the fill color, keeping borders and labels fully visible
- This provides better usability for UI design where structure should remain visible

### How to Use Shape Transparency
1. Select any shape on the canvas
2. In the Properties Panel, find the "Opacity" section
3. Use the slider to adjust opacity from 0 to 1 (0% to 100%)
4. The preview box shows the current transparency level
5. Changes are applied immediately to the selected shape

## Canvas Background Transparency

### Canvas Background Controls
- The canvas background now has independent color and opacity controls
- These controls are available in the Properties Panel when no shape is selected
- The canvas background opacity affects the entire canvas area
- Canvas transparency is useful for creating overlay effects or transparent backgrounds

### How to Use Canvas Background Transparency
1. Click on empty space on the canvas (deselect all shapes)
2. In the Properties Panel, you'll see "Canvas Properties"
3. Adjust the "Background Color" using the color picker
4. Adjust the "Background Opacity" using the slider (0% to 100%)
5. The preview box shows the current background transparency

## Visual Indicators

### Checkerboard Pattern
- Color inputs now display a checkerboard pattern to make transparency more visible
- This pattern appears behind transparent colors to help distinguish them from solid colors
- The pattern is also used in opacity preview boxes

### Opacity Preview
- Each opacity control includes a small preview box
- The preview shows the actual color with the current opacity applied
- For shape opacity, the preview includes a border to demonstrate that borders remain visible
- This helps users understand how the transparency will look before applying it

## Export Support

### PNG Export
- Transparency is preserved when exporting to PNG format
- Transparent areas will appear transparent in the exported image
- The canvas background transparency is included in the export

### HTML Export
- Opacity values are included in the generated HTML as `rgba()` background colors
- The exported HTML will maintain the same transparency levels as the design
- Example: `<div style="background-color: rgba(255, 0, 0, 0.5);">` for 50% transparent red

## Technical Implementation

### Shape Interface
```typescript
interface Shape {
  // ... other properties
  opacity: number // 0 to 1 - affects only fill color
}
```

### Canvas State
```typescript
interface CanvasState {
  // ... other properties
  canvasBackgroundColor: string
  canvasBackgroundOpacity: number
}
```

### CSS Properties
- Individual shapes use `rgba()` background colors for fill transparency
- Canvas background uses `rgba()` background colors for transparency
- Borders and labels remain fully opaque for better visibility
- Checkerboard patterns are created using CSS gradients
- `hexToRgba()` helper function converts hex colors to rgba with opacity

## Best Practices

### Design Tips
- Use transparency to create depth and layering effects
- Combine transparent fill colors with solid borders for better definition
- Borders and labels remain visible even with transparent fills
- Consider the final export format when using transparency
- Use the preview boxes to fine-tune opacity levels

### Performance Considerations
- High transparency levels may affect rendering performance with many shapes
- Consider using solid colors for large background elements
- Export performance is optimized for typical transparency usage

## Future Enhancements
- Support for alpha channel in color pickers
- Advanced blending modes
- Layer-based transparency controls
- Transparency presets and templates 