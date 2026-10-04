import React, { useState, useEffect } from 'react';
import {
  Users,
  Play,
  Sparkles,
  Trophy,
  Clock,
  Flame,
  ArrowRight,
  Radio,
  Layers,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  RefreshCw,
  Dices,
  Zap,
  Crown,
  Volume2,
} from 'lucide-react';
import { QuizResponse } from '../../types/quiz';
import { LiveSessionData } from '../../types/liveSession';
import {
  createLiveSession,
  joinLiveSession,
  fetchActiveLiveRooms,
  ActiveLiveRoomSummary,
} from '../../services/liveSession';
import { PRESET_TOPICS } from '../../data/presets';
import { useAuth } from '../../context/AuthContext';
import { soundFx } from '../../utils/audio';

interface LiveSessionHubProps {
  availableQuizzes: QuizResponse[];
  onJoinRoom: (
    roomCode: string,
    sessionData: LiveSessionData,
    isHost: boolean,
    participantId: string
  ) => void;
  onCancel: () => void;
}

const AVATAR_COLORS = [
  { id: 'rose', label: 'Triangle Red', bg: 'bg-[#e21b3c]', shape: '▲' },
  { id: 'indigo', label: 'Diamond Blue', bg: 'bg-[#1368ce]', shape: '◆' },
  { id: 'amber', label: 'Circle Gold', bg: 'bg-[#d89e00]', shape: '●' },
  { id: 'emerald', label: 'Square Green', bg: 'bg-[#26890c]', shape: '■' },
  { id: 'violet', label: 'Kahoot Purple', bg: 'bg-[#46178f]', shape: '★' },
  { id: 'cyan', label: 'Cyber Cyan', bg: 'bg-[#0891b2]', shape: '✦' },
];

const KAHOOT_FUN_NICKNAMES = [
  'TurboOwl',
  'CosmicTiger',
  'QuantumFox',
  'BlazingPanda',
  'ApexDragon',
  'HyperFalcon',
  'NeonDolphin',
  'VelvetRaven',
  'SolarPhoenix',
  'AstroLeopard',
  'ThunderBadger',
  'CrystalLynx',
  'ShadowGriffin',
  'PixelCheetah',
  'GoldenNarwhal',
  'SonicOtter',
];

export const LiveSessionHub: React.FC<LiveSessionHubProps> = ({
  availableQuizzes,
  onJoinRoom,
}) => {
  const { user, userProfile } = useAuth();
  const [mode, setMode] = useState<'join' | 'host'>('join');

  // Join State
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [displayName, setDisplayName] = useState(
    userProfile?.displayName || user?.displayName || ''
  );
  const [selectedColor, setSelectedColor] = useState('rose');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeRooms, setActiveRooms] = useState<ActiveLiveRoomSummary[]>([]);
  const [isRefreshingRooms, setIsRefreshingRooms] = useState(false);

  // Host State
  const allQuizzes = React.useMemo(() => {
    const presetList = PRESET_TOPICS.map((p) => p.prebuiltStudentQuiz);
    const combined = [...availableQuizzes, ...presetList];
    const seen = new Set<string>();
    return combined.filter((q) => {
      if (!q || !q.quiz_title || seen.has(q.quiz_title)) return false;
      seen.add(q.quiz_title);
      return true;
    });
  }, [availableQuizzes]);

  const [selectedQuizIndex, setSelectedQuizIndex] = useState(0);
  const [timePerQuestion, setTimePerQuestion] = useState(20);
  const [streakBonuses, setStreakBonuses] = useState(true);
  const [includeAiClassmates, setIncludeAiClassmates] = useState(true);

  useEffect(() => {
    if (!displayName && (userProfile?.displayName || user?.displayName)) {
      setDisplayName(userProfile?.displayName || user?.displayName || '');
    }
  }, [userProfile, user, displayName]);

  const loadActiveRooms = async () => {
    setIsRefreshingRooms(true);
    try {
      const rooms = await fetchActiveLiveRooms();
      setActiveRooms(rooms);
    } finally {
      setIsRefreshingRooms(false);
    }
  };

  useEffect(() => {
    loadActiveRooms();
    const interval = setInterval(loadActiveRooms, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSpinNickname = () => {
    soundFx.playPop();
    const pick = KAHOOT_FUN_NICKNAMES[Math.floor(Math.random() * KAHOOT_FUN_NICKNAMES.length)];
    const num = Math.floor(10 + Math.random() * 89);
    setDisplayName(`${pick}${num}`);
  };

  const handleCreateRoom = async (customPin?: string, autoStartInstant = false) => {
    const targetQuiz = allQuizzes[selectedQuizIndex] || PRESET_TOPICS[0].prebuiltStudentQuiz;
    if (!targetQuiz) {
      setErrorMsg('Please select a quiz to host.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    soundFx.playClick();

    try {
      const hostId = user?.uid || `host_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const hostName =
        displayName.trim() || userProfile?.displayName || user?.displayName || 'Quiz Master';

      const { roomCode, session } = await createLiveSession(
        targetQuiz,
        {
          id: hostId,
          name: hostName,
          avatar: userProfile?.photoURL || user?.photoURL || undefined,
        },
        {
          timePerQuestion,
          showLeaderboardAfterEach: true,
          streakBonusesEnabled: streakBonuses,
          allowLateJoin: true,
        },
        {
          customRoomCode: customPin,
          includeAiClassmates: includeAiClassmates || autoStartInstant,
        }
      );

      soundFx.playComplete();
      onJoinRoom(roomCode, session, true, hostId);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create live room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e?: React.FormEvent, overridePin?: string) => {
    if (e) e.preventDefault();
    const targetPin = (overridePin || roomCodeInput).trim();
    if (targetPin.length < 4) {
      setErrorMsg('Please enter a valid 6-digit Game PIN.');
      return;
    }
    const cleanName = displayName.trim() || 'TurboScholar';

    setIsLoading(true);
    setErrorMsg(null);
    soundFx.playClick();

    try {
      const participantId =
        user?.uid || `student_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const result = await joinLiveSession(targetPin, {
        id: participantId,
        name: cleanName,
        avatarColor: selectedColor,
        role: 'student',
      });

      if (!result.success || !result.session) {
        setErrorMsg(result.error || 'Could not join room.');
        setIsLoading(false);
        return;
      }

      soundFx.playComplete();
      onJoinRoom(targetPin.toUpperCase(), result.session, false, participantId);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error joining room.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-spring-pop">
      {/* Iconic Kahoot!-Style Purple Stage Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#46178f] via-[#311068] to-[#1f0947] text-white p-6 sm:p-10 shadow-2xl border-2 border-purple-400/30">
        {/* Floating Kahoot Geometric Shapes Backdrop */}
        <div className="absolute -top-10 -left-10 w-44 h-44 bg-[#e21b3c]/25 rotate-12 rounded-3xl blur-xl pointer-events-none animate-float-slow" />
        <div className="absolute top-6 right-12 w-36 h-36 bg-[#1368ce]/30 rotate-45 rounded-2xl blur-xl pointer-events-none animate-pulse-glow" />
        <div className="absolute -bottom-12 right-1/3 w-52 h-52 bg-[#d89e00]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-6 left-1/4 w-32 h-32 bg-[#26890c]/25 rounded-2xl blur-xl pointer-events-none" />

        {/* Decorative Geometric Shape Watermarks */}
        <div className="hidden lg:flex items-center gap-3 absolute top-6 right-8 opacity-90">
          <div className="w-10 h-10 rounded-xl bg-[#e21b3c] flex items-center justify-center text-white font-black text-lg shadow-lg rotate-[-8deg]">
            ▲
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1368ce] flex items-center justify-center text-white font-black text-lg shadow-lg rotate-[6deg]">
            ◆
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#d89e00] flex items-center justify-center text-white font-black text-lg shadow-lg rotate-[-4deg]">
            ●
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#26890c] flex items-center justify-center text-white font-black text-lg shadow-lg rotate-[8deg]">
            ■
          </div>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-amber-300 text-xs font-black uppercase tracking-widest">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Kahoot! Style Live Arena • Real-Time Showdown</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
              QuizMe! <span className="text-amber-400">LIVE!</span> Arena
            </h1>

            <p className="text-purple-100/90 text-sm sm:text-base leading-relaxed font-medium">
              Lock in your answers with the iconic <span className="font-black text-white">▲ ◆ ● ■</span> geometric controller, trigger <span className="font-black text-amber-300">2x Double Points &amp; 50/50 Power-Ups</span>, build blazing answer streaks, and climb the 3-2-1 Spotlight Podium!
            </p>
          </div>

          {/* Mode Switcher Tabs (Join via PIN vs Host Arena) */}
          <div className="flex bg-black/35 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 self-start shrink-0">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setMode('join');
                setErrorMsg(null);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                mode === 'join'
                  ? 'bg-white text-[#46178f] shadow-lg'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Enter Game PIN</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setMode('host');
                setErrorMsg(null);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                mode === 'host'
                  ? 'bg-[#26890c] text-white shadow-lg'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>Host Live Game</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-800 dark:text-rose-200 text-sm font-bold animate-spring-pop">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          {mode === 'join' && roomCodeInput.trim().length >= 4 && (
            <button
              type="button"
              onClick={() => handleCreateRoom(roomCodeInput.trim(), true)}
              className="px-4 py-2 rounded-xl bg-[#46178f] hover:bg-[#35116d] text-white text-xs font-black shrink-0 cursor-pointer shadow-md"
            >
              Launch PIN #{roomCodeInput.trim()} Instantly →
            </button>
          )}
        </div>
      )}

      {mode === 'join' ? (
        /* ================= KAHOOT! PIN ENTRY & INSTANT ARENA VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Iconic Kahoot! Game PIN Card */}
          <form
            onSubmit={(e) => handleJoinRoom(e)}
            className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-800 shadow-xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#46178f] text-white flex items-center justify-center font-black text-xl shadow-md">
                  #
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Enter Game PIN
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Type the 6-digit PIN from the host screen or launch a solo arena below
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCreateRoom(undefined, true)}
                disabled={isLoading}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-sm cursor-pointer flex items-center gap-1.5"
                title="Jump straight into a Kahoot! battle with AI challengers!"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Instant Solo Arena</span>
              </button>
            </div>

            {/* Giant Kahoot-style PIN Box */}
            <div className="p-5 rounded-3xl bg-slate-100 dark:bg-slate-800/90 border-2 border-slate-300 dark:border-slate-700 space-y-3">
              <label className="block text-center text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                6-Digit Game PIN
              </label>
              <input
                type="text"
                maxLength={6}
                value={roomCodeInput}
                onChange={(e) =>
                  setRoomCodeInput(e.target.value.replace(/[^0-9a-zA-Z]/g, '').toUpperCase())
                }
                placeholder="123456"
                className="w-full text-center text-4xl sm:text-5xl font-black tracking-[0.28em] py-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 focus:border-[#46178f] dark:focus:border-purple-400 focus:outline-none text-slate-900 dark:text-white font-mono shadow-inner"
              />
            </div>

            {/* Player Nickname + Kahoot! Randomizer Spinner */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Player Nickname
                </label>
                <button
                  type="button"
                  onClick={handleSpinNickname}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-[#46178f] dark:text-purple-400 hover:underline cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>Spin Fun Nickname</span>
                </button>
              </div>
              <input
                type="text"
                maxLength={24}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter nickname or spin..."
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-extrabold text-sm text-slate-900 dark:text-white focus:border-[#46178f] focus:outline-none"
              />
            </div>

            {/* Kahoot! Shape Team Badge Color Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Your Arena Emblem
              </label>
              <div className="grid grid-cols-6 gap-2.5">
                {AVATAR_COLORS.map((c) => {
                  const active = selectedColor === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setSelectedColor(c.id);
                      }}
                      className={`h-12 rounded-2xl ${c.bg} text-white font-black text-lg flex items-center justify-center transition-all cursor-pointer shadow-md ${
                        active
                          ? 'ring-4 ring-offset-2 ring-[#46178f] dark:ring-offset-slate-900 scale-105'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                      title={c.label}
                    >
                      {c.shape}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || roomCodeInput.trim().length < 4}
              className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-black text-base shadow-[0_6px_0_#0f172a] dark:shadow-[0_6px_0_#94a3b8] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Entering Arena...' : 'Enter Kahoot! Lobby'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Right 5 Cols: Open Live Arenas Radar + Kahoot! Features Card */}
          <div className="lg:col-span-5 space-y-5">
            {/* Active Live Rooms List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Open Live Arenas ({activeRooms.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    loadActiveRooms();
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingRooms ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {activeRooms.length === 0 ? (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No public PIN lobbies waiting right now. Start an instant Kahoot! match with AI Challengers or host a room!
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCreateRoom(undefined, true)}
                    className="w-full py-3 px-4 rounded-xl bg-[#46178f] hover:bg-[#35116d] text-white text-xs font-black shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Launch Quick Battle vs AI Squad</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {activeRooms.map((room) => (
                    <div
                      key={room.roomCode}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 hover:border-purple-400 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-[#46178f] text-white font-mono font-black text-xs">
                            PIN: {room.roomCode}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            • {room.participantCount} Players
                          </span>
                        </div>
                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate mt-1">
                          {room.quizTitle}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRoomCodeInput(room.roomCode);
                          handleJoinRoom(undefined, room.roomCode);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-[#26890c] hover:bg-[#1f7009] text-white text-xs font-black shrink-0 cursor-pointer shadow-xs"
                      >
                        Join →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kahoot! Arena Rules & Power-Ups Guide */}
            <div className="bg-gradient-to-br from-[#46178f]/10 via-indigo-500/5 to-amber-500/10 rounded-3xl p-6 border border-purple-200/80 dark:border-purple-800/50 space-y-4">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  What&apos;s New in Kahoot! Live Battle
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800">
                  <div className="font-black text-[#e21b3c] flex items-center gap-1">
                    <span>▲ ◆ ● ■</span>
                    <span>Shape Pad</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    3D tactile color tiles with keys 1-4
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800">
                  <div className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <span>⚡ 2x &amp; 50/50</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Strategic in-round power-ups
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800">
                  <div className="font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Groove Synth</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Live lobby &amp; countdown music
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800">
                  <div className="font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span>🏆 3-2-1 Podium</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Bar-chart reveals &amp; spotlight finale
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= HOST KAHOOT! ROOM CONFIGURATION ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quiz Selector (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-[#46178f] dark:text-purple-400" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  1. Choose Kahoot! Question Deck
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {allQuizzes.length} Decks Ready
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {allQuizzes.map((quiz, idx) => {
                const isSelected = selectedQuizIndex === idx;
                return (
                  <button
                    key={`${quiz.quiz_title}_${idx}`}
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setSelectedQuizIndex(idx);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-[#46178f] bg-purple-50/70 dark:bg-purple-950/40 shadow-sm'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-white truncate">
                          {quiz.quiz_title}
                        </span>
                        {idx === 0 && availableQuizzes.length > 0 && (
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-md bg-[#46178f] text-white">
                            Active Studio Quiz
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {quiz.summary}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-slate-400">
                        <span>{quiz.questions?.length || 5} Questions</span>
                        <span>•</span>
                        <span>{quiz.difficulty || 'Intermediate'}</span>
                      </div>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#46178f] text-white'
                          : 'border-2 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Game Rules & Launch Button (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border-2 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  2. Arena Rules &amp; Modifiers
                </h2>
              </div>

              {/* Time Per Question */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Countdown Timer per Question</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 15, 20, 30].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setTimePerQuestion(sec);
                      }}
                      className={`py-2.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                        timePerQuestion === sec
                          ? 'bg-[#46178f] text-white border-[#46178f] shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Answer Streak Bonus Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-orange-500 shrink-0" />
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      Kahoot! Answer Streak Fire
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Awards +100 to +500 bonus points for consecutive correct answers
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setStreakBonuses(!streakBonuses);
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    streakBonuses ? 'bg-[#26890c] justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* AI Classmates Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#46178f] dark:text-purple-400 shrink-0" />
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      Include AI Challenger Squad
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Populates the lobby with competitive AI scholars so you can play immediately
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setIncludeAiClassmates(!includeAiClassmates);
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    includeAiClassmates ? 'bg-[#46178f] justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCreateRoom()}
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-[#26890c] hover:bg-[#1f7009] text-white font-black text-base shadow-[0_6px_0_#154d06] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isLoading ? 'Creating Kahoot! Lobby...' : 'Create Game PIN & Open Lobby'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
