import React, { useState, useRef } from 'react';
import {
  FileEdit,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  RefreshCw,
  Edit3,
  BookmarkPlus,
  ShieldCheck,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { evaluateWrittenAnswer } from '../services/examinerService';
import { WrittenAnswerEvaluation, ExamBoard } from '../types/examinerIntelligence';
import { soundFx } from '../utils/audio';

interface WrittenAnswerExaminerProps {
  onSaveMistake?: (mistake: {
    questionText: string;
    studentAnswer: string;
    correctAnswer: string;
    explanation: string;
    subject: string;
    topic: string;
  }) => void;
  onOpenNotes?: (subject: string, topic: string) => void;
}

const PRESET_PRACTICE_QUESTIONS = [
  {
    board: 'WAEC' as ExamBoard,
    subject: 'Biology',
    topic: 'Osmosis and Plant Water Relations',
    maxMarks: 10,
    question:
      'Explain what happens to a plant cell placed in a concentrated (hypertonic) sucrose solution. In your answer, define plasmolysis, describe the movement of water molecules in terms of water potential, and explain the appearance of the cell protoplast and cell wall.',
    modelCriteria:
      'M1: Definition of hypertonic solution / lower water potential (2 marks). M2: Net movement of water out of vacuole by osmosis down water potential gradient (3 marks). M3: Shrinking of protoplasm away from cellulose cell wall (plasmolysis) (3 marks). A1: Preservation of outer cell wall shape due to rigid cellulose structure (2 marks).',
  },
  {
    board: 'Cambridge_IGCSE' as ExamBoard,
    subject: 'Physics',
    topic: 'Kinematics and Velocity-Time Graphs',
    maxMarks: 8,
    question:
      'A skydiver of mass 75 kg jumps from an aircraft. Describe and explain the motion of the skydiver from the moment of jumping until terminal velocity is reached. Refer to forces, acceleration, and air resistance.',
    modelCriteria:
      'M1: Initial acceleration equals acceleration of free fall g (weight is the only force) (2 marks). M2: As velocity increases, drag/air resistance increases proportionally (2 marks). M3: Resultant force downwards decreases, hence acceleration decreases according to F = ma (2 marks). A1: At terminal velocity, upward drag equals downward weight; resultant force is zero; acceleration is zero and speed is constant (2 marks).',
  },
  {
    board: 'WAEC' as ExamBoard,
    subject: 'General Mathematics',
    topic: 'Algebraic Quadratic Word Problems',
    maxMarks: 8,
    question:
      'The length of a rectangular plot of land is 5 meters more than twice its width. If the total area of the plot is 133 square meters, write down an algebraic quadratic equation, find the width and length of the plot, and calculate its perimeter.',
    modelCriteria:
      'M1: Let width = w. Length = 2w + 5 (1 mark). M2: Form equation w(2w + 5) = 133 => 2w² + 5w - 133 = 0 (2 marks). M3: Solve quadratic using formula or factorizing (w - 7)(2w + 19) = 0 (2 marks). A1: Reject negative root w = -19/2, state width = 7 m (1 mark). A2: Length = 2(7) + 5 = 19 m (1 mark). A3: Perimeter = 2(7 + 19) = 52 m (1 mark).',
  },
  {
    board: 'SAT' as ExamBoard,
    subject: 'Digital SAT Mathematics',
    topic: 'Advanced Functions & Remainder Theorem',
    maxMarks: 6,
    question:
      'Polynomial P(x) = 2x³ - 5x² + kx - 12 is divisible by (x - 3). Find the constant value of k, and hence determine all real roots of P(x).',
    modelCriteria:
      'M1: Apply Factor Theorem P(3) = 0 (1 mark). M2: Substitute x = 3: 2(27) - 5(9) + 3k - 12 = 0 => 54 - 45 + 3k - 12 = 0 => 3k - 3 = 0 => k = 1 (2 marks). M3: Divide polynomial by (x - 3) to get quadratic quotient 2x² + x + 4 (2 marks). A1: Show discriminant of 2x² + x + 4 is 1² - 4(2)(4) = -31 < 0, concluding the only real root is x = 3 (1 mark).',
  },
];

export const WrittenAnswerExaminer: React.FC<WrittenAnswerExaminerProps> = ({
  onSaveMistake,
  onOpenNotes,
}) => {
  const [selectedBoard, setSelectedBoard] = useState<ExamBoard>('WAEC');
  const [subject, setSubject] = useState<string>('Biology');
  const [topic, setTopic] = useState<string>('Osmosis and Plant Water Relations');
  const [maxMarks, setMaxMarks] = useState<number>(10);
  const [questionText, setQuestionText] = useState<string>(PRESET_PRACTICE_QUESTIONS[0].question);
  const [studentAnswerText, setStudentAnswerText] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<WrittenAnswerEvaluation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPreset = (preset: typeof PRESET_PRACTICE_QUESTIONS[0]) => {
    setSelectedBoard(preset.board);
    setSubject(preset.subject);
    setTopic(preset.topic);
    setMaxMarks(preset.maxMarks);
    setQuestionText(preset.question);
    setEvaluation(null);
    setErrorMessage(null);
    soundFx.playClick();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 10MB limit. Please upload a compressed photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      soundFx.playPop();
    };
    reader.readAsDataURL(file);
  };

  const handleEvaluate = async () => {
    if (!questionText.trim()) {
      setErrorMessage('Please provide an examination question.');
      return;
    }

    if (!studentAnswerText.trim() && !imagePreview) {
      setErrorMessage('Please either type your written answer or upload a photo/scan of your written work.');
      return;
    }

    setIsEvaluating(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    try {
      const result = await evaluateWrittenAnswer({
        questionText: questionText.trim(),
        studentAnswerText: studentAnswerText.trim(),
        imageBase64: imagePreview || undefined,
        subject,
        topic,
        examBoard: selectedBoard,
        maxMarks,
      });

      setEvaluation(result);
      if (result.percentageScore >= 70) {
        soundFx.playCorrect();
      } else {
        soundFx.playIncorrect();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to evaluate answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveToNotebook = () => {
    if (!evaluation || !onSaveMistake) return;
    onSaveMistake({
      questionText: evaluation.questionText,
      studentAnswer: evaluation.studentAnswerText || '(Handwritten submission)',
      correctAnswer: evaluation.modelExaminerAnswer,
      explanation: `${evaluation.examinerFeedback}\n\nMissing points:\n• ${evaluation.missingKeyPoints.join('\n• ')}`,
      subject: evaluation.subject,
      topic: evaluation.topic,
    });
    setSavedSuccess(true);
    soundFx.playComplete();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <FileEdit className="w-4 h-4" />
              <span>Examiner Intelligence Syndicate</span>
              <span aria-hidden="true">·</span>
              <span>Advanced Written Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Advanced Written Answer Examiner
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Type or upload a photo of your handwritten examination answers. The AI Chief Examiner evaluates your
              response against official marking schemes, awards method and accuracy marks, and flags crucial missing points.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exam Board:</span>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value as ExamBoard)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="WAEC">WAEC (WASSCE)</option>
              <option value="Cambridge_IGCSE">Cambridge IGCSE</option>
              <option value="Cambridge_ALevel">Cambridge AS & A Level</option>
              <option value="JAMB">JAMB UTME</option>
              <option value="SAT">Digital SAT</option>
              <option value="NECO">NECO</option>
            </select>
          </div>
        </div>

        {/* Preset Questions Selector */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Practice With Standard Past Examination Questions:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESET_PRACTICE_QUESTIONS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(p)}
                className={`p-3 text-left rounded-xl border text-xs transition-all ${
                  questionText === p.question
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-200 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-slate-900 dark:text-white truncate">
                  {p.board.replace('_', ' ')} · {p.subject}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{p.topic}</div>
                <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                  {p.maxMarks} Marks Available
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form: Question & Student Submission */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Question Prompt
                </label>
                <span className="text-xs font-semibold text-slate-500">{maxMarks} Marks</span>
              </div>
              <textarea
                rows={4}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Type or paste the exam question here..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Answer Mode: Typed or Handwritten Photo */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  Your Answer Submission
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {imagePreview && (
                <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                  <img src={imagePreview} alt="Handwritten work scan" className="w-full max-h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-1 left-2 text-[10px] text-white/90 bg-slate-900/60 px-2 py-0.5 rounded">
                    Handwritten page attached for examiner OCR
                  </div>
                </div>
              )}

              <textarea
                rows={7}
                value={studentAnswerText}
                onChange={(e) => setStudentAnswerText(e.target.value)}
                placeholder="Type your structured explanation, step-by-step mathematical working, or definition here (or refer to uploaded photo above)..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating with Chief Examiner AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit for Examiner Assessment</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Examiner Assessment Report (7 cols) */}
        <div className="lg:col-span-7">
          {evaluation ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
              {/* Score Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>{evaluation.examBoard.replace('_', ' ')} Examiner Assessment</span>
                    <span aria-hidden="true">·</span>
                    <span>{evaluation.subject}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Official Marking Feedback
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {evaluation.awardedMarks} / {evaluation.maxMarks}
                    </div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {evaluation.percentageScore}% ({evaluation.correctnessLevel.toUpperCase()})
                    </div>
                  </div>
                </div>
              </div>

              {/* Point-by-point Criteria Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span>Marking Scheme Criteria Breakdown:</span>
                </h4>
                <div className="space-y-2">
                  {evaluation.criteriaBreakdown.map((crit, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                        crit.passed
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-800/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          {crit.passed ? (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-red-500 shrink-0" />
                          )}
                          <span>{crit.criterion}</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 pl-6">{crit.examinerComment}</div>
                      </div>
                      <div className="font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
                        {crit.awardedMarks} / {crit.maxMarks}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Key Points & Misconceptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evaluation.missingKeyPoints.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-2">
                    <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Missing Examiner Points</span>
                    </div>
                    <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-amber-900 dark:text-amber-200">
                      {evaluation.missingKeyPoints.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {evaluation.misconceptionsDetected.length > 0 && (
                  <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 space-y-2">
                    <div className="text-xs font-bold text-red-800 dark:text-red-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Misconceptions Detected</span>
                    </div>
                    <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-red-900 dark:text-red-200">
                      {evaluation.misconceptionsDetected.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Model Examiner Answer */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>Authoritative Model Answer (Full Marks):</span>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
                  {evaluation.modelExaminerAnswer}
                </div>
              </div>

              {/* Chief Examiner Feedback & Actions */}
              <div className="space-y-3 pt-2">
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-indigo-50/40 dark:bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300">Examiner Advice: </span>
                  {evaluation.examinerFeedback}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {onSaveMistake && (
                    <button
                      onClick={handleSaveToNotebook}
                      disabled={savedSuccess}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                        savedSuccess
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-500'
                      }`}
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>{savedSuccess ? 'Saved to Mistake Notebook!' : 'Save to Mistake Notebook'}</span>
                    </button>
                  )}

                  {onOpenNotes && (
                    <button
                      onClick={() => onOpenNotes(evaluation.subject, evaluation.nextRevisionTopic)}
                      className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Study Notes: {evaluation.nextRevisionTopic}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[380px] bg-slate-50/60 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              <div className="max-w-md">
                <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
                  Ready for Marking
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Select a preset past question or enter your own, type your explanation or upload a photograph of your
                  handwritten solution, and click &quot;Submit for Examiner Assessment&quot;.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
