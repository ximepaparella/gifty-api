#!/usr/bin/env node

/**
 * This script helps with the migration from JavaScript to TypeScript.
 * It can be used to:
 * 1. Rename .js files to .ts
 * 2. Update imports in TypeScript files
 * 3. Generate basic TypeScript interfaces for MongoDB models
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const EXTENSIONS_TO_CONVERT = ['.js'];
const IGNORE_DIRS = ['node_modules', 'dist', '.git'];

// Helper functions
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !IGNORE_DIRS.includes(file)) {
      fileList = getAllFiles(filePath, fileList);
    } else if (stat.isFile() && EXTENSIONS_TO_CONVERT.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function renameJsToTs(filePath) {
  const newPath = filePath.replace('.js', '.ts');
  fs.renameSync(filePath, newPath);
  console.log(`Renamed: ${filePath} -> ${newPath}`);
  return newPath;
}

// Main function
function migrateToTypeScript() {
  console.log('Starting migration to TypeScript...');

  // Get all JavaScript files
  const jsFiles = getAllFiles(SRC_DIR);
  console.log(`Found ${jsFiles.length} JavaScript files to convert.`);

  // Rename files
  jsFiles.forEach((file) => {
    renameJsToTs(file);
  });

  console.log('Migration completed!');
  console.log('Next steps:');
  console.log('1. Update imports in TypeScript files');
  console.log('2. Add proper type annotations');
  console.log('3. Fix any TypeScript errors');
}

// Run the migration
migrateToTypeScript();
