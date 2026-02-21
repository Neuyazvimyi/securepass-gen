import { addMessages, init, locale } from 'svelte-i18n';
import en from './locales/en.json';
import ru from './locales/ru.json';

export { locale };

let initialized = false;

export function setupI18n(): void {
	if (initialized) return;
	initialized = true;

	addMessages('en', en);
	addMessages('ru', ru);

	const detected =
		typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'en';

	init({
		fallbackLocale: 'en',
		initialLocale: detected === 'ru' ? 'ru' : 'en',
	});
}
