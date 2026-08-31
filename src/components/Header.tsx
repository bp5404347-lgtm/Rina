import React from 'react';
import { Volume2, VolumeX, Settings, Trash2, Sparkles, Mic } from 'lucide-react';
import { AssistantState, LanguageMode } from '../types';

interface HeaderProps {
  state: AssistantState;
  language: LanguageMode;
  onLanguageChange: (lang: LanguageMode) => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  onOpenSettings: () => void;
  onClearChat: () => void;
  messageCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  language,
  onLanguageChange,
  autoSpeak,
  onToggleAutoSpeak,
  onOpenSettings,
  onClearChat,
  messageCount,
}) => {
  const getStatusDisplay = () => {
    switch (state) {
      case 'listening':
        return {
          text: 'सुन रही हूँ...',
          subText: 'Listening',
          badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
          dotClass: 'bg-rose-500 animate-ping',
        };
      case 'thinking':
        return {
          text: 'सोच रही हूँ...',
          subText: 'Thinking',
          badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse',
          dotClass: 'bg-purple-400 animate-bounce',
        };
      case 'speaking':
        return {
          text: 'बोल रही हूँ...',
          subText: 'Speaking',
          badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40 animate-pulse',
          dotClass: 'bg-teal-400 animate-ping',
        };
      default:
        return {
          text: 'ऑनलाइन',
          subText: 'Ready',
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dotClass: 'bg-emerald-500',
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <header className="px-4 py-3.5 border-b border-white/10 bg-[#1e1e1e]/90 backdrop-blur-md sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3">
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#bb86fc] via-[#985eff] to-[#03dac6] flex items-center justify-center shadow-lg shadow-[#bb86fc]/20">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#1e1e1e] ${status.dotClass}`}
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              रीना AI <span className="text-xs px-1.5 py-0.5 font-medium rounded bg-[#bb86fc]/20 text-[#bb86fc]">Voice</span>
            </h1>
          </div>
          <p className="text-xs text-neutral-400 flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[11px] font-medium border ${status.badgeClass}`}>
              {status.text}
            </span>
          </p>
        </div>
      </div>

      {/* Controls & Mode switches */}
      <div className="flex items-center gap-2">
        {/* Language selector */}
        <div className="flex items-center bg-[#2a2a2a] p-0.5 rounded-xl border border-white/10 text-xs font-medium">
          <button
            id="btn-lang-hi"
            type="button"
            onClick={() => onLanguageChange('hi-IN')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'hi-IN'
                ? 'bg-[#bb86fc] text-black font-semibold shadow-sm'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            हिन्दी
          </button>
          <button
            id="btn-lang-hinglish"
            type="button"
            onClick={() => onLanguageChange('hinglish')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'hinglish'
                ? 'bg-[#bb86fc] text-black font-semibold shadow-sm'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            Hinglish
          </button>
          <button
            id="btn-lang-en"
            type="button"
            onClick={() => onLanguageChange('en-IN')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'en-IN'
                ? 'bg-[#bb86fc] text-black font-semibold shadow-sm'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            Eng
          </button>
        </div>

        {/* Auto-speak audio toggle */}
        <button
          id="btn-toggle-autospeak"
          type="button"
          onClick={onToggleAutoSpeak}
          title={autoSpeak ? 'आवाज़ चालू है (Auto-voice ON)' : 'आवाज़ बंद है (Muted)'}
          className={`p-2 rounded-xl border transition-all ${
            autoSpeak
              ? 'bg-[#03dac6]/20 border-[#03dac6]/40 text-[#03dac6] hover:bg-[#03dac6]/30'
              : 'bg-[#2a2a2a] border-white/10 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Settings button */}
        <button
          id="btn-open-settings"
          type="button"
          onClick={onOpenSettings}
          title="Voice Settings"
          className="p-2 rounded-xl bg-[#2a2a2a] border border-white/10 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Clear chat history */}
        {messageCount > 0 && (
          <button
            id="btn-clear-chat"
            type="button"
            onClick={onClearChat}
            title="चैट साफ़ करें (Clear Chat)"
            className="p-2 rounded-xl bg-[#2a2a2a] border border-white/10 text-neutral-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
