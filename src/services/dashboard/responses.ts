import { supabase } from '../../lib/supabase/client';

// Helper function to determine if a call was answered based on disposition and insight
function isCallAnswered(interaction: any) {
  if (interaction.interaction_disposition === 'call_made') {
    const meaningfulInteractions = [
      'success',
      'success_response',
      'call_followup_requested',
      'sms_followup_requested',
      'do_not_contact',
      'dnc_request',
      'unsubscribe_request',
      'not_interested'
    ];
    return meaningfulInteractions.includes(interaction.interaction_insight);
  }
  return false;
}

// Helper to count insights within a specific group
function countInsightsInGroup(calls: any[], insightGroup: string[]) {
  return calls.filter(call => insightGroup.includes(call.interaction_insight)).length;
}

export async function getResponseRates(campaignId: string) {
  const { data, error } = await supabase
    .from('interactions')
    .select(`
      *,
      campaign_contacts!inner(campaign_id)
    `)
    .eq('campaign_contacts.campaign_id', campaignId)
    .eq('communication_type', 'call')
    .eq('interaction_status', 'Completed')

  if (error) throw error;

  // Filter interactions by type and disposition
  const calls = data || [];
  const outboundCalls = calls.filter(i => i.type === 'outbound');
  const inboundCalls = calls.filter(i => i.type === 'inbound');
  
  // Get answered calls using the helper function
  const answeredCalls = calls.filter(isCallAnswered);

  // Calculate metrics
  const total = calls.length;
  const answered = answeredCalls.length;
  const responseRate = total > 0 ? Math.round((answered / total) * 100) : 0;

  return {
    call_response_rate: responseRate,
    total_calls: total,
    calls_answered: answered,
    outbound_calls: outboundCalls.length,
    inbound_calls: inboundCalls.length,
    // Keep call_outcomes for insight distribution
    call_outcomes: {
      outbound_made: {
        success_response: countInsightsInGroup(outboundCalls, ['success_response']),
        dnc_request: countInsightsInGroup(outboundCalls, ['dnc_request']),
        unsubscribe_request: countInsightsInGroup(outboundCalls, ['unsubscribe_request']),
        not_interested: countInsightsInGroup(outboundCalls, ['not_interested']),
        call_followup_requested: countInsightsInGroup(outboundCalls, ['call_followup_requested']),
        sms_followup_requested: countInsightsInGroup(outboundCalls, ['sms_followup_requested']),
        voicemail_left: countInsightsInGroup(outboundCalls, ['voicemail_left', 'voicemail_box_full']),
        voicemail_box_full: countInsightsInGroup(outboundCalls, ['voicemail_box_full'])
      },
      outbound_attempted: {
        network_error: countInsightsInGroup(outboundCalls, ['network_error']),
        invalid_number: countInsightsInGroup(outboundCalls, ['invalid_number']),
        line_busy: countInsightsInGroup(outboundCalls, ['line_busy']),
        unreachable: countInsightsInGroup(outboundCalls, ['unreachable']),
        hangup: countInsightsInGroup(outboundCalls, ['hangup']),
      },
      inbound: {
        success_response: countInsightsInGroup(inboundCalls, ['success_response']),
        dnc_request: countInsightsInGroup(inboundCalls, ['dnc_request']),
        unsubscribe_request: countInsightsInGroup(inboundCalls, ['unsubscribe_request']),
        not_interested: countInsightsInGroup(inboundCalls, ['not_interested']),
        call_followup_requested: countInsightsInGroup(inboundCalls, ['call_followup_requested']),
        sms_followup_requested: countInsightsInGroup(inboundCalls, ['sms_followup_requested']),
      },
      inbound_failed: {
        network_error: countInsightsInGroup(inboundCalls, ['network_error']),
        invalid_number: countInsightsInGroup(inboundCalls, ['invalid_number']),
        no_answer: countInsightsInGroup(inboundCalls, ['no_answer', 'line_busy', 'unreachable'])
      }
    }
  };
}