import CryptoJS from 'crypto-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const password = process.argv[2];
if (!password) {
    console.error('Please provide a password as an argument: npm run secure <password>');
    process.exit(1);
}

// Adjust relative paths to project root
const projectRoot = path.join(__dirname, '..');

const filesToEncrypt = [
    { input: path.join(projectRoot, '總成績.csv'), output: path.join(projectRoot, 'public/data.csv.enc') },
    { input: path.join(projectRoot, 'public/analysis_config.json'), output: path.join(projectRoot, 'public/config.json.enc') }
];

filesToEncrypt.forEach(file => {
    if (fs.existsSync(file.input)) {
        const data = fs.readFileSync(file.input, 'utf8');
        const encrypted = CryptoJS.AES.encrypt(data, password).toString();
        fs.writeFileSync(file.output, encrypted);
        console.log(`Encrypted ${path.basename(file.input)} -> ${path.basename(file.output)}`);
    } else {
        console.warn(`File not found: ${file.input}`);
    }
});

console.log('\nSecurity Setup Complete!');
console.log(`Password set to: [ REDACTED ]`);
console.log('IMPORTANT: Run "npm run secure <password>" before building.');
