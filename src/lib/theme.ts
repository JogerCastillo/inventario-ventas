const THEME_KEY = 'inventario_ventas_theme';

export function getStoredTheme(): 'dark' | 'light' {
	if (typeof localStorage === 'undefined') return 'dark';
	const stored = localStorage.getItem(THEME_KEY);
	if (stored === 'light' || stored === 'dark') return stored;
	return 'dark';
}

export function applyTheme(theme: 'dark' | 'light') {
	if (typeof document === 'undefined') return;
	document.documentElement.classList.toggle('dark', theme === 'dark');
	localStorage.setItem(THEME_KEY, theme);
}

export function toggleTheme(): 'dark' | 'light' {
	const current = getStoredTheme();
	const next = current === 'dark' ? 'light' : 'dark';
	applyTheme(next);
	return next;
}
