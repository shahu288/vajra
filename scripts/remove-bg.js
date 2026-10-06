const fs = require('fs');
const path = require('path');

// We will write a script to install jimp dynamically, process the image, and output logo.png
const execSync = require('child_process').execSync;

console.log('Installing jimp dynamically...');
execSync('npm install --no-save jimp', { stdio: 'inherit' });

// In Jimp 1.x, Jimp is exported as a named export
const { Jimp } = require('jimp');

async function main() {
  console.log('Reading JPEG image...');
  const image = await Jimp.read('C:\\Users\\Ethinos\\.gemini\\antigravity-ide\\brain\\6eb0cdc9-8e73-4c11-bc5f-b3dc615ab435\\media__1784199117203.jpg');
  
  console.log('Removing black background...');
  // We scan the image and set pixels below threshold to transparent (alpha = 0)
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    
    // Check if pixel is dark black/charcoal
    if (r < 18 && g < 18 && b < 18) {
      this.bitmap.data[idx + 3] = 0; // Alpha = 0 (Transparent)
    } else {
      // Retain full alpha
      this.bitmap.data[idx + 3] = 255;
    }
  });

  const destPath = 'c:\\Users\\Ethinos\\OneDrive - Ethinos Digital Marketing Pvt Ltd\\Apps\\Vajra\\assets\\images\\logo.png';
  console.log('Writing transparent PNG to', destPath);
  await image.write(destPath);
  console.log('Done!');
}

main().catch(console.error);
