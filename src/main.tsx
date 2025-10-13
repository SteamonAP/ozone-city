import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell } from './ui/AppShell';

const container = document.getElementById('root');
if (!container) {
	throw new Error('Root container not found');
}
const root = createRoot(container);
root.render(<AppShell />);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js').catch(() => {});
	});
}
