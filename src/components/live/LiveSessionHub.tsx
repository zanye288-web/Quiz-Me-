import React, { useState, useEffect } from 'react';
import {
  Users,
  Radio,
  Sparkles,
  Trophy,
  ArrowRight,
  Clock,
  Flame,
  Shield,
  Zap,
  Play,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Sliders,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { QuizResponse } from '../../types/quiz';
import { PRESET_TOPICS } from '../../data/presets';
import { useAuth } from '../../context/AuthContext';
import { createLiveSession, joinLiveSession, addSimulatedParticipants } from '../../services/liveSession';
import { LiveSessionData } from '../../types/liveSession';
import { soundFx } from '../../utils/audio';

interface LiveSessionHubProps {
  onJoinRoom: (roomCode: string, sessionData: LiveSessionData, isHost: boolean) => void;
  availableQuizzes?: QuizResponse[];
}

const AVATAR_COLORS = [
  { name: 'Indigo', class: 'bg-indigo-600', text: 'text-indigo-400', border: 'border-indigo-500' },
  { name: 'Emerald', class: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-500' },
  { name: 'Rose', class: 'bg-rose-600', text: 'text-rose-400', border: 'border-rose-500' },
  { name: 'Amber', class: 'bg-amber-600', text: 'text-amber-400', border: 'border-amber-500' },
  { name: 'Purple', class: 'bg-purple-600', text: 'text-purple-400', border: 'border-purple-500' },
  { name: 'Cyan', class: 'bg-cyan-600', text: 'text-cyan-400', border: 'border-cyan-500' },
];

export const LiveSessionHub: React.FC<LiveSessionHubProps> = ({
  onJoinRoom,
  availableQuizzes = [],
}) => {
  const { user, userProfile } = useAuth();

  // Tab: 'join' or 'host'
  const [activeTab, setActiveTab] = useState<'join' | 'host'>('join');

  // Join form state
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [studentName, setStudentName] = useState(
    userProfile?.displayName || user?.displayName || 'Scholar'
  );
  const [selectedColor, setSelectedColor] = useState('Indigo');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Host form state
  const [selectedQuizId, setSelectedQuizId] = useState<string>(PRESET_TOPICS[0]?.id || '');
  const [timePerQuestion, setTimePerQuestion] = useState<number>(20);
  const [streakBonuses, setStreakBonuses] = useState<boolean>(true);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(true);
  const [isHosting, setIsHosting] = useState(false);
  const [hostError, setHostError] = useState<string | null>(null);

  // Synchronize student name when userProfile changes
  useEffect(() => {
    if (userProfile?.displayName) {
      setStudentName(userProfile.displayName);
    }
  }, [userProfile]);

  // Combine curriculum presets with user custom quizzes
  const allHostableQuizzes = [
    ...PRESET_TOPICS.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      questionCount: p.prebuiltStudentQuiz?.questions?.length || 5,
      quiz: p.prebuiltStudentQuiz,
    })),
    ...availableQuizzes.map((q, idx) => ({
      id: `custom_${idx}`,
      title: q.quiz_title,
      category: 'Custom Assessment',
      questionCount: q.questions?.length || 5,
      quiz: q,
    })),
  ];

  // Handle Joining Room with Code
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);

    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setJoinError('Please enter a 6-digit room code.');
      return;
    }

    if (!studentName.trim()) {
      setJoinError('Please enter your scholar name.');
      return;
    }

    try {
      setIsJoining(true);
      soundFx.playClick();

      const studentId = user?.uid || `guest_${Math.random().toString(36).substring(2, 9)}`;

      const result = await joinLiveSession(cleanCode, {
        id: studentId,
        name: studentName.trim(),
        avatarSeed: studentName.toLowerCase().replace(/\s+/g, '-'),
        avatarColor: selectedColor.toLowerCase(),
        role: 'student',
      });

      if (result.success && result.session) {
        soundFx.playCorrect();
        onJoinRoom(cleanCode, result.session, false);
      } else {
        setJoinError(result.error || 'Failed to join session. Please check the code.');
      }
    } catch (err: any) {
      console.error('Error joining live session:', err);
      setJoinError('Could not connect to live room. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  // Handle Hosting a Live Room
  const handleHost = async () => {
    setHostError(null);
    const selected = allHostableQuizzes.find((q) => q.id === selectedQuizId);
    if (!selected || !selected.quiz) {
      setHostError('Please select a valid quiz to host.');
      return;
    }

    try {
      setIsHosting(true);
      soundFx.playClick();

      const hostId = user?.uid || `host_${Math.random().toString(36).substring(2, 9)}`;
      const hostName = userProfile?.displayName || user?.displayName || 'Quiz Host';

      const roomCode = await createLiveSession(
        selected.quiz,
        {
          id: hostId,
          name: hostName,
        },
        {
          timePerQuestion,
          streakBonusesEnabled: streakBonuses,
          showLeaderboardAfterEach: showLeaderboard,
        }
      );

      soundFx.playLevelUp();

      // Form local initial session data
      const initialSession: LiveSessionData = {
        id: roomCode,
        roomCode,
        hostId,
        hostName,
        quiz: selected.quiz,
        status: 'lobby',
        currentQuestionIndex: 0,
        questionStartTime: Date.now(),
        settings: {
          timePerQuestion,
          streakBonusesEnabled: streakBonuses,
          showLeaderboardAfterEach: showLeaderboard,
          allowLateJoin: true,
        },
        participants: {
          [hostId]: {
            id: hostId,
            name: `${hostName} (Host)`,
            avatarSeed: 'host',
            avatarColor: 'indigo',
            role: 'teacher',
            score: 0,
            streak: 0,
            answers: {},
            hasAnsweredCurrent: false,
            isReady: true,
            joinedAt: Date.now(),
            lastActive: Date.now(),
          },
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      onJoinRoom(roomCode, initialSession, true);
    } catch (err: any) {
      console.error('Error creating live session:', err);
      setHostError('Could not initialize room. Please try again.');
    } finally {
      setIsHosting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3 shadow-2xs">
          <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
          <span>Synchronous Competitive Assessment Rooms</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Live Shared Quiz Battles
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Compete in real time with classmates and peers. Answer questions synchronously, build streaks, and climb the live podium!
        </p>

        {/* Tab Switcher: Join vs Host */}
        <div className="inline-flex p-1.5 mt-6 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/50 dark:border-slate-700/50 shadow-inner">
          <button
            type="button"
            id="tab-join-live-room"
            onClick={() => {
              setActiveTab('join');
              soundFx.playClick();
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'join'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Join with Room Code</span>
          </button>
          <button
            type="button"
            id="tab-host-live-room"
            onClick={() => {
              setActiveTab('host');
              soundFx.playClick();
            }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              activeTab === 'host'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4 text-indigo-500" />
            <span>Host Live Battle</span>
          </button>
        </div>
      </div>

      {/* Main Action Panels */}
      {activeTab === 'join' ? (
        /* JOIN WITH CODE PANEL */
        <div className="max-w-md mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Enter Room PIN
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Ask your teacher or game host for the 6-digit session code.
            </p>
          </div>

          {joinError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{joinError}</span>
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 text-center">
                6-Digit Room Code
              </label>
              <input
                type="text"
                id="live-room-code-input"
                maxLength={6}
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="123456"
                className="w-full text-center tracking-widest font-mono text-3xl font-black py-4 px-4 rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:border-indigo-600 focus:outline-hidden focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Your Scholar Display Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                maxLength={24}
                placeholder="e.g. Marie Curie"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white focus:border-indigo-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Scholar Avatar Color
              </label>
              <div className="flex items-center justify-between gap-2">
                {AVATAR_COLORS.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setSelectedColor(col.name)}
                    className={`w-9 h-9 rounded-full ${col.class} transition-transform flex items-center justify-center cursor-pointer ${
                      selectedColor === col.name
                        ? 'ring-4 ring-indigo-500/30 scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {selectedColor === col.name && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              id="join-live-session-submit-btn"
              disabled={isJoining}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isJoining ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Room...</span>
                </div>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
                  <span>Enter Live Battle</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Help */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Want to try hosting your own room?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('host')}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Switch to Host Mode
              </button>
            </p>
          </div>
        </div>
      ) : (
        /* HOST LIVE BATTLE PANEL */
        <div className="max-w-2xl mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Configure Live Quiz Room
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select a quiz topic and define time limits for synchronous classroom play.
            </p>
          </div>

          {hostError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{hostError}</span>
            </div>
          )}

          {/* Select Assessment Track */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              1. Choose Quiz Track
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
              {allHostableQuizzes.map((item) => {
                const isSelected = selectedQuizId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedQuizId(item.id);
                      soundFx.playClick();
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                        {item.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                        {item.title}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {item.questionCount} Questions
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400">
                          <Check className="w-3.5 h-3.5" /> Selected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Room Settings */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. Timing & Rules
            </label>

            {/* Time per question */}
            <div>
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Time Limit per Question
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '10 sec', val: 10 },
                  { label: '15 sec', val: 15 },
                  { label: '20 sec', val: 20 },
                  { label: '30 sec', val: 30 },
                ].map((t) => (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => setTimePerQuestion(t.val)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      timePerQuestion === t.val
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={streakBonuses}
                  onChange={(e) => setStreakBonuses(e.target.checked)}
                  className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Streak Flame Bonuses
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                    Consecutive correct answers award bonus XP
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLeaderboard}
                  onChange={(e) => setShowLeaderboard(e.target.checked)}
                  className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Live Question Leaderboards
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                    Show podium score changes after each question
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Launch Room Button */}
          <button
            type="button"
            id="launch-live-room-btn"
            onClick={handleHost}
            disabled={isHosting}
            className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-base shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isHosting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Unique Room Code...</span>
              </div>
            ) : (
              <>
                <Radio className="w-5 h-5 text-amber-300" />
                <span>Create Live Battle Room</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
