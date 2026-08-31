import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatBox } from './components/ChatBox';
import { InputArea } from './components/InputArea';
import { VoiceVisualizer } from './components/VoiceVisualizer';
import { SettingsModal } from './components/SettingsModal';
import { Message, LanguageMode, AssistantState, VoiceSettings } from './types';
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  speakText,
  stopSpeaking,
} from './utils/audio';

const STORAGE_KEY = 'rina_ai_chat_history_v1';
const SETTINGS_KEY = 'rina_ai_voice_settings_v1';

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load chat history', e);
    }
    return [];
  });

  const [language, setLanguage] = useState<LanguageMode>('hi-IN');
  const [state, setState] = useState<AssistantState>('idle');
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [listeningTranscript, setListeningTranscript] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  const [settings, setSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    return {
      autoSpeak: true,
      rate: 1.0,
      pitch: 1.0,
      selectedVoiceURI: '',
      language: 'hi-IN',
    };
  });

  const recognitionRef = useRef<any>(null);

  // Save messages to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat', e);
    }
  }, [messages]);

  // Save settings to local storage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [settings]);

  // Format time in 12h format
  const getFormattedTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Speak text with current settings
  const handlePlayAudio = useCallback(
    (text: string, msgId: string) => {
      stopSpeaking();
      setState('speaking');
      setPlayingMessageId(msgId);

      speakText(text, {
        lang: language,
        rate: settings.rate,
        pitch: settings.pitch,
        voiceURI: settings.selectedVoiceURI,
        onStart: () => {
          setState('speaking');
          setPlayingMessageId(msgId);
        },
        onEnd: () => {
          setState('idle');
          setPlayingMessageId(null);
        },
        onError: () => {
          setState('idle');
          setPlayingMessageId(null);
        },
      });
    },
    [language, settings]
  );

  const handleStopAudio = useCallback(() => {
    stopSpeaking();
    setState('idle');
    setPlayingMessageId(null);
  }, []);

  // Send message to Gemini server endpoint
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Stop speaking if playing
    handleStopAudio();

    // Create user message
    const userMsg: Message = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: getFormattedTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setState('thinking');
    setListeningTranscript('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          language,
          history: messages.slice(-6),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error: ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || 'माफ़ कीजिए, कोई उत्तर प्राप्त नहीं हुआ।';

      const rinaMsgId = 'rina_' + Date.now();
      const rinaMsg: Message = {
        id: rinaMsgId,
        sender: 'rina',
        text: replyText,
        timestamp: getFormattedTime(),
      };

      setMessages((prev) => [...prev, rinaMsg]);
      setState('idle');

      // Auto-speak if enabled
      if (settings.autoSpeak) {
        handlePlayAudio(replyText, rinaMsgId);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setState('idle');

      const errorMsg: Message = {
        id: 'err_' + Date.now(),
        sender: 'rina',
        text: 'माफ़ कीजिए, सर्वर से संपर्क नहीं हो पाया। कृपया नेटवर्क जांचें और दोबारा प्रयास करें।',
        timestamp: getFormattedTime(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Stop voice recognition
  const handleStopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Recognition stop error', e);
      }
      recognitionRef.current = null;
    }
    setState('idle');
  }, []);

  // Start voice recognition
  const handleStartVoice = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      setAlertBanner('आपके ब्राउज़र में Web Speech Recognition समर्थित नहीं है। Chrome या Edge का उपयोग करें।');
      setTimeout(() => setAlertBanner(null), 5000);
      return;
    }

    // Stop speaking if currently playing
    handleStopAudio();

    // If already listening, stop
    if (state === 'listening') {
      handleStopListening();
      return;
    }

    try {
      const recognizer = createSpeechRecognizer(
        language,
        (transcript: string) => {
          setListeningTranscript(transcript);
        },
        (error: any) => {
          console.warn('Speech recognition error:', error);
          if (error.error === 'not-allowed') {
            setAlertBanner('माइक्रोफ़ोन की अनुमति नहीं दी गई। कृपया ब्राउज़र में Mic अनुमति सक्षम करें।');
            setTimeout(() => setAlertBanner(null), 5000);
          }
          handleStopListening();
        },
        () => {
          setState('idle');
          // If transcript captured, automatically send
          setListeningTranscript((finalText) => {
            if (finalText.trim()) {
              handleSendMessage(finalText);
            }
            return '';
          });
        }
      );

      if (recognizer) {
        recognitionRef.current = recognizer;
        recognizer.start();
        setState('listening');
        setListeningTranscript('');
      }
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setState('idle');
    }
  }, [language, state, handleStopAudio, handleStopListening]);

  const handleClearChat = () => {
    handleStopAudio();
    handleStopListening();
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleToggleAutoSpeak = () => {
    setSettings((prev) => ({ ...prev, autoSpeak: !prev.autoSpeak }));
  };

  const handleUpdateSettings = (newSettings: Partial<VoiceSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-2 sm:p-4">
      {/* Central Card Container */}
      <div className="w-full max-w-2xl h-[94vh] max-h-[900px] bg-[#1e1e1e] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <Header
          state={state}
          language={language}
          onLanguageChange={(newLang) => {
            setLanguage(newLang);
            handleStopAudio();
          }}
          autoSpeak={settings.autoSpeak}
          onToggleAutoSpeak={handleToggleAutoSpeak}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onClearChat={handleClearChat}
          messageCount={messages.length}
        />

        {/* Optional Alert Banner */}
        {alertBanner && (
          <div className="mx-4 mt-2 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between animate-in fade-in duration-200">
            <span>{alertBanner}</span>
            <button
              type="button"
              onClick={() => setAlertBanner(null)}
              className="text-amber-300 font-bold ml-2 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Chat History Box */}
        <div className="flex-1 overflow-hidden p-3 flex flex-col">
          <ChatBox
            messages={messages}
            state={state}
            playingMessageId={playingMessageId}
            onPlayAudio={handlePlayAudio}
            onStopAudio={handleStopAudio}
            onSelectPrompt={(prompt) => handleSendMessage(prompt)}
            language={language}
            onStartVoice={handleStartVoice}
          />
        </div>

        {/* Dynamic Voice Visualizer Bar (when listening or speaking) */}
        <VoiceVisualizer
          state={state}
          onStopSpeaking={handleStopAudio}
          onStopListening={handleStopListening}
        />

        {/* Bottom Input Area */}
        <div className="p-3 pt-0 bg-[#1e1e1e]">
          <InputArea
            onSendMessage={handleSendMessage}
            onToggleVoice={handleStartVoice}
            state={state}
            listeningTranscript={listeningTranscript}
          />
        </div>
      </div>

      {/* Voice Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}
