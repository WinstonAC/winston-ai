/**
 * getURL - A utility function that returns the application's base URL
 * 
 * This function determines the correct base URL for the application based on the environment:
 * 1. Uses NEXT_PUBLIC_SITE_URL if available (production)
 * 2. Falls back to localhost:3000 for development
 * 
 * The function ensures the URL always ends with a trailing slash for consistency
 * in URL concatenation and routing.
 * 
 * @returns {string} The base URL of the application with a trailing slash
 */
export const getURL = (): string => {
  // Get the base URL from environment variable or fallback to localhost
  const baseURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  // Ensure the URL ends with a trailing slash
  return baseURL.endsWith('/') ? baseURL : `${baseURL}/`;
}; 