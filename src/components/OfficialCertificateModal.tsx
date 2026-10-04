import React, { useState, useRef } from 'react';
import {
  X,
  Award,
  Download,
  Printer,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Calendar,
  Layers,
  GraduationCap,
  Share2,
  Check,
} from 'lucide-react';
import { QuizResponse, PersonaType } from '../types/quiz';
import { soundFx } from '../utils/audio';
import { MascotAvatar } from './MascotAvatar';

interface OfficialCertificateModalProps {
  isOpen?: boolean;
  onClose: () => void;
  quiz?: QuizResponse;
  quizTitle?: string;
  score: number;
  total: number;
  percentage: number;
  persona?: PersonaType;
  date?: string;
}

export const OfficialCertificateModal: React.FC<OfficialCertificateModalProps> = ({
  isOpen = true,
  onClose,
  quiz,
  quizTitle,
  score,
  total,
  percentage,
  persona = 'Student',
  date,
}) => {
  const [candidateName, setCandidateName] = useState<string>('Learner');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  if (isOpen === false) return null;

  const displayTitle = quizTitle || quiz?.quiz_title || 'Quiz Assessment';

  const issueDate =
    date ||
    new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const credentialId = `QZ-${Math.abs(
    displayTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 1000) * 73
  ).toString(36).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  const getMasteryGrade = (pct: number) => {
    if (pct >= 90) {
      return {
        stars: 5,
        grade: '5-Star Grandmaster Distinction',
        color: 'text-amber-600',
        badge: '★★★★★ Supreme Mastery',
        subtitle: 'Flawless command of core and advanced domain concepts',
      };
    }
    if (pct >= 75) {
      return {
        stars: 4,
        grade: '4-Star High Proficiency Honors',
        color: 'text-indigo-700',
        badge: '★★★★☆ Honors Proficiency',
        subtitle: 'Strong analytical accuracy and conceptual retention',
      };
    }
    if (pct >= 60) {
      return {
        stars: 3,
        grade: '3-Star Certified Competency',
        color: 'text-emerald-700',
        badge: '★★★☆☆ Standard Competency',
        subtitle: 'Solid foundational grasp of key curriculum objectives',
      };
    }
    if (pct >= 40) {
      return {
        stars: 2,
        grade: '2-Star Developing Scholar',
        color: 'text-cyan-700',
        badge: '★★☆☆☆ Developing Foundation',
        subtitle: 'Active progress toward subject mastery',
      };
    }
    return {
      stars: 1,
      grade: '1-Star Participant Challenger',
      color: 'text-slate-700',
      badge: '★☆☆☆☆ Assessment Participant',
      subtitle: 'Completed initial diagnostic exploration',
    };
  };

  const mastery = getMasteryGrade(percentage);

  const handleDownloadPng = () => {
    soundFx.playSuccess();
    const canvas = document.createElement('canvas');
    canvas.width = 1400;
    canvas.height = 980;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ivory parchment background
    const grad = ctx.createRadialGradient(700, 490, 80, 700, 490, 800);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#f8fafc');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1400, 980);

    // Ornate double border
    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = 10;
    ctx.strokeRect(40, 40, 1320, 900);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.strokeRect(56, 56, 1288, 868);

    // Header
    ctx.fillStyle = '#4338ca';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QUIZ ME! OFFICIAL ACADEMIC CREDENTIAL BOARD', 700, 140);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 54px serif';
    ctx.fillText('Certificate of Achievement', 700, 215);

    // 5-Star Rating Crest on Canvas
    const starText = '★'.repeat(mastery.stars) + '☆'.repeat(5 - mastery.stars);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText(starText, 700, 305);

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`${mastery.stars} OUT OF 5 STARS — ${mastery.grade.toUpperCase()}`, 700, 348);

    // Recipient
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('THIS OFFICIAL CERTIFICATE IS PROUDLY PRESENTED TO', 700, 420);

    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 48px serif';
    ctx.fillText(candidateName || 'Scholar', 700, 485);

    // Divider line under name
    ctx.strokeStyle = '#c7d2fe';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(400, 505);
    ctx.lineTo(1000, 505);
    ctx.stroke();

    // Assessment Title & Score
    ctx.fillStyle = '#334155';
    ctx.font = '24px sans-serif';
    ctx.fillText(`For completing the assessment "${displayTitle.slice(0, 58)}"`, 700, 575);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`Verified Score: ${score} / ${total} (${percentage}% Accuracy)`, 700, 635);

    ctx.fillStyle = '#475569';
    ctx.font = 'italic 20px sans-serif';
    ctx.fillText(mastery.subtitle, 700, 680);

    // Footer metadata
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`Issued: ${issueDate}   |   Star Rating: ${mastery.stars}/5   |   ID: ${credentialId}`, 700, 840);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(candidateName || 'scholar').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_5star_certificate.png`;
    a.click();
  };

  const handlePrint = () => {
    soundFx.playClick();
    window.print();
  };

  const handleShare = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(
      `Official Quiz Me! 5-Star Certificate\nRecipient: ${candidateName}\nQuiz: ${displayTitle}\nRating: ${'★'.repeat(mastery.stars)}${'☆'.repeat(5 - mastery.stars)} (${mastery.stars}/5 Stars - ${mastery.grade})\nScore: ${score}/${total} (${percentage}%)\nVerification ID: ${credentialId}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-0 print:rounded-none">
        {/* Modal Controls Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                Certificate of Completion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official verified quiz achievement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPng}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Candidate Name Customization Toolbar */}
        <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Student / Recipient Name:
            </span>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="px-3 py-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter name"
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Type your name above to customize the certificate before printing
          </span>
        </div>

        {/* Certificate Display Canvas */}
        <div className="flex-1 p-6 sm:p-10 overflow-y-auto bg-slate-100/70 dark:bg-slate-950/70 print:p-0 print:bg-white flex items-center justify-center">
          <div
            ref={certificateRef}
            className="w-full max-w-3xl bg-white text-slate-900 p-8 sm:p-12 rounded-3xl border-8 border-double border-slate-300 shadow-xl relative overflow-hidden print:border-4 print:shadow-none print:max-w-none print:w-full print:rounded-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 50% 50%, rgba(241, 245, 249, 0.5) 0%, rgba(255, 255, 255, 1) 100%)',
            }}
          >
            {/* Corner Motifs */}
            <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-indigo-700" />
            <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-indigo-700" />
            <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-indigo-700" />
            <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-indigo-700" />

            {/* Content Container */}
            <div className="text-center space-y-6 relative z-10">
              <div className="space-y-1">
                <div className="flex justify-center mb-2">
                  <MascotAvatar mood="teacher" size="md" interactive={false} />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-200">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Certificate of Achievement</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 tracking-tight pt-2">
                  Quiz Me!
                </h2>

                {/* 5-Star Performance Crest */}
                <div className="pt-3 flex flex-col items-center gap-1.5">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs">
                    {[1, 2, 3, 4, 5].map((starNum) => {
                      const earned = starNum <= mastery.stars;
                      return (
                        <span
                          key={starNum}
                          className={`text-2xl sm:text-3xl transition-transform ${
                            earned
                              ? 'text-amber-500 drop-shadow-[0_2px_6px_rgba(245,158,11,0.45)] scale-110'
                              : 'text-slate-300'
                          }`}
                        >
                          ★
                        </span>
                      );
                    })}
                  </div>
                  <div className={`text-xs font-black uppercase tracking-wider ${mastery.color}`}>
                    {mastery.stars} / 5 Stars • {mastery.grade}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest font-extrabold text-slate-400">
                  This is proudly presented to
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-indigo-900 underline decoration-indigo-200 decoration-2 underline-offset-8">
                  {candidateName || 'Learner'}
                </h3>
              </div>

              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                For outstanding performance and successful completion of the assessment on{' '}
                <span className="font-bold text-slate-900">"{displayTitle}"</span> with a final score of{' '}
                <span className="font-black text-indigo-900">
                  {score}/{total} ({percentage}%)
                </span>
                .
              </p>

              {/* Badge & Details */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Award Tier</span>
                  <div className="font-bold text-slate-800">{mastery.grade}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Date Issued</span>
                  <div className="font-bold text-slate-800">{issueDate}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Credential ID</span>
                  <div className="font-mono text-[10px] font-bold text-slate-600 truncate">
                    {credentialId.slice(0, 16)}...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
