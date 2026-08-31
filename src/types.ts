export interface Message {
  id: string;
  sender: 'user' | 'rina';
  text: string;
  timestamp: string;
  isAudioPlaying?: boolean;
}

export type LanguageMode = 'hi-IN' | 'hinglish' | 'en-IN';

export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface VoiceSettings {
  autoSpeak: boolean;
  rate: number;
  pitch: number;
  selectedVoiceURI: string;
  language: LanguageMode;
}
