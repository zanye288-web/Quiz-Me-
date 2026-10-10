import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Compass,
  BookOpen,
  Edit3,
  Plus,
  Trash2,
  ArrowRight,
  Lightbulb,
  RefreshCw,
  Award,
  TrendingUp,
} from 'lucide-react';
import { QuizResponse } from '../types/quiz';
import {
  computeSessionReflectionSummary,
  loadMyTakeaways,
  saveTakeawayNote,
  deleteTakeawayNote,
  TakeawayNote,
} from '../utils/adaptiveLearningEngine';
import { soundFx } from '../utils/audio';

interface SessionReflectionHooksProps {
  quiz: QuizResponse;
  answers: Array<{ questionId: number; isCorrect: boolean; userAnswer: string }>;
  fixedQuestionIds?: number[];
  onPracticeSuggestedTopic?: (topicPrompt: string) => void;
  onOpenMyNotesScreen?: () => void;
}

export const SessionReflectionHooks: React.FC<SessionReflectionHooksProps> = ({
  quiz,
  answers,
  fixedQuestionIds = [],
  onPracticeSuggestedTopic,
  onOpenMyNotesScreen,
}) => {
  const reflection = useMemo(
    () => computeSessionReflectionSummary(quiz, answers, fixedQuestionIds),
    [quiz, answers, fixedQuestionIds]
  );

  // One-line takeaway state
  const [oneLineTakeaway, setOneLineTakeaway] = useState('');
  const [selectedTopicTag, setSelectedTopicTag] = useState(
    reflection.shakiestTopics[0]?.topic ||
      reflection.strongestTopics[0]?.topic ||
      quiz.quiz_title
  );
  const [takeawaySavedBanner, setTakeawaySavedBanner] = useState(false);
  const [pastTakeaways, setPastTakeaways] = useState<TakeawayNote[]>(() => loadMyTakeaways());
  const [showPastTakeawaysDrawer, setShowPastTakeawaysDrawer] = useState(false);

  // "Explain it in your own words" state per missed question
  const [ownWordsMap, setOwnWordsMap] = useState<Record<number, string>>({});
  const [savedOwnWordsIds, setSavedOwnWordsIds] = useState<Set<number>>(new Set());

  const handleSaveTakeaway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oneLineTakeaway.trim()) return;
    soundFx.playComplete();

    const ownWordsArray = Object.entries(ownWordsMap)
      .filter(([, text]) => text.trim().length > 0)
      .map(([qIdStr, text]) => {
        const qId = Number(qIdStr);
        const qObj = quiz.questions.find((q) => q.id === qId);
        return {
          questionId: qId,
          questionText: qObj?.question || `Question #${qId}`,
          userExplanation: text.trim(),
          correctAnswer: qObj?.correct_answer || '',
        };
      });

    saveTakeawayNote({
      oneLineTakeaway: oneLineTakeaway.trim(),
      topic: selectedTopicTag || quiz.quiz_title,
      quizTitle: quiz.quiz_title,
      ownWordsExplanations: ownWordsArray.length > 0 ? ownWordsArray : undefined,
    });

    setPastTakeaways(loadMyTakeaways());
    setOneLineTakeaway('');
    setTakeawaySavedBanner(true);
    setTimeout(() => setTakeawaySavedBanner(false), 3500);
  };

  const handleSaveOwnWordsForQuestion = (qId: number, questionText: string, correctAnswer: string) => {
    const explanationText = (ownWordsMap[qId] || '').trim();
    if (!explanationText) return;
    soundFx.playSelect();

    saveTakeawayNote({
      oneLineTakeaway: `My Explanation (${questionText.slice(0, 55)}...): ${explanationText}`,
      topic: selectedTopicTag || quiz.quiz_title,
      quizTitle: quiz.quiz_title,
      ownWordsExplanations: [
        {
          questionId: qId,
          questionText,
          userExplanation: explanationText,
          correctAnswer,
        },
      ],
    });

    setSavedOwnWordsIds((prev) => {
      const next = new Set(prev);
      next.add(qId);
      return next;
    });
    setPastTakeaways(loadMyTakeaways());
  };

  const handleDeleteTakeaway = (id: string) => {
    soundFx.playClick();
    const updated = deleteTakeawayNote(id);
    setPastTakeaways(updated);
  };

  return (
    <div className="comic-panel pattern-halftone rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-7 space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="comic-badge px-2.5 py-0.5 rounded-lg bg-amber-300 text-slate-950 border-2 border-slate-950 text-[10px] font-black uppercase tracking-wider">
              REFLECTION &amp; METACOGNITION
            </span>
            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
              End-of-Session Debrief • Turn Practice into Lasting Memory
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            Session Reflection Summary &amp; One-Line Takeaway
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              setShowPastTakeawaysDrawer((prev) => !prev);
            }}
            className="comic-panel-sm px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-black hover:bg-indigo-100 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              {showPastTakeawaysDrawer
                ? 'Hide My Notes'
                : `My Notes & Takeaways (${pastTakeaways.length})`}
            </span>
          </button>

          {onOpenMyNotesScreen && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenMyNotesScreen();
              }}
              className="comic-panel-sm px-3.5 py-2 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Full My Notes Tab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4-Part Session Summary Grid: Strongest Topics, Shakiest Topics, Questions Missed, & 1 Suggestion */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Strongest Topics */}
        <div className="comic-panel-sm rounded-2xl p-4 bg-emerald-50/70 dark:bg-emerald-950/30 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Strongest Topics</span>
          </div>
          {reflection.strongestTopics.length > 0 ? (
            <div className="space-y-2">
              {reflection.strongestTopics.map((t) => (
                <div
                  key={t.topic}
                  className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-800/70 flex items-center justify-between gap-2 text-xs"
                >
                  <span className="font-extrabold text-slate-900 dark:text-white truncate">
                    {t.topic}
                  </span>
                  <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 shrink-0">
                    {t.accuracy}% ({t.correct}/{t.total})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Keep practicing! Topics with 70%+ accuracy will shine here as your strongest pillars.
            </p>
          )}
        </div>

        {/* 2. Shakiest Topics */}
        <div className="comic-panel-sm rounded-2xl p-4 bg-amber-50/70 dark:bg-amber-950/30 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-black text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Shakiest Topics (To Grow)</span>
          </div>
          {reflection.shakiestTopics.length > 0 ? (
            <div className="space-y-2">
              {reflection.shakiestTopics.map((t) => (
                <div
                  key={t.topic}
                  className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-amber-200 dark:border-amber-800/70 flex items-center justify-between gap-2 text-xs"
                >
                  <span className="font-extrabold text-slate-900 dark:text-white truncate">
                    {t.topic}
                  </span>
                  <span className="font-mono font-black text-amber-700 dark:text-amber-300 shrink-0">
                    {t.accuracy}% ({t.correct}/{t.total})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">
              🌟 Zero shaky topics in this session! You hit 75%+ across every topic tested.
            </p>
          )}
        </div>

        {/* 3. Questions Missed */}
        <div className="comic-panel-sm rounded-2xl p-4 bg-indigo-50/60 dark:bg-indigo-950/30 space-y-2.5">
          <div className="flex items-center justify-between text-indigo-900 dark:text-indigo-300 font-black text-xs uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Questions Missed</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-200/80 dark:bg-indigo-900 text-[10px]">
              {reflection.questionsMissed.length} Missed
            </span>
          </div>
          {reflection.questionsMissed.length > 0 ? (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {reflection.questionsMissed.map((m) => (
                <div
                  key={m.question.id}
                  className="p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-indigo-200/80 dark:border-indigo-800/70 text-[11px] space-y-0.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-black text-indigo-700 dark:text-indigo-300">
                      Q#{m.question.id} • {m.question.difficulty || 'Intermediate'}
                    </span>
                    {m.fixedInSession && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[9px]">
                        ✓ Fixed in Review!
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold line-clamp-2">
                    {m.question.question}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">
              🎯 Clean sweep! You didn’t miss a single question in this session.
            </p>
          )}
        </div>

        {/* 4. One Suggestion for What to Practice Next */}
        <div className="comic-panel-sm rounded-2xl p-4 bg-gradient-to-br from-violet-50 via-white to-amber-50/60 dark:from-violet-950/40 dark:via-slate-900 dark:to-amber-950/20 flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-violet-800 dark:text-violet-300 font-black text-xs uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-violet-600 shrink-0" />
              <span>What to Practice Next</span>
            </div>
            <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
              {reflection.nextPracticeSuggestion.headline}
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {reflection.nextPracticeSuggestion.rationale}
            </p>
          </div>

          {onPracticeSuggestedTopic && (
            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                onPracticeSuggestedTopic(reflection.nextPracticeSuggestion.samplePrompt);
              }}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Practice This Next</span>
            </button>
          )}
        </div>
      </div>

      {/* Optional "Explain It In Your Own Words" Prompt for Missed / Repeatedly Missed Questions */}
      {reflection.questionsMissed.length > 0 && (
        <div className="comic-panel-sm rounded-2xl p-4 sm:p-5 bg-amber-50/50 dark:bg-slate-800/60 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                🧠 Explain It In Your Own Words (Optional Reflection Prompt)
              </h4>
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Restating a tricky concept in your own words is the #1 way to stop missing it!
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reflection.questionsMissed.slice(0, 4).map((m) => {
              const isSaved = savedOwnWordsIds.has(m.question.id);
              return (
                <div
                  key={m.question.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      {m.missCount > 1
                        ? `Missed ${m.missCount}x — High-Yield Reflection`
                        : 'Missed Concept Reflection'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 truncate">
                      Answer: {m.question.correct_answer}
                    </span>
                  </div>

                  <p className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                    {m.question.question}
                  </p>

                  <textarea
                    rows={2}
                    value={ownWordsMap[m.question.id] || ''}
                    onChange={(e) =>
                      setOwnWordsMap((prev) => ({
                        ...prev,
                        [m.question.id]: e.target.value,
                      }))
                    }
                    placeholder="In your own words, why does the correct answer make sense here?"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none resize-none"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Optional • Saves to My Notes
                    </span>
                    <button
                      type="button"
                      disabled={!ownWordsMap[m.question.id]?.trim() || isSaved}
                      onClick={() =>
                        handleSaveOwnWordsForQuestion(
                          m.question.id,
                          m.question.question,
                          m.question.correct_answer
                        )
                      }
                      className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer disabled:opacity-40 ${
                        isSaved
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {isSaved ? '✓ Saved to My Notes!' : 'Save Explanation'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Save a One-Line Takeaway per Session or Topic */}
      <form
        onSubmit={handleSaveTakeaway}
        className="comic-panel-sm rounded-2xl p-4 sm:p-5 bg-indigo-50/50 dark:bg-indigo-950/25 space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
              📓 Save a One-Line Takeaway from This Session
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Topic Tag:</span>
            <input
              type="text"
              value={selectedTopicTag}
              onChange={(e) => setSelectedTopicTag(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-indigo-700 dark:text-indigo-300 w-44"
              placeholder="Topic..."
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            maxLength={240}
            value={oneLineTakeaway}
            onChange={(e) => setOneLineTakeaway(e.target.value)}
            placeholder="Write one key rule, insight, or distinction you want to remember next time..."
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!oneLineTakeaway.trim()}
            className="comic-panel-sm px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Save to My Notes</span>
          </button>
        </div>

        {takeawaySavedBanner && (
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center justify-between animate-in fade-in duration-200">
            <span>✨ One-line takeaway saved to your "My Notes" journal!</span>
            <button
              type="button"
              onClick={() => setShowPastTakeawaysDrawer(true)}
              className="underline font-black cursor-pointer"
            >
              View Past Takeaways
            </button>
          </div>
        )}
      </form>

      {/* Collapsible Inline "My Notes" Past Takeaways Viewer */}
      {showPastTakeawaysDrawer && (
        <div className="comic-panel-sm rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <h4 className="font-black text-sm text-slate-900 dark:text-white">
                My Notes — Saved One-Line Takeaways ({pastTakeaways.length})
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowPastTakeawaysDrawer(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Close ✕
            </button>
          </div>

          {pastTakeaways.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              No takeaways saved yet. Write a one-line takeaway above to start your personal journal!
            </p>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {pastTakeaways.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-black uppercase">
                        {note.topic}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(note.createdAt).toLocaleDateString()} • {note.quizTitle}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                      “{note.oneLineTakeaway}”
                    </p>
                    {note.ownWordsExplanations && note.ownWordsExplanations.length > 0 && (
                      <div className="pt-1 space-y-1">
                        {note.ownWordsExplanations.map((ow, i) => (
                          <div
                            key={i}
                            className="text-[11px] bg-amber-50/80 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200/70 dark:border-amber-800/50 text-slate-700 dark:text-slate-300"
                          >
                            <span className="font-black text-amber-800 dark:text-amber-300">
                              In My Own Words:
                            </span>{' '}
                            {ow.userExplanation}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTakeaway(note.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                    title="Delete takeaway"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
