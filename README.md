# UI Diagramming App

A Figma-like web application for quickly creating UI layout diagrams for frontend projects. Built with React, TypeScript, and SCSS.

## 🚀 Features (Phase 1 Complete)

### Core Functionality
- **Infinite Canvas**: Zoomable and pannable workspace with grid background
- **Shape Tools**: Draw rectangles and circles with click-and-drag
- **Element Properties**: Each shape becomes a designated HTML element (`<div>`, `<main>`, `<section>`, etc.)
- **Real-time Styling**: Change fill colors, border colors, border styles, and border width
- **Selection & Editing**: Click to select shapes and edit their properties
- **PNG Export**: Export your diagrams as high-quality PNG images

### User Interface
- **Left Toolbar**: Drawing tools, export button, and helpful instructions
- **Right Properties Panel**: Edit selected shape properties in real-time
- **Canvas**: Infinite drawing area with grid background
- **Responsive Design**: Clean, modern interface with consistent styling

### Navigation Controls
- **Mouse Wheel**: Zoom in/out (25% to 400%)
- **Middle Mouse Button**: Pan around the canvas
- **Click & Drag**: Draw shapes or select existing ones

## 🛠️ Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Modern SCSS with `@use` syntax
- **State Management**: React hooks (useState, useRef)
- **Development**: Hot module replacement, TypeScript compilation

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd diagram
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 🎯 How to Use

### Drawing Shapes
1. Select a tool from the left toolbar (Rectangle or Circle)
2. Click and drag on the canvas to draw
3. Release to finalize the shape

### Editing Properties
1. Click on any shape to select it
2. Use the properties panel on the right to modify:
   - Element tag (div, main, section, header, nav, aside, footer, article)
   - Fill color
   - Border color
   - Border width (0-10px)
   - Border style (solid, dotted, dashed)
   - Position (X, Y coordinates)
   - Size (width, height)

### Navigation
- **Zoom**: Use mouse wheel to zoom in/out
- **Pan**: Hold middle mouse button and drag to move around
- **Select**: Click on shapes to select them

### Export
- Click the "Export PNG" button in the toolbar
- The diagram will be downloaded as a PNG file

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Canvas.tsx      # Main drawing canvas
│   ├── Toolbar.tsx     # Left toolbar with tools
│   ├── PropertiesPanel.tsx # Right properties panel
│   └── *.scss          # Component styles (using @use syntax)
├── styles/             # Global styles
│   ├── variables.scss  # SCSS variables and design tokens
│   └── index.scss      # Global styles and utilities
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── helpers.ts
├── App.tsx             # Main app component
└── main.tsx            # App entry point
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Key Components

#### Canvas Component
- Handles all drawing interactions
- Manages zoom, pan, and shape rendering
- Coordinates mouse events and shape creation

#### Toolbar Component
- Provides drawing tools (Select, Rectangle, Circle)
- Export functionality
- Help text and instructions

#### PropertiesPanel Component
- Real-time property editing for selected shapes
- Color pickers, sliders, and input fields
- Dynamic updates as you edit

## 🎨 Design System

The app uses a consistent design system with:
- **Colors**: Primary blue (#2563eb), neutral grays, semantic colors
- **Typography**: System fonts with consistent sizing
- **Spacing**: Standardized spacing scale (xs, sm, md, lg, xl)
- **Shadows**: Subtle shadows for depth and hierarchy
- **Border Radius**: Consistent rounded corners

### SCSS Architecture
- **Modern `@use` syntax**: All SCSS files use the modern `@use` syntax with `as *` for global variable access
- **Design tokens**: Centralized variables in `src/styles/variables.scss`
- **Component-scoped styles**: Each component has its own SCSS file
- **Global utilities**: Common styles and utility classes in `src/styles/index.scss`

## 🔮 Future Phases

### Phase 2 (Planned)
- Advanced shapes (rounded rectangles, ellipses, lines, arrows, text boxes)
- Comprehensive styling (border radius, opacity, shadows)
- Typography options (font family, size, weight, alignment)
- HTML export functionality

### Phase 3 (Planned)
- Nesting system for parent-child relationships
- Layering and z-index management
- Alignment tools and snap-to-grid
- Grouping multiple elements

### Phase 4 (Planned)
- Save/load functionality with JSON files
- Auto-save and version history
- Performance optimizations
- UI polish and refinements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🐛 Known Issues

- Vite configuration needs optimization for production builds
- Some TypeScript strict mode warnings to be addressed
- Export functionality may need refinement for complex diagrams

## ✅ Recent Updates

- **Modernized SCSS**: Migrated from deprecated `@import` to modern `@use` syntax
- **Eliminated warnings**: Removed all Sass deprecation warnings
- **Future-proof**: Updated to React 19 and Vite 7
- **Clean architecture**: Improved SCSS organization with proper module imports

## 📞 Support

For questions or issues, please open an issue in the repository.
