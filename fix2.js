const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix the original typo: .oi:nth-child -> .oi-wrap:nth-child inside the media query
html = html.replace(/\.oi:nth-child/g, '.oi-wrap:nth-child');

// 2. Remove my broken mobile optimizations block
const badOptimizations = `    /* ADDED MOBILE OPTIMIZATIONS */
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
    }`;
html = html.replace(badOptimizations, '');

// 3. Keep the backdrop filter fix, but without the broken oi-wrap sizes.
html = html.replace('</style>', `
    /* ADDED MOBILE OPTIMIZATIONS (FIXED) */
    @media (max-width: 700px) {
        .glass-section, #trans {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }
        .oi {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
  </style>`);

// 4. Restore the oi-wrap::after gradient that was hiding the watermark, because it's part of the design
html = html.replace('/* Removed .oi-wrap::after to fix image cropping bug on smartphone */', `
    /* Masque le coin bas-droit (filigrane Veo) via overlay interne */
    .oi-wrap::after {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 60% 55% at 95% 95%,
          rgba(10,12,15,.95) 0%,
          rgba(10,12,15,.6) 30%,
          transparent 65%);
      pointer-events: none;
      z-index: 2;
    }`);

fs.writeFileSync('index.html', html);
console.log('Fixed CSS typoes and layout in index.html!');
