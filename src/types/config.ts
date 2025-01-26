export interface BotConfig {
  answer_delay: number;
  allow_interruptions: boolean;
}

export interface LLMParams {
  top_p: number;
  max_tokens: number;
  temperature: number;
  presence_penalty: number;
  frequency_penalty: number;
}

export interface LLMConfig {
  model: string;
  params: LLMParams;
}

export interface TTSParams {
  style: number;
  language: string;
  stability: number;
  similarity_boost: number;
  use_speaker_boost: boolean;
}

export interface TTSConfig {
  model: string;
  params: TTSParams;
  voice_id: string;
  output_format: string;
}

export interface VADConfig {
  stop_secs: number;
  confidence: number;
  min_volume: number;
  start_secs: number;
}

export interface HangupConfig {
  call_timeout: number;
  hangup_delay: number;
}

export interface ReattemptConfig {
  by_outcome: {
    hangup: number;
    line_busy: number;
    voicemail_left: number;
    voicemail_box_full: number;
  };
}

export interface ActionDetectionConfig {
  hangup_phrases: string[];
  transfer_phrases: string[];
  similarity_threshold: number;
}

export interface InsightsConfig {
  insights: string[];
}

export interface ScriptStep {
  step: string;
  content: string;
}

export interface Scripts {
  inbound: ScriptStep[];
  outbound: ScriptStep[];
  voicemail: ScriptStep[];
}

export interface CampaignConfiguration {
  bot: BotConfig;
  llm: LLMConfig;
  tts: TTSConfig;
  vad: VADConfig;
  hangup: HangupConfig;
  scripts: Scripts;
  insights: InsightsConfig;
  reattempt: ReattemptConfig;
  action_detection: ActionDetectionConfig;
}