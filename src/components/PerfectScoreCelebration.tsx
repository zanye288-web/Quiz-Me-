import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Crown, Zap, Flame, Trophy } from 'lucide-react';
import { triggerClickConfetti, MAX_CLICK_CONFETTI } from '../utils/confetti';
import { soundFx } from '../utils/audio';

interface PerfectScoreCelebrationProps {
  score: number;
  total: number;
  xpEarned: number;
}

export const PerfectScoreCelebration: React.FC<PerfectScoreCelebrationProps> = ({
  score,
  total,
  xpEarned,
}) => {
  const [clickCount, setClickCount] = useState<number>(0);

  const handleReplay = () => {
    if (clickCount >= MAX_CLICK_CONFETTI) {
      soundFx.playIncorrect();
      return;
    }
    const res = triggerClickConfetti('perfect');
    if (res.success) {
      soundFx.playBadgeUnlock();
      setClickCount(res.count);
    } else {
      setClickCount(MAX_CLICK_CONFETTI);
      soundFx.playIncorrect();
    }
  };

  const isMaxReached = clickCount >= MAX_CLICK_CONFETTI;
  const remaining = Math.max(0, MAX_CLICK_CONFETTI - clickCount);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative overflow-hidden rounded-3xl p-6 sm:p-7 border-2 border-yellow-500/40 bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-indigo-500/10 dark:from-yellow-950/40 dark:via-amber-900/30 dark:to-indigo-950/30 shadow-lg shadow-yellow-500/10"
    >
      {/* Decorative Glow Rays */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
        className="absolute -right-20 -top-20 w-72 h-72 rounded-full opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(234, 179, 8, 0.4) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 15 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 text-white flex items-center justify-center shadow-md shadow-yellow-500/30 shrink-0 border-2 border-white/40"
          >
            <Crown className="w-8 h-8 fill-white/20" />
          </motion.div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border border-yellow-500/30 shadow-2xs">
              <Sparkles className="w-3 h-3 text-yellow-500 animate-spin" />
              <span>Flawless 100% Perfect Score</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Flawless Mastery Achieved!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg">
              You answered all {total} out of {total} questions correctly on the first attempt with zero errors.
            </p>
          </div>
        </div>

        {/* Action Button to Re-trigger Confetti (Limited to 3 times) */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <motion.button
            whileHover={!isMaxReached ? { scale: 1.04 } : {}}
            whileTap={!isMaxReached ? { scale: 0.96 } : {}}
            type="button"
            onClick={handleReplay}
            disabled={isMaxReached}
            className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all ${
              isMaxReached
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700 shadow-none'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 shadow-amber-500/25 cursor-pointer'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isMaxReached ? 'text-slate-400' : 'text-slate-950'}`} />
            <span>
              {isMaxReached
                ? 'Max Celebrations Reached (3/3)'
                : `Replay Fireworks 🎊 (${remaining} left)`}
            </span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
