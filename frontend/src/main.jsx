import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'
import './i18n'
import './index.css'

// КРИТИЧЕСКИ ВАЖНО: Предотвращение горизонтального скролла
if (typeof window !== 'undefined') {
  document.documentElement.style.overflowX = 'hidden';
  document.documentElement.style.maxWidth = '100%';
  document.body.style.overflowX = 'hidden';
  document.body.style.maxWidth = '100%';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  
  // Добавляем стиль для #root
  const style = document.createElement('style');
  style.innerHTML = `
    #root {
      overflow-x: hidden !important;
      max-width: 100vw !important;
    }
    * {
      max-width: 100vw !important;
    }
  `;
  document.head.appendChild(style);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)