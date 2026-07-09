import type { Config } from 'tailwindcss';

export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				navy: {
					50: '#f0f3f9',
					100: '#d9e0ef',
					200: '#b3c0df',
					300: '#8da0cf',
					400: '#6680bf',
					500: '#4060af',
					600: '#334d8c',
					700: '#263a69',
					800: '#1a2746',
					900: '#0d1423',
					950: '#070a12'
				},
				indigo: {
					50: '#eef2ff',
					100: '#e0e7ff',
					200: '#c7d2fe',
					300: '#a5b4fc',
					400: '#818cf8',
					500: '#6366f1',
					600: '#4f46e5',
					700: '#4338ca',
					800: '#3730a3',
					900: '#312e81',
					950: '#1e1b4b'
				},
				surface: {
					DEFAULT: 'var(--color-surface)',
					elevated: 'var(--color-surface-elevated)',
					card: 'var(--color-surface-card)',
					hover: 'var(--color-surface-hover)',
					overlay: 'var(--color-surface-overlay)',
				},
				border: {
					DEFAULT: 'var(--color-border)',
					strong: 'var(--color-border-strong)',
				},
				ink: {
					DEFAULT: 'var(--color-ink)',
					soft: 'var(--color-ink-soft)',
					muted: 'var(--color-ink-muted)',
				}
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
				mono: ['JetBrains Mono', 'Fira Code', 'monospace']
			}
		}
	},
	plugins: []
} satisfies Config;
