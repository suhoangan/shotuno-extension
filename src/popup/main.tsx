import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '../fonts.css';
import '../index.css';
import { useAuthStore } from '../store/authStore';

useAuthStore.getState().hydrateFromChrome();

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
