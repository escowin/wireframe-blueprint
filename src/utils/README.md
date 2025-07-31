# Utils Directory

This directory contains utility scripts and helper functions for the wireframe-blueprint project.

## Version Bump Script

### `version-bump.js`

Automatically increments the version in `package.json` when making significant git commits.

#### Features

- ✅ **Semantic Versioning**: Supports patch, minor, and major version bumps
- ✅ **Git Integration**: Checks git status and provides context about current branch/commit
- ✅ **Safety Checks**: Warns about uncommitted changes and asks for confirmation
- ✅ **Colored Output**: Beautiful console output with status indicators
- ✅ **Next Steps Guidance**: Provides clear instructions for committing and tagging

#### Usage

**Command Line:**
```bash
# Bump patch version (1.0.0 -> 1.0.1)
node src/utils/version-bump.js patch

# Bump minor version (1.0.0 -> 1.1.0)
node src/utils/version-bump.js minor

# Bump major version (1.0.0 -> 2.0.0)
node src/utils/version-bump.js major

# Default to patch if no argument provided
node src/utils/version-bump.js
```

**NPM Scripts:**
```bash
# Using npm scripts (recommended)
npm run version:patch    # 1.0.0 -> 1.0.1
npm run version:minor    # 1.0.0 -> 1.1.0
npm run version:major    # 1.0.0 -> 2.0.0
```

#### Version Bump Types

| Type | Description | Example |
|------|-------------|---------|
| `patch` | Bug fixes and minor improvements | `1.0.0` → `1.0.1` |
| `minor` | New features, backward compatible | `1.0.0` → `1.1.0` |
| `major` | Breaking changes | `1.0.0` → `2.0.0` |

#### Example Output

```
🚀 Version Bump Script
=====================

ℹ️  Current version: 1.0.0
ℹ️  Bump type: patch
ℹ️  Current branch: develop
ℹ️  Last commit: feat: implement nested JSON structure for better layout orga...
ℹ️  New version: 1.0.1
✅ Version bumped from 1.0.0 to 1.0.1

📋 Next Steps:
1. Review the changes to package.json
2. Commit the version bump:
   git add package.json
   git commit -m "chore: bump version to 1.0.1"
3. Tag the release (optional):
   git tag v1.0.1
   git push origin v1.0.1

📊 Version Bump Summary:
   Previous: 1.0.0
   Current:  1.0.1
   Type:     patch
   Branch:   develop

✨ Version bump completed successfully!
```

#### Workflow Integration

**Typical workflow for a significant feature:**
```bash
# 1. Make your changes and commit them
git add .
git commit -m "feat: implement new feature"

# 2. Bump version (patch for bug fixes, minor for features, major for breaking changes)
npm run version:minor

# 3. Commit the version bump
git add package.json
git commit -m "chore: bump version to 1.1.0"

# 4. Tag the release (optional but recommended)
git tag v1.1.0
git push origin v1.1.0
```

#### Safety Features

- **Git Status Check**: Warns if there are uncommitted changes
- **Confirmation Prompt**: Asks for confirmation before proceeding with uncommitted changes
- **Error Handling**: Graceful error handling for missing files or invalid versions
- **Backup**: The script is non-destructive and can be safely run multiple times

## Other Utility Scripts

### Test Scripts

- `test-nested-json.js` - Demonstrates nested JSON structure conversion
- `test-space-input.js` - Tests space input functionality
- `test-nesting.js` - Tests nesting detection algorithms
- `test-fix.js` - Tests bug fixes
- `test-attributes.js` - Tests attribute handling
- `test-attribute-fix.js` - Tests attribute fix functionality

### Helper Functions

- `helpers.ts` - Main utility functions for the application
  - HTML generation with nesting support
  - Export functionality (PNG, HTML)
  - Save/load diagram functions
  - Auto-save functionality
  - Nested JSON structure conversion

## Contributing

When adding new utility scripts:

1. **Documentation**: Add clear documentation in this README
2. **Error Handling**: Include proper error handling and user feedback
3. **Testing**: Test the script thoroughly before committing
4. **NPM Scripts**: Add convenient npm scripts for frequently used utilities
5. **Examples**: Provide usage examples and expected output

## Best Practices

- **Version Bumping**: Use semantic versioning principles
- **Git Integration**: Always check git status before making changes
- **User Feedback**: Provide clear, colored output with next steps
- **Safety First**: Include confirmation prompts for destructive operations
- **Documentation**: Keep this README updated with new utilities 