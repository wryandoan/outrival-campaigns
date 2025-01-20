import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/supabase/auth';
import { acceptInvitation } from '../../services/invitations';
import Logo from '../Logo';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  useEffect(() => {
    // Check for invite token in URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('invite');
    if (token) {
      setInviteToken(token);
      setIsSignUp(true); // Force sign up mode for invites
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isSignUp) {
        await signUp(email, password);
        
        // If this was an invite, accept it after signup
        if (inviteToken) {
          const success = await acceptInvitation(inviteToken);
          if (!success) {
            setError('Failed to accept invitation. Please contact the campaign owner.');
          }
          // Remove invite token from URL after successful signup
          window.history.replaceState({}, '', window.location.pathname);
        }
      } else {
        await signIn(email, password);
        // Remove invite token from URL after successful login
        if (window.location.search.includes('invite=')) {
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        // If user exists during signup, suggest signing in
        if (err.message.includes('already registered')) {
          setError('This email is already registered. Please sign in instead.');
          return;
        }
        // If invalid login, give a clear message
        if (err.message.includes('Invalid login')) {
          setError('Invalid email or password. Please try again.');
          return;
        }
        setError(err.message);
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-25 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex flex-col items-center">
          <Logo className="w-16 h-16 text-dark-600" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-600">
            {inviteToken 
              ? 'Accept Campaign Invitation'
              : isSignUp 
                ? 'Create your account' 
                : 'Sign in to your account'
            }
          </h2>
          {inviteToken && (
            <p className="mt-2 text-center text-sm text-dark-400">
              Create an account to join the campaign
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 rounded-md p-4">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-dark-300 placeholder-dark-400 text-dark-600 bg-dark-50 focus:outline-none focus:ring-dark-300 focus:border-dark-300 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-dark-300 placeholder-dark-400 text-dark-600 bg-dark-50 focus:outline-none focus:ring-dark-300 focus:border-dark-300 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-dark-600 bg-dark-100 hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-300"
            >
              {isSignUp ? 'Sign up' : 'Sign in'}
            </button>
          </div>

          {!inviteToken && (
            <div className="text-sm text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="font-medium text-dark-400 hover:text-dark-600"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}