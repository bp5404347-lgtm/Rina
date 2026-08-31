import { LanguageMode } from '../types';

// Check Speech Recognition support
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

// Create Speech Recognition instance
export function createSpeechRecognizer(
  lang: LanguageMode,
  onResult: (transcript: string) => void,
  onError: (err: any) => void,
  onEnd: () => void
): any {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRec();

  // Choose appropriate language code for recognition
  recognition.lang = lang === 'en-IN' ? 'en-IN' : 'hi-IN';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    if (finalTranscript) {
      onResult(finalTranscript);
    }
  };

  recognition.onerror = (event: any) => {
    onError(event);
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}

// Get available synthesis voices
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

// Find best matching voice for Hindi/English
export function findBestVoice(voices: SpeechSynthesisVoice[], lang: LanguageMode): SpeechSynthesisVoice | undefined {
  if (lang === 'hi-IN' || lang === 'hinglish') {
    const hindiVoice = voices.find(
      (v) => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('lekha')
    );
    if (hindiVoice) return hindiVoice;
  }

  // Fallback to Indian English or any female/default voice
  const indianVoice = voices.find(
    (v) => v.lang.toLowerCase().includes('in') || v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('heera')
  );
  if (indianVoice) return indianVoice;

  // Fallback to any English voice
  return voices.find((v) => v.lang.toLowerCase().startsWith('en')) || voices[0];
}

// Speak text using SpeechSynthesis
export function speakText(
  text: string,
  options: {
    lang: LanguageMode;
    rate?: number;
    pitch?: number;
    voiceURI?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onEnd?.();
    return;
  }

  window.speechSynthesis.cancel(); // Stop any currently playing audio

  // Clean text from symbols that don't sound natural
  const cleanText = text
    .replace(/[#*_`~[\]()<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    options.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = options.lang === 'en-IN' ? 'en-IN' : 'hi-IN';
  utterance.rate = options.rate ?? 1.0;
  utterance.pitch = options.pitch ?? 1.0;

  const voices = getAvailableVoices();
  if (options.voiceURI) {
    const matched = voices.find((v) => v.voiceURI === options.voiceURI);
    if (matched) utterance.voice = matched;
  }
  
  if (!utterance.voice) {
    const best = findBestVoice(voices, options.lang);
    if (best) utterance.voice = best;
  }

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    // Interrupted errors can happen on stop/cancel, safe to ignore
    options.onError?.(e);
    options.onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

// Stop speaking
export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
