import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ToastProvider } from './context/ToastContext';

ReactDOM.createRoot(document.getElementById('root')).render(
    <ToastProvider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ToastProvider>
);
