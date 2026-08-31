const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const buildDir = 'dist';
const artifactName = 'investigator.mforce';

// Ensure dist directory exists
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}

const zip = new AdmZip();

// Return true if file should be ignored
function isIgnored(filename) {
    const ignored = ['.git', '.venv', 'venv', 'node_modules', '.DS_Store', 'dist'];
    return ignored.some(i => filename.includes(i));
}

function addDirectory(localPath, zipPath) {
    if (!fs.existsSync(localPath)) return;

    const items = fs.readdirSync(localPath);

    for (const item of items) {
        if (isIgnored(item)) continue;

        const fullPath = path.join(localPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            addDirectory(fullPath, path.join(zipPath, item));
        } else {
            zip.addLocalFile(fullPath, zipPath);
        }
    }
}

console.log('Packaging .mforce artifact...');

// Add manifest
zip.addLocalFile('mforce.json');

// Add src directory
addDirectory('src', 'src');

const outputPath = path.join(buildDir, artifactName);
zip.writeZip(outputPath);

console.log(`Build complete: ${outputPath}`);
