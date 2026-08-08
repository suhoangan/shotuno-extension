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
            if (fullPath.includes('chromeStorage.ts')) continue;
            
            let content = fs.readFileSync(fullPath, 'utf8');
            
            let changed = false;
            
            // Determine relative path for import
            const depth = fullPath.substring(directoryPath.length).split(path.sep).length - 1;
            const relativePath = depth === 1 ? './lib/chromeStorage' : '../'.repeat(depth - 1) + 'lib/chromeStorage';
            
            // Replace chrome.storage.local
            if (content.includes('chrome.storage.local')) {
                content = content.replace(/chrome\.storage\.local/g, "storage.local");
                changed = true;
            }
            
            // Replace chrome.storage.session
            if (content.includes('chrome.storage.session')) {
                content = content.replace(/chrome\.storage\.session/g, "storage.session");
                changed = true;
            }

            // Replace chrome.storage.onChanged
            if (content.includes('chrome.storage.onChanged')) {
                content = content.replace(/chrome\.storage\.onChanged/g, "storage.onChanged");
                changed = true;
            }

            // Add import if changed
            if (changed && !content.includes('import { storage }')) {
                // Find last import
                const importRegex = /^import .* from .*$/gm;
                let lastImportIndex = -1;
                let match;
                while ((match = importRegex.exec(content)) !== null) {
                    lastImportIndex = match.index + match[0].length;
                }
                
                const importStatement = `import { storage } from '${relativePath}';\n`;
                if (lastImportIndex !== -1) {
                    content = content.slice(0, lastImportIndex) + '\n' + importStatement + content.slice(lastImportIndex);
                } else {
                    content = importStatement + content;
                }
            }
            
            // Fix some Edge Cases where typeof chrome === 'undefined' || !chrome.storage is checked
            if (changed) {
                content = content.replace(/typeof chrome === 'undefined' \|\| !chrome\.storage(?:\?\.local)?/g, "!storage.isAvailable()");
                content = content.replace(/typeof chrome === 'undefined' \|\| !chrome\.storage/g, "!storage.isAvailable()");
            }
            
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

findAndReplace(directoryPath);
