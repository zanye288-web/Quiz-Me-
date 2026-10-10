import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Sparkles,
  Layers,
  X,
  Globe,
  Cloud,
  MessageSquare,
  Smartphone,
  Info,
} from 'lucide-react';
import { QuizResponse } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { buildQuizShareUrl, buildCloudQuizShareUrl } from '../utils/shareUtils';
import { saveQuizToFirestore } from '../services/firestore';
import { useAuth } from '../context/AuthContext';

interface ShareQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizResponse;
  cloudQuizId?: string;
  onSavedToCloud?: (quizId: string) => void;
}

export const ShareQuizModal: React.FC<ShareQuizModalProps> = ({
  isOpen,
  onClose,
  quiz,
  cloudQuizId: initialCloudQuizId,
  onSavedToCloud,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'direct' | 'cloud'>('direct');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [cloudQuizId, setCloudQuizId] = useState<string | null>(initialCloudQuizId || null);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCloudQuizId) {
      setCloudQuizId(initialCloudQuizId);
    }
  }, [initialCloudQuizId]);

  if (!isOpen) return null;

  const directUrl = buildQuizShareUrl(quiz);
  const cloudUrl = cloudQuizId ? buildCloudQuizShareUrl(cloudQuizId) : '';
  const currentUrl = activeTab === 'cloud' && cloudUrl ? cloudUrl : directUrl;

  const handleCopyLink = async () => {
    try {
      soundFx.playSelect();
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.warn('Failed to copy link:', err);
    }
  };

  const handleCopyInviteText = async () => {
    try {
      soundFx.playSelect();
      const text = `🎯 Hey! Try out my custom quiz: "${quiz.quiz_title}" on Quiz Me! Test your knowledge across ${quiz.questions.length} questions here:\n${currentUrl}`;
      await navigator.clipboard.writeText(text);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2500);
    } catch (err) {
      console.warn('Failed to copy invite text:', err);
    }
  };

  const handleNativeShare = async () => {
    soundFx.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: quiz.quiz_title,
          text: `Check out this quiz on Quiz Me: ${quiz.quiz_title} (${quiz.questions.length} questions)!`,
          url: currentUrl,
        });
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          console.warn('Native share canceled or failed:', err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSaveToCloud = async () => {
    if (!user) {
      setCloudError('Please sign in to save this quiz to your cloud profile.');
      return;
    }
    setIsSavingCloud(true);
    setCloudError(null);
    try {
      soundFx.playClick();
      const id = await saveQuizToFirestore(
        quiz,
        user.uid,
        user.displayName || 'Author',
        true
      );
      setCloudQuizId(id);
      if (onSavedToCloud) {
        onSavedToCloud(id);
      }
      soundFx.playComplete();
    } catch (err: unknown) {
      console.error('Error saving quiz to cloud for sharing:', err);
      setCloudError('Failed to publish quiz to cloud. You can still use the Direct Link below.');
    } finally {
      setIsSavingCloud(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="comic-modal-panel relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="pattern-halftone px-6 py-5 border-b-2 border-slate-900/15 dark:border-slate-800 flex items-center justify-between bg-indigo-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Share Quiz with Peers</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  Instant Link
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send a unique URL to classmates and study groups to challenge them.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quiz Preview Card */}
          <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-md">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                  {quiz.difficulty || 'Intermediate'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                  {quiz.persona || 'Student'}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                  {quiz.questions.length} Questions
                </span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                {quiz.quiz_title}
              </h4>
              {quiz.summary && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {quiz.summary}
                </p>
              )}
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                <span>Test Link</span>
              </a>
            </div>
          </div>

          {/* Link Type Selector Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveTab('direct');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'direct'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Direct Link (Standalone)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setActiveTab('cloud');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'cloud'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Cloud ID Link {cloudQuizId && '✓'}</span>
            </button>
          </div>

          {/* Tab Explanation */}
          {activeTab === 'direct' ? (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <p>
                <strong>Standalone Direct Link:</strong> Embeds the full quiz questions into the URL so your peers can play immediately on any computer, tablet, or phone without creating an account or logging in.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 text-xs text-purple-900 dark:text-purple-200">
              <Cloud className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>
                  <strong>Cloud ID Link:</strong> Generates a short, permanent link synced with the cloud database.
                </p>
                {!cloudQuizId && (
                  <button
                    type="button"
                    onClick={handleSaveToCloud}
                    disabled={isSavingCloud}
                    className="inline-flex items-center gap-1.5 px-3 py-1 mt-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    {isSavingCloud ? 'Publishing to Cloud...' : 'Publish to Cloud for Short Link'}
                  </button>
                )}
                {cloudError && <p className="text-rose-500 font-semibold mt-1">{cloudError}</p>}
              </div>
            </div>
          )}

          {/* Shareable URL Input Box */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Shareable Quiz URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-indigo-500" />
                <span>Share via Device</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyInviteText}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              {copiedInvite ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Invite Copied!</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <span>Copy Invite Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowQr(!showQr);
              }}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-colors cursor-pointer font-bold text-xs ${
                showQr
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <QrCode className="w-4 h-4 text-indigo-500" />
              <span>{showQr ? 'Hide QR Code' : 'Show QR Code'}</span>
            </button>
          </div>

          {/* QR Code Card (Scan with Phone) */}
          {showQr && (
            <div className="rounded-2xl p-5 border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/30 dark:bg-indigo-950/20 text-center space-y-3 animate-in fade-in duration-150">
              <h5 className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center justify-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-500" />
                <span>Scan to Open on Mobile</span>
              </h5>
              <div className="flex justify-center">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 inline-block">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      currentUrl
                    )}`}
                    alt="Quiz QR Code"
                    className="w-40 h-40 rounded-lg object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Peers can scan this with their phone or tablet camera to instantly start the quiz!
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {quiz.questions.length} questions ready to share
          </span>
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
