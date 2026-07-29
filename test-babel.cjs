const babel = require('@babel/core');
const fs = require('fs');
const content = fs.readFileSync('src/content/components/CanvasEditor.tsx', 'utf8');
try {
  babel.parseSync(content, {
    presets: ['@babel/preset-typescript', '@babel/preset-react'],
    filename: 'CanvasEditor.tsx'
  });
  console.log('No error');
} catch (e) {
  console.error(e.message);
}
