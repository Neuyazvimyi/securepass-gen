export interface PasswordOptions {
	length: number;
	useUpper: boolean;
	useLower: boolean;
	useDigits: boolean;
	useSpecial: boolean;
	excludeAmbiguous: boolean;
}

const CHARS = {
	upperAll: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	upperClean: 'ABCDEFGHJKLMNPQRSTUVWXYZ', // no I, O
	lowerAll: 'abcdefghijklmnopqrstuvwxyz',
	lowerClean: 'abcdefghjkmnpqrstuvwxyz', // no l, o
	digitsAll: '0123456789',
	digitsClean: '23456789', // no 0, 1
	special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
} as const;

function randomIndex(max: number): number {
	const buf = new Uint32Array(1);
	crypto.getRandomValues(buf);
	return buf[0] % max;
}

export function generatePassword(opts: PasswordOptions): string {
	const { length, useUpper, useLower, useDigits, useSpecial, excludeAmbiguous } = opts;

	const charsets: string[] = [];
	if (useUpper) charsets.push(excludeAmbiguous ? CHARS.upperClean : CHARS.upperAll);
	if (useLower) charsets.push(excludeAmbiguous ? CHARS.lowerClean : CHARS.lowerAll);
	if (useDigits) charsets.push(excludeAmbiguous ? CHARS.digitsClean : CHARS.digitsAll);
	if (useSpecial) charsets.push(CHARS.special);

	if (charsets.length === 0) return '';

	const pool = charsets.join('');
	const result: string[] = [];

	// Guarantee at least one character from each active category
	for (const charset of charsets) {
		result.push(charset[randomIndex(charset.length)]);
	}

	// Fill remaining positions from the combined pool
	while (result.length < length) {
		result.push(pool[randomIndex(pool.length)]);
	}

	// Fisher-Yates shuffle
	for (let i = result.length - 1; i > 0; i--) {
		const j = randomIndex(i + 1);
		[result[i], result[j]] = [result[j], result[i]];
	}

	return result.join('');
}
