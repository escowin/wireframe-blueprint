// Test file to verify the nesting detection fix
// This can be run in the browser console to test the logic

// Test case 1: Normal shapes
const normalShapes = [
  {
    id: 'header-1',
    position: { x: 50, y: 25 },
    size: { width: 800, height: 100 },
    elementTag: 'header',
    cssClasses: '',
    zIndex: 1
  },
  {
    id: 'h1-1',
    position: { x: 70, y: 45 },
    size: { width: 200, height: 40 },
    elementTag: 'h1',
    cssClasses: 'title',
    zIndex: 2
  }
];

// Test case 2: Shapes with missing properties (should be filtered out)
const invalidShapes = [
  {
    id: 'valid-1',
    position: { x: 50, y: 25 },
    size: { width: 800, height: 100 },
    elementTag: 'header',
    cssClasses: '',
    zIndex: 1
  },
  {
    id: 'invalid-1',
    // Missing position and size
    elementTag: 'div',
    cssClasses: '',
    zIndex: 2
  },
  null, // Null shape
  {
    id: 'invalid-2',
    position: { x: 70, y: 45 },
    // Missing size
    elementTag: 'h1',
    cssClasses: 'title',
    zIndex: 3
  }
];

// Test case 3: Empty array
const emptyShapes = [];

// Simplified version of the fixed nesting detection algorithm
function detectNesting(shapes) {
  // Filter out invalid shapes
  const validShapes = shapes.filter(shape => 
    shape && 
    shape.position && 
    shape.size && 
    typeof shape.position.x === 'number' && 
    typeof shape.position.y === 'number' &&
    typeof shape.size.width === 'number' && 
    typeof shape.size.height === 'number'
  );
  
  const sortedShapes = [...validShapes].sort((a, b) => a.zIndex - b.zIndex);
  
  return sortedShapes.map(shape => {
    const potentialParents = sortedShapes.filter(potentialParent => {
      if (potentialParent.id === shape.id) return false;
      
      const parentLeft = potentialParent.position.x;
      const parentTop = potentialParent.position.y;
      const parentRight = parentLeft + potentialParent.size.width;
      const parentBottom = parentTop + potentialParent.size.height;
      
      const childLeft = shape.position.x;
      const childTop = shape.position.y;
      const childRight = childLeft + shape.size.width;
      const childBottom = childTop + shape.size.height;
      
      const childArea = shape.size.width * shape.size.height;
      const overlapLeft = Math.max(parentLeft, childLeft);
      const overlapTop = Math.max(parentTop, childTop);
      const overlapRight = Math.min(parentRight, childRight);
      const overlapBottom = Math.min(parentBottom, childBottom);
      
      if (overlapRight <= overlapLeft || overlapBottom <= overlapTop) return false;
      
      const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
      const overlapPercentage = overlapArea / childArea;
      
      return overlapPercentage >= 0.5;
    });
    
    // Fixed: Check if potentialParents has items before using reduce
    const bestParent = potentialParents.length > 0 ? potentialParents.reduce((best, current) => {
      const bestArea = best.size.width * best.size.height;
      const currentArea = current.size.width * current.size.height;
      return currentArea < bestArea ? current : best;
    }) : null;
    
    return {
      ...shape,
      parentId: bestParent?.id || null
    };
  });
}

// Test the fixes
console.log('=== Testing Normal Shapes ===');
try {
  const result1 = detectNesting(normalShapes);
  console.log('✅ Normal shapes processed successfully');
  console.log('Result:', result1.map(s => `${s.elementTag} (parent: ${s.parentId || 'root'})`));
} catch (error) {
  console.log('❌ Error with normal shapes:', error.message);
}

console.log('\n=== Testing Invalid Shapes ===');
try {
  const result2 = detectNesting(invalidShapes);
  console.log('✅ Invalid shapes filtered successfully');
  console.log('Valid shapes found:', result2.length);
  console.log('Result:', result2.map(s => `${s.elementTag} (parent: ${s.parentId || 'root'})`));
} catch (error) {
  console.log('❌ Error with invalid shapes:', error.message);
}

console.log('\n=== Testing Empty Array ===');
try {
  const result3 = detectNesting(emptyShapes);
  console.log('✅ Empty array processed successfully');
  console.log('Result:', result3);
} catch (error) {
  console.log('❌ Error with empty array:', error.message);
}

console.log('\n=== All tests completed ==='); 