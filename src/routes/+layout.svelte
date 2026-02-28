<script lang="ts">
	import './layout.css';
	import { setupI18n, locale } from '$lib/i18n/config';
	import { t } from 'svelte-i18n';
	import { onMount } from 'svelte';

	setupI18n();

	let { children } = $props();

	let isDark = $state(false);

	onMount(() => {
		const saved = localStorage.getItem('theme');
		isDark = saved === 'dark';
		document.documentElement.classList.toggle('dark', isDark);

		// Register service worker for PWA
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js').catch(() => {
				// Service worker registration failed
			});
		}
	});

	function toggleTheme() {
		isDark = !isDark;
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
		document.documentElement.classList.toggle('dark', isDark);
	}

	function setLocale(lang: 'en' | 'ru') {
		locale.set(lang);
	}
</script>

<div class="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
	<!-- Sticky header for mobile PWA -->
	<header class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95">
		<div class="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-2 sm:py-3">
			<div class="flex items-center gap-2">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-purple-600 dark:text-purple-400 sm:h-8 sm:w-8" viewBox="0 0 512 512" fill="currentColor">
					<circle cx="200" cy="256" r="70"/>
					<circle cx="200" cy="256" r="35" fill="currentColor" class="text-purple-800 dark:text-purple-300"/>
					<rect x="270" y="236" width="130" height="40" rx="8"/>
					<rect x="370" y="236" width="25" height="30" rx="4"/>
					<rect x="410" y="236" width="25" height="45" rx="4"/>
				</svg>
				<span class="text-base font-bold text-purple-700 dark:text-purple-400 sm:text-lg">SecurePass</span>
			</div>

			<div class="flex items-center gap-0.5 sm:gap-1">
				<button
					onclick={() => setLocale('ru')}
					class="rounded px-2 py-1.5 text-xs font-medium transition-all duration-200
						{$locale === 'ru'
						? 'bg-purple-600 text-white'
						: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}
						sm:px-2 sm:py-1 sm:text-sm"
				>
					RU
				</button>
				<button
					onclick={() => setLocale('en')}
					class="rounded px-2 py-1.5 text-xs font-medium transition-all duration-200
						{$locale === 'en'
						? 'bg-purple-600 text-white'
						: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}
						sm:px-2 sm:py-1 sm:text-sm"
				>
					EN
				</button>

				<button
					onclick={toggleTheme}
					aria-label="Toggle theme"
					class="ml-0.5 rounded-lg p-2 transition-all duration-200 hover:scale-110 active:scale-95
						dark:text-gray-300 dark:hover:bg-gray-700 sm:ml-1"
				>
					{#if isDark}
						<!-- Sun icon -->
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
						</svg>
					{:else}
						<!-- Moon icon -->
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
						</svg>
					{/if}
				</button>
			</div>
		</div>
	</header>

	<main class="flex flex-1 flex-col">
		{@render children()}
	</main>

	<!-- Compact footer for mobile -->
	<footer class="border-t border-gray-200 bg-white py-3 dark:border-gray-700 dark:bg-gray-800 sm:py-4">
		<div
			class="mx-auto flex max-w-screen-xl flex-col items-center justify-center gap-2 px-4 text-xs text-gray-500 dark:text-gray-400 sm:flex-row sm:gap-4 sm:text-sm"
		>
			<span>{$t('copyright').replace('2024', String(new Date().getFullYear()))}</span>
			<a
				href="https://github.com/Neuyazvimyi/securepass-gen"
				target="_blank"
				rel="noopener noreferrer"
				class="flex items-center gap-1.5 transition-all duration-200 hover:scale-105 hover:text-purple-600 active:scale-95 dark:hover:text-purple-400"
				aria-label="GitHub"
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
				</svg>
				<span>GitHub</span>
			</a>
		</div>
	</footer>
</div>
