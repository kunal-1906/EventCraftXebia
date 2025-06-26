// Auth0 Configuration
export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || 'your-auth0-domain.auth0.com',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || 'your-auth0-client-id',
  redirectUri: import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin,
  audience: import.meta.env.VITE_AUTH0_AUDIENCE || 'your-auth0-api-identifier',
  scope: import.meta.env.VITE_AUTH0_SCOPE || 'openid profile email',
  
  // Additional configurations
  cacheLocation: 'localstorage',
  useRefreshTokens: true,
  
  // Custom claim namespace (optional)
  namespace: import.meta.env.VITE_AUTH0_NAMESPACE || 'https://eventcraft.com',
};

// Helper function to extract custom claims from Auth0 user
export const extractUserClaims = (user) => {
  if (!user) return null;
  
  const { namespace } = auth0Config;
  
  // Handle different social providers (Google, Facebook, etc.)
  // For Google, the sub format is typically "google-oauth2|12345"
  const provider = user.sub ? user.sub.split('|')[0] : null;
  
  return {
    id: user.sub,
    name: user.name || user.given_name || user.nickname || user.email?.split('@')[0],
    email: user.email,
    picture: user.picture,
    provider: provider,
    role: user[`${namespace}/role`] || user.role || 'attendee',
    permissions: user[`${namespace}/permissions`] || [],
    metadata: user[`${namespace}/user_metadata`] || {},
  };
};

// Role-based route protection
export const checkUserRole = (user, requiredRoles = []) => {
  if (!user || !requiredRoles.length) return true;
  
  const userClaims = extractUserClaims(user);
  return requiredRoles.includes(userClaims.role);
};

export default auth0Config;
