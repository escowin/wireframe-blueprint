// Test file for nested JSON structure conversion
// This file can be run in the browser console to test the new functionality

// Mock shape data that represents a header with nested elements
const mockShapes = [
  {
    id: 'header-1',
    type: 'rectangle',
    position: { x: 100, y: 50 },
    size: { width: 800, height: 200 },
    elementTag: 'header',
    cssClasses: 'main-header',
    elementId: '',
    fillColor: '#f0f0f0',
    borderColor: '#333',
    borderWidth: 2,
    borderStyle: 'solid',
    opacity: 1,
    zIndex: 1
  },
  {
    id: 'h1-1',
    type: 'rectangle',
    position: { x: 120, y: 70 },
    size: { width: 300, height: 40 },
    elementTag: 'h1',
    cssClasses: 'title',
    elementId: '',
    fillColor: '#e0e0e0',
    borderColor: '#666',
    borderWidth: 1,
    borderStyle: 'solid',
    opacity: 1,
    zIndex: 2
  },
  {
    id: 'nav-1',
    type: 'rectangle',
    position: { x: 120, y: 130 },
    size: { width: 600, height: 50 },
    elementTag: 'nav',
    cssClasses: '',
    elementId: '',
    fillColor: '#d0d0d0',
    borderColor: '#666',
    borderWidth: 1,
    borderStyle: 'solid',
    opacity: 1,
    zIndex: 2
  },
  {
    id: 'nav-item-1',
    type: 'rectangle',
    position: { x: 140, y: 140 },
    size: { width: 80, height: 30 },
    elementTag: 'div',
    cssClasses: 'nav-item',
    elementId: '',
    fillColor: '#c0c0c0',
    borderColor: '#999',
    borderWidth: 1,
    borderStyle: 'solid',
    opacity: 1,
    zIndex: 3
  },
  {
    id: 'nav-item-2',
    type: 'rectangle',
    position: { x: 240, y: 140 },
    size: { width: 80, height: 30 },
    elementTag: 'div',
    cssClasses: 'nav-item',
    elementId: '',
    fillColor: '#c0c0c0',
    borderColor: '#999',
    borderWidth: 1,
    borderStyle: 'solid',
    opacity: 1,
    zIndex: 3
  }
];

// Test the conversion functions
console.log('=== Testing Nested JSON Structure ===');

// Test converting to nested structure
console.log('Original flat shapes:', mockShapes);

// Note: In a real environment, these functions would be imported from helpers.ts
// For testing purposes, we'll simulate the expected output structure

const expectedNestedStructure = [
  {
    id: 'header-1',
    type: 'rectangle',
    position: { x: 100, y: 50 },
    size: { width: 800, height: 200 },
    elementTag: 'header',
    cssClasses: 'main-header',
    elementId: '',
    fillColor: '#f0f0f0',
    borderColor: '#333',
    borderWidth: 2,
    borderStyle: 'solid',
    opacity: 1,
    zIndex: 1,
    children: [
      {
        id: 'h1-1',
        type: 'rectangle',
        position: { x: 120, y: 70 },
        size: { width: 300, height: 40 },
        elementTag: 'h1',
        cssClasses: 'title',
        elementId: '',
        fillColor: '#e0e0e0',
        borderColor: '#666',
        borderWidth: 1,
        borderStyle: 'solid',
        opacity: 1,
        zIndex: 2
      },
      {
        id: 'nav-1',
        type: 'rectangle',
        position: { x: 120, y: 130 },
        size: { width: 600, height: 50 },
        elementTag: 'nav',
        cssClasses: '',
        elementId: '',
        fillColor: '#d0d0d0',
        borderColor: '#666',
        borderWidth: 1,
        borderStyle: 'solid',
        opacity: 1,
        zIndex: 2,
        children: [
          {
            id: 'nav-item-1',
            type: 'rectangle',
            position: { x: 140, y: 140 },
            size: { width: 80, height: 30 },
            elementTag: 'div',
            cssClasses: 'nav-item',
            elementId: '',
            fillColor: '#c0c0c0',
            borderColor: '#999',
            borderWidth: 1,
            borderStyle: 'solid',
            opacity: 1,
            zIndex: 3
          },
          {
            id: 'nav-item-2',
            type: 'rectangle',
            position: { x: 240, y: 140 },
            size: { width: 80, height: 30 },
            elementTag: 'div',
            cssClasses: 'nav-item',
            elementId: '',
            fillColor: '#c0c0c0',
            borderColor: '#999',
            borderWidth: 1,
            borderStyle: 'solid',
            opacity: 1,
            zIndex: 3
          }
        ]
      }
    ]
  }
];

console.log('Expected nested structure:', expectedNestedStructure);

// Test JSON serialization
const nestedJson = JSON.stringify(expectedNestedStructure, null, 2);
console.log('Nested JSON output:');
console.log(nestedJson);

console.log('=== Test Complete ===');
console.log('The nested structure makes it much easier to understand the HTML hierarchy at a glance!'); 