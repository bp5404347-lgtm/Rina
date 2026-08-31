import React from 'react';
import { AssistantState } from '../types';
import { Mic, Volume2, Sparkles, Loader2 } from 'lucide-react';

interface VoiceVisualizerProps {
  state: AssistantState;
  onStopSpeaking?: () => void;
  onStopListening?: () => void;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  state,
  onStopSpeaking,
  onStopListening,
}) => {
  if (state === 'idle') return null;

  return (
    <div className="mx-4 mb-2 p-3 rounded-2xl bg-[#232323] border border-white/10 shadow-lg flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Icon & Label */}
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            state === 'listening'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
              : state === 'speaking'
              ? 'bg-[#03dac6]/20 text-[#03dac6] border border-[#03dac6]/30 animate-pulse'
              : 'bg-[#bb86fc]/20 text-[#bb86fc] border border-[#bb86fc]/30'
          }`}
        >
          {state === 'listening' && <Mic className="w-5 h-5 animate-bounce" />}
          {state === 'speaking' && <Volume2 className="w-5 h-5 animate-pulse" />}
          {state === 'thinking' && <Loader2 className="w-5 h-5 animate-spin" />}
        </div>

        <div>
          <h4 className="text-xs font-semibold text-white">
            {state === 'listening' && 'आपकी आवाज़ सुन रही हूँ...'}
            {state === 'speaking' && 'रीना बोल रही है...'}
            {state === 'thinking' && 'उत्तर तैयार कर रही हूँ...'}
          </h4>
          <p className="text-[11px] text-neutral-400">
            {state === 'listening' && 'कुछ भी बोलिए, मैं समझ रही हूँ'}
            {state === 'speaking' && 'सुनने के लिए तैयार रहें या रोकें'}
            {state === 'thinking' && 'Gemini 3.7 Flash द्वारा संचालित'}
          </p>
        </div>
      </div>

      {/* Dynamic Animated Waveform Bars */}
      <div className="flex items-center gap-1 h-6">
        {[40, 75, 100, 60, 90, 45, 80, 55, 95, 50].map((heightPct, idx) => {
          const isAnimated = state === 'listening' || state === 'speaking';
          const barColor =
            state === 'listening'
              ? 'bg-rose-400'
              : state === 'speaking'
              ? 'bg-[#03dac6]'
              : 'bg-[#bb86fc]';
          return (
            <div
              key={idx}
              className={`w-1 rounded-full ${barColor} transition-all duration-150`}
              style={{
                height: isAnimated ? `${Math.max(20, (heightPct * (idx % 3 + 1)) % 100)}%` : '20%',
                animation: isAnimated
                  ? `pulse 0.8s ease-in-out infinite ${(idx * 0.08).toFixed(2)}s`
                  : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Stop Action */}
      {state === 'speaking' && onStopSpeaking && (
        <button
          type="button"
          onClick={onStopSpeaking}
          className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-medium transition-all"
        >
          आवाज़ रोकें (Stop)
        </button>
      )}

      {state === 'listening' && onStopListening && (
        <button
          type="button"
          onClick={onStopListening}
          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-white/10 text-xs font-medium transition-all"
        >
          पूरा हुआ (Done)
        </button>
      )}
    </div>
  );
};
