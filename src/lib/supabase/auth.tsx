import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        console.log('[Auth] Checking initial session...');
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) {
          console.log('[Auth] Component unmounted during initial session check');
          return;
        }

        if (session?.user) {
          console.log('[Auth] Initial session found:', {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role
          });
          setUser(session.user);
        } else {
          console.log('[Auth] No initial session found');
          setUser(null);
        }
      } catch (error) {
        console.error('[Auth] Error checking initial session:', error);
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    }

    // Initialize auth state
    initializeAuth();

    // Listen for auth changes
    console.log('[Auth] Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) {
        console.log('[Auth] Component unmounted during auth state change');
        return;
      }

      console.log('[Auth] Auth state change:', {
        event,
        userId: session?.user?.id,
        email: session?.user?.email
      });

      if (event === 'SIGNED_OUT') {
        console.log('[Auth] User signed out');
        setUser(null);
      } else if (session?.user) {
        console.log('[Auth] User session updated:', {
          id: session.user.id,
          email: session.user.email
        });
        setUser(session.user);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('[Auth] Cleaning up auth provider...');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('[Auth] Attempting sign in:', { email });
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('[Auth] Sign in error:', error);
        throw error;
      }
      console.log('[Auth] Sign in successful:', { userId: data.user?.id });
    } catch (error) {
      console.error('[Auth] Unexpected sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log('[Auth] Attempting sign up:', { email });
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            first_name: email.split('@')[0],
            last_name: '',
            preferred_name: email.split('@')[0],
            time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        }
      });
      
      if (error) {
        console.error('[Auth] Sign up error:', error);
        throw error;
      }
      
      console.log('[Auth] Sign up successful:', { userId: data.user?.id });
      
      // Automatically sign in after signup
      if (data.user) {
        console.log('[Auth] Auto signing in after signup...');
        await signIn(email, password);
      }
    } catch (error) {
      console.error('[Auth] Unexpected sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('[Auth] Attempting sign out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[Auth] Sign out error:', error);
        throw error;
      }
      console.log('[Auth] Sign out successful');
    } catch (error) {
      console.error('[Auth] Unexpected sign out error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading, initialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}