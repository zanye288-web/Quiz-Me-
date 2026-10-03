import { SUPPORTED_LANGUAGES, getLanguageByCode, SupportedLanguage } from '../data/languages';

export interface SpeechSettings {
  voiceURI: string | null;
  rate: number; // 0.5 to 2.0 (default 1.0)
  pitch: number; // 0.5 to 1.8 (default 1.0)
  volume: number; // 0.0 to 1.0 (default 1.0)
  readOptions: boolean; // whether to read out options A, B, C, D
  readCodeSnippet: boolean;
  preset: 'default' | 'tutor' | 'professor' | 'fast' | 'calm' | 'custom';
  currentLanguage: string; // e.g. 'en-US', 'es-ES', 'fr-FR', 'ja-JP'
  ttsProvider: 'google_cloud' | 'browser';
  googleCloudVoice: string | null;
}

export interface VoicePreset {
  id: 'default' | 'tutor' | 'professor' | 'fast' | 'calm';
  name: string;
  description: string;
  icon: string;
  settings: Partial<SpeechSettings>;
}

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'default',
    name: 'Natural Standard',
    description: 'Balanced pace and pitch for everyday learning',
    icon: '✨',
    settings: { rate: 1.0, pitch: 1.0, volume: 1.0, preset: 'default' },
  },
  {
    id: 'tutor',
    name: 'Warm & Upbeat Tutor',
    description: 'Slightly higher pitch and encouraging rhythm',
    icon: '🎓',
    settings: { rate: 1.05, pitch: 1.15, volume: 1.0, preset: 'tutor' },
  },
  {
    id: 'professor',
    name: 'Academic Professor',
    description: 'Measured, clear cadence for deep technical study',
    icon: '📜',
    settings: { rate: 0.92, pitch: 0.9, volume: 1.0, preset: 'professor' },
  },
  {
    id: 'fast',
    name: 'Speed Study',
    description: '1.25x brisk delivery for rapid recall drills',
    icon: '⚡',
    settings: { rate: 1.25, pitch: 1.05, volume: 1.0, preset: 'fast' },
  },
  {
    id: 'calm',
    name: 'Calm & Steady',
    description: 'Slower paced, lower pitch to ease exam anxiety',
    icon: '🌿',
    settings: { rate: 0.85, pitch: 0.85, volume: 1.0, preset: 'calm' },
  },
];

const STORAGE_KEY = 'quizme_tts_voice_settings_v2';

const DEFAULT_SETTINGS: SpeechSettings = {
  voiceURI: null,
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  readOptions: true,
  readCodeSnippet: false,
  preset: 'default',
  currentLanguage: 'en-US',
  ttsProvider: 'google_cloud',
  googleCloudVoice: 'en-US-Journey-F',
};

type SpeechStateListener = (isSpeaking: boolean, currentId: string | null) => void;
type SettingsListener = (settings: SpeechSettings) => void;

class SpeechEngine {
  private settings: SpeechSettings = DEFAULT_SETTINGS;
  private isSpeaking: boolean = false;
  private currentId: string | null = null;
  private stateListeners: Set<SpeechStateListener> = new Set();
  private settingsListeners: Set<SettingsListener> = new Set();
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private abortController: AbortController | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadSettings();

      if ('speechSynthesis' in window) {
        this.updateVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          this.updateVoices();
        };
      }
    }
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // ignore
    }
    this.settingsListeners.forEach((fn) => fn(this.settings));
  }

  public getSettings(): SpeechSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<SpeechSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  public setLanguage(langCode: string) {
    const lang = getLanguageByCode(langCode);
    const defaultVoice = lang.googleCloudVoices[0]?.id || null;
    this.updateSettings({
      currentLanguage: lang.bcp47,
      googleCloudVoice: defaultVoice,
      voiceURI: null, // Let system re-match best browser voice for new language
    });
  }

  public applyPreset(presetId: VoicePreset['id']) {
    const found = VOICE_PRESETS.find((p) => p.id === presetId);
    if (found) {
      this.updateSettings({
        ...found.settings,
        preset: presetId,
      });
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    if (this.cachedVoices.length === 0) {
      this.updateVoices();
    }
    return this.cachedVoices;
  }

  public getVoicesForLanguage(langCodeOrBcp47?: string): SpeechSynthesisVoice[] {
    const all = this.getVoices();
    if (!langCodeOrBcp47) return all;
    const lang = getLanguageByCode(langCodeOrBcp47);
    const prefix = lang.code.toLowerCase().split('-')[0];
    const bcpPrefix = lang.bcp47.toLowerCase().split('-')[0];

    return all.filter((v) => {
      const vLang = v.lang.toLowerCase();
      return vLang === lang.bcp47.toLowerCase() ||
             vLang.startsWith(prefix) ||
             vLang.startsWith(bcpPrefix);
    });
  }

  private updateVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        this.cachedVoices = voices;
      }
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined';
  }

  public subscribeState(fn: SpeechStateListener): () => void {
    this.stateListeners.add(fn);
    fn(this.isSpeaking, this.currentId);
    return () => {
      this.stateListeners.delete(fn);
    };
  }

  public subscribeSettings(fn: SettingsListener): () => void {
    this.settingsListeners.add(fn);
    fn(this.settings);
    return () => {
      this.settingsListeners.delete(fn);
    };
  }

  private notifyState(speaking: boolean, id: string | null) {
    this.isSpeaking = speaking;
    this.currentId = id;
    this.stateListeners.forEach((fn) => fn(speaking, id));
  }

  public stop() {
    // Cancel in-flight network request
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    // Stop active HTML5 audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    // Stop browser synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.notifyState(false, null);
  }

  public speak(
    text: string,
    options?: {
      id?: string;
      lang?: string; // Language override (e.g. quiz.language)
      voiceName?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: unknown) => void;
    }
  ) {
    // If currently speaking this exact item, toggle off (stop)
    if (this.isSpeaking && options?.id && this.currentId === options.id) {
      this.stop();
      return;
    }

    this.stop();

    const cleanText = text
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/[*_#`~[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    // Resolve target language (from options, or current settings, or default)
    const targetLang = getLanguageByCode(options?.lang || this.settings.currentLanguage);
    const currentReqId = options?.id || 'general';

    // If user prefers Google Cloud TTS, attempt server synthesis first
    if (this.settings.ttsProvider === 'google_cloud') {
      this.speakGoogleCloud(cleanText, targetLang, currentReqId, options);
    } else {
      this.speakBrowser(cleanText, targetLang, currentReqId, options);
    }
  }

  private async speakGoogleCloud(
    cleanText: string,
    targetLang: SupportedLanguage,
    currentReqId: string,
    options?: {
      id?: string;
      voiceName?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: unknown) => void;
    }
  ) {
    this.abortController = new AbortController();

    // Select suitable Google Cloud voice
    const chosenVoice =
      options?.voiceName ||
      this.settings.googleCloudVoice ||
      targetLang.googleCloudVoices[0]?.id;

    // Convert pitch from 0.5-1.8 to semitones (-10.0 to 10.0)
    const semitonePitch = (this.settings.pitch - 1.0) * 12.0;

    try {
      this.notifyState(true, currentReqId);
      options?.onStart?.();

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: this.abortController.signal,
        body: JSON.stringify({
          text: cleanText,
          languageCode: targetLang.bcp47,
          voiceName: chosenVoice,
          speakingRate: this.settings.rate,
          pitch: semitonePitch,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.audioBase64) {
        const mime = result.contentType || 'audio/mp3';
        const audio = new Audio(`data:${mime};base64,${result.audioBase64}`);
        audio.volume = Math.max(0, Math.min(1.0, this.settings.volume));
        this.currentAudio = audio;

        audio.onended = () => {
          this.currentAudio = null;
          this.notifyState(false, null);
          options?.onEnd?.();
        };

        audio.onerror = () => {
          this.currentAudio = null;
          this.speakBrowser(cleanText, targetLang, currentReqId, options);
        };

        await audio.play();
        return;
      } else {
        // Smooth fallback to browser synthesis without throwing
        this.speakBrowser(cleanText, targetLang, currentReqId, options);
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        return;
      }
      this.speakBrowser(cleanText, targetLang, currentReqId, options);
    }
  }

  private speakBrowser(
    cleanText: string,
    targetLang: SupportedLanguage,
    currentReqId: string,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: unknown) => void;
    }
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.notifyState(false, null);
      options?.onError?.(new Error('SpeechSynthesis not supported'));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = Math.max(0.5, Math.min(2.0, this.settings.rate));
    utterance.pitch = Math.max(0.5, Math.min(1.8, this.settings.pitch));
    utterance.volume = Math.max(0.0, Math.min(1.0, this.settings.volume));
    utterance.lang = targetLang.bcp47;

    const voices = this.getVoices();
    const langPrefix = targetLang.code.toLowerCase().split('-')[0];
    const bcpPrefix = targetLang.bcp47.toLowerCase().split('-')[0];

    // Priority 1: User explicitly selected voiceURI
    if (this.settings.voiceURI && voices.length > 0) {
      const explicit = voices.find((v) => v.voiceURI === this.settings.voiceURI);
      if (explicit) {
        utterance.voice = explicit;
      }
    }

    // Priority 2: Google Cloud / Chrome Google voice for target language
    if (!utterance.voice && voices.length > 0) {
      const googleVoice = voices.find(
        (v) =>
          (v.lang.toLowerCase() === targetLang.bcp47.toLowerCase() ||
           v.lang.toLowerCase().startsWith(langPrefix) ||
           v.lang.toLowerCase().startsWith(bcpPrefix)) &&
          v.name.toLowerCase().includes('google')
      );
      if (googleVoice) {
        utterance.voice = googleVoice;
      }
    }

    // Priority 3: Any native voice matching target language
    if (!utterance.voice && voices.length > 0) {
      const nativeVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === targetLang.bcp47.toLowerCase() ||
          v.lang.toLowerCase().startsWith(langPrefix) ||
          v.lang.toLowerCase().startsWith(bcpPrefix)
      );
      if (nativeVoice) {
        utterance.voice = nativeVoice;
      }
    }

    utterance.onstart = () => {
      this.notifyState(true, currentReqId);
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.notifyState(false, null);
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.notifyState(false, null);
      options?.onError?.(e);
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this.notifyState(false, null);
      options?.onError?.(e);
    }
  }

  public testVoice(sampleText?: string, langCode?: string) {
    const lang = getLanguageByCode(langCode || this.settings.currentLanguage);
    const textToSpeak = sampleText || lang.sampleSentence || 'Welcome to Quiz Me!';
    this.speak(textToSpeak, {
      id: 'voice_preview',
      lang: lang.bcp47,
    });
  }
}

export const speechEngine = new SpeechEngine();
