// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import App from './App';
import './index.css';
import Auth0ProviderWithNavigate from './components/Auth0Provider';
import { NotificationProvider } from './components/NotificationContext';
import { cleanupAuthData } from './utils/authCleanup';

// Clean up any stale authentication data that might be causing login loops
cleanupAuthData();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Auth0ProviderWithNavigate>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </Auth0ProviderWithNavigate>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
