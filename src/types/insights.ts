export type CallInsights = {
  success_response?: number;
  voicemail_left?: number;
  voicemail_box_full?: number;
  line_busy?: number;
  call_followup_requested?: number;
  sms_followup_requested?: number;
  dnc_request?: number;
  unsubscribe_request?: number;
  not_interested?: number;
  invalid_number?: number;
  unreachable?: number;
  network_error?: number;
};