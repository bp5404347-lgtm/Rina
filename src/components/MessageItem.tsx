import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, User, Sparkles } from 'lucide-react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  isPlaying: boolean;
  onPlayAudio: (text: string, msgId: string) => void;
  onStopAudio: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isPlaying,
  onPlayAudio,
  onStopAudio,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id={`msg-${message.id}`}
      className={`flex items-start gap-2.5 my-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-200`}
    >
      {/* Rina Avatar (Left) */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#bb86fc] to-[#03dac6] flex-shrink-0 flex items-center justify-center shadow-md">
          <Sparkles className="w-4 h-4 text-black" />
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`max-w-[84%] sm:max-w-[78%] rounded-2xl p-3.5 shadow-md ${
          isUser
            ? 'bg-[#bb86fc] text-neutral-950 font-medium rounded-tr-sm ml-auto'
            : 'bg-[#252525] text-neutral-100 border-l-4 border-[#03dac6] rounded-tl-sm border border-white/5'
        }`}
      >
        {/* Header inside bubble */}
        <div className="flex items-center justify-between gap-4 mb-1">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${
              isUser ? 'text-purple-950/70' : 'text-[#03dac6]'
            }`}
          >
            {isUser ? 'आप (You)' : 'रीना (Rina AI)'}
          </span>
          <span
            className={`text-[10px] ${
              isUser ? 'text-purple-950/60' : 'text-neutral-500'
            }`}
          >
            {message.timestamp}
          </span>
        </div>

        {/* Message Content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap select-text break-words">
          {message.text}
        </p>

        {/* Action Toolbar */}
        <div
          className={`flex items-center justify-end gap-1.5 mt-2 pt-1 border-t ${
            isUser ? 'border-purple-950/10' : 'border-white/5'
          }`}
        >
          {/* Audio Playback for Rina */}
          {!isUser && (
            <button
              type="button"
              onClick={() => (isPlaying ? onStopAudio() : onPlayAudio(message.text, message.id))}
              title={isPlaying ? 'आवाज़ रोकें' : 'बोलकर सुनाएं'}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                isPlaying
                  ? 'bg-[#03dac6]/20 text-[#03dac6] font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{isPlaying ? 'रोकें' : 'सुनाएं'}</span>
            </button>
          )}

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="कॉपी करें"
            className={`p-1.5 rounded-lg text-xs transition-all ${
              isUser
                ? 'text-purple-950/70 hover:text-purple-950 hover:bg-purple-950/10'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* User Avatar (Right) */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-white/10 flex-shrink-0 flex items-center justify-center text-neutral-300">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
