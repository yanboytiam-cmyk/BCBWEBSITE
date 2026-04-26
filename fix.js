const fs = require('fs');

console.log('Reading index.html...');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove the aggressive oi-wrap::after gradient that causes the "small square cut" visual bug
console.log('Fixing .oi-wrap::after visual bug...');
html = html.replace(/\.oi-wrap::after\s*\{[\s\S]*?z-index:\s*2;\s*\}/g, '/* Removed .oi-wrap::after to fix image cropping bug on smartphone */');

// 2. Extract Base64 Images
console.log('Extracting Base64 images...');
const assetsDir = './assets/images';
if (!fs.existsSync('./assets')) fs.mkdirSync('./assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

let imageCount = 1;

// Regex to match data URI images
const regex = /data:image\/(jpeg|png|jpg|webp);base64,([A-Za-z0-9+/=\s]+)/g;

html = html.replace(regex, (match, ext, b64data) => {
    const filename = `img_${imageCount++}.${ext}`;
    const filepath = `${assetsDir}/${filename}`;
    
    // Remove formatting whitespace/newlines from base64 string
    const cleanB64 = b64data.replace(/\s+/g, '');
    
    fs.writeFileSync(filepath, Buffer.from(cleanB64, 'base64'));
    return `assets/images/${filename}`;
});

console.log(`Extracted ${imageCount - 1} images.`);

// 3. Add mobile specific overrides to fix backdrop filters
if (!html.includes('/* ADDED MOBILE OPTIMIZATIONS */')) {
    html = html.replace('</style>', `
    /* ADDED MOBILE OPTIMIZATIONS */
    @media (max-width: 768px) {
        .glass-section, #trans {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }
        .oi-wrap {
            /* Better sizing for mobile */
            width: 140px !important;
            height: 140px !important;
        }
        .oi {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
  </style>`);
}

fs.writeFileSync('index.html', html);
console.log('Done! index.html updated.');
