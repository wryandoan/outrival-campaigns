import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function validateSession(session: { user: User } | null) {
      if (!session?.user) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        // Try to access a protected resource to validate the session
        const { error: accessError } = await supabase
          .from('campaigns')
          .select('campaign_id')
          .limit(1);

        if (!mounted) return;

        if (accessError?.message?.includes('JWT') || 
            accessError?.message?.includes('auth') ||
            accessError?.status === 401) {
          console.error('Invalid session:', accessError);
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(session.user);
        }
      } catch (err) {
        console.error('Session validation error:', err);
        if (mounted) {
          await supabase.auth.signOut();
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        validateSession(session);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state change:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        validateSession(session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
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
    
    if (error) throw error;
    
    // Automatically sign in after signup
    if (data.user) {
      await signIn(email, password);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
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