import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/globals.css'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker } from './lib/sw-register.ts'

registerServiceWorker()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
