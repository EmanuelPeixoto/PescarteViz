const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Get all CSS class definitions from modular files
const getModularClasses = () => {
  const cssFiles = glob.sync('./src/styles/**/*.css');
  const classRegex = /\.([\w-]+)[\s\{:]/g;
  const classes = new Set();

  cssFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = classRegex.exec(content)) !== null) {
      classes.add(match[1]);
    }
  });

  return classes;
};

// Get all CSS classes used in JSX files
const getUsedClasses = () => {
  const jsxFiles = glob.sync('./src/**/*.{js,jsx}');
  const classRegex = /className=["']([^"']+)["']/g;
  const usedClasses = new Set();

  jsxFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = classRegex.exec(content)) !== null) {
      // Split by space to get individual class names
      match[1].split(/\s+/).forEach(cls => {
        usedClasses.add(cls);
      });
    }
  });

  return usedClasses;
};

// Main function
const checkCssClasses = () => {
  const modularClasses = getModularClasses();
  const usedClasses = getUsedClasses();
  
  const missingClasses = [...usedClasses].filter(cls => !modularClasses.has(cls));
  
  if (missingClasses.length > 0) {
    console.log('WARNING: The following classes are used in components but not defined in modular CSS files:');
    missingClasses.forEach(cls => console.log(`- ${cls}`));
  } else {
    console.log('✅ All CSS classes used in components are defined in modular CSS files');
  }
};

checkCssClasses();