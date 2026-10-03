import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  BookOpen,
  HelpCircle,
  Brain,
  GraduationCap,
  Zap,
} from 'lucide-react';
import { QuizResponse, PersonaType, TutorSessionPlan } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { speechEngine } from '../utils/speech';
import { MascotAvatar } from './MascotAvatar';

interface QuestionSummary {
  id: number;
  questionText: string;
  domain?: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

interface InteractiveTutorLoungeProps {
  quiz: QuizResponse;
  persona: PersonaType;
  passedQuestions: QuestionSummary[];
  failedQuestions: QuestionSummary[];
  initialQuestionId?: number | null;
  tutorPlan?: TutorSessionPlan;
  onBackToSources?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
}

type TutorStyle = 'friendly_mascot' | 'socratic' | 'quick_booster' | 'deep_dive';

export const InteractiveTutorLounge: React.FC<InteractiveTutorLoungeProps> = ({
  quiz,
  persona,
  passedQuestions,
  failedQuestions,
  initialQuestionId,
  tutorPlan,
  onBackToSources,
}) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | 'general'>(
    initialQuestionId ?? (failedQuestions.length > 0 ? failedQuestions[0].id : 'general')
  );
  const [tutorStyle, setTutorStyle] = useState<TutorStyle>('friendly_mascot');
  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedQuestion =
    selectedQuestionId === 'general'
      ? null
      : [...failedQuestions, ...passedQuestions].find((q) => q.id === selectedQuestionId) || null;

  // Initialize welcome message
  useEffect(() => {
    const welcomeId = 'welcome-tutor-msg';
    let welcomeText = '';

    if (failedQuestions.length > 0) {
      const firstFail = failedQuestions[0];
      welcomeText = `Hoot hoot! Welcome to your 1-on-1 Study Lounge! I'm Quizzie the Owl, your personalized learning companion. 
I noticed you had some great answers, and a few tricky spots like Question #${firstFail.id} ("${firstFail.questionText.slice(0, 50)}..."). 
Whenever you are ready, ask me anything—we can break it down with fun analogies, practice with a quick mini-challenge, or explore why your answer differed!`;
    } else {
      welcomeText = `Hoot hoot! Spectacular job scoring 100% on "${quiz.quiz_title}"! 🌟 
You've mastered all the core questions. In this tutor session, we can explore advanced applications, deep real-world mysteries, or test your skills with an expert puzzle. What would you like to explore?`;
    }

    setMessages([
      {
        id: welcomeId,
        sender: 'tutor',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [quiz.quiz_title]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      speechEngine.stop();
    };
  }, []);

  const handleSendMessage = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || loading) return;

    soundFx.playClick();
    setInputQuery('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch('/api/ask-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: selectedQuestion ? selectedQuestion.questionText : undefined,
          userQuery: trimmed,
          persona,
          correctAnswer: selectedQuestion ? selectedQuestion.correctAnswer : undefined,
          explanation: selectedQuestion ? selectedQuestion.explanation : undefined,
          quizTitle: quiz.quiz_title,
          targetAudience: quiz.target_audience,
          tutorStyle,
          history: messages.map((m) => ({ sender: m.sender, text: m.text })),
          passedTopics: passedQuestions.map((q) => q.domain || q.questionText.slice(0, 30)),
          failedTopics: failedQuestions.map((q) => q.domain || q.questionText.slice(0, 30)),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to receive tutor response');
      }

      soundFx.playSelect();
      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch {
      const fallbackReply = selectedQuestion
        ? `Here is the key insight: ${selectedQuestion.explanation} The target answer is "${selectedQuestion.correctAnswer}". Let's take it one step at a time: what part of this feels most surprising?`
        : `Great question! Focus on the underlying rule or mechanism. Would you like a simple analogy or a quick practice question to test it out?`;

      setMessages((prev) => [
        ...prev,
        {
          id: `tutor-err-${Date.now()}`,
          sender: 'tutor',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (msg: ChatMessage) => {
    soundFx.playClick();
    if (speakingMsgId === msg.id) {
      speechEngine.stop();
      setSpeakingMsgId(null);
      return;
    }

    setSpeakingMsgId(msg.id);
    speechEngine.speak(msg.text, {
      id: msg.id,
      onEnd: () => setSpeakingMsgId(null),
      onError: () => setSpeakingMsgId(null),
    });
  };

  const handleCopy = (msg: ChatMessage) => {
    soundFx.playClick();
    navigator.clipboard.writeText(msg.text);
    setCopiedMsgId(msg.id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col h-[750px] animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToSources && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onBackToSources();
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Back to Recommended Videos & Sources"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <MascotAvatar mood="happy" size="sm" />

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Quizzie's 1-on-1 AI Tutor Lounge
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Active Tutor
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized tutoring on what you failed and passed in "{quiz.quiz_title}"
            </p>
          </div>
        </div>

        {/* Tutor Style Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              soundFx.playSelect();
              setTutorStyle('friendly_mascot');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              tutorStyle === 'friendly_mascot'
                ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>🦉 Quizzie (Analogies)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playSelect();
              setTutorStyle('socratic');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              tutorStyle === 'socratic'
                ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>🎓 Socratic</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playSelect();
              setTutorStyle('quick_booster');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              tutorStyle === 'quick_booster'
                ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>⚡ High-Yield</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundFx.playSelect();
              setTutorStyle('deep_dive');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              tutorStyle === 'deep_dive'
                ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>🔬 Deep Dive</span>
          </button>
        </div>
      </div>

      {/* Focus Question Selector Bar */}
      <div className="px-4 py-2.5 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="font-extrabold text-slate-500 dark:text-slate-400 whitespace-nowrap">
          Focus Item:
        </span>

        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            setSelectedQuestionId('general');
          }}
          className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
            selectedQuestionId === 'general'
              ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          ✨ Full Quiz Diagnostics
        </button>

        {failedQuestions.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => {
              soundFx.playClick();
              setSelectedQuestionId(q.id);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer border ${
              selectedQuestionId === q.id
                ? 'bg-amber-500 text-white border-amber-600 font-extrabold shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Missed Q#{q.id}</span>
          </button>
        ))}

        {passedQuestions.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => {
              soundFx.playClick();
              setSelectedQuestionId(q.id);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer border ${
              selectedQuestionId === q.id
                ? 'bg-emerald-600 text-white border-emerald-700 font-extrabold shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Passed Q#{q.id}</span>
          </button>
        ))}
      </div>

      {/* Selected Question Context Card */}
      {selectedQuestion && (
        <div className="px-5 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="space-y-0.5 min-w-0">
            <span className="font-extrabold text-indigo-700 dark:text-indigo-300">
              Target Question #{selectedQuestion.id}:
            </span>
            <p className="text-slate-700 dark:text-slate-300 truncate max-w-xl font-medium">
              "{selectedQuestion.questionText}"
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-500">
              Your answer: <span className="font-bold text-red-500">{selectedQuestion.userAnswer}</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Correct: <span className="font-bold text-emerald-600">{selectedQuestion.correctAnswer}</span>
            </span>
          </div>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {msg.sender === 'tutor' ? (
              <MascotAvatar mood="happy" size="sm" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-extrabold text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}

            <div
              className={`rounded-2xl p-4 space-y-2 border ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 rounded-tl-xs shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-4 text-[10px] opacity-75">
                <span className="font-bold">{msg.sender === 'user' ? 'You' : 'Quizzie'}</span>
                <span>{msg.timestamp}</span>
              </div>

              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </div>

              {msg.sender === 'tutor' && (
                <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => handleSpeak(msg)}
                    className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                      speakingMsgId === msg.id
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700'
                        : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                    title="Read aloud"
                  >
                    {speakingMsgId === msg.id ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(msg)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs transition-colors cursor-pointer"
                    title="Copy note"
                  >
                    {copiedMsgId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-2xl">
            <MascotAvatar mood="thinking" size="sm" />
            <div className="rounded-2xl rounded-tl-xs p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Quizzie is tailoring a helpful explanation...
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Action Prompts */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">Quick prompts:</span>

        {selectedQuestion ? (
          <>
            <button
              type="button"
              onClick={() =>
                handleQuickPrompt(
                  `Why is "${selectedQuestion.correctAnswer}" correct instead of my answer "${selectedQuestion.userAnswer}"?`
                )
              }
              className="px-2.5 py-1 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
            >
              ❌ Why was my answer wrong?
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickPrompt(
                  `Can you give me a simple real-world analogy for "${selectedQuestion.questionText}" so I never forget it?`
                )
              }
              className="px-2.5 py-1 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
            >
              💡 Give me a fun analogy
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickPrompt(
                  `Test me! Give me a quick 1-question check to see if I truly understand "${selectedQuestion.questionText}" now.`
                )
              }
              className="px-2.5 py-1 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
            >
              🎯 Give me a practice check
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickPrompt(
                  `Give me a memorable mnemonic rhyme or memory trick to remember that the answer is "${selectedQuestion.correctAnswer}".`
                )
              }
              className="px-2.5 py-1 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
            >
              🧠 Give me a memory hook
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() =>
                handleQuickPrompt(
                  'Summarize my main strengths and the #1 topic I should practice next.'
                )
              }
              className="px-2.5 py-1 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
            >
              📊 Summarize my performance
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickPrompt(
                  'Can you give me an advanced problem that connects what I passed to real-world tech?'
                )
              }
              className="px-2.5 py-1 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
            >
              🚀 Real-world extension challenge
            </button>
          </>
        )}
      </div>

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputQuery);
        }}
        className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={
            selectedQuestion
              ? `Ask Quizzie about Q#${selectedQuestion.id}...`
              : 'Ask Quizzie anything about your quiz results...'
          }
          className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white transition-all outline-hidden"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || loading}
          className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
