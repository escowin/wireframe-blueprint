// Test file for nesting detection algorithm
// This can be run in the browser console to test the logic

// Sample shapes representing the visual structure from the diagram
const testShapes = [
  // Header container
  {
    id: 'header-1',
    position: { x: 50, y: 25 },
    size: { width: 800, height: 100 },
    elementTag: 'header',
    cssClasses: '',
    zIndex: 1
  },
  // H1 title inside header
  {
    id: 'h1-1',
    position: { x: 70, y: 45 },
    size: { width: 200, height: 40 },
    elementTag: 'h1',
    cssClasses: 'title',
    zIndex: 2
  },
  // Nav inside header
  {
    id: 'nav-1',
    position: { x: 300, y: 45 },
    size: { width: 500, height: 60 },
    elementTag: 'nav',
    cssClasses: '',
    zIndex: 2
  },
  // Nav items
  {
    id: 'nav-item-1',
    position: { x: 310, y: 55 },
    size: { width: 80, height: 40 },
    elementTag: 'div',
    cssClasses: '',
    zIndex: 3
  },
  {
    id: 'nav-item-2',
    position: { x: 410, y: 55 },
    size: { width: 80, height: 40 },
    elementTag: 'div',
    cssClasses: '',
    zIndex: 3
  },
  {
    id: 'nav-item-3',
    position: { x: 510, y: 55 },
    size: { width: 80, height: 40 },
    elementTag: 'div',
    cssClasses: '',
    zIndex: 3
  },
  // Main container
  {
    id: 'main-1',
    position: { x: 50, y: 150 },
    size: { width: 800, height: 600 },
    elementTag: 'main',
    cssClasses: '',
    zIndex: 1
  },
  // Section inside main
  {
    id: 'section-1',
    position: { x: 70, y: 170 },
    size: { width: 350, height: 550 },
    elementTag: 'section',
    cssClasses: '',
    zIndex: 2
  },
  // Article inside section
  {
    id: 'article-1',
    position: { x: 80, y: 230 },
    size: { width: 320, height: 470 },
    elementTag: 'article',
    cssClasses: '',
    zIndex: 3
  }
];

// Simplified version of the nesting detection algorithm
function detectNesting(shapes) {
  const sortedShapes = [...shapes].sort((a, b) => a.zIndex - b.zIndex);
  
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
      
      // Check if parent contains at least 50% of the child's area
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
    
    const bestParent = potentialParents.reduce((best, current) => {
      const bestArea = best.size.width * best.size.height;
      const currentArea = current.size.width * current.size.height;
      return currentArea < bestArea ? current : best;
    }, null);
    
    return {
      ...shape,
      parentId: bestParent?.id || null
    };
  });
}

// Test the algorithm
console.log('Testing nesting detection...');
const shapesWithParents = detectNesting(testShapes);

console.log('Results:');
shapesWithParents.forEach(shape => {
  const parentInfo = shape.parentId ? ` (parent: ${shape.parentId})` : ' (root)';
  console.log(`${shape.elementTag}${shape.cssClasses ? '.' + shape.cssClasses : ''}${parentInfo}`);
});

// Expected results:
// header (root)
// h1.title (parent: header-1)
// nav (parent: header-1)
// div (parent: nav-1)
// div (parent: nav-1)
// div (parent: nav-1)
// main (root)
// section (parent: main-1)
// article (parent: section-1) 