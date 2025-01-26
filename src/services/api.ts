import { supabase } from '../lib/supabase/client';

// Remove the /api prefix since it's included in the ngrok URL
export const API_BASE_URL = 'https://outrival-api.ngrok.dev';

// Add auth token helper
let cachedToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

export async function getAuthToken(): Promise<string> {
  // If we have a cached token, return it
  if (cachedToken) {
    return cachedToken;
  }

  // If we're already fetching a token, return that promise
  if (tokenPromise) {
    return tokenPromise;
  }

  // Create a new promise to fetch the token
  tokenPromise = (async () => {
    try {
      console.log('[API] Getting auth token...');
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      // If we have a session with token, use it
      if (session?.access_token) {
        console.log('[API] Got auth token');
        cachedToken = session.access_token;
        return session.access_token;
      }

      // Otherwise wait for auth state to be ready
      console.log('[API] Waiting for auth session...');
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          unsubscribe?.();
          reject(new Error('Auth session timeout'));
        }, 10000); // 10 second timeout

        const unsubscribe = supabase.auth.onAuthStateChange((event, session) => {
          if (session?.access_token) {
            console.log('[API] Got auth token from state change');
            clearTimeout(timeout);
            unsubscribe?.();
            cachedToken = session.access_token;
            resolve(session.access_token);
          } else if (event === 'SIGNED_OUT') {
            clearTimeout(timeout);
            unsubscribe?.();
            reject(new Error('User signed out'));
          }
        });
      });
    } catch (error) {
      console.error('[API] Error getting auth token:', error);
      throw error;
    } finally {
      tokenPromise = null;
    }
  })();

  return tokenPromise;
}

// Clear token cache when auth state changes
supabase.auth.onAuthStateChange((event) => {
  console.log('[API] Auth state changed:', event);
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    console.log('[API] Clearing cached token');
    cachedToken = null;
  }
});