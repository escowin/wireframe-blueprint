# Nested HTML Export Implementation

## Overview
The HTML export functionality has been enhanced to reliably communicate nested element relationships by detecting spatial containment and generating hierarchical HTML structure instead of flat absolute positioning.

## How It Works

### 1. **Spatial Containment Detection**
The system analyzes the visual layout to detect parent-child relationships:
- Calculates overlap percentage between shapes
- Identifies shapes that contain at least 50% of another shape's area
- Chooses the smallest containing shape as the parent

### 2. **Hierarchical HTML Generation**
Instead of generating flat HTML with absolute positioning:
- Creates a tree structure based on detected relationships
- Uses relative positioning for nested elements
- Maintains proper indentation to show hierarchy
- Generates semantic HTML structure

### 3. **Semantic Content Placeholders**
Provides meaningful comments based on element types and CSS classes:
- Recognizes common class patterns (title, stats, list, card, etc.)
- Generates element-specific placeholder content
- Maintains readability of exported HTML

## Example Output

### Visual Structure (from your diagram):
```
<header>
  ├── <h1.title>
  └── <nav>
      ├── <div>
      ├── <div>
      └── <div>

<main.#lineups>
  ├── <section.#unassigned-section>
  │   ├── <h2.title>
  │   └── <article.#unassigned-coaches>
  │       ├── <h3.title>
  │       └── <ul.list>
  │           └── <li.card.athlete>
  │               ├── <h4.title.name>
  │               └── <p.stats>
  │                   ├── <span.stat>
  │                   └── <span.stat>
  └── <section.#assigned-section>
      ├── <h2.title>
      └── <article> (3 horizontal elements)
```

### Generated HTML:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Layout</title>
</head>
<body>
  <header style="position: absolute; left: 50px; top: 25px; width: 800px; height: 100px; background-color: #e2e8f0; border: 2px solid #64748b;">
    <!-- header content -->
    <h1 class="title" style="position: relative; left: 20px; top: 20px; width: 200px; height: 40px; background-color: #ffffff; border: 1px solid #e2e8f0;">
      <!-- h1 heading content -->
    </h1>
    <nav style="position: relative; left: 250px; top: 20px; width: 500px; height: 60px; background-color: #f1f5f9; border: 1px solid #cbd5e1;">
      <!-- nav navigation links -->
      <div style="position: relative; left: 10px; top: 10px; width: 80px; height: 40px; background-color: #ffffff; border: 1px solid #e2e8f0;">
        <!-- div container content -->
      </div>
      <div style="position: relative; left: 110px; top: 10px; width: 80px; height: 40px; background-color: #ffffff; border: 1px solid #e2e8f0;">
        <!-- div container content -->
      </div>
      <div style="position: relative; left: 210px; top: 10px; width: 80px; height: 40px; background-color: #ffffff; border: 1px solid #e2e8f0;">
        <!-- div container content -->
      </div>
    </nav>
  </header>
  
  <main id="lineups" style="position: absolute; left: 50px; top: 150px; width: 800px; height: 600px; background-color: #ffffff; border: 1px solid #e2e8f0;">
    <!-- main main content area -->
    <section id="unassigned-section" style="position: relative; left: 20px; top: 20px; width: 350px; height: 550px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
      <!-- section content section -->
      <h2 class="title" style="position: relative; left: 10px; top: 10px; width: 200px; height: 30px; background-color: #ffffff; border: 1px solid #e2e8f0;">
        <!-- h2 heading content -->
      </h2>
      <article id="unassigned-coaches" style="position: relative; left: 10px; top: 60px; width: 320px; height: 470px; background-color: #ffffff; border: 1px solid #e2e8f0;">
        <!-- article article content -->
        <h3 class="title" style="position: relative; left: 10px; top: 10px; width: 150px; height: 25px; background-color: #f1f5f9; border: 1px solid #cbd5e1;">
          <!-- h3 heading content -->
        </h3>
        <ul class="list" style="position: relative; left: 10px; top: 50px; width: 300px; height: 400px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
          <!-- ul list items -->
          <li class="card athlete" style="position: relative; left: 10px; top: 10px; width: 280px; height: 120px; background-color: #ffffff; border: 1px solid #e2e8f0;">
            <!-- li list item content -->
            <h4 class="title name" style="position: relative; left: 10px; top: 10px; width: 200px; height: 25px; background-color: #f1f5f9; border: 1px solid #cbd5e1;">
              <!-- h4 heading content -->
            </h4>
            <p class="stats" style="position: relative; left: 10px; top: 45px; width: 260px; height: 60px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
              <!-- p paragraph content -->
              <span class="stat" style="position: relative; left: 10px; top: 10px; width: 100px; height: 20px; background-color: #ffffff; border: 1px solid #e2e8f0;">
                <!-- span inline content -->
              </span>
              <span class="stat" style="position: relative; left: 130px; top: 10px; width: 100px; height: 20px; background-color: #ffffff; border: 1px solid #e2e8f0;">
                <!-- span inline content -->
              </span>
            </p>
          </li>
        </ul>
      </article>
    </section>
    
    <section id="assigned-section" style="position: relative; left: 400px; top: 20px; width: 350px; height: 550px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
      <!-- section content section -->
      <h2 class="title" style="position: relative; left: 10px; top: 10px; width: 200px; height: 30px; background-color: #ffffff; border: 1px solid #e2e8f0;">
        <!-- h2 heading content -->
      </h2>
      <article style="position: relative; left: 10px; top: 60px; width: 100px; height: 200px; background-color: #ffffff; border: 1px solid #e2e8f0;">
        <!-- article article content -->
      </article>
      <article style="position: relative; left: 125px; top: 60px; width: 100px; height: 200px; background-color: #ffffff; border: 1px solid #e2e8f0;">
        <!-- article article content -->
      </article>
      <article style="position: relative; left: 240px; top: 60px; width: 100px; height: 200px; background-color: #ffffff; border: 1px solid #e2e8f0;">
        <!-- article article content -->
      </article>
    </section>
  </main>
</body>
</html>
```

## Key Improvements

### 1. **Reliable Nesting Detection**
- **Spatial Analysis**: Detects when one shape contains another
- **Overlap Calculation**: Uses 50% overlap threshold for parent-child relationships
- **Smallest Container**: Chooses the most specific parent container

### 2. **Semantic HTML Structure**
- **Proper Hierarchy**: Maintains DOM structure that reflects visual layout
- **Relative Positioning**: Nested elements use relative positioning within parents
- **Meaningful Comments**: Provides context about element purposes

### 3. **CSS Class Integration**
- **Class Preservation**: Maintains CSS classes in exported HTML
- **Semantic Recognition**: Recognizes common class patterns (title, stats, etc.)
- **ID Support**: Preserves element IDs for JavaScript targeting

### 4. **Developer-Friendly Output**
- **Clean Indentation**: Shows hierarchy through proper indentation
- **Readable Comments**: Helps developers understand element purposes
- **Valid HTML**: Generates standards-compliant HTML structure

## Benefits

1. **Accurate Representation**: The exported HTML accurately reflects the visual hierarchy
2. **Semantic Structure**: Maintains proper HTML semantics and accessibility
3. **Development Ready**: Provides a solid foundation for actual implementation
4. **Maintainable Code**: Clear structure makes it easy to modify and extend
5. **CSS Integration**: Preserves styling information for development

## Technical Implementation

The implementation uses:
- **Spatial Containment Algorithm**: Detects parent-child relationships
- **Tree Structure Building**: Creates hierarchical representation
- **Recursive HTML Generation**: Renders nested elements properly
- **Relative Positioning**: Calculates positions relative to parents
- **Semantic Content Generation**: Provides meaningful placeholder content

This approach ensures that the visual nested structure you create in the diagram tool is reliably communicated in the exported HTML, making it a true representation-to-code solution. 