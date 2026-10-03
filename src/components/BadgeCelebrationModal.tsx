import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Award,
  Crown,
  Share2,
  Check,
  Zap,
  Flame,
  CheckCircle2,
  Target,
  BookOpen,
  Trophy,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { BadgeDefinition, BADGE_TIER_CONFIG } from '../types/badges';
import { soundFx } from '../utils/audio';

interface BadgeCelebrationModalProps {
  badge: BadgeDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

// Particle shape generator for realistic celebratory confetti
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  rotation: number;
  targetRotation: number;
  scale: number;
  color: string;
  shape: 'rect' | 'circle' | 'star';
  delay: number;
  duration: number;
}

const CONFETTI_COLORS = [
  '#f59e0b', // amber
  '#6366f1', // indigo
  '#ec4899', // pink
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#8b5cf6', // purple
  '#eab308', // yellow
];

export const BadgeCelebrationModal: React.FC<BadgeCelebrationModalProps> = ({
  badge,
  isOpen,
  onClose,
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && badge) {
      soundFx.playBadgeUnlock();

      // Generate 45 celebratory confetti particles
      const newParticles: ConfettiParticle[] = Array.from({ length: 45 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 45 + (Math.random() - 0.5) * 0.5;
        const distance = 140 + Math.random() * 220;
        const shapes: Array<'rect' | 'circle' | 'star'> = ['rect', 'circle', 'star'];

        return {
          id: i,
          x: 0,
          y: 0,
          targetX: Math.cos(angle) * distance,
          targetY: Math.sin(angle) * distance + 50 * Math.random(),
          rotation: 0,
          targetRotation: (Math.random() - 0.5) * 720,
          scale: 0.6 + Math.random() * 0.8,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          delay: Math.random() * 0.15,
          duration: 1.2 + Math.random() * 0.8,
        };
      });

      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isOpen, badge]);

  if (!isOpen || !badge) return null;

  const tierConfig = BADGE_TIER_CONFIG[badge.tier] || BADGE_TIER_CONFIG.Bronze;

  const handleShare = () => {
    soundFx.playClick();
    const text = `🏆 I just unlocked the "${badge.title}" (${badge.tier} Tier) Badge in Quiz Me!\n"${badge.description}"\nCheck out my learning progress!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const renderBadgeIcon = () => {
    const iconProps = { className: 'w-12 h-12 text-white drop-shadow-md' };
    switch (badge.iconName) {
      case 'Flame':
        return <Flame {...iconProps} />;
      case 'Crown':
        return <Crown {...iconProps} />;
      case 'Trophy':
        return <Trophy {...iconProps} />;
      case 'Zap':
        return <Zap {...iconProps} />;
      case 'Target':
        return <Target {...iconProps} />;
      case 'BookOpen':
        return <BookOpen {...iconProps} />;
      case 'CheckCircle2':
        return <CheckCircle2 {...iconProps} />;
      case 'Layers':
        return <Layers {...iconProps} />;
      case 'GraduationCap':
        return <GraduationCap {...iconProps} />;
      default:
        return <Award {...iconProps} />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        {/* Confetti Explosion Layer */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: p.targetX,
                y: p.targetY,
                scale: [0, p.scale, p.scale * 0.8, 0],
                opacity: [1, 1, 0.8, 0],
                rotate: p.targetRotation,
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: [0.15, 0.9, 0.35, 1],
              }}
              className="absolute"
              style={{
                width: p.shape === 'rect' ? '12px' : '9px',
                height: p.shape === 'rect' ? '6px' : '9px',
                backgroundColor: p.color,
                borderRadius: p.shape === 'circle' ? '9999px' : p.shape === 'star' ? '2px' : '1px',
              }}
            />
          ))}
        </div>

        {/* Main Card Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 22,
          }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-center p-6 sm:p-8 space-y-6"
        >
          {/* Top Close Button */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Unlocked Ribbon */}
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
              className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              <span>Achievement Unlocked!</span>
            </motion.div>
          </div>

          {/* Center Glowing Emblem Container */}
          <div className="relative flex items-center justify-center py-4">
            {/* Pulsing Rotating Backdrop Rays */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
              className="absolute w-44 h-44 rounded-full opacity-60 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${tierConfig.glowColor} 0%, transparent 70%)`,
              }}
            />

            {/* Glowing Ring */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute w-32 h-32 rounded-3xl blur-xl"
              style={{ background: tierConfig.glowColor }}
            />

            {/* Main Badge Medallion */}
            <motion.div
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.15,
                type: 'spring',
                stiffness: 260,
                damping: 16,
              }}
              className={`relative z-10 w-28 h-28 rounded-3xl bg-gradient-to-br ${tierConfig.gradient} flex flex-col items-center justify-center shadow-xl border-4 border-white/40 dark:border-slate-800/60`}
            >
              <div className="relative z-10 flex flex-col items-center justify-center">
                {renderBadgeIcon()}
              </div>

              {/* Tier Bottom Pill */}
              <div className="absolute -bottom-2.5 px-3 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider border border-white/20 shadow-xs">
                {badge.tier}
              </div>
            </motion.div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2 relative z-10">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {badge.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
              {badge.description}
            </p>
          </div>

          {/* XP & Category Bonus Card */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Reward Bonus
              </span>
              <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-black text-sm">
                <Zap className="w-4 h-4 fill-indigo-500 text-indigo-500" />
                <span>+{badge.xpBonus} XP Earned</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Category
              </span>
              <div className="font-extrabold text-xs text-slate-800 dark:text-slate-200 mt-0.5">
                {badge.category} Mastery
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share Achievement</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              Claim & Continue
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
