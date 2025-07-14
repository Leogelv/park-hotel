#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Читаем все функции из папки convex
const convexDir = path.join(__dirname, 'convex');
const functions = {};

// Сканируем все .ts файлы в convex папке
function scanDirectory(dir, prefix = '') {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory() && item !== '_generated' && item !== 'node_modules') {
      scanDirectory(itemPath, prefix + item + '/');
    } else if (item.endsWith('.ts') && !item.startsWith('_')) {
      const moduleName = prefix + item.replace('.ts', '');
      const content = fs.readFileSync(itemPath, 'utf8');
      functions[moduleName] = content;
    }
  }
}

scanDirectory(convexDir);

console.log('Found functions:', Object.keys(functions));

// Отправляем функции на твой Convex деплой
const deployUrl = 'https://convex-backend-production-587a.up.railway.app';
const adminKey = 'self-hosted-convex|014dd603afe27576459853d9b6acffe0c8be4cf0aa532a2398b33fd3df705e63f4b0e14146';

console.log('Deploying to:', deployUrl);
console.log('Functions to deploy:', Object.keys(functions));

// Для self-hosted Convex нужно использовать правильный API endpoint
// Попробуем загрузить функции через admin API
console.log('\\nNote: You may need to deploy functions manually through the Convex dashboard at:');
console.log('https://convex-dashboard-production-eda2.up.railway.app');
console.log('\\nOr copy the function files directly to your deployment.');