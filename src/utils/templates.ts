import { TemplateCategory, Shape, Group } from '../types'

export interface Template {
  id: string
  name: string
  description: string
  category: 'layout' | 'ui' | 'navigation' | 'content'
  shapes: Shape[]
  groups: Group[]
  thumbnail?: string
}

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9)

// Helper function to create a shape with default properties
const createShape = (overrides: Partial<Shape>): Shape => ({
  id: generateId(),
  type: 'rectangle',
  position: { x: 0, y: 0 },
  size: { width: 100, height: 100 },
  elementTag: 'div',
  elementId: '',
  cssClasses: '',
  fillColor: '#ffffff',
  borderColor: '#000000',
  borderWidth: 1,
  borderStyle: 'solid',
  opacity: 1,
  zIndex: 1,
  borderRadius: 0,
  boxShadow: {
    offsetX: 0,
    offsetY: 0,
    blurRadius: 0,
    spreadRadius: 0,
    color: '#000000',
    enabled: false
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 14,
    fontWeight: 'normal',
    fontColor: '#000000',
    textAlign: 'left',
    lineHeight: 1.2,
    letterSpacing: 0,
    textDecoration: 'none',
    textTransform: 'none'
  },
  ...overrides
})

// Helper function to create a group
const createGroup = (overrides: Partial<Group>): Group => ({
  id: generateId(),
  name: 'Group',
  shapes: [],
  position: { x: 0, y: 0 },
  size: { width: 200, height: 200 },
  zIndex: 1,
  ...overrides
})

// Header Template
const headerTemplate: Template = {
  id: 'header-basic',
  name: 'Basic Header',
  description: 'Simple header with logo and navigation',
  category: 'navigation',
  shapes: [
    createShape({
      id: generateId(),
      position: { x: 50, y: 50 },
      size: { width: 800, height: 80 },
      elementTag: 'header',
      cssClasses: 'header',
      fillColor: '#f8f9fa',
      borderColor: '#dee2e6',
      borderWidth: 1,
      zIndex: 1
    }),
    createShape({
      id: generateId(),
      position: { x: 70, y: 70 },
      size: { width: 120, height: 40 },
      elementTag: 'div',
      cssClasses: 'logo',
      fillColor: '#007bff',
      borderColor: 'transparent',
      borderWidth: 0,
      zIndex: 2
    }),
    createShape({
      id: generateId(),
      position: { x: 220, y: 75 },
      size: { width: 60, height: 30 },
      elementTag: 'nav',
      cssClasses: 'nav-item',
      fillColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      zIndex: 2
    }),
    createShape({
      id: generateId(),
      position: { x: 300, y: 75 },
      size: { width: 60, height: 30 },
      elementTag: 'nav',
      cssClasses: 'nav-item',
      fillColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      zIndex: 2
    }),
    createShape({
      id: generateId(),
      position: { x: 380, y: 75 },
      size: { width: 60, height: 30 },
      elementTag: 'nav',
      cssClasses: 'nav-item',
      fillColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      zIndex: 2
    })
  ],
  groups: []
}

// Card Layout Template
const cardLayoutTemplate: Template = {
  id: 'card-layout',
  name: 'Card Layout',
  description: 'Three-column card layout',
  category: 'layout',
  shapes: [
    createShape({
      id: generateId(),
      position: { x: 50, y: 50 },
      size: { width: 250, height: 300 },
      elementTag: 'div',
      cssClasses: 'card',
      fillColor: '#ffffff',
      borderColor: '#dee2e6',
      borderWidth: 1,
      borderRadius: 8,
      boxShadow: {
        offsetX: 0,
        offsetY: 2,
        blurRadius: 4,
        spreadRadius: 0,
        color: 'rgba(0,0,0,0.1)',
        enabled: true
      },
      zIndex: 1
    }),
    createShape({
      id: generateId(),
      position: { x: 320, y: 50 },
      size: { width: 250, height: 300 },
      elementTag: 'div',
      cssClasses: 'card',
      fillColor: '#ffffff',
      borderColor: '#dee2e6',
      borderWidth: 1,
      borderRadius: 8,
      boxShadow: {
        offsetX: 0,
        offsetY: 2,
        blurRadius: 4,
        spreadRadius: 0,
        color: 'rgba(0,0,0,0.1)',
        enabled: true
      },
      zIndex: 1
    }),
    createShape({
      id: generateId(),
      position: { x: 590, y: 50 },
      size: { width: 250, height: 300 },
      elementTag: 'div',
      cssClasses: 'card',
      fillColor: '#ffffff',
      borderColor: '#dee2e6',
      borderWidth: 1,
      borderRadius: 8,
      boxShadow: {
        offsetX: 0,
        offsetY: 2,
        blurRadius: 4,
        spreadRadius: 0,
        color: 'rgba(0,0,0,0.1)',
        enabled: true
      },
      zIndex: 1
    })
  ],
  groups: []
}

// Sidebar Layout Template
const sidebarLayoutTemplate: Template = {
  id: 'sidebar-layout',
  name: 'Sidebar Layout',
  description: 'Sidebar with main content area',
  category: 'layout',
  shapes: [
    createShape({
      id: generateId(),
      position: { x: 50, y: 50 },
      size: { width: 200, height: 600 },
      elementTag: 'aside',
      cssClasses: 'sidebar',
      fillColor: '#f8f9fa',
      borderColor: '#dee2e6',
      borderWidth: 1,
      zIndex: 1
    }),
    createShape({
      id: generateId(),
      position: { x: 270, y: 50 },
      size: { width: 600, height: 600 },
      elementTag: 'main',
      cssClasses: 'main-content',
      fillColor: '#ffffff',
      borderColor: '#dee2e6',
      borderWidth: 1,
      zIndex: 1
    })
  ],
  groups: []
}

// Form Template
const formTemplate: Template = {
  id: 'form-basic',
  name: 'Contact Form',
  description: 'Basic contact form layout',
  category: 'ui',
  shapes: [
    createShape({
      id: generateId(),
      position: { x: 50, y: 50 },
      size: { width: 500, height: 400 },
      elementTag: 'form',
      cssClasses: 'contact-form',
      fillColor: '#ffffff',
      borderColor: '#dee2e6',
      borderWidth: 1,
      borderRadius: 8,
      zIndex: 1
    }),
    createShape({
      id: generateId(),
      position: { x: 80, y: 80 },
      size: { width: 440, height: 40 },
      elementTag: 'input',
      cssClasses: 'form-input',
      fillColor: '#ffffff',
      borderColor: '#ced4da',
      borderWidth: 1,
      borderRadius: 4,
      zIndex: 2
    }),
    createShape({
      id: generateId(),
      position: { x: 80, y: 140 },
      size: { width: 440, height: 40 },
      elementTag: 'input',
      cssClasses: 'form-input',
      fillColor: '#ffffff',
      borderColor: '#ced4da',
      borderWidth: 1,
      borderRadius: 4,
      zIndex: 2
    }),
    createShape({
      id: generateId(),
      position: { x: 80, y: 200 },
      size: { width: 440, height: 100 },
      elementTag: 'textarea',
      cssClasses: 'form-textarea',
      fillColor: '#ffffff',
      borderColor: '#ced4da',
      borderWidth: 1,
      borderRadius: 4,
      zIndex: 2
    }),
    createShape({
      id: generateId(),
      position: { x: 80, y: 320 },
      size: { width: 120, height: 40 },
      elementTag: 'button',
      cssClasses: 'btn btn-primary',
      fillColor: '#007bff',
      borderColor: '#007bff',
      borderWidth: 1,
      borderRadius: 4,
      zIndex: 2
    })
  ],
  groups: []
}

// Hero Section Template
const heroSectionTemplate: Template = {
  id: 'hero-section',
  name: 'Hero Section',
  description: 'Hero section with title and CTA',
  category: 'content',
  shapes: [
    createShape({
      id: generateId(),
      position: { x: 50, y: 50 },
      size: { width: 800, height: 400 },
      elementTag: 'section',
      cssClasses: 'hero-section',
      fillColor: '#f8f9fa',
      borderColor: 'transparent',
      borderWidth: 0,
      zIndex: 1
    }),
    createShape({
      id: generateId(),
      position: { x: 100, y: 120 },
      size: { width: 600, height: 60 },
      elementTag: 'h1',
      cssClasses: 'hero-title',
      fillColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      typography: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 48,
        fontWeight: 'bold',
        fontColor: '#212529',
        textAlign: 'center',
        lineHeight: 1.2,
        letterSpacing: 0,
        textDecoration: 'none',
        textTransform: 'none'
      },
      zIndex: 2
    }),
    createShape({
      id: generateId(),
      position: { x: 100, y: 200 },
      size: { width: 600, height: 40 },
      elementTag: 'p',
      cssClasses: 'hero-subtitle',
      fillColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      typography: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 18,
        fontWeight: 'normal',
        fontColor: '#6c757d',
        textAlign: 'center',
        lineHeight: 1.5,
        letterSpacing: 0,
        textDecoration: 'none',
        textTransform: 'none'
      },
      zIndex: 2
    }),
    createShape({
      id: generateId(),
      position: { x: 300, y: 280 },
      size: { width: 200, height: 50 },
      elementTag: 'button',
      cssClasses: 'btn btn-primary',
      fillColor: '#007bff',
      borderColor: '#007bff',
      borderWidth: 1,
      borderRadius: 6,
      zIndex: 2
    })
  ],
  groups: []
}

// Grid Layout Template
const gridLayoutTemplate: Template = {
  id: 'grid-layout',
  name: 'Grid Layout',
  description: '2x2 grid layout',
  category: 'layout',
  shapes: [
    createShape({
      id: generateId(),
      position: { x: 50, y: 50 },
      size: { width: 350, height: 250 },
      elementTag: 'div',
      cssClasses: 'grid-item',
      fillColor: '#e9ecef',
      borderColor: '#dee2e6',
      borderWidth: 1,
      zIndex: 1
    }),
    createShape({
      id: generateId(),
      position: { x: 420, y: 50 },
      size: { width: 350, height: 250 },
      elementTag: 'div',
      cssClasses: 'grid-item',
      fillColor: '#e9ecef',
      borderColor: '#dee2e6',
      borderWidth: 1,
      zIndex: 1
    }),
    createShape({
      id: generateId(),
      position: { x: 50, y: 320 },
      size: { width: 350, height: 250 },
      elementTag: 'div',
      cssClasses: 'grid-item',
      fillColor: '#e9ecef',
      borderColor: '#dee2e6',
      borderWidth: 1,
      zIndex: 1
    }),
    createShape({
      id: generateId(),
      position: { x: 420, y: 320 },
      size: { width: 350, height: 250 },
      elementTag: 'div',
      cssClasses: 'grid-item',
      fillColor: '#e9ecef',
      borderColor: '#dee2e6',
      borderWidth: 1,
      zIndex: 1
    })
  ],
  groups: []
}

// Footer Template
const footerTemplate: Template = {
  id: 'footer-basic',
  name: 'Basic Footer',
  description: 'Simple footer with links',
  category: 'navigation',
  shapes: [
    createShape({
      id: generateId(),
      position: { x: 50, y: 50 },
      size: { width: 800, height: 120 },
      elementTag: 'footer',
      cssClasses: 'footer',
      fillColor: '#343a40',
      borderColor: 'transparent',
      borderWidth: 0,
      zIndex: 1
    }),
    createShape({
      id: generateId(),
      position: { x: 80, y: 80 },
      size: { width: 200, height: 20 },
      elementTag: 'div',
      cssClasses: 'footer-section',
      fillColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      typography: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'normal',
        fontColor: '#ffffff',
        textAlign: 'left',
        lineHeight: 1.2,
        letterSpacing: 0,
        textDecoration: 'none',
        textTransform: 'none'
      },
      zIndex: 2
    }),
    createShape({
      id: generateId(),
      position: { x: 300, y: 80 },
      size: { width: 200, height: 20 },
      elementTag: 'div',
      cssClasses: 'footer-section',
      fillColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      typography: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'normal',
        fontColor: '#ffffff',
        textAlign: 'left',
        lineHeight: 1.2,
        letterSpacing: 0,
        textDecoration: 'none',
        textTransform: 'none'
      },
      zIndex: 2
    }),
    createShape({
      id: generateId(),
      position: { x: 520, y: 80 },
      size: { width: 200, height: 20 },
      elementTag: 'div',
      cssClasses: 'footer-section',
      fillColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      typography: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        fontWeight: 'normal',
        fontColor: '#ffffff',
        textAlign: 'left',
        lineHeight: 1.2,
        letterSpacing: 0,
        textDecoration: 'none',
        textTransform: 'none'
      },
      zIndex: 2
    })
  ],
  groups: []
}

// Template categories
export const templateCategories: TemplateCategory[] = [
  {
    id: 'layout',
    name: 'Layouts',
    description: 'Page layout templates',
    templates: [cardLayoutTemplate, sidebarLayoutTemplate, gridLayoutTemplate]
  },
  {
    id: 'navigation',
    name: 'Navigation',
    description: 'Header and footer templates',
    templates: [headerTemplate, footerTemplate]
  },
  {
    id: 'ui',
    name: 'UI Components',
    description: 'Form and component templates',
    templates: [formTemplate]
  },
  {
    id: 'content',
    name: 'Content',
    description: 'Content section templates',
    templates: [heroSectionTemplate]
  }
]

// Get all templates
export const getAllTemplates = (): Template[] => {
  return templateCategories.flatMap(category => category.templates)
}

// Get template by ID
export const getTemplateById = (id: string): Template | undefined => {
  return getAllTemplates().find(template => template.id === id)
}

// Get templates by category
export const getTemplatesByCategory = (categoryId: string): Template[] => {
  const category = templateCategories.find(cat => cat.id === categoryId)
  return category ? category.templates : []
} 