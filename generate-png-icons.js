const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background gradient (pink)
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#ec4899');
    gradient.addColorStop(1, '#f472b6');

    // Rounded rectangle
    const radius = size * 0.2;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // MJ text
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${size * 0.28}px Arial Black, Arial`;
    ctx.fillText('MJ', size / 2, size * 0.38);

    // "the best" text
    ctx.font = `bold ${size * 0.13}px Arial`;
    ctx.globalAlpha = 0.95;
    ctx.fillText('the best', size / 2, size * 0.65);
    ctx.globalAlpha = 1;

    return canvas.toBuffer('image/png');
}

// Create icons directory if needed
const iconsDir = path.join(__dirname, 'public', 'icons');

// Generate all sizes
sizes.forEach(size => {
    const buffer = generateIcon(size);
    const filename = path.join(iconsDir, `icon-${size}.png`);
    fs.writeFileSync(filename, buffer);
    console.log(`Created ${filename}`);
});

// Also create apple-touch-icon.png (180x180)
const appleIcon = generateIcon(180);
fs.writeFileSync(path.join(__dirname, 'public', 'apple-touch-icon.png'), appleIcon);
console.log('Created public/apple-touch-icon.png');

console.log('Done!');
