import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Database,
  CloudCheck,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface DataBackupSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: any;
}

export const DataBackupSyncModal: React.FC<DataBackupSyncModalProps> = ({
  isOpen,
  onClose,
  userStats,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    soundFx.playClick();
    const backupData = {
      app: 'Quiz Me!',
      version: '3.0.0-superpowers',
      timestamp: new Date().toISOString(),
      stats: userStats,
      history: localStorage.getItem('quizme_assessment_history_v1') || '[]',
      savedPapers: localStorage.getItem('quizme_saved_past_papers_v1') || '[]',
      completedSessions: localStorage.getItem('quizme_completed_past_sessions_v1') || '[]',
      flaggedQuestions: localStorage.getItem('quizme_flagged_past_questions_v1') || '[]',
      flashcards: localStorage.getItem('quizme_user_flashcard_decks_v1') || '[]',
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quizme-academic-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundFx.playComplete();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundFx.playClick();
    setImportError(null);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);
        if (!parsed.app || parsed.app !== 'Quiz Me!') {
          throw new Error('Invalid backup file. Not a Quiz Me! backup archive.');
        }

        if (parsed.stats) {
          localStorage.setItem('quizme_assessment_stats_v3_revamped', JSON.stringify(parsed.stats));
        }
        if (parsed.history) {
          localStorage.setItem('quizme_assessment_history_v1', typeof parsed.history === 'string' ? parsed.history : JSON.stringify(parsed.history));
        }
        if (parsed.savedPapers) {
          localStorage.setItem('quizme_saved_past_papers_v1', typeof parsed.savedPapers === 'string' ? parsed.savedPapers : JSON.stringify(parsed.savedPapers));
        }

        setImportStatus('Backup restored successfully! Refreshing view...');
        soundFx.playComplete();
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err: any) {
        setImportError(err.message || 'Failed to read or parse backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Data Backup, Offline Archive &amp; Cloud Sync
              </h3>
              <p className="text-[11px] text-slate-500">
                Export and restore all learning records, notes, and past paper answers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                Local + Cloud Dual Redundancy
              </span>
              <span className="text-emerald-700 dark:text-emerald-400">
                Your data is stored in your private browser storage and synced securely to your Google Cloud Firestore account.
              </span>
            </div>
          </div>

          {/* Export Action */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Download Standalone JSON Backup</span>
            </h4>
            <p className="text-slate-500">
              Download your complete personal study history, bookmarked papers, and flashcard collections into a single JSON file for safe keeping.
            </p>
            <button
              type="button"
              onClick={handleExportBackup}
              className="mt-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export Full Academic Backup (.json)</span>
            </button>
          </div>

          {/* Import Action */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Restore from Backup File</span>
            </h4>
            <p className="text-slate-500">
              Select a previously exported Quiz Me! JSON backup to restore your progress.
            </p>
            <label className="mt-2 w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
              <Upload className="w-4 h-4" />
              <span>Select Backup JSON File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{importStatus}</span>
            </div>
          )}

          {importError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{importError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
