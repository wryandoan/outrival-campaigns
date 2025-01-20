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
  const { user: authUser, loading: authLoading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!authUser) {
        // Clear states when user is not authenticated
        setCampaigns([]);
        setActiveCampaign(null);
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      loadInitialData();
    }
  }, [authUser, authLoading]);

  async function loadInitialData() {
    try {
      setLoading(true);
      const [user, campaignsList] = await Promise.all([
        getCurrentUser(),
        getCampaigns()
      ]);
      setCurrentUser(user);
      setCampaigns(campaignsList);
      // Set first campaign as active if available
      if (campaignsList.length > 0 && !activeCampaign) {
        setActiveCampaign(campaignsList[0]);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const handleNewCampaign = () => {
    setActiveCampaign(null);
    setError(null);
  };

  const handleCampaignSubmit = async (data: { name: string; goal: string }) => {
    try {
      const newCampaign = await createCampaign(data);
      setCampaigns(prevCampaigns => [newCampaign, ...prevCampaigns]);
      setActiveCampaign(newCampaign);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    }
  };

  const handleSelectCampaign = (campaign: Campaign) => {
    setActiveCampaign(campaign);
    setError(null);
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-dark-50">
        <p className="text-gray-600 dark:text-dark-400">Loading...</p>
      </div>
    );
  }

  // Show auth form if no user
  if (!authUser) {
    return <AuthForm />;
  }

  // Show loading state while initial data is being fetched
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-dark-50">
        <p className="text-gray-600 dark:text-dark-400">Loading your data...</p>
      </div>
    );
  }

  // Show error state if initial data load failed
  if (error && !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-dark-50">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-dark-100 hover:bg-dark-200 text-dark-600 rounded-lg"
          >
            Retry
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