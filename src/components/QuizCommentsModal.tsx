import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Send,
  Trash2,
  Sparkles,
  User as UserIcon,
  GraduationCap,
  Clock,
  Heart,
  Bookmark,
  Share2,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { soundFx } from '../utils/audio';
import {
  QuizComment,
  subscribeQuizComments,
  addQuizComment,
  deleteQuizComment,
} from '../services/firestore';

interface QuizCommentsModalProps {
  quizId: string;
  quizTitle: string;
  difficulty?: string;
  persona?: string;
  likesCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  onToggleLike?: () => void;
  onToggleSave?: () => void;
  isOpen: boolean;
  onClose: () => void;
  onCommentCountChange?: (count: number) => void;
}

// Key for local storage comments fallback
const LOCAL_COMMENTS_PREFIX = 'quiz_me_local_comments_';

export const QuizCommentsModal: React.FC<QuizCommentsModalProps> = ({
  quizId,
  quizTitle,
  difficulty = 'Intermediate',
  persona = 'Student',
  likesCount = 0,
  isLiked = false,
  isSaved = false,
  onToggleLike,
  onToggleSave,
  isOpen,
  onClose,
  onCommentCountChange,
}) => {
  const { user } = useAuth();
  const { currentAccentConfig } = useTheme();
  const [comments, setComments] = useState<QuizComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [moderationWarning, setModerationWarning] = useState<{
    warningMessage: string;
    violations: string[];
    severity: string;
    xpPenalty: number;
    coinPenalty: number;
    gmailReportSubject: string;
    gmailReportBody: string;
    adminEmail: string;
  } | null>(null);

  // Load initial local comments if any
  const getLocalComments = (): QuizComment[] => {
    try {
      const stored = localStorage.getItem(`${LOCAL_COMMENTS_PREFIX}${quizId}`);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [];
  };

  const saveLocalComments = (updated: QuizComment[]) => {
    try {
      localStorage.setItem(`${LOCAL_COMMENTS_PREFIX}${quizId}`, JSON.stringify(updated));
    } catch {
      // fallback
    }
  };

  // Subscribe to real-time comments from Firestore
  useEffect(() => {
    if (!isOpen || !quizId) return;

    // Load local fallback first
    const local = getLocalComments();
    if (local.length > 0) {
      setComments(local);
      onCommentCountChange?.(local.length);
    }

    // Subscribe to cloud
    const unsubscribe = subscribeQuizComments(quizId, (cloudComments) => {
      if (cloudComments && cloudComments.length > 0) {
        setComments(cloudComments);
        saveLocalComments(cloudComments);
        onCommentCountChange?.(cloudComments.length);
      } else if (local.length === 0) {
        setComments([]);
        onCommentCountChange?.(0);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, quizId]);

  if (!isOpen) return null;

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || isSubmitting) return;

    soundFx.playClick();
    setIsSubmitting(true);
    setModerationWarning(null);

    const authorName = user?.displayName || 'Active Scholar';
    const authorId = user?.uid || `guest_${Date.now()}`;
    const authorRole = persona || 'Student';
    const authorPhotoURL = user?.photoURL || null;

    try {
      const modRes = await fetch('/api/moderate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          authorName,
          authorId,
          contextType: 'comment',
        }),
      });
      if (modRes.ok) {
        const modData = await modRes.json();
        if (modData.moderation && !modData.moderation.isSafe) {
          soundFx.playIncorrect();
          const m = modData.moderation;
          setModerationWarning({
            warningMessage: m.warningMessage,
            violations: m.violations || ['Policy Violation'],
            severity: m.severity || 'moderate',
            xpPenalty: m.penaltyApplied?.xpDeducted || 50,
            coinPenalty: m.penaltyApplied?.coinsDeducted || 25,
            gmailReportSubject: m.gmailReportPayload?.subject || '[Quiz Me! AI Moderation] Flagged Comment',
            gmailReportBody: m.gmailReportPayload?.body || text,
            adminEmail: m.gmailReportPayload?.to || 'zanye288@gmail.com',
          });
          // Apply XP penalty to stored stats
          try {
            const rawStats = localStorage.getItem('quizme_assessment_stats_v3_revamped');
            if (rawStats) {
              const parsedStats = JSON.parse(rawStats);
              parsedStats.xp = Math.max(0, (parsedStats.xp || 0) - (m.penaltyApplied?.xpDeducted || 50));
              localStorage.setItem('quizme_assessment_stats_v3_revamped', JSON.stringify(parsedStats));
            }
          } catch {
            // ignore
          }
          setIsSubmitting(false);
          return;
        }
      }
    } catch (modErr) {
      console.warn('Moderation check fallback:', modErr);
    }

    const newComment: QuizComment = {
      id: `comment_${Date.now()}`,
      quizId,
      authorId,
      authorName,
      authorPhotoURL,
      authorRole,
      content: text,
      createdAt: new Date().toISOString(),
    };

    // Optimistic local update
    const updated = [newComment, ...comments];
    setComments(updated);
    saveLocalComments(updated);
    onCommentCountChange?.(updated.length);
    setCommentText('');

    // Persist to Firestore if available
    try {
      await addQuizComment(quizId, {
        authorId,
        authorName,
        authorPhotoURL,
        authorRole,
        content: text,
      });
      soundFx.playStreak();
    } catch (err) {
      console.warn('Comment saved locally (Firestore offline or permission fallback):', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    soundFx.playClick();
    const updated = comments.filter((c) => c.id !== commentId);
    setComments(updated);
    saveLocalComments(updated);
    onCommentCountChange?.(updated.length);

    try {
      await deleteQuizComment(quizId, commentId);
    } catch (err) {
      console.warn('Deleted locally:', err);
    }
  };

  const handleShareQuiz = () => {
    soundFx.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}#quiz=${quizId}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const formatTimeAgo = (dateStr?: any): string => {
    if (!dateStr) return 'Just now';
    try {
      const d = dateStr.seconds ? new Date(dateStr.seconds * 1000) : new Date(dateStr);
      const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="comic-modal-panel relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pattern-halftone p-5 sm:p-6 border-b-2 border-slate-900/15 dark:border-slate-800 flex items-start justify-between gap-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/30 dark:from-slate-900 dark:to-indigo-950/20">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <MessageSquare className="w-3 h-3" />
                <span>Discussion & Study Notes</span>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                {difficulty}
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate">
              {quizTitle}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onToggleLike && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onToggleLike();
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black ${
                  isLiked
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-500'
                }`}
                title={isLiked ? 'Unlike quiz' : 'Like this quiz'}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                <span>{likesCount}</span>
              </button>
            )}

            {onToggleSave && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onToggleSave();
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black ${
                  isSaved
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-500'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save quiz to library'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShareQuiz}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Copy share link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[50vh] scrollbar-thin">
          {comments.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-slate-800 dark:text-slate-200">
                No comments on this quiz yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Be the first scholar or teacher to share your study notes, feedback, or test prep tips!
              </p>
            </div>
          ) : (
            comments.map((c) => {
              const isAuthor = user && (user.uid === c.authorId || user.displayName === c.authorName);
              const isTeacher = c.authorRole === 'Teacher';

              return (
                <div
                  key={c.id}
                  className="rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/50 space-y-2 group transition-all hover:border-indigo-200 dark:hover:border-indigo-800"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {c.authorPhotoURL ? (
                        <img
                          src={c.authorPhotoURL}
                          alt={c.authorName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-xl object-cover border border-indigo-200 dark:border-indigo-800 shadow-2xs"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                          {c.authorName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {c.authorName}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                              isTeacher
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                            }`}
                          >
                            {isTeacher ? 'Teacher' : 'Scholar'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(c.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {isAuthor && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(c.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-10 whitespace-pre-wrap">
                    {c.content}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Comment Input Box */}
        <form
          onSubmit={handleSubmitComment}
          className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
        >
          {moderationWarning && (
            <div className="p-3.5 rounded-2xl border-2 border-rose-500/80 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 space-y-2 animate-fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-600 text-white">
                      AI Safety Shield • {moderationWarning.severity.toUpperCase()} WARNING
                    </span>
                    <span className="text-[11px] font-black text-rose-700 dark:text-rose-300">
                      Penalty: -{moderationWarning.xpPenalty} XP · -{moderationWarning.coinPenalty} Coins
                    </span>
                  </div>
                  <p className="text-xs font-bold leading-snug">
                    {moderationWarning.warningMessage}
                  </p>
                  <p className="text-[11px] text-rose-700/90 dark:text-rose-300/90">
                    Moderation report queued for Admin Gmail ({moderationWarning.adminEmail}) • Violations: {moderationWarning.violations.join(', ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModerationWarning(null)}
                  className="p-1 rounded-lg text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`mailto:${moderationWarning.adminEmail}?subject=${encodeURIComponent(moderationWarning.gmailReportSubject)}&body=${encodeURIComponent(moderationWarning.gmailReportBody)}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                >
                  <span>Dispatch Gmail Incident Report to {moderationWarning.adminEmail}</span>
                </a>
              </div>
            </div>
          )}

          <div className="relative">
            <textarea
              rows={2}
              maxLength={500}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmitComment(e);
                }
              }}
              placeholder={`Share study insights, questions, or tips as ${user?.displayName || 'a scholar'}... (Ctrl+Enter to post)`}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200/90 dark:border-slate-700/90 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
              <span>{commentText.length} / 500</span>
              <span>•</span>
              <span>Posting as <strong className="text-slate-600 dark:text-slate-300">{user?.displayName || 'Scholar Guest'}</strong></span>
            </div>

            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className={`px-4 py-2.5 rounded-xl text-xs font-black text-white flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                !commentText.trim() || isSubmitting
                  ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-600/25 hover:shadow-indigo-600/35'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
