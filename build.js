const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const INCLUDE = [
  'audio',
  'css',
  'data',
  'fonts',
  'img',
  'js',
  'tests',
  'favicon.png',
  'index.html',
];

// Clean and create dist
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}
fs.mkdirSync('dist');

// Copy included files/folders
INCLUDE.forEach(item => {
  const src = path.join(__dirname, item);
  const dest = path.join(__dirname, 'dist', item);

  if (fs.statSync(src).isDirectory()) {
    fs.cpSync(src, dest, { recursive: true });
  } else {
    fs.copyFileSync(src, dest);
  }
});

// Create zip
const output = fs.createWriteStream(path.join(__dirname, 'index.zip'));
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  const zipPath = path.join(__dirname, 'index.zip');
  const distZipPath = path.join(__dirname, 'dist', 'index.zip');
  fs.renameSync(zipPath, distZipPath);
  console.log('✓ Dist folder created');
  console.log(`✓ index.zip created (${archive.pointer()} bytes)`);
});

archive.on('error', err => {
  throw err;
});

archive.pipe(output);
archive.directory('dist/', false);
archive.finalize();
