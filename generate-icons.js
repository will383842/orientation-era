// Script pour générer les icônes PWA
// Utilise canvas pour créer des icônes sans dépendances externes

const fs = require('fs');
const path = require('path');

// Tailles d'icônes nécessaires pour PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Créer un SVG simple comme icône de base
function createIconSVG(size) {
    const padding = size * 0.1;
    const innerSize = size - (padding * 2);

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <!-- Star/Compass icon -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Étoile stylisée -->
    <path d="M0,${-innerSize*0.35} L${innerSize*0.08},${-innerSize*0.08} L${innerSize*0.35},0 L${innerSize*0.08},${innerSize*0.08} L0,${innerSize*0.35} L${-innerSize*0.08},${innerSize*0.08} L${-innerSize*0.35},0 L${-innerSize*0.08},${-innerSize*0.08} Z"
          fill="white" opacity="0.95"/>
    <!-- Centre -->
    <circle r="${innerSize*0.08}" fill="white"/>
  </g>
  <!-- Lettre E pour ERA -->
  <text x="${size/2}" y="${size*0.58}"
        font-family="Arial, sans-serif"
        font-size="${size*0.25}"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        opacity="0.9">E</text>
</svg>`;
}

// Créer le dossier icons s'il n'existe pas
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Générer les SVG (qui fonctionnent comme icônes)
console.log('Génération des icônes PWA...\n');

sizes.forEach(size => {
    const svg = createIconSVG(size);
    const filename = `icon-${size}.svg`;
    const filepath = path.join(iconsDir, filename);
    fs.writeFileSync(filepath, svg);
    console.log(`✓ ${filename} créé`);
});

// Créer aussi une version SVG principale
const mainSvg = createIconSVG(512);
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), mainSvg);
console.log('✓ icon.svg créé');

console.log('\n✅ Icônes générées avec succès !');
console.log('\nNote: Les navigateurs modernes supportent les icônes SVG.');
console.log('Pour des PNG, utilisez un convertisseur en ligne comme:');
console.log('https://cloudconvert.com/svg-to-png\n');
