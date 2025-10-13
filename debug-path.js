import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

console.log('Current directory:', __dirname);
console.log('Project root:', projectRoot);
console.log('Dist public path:', path.join(projectRoot, 'dist', 'public'));

const distPath = path.join(projectRoot, 'dist', 'public');
console.log('Does dist path exist?', fs.existsSync(distPath));