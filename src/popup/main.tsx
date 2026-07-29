import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '../fonts.css';
import '../index.css';
import { initTelemetry } from '../lib/telemetry';

void initTelemetry();

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
