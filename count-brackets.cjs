const fs = require('fs');
const content = fs.readFileSync('src/content/components/CanvasEditor.tsx', 'utf8');

let parens = 0;
let curlies = 0;
let squares = 0;

let inString = false;
let stringChar = '';

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  
  if (inString) {
    if (char === stringChar && content[i-1] !== '\\') {
      inString = false;
    }
    continue;
  }
  
  if (char === "'" || char === '"' || char === '`') {
    inString = true;
    stringChar = char;
    continue;
  }
  
  if (char === '/' && content[i+1] === '/') {
    // skip to newline
    while (i < content.length && content[i] !== '\n') i++;
    continue;
  }
  
  if (char === '(') parens++;
  if (char === ')') parens--;
  if (char === '{') curlies++;
  if (char === '}') curlies--;
  if (char === '[') squares++;
  if (char === ']') squares--;
}

console.log({parens, curlies, squares});
