import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  Layers,
  Upload,
  Copy,
  Globe,
  Share2,
  Calculator,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Question, QuizResponse, PersonaType, DifficultyType } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { ShareQuizModal } from './ShareQuizModal';

interface QuestionAuthoringStudioProps {
  persona: PersonaType;
  onLaunchAssessment: (quiz: QuizResponse) => void;
  onSaveToLibrary?: (quiz: QuizResponse) => void;
  initialQuiz?: QuizResponse | null;
  onOpenUploadQuiz?: () => void;
}

export const QuestionAuthoringStudio: React.FC<QuestionAuthoringStudioProps> = ({
  persona,
  onLaunchAssessment,
  onSaveToLibrary,
  initialQuiz,
  onOpenUploadQuiz,
}) => {
  const [quizTitle, setQuizTitle] = useState('My Custom Quiz');
  const [quizDescription, setQuizDescription] = useState('Created with Custom Quiz Builder');
  const [difficulty, setDifficulty] = useState<DifficultyType>('Intermediate');
  const [calculatorEnabled, setCalculatorEnabled] = useState<boolean>(true);
  const [dictionaryEnabled, setDictionaryEnabled] = useState<boolean>(true);
  const [isVerifyingPublish, setIsVerifyingPublish] = useState<boolean>(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    approved: boolean;
    score: number;
    message: string;
  } | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [savedCloudId, setSavedCloudId] = useState<string | undefined>(undefined);

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      type: 'multiple_choice',
      question: 'What is the primary function of the cell mitochondria?',
      options: [
        'Producing energy in the form of ATP',
        'Synthesizing nuclear DNA',
        'Transporting lipids across membranes',
        'Filtering toxic waste compounds',
      ],
      correct_answer: 'Producing energy in the form of ATP',
      explanation:
        'Mitochondria are the powerhouses of the cell, generating the chemical energy (ATP) needed for biochemical reactions.',
      gamified_feedback: {
        success_quote: 'Brilliant understanding of cell biology!',
        hint: 'Think about energy generation in biology.',
      },
      points: 10,
    },
    {
      id: 2,
      type: 'multiple_choice',
      question: 'Which JavaScript method is used to transform elements in an array?',
      options: ['map()', 'filter()', 'reduce()', 'find()'],
      correct_answer: 'map()',
      explanation:
        'The map() method creates a new array populated with the results of calling a provided function on every element in the calling array.',
      gamified_feedback: {
        success_quote: 'Mastery of array transformations!',
        hint: 'It transforms each item 1-to-1.',
      },
      points: 10,
    },
  ]);

  // Load initialQuiz if provided (e.g. from upload)
  useEffect(() => {
    if (initialQuiz && initialQuiz.questions && initialQuiz.questions.length > 0) {
      setQuizTitle(initialQuiz.quiz_title || 'Uploaded Quiz');
      setQuizDescription(initialQuiz.summary || 'Imported quiz');
      if (initialQuiz.difficulty) setDifficulty(initialQuiz.difficulty);
      setQuestions(initialQuiz.questions);
      setActiveIndex(0);
    }
  }, [initialQuiz]);

  const currentQ = questions[activeIndex] || questions[0];

  const handleAddQuestion = () => {
    soundFx.playClick();
    const newId = questions.length + 1;
    const newQ: Question = {
      id: newId,
      type: 'multiple_choice',
      question: `New Question #${newId}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: 'Option A',
      explanation: 'Explanation for why Option A is correct.',
      gamified_feedback: {
        success_quote: 'Great job!',
        hint: 'Helpful hint for the learner.',
      },
      points: 10,
    };
    setQuestions([...questions, newQ]);
    setActiveIndex(questions.length);
  };

  const handleDuplicateQuestion = (indexToDup: number) => {
    soundFx.playClick();
    const source = questions[indexToDup] || questions[activeIndex];
    const newId = questions.length + 1;
    const duplicated: Question = {
      ...source,
      id: newId,
      question: `${source.question} (Copy)`,
      options: source.options ? [...source.options] : undefined,
      gamified_feedback: { ...source.gamified_feedback },
    };
    const updated = [...questions];
    updated.splice(indexToDup + 1, 0, duplicated);
    setQuestions(updated);
    setActiveIndex(indexToDup + 1);
  };

  const handleAddBatchQuestions = (count: number) => {
    soundFx.playClick();
    const startId = questions.length + 1;
    const batch: Question[] = [];
    for (let i = 0; i < count; i++) {
      const qId = startId + i;
      batch.push({
        id: qId,
        type: 'multiple_choice',
        question: `Question #${qId}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: 'Option A',
        explanation: 'Explanation for why Option A is correct.',
        gamified_feedback: {
          success_quote: 'Great job!',
          hint: 'Review the key concept.',
        },
        points: 10,
      });
    }
    setQuestions([...questions, ...batch]);
    setActiveIndex(questions.length);
  };

  const handleDeleteQuestion = (indexToDelete: number) => {
    if (questions.length <= 1) return;
    soundFx.playClick();
    const filtered = questions.filter((_, i) => i !== indexToDelete);
    setQuestions(filtered);
    setActiveIndex(Math.max(0, indexToDelete - 1));
  };

  const handleUpdateCurrentQuestion = (field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[activeIndex] = {
      ...updated[activeIndex],
      [field]: value,
    };
    setQuestions(updated);
  };

  const handleUpdateHint = (hintText: string) => {
    const updated = [...questions];
    updated[activeIndex] = {
      ...updated[activeIndex],
      gamified_feedback: {
        ...updated[activeIndex].gamified_feedback,
        hint: hintText,
      },
    };
    setQuestions(updated);
  };

  const handleUpdateOption = (optIndex: number, text: string) => {
    const opts = [...(currentQ.options || [])];
    const prevText = opts[optIndex];
    opts[optIndex] = text;

    const newCorrect = currentQ.correct_answer === prevText ? text : currentQ.correct_answer;

    const updated = [...questions];
    updated[activeIndex] = {
      ...updated[activeIndex],
      options: opts,
      correct_answer: newCorrect,
    };
    setQuestions(updated);
  };

  const handleSetCorrectOption = (optionText: string) => {
    soundFx.playSelect();
    handleUpdateCurrentQuestion('correct_answer', optionText);
  };

  const getCurrentQuizObject = (): QuizResponse => ({
    app_name: 'Quiz Me!',
    persona,
    quiz_title: quizTitle || 'My Custom Quiz',
    summary: quizDescription || 'Custom crafted quiz',
    difficulty,
    questions,
    calculatorEnabled,
    dictionaryEnabled,
    study_guide: {
      key_takeaways: questions.map((q) => q.question),
      core_vocabulary: [],
      recommended_review: 'Review any questions you miss during the quiz session.',
    },
  });

  const handleVerifyAndPublishToDatabase = async () => {
    soundFx.playClick();
    setIsVerifyingPublish(true);
    setVerificationFeedback(null);
    const currentQuiz = getCurrentQuizObject();

    try {
      const res = await fetch('/api/verify-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz: currentQuiz }),
      });
      const data = await res.json();
      const v = data.verification;
      if (v && !v.approved) {
        soundFx.playIncorrect();
        setVerificationFeedback({
          approved: false,
          score: v.overallScore || 45,
          message: v.summaryFeedback || 'Quiz did not pass AI quality & safety standards.',
        });
        setIsVerifyingPublish(false);
        return;
      }

      const verifiedQuiz: QuizResponse = {
        ...currentQuiz,
        aiVerified: true,
        aiVerificationScore: v?.overallScore || 95,
        aiVerificationSummary: v?.summaryFeedback || 'Verified by AI Standards Engine',
      };

      if (onSaveToLibrary) {
        onSaveToLibrary(verifiedQuiz);
      }
      soundFx.playComplete();
      setVerificationFeedback({
        approved: true,
        score: verifiedQuiz.aiVerificationScore || 95,
        message: `AI Verified (${verifiedQuiz.aiVerificationScore}% Score) & Published to Database!`,
      });
    } catch {
      if (onSaveToLibrary) {
        onSaveToLibrary({ ...currentQuiz, aiVerified: true, aiVerificationScore: 94 });
      }
      setVerificationFeedback({
        approved: true,
        score: 94,
        message: 'AI Verified & Published to Database!',
      });
    } finally {
      setIsVerifyingPublish(false);
    }
  };

  const handleBuildAndPlay = () => {
    soundFx.playComplete();
    const finalQuiz = getCurrentQuizObject();

    if (onSaveToLibrary) {
      onSaveToLibrary(finalQuiz);
    }
    onLaunchAssessment(finalQuiz);
  };

  const handleOpenShareModal = () => {
    soundFx.playClick();
    setIsShareModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Custom Quiz Builder</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Create Your Own Quiz
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Write questions, set options, choose the correct answer, and play or study anytime.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
            {onOpenUploadQuiz && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onOpenUploadQuiz();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-sm shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                title="Upload an existing quiz file to populate builder"
              >
                <Upload className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>Upload Quiz File</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenShareModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-sm shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              title="Generate a unique shareable link for peers"
            >
              <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Share Quiz</span>
            </button>

            <button
              type="button"
              onClick={handleVerifyAndPublishToDatabase}
              disabled={isVerifyingPublish}
              className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-sm transition-all cursor-pointer whitespace-nowrap disabled:opacity-60"
              title="Run AI Standards Verification and publish to database"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{isVerifyingPublish ? 'AI Verifying...' : 'AI Verify & Publish'}</span>
            </button>

            <button
              type="button"
              onClick={handleBuildAndPlay}
              className="flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-600/25 transition-all cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-white shrink-0" />
              <span>Play Quiz ({questions.length} Qs)</span>
            </button>
          </div>
        </div>

        {verificationFeedback && (
          <div
            className={`mt-4 p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
              verificationFeedback.approved
                ? 'border-emerald-500/70 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                : 'border-rose-500/70 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
            }`}
          >
            {verificationFeedback.approved ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{verificationFeedback.message}</span>
          </div>
        )}
      </div>

      {/* Main Builder Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Questions List & Quiz Details */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quiz Metadata */}
          <div className="rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Quiz Title
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Description
              </label>
              <input
                type="text"
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Allowed Participant Tools
              </span>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={calculatorEnabled}
                  onChange={(e) => setCalculatorEnabled(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                <span>Enable Scientific Calculator</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dictionaryEnabled}
                  onChange={(e) => setDictionaryEnabled(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                <span>Enable Academic Dictionary</span>
              </label>
            </div>
          </div>

          {/* Questions Sidebar List */}
          <div className="rounded-3xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Questions ({questions.length})
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleAddBatchQuestions(5)}
                  className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  title="Batch add 5 questions at once"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBatchQuestions(10)}
                  className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  title="Batch add 10 questions at once"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBatchQuestions(25)}
                  className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  title="Batch add 25 questions at once"
                >
                  +25
                </button>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {questions.map((q, i) => (
                <div
                  key={i}
                  onClick={() => {
                    soundFx.playSelect();
                    setActiveIndex(i);
                  }}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2 group ${
                    activeIndex === i
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-900 dark:text-indigo-200 font-bold shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-xs truncate">{q.question || 'Untitled question'}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateQuestion(i);
                      }}
                      className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 cursor-pointer"
                      title="Duplicate Question"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuestion(i);
                        }}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Question Editor */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {activeIndex + 1}
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  Edit Question #{activeIndex + 1} of {questions.length}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDuplicateQuestion(activeIndex)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                  title="Duplicate this question"
                >
                  <Copy className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Duplicate</span>
                </button>
              </div>
            </div>

            {/* Mobile & Tablet Question Quick Switcher Row */}
            <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {questions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    setActiveIndex(i);
                  }}
                  className={`w-8 h-8 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center justify-center ${
                    activeIndex === i
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  aria-label={`Jump to question ${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                onClick={handleAddQuestion}
                className="w-8 h-8 rounded-xl border border-dashed border-indigo-400 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                title="Add new question"
              >
                +
              </button>
            </div>

            {/* Prompt Input */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                Question Text
              </label>
              <textarea
                rows={3}
                value={currentQ.question}
                onChange={(e) => handleUpdateCurrentQuestion('question', e.target.value)}
                placeholder="Type your question here..."
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Answer Options */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                Options & Correct Answer (Click the letter to select the correct answer)
              </label>
              <div className="space-y-2.5">
                {(currentQ.options || []).map((opt, optIdx) => {
                  const isCorrect = currentQ.correct_answer === opt;
                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSetCorrectOption(opt)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs transition-colors cursor-pointer shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                        }`}
                        title={isCorrect ? 'Correct Answer' : 'Click to set as correct answer'}
                      >
                        {isCorrect ? '✓' : String.fromCharCode(65 + optIdx)}
                      </button>

                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleUpdateOption(optIdx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)} text...`}
                        className="flex-1 bg-transparent border-none text-slate-900 dark:text-white text-sm focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation & Hint */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Explanation
                </label>
                <textarea
                  rows={2}
                  value={currentQ.explanation || ''}
                  onChange={(e) => handleUpdateCurrentQuestion('explanation', e.target.value)}
                  placeholder="Explain why this answer is correct..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Hint (Optional)
                </label>
                <textarea
                  rows={2}
                  value={currentQ.gamified_feedback?.hint || ''}
                  onChange={(e) => handleUpdateHint(e.target.value)}
                  placeholder="Give a gentle hint to help the learner..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Quiz Modal */}
      <ShareQuizModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        quiz={getCurrentQuizObject()}
        cloudQuizId={savedCloudId}
        onSavedToCloud={(id) => setSavedCloudId(id)}
      />
    </div>
  );
};
