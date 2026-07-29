const fs = require('fs');
const ts = require('typescript');
const content = fs.readFileSync('src/content/components/CanvasEditor.tsx', 'utf8');

const sourceFile = ts.createSourceFile('CanvasEditor.tsx', content, ts.ScriptTarget.Latest, true);

const parseDiagnostics = sourceFile.parseDiagnostics;
if (parseDiagnostics && parseDiagnostics.length > 0) {
  parseDiagnostics.forEach(d => {
    const pos = sourceFile.getLineAndCharacterOfPosition(d.start);
    console.log(`Error at Line ${pos.line + 1}, Col ${pos.character + 1}: ${typeof d.messageText === 'string' ? d.messageText : d.messageText.messageText}`);
  });
} else {
  console.log('No parse diagnostics found by TS API.');
}
