const fs = require('fs');
const babel = require('@babel/core');

const content = fs.readFileSync('src/content/components/CanvasEditor.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 1; i <= lines.length; i++) {
  const code = lines.slice(0, i).join('\n');
  try {
    babel.parseSync(code, {
      presets: ['@babel/preset-typescript', '@babel/preset-react'],
      filename: 'test.tsx'
    });
  } catch (e) {
    if (e.message.includes('Unexpected token')) {
       // if it fails on an unexpected token at the VERY END, it just means we cut it off abruptly.
       // but if it fails on an unexpected token BEFORE the end of our cut, then the syntax error is actually there!
       const match = e.message.match(/\((\d+):/);
       if (match && parseInt(match[1]) < i) {
          console.log(`Error at line ${match[1]} when parsing up to line ${i}`);
          console.log(e.message);
          break;
       }
    }
  }
}
