import React from 'react';
import { Loader2 } from 'lucide-react';
import { useInsightDistribution } from '../../../hooks/useInsightDistribution';
import { getInsightConfig } from '../../../utils/insights';

interface InsightDistributionProps {
  campaignId: string;
}

const InsightBar = ({ label, count, total, colorClass }: { 
  label: string; 
  count: number; 
  total: number;
  colorClass: string;
}) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-dark-600">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 dark:text-dark-400">{count}</span>
          <span className="text-xs text-gray-400 dark:text-dark-500">
            ({percentage.toFixed(1)}%)
          </span>
        </div>
      </div>
      <div className="w-full bg-gray-100 dark:bg-dark-200 rounded-full h-2">
        <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const InsightGroup = ({ title, outcomes, total }: {
  title: string;
  outcomes: Record<string, number>;
  total: number;
}) => (
  <div className="space-y-4 dark:bg-dark-100 p-4 rounded-lg">
    <h4 className="text-sm font-semibold text-gray-900 dark:text-dark-600">{title}</h4>
    <div className="space-y-3">
      {Object.entries(outcomes).map(([key, value]) => {
        const config = getInsightConfig(key);
        return (
          <InsightBar
            key={key}
            label={config.label}
            count={value}
            total={total}
            colorClass={config.color}
          />
        );
      })}
    </div>
  </div>
);

export function InsightDistribution({ campaignId }: InsightDistributionProps) {
  const { insights, loading, error } = useInsightDistribution(campaignId);

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-dark-400" />
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

  if (!insights) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-dark-400">
        No insights available
      </div>
    );
  }

  // Combine regular and failed outcomes for each type
  const outboundOutcomes = {
    ...insights.call_outcomes.outbound_made,
    ...insights.call_outcomes.outbound_attempted
  };

  const inboundOutcomes = {
    ...insights.call_outcomes.inbound,
    ...insights.call_outcomes.inbound_failed
  };

  // Calculate totals for each group
  const outboundTotal = Object.values(outboundOutcomes).reduce((sum, count) => sum + count, 0);
  const inboundTotal = Object.values(inboundOutcomes).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white dark:bg-dark-50 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-600 mb-6">
        Call Insights
      </h3>
      
      <div className="space-y-8">
        <InsightGroup
          title="Outbound Calls"
          outcomes={outboundOutcomes}
          total={outboundTotal}
        />

        <InsightGroup
          title="Inbound Calls"
          outcomes={inboundOutcomes}
          total={inboundTotal}
        />
      </div>
    </div>
  );
}