import React from 'react';
import { Sparkles, MessageCircleQuestion, Lightbulb, Music, CloudSun } from 'lucide-react';
import { LanguageMode } from '../types';

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  language: LanguageMode;
}

export const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelectPrompt, language }) => {
  const hindiPrompts = [
    { text: 'नमस्ते रीना! आप क्या-क्या कर सकती हैं?', icon: Sparkles, label: 'परिचय' },
    { text: 'कोई प्रेरणादायक विचार (सुविचार) सुनाइए', icon: Lightbulb, label: 'सुविचार' },
    { text: 'एक खूबसूरत हिन्दी शायरी सुनाइए', icon: Music, label: 'शायरी' },
    { text: 'आज का दिन productive बनाने के 3 तरीके बताइए', icon: MessageCircleQuestion, label: 'टिप्स' },
  ];

  const hinglishPrompts = [
    { text: 'Hey Rina! Aap kya-kya kar sakti ho?', icon: Sparkles, label: 'Intro' },
    { text: 'Ek badhiya funny joke sunao na!', icon: Lightbulb, label: 'Joke' },
    { text: 'Time management ke liye best tips batao', icon: MessageCircleQuestion, label: 'Tips' },
    { text: 'Healthy lifestyle ke basic rules kya hain?', icon: CloudSun, label: 'Health' },
  ];

  const englishPrompts = [
    { text: 'Hello Rina! How can you assist me today?', icon: Sparkles, label: 'Intro' },
    { text: 'Tell me an interesting fact about space', icon: Lightbulb, label: 'Trivia' },
    { text: 'Give me 3 quick tips to stay focused', icon: MessageCircleQuestion, label: 'Focus' },
    { text: 'What are the top daily habits for success?', icon: CloudSun, label: 'Habits' },
  ];

  const prompts =
    language === 'hi-IN'
      ? hindiPrompts
      : language === 'hinglish'
      ? hinglishPrompts
      : englishPrompts;

  return (
    <div className="py-2 px-1">
      <div className="flex items-center gap-1.5 mb-2 text-xs text-neutral-400 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-[#bb86fc]" />
        <span>सुझाव (Quick Suggestions)</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {prompts.map((p, idx) => {
          const Icon = p.icon;
          return (
            <button
              key={idx}
              id={`quick-prompt-${idx}`}
              type="button"
              onClick={() => onSelectPrompt(p.text)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#232323] hover:bg-[#2c2c2c] border border-white/5 hover:border-[#bb86fc]/40 text-left transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#bb86fc]/10 group-hover:bg-[#bb86fc]/20 text-[#bb86fc] flex items-center justify-center flex-shrink-0 transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-neutral-200 group-hover:text-white line-clamp-1">
                {p.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
