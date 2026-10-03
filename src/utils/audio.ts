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
}

export const soundFx = new SoundEngine();
