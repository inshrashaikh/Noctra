import '@/styles/globals.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from '@/app/App';

async function bootstrap() {
  // Start MSW in mock mode
  if (import.meta.env.VITE_DATA_MODE === 'mock') {
    const { worker } = await import('@/mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      quiet: true,
    });
  }

  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
