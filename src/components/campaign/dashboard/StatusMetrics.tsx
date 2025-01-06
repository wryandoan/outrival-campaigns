import React from 'react';
import { useStatusMetrics } from '../../../hooks/useStatusMetrics';
import { Loader2, Users, Clock, CheckCircle, AlertTriangle, PhoneCall, CalendarClock } from 'lucide-react';

interface StatusMetricsProps {
  campaignId: string;
}

interface MetricCardProps {
  label: string;
  value?: number;
  icon: React.ElementType;
  className?: string;
}

function MetricCard({ label, value = 0, icon: Icon, className = '' }: MetricCardProps) {
  return (
    <div className={`bg-white dark:bg-dark-50 rounded-lg p-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-3 mb-1">
        <Icon className="w-5 h-5 text-gray-400 dark:text-dark-400" />
        <h3 className="text-sm font-medium text-gray-500 dark:text-dark-400">
          {label}
        </h3>
      </div>
      <p className="text-2xl font-semibold text-gray-900 dark:text-dark-600">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

export function StatusMetrics({ campaignId }: StatusMetricsProps) {
  const { metrics, loading, error } = useStatusMetrics(campaignId);

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  const defaultMetrics = {
    total_contacts: 0,
    awaiting_contact: 0,
    in_progress: 0,
    awaiting_reattempt: 0,
    awaiting_followup: 0,
    completed: 0
  };

  // Merge default metrics with actual metrics to handle undefined values
  const safeMetrics = { ...defaultMetrics, ...metrics };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <MetricCard
        label="Total Contacts"
        value={safeMetrics.total_contacts}
        icon={Users}
      />
      <MetricCard
        label="Awaiting Contact"
        value={safeMetrics.awaiting_contact}
        icon={Clock}
      />
      <MetricCard
        label="In Progress"
        value={safeMetrics.in_progress}
        icon={PhoneCall}
      />
      <MetricCard
        label="Awaiting Reattempt"
        value={safeMetrics.awaiting_reattempt}
        icon={AlertTriangle}
      />
      <MetricCard
        label="Awaiting Follow-up"
        value={safeMetrics.awaiting_followup}
        icon={CalendarClock}
      />
      <MetricCard
        label="Completed"
        value={safeMetrics.completed}
        icon={CheckCircle}
      />
    </div>
  );
}