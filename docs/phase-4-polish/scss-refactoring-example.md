# SCSS Refactoring Example

This document shows how to refactor existing component SCSS files to use the new centralized mixins.

## Example: Refactoring AutoSaveModal.scss

### Before Refactoring

```scss
.auto-save-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.auto-save-modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 90%;
  animation: modalSlideIn 0.3s ease-out;
}

.auto-save-modal-header {
  padding: 20px 24px 0;
  
  h3 {
    margin: 0;
    color: #1f2937;
    font-size: 18px;
    font-weight: 600;
  }
}

.auto-save-modal-content {
  padding: 16px 24px;
  
  p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.5;
  }
}

.auto-save-modal-actions {
  padding: 0 24px 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.auto-save-modal-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.auto-save-modal-btn-primary {
  background-color: #3b82f6;
  color: white;
  
  &:hover {
    background-color: #2563eb;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
}

.auto-save-modal-btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
  
  &:hover {
    background-color: #e5e7eb;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
```

### After Refactoring

```scss
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.auto-save-modal-overlay {
  @include modal-overlay;
  z-index: 10000; // Override default z-index for this specific modal
}

.auto-save-modal {
  @include modal-base;
  max-width: 400px;
  width: 90%;
}

.auto-save-modal-header {
  @include modal-header;
  padding: $spacing-lg $spacing-xl 0; // Custom padding for this modal
  
  h3 {
    margin: 0;
    color: $text-primary; // Use variable instead of hardcoded color
    font-size: $font-size-lg;
    font-weight: 600;
  }
}

.auto-save-modal-content {
  @include modal-content;
  padding: $spacing-md $spacing-xl; // Custom padding for this modal
  
  p {
    margin: 0;
    color: $text-secondary; // Use variable instead of hardcoded color
    font-size: $font-size-sm;
    line-height: 1.5;
  }
}

.auto-save-modal-actions {
  @include modal-actions;
  padding: 0 $spacing-xl $spacing-lg; // Custom padding for this modal
}

.auto-save-modal-btn {
  @include button-base;
  
  &.auto-save-modal-btn-primary {
    @include button-primary;
  }
  
  &.auto-save-modal-btn-secondary {
    @include button-secondary;
  }
}
```

## Benefits of the Refactored Version

### 1. Reduced Code
- **Before**: ~80 lines of SCSS
- **After**: ~30 lines of SCSS
- **Reduction**: ~62% less code

### 2. Consistency
- All modals now use the same base styling
- All buttons follow the same patterns
- Consistent spacing and colors using variables

### 3. Maintainability
- Changes to modal styling only need to be made in the mixin
- Button styling is centralized
- Easy to update colors and spacing globally

### 4. Readability
- Clear intent with descriptive mixin names
- Less repetitive code
- Easier to understand the component structure

## Example: Refactoring Toolbar.scss Button Section

### Before Refactoring

```scss
.toolbar-actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  
  .btn {
    padding: $spacing-md $spacing-lg;
    border: 1px solid $border-color;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    font-weight: 500;
    font-family: $font-family;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: center;
    display: inline-block;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.3s ease, height 0.3s ease;
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-md;
      
      &::before {
        width: 300px;
        height: 300px;
      }
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: $shadow-sm;
    }
    
    &--primary {
      background: $primary-color;
      color: $background-color;
      border-color: $primary-color;
      
      &:hover {
        background: color.adjust($primary-color, $lightness: -10%);
        border-color: color.adjust($primary-color, $lightness: -10%);
      }
    }
    
    &--secondary {
      background: $background-color;
      color: $text-primary;
      border-color: $border-color;
      
      &:hover {
        background: $surface-color;
        border-color: $accent-color;
        color: $primary-color;
      }
    }
    
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
      
      &:hover {
        transform: none;
        box-shadow: none;
        
        &::before {
          width: 0;
          height: 0;
        }
      }
    }
  }
}
```

### After Refactoring

```scss
@use '../styles/variables' as *;
@use '../styles/mixins' as *;

.toolbar-actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  
  .btn {
    @include button-base;
    
    // Custom ripple effect for toolbar buttons
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.3s ease, height 0.3s ease;
    }
    
    &:hover::before {
      width: 300px;
      height: 300px;
    }
    
    &--primary {
      @include button-primary;
    }
    
    &--secondary {
      @include button-secondary;
    }
  }
}
```

## Migration Steps for Existing Components

### Step 1: Import Mixins
Add the import statement at the top of your SCSS file:
```scss
@use '../styles/mixins' as *;
```

### Step 2: Identify Patterns
Look for repeating patterns in your component:
- Button styles
- Modal/overlay styles
- Input field styles
- Panel/container styles
- Typography patterns

### Step 3: Replace with Mixins
Replace the repeating code with appropriate mixins:
```scss
// Before
.my-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-sm $spacing-md;
  // ... many more lines
}

// After
.my-button {
  @include button-primary;
}
```

### Step 4: Customize as Needed
Add custom styles after the mixin to override or extend the base styles:
```scss
.my-button {
  @include button-primary;
  
  // Custom styles for this specific button
  font-size: $font-size-lg;
  padding: $spacing-md $spacing-xl;
}
```

### Step 5: Test and Refine
- Test the component to ensure it looks and behaves correctly
- Adjust custom styles as needed
- Remove any unused custom styles that are now handled by mixins

## Best Practices

### 1. Use Variables
Always use variables instead of hardcoded values:
```scss
// Good
color: $primary-color;
padding: $spacing-md;

// Avoid
color: #3b82f6;
padding: 16px;
```

### 2. Extend Mixins, Don't Override
Add custom styles after the mixin rather than overriding mixin styles:
```scss
// Good
.my-button {
  @include button-primary;
  font-size: $font-size-lg; // Custom addition
}

// Avoid
.my-button {
  @include button-primary;
  font-size: $font-size-lg; // This will override the mixin
}
```

### 3. Use Semantic Class Names
Choose class names that describe the purpose, not the appearance:
```scss
// Good
.save-button
.modal-overlay
.panel-header

// Avoid
.blue-button
.fixed-overlay
.gray-header
```

### 4. Keep Custom Styles Minimal
Only add custom styles that are truly specific to the component:
```scss
// Good - only custom styles
.my-modal {
  @include modal-base;
  max-width: 500px; // Custom size
}

// Avoid - duplicating mixin styles
.my-modal {
  @include modal-base;
  background: white; // Already in mixin
  border-radius: 8px; // Already in mixin
}
```

This refactoring approach significantly reduces code duplication while maintaining flexibility for component-specific customizations. 