import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { startOutbox } from './lib/outbox'

startOutbox() // reintenta escrituras encoladas al cargar / reconectar

// Tras un deploy, el service worker viejo puede referenciar chunks (módulos
// lazy) que ya no existen → el import dinámico falla y se ve "Algo salió mal".
// Vite emite `vite:preloadError`; recargamos una vez para traer el index+chunks
// nuevos. El flag en sessionStorage evita un bucle de recarga.
window.addEventListener('vite:preloadError', () => {
  // Recarga como máximo una vez por sesión de pestaña (evita bucle si el chunk
  // faltara de verdad). Un deploy nuevo trae una sesión nueva al reabrir.
  if (sessionStorage.getItem('chunk-reloaded')) return;
  sessionStorage.setItem('chunk-reloaded', '1');
  window.location.reload();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
