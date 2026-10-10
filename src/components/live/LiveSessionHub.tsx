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
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-600', shape: 'A' },
  { id: 'violet', label: 'Violet', bg: 'bg-violet-600', shape: 'B' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-600', shape: 'C' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500', shape: 'D' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-600', shape: '★' },
  { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-600', shape: '✦' },
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
  onCancel,
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
    const targetQuiz = allQuizzes[selectedQuizIndex] || allQuizzes[0] || PRESET_TOPICS[0]?.prebuiltStudentQuiz;
    if (!targetQuiz) {
      soundFx.playWrong();
      setErrorMsg('No quizzes available — please create or upload a quiz in the Studio first.');
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 animate-in fade-in duration-300">
      {/* Sleek QuizMe Live Header Card */}
      <div className="comic-tab-hero rounded-3xl p-5 sm:p-7">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="comic-badge px-2.5 py-0.5 rounded-lg bg-amber-300 text-slate-950 border-2 border-slate-950 text-[10px] font-black uppercase tracking-wider">
                ISSUE #04 · LIVE ARENA
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/60 border border-white/25 text-cyan-200 text-[11px] font-black">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Multiplayer &amp; Solo Arena</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-xs">
              Live Quiz Battles
            </h1>

            <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed font-medium">
              Play live with friends using a 6-digit room code, use <span className="font-black text-amber-300">2x Boost &amp; 50/50</span> helpers, build answer streaks, and climb the podium!
            </p>
          </div>

          {/* Mode Switcher Tabs (Join via Code vs Host Room) */}
          <div className="flex bg-slate-950/65 p-1 rounded-2xl border-2 border-slate-950 self-start lg:self-center shrink-0">
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setMode('join');
                setErrorMsg(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                mode === 'join'
                  ? 'bg-amber-300 text-slate-950 border-2 border-slate-950 shadow-xs'
                  : 'text-white/85 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Join with Code</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setMode('host');
                setErrorMsg(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                mode === 'host'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Host a Game</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-bold">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          {mode === 'join' && roomCodeInput.trim().length >= 4 && (
            <button
              type="button"
              onClick={() => handleCreateRoom(roomCodeInput.trim(), true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shrink-0 cursor-pointer shadow-xs"
            >
              Start Room #{roomCodeInput.trim()} Now →
            </button>
          )}
        </div>
      )}

      {mode === 'join' ? (
        /* ================= ROOM CODE ENTRY & INSTANT ARENA VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left 7 Cols: Room Code Entry Card */}
          <form
            onSubmit={(e) => handleJoinRoom(e)}
            className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-xs">
                  #
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Enter Room Code
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Type the 6-digit code from the host or start a quick solo match
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCreateRoom(undefined, true)}
                disabled={isLoading}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-2xs cursor-pointer flex items-center gap-1.5"
                title="Jump straight into a match with AI players!"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Quick Solo Match</span>
              </button>
            </div>

            {/* Room Code Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block text-center text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                6-Digit Room Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={roomCodeInput}
                onChange={(e) =>
                  setRoomCodeInput(e.target.value.replace(/[^0-9a-zA-Z]/g, '').toUpperCase())
                }
                placeholder="123456"
                className="w-full text-center text-3xl sm:text-4xl font-black tracking-[0.25em] py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:outline-none text-slate-900 dark:text-white font-mono shadow-inner"
              />
            </div>

            {/* Player Nickname + Randomizer */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Your Nickname
                </label>
                <button
                  type="button"
                  onClick={handleSpinNickname}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>Random Nickname</span>
                </button>
              </div>
              <input
                type="text"
                maxLength={24}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name or roll a nickname..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Badge Color Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Choose Your Badge Color
              </label>
              <div className="grid grid-cols-6 gap-2">
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
                      className={`h-10 rounded-xl ${c.bg} text-white font-black text-sm flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                        active
                          ? 'ring-2 ring-offset-2 ring-indigo-600 dark:ring-offset-slate-900 scale-105'
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
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Joining Room...' : 'Join Live Room'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Right 5 Cols: Open Live Rooms + Features Card */}
          <div className="lg:col-span-5 space-y-4">
            {/* Active Live Rooms List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Open Rooms ({activeRooms.length})
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
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No open rooms waiting right now. Start a quick match with AI players or host your own room!
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCreateRoom(undefined, true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Start Quick Match vs AI Players</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {activeRooms.map((room) => (
                    <div
                      key={room.roomCode}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 hover:border-indigo-400 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono font-black text-xs">
                            Code: {room.roomCode}
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
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shrink-0 cursor-pointer shadow-2xs"
                      >
                        Join →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Battle Features Guide */}
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl p-5 border border-indigo-200/70 dark:border-indigo-800/50 space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  How Live Battles Work
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                  <div className="font-black text-indigo-600 dark:text-indigo-400">
                    Fast Answers
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Answer quickly with keys 1–4 for bonus points
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                  <div className="font-black text-amber-600 dark:text-amber-400">
                    ⚡ Boosters
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Use 2x Points, 50/50, and Streak Shield
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                  <div className="font-black text-violet-600 dark:text-violet-400 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Live Music</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Optional lobby &amp; countdown music
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                  <div className="font-black text-emerald-600 dark:text-emerald-400">
                    🏆 Top 3 Podium
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    See live vote charts &amp; final rankings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= HOST ROOM CONFIGURATION ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Quiz Selector (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  1. Pick a Quiz to Host
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {allQuizzes.length} Quizzes Ready
              </span>
            </div>

            {allQuizzes.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-center space-y-2.5">
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  No quizzes available
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  You don't have any saved quizzes to host yet. Create a quiz in the AI Studio first!
                </p>
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black cursor-pointer"
                >
                  + Create a Quiz in Studio
                </button>
              </div>
            ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
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
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-2xs'
                        : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-white truncate">
                          {quiz.quiz_title}
                        </span>
                        {idx === 0 && availableQuizzes.length > 0 && (
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-md bg-indigo-600 text-white">
                            Current Quiz
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {quiz.summary}
                      </p>
                      <div className="flex items-center gap-2 pt-0.5 text-[11px] font-bold text-slate-400">
                        <span>{quiz.questions?.length || 5} Questions</span>
                        <span>•</span>
                        <span>{quiz.difficulty || 'Medium'}</span>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'border-2 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
            )}
          </div>

          {/* Game Rules & Launch Button (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  2. Game Settings
                </h2>
              </div>

              {/* Time Per Question */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Time per Question</span>
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
                      className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        timePerQuestion === sec
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Answer Streak Bonus Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      Streak Bonus Points
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Extra points for getting multiple answers right in a row
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setStreakBonuses(!streakBonuses);
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    streakBonuses ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                  }`}
                >
                  <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>

              {/* AI Classmates Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      Add AI Opponents
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Adds friendly AI players so you can play right away
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playPop();
                    setIncludeAiClassmates(!includeAiClassmates);
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    includeAiClassmates ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
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
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isLoading ? 'Creating Room...' : 'Create Room Code & Open Lobby'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
