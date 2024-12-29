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

  useEffect(() => {
    if (authUser) {
      loadInitialData();
    }
  }, [authUser]);

  async function loadInitialData() {
    try {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
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

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-dark-50">
        <p className="text-gray-600 dark:text-dark-400">Loading...</p>
      </div>
    );
  }

  if (!authUser) {
    return <AuthForm />;
  }

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-dark-50">
        <p className="text-gray-600 dark:text-dark-400">Setting up your account...</p>
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