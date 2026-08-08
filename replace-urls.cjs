const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function findAndReplace(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            findAndReplace(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            
            if (content.includes("'https://shotuno.com/#pricing'")) {
                content = content.replace(/'https:\/\/shotuno\.com\/#pricing'/g, "`${getWebUrl()}/#pricing`");
                changed = true;
            }

            if (changed && !content.includes('import { getWebUrl }')) {
                const depth = fullPath.substring(directoryPath.length).split(path.sep).length - 1;
                const relativePath = depth === 1 ? './lib/api' : '../'.repeat(depth - 1) + 'lib/api';
                
                const importStatement = `import { getWebUrl } from '${relativePath}';\n`;
                const importRegex = /^import .* from .*$/gm;
                let lastImportIndex = -1;
                let match;
                while ((match = importRegex.exec(content)) !== null) {
                    lastImportIndex = match.index + match[0].length;
                }
                
                if (lastImportIndex !== -1) {
                    content = content.slice(0, lastImportIndex) + '\n' + importStatement + content.slice(lastImportIndex);
                } else {
                    content = importStatement + content;
                }
            }
            
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

findAndReplace(directoryPath);
