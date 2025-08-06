#!/usr/bin/env node

/**
 * Version Bump Script
 * 
 * Automatically increments the version in package.json and handles the complete git workflow.
 * 
 * Usage:
 *   node src/utils/version-bump.js [patch|minor|major] [--no-tag] [--no-push]
 *   
 * Examples:
 *   node src/utils/version-bump.js patch    # 1.0.0 -> 1.0.1 (with tag and push)
 *   node src/utils/version-bump.js minor    # 1.0.0 -> 1.1.0 (with tag and push)
 *   node src/utils/version-bump.js major    # 1.0.0 -> 2.0.0 (with tag and push)
 *   node src/utils/version-bump.js patch --no-tag    # Bump without creating tag
 *   node src/utils/version-bump.js patch --no-push   # Bump and tag without pushing
 *   
 * If no argument is provided, defaults to 'patch'
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    bumpType: 'patch',
    createTag: true,
    pushTag: true
  };
  
  for (const arg of args) {
    if (['patch', 'minor', 'major'].includes(arg.toLowerCase())) {
      options.bumpType = arg.toLowerCase();
    } else if (arg === '--no-tag') {
      options.createTag = false;
    } else if (arg === '--no-push') {
      options.pushTag = false;
    }
  }
  
  return options;
}

// Parse version string into components
function parseVersion(version) {
  const parts = version.split('.').map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0
  };
}

// Increment version based on type
function incrementVersion(currentVersion, type) {
  const version = parseVersion(currentVersion);
  
  switch (type.toLowerCase()) {
    case 'major':
      version.major++;
      version.minor = 0;
      version.patch = 0;
      break;
    case 'minor':
      version.minor++;
      version.patch = 0;
      break;
    case 'patch':
    default:
      version.patch++;
      break;
  }
  
  return `${version.major}.${version.minor}.${version.patch}`;
}

// Read package.json
function readPackageJson() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    return JSON.parse(packageContent);
  } catch (error) {
    logError(`Failed to read package.json: ${error.message}`);
    process.exit(1);
  }
}

// Write package.json
function writePackageJson(packageData) {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageContent = JSON.stringify(packageData, null, 2) + '\n';
    fs.writeFileSync(packagePath, packageContent, 'utf8');
  } catch (error) {
    logError(`Failed to write package.json: ${error.message}`);
    process.exit(1);
  }
}

// Check if git repository is clean
function isGitClean() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim() === '';
  } catch (error) {
    logWarning('Could not check git status. Make sure you are in a git repository.');
    return true; // Assume clean if we can't check
  }
}

// Get current git branch
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch (error) {
    logWarning('Could not get current git branch.');
    return 'unknown';
  }
}

// Get last commit message
function getLastCommitMessage() {
  try {
    return execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
  } catch (error) {
    logWarning('Could not get last commit message.');
    return '';
  }
}

// Execute git command with error handling
function execGitCommand(command, description) {
  try {
    const result = execSync(command, { encoding: 'utf8' });
    logSuccess(`${description} completed`);
    return result.trim();
  } catch (error) {
    logError(`${description} failed: ${error.message}`);
    throw error;
  }
}

// Perform git operations
function performGitOperations(newVersion, options) {
  log('\n🔧 Performing Git Operations:', 'bright');
  
  // Add package.json to staging
  execGitCommand('git add package.json', 'Adding package.json to staging');
  
  // Commit the version bump
  const commitMessage = `chore: bump version to ${newVersion}`;
  execGitCommand(`git commit -m "${commitMessage}"`, 'Committing version bump');
  
  // Create tag if requested
  if (options.createTag) {
    const tagName = `v${newVersion}`;
    execGitCommand(`git tag ${tagName}`, `Creating tag ${tagName}`);
    
    // Push tag if requested
    if (options.pushTag) {
      execGitCommand(`git push origin ${tagName}`, `Pushing tag ${tagName} to remote`);
    }
  }
}

// Main function
function main() {
  log('🚀 Version Bump Script', 'bright');
  log('=====================\n', 'bright');
  
  // Parse command line arguments
  const options = parseArgs();
  
  // Validate bump type
  if (!['patch', 'minor', 'major'].includes(options.bumpType)) {
    logError(`Invalid bump type: ${options.bumpType}`);
    logInfo('Valid types: patch, minor, major');
    process.exit(1);
  }
  
  // Check git status
  if (!isGitClean()) {
    logWarning('Git repository has uncommitted changes.');
    logInfo('Consider committing your changes before bumping version.');
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Continue anyway? (y/N): ', (answer) => {
      rl.close();
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        logInfo('Version bump cancelled.');
        process.exit(0);
      }
      performBump();
    });
  } else {
    performBump();
  }
  
  function performBump() {
    try {
      // Read current package.json
      const packageData = readPackageJson();
      const currentVersion = packageData.version;
      
      logInfo(`Current version: ${currentVersion}`);
      logInfo(`Bump type: ${options.bumpType}`);
      logInfo(`Current branch: ${getCurrentBranch()}`);
      logInfo(`Create tag: ${options.createTag ? 'Yes' : 'No'}`);
      logInfo(`Push tag: ${options.pushTag ? 'Yes' : 'No'}`);
      
      // Get last commit info
      const lastCommit = getLastCommitMessage();
      if (lastCommit) {
        logInfo(`Last commit: ${lastCommit.substring(0, 60)}${lastCommit.length > 60 ? '...' : ''}`);
      }
      
      // Calculate new version
      const newVersion = incrementVersion(currentVersion, options.bumpType);
      
      logInfo(`New version: ${newVersion}`);
      
      // Update package.json
      packageData.version = newVersion;
      writePackageJson(packageData);
      
      logSuccess(`Version bumped from ${currentVersion} to ${newVersion}`);
      
      // Perform git operations
      performGitOperations(newVersion, options);
      
      // Show final summary
      log('\n📊 Version Bump Summary:', 'bright');
      log(`   Previous: ${currentVersion}`);
      log(`   Current:  ${newVersion}`);
      log(`   Type:     ${options.bumpType}`);
      log(`   Branch:   ${getCurrentBranch()}`);
      log(`   Tag:      ${options.createTag ? `v${newVersion}` : 'None'}`);
      log(`   Pushed:   ${options.pushTag ? 'Yes' : 'No'}`);
      
      log('\n✨ Version bump and git operations completed successfully!', 'green');
      
      if (options.createTag && !options.pushTag) {
        log('\n💡 To push the tag later, run:', 'cyan');
        log(`   git push origin v${newVersion}`, 'cyan');
      }
      
    } catch (error) {
      logError(`Version bump failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  incrementVersion,
  parseVersion,
  readPackageJson,
  writePackageJson,
  parseArgs
}; 