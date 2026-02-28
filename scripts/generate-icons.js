import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = join(__dirname, '..', 'static');

async function createIcon(size) {
	const svg = readFileSync(join(staticDir, 'icon.svg'));
	
	await sharp(svg)
		.resize(size, size)
		.png()
		.toFile(join(staticDir, `icon-${size}.png`));
	
	console.log(`Created icon-${size}.png`);
}

async function createMaskableIcon(size) {
	const svg = readFileSync(join(staticDir, 'icon-maskable.svg'));
	
	await sharp(svg)
		.resize(size, size)
		.png()
		.toFile(join(staticDir, `icon-${size}-maskable.png`));
	
	console.log(`Created icon-${size}-maskable.png`);
}

async function main() {
	await createIcon(192);
	await createIcon(512);
	await createMaskableIcon(192);
	await createMaskableIcon(512);
	console.log('Done!');
}

main().catch(console.error);
