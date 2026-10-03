import React, { useState, useEffect, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Play,
  RotateCcw,
  Check,
  Headphones,
  Globe,
  Cloud,
  Laptop,
  Search,
  ChevronDown,
} from 'lucide-react';
import { speechEngine, SpeechSettings, VOICE_PRESETS, VoicePreset } from '../utils/speech';
import { soundFx } from '../utils/audio';
import { SUPPORTED_LANGUAGES, getLanguageByCode, SupportedLanguage } from '../data/languages';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLanguage?: string;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  initialLanguage,
}) => {
  const [settings, setSettings] = useState<SpeechSettings>(speechEngine.getSettings());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [langSearch, setLangSearch] = useState<string>('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);
  const [sampleText, setSampleText] = useState<string>('');

  const currentLangObj = useMemo(() => {
    return getLanguageByCode(settings.currentLanguage);
  }, [settings.currentLanguage]);

  // Set initial language if provided
  useEffect(() => {
    if (initialLanguage && isOpen) {
      const matched = getLanguageByCode(initialLanguage);
      speechEngine.setLanguage(matched.bcp47);
      setSampleText(matched.sampleSentence);
    }
  }, [initialLanguage, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Load available voices
    const available = speechEngine.getVoices();
    setVoices(available);

    // Sync sample text with current language
    const lang = getLanguageByCode(speechEngine.getSettings().currentLanguage);
    setSampleText(lang.sampleSentence);

    // Subscribe to engine changes
    const unsubSettings = speechEngine.subscribeSettings((newS) => {
      setSettings(newS);
    });

    const unsubState = speechEngine.subscribeState((speaking, id) => {
      setIsPlayingPreview(speaking && id === 'voice_preview');
    });

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoices(speechEngine.getVoices());
      };
    }

    return () => {
      unsubSettings();
      unsubState();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdate = (partial: Partial<SpeechSettings>) => {
    soundFx.playClick();
    speechEngine.updateSettings(partial);
  };

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    soundFx.playClick();
    speechEngine.setLanguage(lang.bcp47);
    setSampleText(lang.sampleSentence);
    setIsLangDropdownOpen(false);
    setLangSearch('');
  };

  const handleSelectPreset = (preset: VoicePreset) => {
    soundFx.playClick();
    speechEngine.applyPreset(preset.id);
  };

  const handleTestVoice = () => {
    soundFx.playClick();
    if (isPlayingPreview) {
      speechEngine.stop();
    } else {
      speechEngine.speak(sampleText || currentLangObj.sampleSentence, {
        id: 'voice_preview',
        lang: currentLangObj.bcp47,
        voiceName: settings.googleCloudVoice || undefined,
      });
    }
  };

  const handleReset = () => {
    soundFx.playClick();
    speechEngine.updateSettings({
      voiceURI: null,
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      readOptions: true,
      readCodeSnippet: false,
      preset: 'default',
      ttsProvider: 'google_cloud',
      currentLanguage: 'en-US',
      googleCloudVoice: 'en-US-Journey-F',
    });
    setSampleText(getLanguageByCode('en-US').sampleSentence);
  };

  // Filter languages for the searchable dropdown
  const filteredLanguages = SUPPORTED_LANGUAGES.filter((l) => {
    const q = langSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      l.name.toLowerCase().includes(q) ||
      l.nativeName.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q) ||
      l.bcp47.toLowerCase().includes(q)
    );
  });

  // Browser voices filtered for the current language
  const browserVoicesForLang = speechEngine.getVoicesForLanguage(currentLangObj.bcp47);
  const googleBrowserVoices = browserVoicesForLang.filter((v) =>
    v.name.toLowerCase().includes('google')
  );
  const otherBrowserVoices = browserVoicesForLang.filter(
    (v) => !v.name.toLowerCase().includes('google')
  );

  return (
    <div
      id="voice-settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          speechEngine.stop();
          onClose();
        }
      }}
    >
      <div
        id="voice-settings-modal-card"
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Multilingual Voice & TTS Settings
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                  50+ Languages
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Google Cloud High-Fidelity & Device TTS voices for global study
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              speechEngine.stop();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* 1. Language Selector (50+ Languages) */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span>Active TTS Language</span>
              </span>
              <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                {SUPPORTED_LANGUAGES.length} Languages Supported
              </span>
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 flex items-center justify-between text-left hover:border-indigo-400 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentLangObj.flag}</span>
                  <div>
                    <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{currentLangObj.name}</span>
                      <span className="text-xs text-slate-400 font-normal">
                        ({currentLangObj.nativeName})
                      </span>
                    </div>
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">
                      BCP-47: {currentLangObj.bcp47} • {currentLangObj.googleCloudVoices.length} Google Cloud Voices
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Searchable Language Dropdown Panel */}
              {isLangDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 max-h-64 flex flex-col animate-in fade-in zoom-in-95">
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search from 50+ languages..."
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-indigo-500 outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto space-y-1 pr-1">
                    {filteredLanguages.map((lang) => {
                      const isSelected = lang.bcp47 === currentLangObj.bcp47;
                      return (
                        <button
                          key={lang.bcp47}
                          type="button"
                          onClick={() => handleSelectLanguage(lang)}
                          className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer text-xs ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{lang.flag}</span>
                            <div>
                              <span className="font-bold">{lang.name}</span>
                              <span className="ml-1.5 text-[11px] text-slate-400">
                                {lang.nativeName}
                              </span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. TTS Provider Engine Selector */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-indigo-500" />
              <span>Text-to-Speech Engine</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleUpdate({ ttsProvider: 'google_cloud' })}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  settings.ttsProvider === 'google_cloud'
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`p-2 rounded-xl ${settings.ttsProvider === 'google_cloud' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Google Cloud TTS</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                      Neural2
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    Studio & Journey studio quality
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleUpdate({ ttsProvider: 'browser' })}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  settings.ttsProvider === 'browser'
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`p-2 rounded-xl ${settings.ttsProvider === 'browser' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">
                    Device / Browser
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    Native Web Speech synthesis
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Specific Voice Selector based on Engine & Language */}
          {settings.ttsProvider === 'google_cloud' ? (
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Google Cloud Voice Persona ({currentLangObj.name})</span>
                <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  {currentLangObj.googleCloudVoices.length} Models
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {currentLangObj.googleCloudVoices.map((voice) => {
                  const isSelected =
                    settings.googleCloudVoice === voice.id ||
                    (!settings.googleCloudVoice && voice === currentLangObj.googleCloudVoices[0]);
                  return (
                    <button
                      key={voice.id}
                      type="button"
                      onClick={() => handleUpdate({ googleCloudVoice: voice.id, preset: 'custom' })}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between text-xs ${
                        isSelected
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                          <span>{voice.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {voice.gender} • {voice.type}
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Browser Voice ({currentLangObj.name})</span>
                <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  {browserVoicesForLang.length} Found
                </span>
              </label>
              <select
                id="browser-voice-selection-dropdown"
                value={settings.voiceURI || ''}
                onChange={(e) =>
                  handleUpdate({ voiceURI: e.target.value || null, preset: 'custom' })
                }
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">Auto-select optimal voice for {currentLangObj.name}</option>
                {googleBrowserVoices.length > 0 && (
                  <optgroup label="Google High-Fidelity Voices">
                    {googleBrowserVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </optgroup>
                )}
                {otherBrowserVoices.length > 0 && (
                  <optgroup label="Other Installed Voices">
                    {otherBrowserVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          )}

          {/* 4. Voice Presets */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Tone & Pace Presets</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {VOICE_PRESETS.map((preset) => {
                const isSelected = settings.preset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-base">{preset.icon}</span>
                    <span className="text-[11px] font-black text-slate-900 dark:text-white truncate w-full">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Speed, Pitch, Volume Sliders */}
          <div className="space-y-3.5 pt-1">
            {/* Speed / Rate */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-700 dark:text-slate-300">
                  Reading Speed
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md text-[11px]">
                  {settings.rate.toFixed(2)}x
                </span>
              </div>
              <input
                id="voice-rate-slider"
                type="range"
                min="0.6"
                max="1.6"
                step="0.05"
                value={settings.rate}
                onChange={(e) =>
                  handleUpdate({ rate: parseFloat(e.target.value), preset: 'custom' })
                }
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Pitch */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-700 dark:text-slate-300">
                  Voice Pitch
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md text-[11px]">
                  {settings.pitch.toFixed(2)}
                </span>
              </div>
              <input
                id="voice-pitch-slider"
                type="range"
                min="0.6"
                max="1.5"
                step="0.05"
                value={settings.pitch}
                onChange={(e) =>
                  handleUpdate({ pitch: parseFloat(e.target.value), preset: 'custom' })
                }
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Read Options Checkboxes */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.readOptions}
                  onChange={(e) => handleUpdate({ readOptions: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
                <span className="font-bold">Read options (A, B, C, D)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.readCodeSnippet}
                  onChange={(e) => handleUpdate({ readCodeSnippet: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
                <span className="font-bold">Announce code snippet presence</span>
              </label>
            </div>
          </div>

          {/* 6. Live Multilingual Audition Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Audition Pronunciation ({currentLangObj.flag} {currentLangObj.name})</span>
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="Type sample text to audition..."
                dir={currentLangObj.direction}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleTestVoice}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isPlayingPreview
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isPlayingPreview ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Test Voice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="text-sm">{currentLangObj.flag}</span>
            <span>TTS dynamically adapts to quiz language</span>
          </div>
          <button
            type="button"
            onClick={() => {
              speechEngine.stop();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer"
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
};
