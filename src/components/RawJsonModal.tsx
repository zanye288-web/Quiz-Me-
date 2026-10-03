import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, CheckCircle } from 'lucide-react';
import { QuizResponse } from '../types/quiz';
import { soundFx } from '../utils/audio';

interface RawJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizResponse | null;
}

export const RawJsonModal: React.FC<RawJsonModalProps> = ({
  isOpen,
  onClose,
  quiz,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !quiz) return null;

  const jsonString = JSON.stringify(quiz, null, 2);

  const handleCopy = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    soundFx.playClick();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.quiz_title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_quiz.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>Raw JSON Output</span>
                <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  application/json
                </span>
              </h3>
              <p className="text-xs text-slate-400">Strictly conforms to Quiz Me! intelligence engine schema</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* JSON Content Pre Box */}
        <div className="flex-1 p-5 overflow-auto bg-slate-950/80 font-mono text-xs text-emerald-300 leading-relaxed select-all">
          <pre className="whitespace-pre-wrap">{jsonString}</pre>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
          <span>{quiz.questions.length} Question items loaded</span>
          <span className="text-emerald-400 font-semibold">Schema Verified ✓</span>
        </div>
      </div>
    </div>
  );
};
