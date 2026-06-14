import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { startOutbox } from './lib/outbox'

startOutbox() // reintenta escrituras encoladas al cargar / reconectar

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
