import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { TemaProvider } from './theme/TemaProvider';

// 🌿 PlantTrack V2 — arranque de la app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TemaProvider>
      <App />
    </TemaProvider>
  </React.StrictMode>,
);
