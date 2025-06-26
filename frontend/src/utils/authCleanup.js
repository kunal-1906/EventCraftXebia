/**
 * Utility to clean up any stale authentication data that might be causing login loops
 */

// List of keys to clear from localStorage that might be causing auth loops
const keysToClean = [
  'lastLoginAttempt',
  'auth0.is.authenticated',
  'auth0.spajs.txs'
];

/**
 * Clean up any stale authentication data that might be causing login loops
 */
export const cleanupAuthData = () => {
  console.log('Cleaning up stale authentication data...');
  
  // Clear specific keys that might be causing issues
  keysToClean.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`Removing stale auth data: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  // Optional: If still having issues, uncomment to clear all Auth0 related data
  // This is more aggressive and will force a complete re-login
  /*
  Object.keys(localStorage).forEach(key => {
    if (key.includes('auth0') || key.includes('login')) {
      console.log(`Removing auth0 data: ${key}`);
      localStorage.removeItem(key);
    }
  });
  */
  
  console.log('Auth cleanup complete');
};

export default cleanupAuthData; 