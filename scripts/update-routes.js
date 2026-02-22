const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = process.cwd();
const SRC_DIR = path.join(PROJECT_ROOT, 'app');
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'app', 'components');

// Routes to update (old -> new)
const routeMappings = {
  // Dashboard routes
  '/dashboard': '/client/dashboard', // Default for clients
  '/dashboard/practitioners': '/client/dashboard/practitioners',
  '/dashboard/consultations': '/client/dashboard/consultations', // Will need manual review
  '/dashboard/favorites': '/client/dashboard/favorites',
  '/dashboard/reviews': '/client/dashboard/reviews', // Will need manual review
  '/dashboard/profile': '/client/dashboard/profile', // Will need manual review
  '/dashboard/settings': '/client/dashboard/settings',
  '/dashboard/support': '/client/dashboard/support',
  
  // Practitioner specific routes (if they existed in old structure)
  '/dashboard/practitioner': '/practitioner/dashboard',
  '/dashboard/practitioner/availability': '/practitioner/dashboard/availability',
  '/dashboard/practitioner/earnings': '/practitioner/dashboard/earnings',
  '/dashboard/analytics': '/practitioner/dashboard/analytics',
};

// Files to exclude
const excludeFiles = [
  'node_modules',
  '.next',
  'scripts',
  'update-routes.js',
  'package-lock.json',
  'yarn.lock',
];

// Stats
let stats = {
  filesScanned: 0,
  filesModified: 0,
  occurrencesFound: 0,
  occurrencesReplaced: 0,
  manualReviewNeeded: [],
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(colors[color] + message + colors.reset);
}

// Function to check if file should be excluded
function shouldExclude(filePath) {
  return excludeFiles.some(exclude => filePath.includes(exclude));
}

// Function to recursively get all files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!shouldExclude(filePath)) {
        getAllFiles(filePath, fileList);
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
        if (!shouldExclude(filePath)) {
          fileList.push(filePath);
        }
      }
    }
  });
  
  return fileList;
}

// Function to update routes in a file
function updateRoutesInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileNeedsUpdate = false;
  let fileManualReview = [];

  // Check for href attributes in Link components
  const linkRegex = /href=(["'])(.*?)\1/g;
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const quote = match[1];
    const href = match[2];
    
    // Check if this href needs updating
    for (const [oldRoute, newRoute] of Object.entries(routeMappings)) {
      if (href === oldRoute || href.startsWith(oldRoute + '/')) {
        const newHref = href.replace(oldRoute, newRoute);
        const replacement = `href=${quote}${newHref}${quote}`;
        content = content.replace(fullMatch, replacement);
        stats.occurrencesReplaced++;
        fileNeedsUpdate = true;
        log('yellow', `  ↳ Replaced: ${href} -> ${newHref}`);
      }
    }
  }

  // Check for router.push calls
  const routerPushRegex = /router\.push\((["'])(.*?)\1\)/g;
  while ((match = routerPushRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const quote = match[1];
    const route = match[2];
    
    for (const [oldRoute, newRoute] of Object.entries(routeMappings)) {
      if (route === oldRoute || route.startsWith(oldRoute + '/')) {
        const newRoute_ = route.replace(oldRoute, newRoute);
        const replacement = `router.push(${quote}${newRoute_}${quote})`;
        content = content.replace(fullMatch, replacement);
        stats.occurrencesReplaced++;
        fileNeedsUpdate = true;
        log('yellow', `  ↳ Replaced router.push: ${route} -> ${newRoute_}`);
      }
    }
  }

  // Check for useRouter().push calls
  const useRouterPushRegex = /useRouter\(\)\.push\((["'])(.*?)\1\)/g;
  while ((match = useRouterPushRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const quote = match[1];
    const route = match[2];
    
    for (const [oldRoute, newRoute] of Object.entries(routeMappings)) {
      if (route === oldRoute || route.startsWith(oldRoute + '/')) {
        const newRoute_ = route.replace(oldRoute, newRoute);
        const replacement = `useRouter().push(${quote}${newRoute_}${quote})`;
        content = content.replace(fullMatch, replacement);
        stats.occurrencesReplaced++;
        fileNeedsUpdate = true;
        log('yellow', `  ↳ Replaced useRouter().push: ${route} -> ${newRoute_}`);
      }
    }
  }

  // Check for window.location.href
  const windowLocationRegex = /window\.location\.href\s*=\s*(["'])(.*?)\1/g;
  while ((match = windowLocationRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const quote = match[1];
    const route = match[2];
    
    for (const [oldRoute, newRoute] of Object.entries(routeMappings)) {
      if (route === oldRoute || route.startsWith(oldRoute + '/')) {
        const newRoute_ = route.replace(oldRoute, newRoute);
        const replacement = `window.location.href = ${quote}${newRoute_}${quote}`;
        content = content.replace(fullMatch, replacement);
        stats.occurrencesReplaced++;
        fileNeedsUpdate = true;
        log('yellow', `  ↳ Replaced window.location: ${route} -> ${newRoute_}`);
      }
    }
  }

  // Check for routes that need manual review (consultations, reviews, profile)
  const needsReviewRegex = /href=(["'])(\/dashboard\/(?:consultations|reviews|profile)(?:\/.*?)?)\1/g;
  while ((match = needsReviewRegex.exec(originalContent)) !== null) {
    const route = match[2];
    fileManualReview.push(route);
    stats.manualReviewNeeded.push({ file: filePath, route });
  }

  if (fileNeedsUpdate) {
    fs.writeFileSync(filePath, content, 'utf8');
    stats.filesModified++;
    log('green', `✅ Updated: ${path.relative(PROJECT_ROOT, filePath)}`);
  }

  return fileManualReview;
}

// Main function
async function main() {
  log('cyan', '\n🔍 Starting route update script...\n');
  
  // Get all files
  log('blue', '📁 Scanning project files...');
  const files = getAllFiles(SRC_DIR);
  log('blue', `   Found ${files.length} files to check\n`);
  
  stats.filesScanned = files.length;

  // Process each file
  files.forEach(file => {
    const relativePath = path.relative(PROJECT_ROOT, file);
    log('magenta', `\n📄 Checking: ${relativePath}`);
    updateRoutesInFile(file);
  });

  // Summary
  log('cyan', '\n' + '='.repeat(50));
  log('cyan', '📊 UPDATE SUMMARY');
  log('cyan', '='.repeat(50));
  log('white', `Files scanned: ${stats.filesScanned}`);
  log('green', `Files modified: ${stats.filesModified}`);
  log('yellow', `Routes replaced: ${stats.occurrencesReplaced}`);
  
  if (stats.manualReviewNeeded.length > 0) {
    log('yellow', '\n⚠️  Routes needing manual review:');
    stats.manualReviewNeeded.forEach(({ file, route }) => {
      log('yellow', `   📍 ${route} in ${path.relative(PROJECT_ROOT, file)}`);
    });
    log('yellow', '\nThese routes may need role-based logic. Review them manually!');
  }

  // Create backup of modified files
  if (stats.filesModified > 0) {
    log('blue', '\n💾 Creating backup of modified files...');
    const backupDir = path.join(PROJECT_ROOT, 'backup-' + Date.now());
    fs.mkdirSync(backupDir);
    
    files.forEach(file => {
      const backupPath = path.join(backupDir, path.relative(PROJECT_ROOT, file));
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.copyFileSync(file, backupPath);
    });
    log('green', `✅ Backup created at: ${backupDir}`);
  }

  log('cyan', '\n' + '='.repeat(50));
  log('green', '✨ Route update complete!\n');
}

// Run the script
main().catch(console.error);