import React from 'react'
import ReactDOM from 'react-dom/client';
import App from './App.jsx'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enable HMR
if (import.meta.hot) {
  import.meta.hot.accept();
}
