import { supabase } from '../../lib/supabase/client';

export interface LogEntry {
  line: number;
  level: string;
  message: string;
  timestamp: string;
  component: string;
  function: string;
  extra: Record<string, any>;
}

export async function getInteractionLogs(interactionId: string): Promise<LogEntry[]> {
  const { data, error } = await supabase
    .from('interactions')
    .select(`
      logs,
      transfer_logs
    `)
    .eq('interaction_id', interactionId)
    .single();

  if (error) throw error;
  return data?.logs || [];
}