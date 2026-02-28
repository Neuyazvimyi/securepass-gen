<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from 'svelte-i18n';
	import { generatePassword } from '$lib/utils/password';
	import { calculateStrength } from '$lib/utils/strength';
	import type { StrengthLevel } from '$lib/utils/strength';

	// State with localStorage persistence
	let length = $state(16);
	let useUpper = $state(true);
	let useLower = $state(true);
	let useDigits = $state(true);
	let useSpecial = $state(false);
	let specialChars = $state('!@#$%^&*()_+-=[]{}|;:,.<>?');
	let excludeAmbiguous = $state(true);
	let password = $state('');
	let showPassword = $state(true);
	let toastVisible = $state(false);
	let isGenerating = $state(false);
	let toastTimer: ReturnType<typeof setTimeout> | undefined;

	const activeCount = $derived(
		[useUpper, useLower, useDigits, useSpecial].filter(Boolean).length,
	);

	const effectiveLength = $derived(Math.max(length, activeCount || 1));

	const options = $derived({
		length: effectiveLength,
		useUpper,
		useLower,
		useDigits,
		useSpecial,
		excludeAmbiguous,
		specialChars,
	});

	const strength = $derived(password ? calculateStrength(password, options) : null);

	const barColor: Record<StrengthLevel, string> = {
		weak: 'bg-red-500',
		medium: 'bg-orange-500',
		strong: 'bg-green-500',
		excellent: 'bg-purple-500',
	};

	const textColor: Record<StrengthLevel, string> = {
		weak: 'text-red-600 dark:text-red-400',
		medium: 'text-orange-500 dark:text-orange-400',
		strong: 'text-green-600 dark:text-green-400',
		excellent: 'text-purple-600 dark:text-purple-400',
	};

	const levelEmoji: Record<StrengthLevel, string> = {
		weak: '🔴',
		medium: '🟠',
		strong: '🟢',
		excellent: '🟣',
	};

	const strengthReasons: Record<StrengthLevel, string[]> = {
		weak: [],
		medium: ['length_short', 'few_categories'],
		strong: [],
		excellent: [],
	};

	function getStrengthReasons(): string[] {
		const reasons: string[] = [];
		if (!strength) return [];

		if (effectiveLength < 8) reasons.push('length_short');
		if (effectiveLength < 12 && strength.level !== 'weak') reasons.push('could_be_longer');
		if (activeCount < 2) reasons.push('add_categories');
		if (activeCount < 4 && strength.level === 'strong') reasons.push('add_more_categories');
		if (!excludeAmbiguous && strength.level !== 'excellent') reasons.push('exclude_ambiguous_help');
		if (strength.level === 'excellent') reasons.push('perfect');

		return reasons;
	}

	function saveSettings() {
		const settings = {
			length,
			useUpper,
			useLower,
			useDigits,
			useSpecial,
			specialChars,
			excludeAmbiguous,
		};
		localStorage.setItem('securepass_settings', JSON.stringify(settings));
	}

	function loadSettings() {
		const saved = localStorage.getItem('securepass_settings');
		if (saved) {
			try {
				const settings = JSON.parse(saved);
				if (typeof settings.length === 'number') length = settings.length;
				if (typeof settings.useUpper === 'boolean') useUpper = settings.useUpper;
				if (typeof settings.useLower === 'boolean') useLower = settings.useLower;
				if (typeof settings.useDigits === 'boolean') useDigits = settings.useDigits;
				if (typeof settings.useSpecial === 'boolean') useSpecial = settings.useSpecial;
				if (typeof settings.specialChars === 'string') specialChars = settings.specialChars;
				if (typeof settings.excludeAmbiguous === 'boolean') excludeAmbiguous = settings.excludeAmbiguous;
			} catch {
				// Invalid JSON, use defaults
			}
		}
	}

	// Watch for changes and save
	$effect(() => {
		saveSettings();
	});

	function shuffle(str: string): string {
		const arr = str.split('');
		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr.join('');
	}

	async function generate() {
		if (activeCount === 0) {
			password = '';
			return;
		}

		isGenerating = true;

		// Animation: rapid shuffle effect
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
		let iterations = 0;
		const maxIterations = 10;
		const interval = 50;

		const animate = () => {
			if (iterations < maxIterations) {
				let tempPass = '';
				for (let i = 0; i < effectiveLength; i++) {
					tempPass += chars[Math.floor(Math.random() * chars.length)];
				}
				password = tempPass;
				iterations++;
				setTimeout(animate, interval);
			} else {
				password = generatePassword(options);
				isGenerating = false;
			}
		};

		animate();
	}

	async function copyPassword() {
		if (!password) return;
		try {
			await navigator.clipboard.writeText(password);
			clearTimeout(toastTimer);
			toastVisible = true;
			toastTimer = setTimeout(() => {
				toastVisible = false;
			}, 2500);

			// Haptic feedback
			if (navigator.vibrate) {
				navigator.vibrate(10);
			}
		} catch {
			// Clipboard access denied
		}
	}

	onMount(() => {
		loadSettings();
		generate();
	});
</script>

<div class="flex flex-1 items-center justify-center px-4 py-10">
	<div class="w-full max-w-md">
		<!-- Heading -->
		<div class="mb-6 text-center">
			<h1 class="text-2xl font-bold text-gray-900 dark:text-white">{$t('title')}</h1>
			<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{$t('subtitle')}</p>
		</div>

		<!-- Main card -->
		<div
			class="rounded-2xl bg-white p-6 shadow-lg transition-shadow duration-300
				hover:shadow-xl dark:bg-gray-800"
		>
			<!-- Password output -->
			<div class="relative mb-4">
				<input
					type={showPassword ? 'text' : 'password'}
					value={password}
					readonly
					placeholder="—"
					class="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-3 pr-20 font-mono
						text-sm text-gray-900 transition-all duration-200
						dark:border-gray-600 dark:bg-gray-700 dark:text-white
						{isGenerating ? 'animate-pulse' : ''}"
				/>
				<div class="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
					<button
						onclick={() => (showPassword = !showPassword)}
						title={showPassword ? $t('hide') : $t('show')}
						class="rounded p-1.5 text-gray-400 transition-all duration-200 hover:scale-110 hover:text-purple-600
							dark:hover:text-purple-400"
					>
						{#if showPassword}
							<!-- Eye off icon -->
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
							</svg>
						{:else}
							<!-- Eye icon -->
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
							</svg>
						{/if}
					</button>
					<button
						onclick={copyPassword}
						title={$t('copy')}
						disabled={!password}
						class="rounded p-1.5 text-gray-400 transition-all duration-200 hover:scale-110 hover:text-purple-600
							disabled:opacity-40 dark:hover:text-purple-400"
					>
						<!-- Copy icon -->
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
					</button>
				</div>
			</div>

			<!-- Strength indicator with tooltip -->
			{#if strength}
				<div class="mb-4">
					<div class="mb-1 flex items-center justify-between text-xs">
						<span class="text-gray-500 dark:text-gray-400">{$t('strength_label')}</span>
						<span
							class="font-semibold {textColor[strength.level]} cursor-help"
							title={getStrengthReasons().map(r => $t(r)).join(', ')}
						>
							{levelEmoji[strength.level]}
							{$t(strength.level)}
						</span>
					</div>
					<div class="relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
						<div
							class="h-full rounded-full transition-all duration-500 ease-out {barColor[strength.level]}"
							style="width: {strength.score}%"
						></div>
					</div>
					{#if getStrengthReasons().length > 0}
						<p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
							{getStrengthReasons().map(r => $t(r)).join(' • ')}
						</p>
					{/if}
				</div>
			{/if}

			<hr class="my-4 border-gray-100 dark:border-gray-700" />

			<!-- Length slider -->
			<div class="mb-4">
				<div class="mb-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
					<span>{$t('length')}</span>
					<div class="flex items-center gap-2">
						<button
							onclick={() => length = Math.max(4, length - 1)}
							class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300
								bg-white text-gray-600 transition-all duration-200 hover:scale-105 hover:bg-gray-50
								active:scale-95 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
							type="button"
						>
							−
						</button>
						<input
							type="number"
							min="4"
							max="128"
							bind:value={length}
							class="w-16 rounded-lg border border-gray-300 bg-white px-2 py-1 text-center
								text-sm font-bold text-purple-600 transition-all duration-200 focus:border-purple-500 focus:outline-none
								dark:border-gray-600 dark:bg-gray-700 dark:text-purple-400"
						/>
						<button
							onclick={() => length = Math.min(128, length + 1)}
							class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300
								bg-white text-gray-600 transition-all duration-200 hover:scale-105 hover:bg-gray-50
								active:scale-95 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
							type="button"
						>
							+
						</button>
						<span class="ml-1 text-sm text-gray-500 dark:text-gray-400">{$t('characters')}</span>
					</div>
				</div>
				<input
					id="length"
					type="range"
					min="4"
					max="128"
					bind:value={length}
					class="range-purple h-2 w-full cursor-pointer"
				/>
			</div>

			<!-- Character sets -->
			<fieldset class="mb-3">
				<legend class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
					{$t('char_sets')}
				</legend>
				<div class="space-y-2">
					<label
						class="flex cursor-pointer items-center gap-2 text-sm text-gray-600 transition-colors hover:text-purple-600
							dark:text-gray-400 dark:hover:text-purple-400"
					>
						<input
							type="checkbox"
							bind:checked={useUpper}
							class="checkbox-purple size-4"
						/>
						{$t('uppercase')}
					</label>
					<label
						class="flex cursor-pointer items-center gap-2 text-sm text-gray-600 transition-colors hover:text-purple-600
							dark:text-gray-400 dark:hover:text-purple-400"
					>
						<input
							type="checkbox"
							bind:checked={useLower}
							class="checkbox-purple size-4"
						/>
						{$t('lowercase')}
					</label>
					<label
						class="flex cursor-pointer items-center gap-2 text-sm text-gray-600 transition-colors hover:text-purple-600
							dark:text-gray-400 dark:hover:text-purple-400"
					>
						<input
							type="checkbox"
							bind:checked={useDigits}
							class="checkbox-purple size-4"
						/>
						{$t('digits')}
					</label>
					<label
						class="flex cursor-pointer items-center gap-2 text-sm text-gray-600 transition-colors hover:text-purple-600
							dark:text-gray-400 dark:hover:text-purple-400"
					>
						<input
							type="checkbox"
							bind:checked={useSpecial}
							class="checkbox-purple size-4"
						/>
						{$t('special')}
					</label>
				</div>
				{#if useSpecial}
					<div class="mt-2">
						<input
							type="text"
							bind:value={specialChars}
							placeholder={$t('custom_special')}
							class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
								text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-purple-500 focus:outline-none
								dark:border-gray-600 dark:bg-gray-700 dark:text-white
								dark:placeholder-gray-500 dark:focus:border-purple-400"
						/>
					</div>
				{/if}
			</fieldset>

			<!-- Exclude ambiguous -->
			<label
				class="mb-4 flex cursor-pointer items-start gap-2 text-sm text-gray-600 transition-colors hover:text-purple-600
					dark:text-gray-400 dark:hover:text-purple-400"
			>
				<input
					type="checkbox"
					bind:checked={excludeAmbiguous}
					class="checkbox-purple mt-0.5 size-4"
				/>
				<span>{$t('exclude_ambiguous')}</span>
			</label>

			<!-- No charset warning -->
			{#if activeCount === 0}
				<p
					class="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600
					dark:bg-red-900/20 dark:text-red-400"
				>
					{$t('no_charset')}
				</p>
			{/if}

			<!-- Generate button -->
			<button
				onclick={generate}
				disabled={activeCount === 0 || isGenerating}
				class="relative w-full overflow-hidden rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white
					transition-all duration-200 hover:scale-[1.02] hover:bg-purple-700 active:scale-[0.98]
					focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
					dark:focus:ring-offset-gray-800"
			>
				<span class="relative z-10 flex items-center justify-center gap-2">
					{#if isGenerating}
						<!-- Lightning icon -->
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
					{:else}
						<!-- Key icon -->
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
						</svg>
					{/if}
					{isGenerating ? 'Generating...' : $t('generate')}
				</span>
			</button>
		</div>
	</div>
</div>

<!-- Toast notification -->
{#if toastVisible}
	<div
		class="fixed bottom-4 right-4 z-50 flex animate-bounce items-center gap-2 rounded-lg bg-green-600 px-4 py-3
		text-sm font-medium text-white shadow-lg"
	>
		<!-- Check icon -->
		<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
		</svg>
		{$t('copied')}
	</div>
{/if}
