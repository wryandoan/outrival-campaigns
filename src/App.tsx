import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { CampaignForm } from './components/CampaignForm';
import { CampaignDetails } from './components/campaign/CampaignDetails';
import { AuthForm } from './components/auth/AuthForm';
import { useAuth } from './lib/supabase/auth';
import { createCampaign, getCampaigns } from './services/campaigns';
import { getCurrentUser } from './services/users';
import type { Campaign } from './types';

export function App() {
  const { user: authUser, loading: authLoading, initialized, signOut } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Only load data after auth is fully initialized
  useEffect(() => {
    async function loadInitialData() {
      console.log('[App] Loading initial data...');
      try {
        setLoading(true);
        const [user, campaignsList] = await Promise.all([
          getCurrentUser(),
          getCampaigns()
        ]);
        console.log('[App] Initial data loaded:', {
          user: user?.id,
          campaignsCount: campaignsList.length
        });
        setCurrentUser(user);
        setCampaigns(campaignsList);
        // Set first campaign as active if available
        if (campaignsList.length > 0 && !activeCampaign) {
          console.log('[App] Setting initial active campaign:', campaignsList[0].campaign_id);
          setActiveCampaign(campaignsList[0]);
        }
        setError(null);
      } catch (err) {
        console.error('[App] Error loading initial data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    // Only attempt to load data if auth is initialized and user is logged in
    if (initialized) {
      console.log('[App] Auth state ready:', { isAuthenticated: !!authUser });
      if (!authUser) {
        // Clear states when user is not authenticated
        console.log('[App] No authenticated user, clearing state');
        setCampaigns([]);
        setActiveCampaign(null);
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      loadInitialData();
    }
  }, [authUser, initialized]);

  const handleNewCampaign = () => {
    console.log('[App] Starting new campaign flow');
    setActiveCampaign(null);
    setError(null);
  };

  const handleCampaignSubmit = async (data: { name: string; goal: string }) => {
    console.log('[App] Submitting new campaign:', { name: data.name });
    try {
      const newCampaign = await createCampaign(data);
      console.log('[App] Campaign created:', newCampaign.campaign_id);
      setCampaigns(prevCampaigns => [newCampaign, ...prevCampaigns]);
      setActiveCampaign(newCampaign);
      setError(null);
    } catch (err) {
      console.error('[App] Error creating campaign:', err);
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    }
  };

  const handleSelectCampaign = (campaign: Campaign) => {
    console.log('[App] Selecting campaign:', campaign.campaign_id);
    setActiveCampaign(campaign);
    setError(null);
  };

  const handleSignInClick = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('[App] Error signing out:', err);
      // Force redirect even if sign out fails
      window.location.href = '/';
    }
  };

  // Show loading state while auth is being checked
  if (!initialized || authLoading) {
    console.log('[App] Waiting for auth initialization...');
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-dark-50">
        <p className="text-gray-600 dark:text-dark-600">Loading...</p>
      </div>
    );
  }

  // Show auth form if no user
  if (!authUser) {
    console.log('[App] Showing auth form');
    return <AuthForm />;
  }

  // Show loading state while initial data is being fetched
  if (loading) {
    console.log('[App] Loading app data...');
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-dark-50">
        <p className="text-gray-600 dark:text-dark-600">Loading your data...</p>
      </div>
    );
  }

  // Show error state if initial data load failed
  if (error && !currentUser) {
    console.error('[App] Error state:', error);
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-dark-50">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={handleSignInClick}
            className="px-6 py-2 bg-dark-100 hover:bg-dark-200 text-dark-600 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-dark-50">
      <Sidebar
        campaigns={campaigns}
        activeCampaign={activeCampaign}
        onSelectCampaign={handleSelectCampaign}
        onNewCampaign={handleNewCampaign}
      />
      
      <main className="flex-1 overflow-y-auto">
        {!activeCampaign ? (
          <CampaignForm onSubmit={handleCampaignSubmit} error={error} />
        ) : (
          <CampaignDetails campaign={activeCampaign} />
        )}
      </main>
    </div>
  );
}