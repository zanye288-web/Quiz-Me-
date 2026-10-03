import React, { useState, useEffect, useCallback } from 'react';
import { DashboardSidebar, DashboardTab } from './components/DashboardSidebar';
import { DashboardTopbar } from './components/DashboardTopbar';
import { IngestStudio } from './components/IngestStudio';
import { CurriculumCatalog } from './components/CurriculumCatalog';
import { CommunityFeed } from './components/CommunityFeed';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { HistoryView, QuizHistoryRecord } from './components/HistoryView';
import { QuestionAuthoringStudio } from './components/QuestionAuthoringStudio';
import { QuizRunner } from './components/QuizRunner';
import { QuizComplete } from './components/QuizComplete';
import { AskTutorDrawer } from './components/AskTutorDrawer';
import { RawJsonModal } from './components/RawJsonModal';
import { SettingsModal } from './components/SettingsModal';
import { SettingsView } from './components/SettingsView';
import { BadgeCelebrationModal } from './components/BadgeCelebrationModal';
import { CommandPalette } from './components/CommandPalette';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ExamWorksheetModal } from './components/ExamWorksheetModal';
import { LoginGate } from './components/LoginGate';
import { ProfileCustomizationModal } from './components/ProfileCustomizationModal';
import { FlashcardStudio } from './components/FlashcardStudio';
import { GammaWorkspace } from './components/GammaWorkspace';
import { AchievementsView } from './components/AchievementsView';
import { QuizUploadModal } from './components/QuizUploadModal';
import { LiveSessionHub } from './components/live/LiveSessionHub';
import { LiveSessionRoom } from './components/live/LiveSessionRoom';
import { PomodoroTimerOverlay } from './components/PomodoroTimerOverlay';
import { LiveSessionData } from './types/liveSession';
import { IntelligentNotesHubView } from './components/IntelligentNotesHubView';
import { SuggestionsHubView } from './components/SuggestionsHubView';
import { QuizzieCompanionWidget } from './components/QuizzieCompanionWidget';
import { StarterTutorialModal, STARTER_TUTORIAL_STORAGE_KEY } from './components/StarterTutorialModal';
import { GraduationCap, Sparkles, BookOpen, Layers, BarChart3, Menu, Share2, Play, X, FileText } from 'lucide-react';
import { PersonaType, QuizResponse, Question, UserStats, AssessmentConfig } from './types/quiz';
import { BadgeDefinition, BADGE_CATALOG } from './types/badges';
import { soundFx } from './utils/audio';
import { speechEngine } from './utils/speech';
import { useAuth } from './context/AuthContext';
import {
  subscribeQuizHistory,
  saveQuizHistoryToFirestore,
  deleteQuizHistoryFromFirestore,
  clearAllQuizHistoryFromFirestore,
  subscribeQuizzes,
  saveQuizToFirestore,
  deleteQuizFromFirestore,
  getQuizFromFirestore,
  SavedQuizDocument,
} from './services/firestore';
import { detectSharedQuizInUrl, clearSharedQuizParamsFromUrl } from './utils/shareUtils';

const STATS_STORAGE_KEY = 'quizme_assessment_stats_v2';
const CONFIG_STORAGE_KEY = 'quizme_assessment_config_v1';
const HISTORY_STORAGE_KEY = 'quizme_assessment_history_v1';

export default function App() {
  const { user, userProfile, isAuthLoading, syncStatsToCloud, syncAssessmentConfigToCloud } = useAuth();

  // Navigation & Workspace View State
  const [activeTab, setActiveTab] = useState<DashboardTab>('studio');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [customQuizzes, setCustomQuizzes] = useState<SavedQuizDocument[]>([]);
  const [activeLiveSession, setActiveLiveSession] = useState<{
    roomCode: string;
    initialData: LiveSessionData;
    isHost: boolean;
    currentUserId: string;
  } | null>(null);

  // Profile Customization Modal & Optional Onboarding State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isOptionalOnboarding, setIsOptionalOnboarding] = useState<boolean>(false);
  const [hasPromptedProfile, setHasPromptedProfile] = useState<boolean>(false);
  const [isStarterTutorialOpen, setIsStarterTutorialOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STARTER_TUTORIAL_STORAGE_KEY) !== 'true';
    }
    return false;
  });

  // Optional profile prompt on first login
  useEffect(() => {
    if (user && userProfile && !hasPromptedProfile) {
      const sessionDismissed = sessionStorage.getItem(`quizme_profile_prompt_${user.uid}`);
      if (!userProfile.hasCustomizedProfile && !sessionDismissed) {
        setIsOptionalOnboarding(true);
        setIsProfileModalOpen(true);
        setHasPromptedProfile(true);
        sessionStorage.setItem(`quizme_profile_prompt_${user.uid}`, 'true');
      }
    }
  }, [user, userProfile, hasPromptedProfile]);

  // Active Assessment Context
  const [persona, setPersona] = useState<PersonaType>('Student');
  const [activeQuiz, setActiveQuiz] = useState<QuizResponse | null>(null);
  const [quizResults, setQuizResults] = useState<{
    score: number;
    total: number;
    xpEarned: number;
    gemsEarned: number;
    timeSpentSeconds?: number;
    flaggedIds?: number[];
    answers: Array<{ questionId: number; isCorrect: boolean; userAnswer: string }>;
  } | null>(null);

  // Evaluation & Assessment Configuration
  const [assessmentConfig, setAssessmentConfig] = useState<AssessmentConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return {
      mode: 'practice',
      feedbackTiming: 'instant',
      timeLimitMinutes: 0,
      passingScorePercent: 70,
      shuffleQuestions: false,
      allowHints: true,
    };
  });

  // User Performance Diagnostics & Benchmark Metrics
  const [stats, setStats] = useState<UserStats>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // If this was the legacy hardcoded mock stats template, discard it
          if (parsed && !(parsed.quizzesCompleted === 6 && parsed.xp === 450 && parsed.totalCorrect === 28)) {
            return parsed;
          }
        } catch {
          // fallback
        }
      }
    }
    return {
      streak: 1,
      hearts: 5,
      maxHearts: 5,
      xp: 0,
      gems: 20,
      level: 1,
      quizzesCompleted: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      badges: [],
    };
  });

  // Assessment History Logs
  const [historyRecords, setHistoryRecords] = useState<QuizHistoryRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return [];
  });

  // Audio configuration
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => soundFx.enabled);

  // Modal / Drawer States
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);
  const [tutorQuestion, setTutorQuestion] = useState<Question | null>(null);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState<boolean>(false);
  const [jsonModalQuiz, setJsonModalQuiz] = useState<QuizResponse | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [celebratingBadge, setCelebratingBadge] = useState<BadgeDefinition | null>(null);

  // QoL Feature Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [worksheetQuiz, setWorksheetQuiz] = useState<QuizResponse | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadedQuizForAuthoring, setUploadedQuizForAuthoring] = useState<QuizResponse | null>(null);
  const [receivedSharedQuiz, setReceivedSharedQuiz] = useState<{
    quiz: QuizResponse;
    source: 'direct' | 'cloud';
  } | null>(null);

  // Ingest studio async state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K, ?)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        soundFx.playClick();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Check if user is typing in an input / textarea / contenteditable
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (!isInput) {
        // Toggle Shortcuts Cheatsheet on '?'
        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
          e.preventDefault();
          soundFx.playClick();
          setIsShortcutsModalOpen((prev) => !prev);
          return;
        }

        // Toggle Sound Mute on 'm' or 'M'
        if (e.key.toLowerCase() === 'm' && !e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          handleToggleSound();
          return;
        }

        // Quick open 1-on-1 AI Tutor on 't' or 'T'
        if (e.key.toLowerCase() === 't' && !e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          soundFx.playClick();
          setIsTutorOpen((prev) => !prev);
          return;
        }

        // Quick jump to AI Study Notes on 'n' or 'N'
        if (e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          soundFx.playClick();
          setActiveTab('notes');
          return;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(assessmentConfig));
  }, [assessmentConfig]);

  useEffect(() => {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyRecords));
  }, [historyRecords]);

  // Sync state from cloud userProfile when authenticated
  useEffect(() => {
    if (userProfile) {
      setStats((prev) => ({
        ...prev,
        streak: userProfile.streak ?? prev.streak,
        hearts: userProfile.hearts ?? prev.hearts,
        maxHearts: userProfile.maxHearts ?? prev.maxHearts,
        xp: userProfile.xp ?? prev.xp,
        gems: userProfile.gems ?? prev.gems,
        level: userProfile.level ?? prev.level,
        quizzesCompleted: userProfile.quizzesCompleted ?? prev.quizzesCompleted,
        totalCorrect: userProfile.totalCorrect ?? prev.totalCorrect,
        totalQuestions: userProfile.totalQuestions ?? prev.totalQuestions,
        badges: userProfile.badges ?? prev.badges,
      }));
      if (userProfile.assessmentConfig) {
        setAssessmentConfig((prev) => ({ ...prev, ...userProfile.assessmentConfig }));
      }
    }
  }, [userProfile]);

  // Subscribe to real quiz history from Firestore
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeQuizHistory(user.uid, (records) => {
      setHistoryRecords(records);
    });
    return () => unsubscribe();
  }, [user]);

  // Subscribe to community & cloud quizzes from Firestore
  useEffect(() => {
    const unsubscribe = subscribeQuizzes((quizzes) => {
      setCustomQuizzes(quizzes || []);
    });
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Detect shared quiz in URL (from peer share link)
  useEffect(() => {
    async function checkSharedQuiz() {
      const detected = detectSharedQuizInUrl();
      if (!detected) return;

      if (detected.type === 'data') {
        soundFx.playComplete();
        setReceivedSharedQuiz({ quiz: detected.quiz, source: 'direct' });
        clearSharedQuizParamsFromUrl();
      } else if (detected.type === 'cloudId') {
        try {
          const doc = await getQuizFromFirestore(detected.quizId);
          if (doc) {
            const reconstructed: QuizResponse = {
              app_name: 'Quiz Me!',
              persona: doc.persona || 'Student',
              quiz_title: doc.quiz_title,
              summary: doc.summary,
              difficulty: doc.difficulty,
              questions: doc.questions,
              study_guide: doc.study_guide,
              tags: doc.tags,
            };
            soundFx.playComplete();
            setReceivedSharedQuiz({ quiz: reconstructed, source: 'cloud' });
            clearSharedQuizParamsFromUrl();
          }
        } catch (e) {
          console.warn('Failed to load cloud shared quiz:', e);
        }
      }
    }

    checkSharedQuiz();
  }, []);

  const updateStats = (delta: Partial<UserStats>) => {
    setStats((prev) => {
      const newXp = delta.xp !== undefined ? delta.xp : prev.xp;
      const newLevel = Math.max(1, Math.floor(newXp / 150) + 1);
      const updated = {
        ...prev,
        ...delta,
        level: newLevel,
      };
      if (user) {
        syncStatsToCloud(updated);
      }
      return updated;
    });
  };

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    soundFx.enabled = nextVal;
    if (nextVal) soundFx.playClick();
  };

  // Launch Assessment
  const handleStartQuiz = (quiz: QuizResponse) => {
    let questionsToRun = [...quiz.questions];
    if (assessmentConfig.shuffleQuestions) {
      questionsToRun = questionsToRun.sort(() => Math.random() - 0.5);
    }
    const updatedQuiz: QuizResponse = {
      ...quiz,
      questions: questionsToRun,
    };
    if (quiz.language) {
      speechEngine.setLanguage(quiz.language);
    }
    setActiveQuiz(updatedQuiz);
    setQuizResults(null);
    setActiveTab('runner');
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Complete Assessment
  const handleFinishQuiz = (results: {
    quiz: QuizResponse;
    answers: Array<{ questionId: number; isCorrect: boolean; userAnswer: string }>;
    score: number;
    total: number;
    xpEarned: number;
    gemsEarned: number;
    timeSpentSeconds: number;
    flaggedIds: number[];
  }) => {
    setIsFocusMode(false);
    setQuizResults(results);
    setActiveTab('complete');

    // Record session history
    const percent = Math.round((results.score / results.total) * 100);
    const newRecord: QuizHistoryRecord = {
      id: `record_${Date.now()}`,
      quizTitle: results.quiz.quiz_title,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      score: results.score,
      total: results.total,
      percentage: percent,
      timeSpentSeconds: results.timeSpentSeconds,
      xpEarned: results.xpEarned,
      difficulty: results.quiz.difficulty,
      persona,
      quizData: results.quiz,
      flaggedCount: results.flaggedIds ? results.flaggedIds.length : 0,
      answers: results.answers,
    };

    setHistoryRecords((prev) => [newRecord, ...prev]);

    // Save to Firestore
    if (user) {
      saveQuizHistoryToFirestore(user.uid, newRecord).catch((err) => {
        console.error('Error saving quiz history to Firestore:', err);
      });
    }

    // Check pre-existing badge statuses
    const preUnlockedIds = new Set(
      BADGE_CATALOG.filter((b) => b.checkUnlocked(stats)).map((b) => b.id)
    );

    const updatedNewStats: UserStats = {
      ...stats,
      totalCorrect: stats.totalCorrect + results.score,
      totalQuestions: stats.totalQuestions + results.total,
      quizzesCompleted: stats.quizzesCompleted + 1,
      xp: stats.xp + results.xpEarned,
      gems: stats.gems + results.gemsEarned,
      level: Math.max(1, Math.floor((stats.xp + results.xpEarned) / 150) + 1),
    };

    setStats(updatedNewStats);
    if (user) {
      syncStatsToCloud(updatedNewStats);
    }

    // Detect newly unlocked badge
    const newlyUnlocked = BADGE_CATALOG.find(
      (b) => !preUnlockedIds.has(b.id) && b.checkUnlocked(updatedNewStats)
    );

    if (newlyUnlocked) {
      setTimeout(() => {
        setCelebratingBadge(newlyUnlocked);
      }, 700);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Restart Active Assessment
  const handleRestartQuiz = () => {
    if (activeQuiz) {
      setActiveTab('runner');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Return to Studio
  const handleNewQuiz = () => {
    setIsFocusMode(false);
    setActiveTab('studio');
    setQuizResults(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle uploaded quiz from user
  const handleQuizUploaded = async (quiz: QuizResponse) => {
    soundFx.playComplete();
    setIsUploadModalOpen(false);

    // Persist to user's saved quizzes in cloud
    if (user) {
      try {
        const userLevel = userProfile?.level || stats.level || 1;
        const userAssessmentsCount = customQuizzes.filter((q) => q.creatorId === user.uid).length + 1;
        await saveQuizToFirestore(quiz, user.uid, user.displayName || 'Scholar', true, persona, user.photoURL, userLevel, userAssessmentsCount);
      } catch (err) {
        console.warn('Could not auto-save uploaded quiz to cloud:', err);
      }
    }

    setUploadedQuizForAuthoring(quiz);
    handleStartQuiz(quiz);
  };

  // Review past record
  const handleReviewHistoryRecord = (record: QuizHistoryRecord) => {
    soundFx.playClick();
    setActiveQuiz(record.quizData);
    setQuizResults({
      score: record.score,
      total: record.total,
      xpEarned: 0,
      gemsEarned: 0,
      timeSpentSeconds: record.timeSpentSeconds,
      flaggedIds: [],
      answers: record.answers || [],
    });
    setActiveTab('complete');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Retake past record
  const handleRetakeHistoryRecord = (quizData: QuizResponse) => {
    handleStartQuiz(quizData);
  };

  // Delete history item
  const handleDeleteHistoryRecord = (id: string) => {
    soundFx.playClick();
    setHistoryRecords((prev) => prev.filter((r) => r.id !== id));
    if (user) {
      deleteQuizHistoryFromFirestore(user.uid, id).catch((err) => {
        console.error('Error deleting quiz history from Firestore:', err);
      });
    }
  };

  // Clear all history
  const handleClearAllHistory = () => {
    soundFx.playClick();
    setHistoryRecords([]);
    if (user) {
      clearAllQuizHistoryFromFirestore(user.uid).catch((err) => {
        console.error('Error clearing quiz history from Firestore:', err);
      });
    }
  };

  // Custom Quiz library management in Firestore
  const handleSaveQuizToLibrary = async (quiz: QuizResponse) => {
    try {
      const creatorId = user?.uid || 'guest';
      const creatorName = user?.displayName || 'Scholar Creator';
      const userLevel = userProfile?.level || stats.level || 1;
      const userAssessmentsCount = customQuizzes.filter((q) => q.creatorId === creatorId).length + 1;
      await saveQuizToFirestore(quiz, creatorId, creatorName, true, persona, user?.photoURL, userLevel, userAssessmentsCount);
    } catch (err) {
      console.error('Error saving quiz to Firestore library:', err);
    }
  };

  const handlePublishActiveQuizToCommunity = async () => {
    if (!activeQuiz) return;
    try {
      const creatorId = user?.uid || `guest_${Date.now()}`;
      const creatorName = userProfile?.displayName || user?.displayName || (persona === 'Teacher' ? 'Educator Scholar' : 'Student Scholar');
      const userLevel = userProfile?.level || stats.level || 1;
      const userAssessmentsCount = customQuizzes.filter((q) => q.creatorId === creatorId).length + 1;
      await saveQuizToFirestore(activeQuiz, creatorId, creatorName, true, persona, user?.photoURL, userLevel, userAssessmentsCount);
      soundFx.playStreak();
      setActiveTab('community');
    } catch (err) {
      console.error('Error publishing active quiz to community feed:', err);
    }
  };

  const handleDeleteCustomQuiz = async (quizId: string) => {
    try {
      await deleteQuizFromFirestore(quizId);
    } catch (err) {
      console.error('Error deleting custom quiz from Firestore:', err);
    }
  };

  // Open Tutor for specific question
  const handleOpenTutor = (q: Question) => {
    setTutorQuestion(q);
    setIsTutorOpen(true);
  };

  // Inspect Raw JSON schema
  const handleInspectRawJson = (quiz?: QuizResponse) => {
    const target = quiz || activeQuiz;
    if (target) {
      setJsonModalQuiz(target);
      setIsJsonModalOpen(true);
    }
  };

  const isFocusModeActive = activeTab === 'runner' && isFocusMode;

  // Check auth loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg animate-pulse mb-3">
          <GraduationCap className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold text-slate-400 animate-pulse tracking-wide uppercase">
          Initializing QuizMe Scholar Studio...
        </p>
      </div>
    );
  }

  // Required authentication gate: user must log in
  if (!user) {
    return <LoginGate />;
  }

  return (
    <div className="relative min-h-screen bg-slate-50/90 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-row transition-colors duration-200 antialiased selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Vibrant Ambient Glow Orbs in Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-[450px] h-[450px] bg-gradient-to-br from-indigo-500/15 via-purple-500/15 to-transparent rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-gradient-to-bl from-pink-500/15 via-rose-500/10 to-amber-500/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-32 left-1/4 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-500/15 via-emerald-500/15 to-transparent rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* Desktop Sidebar Navigation (Hidden in Focus Mode) */}
      {!isFocusModeActive && (
        <div className="hidden md:block shrink-0 sticky top-0 h-screen z-30">
          <DashboardSidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setIsFocusMode(false);
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            persona={persona}
            onPersonaChange={(p) => {
              setPersona(p);
              if (activeQuiz) {
                setActiveQuiz({ ...activeQuiz, persona: p });
              }
            }}
            stats={stats}
            activeQuiz={activeQuiz}
            hasCompletedResults={!!quizResults}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenProfileModal={() => {
              setIsOptionalOnboarding(false);
              setIsProfileModalOpen(true);
            }}
            onOpenUploadQuiz={() => setIsUploadModalOpen(true)}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            historyCount={historyRecords.length}
          />
        </div>
      )}

      {/* Mobile Drawer Overlay Sidebar (Hidden in Focus Mode) */}
      {!isFocusModeActive && isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-white dark:bg-slate-900 shadow-2xl z-10">
            <DashboardSidebar
              activeTab={activeTab}
              onSelectTab={(tab) => {
                setIsFocusMode(false);
                setActiveTab(tab);
                setIsMobileSidebarOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              persona={persona}
              onPersonaChange={(p) => {
                setPersona(p);
                if (activeQuiz) {
                  setActiveQuiz({ ...activeQuiz, persona: p });
                }
              }}
              stats={stats}
              activeQuiz={activeQuiz}
              hasCompletedResults={!!quizResults}
              onOpenSettings={() => {
                setIsMobileSidebarOpen(false);
                setIsSettingsOpen(true);
              }}
              onOpenProfileModal={() => {
                setIsMobileSidebarOpen(false);
                setIsOptionalOnboarding(false);
                setIsProfileModalOpen(true);
              }}
              onOpenUploadQuiz={() => {
                setIsMobileSidebarOpen(false);
                setIsUploadModalOpen(true);
              }}
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileSidebarOpen(false)}
              historyCount={historyRecords.length}
            />
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar with Breadcrumbs & Fast Action Controls (Hidden in Focus Mode) */}
        {!isFocusModeActive && (
          <DashboardTopbar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setIsFocusMode(false);
              setActiveTab(tab);
            }}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenRawJsonModal={() => handleInspectRawJson()}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
            onOpenProfileModal={() => {
              setIsOptionalOnboarding(false);
              setIsProfileModalOpen(true);
            }}
            onOpenUploadQuiz={() => setIsUploadModalOpen(true)}
            activeQuiz={activeQuiz}
            stats={stats}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            persona={persona}
            onPersonaChange={(p) => {
              setPersona(p);
              if (activeQuiz) {
                setActiveQuiz({ ...activeQuiz, persona: p });
              }
            }}
          />
        )}

        {/* Dashboard Dynamic Content Views */}
        <main className={isFocusModeActive ? 'flex-1 w-full min-h-screen p-0' : activeTab === 'runner' ? 'flex-1 pb-4' : 'flex-1 pb-24 md:pb-12'}>
          {activeTab === 'studio' && (
            <IngestStudio
              persona={persona}
              onPersonaChange={setPersona}
              onStartQuiz={handleStartQuiz}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              assessmentConfig={assessmentConfig}
              onOpenRawJsonModal={(q) => handleInspectRawJson(q)}
              onOpenUploadQuiz={() => setIsUploadModalOpen(true)}
              onOpenTutor={() => {
                setTutorQuestion(null);
                setIsTutorOpen(true);
              }}
              stats={stats}
              historyRecords={historyRecords}
            />
          )}

          {activeTab === 'notes' && (
            <IntelligentNotesHubView
              persona={persona}
              activeQuiz={activeQuiz}
              onStartPracticeQuiz={(topic) => {
                setActiveTab('studio');
              }}
            />
          )}

          {activeTab === 'gamma' && (
            <GammaWorkspace
              persona={persona}
              onLaunchAssessment={(customQuiz) => {
                handleSaveQuizToLibrary(customQuiz);
                handleStartQuiz(customQuiz);
              }}
              onSaveToLibrary={(customQuiz) => {
                handleSaveQuizToLibrary(customQuiz);
              }}
              initialQuiz={activeQuiz}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardStudio
              initialQuiz={activeQuiz}
              onFlashcardMastered={(count) => {
                updateStats({
                  xp: stats.xp + count * 5,
                  gems: stats.gems + count * 2,
                });
              }}
            />
          )}

          {activeTab === 'achievements' && (
            <AchievementsView
              stats={stats}
              persona={persona}
              historyRecords={historyRecords}
              onStartQuiz={handleStartQuiz}
              onGenerateNotes={(topic) => {
                setActiveTab('notes');
              }}
              onCelebrateBadge={(badge) => setCelebratingBadge(badge)}
              onClaimXpBonus={(badgeId, xpBonus) => {
                updateStats({
                  xp: stats.xp + xpBonus,
                  gems: stats.gems + 5,
                });
              }}
            />
          )}

          {activeTab === 'curricula' && (
            <CurriculumCatalog
              persona={persona}
              onStartQuiz={handleStartQuiz}
              onOpenRawJsonModal={(q) => handleInspectRawJson(q)}
              onOpenWorksheet={(q) => setWorksheetQuiz(q)}
              customQuizzes={customQuizzes}
              onDeleteCustomQuiz={handleDeleteCustomQuiz}
              onOpenUploadQuiz={() => setIsUploadModalOpen(true)}
            />
          )}

          {activeTab === 'community' && (
            <CommunityFeed
              currentPersona={persona}
              onStartQuiz={handleStartQuiz}
              onOpenFlashcards={(q) => {
                setActiveQuiz(q);
                setActiveTab('flashcards');
              }}
              onOpenWorksheet={(q) => setWorksheetQuiz(q)}
              onOpenRawJsonModal={(q) => handleInspectRawJson(q)}
              onPublishCurrentQuiz={handlePublishActiveQuizToCommunity}
              activeQuiz={activeQuiz}
              customQuizzes={customQuizzes}
              onDeleteCustomQuiz={handleDeleteCustomQuiz}
            />
          )}

          {activeTab === 'live' && (
            activeLiveSession ? (
              <LiveSessionRoom
                roomCode={activeLiveSession.roomCode}
                initialData={activeLiveSession.initialData}
                isHost={activeLiveSession.isHost}
                currentUserId={activeLiveSession.currentUserId}
                onLeave={() => setActiveLiveSession(null)}
              />
            ) : (
              <LiveSessionHub
                availableQuizzes={
                  activeQuiz
                    ? [
                        activeQuiz,
                        ...customQuizzes.filter((q) => q.quiz_title !== activeQuiz.quiz_title),
                      ]
                    : customQuizzes
                }
                onJoinRoom={(roomCode, data, isHost, participantId) => {
                  setActiveLiveSession({
                    roomCode,
                    initialData: data,
                    isHost,
                    currentUserId: participantId,
                  });
                }}
                onCancel={() => setActiveTab('studio')}
              />
            )
          )}

          {activeTab === 'authoring' && (
            <QuestionAuthoringStudio
              persona={persona}
              initialQuiz={uploadedQuizForAuthoring}
              onOpenUploadQuiz={() => setIsUploadModalOpen(true)}
              onLaunchAssessment={(customQuiz) => {
                handleSaveQuizToLibrary(customQuiz);
                handleStartQuiz(customQuiz);
              }}
              onSaveToLibrary={(customQuiz) => {
                handleSaveQuizToLibrary(customQuiz);
                handleInspectRawJson(customQuiz);
              }}
            />
          )}

          {activeTab === 'suggestions' && (
            <SuggestionsHubView
              stats={stats}
              persona={persona}
              historyRecords={historyRecords}
              onStartQuiz={handleStartQuiz}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onUpdateStats={updateStats}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard
              stats={stats}
              persona={persona}
              historyRecords={historyRecords}
              onStartQuiz={handleStartQuiz}
              onCustomizeTopic={(prompt) => {
                setActiveTab('studio');
              }}
              onCelebrateBadge={(badge) => setCelebratingBadge(badge)}
              onResetStats={() => {
                const resetState: UserStats = {
                  streak: 0,
                  hearts: 5,
                  maxHearts: 5,
                  xp: 0,
                  gems: 0,
                  level: 1,
                  quizzesCompleted: 0,
                  totalCorrect: 0,
                  totalQuestions: 0,
                  badges: [],
                };
                setStats(resetState);
                if (user) {
                  syncStatsToCloud(resetState);
                }
              }}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              historyRecords={historyRecords}
              onReviewRecord={handleReviewHistoryRecord}
              onRetakeRecord={handleRetakeHistoryRecord}
              onInspectJson={(q) => handleInspectRawJson(q)}
              onDeleteRecord={handleDeleteHistoryRecord}
              onClearAllHistory={handleClearAllHistory}
              onLaunchNewAssessment={() => setActiveTab('studio')}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              assessmentConfig={assessmentConfig}
              onUpdateAssessmentConfig={(cfg) => {
                const merged = { ...assessmentConfig, ...cfg };
                setAssessmentConfig(merged);
                if (user) {
                  syncAssessmentConfigToCloud(merged);
                }
              }}
              persona={persona}
              onPersonaChange={(p) => {
                setPersona(p);
                if (activeQuiz) {
                  setActiveQuiz({ ...activeQuiz, persona: p });
                }
              }}
              stats={stats}
              onUpdateStats={(newStats) => {
                setStats(newStats);
                if (user) {
                  syncStatsToCloud(newStats);
                }
              }}
              historyRecords={historyRecords}
              onUpdateHistoryRecords={setHistoryRecords}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              onOpenProfileModal={() => {
                setIsOptionalOnboarding(false);
                setIsProfileModalOpen(true);
              }}
              onOpenStarterTutorial={() => setIsStarterTutorialOpen(true)}
            />
          )}

          {activeTab === 'runner' && activeQuiz && (
            <QuizRunner
              quiz={activeQuiz}
              persona={persona}
              stats={stats}
              assessmentConfig={assessmentConfig}
              isFocusMode={isFocusMode}
              onToggleFocusMode={setIsFocusMode}
              onUpdateStats={updateStats}
              onFinishQuiz={handleFinishQuiz}
              onQuitQuiz={handleNewQuiz}
              onOpenTutor={handleOpenTutor}
              onOpenWorksheet={(q) => setWorksheetQuiz(q)}
            />
          )}

          {activeTab === 'runner' && !activeQuiz && (
            <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">No Active Assessment</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Please create or select an assessment from the Studio or Catalog to begin your interactive test session.
              </p>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('studio');
                }}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Go to Assessment Studio
              </button>
            </div>
          )}

          {activeTab === 'complete' && activeQuiz && quizResults && (
            <QuizComplete
              quiz={activeQuiz}
              persona={persona}
              stats={stats}
              results={quizResults}
              onRestartQuiz={handleRestartQuiz}
              onNewQuiz={handleNewQuiz}
              onOpenJsonView={() => handleInspectRawJson(activeQuiz)}
            />
          )}

          {activeTab === 'complete' && (!activeQuiz || !quizResults) && (
            <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">No Completed Results</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Complete an assessment session to view detailed AI analysis, Bloom taxonomies, and study flashcards.
              </p>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab('studio');
                }}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Launch an Assessment
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar (Hidden in Focus Mode or during active quiz) */}
      {!isFocusModeActive && activeTab !== 'runner' && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1 shadow-lg flex items-center justify-around"
        >
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('studio');
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-black transition-all cursor-pointer ${
              activeTab === 'studio'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-0.5" />
            <span>Studio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('curricula');
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-black transition-all cursor-pointer ${
              activeTab === 'curricula'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 mb-0.5" />
            <span>Quizzes</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('flashcards');
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-black transition-all cursor-pointer ${
              activeTab === 'flashcards'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5" />
            <span>Flashcards</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setActiveTab('analytics');
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-black transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-0.5" />
            <span>Stats</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setIsMobileSidebarOpen(true);
            }}
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-[10px] font-black text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4 mb-0.5" />
            <span>Menu</span>
          </button>
        </nav>
      )}

      {/* Interactive AI Pedagogical Tutor Slide-over Drawer */}
      <AskTutorDrawer
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        question={tutorQuestion}
        persona={persona}
        onGenerateNotes={(topic) => {
          setIsTutorOpen(false);
          setActiveTab('notes');
        }}
      />

      {/* Standardized Schema JSON Inspector Modal */}
      <RawJsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        quiz={jsonModalQuiz || activeQuiz}
      />

      {/* Preferences & Assessment Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        assessmentConfig={assessmentConfig}
        onUpdateAssessmentConfig={(cfg) => setAssessmentConfig((prev) => ({ ...prev, ...cfg }))}
        onOpenFullSettings={() => setActiveTab('settings')}
      />

      {/* Badge Unlock Milestone Celebration Modal */}
      <BadgeCelebrationModal
        badge={celebratingBadge}
        isOpen={!!celebratingBadge}
        onClose={() => setCelebratingBadge(null)}
      />

      {/* Global Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onStartQuiz={handleStartQuiz}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onOpenStarterTutorial={() => setIsStarterTutorialOpen(true)}
        onToggleSound={handleToggleSound}
        soundEnabled={soundEnabled}
        persona={persona}
        onPersonaChange={(p) => {
          setPersona(p);
          if (activeQuiz) {
            setActiveQuiz({ ...activeQuiz, persona: p });
          }
        }}
        activeQuiz={activeQuiz}
      />

      {/* Keyboard Shortcuts Cheatsheet Modal (?) */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Printable Exam Worksheet & Solution Key Generator */}
      {worksheetQuiz && (
        <ExamWorksheetModal
          quiz={worksheetQuiz}
          isOpen={!!worksheetQuiz}
          onClose={() => setWorksheetQuiz(null)}
        />
      )}

      {/* Upload Custom Quiz Modal */}
      <QuizUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onQuizUploaded={handleQuizUploaded}
      />

      {/* Optional Scholar Profile Customization Modal */}
      <ProfileCustomizationModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        isOptionalOnboarding={isOptionalOnboarding}
        stats={stats}
      />

      {/* Interactive Starter Tutorial for New & Returning Scholars */}
      <StarterTutorialModal
        isOpen={isStarterTutorialOpen && !isProfileModalOpen}
        onClose={() => setIsStarterTutorialOpen(false)}
        persona={persona}
        onPersonaChange={(p) => {
          setPersona(p);
          if (activeQuiz) {
            setActiveQuiz({ ...activeQuiz, persona: p });
          }
        }}
        stats={stats}
        onUpdateStats={(updater) => {
          setStats((prev) => {
            const next = updater(prev);
            if (user) {
              syncStatsToCloud(next);
            }
            return next;
          });
        }}
        onNavigateToTab={(tab) => setActiveTab(tab)}
      />

      {/* Received Peer Shared Quiz Dialog */}
      {receivedSharedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-indigo-200 dark:border-indigo-800/80 p-6 sm:p-7 space-y-5"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Shared Quiz from Peer</span>
              </div>
              <button
                type="button"
                onClick={() => setReceivedSharedQuiz(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {receivedSharedQuiz.quiz.quiz_title}
              </h3>
              {receivedSharedQuiz.quiz.summary && (
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {receivedSharedQuiz.quiz.summary}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                {receivedSharedQuiz.quiz.questions?.length || 0} Questions
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                {receivedSharedQuiz.quiz.difficulty || 'Intermediate'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                {receivedSharedQuiz.quiz.persona || 'Student'} Persona
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              A peer has shared this quiz with you! You can jump straight in to take the quiz, or load it into your custom authoring studio to study and adapt it.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveQuiz(receivedSharedQuiz.quiz);
                  setReceivedSharedQuiz(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Play Quiz Now</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setUploadedQuizForAuthoring(receivedSharedQuiz.quiz);
                  setActiveTab('author');
                  setReceivedSharedQuiz(null);
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                <span>Open in Builder</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Quizzie Companion Widget (hidden during focus mode) */}
      {!isFocusModeActive && (
        <QuizzieCompanionWidget
          stats={stats}
          persona={persona}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
          onOpenTutor={() => {
            setTutorQuestion(null);
            setIsTutorOpen(true);
          }}
          onNavigateToNotes={() => setActiveTab('notes')}
          onNavigateToStudio={() => setActiveTab('studio')}
          onOpenStarterTutorial={() => setIsStarterTutorialOpen(true)}
        />
      )}

      {/* Global Pomodoro Study Overlay */}
      <PomodoroTimerOverlay />
    </div>
  );
}
