import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Bot,
  User,
  RefreshCw,
  Sparkles,
  BookOpen,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Play,
  RotateCcw,
  Target,
} from 'lucide-react';
import { Question, PersonaType } from '../types/quiz';
import { TutorChatMessage, IntelligentNote } from '../types/learningSystem';
import { soundFx } from '../utils/audio';

interface IntelligentTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  persona: PersonaType;
  currentQuizTitle?: string;
  question?: Question | null;
  initialQuery?: string;
  learnerContext?: {
    accuracy?: number;
    weakTopics?: string[];
    strongTopics?: string[];
    recentMistakes?: string[];
    activeGoals?: string[];
    currentLevel?: number;
  };
  onGenerateNotes?: (topic: string, subject?: string) => void;
  onStartPracticeQuiz?: (topic: string) => void;
}

export const IntelligentTutorDrawer: React.FC<IntelligentTutorDrawerProps> = ({
  isOpen,
  onClose,
  persona,
  currentQuizTitle,
  question,
  initialQuery,
  learnerContext,
  onGenerateNotes,
  onStartPracticeQuiz,
}) => {
  const [messages, setMessages] = useState<TutorChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'tutor',
      text: `Hello! I'm Quizzie, your personal AI Academic Tutor. How can I help you understand ${currentQuizTitle || 'your subject'} today? I can explain concepts step-by-step, diagnose why an answer was wrong, or create customized notes!`,
      timestamp: new Date().toISOString(),
      suggestedActions: [
        { label: 'Explain Step-by-Step', action: 'explain_concept' },
        { label: 'Create Study Notes', action: 'generate_notes' },
      ],
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // If initialQuery is passed when opening, trigger it
  useEffect(() => {
    if (isOpen && initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    soundFx.playClick();
    setInputQuery('');

    const userMsg: TutorChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: newHistory.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          learnerContext,
          currentQuizTitle,
          persona,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Tutor error');
      }

      const tutorMsg: TutorChatMessage = {
        id: `tutor_${Date.now()}`,
        sender: 'tutor',
        text: data.reply,
        timestamp: new Date().toISOString(),
        suggestedActions: data.suggestedActions || [
          { label: 'Create Study Notes', action: 'generate_notes' },
        ],
      };

      setMessages((prev) => [...prev, tutorMsg]);
      soundFx.playSelect();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `tutor_err_${Date.now()}`,
          sender: 'tutor',
          text: `When studying ${currentQuizTitle || 'this concept'}, focus on the first principles: identify the given conditions and verify each multiple-choice distractor against the core definition!`,
          timestamp: new Date().toISOString(),
          suggestedActions: [{ label: 'Create Study Notes', action: 'generate_notes' }],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string, label: string) => {
    soundFx.playClick();
    if (action === 'generate_notes' && onGenerateNotes) {
      onGenerateNotes(currentQuizTitle || 'Study Subject');
    } else if (action === 'start_quiz' && onStartPracticeQuiz) {
      onStartPracticeQuiz(currentQuizTitle || 'Practice');
    } else {
      handleSendMessage(`Can you help me with: ${label}?`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md sm:max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-purple-50/30 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  AI Personal Academic Tutor
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {persona}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentQuizTitle ? `Coaching on "${currentQuizTitle}"` : 'Adaptive Learning Assistant'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onGenerateNotes && (
              <button
                type="button"
                onClick={() => onGenerateNotes(currentQuizTitle || 'Core Subject')}
                className="p-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                title="Create Notes on this Topic"
              >
                <BookOpen className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Question Context if active */}
        {question && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <span className="font-extrabold uppercase tracking-wider text-[10px] text-slate-400">
              Active Question Context:
            </span>
            <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
              {question.prompt || question.question}
            </p>
          </div>
        )}

        {/* Quick Suggested Queries */}
        <div className="p-2.5 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => handleSendMessage('Can you explain this concept in simple language step-by-step?')}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 whitespace-nowrap font-bold transition-colors cursor-pointer"
          >
            💡 Explain step-by-step
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('Give a real-world analogy to make this intuitive.')}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 whitespace-nowrap font-bold transition-colors cursor-pointer"
          >
            🧩 Real-world analogy
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('What are common misconceptions learners make on this topic?')}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 whitespace-nowrap font-bold transition-colors cursor-pointer"
          >
            ⚠️ Common mistakes
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage('What should I study next to solidify my understanding?')}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 whitespace-nowrap font-bold transition-colors cursor-pointer"
          >
            🎯 What should I study next?
          </button>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'tutor' && (
                <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-200 dark:border-indigo-800">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="max-w-[85%] space-y-2">
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-xs font-medium shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/60 dark:border-slate-700'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Suggested Action Pills under tutor message */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {msg.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleActionClick(act.action, act.label)}
                        className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic pt-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Quizzie is formulating pedagogical explanation...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask Quizzie anything about this topic or question..."
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-all shrink-0 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
