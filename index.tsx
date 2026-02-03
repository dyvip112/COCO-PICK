
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Basic client-side devtools deterrents (not secure)
const BLOCKED_KEYS = new Set(['F12']);
const isBlockedCombo = (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();
  return (
    (e.ctrlKey && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
    (e.ctrlKey && key === 'u') ||
    (e.ctrlKey && key === 's')
  );
};

window.addEventListener('contextmenu', (e) => e.preventDefault());
window.addEventListener('keydown', (e) => {
  if (BLOCKED_KEYS.has(e.key) || isBlockedCombo(e)) {
    e.preventDefault();
    e.stopPropagation();
  }
});

// Simple devtools open detection
setInterval(() => {
  const threshold = 160;
  const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
  const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
  if (widthDiff > threshold || heightDiff > threshold) {
    document.body.setAttribute('data-devtools', 'open');
  } else {
    document.body.removeAttribute('data-devtools');
  }
}, 1000);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('SW registration failed: ', err);
    });
  });
}
