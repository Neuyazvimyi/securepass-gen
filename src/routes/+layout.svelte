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
	<header class="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
		<div class="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">
			<div class="flex items-center gap-2">
				<span class="text-2xl">🔑</span>
				<span class="text-lg font-bold text-purple-700 dark:text-purple-400">SecurePass Gen</span>
			</div>

			<div class="flex items-center gap-1">
				<button
					onclick={() => setLocale('ru')}
					class="rounded px-2 py-1 text-sm font-medium transition-colors
						{$locale === 'ru'
						? 'bg-purple-600 text-white'
						: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}"
				>
					RU
				</button>
				<button
					onclick={() => setLocale('en')}
					class="rounded px-2 py-1 text-sm font-medium transition-colors
						{$locale === 'en'
						? 'bg-purple-600 text-white'
						: 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}"
				>
					EN
				</button>

				<button
					onclick={toggleTheme}
					aria-label="Toggle theme"
					class="ml-1 rounded-lg p-2 text-lg text-gray-600 transition-colors hover:bg-gray-100
						dark:text-gray-300 dark:hover:bg-gray-700"
				>
					{isDark ? '☀️' : '🌙'}
				</button>
			</div>
		</div>
	</header>

	<main class="flex flex-1 flex-col">
		{@render children()}
	</main>

	<footer class="border-t border-gray-200 bg-white py-4 dark:border-gray-700 dark:bg-gray-800">
		<div
			class="mx-auto flex max-w-screen-xl items-center justify-center gap-4 px-4 text-sm text-gray-500 dark:text-gray-400"
		>
			<span>{$t('copyright')}</span>
		</div>
	</footer>
</div>
