import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const enableStrict = import.meta.env.VITE_ENABLE_STRICT_MODE === 'true';

createRoot(document.getElementById('root')!).render(
  enableStrict ? (
    <StrictMode>
      <App />
    </StrictMode>
  ) : (
    <App />
  ),
)
