import React from 'react';
import ReactDOM from 'react-dom/client';
// Self-hosted variable fonts. Google Fonts is never linked at runtime in production.
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
