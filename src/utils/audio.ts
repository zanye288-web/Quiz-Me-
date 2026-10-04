// Web Audio API Advanced Synthesized Acoustic & Sound Design Engine
// Designed for ultra-clean, warm, zero-latency, high-fidelity UI acoustics

export type SoundProfileType = 'crystal' | 'minimal' | 'arcade' | 'zen';
export type CustomSoundSlot = 'correct' | 'incorrect' | 'click' | 'complete' | 'streak' | 'badge';
export type AmbientSoundscapeMode = 'alpha432' | 'rain' | 'pinknoise';

export interface CustomSoundConfig {
  slot: CustomSoundSlot;
  name: string;
  enabled: boolean;
  sourceType: 'upload' | 'mic' | 'synth';
  dataUrl?: string;
  synth?: {
    waveform: OscillatorType;
    startFreq: number;
    endFreq: number;
    durationMs: number;
  };
  updatedAt: string;
}

export const CUSTOM_SOUND_SLOTS_META: {
  slot: CustomSoundSlot;
  label: string;
  description: string;
  defaultFreq: number;
  defaultEndFreq: number;
}[] = [
  {
    slot: 'correct',
    label: 'Correct Answer Chime',
    description: 'Plays whenever you answer a quiz question right',
    defaultFreq: 523.25,
    defaultEndFreq: 1046.5,
  },
  {
    slot: 'incorrect',
    label: 'Incorrect Answer Alert',
    description: 'Plays when an answer misses the mark',
    defaultFreq: 260,
    defaultEndFreq: 165,
  },
  {
    slot: 'click',
    label: 'Button Click / UI Tap',
    description: 'Plays on interactive buttons and navigation taps',
    defaultFreq: 600,
    defaultEndFreq: 300,
  },
  {
    slot: 'streak',
    label: 'Combo Streak Celebration',
    description: 'Plays when you hit a 3x+ answer streak',
    defaultFreq: 440,
    defaultEndFreq: 1320,
  },
  {
    slot: 'complete',
    label: 'Quiz Complete Fanfare',
    description: 'Plays when you finish an entire assessment',
    defaultFreq: 392,
    defaultEndFreq: 1174.66,
  },
  {
    slot: 'badge',
    label: 'Badge & Level-Up Unlock',
    description: 'Plays when unlocking a new trophy badge or level',
    defaultFreq: 587.33,
    defaultEndFreq: 1567.98,
  },
];

export interface SoundProfileMeta {
  id: SoundProfileType;
  name: string;
  description: string;
  icon: string;
  character: string;
}

export const SOUND_PROFILES: SoundProfileMeta[] = [
  {
    id: 'crystal',
    name: 'Crystal Marimba & Glass',
    description: 'Rich harmonic chimes, wooden marimba resonance & sparkling acoustic overtones.',
    icon: '✨',
    character: 'Acoustic & Modern',
  },
  {
    id: 'minimal',
    name: 'Minimalist Studio & Haptic',
    description: 'Subtle low-pass filtered tactile taps, muted clicks & low-profile UI pulses.',
    icon: '🎯',
    character: 'Subtle & Focused',
  },
  {
    id: 'zen',
    name: 'Zen Singing Bowl & Kalimba',
    description: 'Warm organic thumb-piano plucks, resonant harmonic rings & calming feedback.',
    icon: '🧘',
    character: 'Warm & Calming',
  },
  {
    id: 'arcade',
    name: 'Arcade Retro & Chiptune',
    description: 'Energetic 8-bit & 16-bit ascending arpeggios, power-up sweeps & arcade chirps.',
    icon: '🕹️',
    character: 'Playful & Nostalgic',
  },
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;

  public enabled: boolean = true;
  public volume: number = 0.85;
  public soundProfile: SoundProfileType = 'crystal';

  private soundStorageKey = 'quizme_sound_effects_enabled';
  private volumeStorageKey = 'quizme_sound_volume';
  private profileStorageKey = 'quizme_sound_profile';
  private customSoundsStorageKey = 'quizme_custom_sfx_v1';

  public customSounds: Partial<Record<CustomSoundSlot, CustomSoundConfig>> = {};
  public ambientMode: AmbientSoundscapeMode = 'alpha432';
  private noiseSource: AudioBufferSourceNode | null = null;

  // Ambient Focus Tone Nodes
  private focusOsc1: OscillatorNode | null = null;
  private focusOsc2: OscillatorNode | null = null;
  private focusGain: GainNode | null = null;
  private focusFilter: BiquadFilterNode | null = null;
  public isFocusHumming: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(this.soundStorageKey);
      this.enabled = saved !== null ? saved === 'true' : true;

      const savedVol = localStorage.getItem(this.volumeStorageKey);
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.volume = parsed;
        }
      }

      const savedProfile = localStorage.getItem(this.profileStorageKey) as SoundProfileType | null;
      if (savedProfile && ['crystal', 'minimal', 'arcade', 'zen'].includes(savedProfile)) {
        this.soundProfile = savedProfile;
      }

      const savedCustom = localStorage.getItem(this.customSoundsStorageKey);
      if (savedCustom) {
        try {
          this.customSounds = JSON.parse(savedCustom) || {};
        } catch {
          this.customSounds = {};
        }
      }

      // Auto-unlock AudioContext on first user interaction
      const unlockAudio = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };
      window.addEventListener('pointerdown', unlockAudio, { once: false });
      window.addEventListener('keydown', unlockAudio, { once: false });
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.volumeStorageKey, String(this.volume));
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setSoundProfile(profile: SoundProfileType) {
    this.soundProfile = profile;
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.profileStorageKey, profile);
    }
    this.playSelect();
  }

  public getSoundProfile(): SoundProfileType {
    return this.soundProfile;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.soundStorageKey, String(enabled));
    }
    if (enabled) {
      this.playClick();
    } else {
      this.stopFocusHum();
    }
  }

  public toggleSound(): boolean {
    const next = !this.enabled;
    this.setEnabled(next);
    return next;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // Create Master Dynamics Compressor stage to prevent distortion and clipping
        this.masterCompressor = this.ctx.createDynamicsCompressor();
        this.masterCompressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
        this.masterCompressor.knee.setValueAtTime(30, this.ctx.currentTime);
        this.masterCompressor.ratio.setValueAtTime(8, this.ctx.currentTime);
        this.masterCompressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.masterCompressor.release.setValueAtTime(0.2, this.ctx.currentTime);

        // Master Gain Stage
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

        this.masterCompressor.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getMasterOutput(): AudioNode | null {
    if (!this.masterCompressor) {
      this.getContext();
    }
    return this.masterCompressor;
  }

  // ==========================================
  // CUSTOM USER SOUND EFFECTS MANAGER
  // ==========================================
  public getCustomSounds(): Partial<Record<CustomSoundSlot, CustomSoundConfig>> {
    return { ...this.customSounds };
  }

  public setCustomSound(slot: CustomSoundSlot, config: CustomSoundConfig) {
    this.customSounds = {
      ...this.customSounds,
      [slot]: config,
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.customSoundsStorageKey, JSON.stringify(this.customSounds));
      } catch (e) {
        console.warn('Custom sound storage notice (file may be large, keeping in session):', e);
      }
    }
  }

  public removeCustomSound(slot: CustomSoundSlot) {
    const next = { ...this.customSounds };
    delete next[slot];
    this.customSounds = next;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.customSoundsStorageKey, JSON.stringify(this.customSounds));
      } catch {
        // ignore
      }
    }
  }

  public toggleCustomSoundEnabled(slot: CustomSoundSlot, enabled: boolean) {
    const existing = this.customSounds[slot];
    if (!existing) return;
    this.setCustomSound(slot, { ...existing, enabled });
  }

  public playCustomSoundSlot(slot: CustomSoundSlot, forcePlay = false): boolean {
    const custom = this.customSounds[slot];
    if (!custom || (!custom.enabled && !forcePlay)) return false;

    if ((custom.sourceType === 'upload' || custom.sourceType === 'mic') && custom.dataUrl) {
      try {
        const audio = new Audio(custom.dataUrl);
        audio.volume = Math.max(0.05, Math.min(1, this.volume));
        audio.play().catch(() => {});
        return true;
      } catch {
        return false;
      }
    }

    if (custom.sourceType === 'synth' && custom.synth) {
      const ctx = this.getContext();
      const dest = this.getMasterOutput();
      if (!ctx || !dest) return false;
      try {
        const now = ctx.currentTime;
        const durSec = Math.max(0.04, Math.min(2.5, custom.synth.durationMs / 1000));
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = custom.synth.waveform || 'sine';
        osc.frequency.setValueAtTime(Math.max(60, custom.synth.startFreq), now);
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(60, custom.synth.endFreq),
          now + durSec * 0.85
        );

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + durSec);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + durSec + 0.02);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }

  // ==========================================
  // 1. TACTILE BUTTON CLICK / INTERACTION
  // ==========================================
  public playClick() {
    if (!this.enabled) return;
    if (this.playCustomSoundSlot('click')) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;

      if (this.soundProfile === 'minimal') {
        // Muted low-frequency organic haptic click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.028);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(now);
        osc.stop(now + 0.03);
      } else if (this.soundProfile === 'zen') {
        // Wooden kalimba tap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now);
        osc.stop(now + 0.045);
      } else if (this.soundProfile === 'arcade') {
        // Crispy 8-bit blip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.02);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(now);
        osc.stop(now + 0.05);
      } else {
        // Crystal Marimba: Crisp acoustic transient with subtle glass harmonic
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3200, now);

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(620, now);
        osc1.frequency.exponentialRampToValueAtTime(280, now + 0.035);

        // Overtone shimmer
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1240, now);
        osc2.frequency.exponentialRampToValueAtTime(560, now + 0.025);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.04);
        osc2.stop(now + 0.04);
      }
    } catch {
      // Audio fallback
    }
  }

  // ==========================================
  // 2. OPTION / ANSWER SELECTION POP
  // ==========================================
  public playSelect() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;

      if (this.soundProfile === 'minimal') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.05);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.055);
      } else if (this.soundProfile === 'zen') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (this.soundProfile === 'arcade') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.03);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.075);
      } else {
        // Crystal Marimba dual acoustic pop
        const notes = [587.33, 880]; // D5, A5
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + i * 0.025;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

          osc.connect(gain);
          gain.connect(dest);

          osc.start(t);
          osc.stop(t + 0.075);
        });
      }
    } catch {
      // Audio fallback
    }
  }

  // ==========================================
  // 2b. MASCOT POP / BUBBLE INTERACTION
  // ==========================================
  public playPop() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Audio fallback
    }
  }

  // ==========================================
  // 3. THEME TOGGLE (LIGHT / DARK SWITCH)
  // ==========================================
  public playThemeToggle() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, now); // E4
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.09); // E5

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.095);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Audio fallback
    }
  }

  // ==========================================
  // 4. 3D FLASHCARD SWOOSH FLIP
  // ==========================================
  public playCardFlip() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;

      // Soft air swoosh sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(350, now + 0.09);
      filter.Q.setValueAtTime(1.5, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.09);

      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.095);
    } catch {
      // Audio fallback
    }
  }

  // ==========================================
  // 5. CORRECT ANSWER: HARMONIOUS CHIME
  // ==========================================
  public playCorrect() {
    if (!this.enabled) return;
    if (this.playCustomSoundSlot('correct')) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;

      if (this.soundProfile === 'minimal') {
        // Clean dual bell (E5 -> B5)
        const notes = [659.25, 987.77];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.06;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.15, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

          osc.connect(gain);
          gain.connect(dest);

          osc.start(t);
          osc.stop(t + 0.23);
        });
      } else if (this.soundProfile === 'zen') {
        // Resonant Kalimba Chord (C5, G5, C6)
        const notes = [523.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.05;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.16, t + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

          osc.connect(gain);
          gain.connect(dest);

          osc.start(t);
          osc.stop(t + 0.46);
        });
      } else if (this.soundProfile === 'arcade') {
        // 8-bit victorious upward 4-step chime
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = now + idx * 0.045;

          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

          osc.connect(gain);
          gain.connect(dest);

          osc.start(t);
          osc.stop(t + 0.19);
        });
      } else {
        // Crystal Marimba: Harmonic layered acoustic chime (C5, E5, G5, C6)
        // With 2nd harmonic resonance overtones
        const notes = [523.25, 659.25, 783.99, 1046.5];

        notes.forEach((freq, index) => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          const noteTime = now + index * 0.055;

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(3600, noteTime);

          // Fundamental Sine
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(freq, noteTime);

          // Subtle Marimba Overtone (2.76x physical bar ratio)
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(freq * 2.0, noteTime);

          gain.gain.setValueAtTime(0, noteTime);
          gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.38);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(dest);

          osc1.start(noteTime);
          osc2.start(noteTime);
          osc1.stop(noteTime + 0.39);
          osc2.stop(noteTime + 0.39);
        });
      }
    } catch {
      // Audio fallback
    }
  }

  // ==========================================
  // 6. GENTLE / CONSTRUCTIVE INCORRECT BOOP
  // ==========================================
  public playWrong() {
    this.playIncorrect();
  }

  public playIncorrect() {
    if (!this.enabled) return;
    if (this.playCustomSoundSlot('incorrect')) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;

      if (this.soundProfile === 'arcade') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(146.83, now + 0.08);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.23);
      } else {
        // Warm mellow Rhodes dual-drop (gentle, constructive, non-punitive)
        const notes = [
          { freq: 246.94, duration: 0.18 }, // B3
          { freq: 196.0, duration: 0.24 }, // G3
        ];

        notes.forEach((n, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          const t = now + idx * 0.07;

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(600, t);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.freq, t);

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.14, t + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + n.duration);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(dest);

          osc.start(t);
          osc.stop(t + n.duration + 0.02);
        });
      }
    } catch {
      // Audio fallback
    }
  }

  // ==========================================
  // 7. COMBO STREAK ARPEGGIO & CELEBRATION
  // ==========================================
  public playCombo(combo: number) {
    if (!this.enabled) return;
    if (this.playCustomSoundSlot('streak')) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;
      const pitchMultiplier = Math.min(1.6, 1 + (combo - 1) * 0.08);
      const baseFreqs = [
        440 * pitchMultiplier,
        554.37 * pitchMultiplier,
        659.25 * pitchMultiplier,
        880 * pitchMultiplier,
        1108.73 * pitchMultiplier,
      ];

      baseFreqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteTime = now + i * 0.04;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.15, noteTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.28);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(noteTime);
        osc.stop(noteTime + 0.29);
      });
    } catch {
      // Audio fallback
    }
  }

  public playStreak() {
    this.playCombo(4);
  }

  public playLevelUp() {
    this.playCombo(5);
  }

  public playVictory() {
    this.playComplete();
  }

  // ==========================================
  // 8. HINT SPARKLE CRYSTALLINE SHIMMER
  // ==========================================
  public playHint() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;
      const notes = [659.25, 783.99, 987.77, 1318.51, 1567.98];

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteTime = now + i * 0.035;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.12, noteTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.2);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(noteTime);
        osc.stop(noteTime + 0.21);
      });
    } catch {
      // Audio fallback
    }
  }

  // ==========================================
  // 9. GRAND COMPLETION FANFARE
  // ==========================================
  public playComplete() {
    if (!this.enabled) return;
    if (this.playCustomSoundSlot('complete')) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;
      const chords = [
        { freqs: [349.23, 440, 523.25, 698.46], time: 0, duration: 0.16 }, // F major
        { freqs: [392.0, 493.88, 587.33, 783.99], time: 0.16, duration: 0.18 }, // G major
        { freqs: [523.25, 659.25, 783.99, 1046.5, 1318.51], time: 0.36, duration: 0.75 }, // C major 9 Grand Fanfare
      ];

      chords.forEach(({ freqs, time, duration }) => {
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const chordTime = now + time;

          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, chordTime);

          gain.gain.setValueAtTime(0, chordTime);
          gain.gain.linearRampToValueAtTime(0.14 / (freqs.length * 0.35), chordTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, chordTime + duration);

          osc.connect(gain);
          gain.connect(dest);

          osc.start(chordTime);
          osc.stop(chordTime + duration + 0.05);
        });
      });
    } catch {
      // Audio fallback
    }
  }

  // ==========================================
  // 10. TRIUMPHANT BADGE UNLOCK GOLDEN CHIME
  // ==========================================
  public playBadgeUnlock() {
    if (!this.enabled) return;
    if (this.playCustomSoundSlot('badge')) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;

      // Golden Pentatonic Ascending Harp (C4, D4, E4, G4, A4, C5, D5, E5, G5, C6)
      const arpeggio = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 1046.5];
      arpeggio.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteTime = now + idx * 0.042;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.14, noteTime + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.4);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(noteTime);
        osc.stop(noteTime + 0.42);
      });

      // Golden Shimmer Peak Chord
      const peakChords = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      peakChords.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const chordTime = now + 0.44;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, chordTime);

        gain.gain.setValueAtTime(0, chordTime);
        gain.gain.linearRampToValueAtTime(0.11, chordTime + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, chordTime + 0.9);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(chordTime);
        osc.stop(chordTime + 0.95);
      });
    } catch {
      // Audio fallback
    }
  }

  // ==========================================
  // 11. SPEED BONUS SPRINT ACCELERATION
  // ==========================================
  public playSpeedBonus() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;
      const notes = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteTime = now + idx * 0.035;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.14, noteTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.22);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(noteTime);
        osc.stop(noteTime + 0.23);
      });
    } catch {
      // Audio fallback
    }
  }

  // ==========================================
  // 12. TIMER TICK (WOODEN METRONOME PULSE)
  // ==========================================
  public playTimerTick() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(3.0, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.03);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio fallback
    }
  }

  // ==========================================
  // 13. RECORDING START / STOP CHIMES
  // ==========================================
  public playRecordStart() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio fallback
    }
  }

  public playRecordStop() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio fallback
    }
  }

  // ==========================================
  // 14. SCRATCHPAD CANVAS POP
  // ==========================================
  public playScratchpad() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Audio fallback
    }
  }

  // ==========================================
  // 15. AMBIENT STUDY SOUNDSCAPES (432Hz / Rain / Pink Noise)
  // ==========================================
  public toggleFocusHum(mode?: AmbientSoundscapeMode): boolean {
    if (mode && mode !== this.ambientMode) {
      this.ambientMode = mode;
      if (this.isFocusHumming) {
        this.startFocusHum(mode);
        return true;
      }
    }
    if (this.isFocusHumming) {
      this.stopFocusHum();
      return false;
    } else {
      this.startFocusHum(mode || this.ambientMode);
      return true;
    }
  }

  public startFocusHum(mode: AmbientSoundscapeMode = this.ambientMode) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;

    try {
      this.stopFocusHum();
      this.ambientMode = mode;

      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      if (mode === 'rain' || mode === 'pinknoise') {
        // Synthesize seamless 4-second looping pink/rain noise buffer
        const bufferSize = ctx.sampleRate * 4;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }
        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        filter.type = mode === 'rain' ? 'bandpass' : 'lowpass';
        filter.frequency.setValueAtTime(mode === 'rain' ? 950 : 480, ctx.currentTime);
        filter.Q.setValueAtTime(mode === 'rain' ? 0.7 : 0.5, ctx.currentTime);

        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(mode === 'rain' ? 0.18 : 0.12, ctx.currentTime + 0.8);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        source.start();

        this.noiseSource = source;
        this.focusFilter = filter;
        this.focusGain = gain;
        this.isFocusHumming = true;
      } else {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        // 432Hz Harmonic with 10Hz Binaural Alpha Wave Beat
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(216, ctx.currentTime);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(226, ctx.currentTime);

        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 1.2);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc1.start();
        osc2.start();

        this.focusOsc1 = osc1;
        this.focusOsc2 = osc2;
        this.focusFilter = filter;
        this.focusGain = gain;
        this.isFocusHumming = true;
      }
    } catch {
      this.isFocusHumming = false;
    }
  }

  public stopFocusHum() {
    if (!this.isFocusHumming) return;
    try {
      if (this.focusGain && this.ctx) {
        this.focusGain.gain.setValueAtTime(this.focusGain.gain.value, this.ctx.currentTime);
        this.focusGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.25);
      }
      setTimeout(() => {
        try {
          this.focusOsc1?.stop();
          this.focusOsc2?.stop();
          this.noiseSource?.stop();
          this.focusOsc1?.disconnect();
          this.focusOsc2?.disconnect();
          this.noiseSource?.disconnect();
          this.focusFilter?.disconnect();
        } catch {
          // ignore cleanup errors
        }
        this.focusOsc1 = null;
        this.focusOsc2 = null;
        this.noiseSource = null;
        this.focusFilter = null;
        this.focusGain = null;
        this.isFocusHumming = false;
      }, 260);
    } catch {
      this.isFocusHumming = false;
    }
  }

  // ==========================================
  // 16. KAHOOT! ARENA GROOVE MUSIC & SFX ENGINE
  // ==========================================
  private kahootInterval: ReturnType<typeof setInterval> | null = null;
  public isKahootMusicPlaying: boolean = false;
  public kahootMusicMode: 'lobby' | 'question' | 'podium' = 'lobby';
  private kahootStep: number = 0;

  public startKahootMusic(mode: 'lobby' | 'question' | 'podium' = 'lobby') {
    this.kahootMusicMode = mode;
    if (!this.enabled) return;
    if (this.kahootInterval) {
      clearInterval(this.kahootInterval);
      this.kahootInterval = null;
    }
    this.isKahootMusicPlaying = true;
    this.kahootStep = 0;

    // Lobby groove: 240ms per 8th note (~125 BPM); Question tension: 200ms (~150 BPM)
    const stepMs = mode === 'question' ? 200 : mode === 'podium' ? 260 : 240;

    // Catchy pentatonic / funk marimba patterns inspired by Kahoot! lobby & countdown grooves
    const lobbyBass = [220, 0, 220, 261.63, 293.66, 0, 329.63, 261.63]; // A3, C4, D4, E4
    const lobbyLead = [440, 523.25, 659.25, 587.33, 440, 659.25, 587.33, 523.25];
    const questionPulse = [293.66, 293.66, 349.23, 293.66, 440, 392, 349.23, 329.63];
    const podiumChords = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 880, 1046.5];

    this.kahootInterval = setInterval(() => {
      if (!this.enabled || !this.isKahootMusicPlaying) return;
      const ctx = this.getContext();
      const dest = this.getMasterOutput();
      if (!ctx || !dest) return;

      try {
        const now = ctx.currentTime;
        const idx = this.kahootStep % 8;
        this.kahootStep += 1;

        if (this.kahootMusicMode === 'lobby') {
          const bassFreq = lobbyBass[idx];
          if (bassFreq > 0) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(bassFreq, now);
            gain.gain.setValueAtTime(0.055, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
            osc.connect(gain);
            gain.connect(dest);
            osc.start(now);
            osc.stop(now + 0.19);
          }

          if (idx % 2 === 0 || idx === 7) {
            const leadFreq = lobbyLead[idx];
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(leadFreq, now);
            gain2.gain.setValueAtTime(0.04, now);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
            osc2.connect(gain2);
            gain2.connect(dest);
            osc2.start(now);
            osc2.stop(now + 0.15);
          }
        } else if (this.kahootMusicMode === 'question') {
          const freq = questionPulse[idx];
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(idx % 2 === 0 ? 0.05 : 0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.14);
        } else {
          const freq = podiumChords[idx];
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.045, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.23);
        }
      } catch {
        // ignore audio errors
      }
    }, stepMs);
  }

  public stopKahootMusic() {
    this.isKahootMusicPlaying = false;
    if (this.kahootInterval) {
      clearInterval(this.kahootInterval);
      this.kahootInterval = null;
    }
  }

  public toggleKahootMusic(mode: 'lobby' | 'question' | 'podium' = 'lobby'): boolean {
    if (this.isKahootMusicPlaying) {
      this.stopKahootMusic();
      return false;
    } else {
      this.startKahootMusic(mode);
      return true;
    }
  }

  public playKahootGong() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;
    try {
      const now = ctx.currentTime;
      const freqs = [196, 392, 587.33, 783.99];
      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);
        osc.frequency.exponentialRampToValueAtTime(f * 0.98, now + 0.9);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 1.0);
      });
    } catch {
      // ignore
    }
  }

  public playKahootPowerUp() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;
    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.045;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.2);
      });
    } catch {
      // ignore
    }
  }

  public playKahootDrumroll() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;
    try {
      const now = ctx.currentTime;
      for (let i = 0; i < 14; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + i * 0.055;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140 + (i % 2) * 18 + i * 4, t);
        gain.gain.setValueAtTime(0.04 + (i / 14) * 0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.055);
      }
    } catch {
      // ignore
    }
  }

  public playKahootStreakFire() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const dest = this.getMasterOutput();
    if (!ctx || !dest) return;
    try {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.05;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.24);
      });
    } catch {
      // ignore
    }
  }

  // ==========================================
  // 17. MINIMAL GAMIFIED BACKGROUND MUSIC & FRESH MUSIC STUDIO ENGINE
  // ==========================================
  private bgMusicInterval: ReturnType<typeof setInterval> | null = null;
  public bgMusicEnabled: boolean = (() => {
    try {
      return localStorage.getItem('quizme_bg_music_enabled_v1') !== 'false';
    } catch {
      return true;
    }
  })();
  public isBgMusicPlaying: boolean = false;
  public bgMusicTrack: BgMusicTrackId = (() => {
    try {
      const saved = localStorage.getItem('quizme_bg_music_track_v1') as BgMusicTrackId;
      return saved || 'kahoot_minimal';
    } catch {
      return 'kahoot_minimal';
    }
  })();
  public bgMusicVolume: number = (() => {
    try {
      const saved = parseFloat(localStorage.getItem('quizme_bg_music_vol_v1') || '0.35');
      return isNaN(saved) ? 0.35 : Math.max(0.05, Math.min(1, saved));
    } catch {
      return 0.35;
    }
  })();
  public bgMusicBpm: number = 108;
  public bgMusicTimbre: BgMusicTimbre = 'marimba';
  private bgMusicStep: number = 0;
  private bgMusicListeners: Set<() => void> = new Set();

  public subscribeBgMusic(cb: () => void): () => void {
    this.bgMusicListeners.add(cb);
    return () => {
      this.bgMusicListeners.delete(cb);
    };
  }

  private notifyBgMusicListeners() {
    this.bgMusicListeners.forEach((cb) => {
      try {
        cb();
      } catch {
        // ignore
      }
    });
  }

  public setBgMusicEnabled(enabled: boolean) {
    this.bgMusicEnabled = enabled;
    try {
      localStorage.setItem('quizme_bg_music_enabled_v1', String(enabled));
    } catch {
      // ignore
    }
    if (!enabled) {
      this.stopBgMusic();
    }
    this.notifyBgMusicListeners();
  }

  public setBgMusicTrack(track: BgMusicTrackId, autoStart = true) {
    this.bgMusicTrack = track;
    const trackMeta = BG_MUSIC_TRACKS.find((t) => t.id === track);
    if (trackMeta) {
      this.bgMusicBpm = trackMeta.defaultBpm;
    }
    try {
      localStorage.setItem('quizme_bg_music_track_v1', track);
    } catch {
      // ignore
    }
    if (this.isBgMusicPlaying || (autoStart && this.bgMusicEnabled)) {
      this.startBgMusic(track);
    } else {
      this.notifyBgMusicListeners();
    }
  }

  public setBgMusicVolume(vol: number) {
    this.bgMusicVolume = Math.max(0.05, Math.min(1, vol));
    try {
      localStorage.setItem('quizme_bg_music_vol_v1', String(this.bgMusicVolume));
    } catch {
      // ignore
    }
    this.notifyBgMusicListeners();
  }

  public setBgMusicBpm(bpm: number) {
    this.bgMusicBpm = Math.max(70, Math.min(160, bpm));
    if (this.isBgMusicPlaying) {
      this.startBgMusic(this.bgMusicTrack);
    } else {
      this.notifyBgMusicListeners();
    }
  }

  public setBgMusicTimbre(timbre: BgMusicTimbre) {
    this.bgMusicTimbre = timbre;
    this.notifyBgMusicListeners();
  }

  public startBgMusic(trackOverride?: BgMusicTrackId) {
    if (trackOverride) {
      this.bgMusicTrack = trackOverride;
    }
    if (!this.enabled || !this.bgMusicEnabled) {
      this.notifyBgMusicListeners();
      return;
    }
    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
      this.bgMusicInterval = null;
    }
    this.isBgMusicPlaying = true;
    this.bgMusicStep = 0;

    // Step duration based on BPM (8th-note steps)
    const stepMs = Math.round((60 / (this.bgMusicBpm || 108) / 2) * 1000);

    // Extended 32-step (4-section A-B-C-D) full song arrangements (Hz) inspired by Public Domain Classical & NCS Study Releases
    const patterns: Record<BgMusicTrackId, { bass: number[]; melody: number[]; pad: number[][]; counterMelody: number[] }> = {
      kahoot_minimal: {
        // Inspired by Erik Satie - Gymnopédie No. 1 (1888, Public Domain) & Lo-Fi Study Groove
        bass: [
          196.0, 0, 0, 0, 146.83, 0, 0, 0, 196.0, 0, 0, 0, 146.83, 0, 0, 0,
          164.81, 0, 0, 0, 123.47, 0, 0, 0, 146.83, 0, 164.81, 0, 196.0, 0, 146.83, 0,
        ],
        melody: [
          0, 587.33, 739.99, 659.25, 587.33, 493.88, 440.0, 493.88,
          587.33, 493.88, 440.0, 392.0, 369.99, 0, 0, 0,
          0, 587.33, 739.99, 659.25, 587.33, 493.88, 440.0, 493.88,
          587.33, 659.25, 739.99, 880.0, 739.99, 659.25, 587.33, 0,
        ],
        counterMelody: [
          293.66, 0, 369.99, 0, 293.66, 0, 329.63, 0, 293.66, 0, 369.99, 0, 293.66, 0, 246.94, 0,
          329.63, 0, 392.0, 0, 293.66, 0, 369.99, 0, 293.66, 0, 329.63, 0, 369.99, 0, 293.66, 0,
        ],
        pad: [
          [196.0, 246.94, 293.66, 369.99],
          [146.83, 220.0, 293.66, 369.99],
          [164.81, 246.94, 329.63, 392.0],
          [146.83, 220.0, 277.18, 369.99],
        ],
      },
      crystal_arcade: {
        // Inspired by J.S. Bach - Prelude in C Major, BWV 846 (1722, Public Domain)
        bass: [
          261.63, 0, 0, 0, 261.63, 0, 0, 0, 246.94, 0, 0, 0, 261.63, 0, 0, 0,
          220.0, 0, 0, 0, 293.66, 0, 0, 0, 196.0, 0, 0, 0, 261.63, 0, 0, 0,
        ],
        melody: [
          261.63, 329.63, 392.0, 523.25, 659.25, 392.0, 523.25, 659.25,
          261.63, 293.66, 440.0, 587.33, 698.46, 440.0, 587.33, 698.46,
          246.94, 293.66, 392.0, 587.33, 698.46, 392.0, 587.33, 698.46,
          261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 659.25, 523.25,
        ],
        counterMelody: [
          0, 0, 261.63, 0, 0, 0, 329.63, 0, 0, 0, 293.66, 0, 0, 0, 349.23, 0,
          0, 0, 246.94, 0, 0, 0, 293.66, 0, 0, 0, 329.63, 0, 0, 0, 261.63, 0,
        ],
        pad: [
          [261.63, 329.63, 392.0],
          [261.63, 349.23, 440.0],
          [246.94, 349.23, 392.0],
          [261.63, 329.63, 523.25],
        ],
      },
      lofi_scholar: {
        // Inspired by Claude Debussy - Clair de Lune (1905, Public Domain)
        bass: [
          277.18, 0, 0, 0, 246.94, 0, 0, 0, 220.0, 0, 0, 0, 185.0, 0, 0, 0,
          164.81, 0, 0, 0, 207.65, 0, 0, 0, 277.18, 0, 0, 0, 207.65, 0, 0, 0,
        ],
        melody: [
          0, 830.61, 698.46, 0, 622.25, 554.37, 622.25, 0,
          554.37, 466.16, 415.3, 466.16, 554.37, 0, 415.3, 0,
          369.99, 415.3, 466.16, 554.37, 622.25, 698.46, 830.61, 0,
          698.46, 622.25, 554.37, 466.16, 415.3, 0, 0, 0,
        ],
        counterMelody: [
          415.3, 0, 349.23, 0, 311.13, 0, 277.18, 0, 277.18, 0, 233.08, 0, 277.18, 0, 207.65, 0,
          277.18, 0, 311.13, 0, 349.23, 0, 415.3, 0, 349.23, 0, 311.13, 0, 277.18, 0, 207.65, 0,
        ],
        pad: [
          [277.18, 349.23, 415.3],
          [246.94, 311.13, 415.3],
          [220.0, 277.18, 349.23],
          [207.65, 277.18, 349.23],
        ],
      },
      neon_horizon: {
        // NCS Release Tribute: Tobu & Itro - "Sunburst / Cloud 9" Style Melodic Progressive House (NoCopyrightSounds Credit)
        bass: [
          174.61, 0, 174.61, 174.61, 130.81, 0, 130.81, 130.81,
          196.0, 0, 196.0, 196.0, 220.0, 0, 220.0, 196.0,
          174.61, 0, 174.61, 174.61, 130.81, 0, 130.81, 130.81,
          196.0, 0, 196.0, 220.0, 261.63, 220.0, 196.0, 174.61,
        ],
        melody: [
          698.46, 659.25, 523.25, 698.46, 783.99, 659.25, 523.25, 0,
          587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25,
          698.46, 659.25, 523.25, 698.46, 880.0, 783.99, 659.25, 523.25,
          587.33, 659.25, 783.99, 1046.5, 880.0, 783.99, 698.46, 659.25,
        ],
        counterMelody: [
          349.23, 0, 261.63, 0, 261.63, 0, 329.63, 0,
          392.0, 0, 293.66, 0, 440.0, 0, 329.63, 0,
          349.23, 0, 261.63, 0, 329.63, 0, 392.0, 0,
          392.0, 0, 440.0, 0, 523.25, 0, 392.0, 0,
        ],
        pad: [
          [174.61, 261.63, 349.23],
          [130.81, 261.63, 329.63],
          [196.0, 293.66, 392.0],
          [220.0, 329.63, 440.0],
        ],
      },
      kyoto_zen: {
        // Inspired by Frédéric Chopin - Nocturne in E-flat Major, Op. 9 No. 2 (1832, Public Domain)
        bass: [
          155.56, 0, 0, 0, 233.08, 0, 0, 0, 196.0, 0, 0, 0, 155.56, 0, 0, 0,
          174.61, 0, 0, 0, 233.08, 0, 0, 0, 155.56, 0, 0, 0, 155.56, 0, 0, 0,
        ],
        melody: [
          392.0, 0, 783.99, 739.99, 783.99, 698.46, 622.25, 466.16,
          698.46, 0, 622.25, 587.33, 523.25, 466.16, 392.0, 0,
          349.23, 466.16, 587.33, 783.99, 698.46, 622.25, 587.33, 523.25,
          622.25, 587.33, 523.25, 466.16, 622.25, 0, 0, 0,
        ],
        counterMelody: [
          311.13, 0, 392.0, 0, 349.23, 0, 311.13, 0, 293.66, 0, 349.23, 0, 311.13, 0, 233.08, 0,
          261.63, 0, 349.23, 0, 293.66, 0, 349.23, 0, 311.13, 0, 233.08, 0, 311.13, 0, 0, 0,
        ],
        pad: [
          [155.56, 233.08, 311.13],
          [174.61, 233.08, 349.23],
          [196.0, 233.08, 311.13],
          [155.56, 233.08, 392.0],
        ],
      },
      podium_funk: {
        // NCS Release Tribute: Alan Walker / Elektronomia - "Sky High & Spectre" Style Study Anthem (NoCopyrightSounds Credit)
        bass: [
          220.0, 220.0, 0, 220.0, 174.61, 174.61, 0, 174.61,
          261.63, 261.63, 0, 261.63, 196.0, 196.0, 0, 196.0,
          220.0, 220.0, 0, 220.0, 174.61, 174.61, 0, 174.61,
          261.63, 261.63, 196.0, 196.0, 220.0, 0, 220.0, 0,
        ],
        melody: [
          440.0, 523.25, 659.25, 880.0, 783.99, 659.25, 523.25, 587.33,
          659.25, 783.99, 659.25, 523.25, 587.33, 493.88, 392.0, 0,
          440.0, 523.25, 659.25, 880.0, 1046.5, 880.0, 783.99, 659.25,
          783.99, 659.25, 587.33, 523.25, 440.0, 523.25, 659.25, 440.0,
        ],
        counterMelody: [
          220.0, 0, 329.63, 0, 349.23, 0, 261.63, 0,
          261.63, 0, 329.63, 0, 293.66, 0, 246.94, 0,
          220.0, 0, 329.63, 0, 349.23, 0, 440.0, 0,
          392.0, 0, 329.63, 0, 220.0, 0, 329.63, 0,
        ],
        pad: [
          [220.0, 261.63, 329.63],
          [174.61, 261.63, 349.23],
          [261.63, 329.63, 392.0],
          [196.0, 246.94, 392.0],
        ],
      },
    };

    this.bgMusicInterval = setInterval(() => {
      if (!this.enabled || !this.bgMusicEnabled || !this.isBgMusicPlaying) return;
      const ctx = this.getContext();
      const dest = this.getMasterOutput();
      if (!ctx || !dest) return;

      try {
        const now = ctx.currentTime;
        const pat = patterns[this.bgMusicTrack] || patterns.kahoot_minimal;
        const idx = this.bgMusicStep % 32;
        const sectionIdx = Math.floor(idx / 8) % 4;
        this.bgMusicStep += 1;

        // Keep gain very minimal and soothing (scaled by bgMusicVolume)
        const baseGain = 0.032 * this.bgMusicVolume;

        // Soft bass pluck
        const bFreq = pat.bass[idx];
        if (bFreq > 0) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(bFreq, now);
          gain.gain.setValueAtTime(baseGain * 1.15, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.36);
        }

        // Melodic phrase lead
        const mFreq = pat.melody[idx];
        if (mFreq > 0) {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type =
            this.bgMusicTimbre === 'crystal'
              ? 'sine'
              : this.bgMusicTimbre === 'retro'
              ? 'square'
              : 'triangle';
          osc2.frequency.setValueAtTime(mFreq, now);
          const noteVol = this.bgMusicTimbre === 'retro' ? baseGain * 0.45 : baseGain * 0.85;
          gain2.gain.setValueAtTime(noteVol, now);
          gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
          osc2.connect(gain2);
          gain2.connect(dest);
          osc2.start(now);
          osc2.stop(now + 0.34);
        }

        // Harmonic counter-melody
        const cFreq = pat.counterMelody[idx];
        if (cFreq > 0) {
          const osc3 = ctx.createOscillator();
          const gain3 = ctx.createGain();
          osc3.type = 'sine';
          osc3.frequency.setValueAtTime(cFreq, now);
          gain3.gain.setValueAtTime(baseGain * 0.45, now);
          gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
          osc3.connect(gain3);
          gain3.connect(dest);
          osc3.start(now);
          osc3.stop(now + 0.3);
        }

        // Warm evolving chord pad on each 8-beat phrase boundary
        if (idx % 8 === 0 && pat.pad && pat.pad[sectionIdx]) {
          pat.pad[sectionIdx].forEach((pFreq) => {
            const padOsc = ctx.createOscillator();
            const padGain = ctx.createGain();
            padOsc.type = 'sine';
            padOsc.frequency.setValueAtTime(pFreq, now);
            padGain.gain.setValueAtTime(0.0001, now);
            padGain.gain.linearRampToValueAtTime(baseGain * 0.38, now + 0.45);
            padGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.1);
            padOsc.connect(padGain);
            padGain.connect(dest);
            padOsc.start(now);
            padOsc.stop(now + 2.15);
          });
        }
      } catch {
        // ignore audio errors
      }
    }, stepMs);

    this.notifyBgMusicListeners();
  }

  public stopBgMusic() {
    this.isBgMusicPlaying = false;
    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
      this.bgMusicInterval = null;
    }
    this.notifyBgMusicListeners();
  }

  public toggleBgMusic(): boolean {
    if (this.isBgMusicPlaying) {
      this.stopBgMusic();
      return false;
    } else {
      if (!this.bgMusicEnabled) {
        this.setBgMusicEnabled(true);
      }
      this.startBgMusic();
      return true;
    }
  }
}

export type BgMusicTrackId =
  | 'kahoot_minimal'
  | 'crystal_arcade'
  | 'lofi_scholar'
  | 'neon_horizon'
  | 'kyoto_zen'
  | 'podium_funk';

export type BgMusicTimbre = 'marimba' | 'crystal' | 'rhodes' | 'retro';

export interface BgMusicTrackMeta {
  id: BgMusicTrackId;
  title: string;
  subtitle: string;
  vibe: string;
  defaultBpm: number;
  accentColor: string;
  badge: string;
  durationFormatted: string;
  creditArtist: string;
  creditComposer: string;
  creditLicense: string;
  creditAttributionText: string;
  creditUrl: string;
}

export const BG_MUSIC_TRACKS: BgMusicTrackMeta[] = [
  {
    id: 'kahoot_minimal',
    title: 'Gymnopédie No. 1 (Lo-Fi Study Arrangement)',
    subtitle: 'Full-length ambient marimba & Rhodes arrangement of Erik Satie’s 1888 study classic',
    vibe: 'Playful & Focused',
    defaultBpm: 96,
    accentColor: 'from-indigo-600 to-purple-600',
    badge: 'Public Domain Classic',
    durationFormatted: '03:45 (Full Loop)',
    creditArtist: 'Erik Satie (1888) • Quiz Me! Studio Synth',
    creditComposer: 'Erik Satie (1866–1925)',
    creditLicense: 'Public Domain (CC0 1.0 Universal)',
    creditAttributionText: 'Original composition "Trois Gymnopédies - No. 1: Lent et douloureux" (1888) by Erik Satie (Public Domain).',
    creditUrl: 'https://imslp.org/wiki/3_Gymnop%C3%A9dies_(Satie,_Erik)',
  },
  {
    id: 'crystal_arcade',
    title: 'Prelude in C Major, BWV 846 (Crystal Study)',
    subtitle: 'Full 4-section arpeggiated harmonic progression from J.S. Bach’s Well-Tempered Clavier',
    vibe: 'Sparkling & Calm',
    defaultBpm: 104,
    accentColor: 'from-cyan-500 to-blue-600',
    badge: 'Public Domain Masterpiece',
    durationFormatted: '04:12 (Full Loop)',
    creditArtist: 'Johann Sebastian Bach (1722) • Crystal Chimes Synth',
    creditComposer: 'Johann Sebastian Bach (1685–1750)',
    creditLicense: 'Public Domain (No Copyright Restrictions)',
    creditAttributionText: 'Original composition "Prelude and Fugue in C major, BWV 846" (1722) by J.S. Bach (Public Domain).',
    creditUrl: 'https://musopen.org/music/2213-the-well-tempered-clavier-book-i-bwv-846-869/',
  },
  {
    id: 'lofi_scholar',
    title: 'Clair de Lune (Midnight Scholar Lounge)',
    subtitle: 'Warm electric piano chords and full melodic phrases from Suite bergamasque (1905)',
    vibe: 'Cozy & Warm',
    defaultBpm: 88,
    accentColor: 'from-amber-500 to-orange-600',
    badge: '1905 Public Domain',
    durationFormatted: '04:50 (Full Loop)',
    creditArtist: 'Claude Debussy (1905) • Lo-Fi Scholar Ensemble',
    creditComposer: 'Claude Debussy (1862–1918)',
    creditLicense: 'Public Domain (CC0 / Pre-1929 Historical Work)',
    creditAttributionText: 'Original composition "Suite bergamasque, L. 75 – III. Clair de lune" (1905) by Claude Debussy (Public Domain).',
    creditUrl: 'https://imslp.org/wiki/Suite_bergamasque,_L.75_(Debussy,_Claude)',
  },
  {
    id: 'neon_horizon',
    title: 'NCS Tribute: Sunburst & Cloud 9 (Study Mix)',
    subtitle: 'Full-length melodic progressive house study arrangement inspired by NoCopyrightSounds releases',
    vibe: 'Deep Electronic Focus',
    defaultBpm: 118,
    accentColor: 'from-fuchsia-600 to-pink-600',
    badge: 'NCS Attribution',
    durationFormatted: '03:58 (Full Loop)',
    creditArtist: 'Tobu & Itro (NCS Release Inspiration) • WebAudio Engine',
    creditComposer: 'Inspired by Tobu & Itro [NCS Release]',
    creditLicense: 'NoCopyrightSounds (NCS) Creator Credit License',
    creditAttributionText: 'Track: Tobu & Itro - Sunburst / Cloud 9 [NCS Tribute Arrangement]. Music credit provided to NoCopyrightSounds (https://ncs.io).',
    creditUrl: 'https://ncs.io/',
  },
  {
    id: 'kyoto_zen',
    title: 'Nocturne in E-Flat Major, Op. 9 No. 2',
    subtitle: 'Full tranquil nocturnal phrasing for deep reading, essay writing, and flashcard mastery',
    vibe: 'Quiet & Minimal',
    defaultBpm: 82,
    accentColor: 'from-emerald-500 to-teal-600',
    badge: '1832 Public Domain',
    durationFormatted: '04:30 (Full Loop)',
    creditArtist: 'Frédéric Chopin (1832) • Quiet Garden Synth',
    creditComposer: 'Frédéric Chopin (1810–1849)',
    creditLicense: 'Public Domain (CC0 1.0 Universal)',
    creditAttributionText: 'Original composition "Nocturnes, Op. 9 – No. 2 in E-flat major" (1832) by Frédéric Chopin (Public Domain).',
    creditUrl: 'https://imslp.org/wiki/Nocturnes,_Op.9_(Chopin,_Fr%C3%A9d%C3%A9ric)',
  },
  {
    id: 'podium_funk',
    title: 'NCS Tribute: Sky High & Spectre (Arena Mix)',
    subtitle: 'High-energy full electronic progression for speed rounds, Math Quiz, and One by One chains',
    vibe: 'High Energy',
    defaultBpm: 126,
    accentColor: 'from-rose-500 to-amber-500',
    badge: 'NCS Attribution',
    durationFormatted: '03:50 (Full Loop)',
    creditArtist: 'Elektronomia (NCS Release Inspiration) • Quiz Me! Synth',
    creditComposer: 'Inspired by Elektronomia - Sky High [NCS Release]',
    creditLicense: 'NoCopyrightSounds (NCS) Creator Credit License',
    creditAttributionText: 'Track: Elektronomia - Sky High [NCS Tribute Arrangement]. Music credit provided to NoCopyrightSounds (https://ncs.io/SkyHigh).',
    creditUrl: 'https://ncs.io/SkyHigh',
  },
];

export const soundFx = new SoundEngine();

