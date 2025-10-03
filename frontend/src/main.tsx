import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html contains a div with id="root"');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
