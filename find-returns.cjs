const fs = require('fs');
const content = fs.readFileSync('src/content/components/CanvasEditor.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('return (')) console.log('OPEN:', i+1, line.trim());
  if (line.includes(');')) console.log('CLOSE:', i+1, line.trim());
});
