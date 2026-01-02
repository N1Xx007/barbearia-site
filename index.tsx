
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Registra o Service Worker para permitir "Adicionar à tela inicial"
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registrado', reg))
      .catch(err => console.log('Erro ao registrar SW', err));
  });
}

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Não foi possível encontrar o elemento root no DOM.");
}
