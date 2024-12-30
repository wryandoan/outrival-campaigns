export interface Interaction {
  interaction_id: string;
  campaign_contact_id: string;
  communication_type: 'call' | 'sms' | 'email';
  interaction_status: 'Completed' | 'Pending' | 'Failed';
  interaction_disposition?: 'call_attempted' | 'call_answered' | 'call_failed' | 'call_voicemail' | 'call_received' | 'sms_sent' | 'sms_failed' | 'sms_received';
  interaction_insight?: string;
  sent_date_time: string;
  response_date_time?: string;
  response_channel?: 'call' | 'sms';
  content?: string;
  notes?: string;
  phone_number: string;
  type: 'inbound' | 'outbound';
}