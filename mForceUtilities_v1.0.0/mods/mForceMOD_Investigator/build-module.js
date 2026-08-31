const fs = require('fs');
const JSZip = require('jszip');
const path = require('path');

const zip = new JSZip();
const manifestPath = 'mforce.json';

if (!fs.existsSync(manifestPath)) {
    console.error("Error: mforce.json not found");
    process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath));

console.log(`Packaging ${manifest.name} (${manifest.id})...`);

// Add Manifest
zip.file("mforce.json", JSON.stringify(manifest, null, 2));

// Add Main Bundle
// Manifest.main should point to the entry file relative to root.
// Based on todo.md, main is "dist/bundle.js"
const bundlePath = manifest.main;

if (fs.existsSync(bundlePath)) {
    zip.file(bundlePath, fs.readFileSync(bundlePath));
} else {
    console.error(`Error: Main bundle not found at ${bundlePath}. Did you run 'npm run build'?`);
    process.exit(1);
}

// Ensure dist directory for the .mforce file exists
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Filename based on ID
const outputFilename = `${manifest.id}.mforce`;
const outputPath = path.join('dist', outputFilename);

zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(fs.createWriteStream(outputPath))
    .on('finish', () => console.log(`Package created: ${outputPath}`));
