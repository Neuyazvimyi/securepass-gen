<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from 'svelte-i18n';
	import { generatePassword } from '$lib/utils/password';
	import { calculateStrength } from '$lib/utils/strength';
	import type { StrengthLevel } from '$lib/utils/strength';

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
	let toastTimer: ReturnType<typeof setTimeout> | undefined;

	const activeCount = $derived(
		[useUpper, useLower, useDigits, useSpecial].filter(Boolean).length,
	);

	// Auto-correct minimum length to match number of selected categories
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

	function generate() {
		if (activeCount === 0) {
			password = '';
			return;
		}
		password = generatePassword(options);
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
		} catch {
			// Clipboard access denied — do nothing
		}
	}

	onMount(() => {
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
		<div class="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
			<!-- Password output -->
			<div class="relative mb-4">
				<input
					type={showPassword ? 'text' : 'password'}
					value={password}
					readonly
					placeholder="—"
					class="w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-3 pr-20 font-mono
						text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
				<div class="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
					<button
						onclick={() => (showPassword = !showPassword)}
						title={showPassword ? $t('hide') : $t('show')}
						class="rounded p-1 text-gray-400 transition-colors hover:text-purple-600
							dark:hover:text-purple-400"
					>
						{showPassword ? '🙈' : '👁️'}
					</button>
					<button
						onclick={copyPassword}
						title={$t('copy')}
						disabled={!password}
						class="rounded p-1 text-gray-400 transition-colors hover:text-purple-600
							disabled:opacity-40 dark:hover:text-purple-400"
					>
						📋
					</button>
				</div>
			</div>

			<!-- Strength indicator -->
			{#if strength}
				<div class="mb-4">
					<div class="mb-1 flex items-center justify-between text-xs">
						<span class="text-gray-500 dark:text-gray-400">{$t('strength_label')}</span>
						<span class="font-semibold {textColor[strength.level]}">
							{levelEmoji[strength.level]}
							{$t(strength.level)}
						</span>
					</div>
					<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
						<div
							class="h-full rounded-full transition-all duration-300 {barColor[strength.level]}"
							style="width: {strength.score}%"
						></div>
					</div>
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
								bg-white text-gray-600 transition-colors hover:bg-gray-50
								dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
								text-sm font-bold text-purple-600 focus:border-purple-500 focus:outline-none
								dark:border-gray-600 dark:bg-gray-700 dark:text-purple-400"
						/>
						<button
							onclick={() => length = Math.min(128, length + 1)}
							class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300
								bg-white text-gray-600 transition-colors hover:bg-gray-50
								dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
						class="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
					>
						<input
							type="checkbox"
							bind:checked={useUpper}
							class="checkbox-purple size-4"
						/>
						{$t('uppercase')}
					</label>
					<label
						class="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
					>
						<input
							type="checkbox"
							bind:checked={useLower}
							class="checkbox-purple size-4"
						/>
						{$t('lowercase')}
					</label>
					<label
						class="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
					>
						<input
							type="checkbox"
							bind:checked={useDigits}
							class="checkbox-purple size-4"
						/>
						{$t('digits')}
					</label>
					<label
						class="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
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
								text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none
								dark:border-gray-600 dark:bg-gray-700 dark:text-white
								dark:placeholder-gray-500 dark:focus:border-purple-400"
						/>
					</div>
				{/if}
			</fieldset>

			<!-- Exclude ambiguous -->
			<label
				class="mb-4 flex cursor-pointer items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
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
				disabled={activeCount === 0}
				class="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white
					transition-colors hover:bg-purple-700 focus:ring-2 focus:ring-purple-500
					focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
					dark:focus:ring-offset-gray-800"
			>
				🔑 {$t('generate')}
			</button>
		</div>
	</div>
</div>

<!-- Toast notification -->
{#if toastVisible}
	<div
		class="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3
		text-sm font-medium text-white shadow-lg"
	>
		✓ {$t('copied')}
	</div>
{/if}
