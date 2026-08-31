import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Sparkles } from 'lucide-react';
import { AssistantState } from '../types';

interface InputAreaProps {
  onSendMessage: (text: string) => void;
  onToggleVoice: () => void;
  state: AssistantState;
  listeningTranscript: string;
}

export const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  onToggleVoice,
  state,
  listeningTranscript,
}) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // If transcript comes from voice recognition, update input text
  useEffect(() => {
    if (listeningTranscript) {
      setInputText(listeningTranscript);
    }
  }, [listeningTranscript]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || state === 'thinking') return;
    onSendMessage(trimmed);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isListening = state === 'listening';

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      {/* Listening Status Bar if recording */}
      {isListening && (
        <div className="mb-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>सुन रही हूँ... (Listening)</span>
          </div>
          <span className="text-[11px] text-rose-400">बोलना समाप्त होने पर अपने आप भेजा जाएगा</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Main Text Input */}
        <div className="relative flex-1">
          <input
            id="userInput"
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'आपकी आवाज़ सुनी जा रही है...' : 'कुछ पूछिए... (Ask Rina anything)'}
            disabled={state === 'thinking'}
            className="w-full px-4 py-3.5 rounded-xl bg-[#2a2a2a] border border-white/10 text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-[#bb86fc] focus:ring-2 focus:ring-[#bb86fc]/20 transition-all disabled:opacity-50"
          />
          {inputText && (
            <button
              type="button"
              onClick={() => setInputText('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white px-1.5 py-0.5 rounded"
            >
              ✕
            </button>
          )}
        </div>

        {/* Mic / Voice Button */}
        <button
          id="btn-voice-mic"
          type="button"
          onClick={onToggleVoice}
          title={isListening ? 'माइक बंद करें' : 'माइक से बोलें'}
          className={`p-3.5 rounded-xl font-bold flex items-center justify-center transition-all ${
            isListening
              ? 'bg-[#cf6679] text-white shadow-lg shadow-[#cf6679]/40 scale-105 animate-pulse'
              : 'bg-[#cf6679] hover:bg-[#e07588] text-white hover:scale-105 active:scale-95'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Send Button */}
        <button
          id="btn-send-message"
          type="submit"
          disabled={!inputText.trim() || state === 'thinking'}
          className="px-4 py-3.5 rounded-xl bg-[#bb86fc] hover:bg-[#c898ff] active:scale-95 text-neutral-950 font-bold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md shadow-[#bb86fc]/20"
        >
          <span className="hidden sm:inline text-sm">भेजें</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
