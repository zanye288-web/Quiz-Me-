import React, { useState } from 'react';
import { X, Send, Bot, User, RefreshCw, Lightbulb, Sparkles, BookOpen } from 'lucide-react';
import { Question, PersonaType } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { MascotAvatar } from './MascotAvatar';

interface AskTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  persona: PersonaType;
  onGenerateNotes?: (topic: string) => void;
}

interface ChatMessage {
  sender: 'user' | 'tutor';
  text: string;
}

export const AskTutorDrawer: React.FC<AskTutorDrawerProps> = ({
  isOpen,
  onClose,
  question,
  persona,
  onGenerateNotes,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  if (!isOpen || !question) return null;

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;
    setQuery('');
    soundFx.playClick();

    setMessages((prev) => [...prev, { sender: 'user', text: promptText }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.prompt || question.question,
          userQuery: promptText,
          persona,
          correctAnswer: question.correct_answer,
          explanation: question.explanation,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to query AI tutor');
      }

      setMessages((prev) => [...prev, { sender: 'tutor', text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'tutor',
          text: `Here is the explanation: ${question.explanation || 'Review the key concepts in the prompt.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md sm:max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 transition-colors">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <MascotAvatar
              mood={persona === 'Teacher' ? 'teacher' : 'thinking'}
              size="sm"
            />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>AI Academic Tutor</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {persona} Mode
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ask anything to understand the concept better
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Context */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs space-y-1">
          <span className="font-extrabold uppercase tracking-wider text-[10px] text-slate-400">
            Current Question:
          </span>
          <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
            {question.prompt || question.question}
          </p>
        </div>

        {/* Quick Query Suggestions */}
        <div className="p-3 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => handleSendPrompt('Why is this answer the correct one?')}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 whitespace-nowrap font-bold transition-colors cursor-pointer"
          >
            💡 Why is this answer correct?
          </button>
          <button
            type="button"
            onClick={() => handleSendPrompt('Can you give a simple real-world analogy?')}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 whitespace-nowrap font-bold transition-colors cursor-pointer"
          >
            🧩 Give a real-world example
          </button>
          <button
            type="button"
            onClick={() => handleSendPrompt('What are the common mistakes students make on this topic?')}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 whitespace-nowrap font-bold transition-colors cursor-pointer"
          >
            ⚠️ Common mistakes
          </button>
          {onGenerateNotes && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onGenerateNotes(question.domain || question.prompt || 'Core Concept');
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 whitespace-nowrap font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3" />
              <span>Create Study Notes</span>
            </button>
          )}
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {/* Welcome intro */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-200 dark:border-indigo-800">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs leading-relaxed max-w-[85%] space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">
                Hi there! Need help with this question?
              </p>
              <p>
                Click one of the suggestions above or type your question below. I can break down tricky terms or explain step-by-step!
              </p>
            </div>
          </div>

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'tutor' && (
                <div className="shrink-0 -mt-1">
                  <MascotAvatar
                    mood={persona === 'Teacher' ? 'teacher' : 'happy'}
                    size="sm"
                  />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-xs font-medium'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/60 dark:border-slate-700'
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>AI Tutor is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(query);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
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
