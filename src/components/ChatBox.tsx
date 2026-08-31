import React, { useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import { QuickPrompts } from './QuickPrompts';
import { Message, LanguageMode, AssistantState } from '../types';
import { Sparkles, Bot, Mic } from 'lucide-react';

interface ChatBoxProps {
  messages: Message[];
  state: AssistantState;
  playingMessageId: string | null;
  onPlayAudio: (text: string, msgId: string) => void;
  onStopAudio: () => void;
  onSelectPrompt: (prompt: string) => void;
  language: LanguageMode;
  onStartVoice: () => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  state,
  playingMessageId,
  onPlayAudio,
  onStopAudio,
  onSelectPrompt,
  language,
  onStartVoice,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, state]);

  return (
    <div
      id="chat-box"
      className="flex-1 overflow-y-auto px-4 py-3 space-y-2 rounded-2xl bg-black/20 border border-white/5 scrollbar-thin scrollbar-thumb-white/10"
    >
      {messages.length === 0 ? (
        <div className="h-full flex flex-col justify-center items-center text-center py-6 px-4">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#bb86fc] via-[#985eff] to-[#03dac6] flex items-center justify-center shadow-xl shadow-[#bb86fc]/20 animate-pulse">
              <Bot className="w-8 h-8 text-black" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#232323] border border-white/10 flex items-center justify-center text-[#03dac6]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">
            नमस्ते! मैं रीना हूँ
          </h2>
          <p className="text-sm text-neutral-300 max-w-sm mb-5 leading-relaxed">
            आपकी व्यक्तिगत हिन्दी एवं हिंग्लिश AI वॉयस असिस्टेंट। नीचे माइक बटन दबाकर बोलें या लिखकर पूछें।
          </p>

          {/* Large Voice Action Button */}
          <button
            type="button"
            onClick={onStartVoice}
            className="mb-6 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#bb86fc] to-[#a855f7] hover:from-[#c084fc] hover:to-[#9333ea] text-black font-bold flex items-center gap-2 shadow-lg shadow-[#bb86fc]/25 transition-all hover:scale-105 active:scale-95"
          >
            <Mic className="w-5 h-5" />
            <span>माइक से बोलें (Tap to Speak)</span>
          </button>

          {/* Quick Prompts */}
          <div className="w-full max-w-md">
            <QuickPrompts onSelectPrompt={onSelectPrompt} language={language} />
          </div>
        </div>
      ) : (
        <div>
          {messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              isPlaying={playingMessageId === msg.id}
              onPlayAudio={onPlayAudio}
              onStopAudio={onStopAudio}
            />
          ))}

          {/* Thinking indicator bubble */}
          {state === 'thinking' && (
            <div className="flex items-start gap-2.5 my-3 animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#bb86fc] to-[#03dac6] flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-black animate-spin" />
              </div>
              <div className="rounded-2xl rounded-tl-sm p-3.5 bg-[#252525] border-l-4 border-[#03dac6] border border-white/5 flex items-center gap-2 text-neutral-300 text-xs">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#03dac6] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#03dac6] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#03dac6] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>रीना उत्तर सोच रही है...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};
