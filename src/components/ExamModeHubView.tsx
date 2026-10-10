import React, { useState } from 'react';
import {
  GraduationCap,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Zap,
  ShieldCheck,
  Award,
  BookOpen,
  SlidersHorizontal,
  Printer,
  Calculator,
  HelpCircle,
  X,
} from 'lucide-react';
import {
  ExamFormatId,
  PersonaType,
  DifficultyType,
  QuestionType,
  QuizResponse,
  AssessmentConfig,
} from '../types/quiz';
import {
  EXAM_FORMAT_CATALOG,
  getExamFormatSpec,
  buildPrebuiltExamByFormat,
  evaluateExamBoardGrade,
} from '../utils/examFormats';
import { soundFx } from '../utils/audio';

interface ExamModeHubViewProps {
  persona: PersonaType;
  assessmentConfig: AssessmentConfig;
  onUpdateAssessmentConfig: (cfg: Partial<AssessmentConfig>) => void;
  onStartExamQuiz?: (quiz: QuizResponse) => void;
  onStartQuiz?: (quiz: QuizResponse) => void;
  onOpenNotesGeneratorForExam?: (topic: string, examFormat: ExamFormatId) => void;
  onOpenNotesGenerator?: (topic: string, examFormat: ExamFormatId) => void;
  onOpenPastPapersHub?: (examFormat: ExamFormatId) => void;
  onOpenWorksheet?: (quiz: QuizResponse) => void;
  stats?: unknown;
}

export const ExamModeHubView: React.FC<ExamModeHubViewProps> = ({
  persona,
  assessmentConfig,
  onUpdateAssessmentConfig,
  onStartExamQuiz,
  onStartQuiz,
  onOpenNotesGeneratorForExam,
  onOpenNotesGenerator,
  onOpenPastPapersHub,
  onOpenWorksheet,
}) => {
  const launchQuiz = onStartExamQuiz || onStartQuiz || (() => {});
  const launchNotes = onOpenNotesGeneratorForExam || onOpenNotesGenerator;
  const [selectedFormatId, setSelectedFormatId] = useState<ExamFormatId>(
    assessmentConfig.examFormat || 'waec'
  );
  const activeSpec = getExamFormatSpec(selectedFormatId);

  const [subjectTopic, setSubjectTopic] = useState<string>(activeSpec.sampleTopics[0] || '');
  const [customSyllabusNotes, setCustomSyllabusNotes] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<DifficultyType>('Intermediate');
  const [paperSectionMode, setPaperSectionMode] = useState<'combined' | 'objective_only' | 'theory_only'>(
    selectedFormatId === 'jamb' ? 'objective_only' : 'combined'
  );
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(activeSpec.defaultTimeMinutes);
  const [feedbackTiming, setFeedbackTiming] = useState<'deferred' | 'instant'>(
    assessmentConfig.feedbackTiming || 'deferred'
  );
  const [calculatorAllowed, setCalculatorAllowed] = useState<boolean>(activeSpec.calculatorAllowed);
  const [isGeneratingExam, setIsGeneratingExam] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectFormat = (fmtId: ExamFormatId) => {
    soundFx.playSelect();
    const spec = getExamFormatSpec(fmtId);
    setSelectedFormatId(fmtId);
    setSubjectTopic(spec.sampleTopics[0] || '');
    setTimeLimitMinutes(spec.defaultTimeMinutes);
    setCalculatorAllowed(spec.calculatorAllowed);
    if (fmtId === 'jamb') {
      setPaperSectionMode('objective_only');
    } else {
      setPaperSectionMode('combined');
    }
    onUpdateAssessmentConfig({
      mode: 'exam',
      examFormat: fmtId,
      timeLimitMinutes: spec.defaultTimeMinutes,
      passingScorePercent: spec.defaultPassingScore,
      feedbackTiming,
      allowHints: spec.allowHintsInExam,
      calculatorEnabled: spec.calculatorAllowed,
    });
  };

  const handleLaunchInstantMock = (fmtId: ExamFormatId = selectedFormatId) => {
    soundFx.playComplete();
    const spec = getExamFormatSpec(fmtId);
    onUpdateAssessmentConfig({
      mode: 'exam',
      examFormat: fmtId,
      timeLimitMinutes,
      passingScorePercent: spec.defaultPassingScore,
      feedbackTiming,
      allowHints: feedbackTiming === 'instant',
      calculatorEnabled: calculatorAllowed,
    });
    const mockPaper = buildPrebuiltExamByFormat(fmtId, persona);
    launchQuiz({
      ...mockPaper,
      examFormat: fmtId,
      calculatorEnabled: calculatorAllowed,
    });
  };

  const handleGenerateCustomAiExam = async () => {
    soundFx.playClick();
    setErrorMsg(null);

    const effectiveTopic =
      subjectTopic.trim() ||
      activeSpec.sampleTopics[0] ||
      `${activeSpec.fullName} Comprehensive Examination`;

    let questionTypesToGenerate: QuestionType[] = activeSpec.defaultQuestionTypes;
    if (paperSectionMode === 'objective_only' || selectedFormatId === 'jamb') {
      questionTypesToGenerate = ['multiple_choice'];
    } else if (paperSectionMode === 'theory_only') {
      questionTypesToGenerate = ['open_explanation', 'fill_in_blank'];
    }

    const sectionInstruction =
      paperSectionMode === 'objective_only'
        ? 'Generate 100% Paper 1 Objective 4-option Multiple Choice questions (Options A–D).'
        : paperSectionMode === 'theory_only'
        ? 'Generate Paper 2 Structured Theory, Fill-in-the-Blank, and Free-Response questions with explicit mark-scheme rubrics.'
        : `Combine sections according to ${activeSpec.paperStructure}.`;

    const fullExamDirective = [
      `[OFFICIAL EXAMINATION BOARD BLUEPRINT — ${activeSpec.fullName.toUpperCase()}]`,
      activeSpec.aiBlueprintDirective,
      sectionInstruction,
      `Official Grading Scale: ${activeSpec.gradingScaleLabel}.`,
      customSyllabusNotes.trim()
        ? `Additional Candidate Syllabus / Past-Paper Focus: ${customSyllabusNotes.trim()}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    setIsGeneratingExam(true);
    setGenerationStatus(`Structuring ${activeSpec.shortName} Examination Blueprint...`);

    const t1 = setTimeout(() => {
      setGenerationStatus(
        `Drafting ${questionCount} ${activeSpec.shortName} questions & Chief Examiner mark scheme...`
      );
    }, 1500);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputText: `${activeSpec.fullName} — ${effectiveTopic}`,
          persona,
          questionTypes: questionTypesToGenerate,
          difficulty,
          questionCount,
          customInstructions: fullExamDirective,
          promptStyle: 'Exam Cram & High-Yield',
          intelligenceScope: 'exam_olympiad_rigor',
        }),
      });

      clearTimeout(t1);
      const data = await response.json();

      if (!response.ok || !data.success || !data.quiz) {
        throw new Error(data.error || 'Could not generate AI exam paper.');
      }

      onUpdateAssessmentConfig({
        mode: 'exam',
        examFormat: selectedFormatId,
        timeLimitMinutes,
        passingScorePercent: activeSpec.defaultPassingScore,
        feedbackTiming,
        allowHints: feedbackTiming === 'instant',
        calculatorEnabled: calculatorAllowed,
      });

      soundFx.playComplete();
      launchQuiz({
        ...data.quiz,
        quiz_title: `${activeSpec.badgeEmoji} ${activeSpec.shortName}: ${effectiveTopic}`,
        examFormat: selectedFormatId,
        calculatorEnabled: calculatorAllowed,
      });
    } catch (err: unknown) {
      clearTimeout(t1);
      const error = err as Error;
      soundFx.playIncorrect();
      setErrorMsg(
        error.message || 'Unable to generate custom AI exam right now. Launching official mock or retry.'
      );
    } finally {
      setIsGeneratingExam(false);
      setGenerationStatus('');
    }
  };

  // Sample grade preview for the selected board
  const sampleDistinction = evaluateExamBoardGrade(selectedFormatId, 82);
  const sampleCredit = evaluateExamBoardGrade(selectedFormatId, 62);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-in fade-in duration-300">
      {/* 1. HERO BANNER: OFFICIAL EXAM MODE & CBT SIMULATOR */}
      <div className="comic-tab-hero rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="comic-badge px-3 py-0.5 rounded-lg bg-amber-300 text-slate-950 border-2 border-slate-950 text-[11px] font-black uppercase tracking-wider">
                🎓 OFFICIAL EXAM MODE CENTER
              </span>
              <span className="px-3 py-0.5 rounded-full bg-slate-950/60 border border-white/25 text-emerald-300 text-xs font-extrabold">
                Checkpoint • WAEC (WASSCE) • JAMB CBT • NECO • IGCSE • SAT • AP/IB
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Standardized Examination Simulator &amp; Past-Paper Studio
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
              Practice under authentic examination board conditions with official command words, Paper 1 Objective &amp; Paper 2 Theory structures, CBT question jumpers, and authentic board grading scales ({activeSpec.gradingScaleLabel}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleLaunchInstantMock(selectedFormatId)}
              className="arcade-btn px-5 py-3 rounded-2xl bg-amber-300 hover:bg-amber-200 text-slate-950 border-2 border-slate-950 font-black text-xs sm:text-sm shadow-lg cursor-pointer flex items-center gap-2"
            >
              <span>⚡ Launch {activeSpec.shortName} Mock Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {launchNotes && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  launchNotes(
                    subjectTopic || activeSpec.sampleTopics[0] || activeSpec.fullName,
                    selectedFormatId
                  );
                }}
                className="arcade-btn px-4 py-3 rounded-2xl bg-slate-950/70 hover:bg-slate-950 text-white border-2 border-white/30 font-black text-xs sm:text-sm cursor-pointer flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-cyan-300" />
                <span>Exam Notes Generator</span>
              </button>
            )}

            {onOpenPastPapersHub && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onOpenPastPapersHub(selectedFormatId);
                }}
                className="arcade-btn px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-2 border-slate-950 font-black text-xs sm:text-sm cursor-pointer flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Past Papers &amp; Textbooks</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. STANDARDIZED EXAM FORMAT SELECTOR GRID (Checkpoint, WAEC, JAMB, NECO, IGCSE, SAT, AP/IB, Standard) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>1. Select Your Examination Format</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each format configures authentic paper structure, question types, command phrasing, and official board grading
            </p>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 self-start sm:self-center">
            Active Board: {activeSpec.badgeEmoji} {activeSpec.fullName}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {EXAM_FORMAT_CATALOG.map((fmt) => {
            const isSelected = selectedFormatId === fmt.id;
            return (
              <div
                key={fmt.id}
                onClick={() => handleSelectFormat(fmt.id)}
                className={`comic-pop-card rounded-3xl p-4 border-2 border-b-[5px] transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-indigo-600 dark:border-amber-400 border-b-indigo-900 bg-indigo-50/90 dark:bg-indigo-950/70 ring-2 ring-indigo-500/25 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 border-b-slate-400 dark:border-b-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center text-xl shadow-2xs">
                      {fmt.badgeEmoji}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg border ${
                        isSelected
                          ? 'bg-amber-300 text-slate-950 border-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {fmt.regionTag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                      {fmt.shortName}
                    </h3>
                    <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {fmt.paperStructure}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {fmt.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                    <span className="truncate">{fmt.gradingScaleLabel}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFormat(fmt.id);
                        handleLaunchInstantMock(fmt.id);
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Zap className="w-3 h-3 text-amber-300" />
                      <span>Instant Mock</span>
                    </button>

                    {onOpenWorksheet && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playClick();
                          onOpenWorksheet(buildPrebuiltExamByFormat(fmt.id, persona));
                        }}
                        className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 cursor-pointer"
                        title={`Open printable ${fmt.shortName} exam paper & mark scheme`}
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE EXAM BLUEPRINT & AI PAPER GENERATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Custom AI Exam Builder for Selected Format */}
        <div className="lg:col-span-8 comic-panel rounded-3xl bg-white dark:bg-slate-900 p-6 space-y-5 border-2 border-slate-900 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black uppercase">
                  {activeSpec.badgeEmoji} {activeSpec.shortName} GENERATOR
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {activeSpec.gradingScaleLabel}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                2. Configure &amp; Generate Your {activeSpec.shortName} Examination Paper
              </h3>
            </div>

            {/* Proctored Deferred vs Guided Instant Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 self-start">
              <button
                type="button"
                onClick={() => {
                  soundFx.playSelect();
                  setFeedbackTiming('deferred');
                  onUpdateAssessmentConfig({ mode: 'exam', feedbackTiming: 'deferred' });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  feedbackTiming === 'deferred'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                📋 Strict Exam (End Grading)
              </button>
              <button
                type="button"
                onClick={() => {
                  soundFx.playSelect();
                  setFeedbackTiming('instant');
                  onUpdateAssessmentConfig({ mode: 'exam', feedbackTiming: 'instant' });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  feedbackTiming === 'instant'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                💡 Guided Mark Scheme
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="p-1 text-amber-700 hover:text-amber-950 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Subject / Syllabus Topic Input */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Examination Subject &amp; Syllabus Topic
            </label>
            <input
              type="text"
              value={subjectTopic}
              onChange={(e) => setSubjectTopic(e.target.value)}
              placeholder={`e.g., ${activeSpec.sampleTopics[0]}`}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />

            {/* Quick Syllabus Topic Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-extrabold text-slate-400 mr-1">
                Official Syllabus Starters:
              </span>
              {activeSpec.sampleTopics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    setSubjectTopic(topic);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    subjectTopic === topic
                      ? 'bg-indigo-600 text-white border-indigo-700'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  {activeSpec.badgeEmoji} {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Paper Structure & Question Count / Timer Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Paper Section Structure */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Paper Section Format
              </label>
              <select
                value={paperSectionMode}
                onChange={(e) => {
                  soundFx.playSelect();
                  setPaperSectionMode(
                    e.target.value as 'combined' | 'objective_only' | 'theory_only'
                  );
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-extrabold text-slate-800 dark:text-slate-100"
              >
                <option value="combined">📑 Full Combined Paper (Obj + Theory)</option>
                <option value="objective_only">⚡ Paper 1: 100% Objective (MCQ A–D)</option>
                <option value="theory_only">✍️ Paper 2: Structured Theory &amp; Essay</option>
              </select>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Number of Questions
              </label>
              <div className="flex items-center gap-1">
                {[5, 10, 15, 25, 50].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setQuestionCount(cnt);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-black border cursor-pointer ${
                      questionCount === cnt
                        ? 'bg-indigo-600 text-white border-indigo-700'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            {/* Exam Duration Timer */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Time Limit (Minutes)
              </label>
              <div className="flex items-center gap-1">
                {[0, 10, 15, 20, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setTimeLimitMinutes(mins);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-black border cursor-pointer ${
                      timeLimitMinutes === mins
                        ? 'bg-amber-400 text-slate-950 border-slate-950'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {mins === 0 ? '∞' : `${mins}m`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional Custom Syllabus Notes / Past Question Text */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Optional Study Notes, Syllabus Excerpt, or Past-Question Focus
            </label>
            <textarea
              rows={2}
              value={customSyllabusNotes}
              onChange={(e) => setCustomSyllabusNotes(e.target.value)}
              placeholder="Paste specific textbook notes, syllabus objectives, or areas you want the AI Chief Examiner to test..."
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="button"
              disabled={isGeneratingExam}
              onClick={handleGenerateCustomAiExam}
              className="arcade-btn flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-emerald-800 border-b-[5px] border-b-emerald-950 font-black text-sm sm:text-base shadow-lg cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isGeneratingExam ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{generationStatus || `Building ${activeSpec.shortName} Paper...`}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>
                    Generate Custom AI {activeSpec.shortName} Exam ({questionCount} Qs)
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleLaunchInstantMock(selectedFormatId)}
              className="arcade-btn py-4 px-5 rounded-2xl bg-amber-300 hover:bg-amber-200 text-slate-950 border-2 border-slate-950 font-black text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span>Play Prebuilt {activeSpec.shortName} Mock</span>
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Selected Board Specification & Grading Scale Card */}
        <div className="lg:col-span-4 comic-panel rounded-3xl bg-slate-900 text-white p-6 space-y-4 border-2 border-slate-950">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/15">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{activeSpec.badgeEmoji}</span>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  OFFICIAL BOARD SPECIFICATION
                </div>
                <h3 className="text-base font-black text-white">{activeSpec.fullName}</h3>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/10 space-y-1">
              <div className="text-[10px] font-black uppercase text-indigo-300">
                Paper Structure
              </div>
              <div className="font-bold text-white">{activeSpec.paperStructure}</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 border border-white/10 space-y-1">
              <div className="text-[10px] font-black uppercase text-emerald-300">
                Grading Scale &amp; Score Conversion
              </div>
              <div className="font-bold text-white">{activeSpec.gradingScaleLabel}</div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
                  <div className="text-[10px] text-emerald-200 font-bold">82% Score →</div>
                  <div className="text-xs font-black text-emerald-300">
                    {sampleDistinction.gradeBadge}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/30">
                  <div className="text-[10px] text-amber-200 font-bold">62% Score →</div>
                  <div className="text-xs font-black text-amber-300">
                    {sampleCredit.gradeBadge}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 border border-white/10 space-y-1">
              <div className="text-[10px] font-black uppercase text-amber-300">
                Examiner Blueprint Directive
              </div>
              <p className="text-indigo-100 leading-relaxed text-[11px]">
                {activeSpec.aiBlueprintDirective}
              </p>
            </div>
          </div>

          {onOpenNotesGeneratorForExam && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenNotesGeneratorForExam(
                  subjectTopic || activeSpec.sampleTopics[0] || activeSpec.fullName,
                  selectedFormatId
                );
              }}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>Generate {activeSpec.shortName} Study Notes</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
