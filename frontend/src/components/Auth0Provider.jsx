import React from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_AUTH0_CALLBACK_URL || window.location.origin;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  const onRedirectCallback = (appState) => {
    // Clear any previous Auth0 state
    localStorage.removeItem('auth0.is.authenticated');
    
    // Store that we've handled the redirect to prevent loops
    sessionStorage.setItem('auth_callback_handled', 'true');
    sessionStorage.setItem('auth_callback_time', Date.now().toString());
    
    // Only navigate if we have a target URL and we're not already there
    const targetUrl = appState?.returnTo || '/dashboard';
    
    console.log(`Auth0 callback - navigating to: ${targetUrl}`);
    
    // Use replace: true to prevent adding to history stack
    navigate(targetUrl, { replace: true });
  };

  // Check if we're in a callback URL and if we've already handled it
  const isInCallback = window.location.search.includes('code=') && window.location.search.includes('state=');
  
  // If we're in a callback URL, let Auth0 handle it
  if (isInCallback) {
    console.log('In Auth0 callback URL, letting Auth0 handle it');
  }

  if (!domain || !clientId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Auth0 Configuration Error</h2>
          <p className="text-gray-700 mb-4">
            Auth0 domain and client ID must be provided. Please check your environment variables:
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-600">
            <li>VITE_AUTH0_DOMAIN</li>
            <li>VITE_AUTH0_CLIENT_ID</li>
          </ul>
          <p className="text-sm text-gray-500">
            See the AUTH0_SETUP.md file for setup instructions.
          </p>
        </div>
      </div>
    );
  }

  // Prepare auth params - only include audience if it's defined
  const authorizationParams = {
    redirect_uri: redirectUri,
  };
  
  // Only add audience if it exists
  if (audience) {
    authorizationParams.audience = audience;
  }

  // Add skipRedirectCallback if we've already handled the callback
  const auth0ProviderProps = {
    domain,
    clientId,
    authorizationParams,
    onRedirectCallback,
    cacheLocation: "localstorage",
    useRefreshTokens: true
  };

  return (
    <Auth0Provider {...auth0ProviderProps}>
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithNavigate;
