import React, { useState, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Radio,
  Disc,
  Zap,
  Flame,
  Trophy,
  Award,
  Headphones,
  CloudRain,
  Waves,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  soundFx,
  BG_MUSIC_TRACKS,
  BgMusicTrackId,
  BgMusicTimbre,
} from '../utils/audio';
import { useTheme } from '../context/ThemeContext';

interface MusicStudioViewProps {
  onOpenSettings?: () => void;
}

export const MusicStudioView: React.FC<MusicStudioViewProps> = ({ onOpenSettings }) => {
  const { currentAccentConfig } = useTheme();

  const [isPlaying, setIsPlaying] = useState<boolean>(soundFx.isBgMusicPlaying);
  const [bgMusicEnabled, setBgMusicEnabled] = useState<boolean>(soundFx.bgMusicEnabled);
  const [activeTrack, setActiveTrack] = useState<BgMusicTrackId>(soundFx.bgMusicTrack);
  const [volume, setVolume] = useState<number>(soundFx.bgMusicVolume);
  const [bpm, setBpm] = useState<number>(soundFx.bgMusicBpm);
  const [timbre, setTimbre] = useState<BgMusicTimbre>(soundFx.bgMusicTimbre);
  const [ambientMode, setAmbientMode] = useState<'off' | 'alpha432' | 'rain' | 'pinknoise'>(
    soundFx.isFocusHumming ? soundFx.ambientMode : 'off'
  );
  const [activeSoundPad, setActiveSoundPad] = useState<string | null>(null);

  useEffect(() => {
    const unsub = soundFx.subscribeBgMusic(() => {
      setIsPlaying(soundFx.isBgMusicPlaying);
      setBgMusicEnabled(soundFx.bgMusicEnabled);
      setActiveTrack(soundFx.bgMusicTrack);
      setVolume(soundFx.bgMusicVolume);
      setBpm(soundFx.bgMusicBpm);
      setTimbre(soundFx.bgMusicTimbre);
    });
    return () => unsub();
  }, []);

  const currentTrackMeta =
    BG_MUSIC_TRACKS.find((t) => t.id === activeTrack) || BG_MUSIC_TRACKS[0];

  const handleTogglePlay = () => {
    soundFx.playClick();
    soundFx.toggleBgMusic();
  };

  const handleSelectTrack = (id: BgMusicTrackId) => {
    soundFx.playSelect();
    if (!bgMusicEnabled) {
      soundFx.setBgMusicEnabled(true);
    }
    soundFx.setBgMusicTrack(id, true);
  };

  const handlePrevNextTrack = (dir: -1 | 1) => {
    soundFx.playClick();
    const idx = BG_MUSIC_TRACKS.findIndex((t) => t.id === activeTrack);
    const nextIdx = (idx + dir + BG_MUSIC_TRACKS.length) % BG_MUSIC_TRACKS.length;
    handleSelectTrack(BG_MUSIC_TRACKS[nextIdx].id);
  };

  const handleToggleBgMusicSetting = () => {
    soundFx.playClick();
    const next = !bgMusicEnabled;
    soundFx.setBgMusicEnabled(next);
    if (next) {
      soundFx.startBgMusic(activeTrack);
    }
  };

  const handleAmbientSelect = (mode: 'off' | 'alpha432' | 'rain' | 'pinknoise') => {
    soundFx.playClick();
    if (mode === 'off') {
      soundFx.stopFocusHum();
      setAmbientMode('off');
    } else {
      soundFx.startFocusHum(mode);
      setAmbientMode(mode);
    }
  };

  const triggerSoundPad = (id: string, fn: () => void) => {
    setActiveSoundPad(id);
    fn();
    setTimeout(() => setActiveSoundPad(null), 380);
  };

  const eqBars = [
    45, 75, 60, 92, 50, 84, 96, 65, 78, 55, 88, 70, 95, 62, 80, 48, 86, 72, 90, 58, 76, 64, 52, 40,
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-3.5 sm:py-4 space-y-4 animate-in fade-in duration-300">
      {/* Live Visualizer Stage Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-4 sm:p-6 shadow-lg">
        {/* Decorative Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-fuchsia-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left: Spinning Vinyl & Track Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr ${currentTrackMeta.accentColor} p-1 shadow-2xl border-2 border-white/20 flex items-center justify-center ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '6s' }}
              >
                <div className="w-full h-full rounded-full bg-slate-950/90 flex items-center justify-center relative">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-400 to-fuchsia-400 flex items-center justify-center shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-slate-950" />
                  </div>
                  <Disc className="w-14 h-14 text-white/15 absolute" />
                </div>
              </div>
              {isPlaying && (
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-md">
                  LIVE
                </span>
              )}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center flex-wrap gap-2 text-xs text-indigo-200/90">
                <span className="font-bold text-emerald-300">
                  {isPlaying ? '● Playing' : bgMusicEnabled ? '○ Ready' : '✕ Muted in Settings'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{currentTrackMeta.badge}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{bpm} BPM</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{timbre} Sound</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {currentTrackMeta.title}
              </h1>

              <p className="text-xs text-indigo-100/80 max-w-xl leading-relaxed">
                {currentTrackMeta.subtitle}
              </p>

              {/* Transport Controls */}
              <div className="pt-1.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrevNextTrack(-1)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer"
                  title="Previous Track"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all cursor-pointer shadow-md ${
                    isPlaying
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause Music</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Play Music</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handlePrevNextTrack(1)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer"
                  title="Next Track"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Minimal Background Music Enable / Remove Toggle */}
                <button
                  type="button"
                  onClick={handleToggleBgMusicSetting}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                    bgMusicEnabled
                      ? 'bg-indigo-500/25 border-indigo-400/50 text-indigo-100 hover:bg-indigo-500/35'
                      : 'bg-rose-500/25 border-rose-400/50 text-rose-200 hover:bg-rose-500/35'
                  }`}
                  title="Turn background music on or off across the app"
                >
                  {bgMusicEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-300" />
                      <span>Background Music: ON</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4 text-rose-300" />
                      <span>Background Music: OFF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Live Multi-Band Spectrum Visualizer */}
          <div className="w-full lg:w-64 bg-slate-950/60 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between gap-2.5 backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] font-bold text-indigo-200">
              <span className="flex items-center gap-1.5">
                <Radio className={`w-3.5 h-3.5 ${isPlaying ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                <span>Visualizer</span>
              </span>
              <span className="font-mono tabular-nums text-emerald-300">
                {Math.round(volume * 100)}% Volume
              </span>
            </div>

            <div className="h-20 flex items-end justify-between gap-1 pt-1 px-1">
              {eqBars.map((heightPct, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-full transition-all duration-300 ${
                    isPlaying
                      ? 'bg-gradient-to-t from-indigo-500 via-purple-400 to-emerald-300 animate-eq-bar'
                      : 'bg-slate-800'
                  }`}
                  style={{
                    height: isPlaying ? `${heightPct}%` : '14%',
                    animationDelay: `${(i % 6) * 0.12}s`,
                    animationDuration: `${Math.max(0.4, (60 / bpm) * (0.7 + (i % 4) * 0.15))}s`,
                  }}
                />
              ))}
            </div>

            {/* Volume Quick Slider */}
            <div className="flex items-center gap-2.5 pt-1">
              <Volume2 className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => soundFx.setBgMusicVolume(parseFloat(e.target.value))}
                aria-label="Background Music Volume"
                className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 6 Gamified Soundtracks + Live Synth & Ambient Mixer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left 7 Cols: Curated Gamified & Study Soundtracks */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-indigo-500" />
                <span>Study & Quiz Music Tracks</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gentle background loops that keep playing while you study or take a quiz
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BG_MUSIC_TRACKS.map((track) => {
              const isSelected = activeTrack === track.id;
              const isTrackActivePlaying = isSelected && isPlaying;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => handleSelectTrack(track.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 group ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  <div className="space-y-2 w-full">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                        {track.badge} · {track.durationFormatted}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${track.accentColor} text-white flex items-center justify-center shadow-xs shrink-0`}
                      >
                        {isTrackActivePlaying ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      {track.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {track.subtitle}
                    </p>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-[11px] space-y-0.5">
                      <div className="font-bold text-slate-700 dark:text-slate-200">
                        🎵 Credit: {track.creditArtist}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        License: {track.creditLicense}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between w-full text-[11px] font-bold">
                    <span className="text-slate-500 dark:text-slate-400">Vibe: {track.vibe} · {track.defaultBpm} BPM</span>
                    <span
                      className={
                        isTrackActivePlaying
                          ? 'text-emerald-600 dark:text-emerald-400 font-black'
                          : 'text-indigo-600 dark:text-indigo-400'
                      }
                    >
                      {isTrackActivePlaying ? 'Playing Now' : isSelected ? 'Selected' : 'Select Track →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Official Song Credits & Public Domain / NoCopyrightSounds Attribution Box */}
          <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Official Music Credits & Public Domain / NCS Attribution</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                100% Royalty-Free & Properly Credited
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Now Playing Credit:</strong> {currentTrackMeta.creditAttributionText} ({currentTrackMeta.creditLicense}).
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {BG_MUSIC_TRACKS.map((t) => (
                <div key={t.id} className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800">
                  <div className="font-bold text-slate-800 dark:text-slate-200">{t.title}</div>
                  <div>Composer/Inspiration: {t.creditComposer}</div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400">{t.creditLicense}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live Synth Customizer, Ambient Layering & Kahoot! Soundboard */}
        <div className="lg:col-span-5 space-y-5">
          {/* Synth & Tempo Customizer Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>Live Tempo & Synth Studio</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  soundFx.setBgMusicBpm(currentTrackMeta.defaultBpm);
                  soundFx.setBgMusicTimbre('marimba');
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Tempo BPM Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-300">Groove Tempo (BPM)</span>
                <span className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                  {bpm} BPM
                </span>
              </div>
              <input
                type="range"
                min={75}
                max={150}
                step={1}
                value={bpm}
                onChange={(e) => soundFx.setBgMusicBpm(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[
                  { label: '85 Chill', val: 85 },
                  { label: '108 Study', val: 108 },
                  { label: '124 Groove', val: 124 },
                  { label: '142 Turbo', val: 142 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      soundFx.setBgMusicBpm(preset.val);
                    }}
                    className={`py-1 px-2 rounded-lg text-[10px] font-extrabold border transition-colors cursor-pointer ${
                      bpm === preset.val
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Synth Instrument Timbre */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                Instrument Sound
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'marimba', label: 'Warm Marimba', desc: 'Soft Wood Pluck' },
                    { id: 'crystal', label: 'Crystal Chimes', desc: 'Bright Bell Tone' },
                    { id: 'rhodes', label: 'Lo-Fi Keys', desc: 'Mellow Electric Piano' },
                    { id: 'retro', label: 'Retro Arcade', desc: 'Classic 8-Bit Sound' },
                  ] as const
                ).map((inst) => (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      soundFx.setBgMusicTimbre(inst.id);
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      timbre === inst.id
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-extrabold">{inst.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{inst.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Ambient Focus Layering */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Layer Ambient Soundscape
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {ambientMode === 'off' ? 'None' : `Active: ${ambientMode.toUpperCase()}`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'off' as const, label: 'Off', icon: VolumeX },
                  { id: 'rain' as const, label: 'Soft Rain', icon: CloudRain },
                  { id: 'alpha432' as const, label: '432Hz Alpha', icon: Waves },
                  { id: 'pinknoise' as const, label: 'Warm Studio', icon: Headphones },
                ].map((layer) => {
                  const Icon = layer.icon;
                  const active = ambientMode === layer.id;
                  return (
                    <button
                      key={layer.id}
                      type="button"
                      onClick={() => handleAmbientSelect(layer.id)}
                      className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="truncate">{layer.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Soundboard */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Fun Soundboard</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tap any button to play fun sound effects
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                {
                  id: 'gong',
                  label: 'Lobby Gong',
                  icon: Disc,
                  color: 'bg-rose-500 hover:bg-rose-600 text-white',
                  play: () => soundFx.playKahootGong(),
                },
                {
                  id: 'streak',
                  label: 'Streak Fire!',
                  icon: Flame,
                  color: 'bg-amber-500 hover:bg-amber-600 text-white',
                  play: () => soundFx.playKahootStreakFire(),
                },
                {
                  id: 'powerup',
                  label: '2x Power-Up',
                  icon: Zap,
                  color: 'bg-indigo-600 hover:bg-indigo-700 text-white',
                  play: () => soundFx.playKahootPowerUp(),
                },
                {
                  id: 'drumroll',
                  label: 'Drumroll',
                  icon: Radio,
                  color: 'bg-purple-600 hover:bg-purple-700 text-white',
                  play: () => soundFx.playKahootDrumroll(),
                },
                {
                  id: 'podium',
                  label: 'Podium Trophy',
                  icon: Trophy,
                  color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
                  play: () => soundFx.playBadgeUnlock(),
                },
                {
                  id: 'levelup',
                  label: 'Level Up!',
                  icon: Award,
                  color: 'bg-blue-600 hover:bg-blue-700 text-white',
                  play: () => soundFx.playLevelUp(),
                },
              ].map((pad) => {
                const Icon = pad.icon;
                const isPressed = activeSoundPad === pad.id;
                return (
                  <button
                    key={pad.id}
                    type="button"
                    onClick={() => triggerSoundPad(pad.id, pad.play)}
                    className={`p-3 rounded-2xl font-extrabold text-xs flex flex-col items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                      pad.color
                    } ${isPressed ? 'scale-95 ring-4 ring-white/40' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="whitespace-nowrap">{pad.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
