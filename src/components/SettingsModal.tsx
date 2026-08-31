import React from 'react';
import { X, Volume2, Sliders, Check } from 'lucide-react';
import { VoiceSettings, LanguageMode } from '../types';
import { getAvailableVoices } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (settings: Partial<VoiceSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const voices = getAvailableVoices();
  // Filter voices that match Hindi or English
  const relevantVoices = voices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith('hi') ||
      v.lang.toLowerCase().includes('in') ||
      v.lang.toLowerCase().startsWith('en')
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Sliders className="w-5 h-5 text-[#bb86fc]" />
            <span>वॉयस सेटिंग्स (Voice Settings)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auto-speak Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#282828] border border-white/5">
          <div>
            <h4 className="text-sm font-semibold text-white">स्वचालित आवाज़ (Auto-Speak)</h4>
            <p className="text-xs text-neutral-400">उत्तर मिलते ही रीना बोलकर सुनाएगी</p>
          </div>
          <button
            type="button"
            onClick={() => onUpdateSettings({ autoSpeak: !settings.autoSpeak })}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              settings.autoSpeak ? 'bg-[#03dac6]' : 'bg-neutral-700'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-black transition-transform ${
                settings.autoSpeak ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Speech Rate Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-neutral-300">
            <span className="font-medium">बोलने की गति (Speech Speed)</span>
            <span className="text-[#bb86fc] font-bold">{settings.rate}x</span>
          </div>
          <input
            type="range"
            min="0.7"
            max="1.5"
            step="0.1"
            value={settings.rate}
            onChange={(e) => onUpdateSettings({ rate: parseFloat(e.target.value) })}
            className="w-full accent-[#bb86fc] bg-[#2a2a2a] rounded-lg h-2"
          />
          <div className="flex justify-between text-[10px] text-neutral-500">
            <span>धीमी (0.7x)</span>
            <span>सामान्य (1.0x)</span>
            <span>तेज़ (1.5x)</span>
          </div>
        </div>

        {/* Speech Pitch Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-neutral-300">
            <span className="font-medium">आवाज़ का सुर (Pitch)</span>
            <span className="text-[#03dac6] font-bold">{settings.pitch}x</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.3"
            step="0.1"
            value={settings.pitch}
            onChange={(e) => onUpdateSettings({ pitch: parseFloat(e.target.value) })}
            className="w-full accent-[#03dac6] bg-[#2a2a2a] rounded-lg h-2"
          />
        </div>

        {/* Voice Selector */}
        {relevantVoices.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-300">
              सिस्टम वॉयस (System Voice Engine)
            </label>
            <select
              value={settings.selectedVoiceURI}
              onChange={(e) => onUpdateSettings({ selectedVoiceURI: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#2a2a2a] border border-white/10 text-white text-xs focus:outline-none focus:border-[#bb86fc]"
            >
              <option value="">ऑटोमैटिक (Best Available Voice)</option>
              {relevantVoices.map((v, idx) => (
                <option key={`${v.voiceURI || v.name || 'voice'}-${v.lang}-${idx}`} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Done Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#bb86fc] hover:bg-[#c898ff] text-black font-bold text-sm transition-all shadow-md shadow-[#bb86fc]/20"
        >
          सेव करें (Save Settings)
        </button>
      </div>
    </div>
  );
};
