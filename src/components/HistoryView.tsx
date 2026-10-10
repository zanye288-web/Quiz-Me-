import React, { useState } from 'react';
import {
  History,
  Award,
  Calendar,
  Clock,
  RotateCcw,
  CheckCircle,
  XCircle,
  FileText,
  Trash2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { QuizResponse } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { OfficialCertificateModal } from './OfficialCertificateModal';

export interface QuizHistoryRecord {
  id: string;
  quizTitle: string;
  date: string;
  score: number;
  total: number;
  percentage: number;
  timeSpentSeconds: number;
  xpEarned: number;
  quizData: QuizResponse;
  difficulty?: string;
  persona?: string;
  flaggedCount?: number;
  answers?: Array<{
    questionId: number;
    userAnswer: string;
    isCorrect: boolean;
  }>;
}

interface HistoryViewProps {
  historyRecords: QuizHistoryRecord[];
  onRetakeQuiz: (quiz: QuizResponse) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  historyRecords,
  onRetakeQuiz,
  onClearHistory,
}) => {
  const [selectedCertificateRecord, setSelectedCertificateRecord] = useState<QuizHistoryRecord | null>(null);

  const handleRetake = (record: QuizHistoryRecord) => {
    soundFx.playClick();
    onRetakeQuiz(record.quizData);
  };

  const handleViewCertificate = (record: QuizHistoryRecord) => {
    soundFx.playComplete();
    setSelectedCertificateRecord(record);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="comic-tab-hero rounded-3xl p-6 sm:p-8 transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="comic-badge px-2.5 py-0.5 rounded-lg bg-amber-300 text-slate-950 border-2 border-slate-950 text-[10px] font-black uppercase tracking-wider">
                ISSUE #12 · QUIZ ARCHIVES
              </span>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-slate-950/55 text-cyan-200 border border-white/25">
                <History className="w-3.5 h-3.5 text-amber-300" />
                <span>Quiz Archives</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-xs">
              Past Quizzes &amp; Results
            </h2>
            <p className="text-sm text-indigo-100 font-medium">
              Review your previous scores, retake any test to improve your accuracy, or view official certificates.
            </p>
          </div>

          {historyRecords.length > 0 && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onClearHistory();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-slate-950/60 hover:bg-rose-600 text-white border-2 border-slate-950 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* History Records List */}
      {historyRecords.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            No quizzes available
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No completed quizzes yet. Generate or upload a quiz to see your results recorded here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {historyRecords.map((record) => (
            <div
              key={record.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {record.quizTitle}
                  </h3>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                      record.percentage >= 80
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : record.percentage >= 60
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {record.percentage}%
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {record.date}
                  </span>
                  <span>•</span>
                  <span>{record.score} / {record.total} correct</span>
                  <span>•</span>
                  <span>+{record.xpEarned} XP</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleViewCertificate(record)}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span>Certificate</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRetake(record)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCertificateRecord && (
        <OfficialCertificateModal
          quizTitle={selectedCertificateRecord.quizTitle}
          score={selectedCertificateRecord.score}
          total={selectedCertificateRecord.total}
          percentage={selectedCertificateRecord.percentage}
          date={selectedCertificateRecord.date}
          onClose={() => setSelectedCertificateRecord(null)}
        />
      )}
    </div>
  );
};
