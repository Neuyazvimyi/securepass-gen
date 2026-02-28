import type { PasswordOptions } from './password';

export type StrengthLevel = 'weak' | 'medium' | 'strong' | 'excellent';

export interface StrengthResult {
	level: StrengthLevel;
	/** 0–100, used for progress bar width */
	score: number;
	/** Shannon entropy in bits */
	entropy: number;
}

function charsetSize(opts: PasswordOptions): number {
	let size = 0;
	if (opts.useUpper) size += opts.excludeAmbiguous ? 24 : 26;
	if (opts.useLower) size += opts.excludeAmbiguous ? 24 : 26;
	if (opts.useDigits) size += opts.excludeAmbiguous ? 8 : 10;
	if (opts.useSpecial) size += opts.specialChars && opts.specialChars.length > 0 ? opts.specialChars.length : 28;
	return size;
}

export function calculateStrength(password: string, opts: PasswordOptions): StrengthResult {
	if (!password) return { level: 'weak', score: 0, entropy: 0 };

	const size = charsetSize(opts);
	const entropy = password.length * Math.log2(Math.max(size, 2));

	const activeCategories = [opts.useUpper, opts.useLower, opts.useDigits, opts.useSpecial].filter(
		Boolean,
	).length;

	let level: StrengthLevel;
	if (activeCategories === 4 && password.length > 16 && opts.excludeAmbiguous) {
		level = 'excellent';
	} else if (activeCategories >= 3 && password.length > 12) {
		level = 'strong';
	} else if (activeCategories >= 2 && password.length >= 8) {
		level = 'medium';
	} else {
		level = 'weak';
	}

	// 128 bits of entropy ≈ 100 % on the bar
	const score = Math.min(100, Math.round((entropy / 128) * 100));

	return { level, score, entropy };
}
