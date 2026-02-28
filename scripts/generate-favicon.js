import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = join(__dirname, '..', 'static');

async function createFavicon() {
	const svg = readFileSync(join(staticDir, 'favicon.svg'));
	
	// Create favicon.ico (multi-size: 16, 32, 48)
	await sharp(svg)
		.resize(32, 32)
		.toFile(join(staticDir, 'favicon-32.png'));
	
	await sharp(svg)
		.resize(16, 16)
		.toFile(join(staticDir, 'favicon-16.png'));
	
	// Create apple-touch-icon (180x180 for iOS)
	await sharp(readFileSync(join(staticDir, 'icon.svg')))
		.resize(180, 180)
		.png()
		.toFile(join(staticDir, 'apple-touch-icon.png'));
	
	console.log('Created favicon-16.png, favicon-32.png, apple-touch-icon.png');
}

createFavicon().catch(console.error);
