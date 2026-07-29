const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = 'd:/projects/ai_idea/shotuno-extension/public';
const iconSvg = path.join(publicDir, 'icons.svg');

if (fs.existsSync(iconSvg)) {
  const sizes = [16, 32, 48, 128];
  sizes.forEach(size => {
    sharp(iconSvg)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, 'icon-' + size + '.png'), (err, info) => {
        if (err) console.error(err);
        else console.log('Created icon-' + size + '.png');
      });
  });
} else {
  console.error('icons.svg not found!');
}
