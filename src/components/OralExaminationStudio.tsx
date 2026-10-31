import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { processOralExamTurn } from '../services/examinerService';
import { OralExamSession, OralExamTurn, ExamBoard } from '../types/examinerIntelligence';
import { soundFx } from '../utils/audio';

interface OralExaminationStudioProps {
  onOpenNotes?: (subject: string, topic: string) => void;
  onOpenMistakeNotebook?: () => void;
}

const PRESET_VIVA_TOPICS = [
  {
    board: 'Cambridge_IGCSE' as ExamBoard,
    subject: 'Biology',
    topic: 'Gas Exchange & Respiratory Adaptations in Mammals',
    level: 'Upper Secondary / IGCSE',
    starterQuestion:
      'Candidate, please explain how the structure of human alveoli is adapted to maximize the rate of gas exchange, referencing Fick\'s Law of Diffusion.',
  },
  {
    board: 'WAEC' as ExamBoard,
    subject: 'Physics',
    topic: 'Electromagnetic Induction & Faraday\'s Law',
    level: 'Senior Secondary (WASSCE)',
    starterQuestion:
      'Candidate, explain what happens when a bar magnet is thrust into a solenoid coil. State Faraday\'s Law and explain the physical significance of the minus sign in Lenz\'s Law.',
  },
  {
    board: 'SAT' as ExamBoard,
    subject: 'Mathematics',
    topic: 'Polynomial Roots & Fundamental Theorem of Algebra',
    level: 'Advanced Placement / High School Senior',
    starterQuestion:
      'Candidate, explain how the discriminant of a quadratic equation predicts the nature and number of its roots in both real and complex domains.',
  },
];

export const OralExaminationStudio: React.FC<OralExaminationStudioProps> = ({
  onOpenNotes,
  onOpenMistakeNotebook,
}) => {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_VIVA_TOPICS[0]);
  const [candidateName, setCandidateName] = useState('Scholar');
  const [isExamActive, setIsExamActive] = useState(false);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(1);
  const totalTurns = 4;

  const [currentQuestion, setCurrentQuestion] = useState(PRESET_VIVA_TOPICS[0].starterQuestion);
  const [studentTranscript, setStudentTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [sessionRecord, setSessionRecord] = useState<OralExamSession | null>(null);

  // Speech Recognition Reference
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setStudentTranscript((prev) => (finalTranscript ? prev + finalTranscript : prev));
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Text-to-Speech function for examiner question
  const speakQuestion = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeakingQuestion(true);
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStartExam = () => {
    setIsExamActive(true);
    setCurrentTurnIndex(1);
    setCurrentQuestion(selectedPreset.starterQuestion);
    setStudentTranscript('');
    setSessionRecord({
      id: `viva_${Date.now()}`,
      subject: selectedPreset.subject,
      topic: selectedPreset.topic,
      examBoard: selectedPreset.board,
      academicLevel: selectedPreset.level,
      candidateName: candidateName.trim() || 'Candidate',
      turns: [],
      overallBandScore: 0,
      overallComment: '',
      examinerCommendations: [],
      priorityRevisionAreas: [],
      isComplete: false,
    });

    speakQuestion(selectedPreset.starterQuestion);
    soundFx.playCorrect();
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setErrorMessage(
        'Speech recognition is not natively supported in this browser. You can type your answer into the transcript box directly.'
      );
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      soundFx.playPop();
    } else {
      setErrorMessage(null);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        soundFx.playClick();
      } catch (err: any) {
        console.warn('Speech start error', err);
        setIsRecording(false);
      }
    }
  };

  const handleSubmitVerbalAnswer = async () => {
    if (!studentTranscript.trim()) {
      setErrorMessage('Please speak or type your answer before submitting to the examiner.');
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const historyPayload =
        sessionRecord?.turns.map((t) => ({
          question: t.examinerQuestion,
          answer: t.studentTranscript,
          score: t.awardedScore,
        })) || [];

      const result = await processOralExamTurn({
        subject: selectedPreset.subject,
        topic: selectedPreset.topic,
        examBoard: selectedPreset.board,
        academicLevel: selectedPreset.level,
        currentTurn: currentTurnIndex,
        totalTurns,
        examinerQuestion: currentQuestion,
        studentTranscript: studentTranscript.trim(),
        conversationHistory: historyPayload,
      });

      const newTurn: OralExamTurn = {
        questionNumber: currentTurnIndex,
        examinerQuestion: currentQuestion,
        studentTranscript: studentTranscript.trim(),
        awardedScore: result.turnScore,
        contentAccuracy: result.contentAccuracy,
        keyTerminologyUsed: result.keyTerminologyUsed,
        missingConcepts: result.missingConcepts,
        examinerObservation: result.examinerObservation,
        followUpPrompt: result.followUpPrompt,
        answeredAt: new Date().toISOString(),
      };

      const updatedTurns = [...(sessionRecord?.turns || []), newTurn];

      if (result.isExamFinished || currentTurnIndex >= totalTurns) {
        // Exam concluded
        setSessionRecord({
          ...sessionRecord!,
          turns: updatedTurns,
          overallBandScore: result.overallBandScore || 7.5,
          overallComment: result.overallComment || 'Candidate completed oral defense.',
          examinerCommendations: result.examinerCommendations || [],
          priorityRevisionAreas: result.priorityRevisionAreas || [],
          completedAt: new Date().toISOString(),
          isComplete: true,
        });
        setIsExamActive(false);
        soundFx.playComplete();
      } else {
        // Advance to next turn
        const nextQ = result.nextSpokenQuestion || 'Explain the underlying mechanism in detail.';
        setCurrentTurnIndex((prev) => prev + 1);
        setCurrentQuestion(nextQ);
        setStudentTranscript('');
        setSessionRecord({
          ...sessionRecord!,
          turns: updatedTurns,
        });

        // Speak the new question
        speakQuestion(nextQ);
        soundFx.playCorrect();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to evaluate answer. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    window.speechSynthesis?.cancel();
    setIsExamActive(false);
    setSessionRecord(null);
    setStudentTranscript('');
    soundFx.playClick();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Mic className="w-4 h-4" />
              <span>Viva Voce Syndicate</span>
              <span aria-hidden="true">·</span>
              <span>AI Oral Examination Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Oral Examination Mode
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Defend your academic knowledge in a realistic verbal viva examination. The AI Chief Examiner asks
              probing questions, evaluates your spoken explanations, checks scientific terminology, and challenges you
              with adaptive follow-ups.
            </p>
          </div>

          {!isExamActive && !sessionRecord?.isComplete && (
            <button
              onClick={handleStartExam}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-sm shrink-0 transition-colors"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Begin Viva Voce Defense</span>
            </button>
          )}

          {isExamActive && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-1.5 transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
              <span>End Session</span>
            </button>
          )}
        </div>

        {/* Viva Topic Selector (Shown when idle) */}
        {!isExamActive && !sessionRecord?.isComplete && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Select Examination Subject & Topic:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRESET_VIVA_TOPICS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedPreset(preset);
                    soundFx.playClick();
                  }}
                  className={`p-4 rounded-xl border text-left text-xs transition-all ${
                    selectedPreset.topic === preset.topic
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 text-indigo-950 dark:text-indigo-200 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {preset.board.replace('_', ' ')} · {preset.subject}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{preset.topic}</div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                    {preset.level}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Examination Room */}
      {isExamActive && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question & Mic Stage (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            {/* Progress Turn Indicator */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Viva Turn {currentTurnIndex} of {totalTurns}
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalTurns }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i + 1 < currentTurnIndex
                        ? 'w-6 bg-emerald-500'
                        : i + 1 === currentTurnIndex
                        ? 'w-8 bg-indigo-600'
                        : 'w-4 bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Examiner Spoken Question Card */}
            <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
                  Chief Examiner Question:
                </span>
                <button
                  onClick={() => speakQuestion(currentQuestion)}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-indigo-600 hover:bg-indigo-50 shadow-xs"
                  title="Replay audio question"
                >
                  {isSpeakingQuestion ? (
                    <Volume2 className="w-4 h-4 animate-pulse text-indigo-600" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-slate-500" />
                  )}
                </button>
              </div>

              <div className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                &quot;{currentQuestion}&quot;
              </div>
            </div>

            {/* Candidate Microphone & Spoken Transcript */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Your Verbal Response:
                </label>
                {isRecording && (
                  <span className="flex items-center gap-1.5 text-xs text-red-500 font-semibold animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    Recording audio...
                  </span>
                )}
              </div>

              {/* Mic Control Bar */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-md animate-pulse'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecording ? 'Stop Recording' : 'Speak Answer (Start Mic)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudentTranscript('')}
                  className="px-3 py-2 text-xs font-medium rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Clear Transcript
                </button>
              </div>

              {/* Editable Transcript Box */}
              <textarea
                rows={5}
                value={studentTranscript}
                onChange={(e) => setStudentTranscript(e.target.value)}
                placeholder="Your spoken words will appear here in real-time. You can edit the text to refine your terminology before submitting to the examiner..."
                className="w-full p-3.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              onClick={handleSubmitVerbalAnswer}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Examiner Is Evaluating Verbal Defense...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Verbal Response to Examiner</span>
                </>
              )}
            </button>
          </div>

          {/* Side Feedback: Dialogue History (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Viva Voce Defense Dialogue Log:
            </h3>

            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              {sessionRecord?.turns.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400 italic">
                  Turn 1 in progress. Answer the examiner&apos;s question verbally to receive feedback.
                </div>
              ) : (
                sessionRecord?.turns.map((turn, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Turn {turn.questionNumber}
                      </span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {turn.awardedScore}/10 Marks ({turn.contentAccuracy}% Accuracy)
                      </span>
                    </div>

                    <div className="text-slate-600 dark:text-slate-300 italic">
                      &quot;{turn.examinerObservation}&quot;
                    </div>

                    {turn.keyTerminologyUsed.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                        <span className="text-slate-500 font-semibold">Key Terms:</span>
                        {turn.keyTerminologyUsed.map((term, i) => (
                          <span
                            key={i}
                            className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Completed Viva Voce Certificate & Performance Summary */}
      {sessionRecord?.isComplete && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>{sessionRecord.examBoard.replace('_', ' ')} Syndicate</span>
                <span aria-hidden="true">·</span>
                <span>{sessionRecord.subject}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Official Viva Voce Examination Assessment
              </h2>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                Band {sessionRecord.overallBandScore} / 9
              </div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Overall Defense Rating
              </div>
            </div>
          </div>

          {/* Examiner Statement */}
          <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
            <span className="font-bold text-indigo-800 dark:text-indigo-300">Board Examiner Commentary: </span>
            {sessionRecord.overallComment}
          </div>

          {/* Commendations & Priorities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Examiner Commendations</span>
              </div>
              <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-emerald-900 dark:text-emerald-200">
                {sessionRecord.examinerCommendations.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-2">
              <div className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Priority Revision Areas</span>
              </div>
              <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-amber-900 dark:text-amber-200">
                {sessionRecord.priorityRevisionAreas.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Start Another Viva Voce
            </button>

            {onOpenNotes && (
              <button
                onClick={() => onOpenNotes(sessionRecord.subject, sessionRecord.topic)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Review Study Notes for {sessionRecord.topic}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
