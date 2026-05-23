import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './theme/tokens.css'; // Design tokens — debe cargar antes de index.css
import './hooks/useTheme'; // aplica tema persistido antes del primer render (no flash)
import './index.css'; /* ESTA LÍNEA ES VITAL PARA QUE FUNCIONE EL MODAL */
import { ToastProvider } from './components/ui';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <ToastProvider />
  </React.StrictMode>,
)
