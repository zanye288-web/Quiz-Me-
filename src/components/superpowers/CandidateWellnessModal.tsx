import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Moon,
  Clock,
  Apple,
  ShieldAlert,
  BookOpen,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { WellnessTab } from '../../types/extendedSuperpowers';

interface CandidateWellnessModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: WellnessTab;
}

export const CandidateWellnessModal: React.FC<CandidateWellnessModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'box_breathing',
}) => {
  const [activeTab, setActiveTab] = useState<WellnessTab>(initialTab);

  // Box Breathing State
  const [isBreathingRunning, setIsBreathingRunning] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathSeconds, setBreathSeconds] = useState<number>(4);
  const [cycleCount, setCycleCount] = useState<number>(0);

  // Sleep Cycle State
  const [wakeHour, setWakeHour] = useState<number>(6);
  const [wakeMinute, setWakeMinute] = useState<number>(0);

  // Post-Exam Journal State
  const [debriefSubject, setDebriefSubject] = useState<string>('General Mathematics Paper 2');
  const [debriefPacing, setDebriefPacing] = useState<'rushed' | 'perfect' | 'idle'>('perfect');
  const [debriefNotes, setDebriefNotes] = useState<string>(
    'Time management on Section B was solid. The circle theorem question took 8 minutes instead of 5, but recovered time on the statistics question.'
  );

  // Box breathing 4-4-4-4 interval loop
  useEffect(() => {
    if (!isOpen || activeTab !== 'box_breathing' || !isBreathingRunning) return;

    const timer = setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev > 1) return prev - 1;

        // Transition phase
        if (breathPhase === 'Inhale') {
          soundFx.playClick();
          setBreathPhase('Hold');
        } else if (breathPhase === 'Hold') {
          soundFx.playClick();
          setBreathPhase('Exhale');
        } else if (breathPhase === 'Exhale') {
          soundFx.playClick();
          setBreathPhase('Rest');
        } else {
          soundFx.playStreak();
          setBreathPhase('Inhale');
          setCycleCount((c) => c + 1);
        }
        return 4;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, activeTab, isBreathingRunning, breathPhase]);

  if (!isOpen) return null;

  // 90-minute REM cycle calculations
  // Bedtimes for 6 cycles (9 hours), 5 cycles (7.5 hours), 4 cycles (6 hours)
  const calculateBedtime = (cycles: number) => {
    const totalMinutesToSubtract = cycles * 90 + 15; // 15 mins to fall asleep
    let wakeTotalMinutes = wakeHour * 60 + wakeMinute;
    let bedTotalMinutes = wakeTotalMinutes - totalMinutesToSubtract;
    if (bedTotalMinutes < 0) bedTotalMinutes += 24 * 60;
    const h = Math.floor(bedTotalMinutes / 60);
    const m = bedTotalMinutes % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Candidate Wellness &amp; Peak Performance Coach
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  Stress Control · Sleep · Nutrition
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Box Breathing Pacer, 90-Min REM Sleep Calculator, 48-Hour Exam Countdown &amp; Somatic Blank-Mind Protocol
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-slate-100/60 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'box_breathing' as WellnessTab, label: 'Box Breathing 4-4-4-4 Pacer', icon: Heart },
            { id: 'sleep_cycle' as WellnessTab, label: '90-Min REM Sleep Calculator', icon: Moon },
            { id: 'countdown_48h' as WellnessTab, label: '48-Hour Exam Revision Schedule', icon: Clock },
            { id: 'brain_nutrition' as WellnessTab, label: 'Brain-Fuel & Hydration Guide', icon: Apple },
            { id: 'blank_mind_recovery' as WellnessTab, label: 'Emergency Blank-Mind Protocol', icon: ShieldAlert },
            { id: 'exam_debrief' as WellnessTab, label: 'Post-Exam Reflection Journal', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFx.playSelect();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Stage Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: BOX BREATHING */}
          {activeTab === 'box_breathing' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center space-y-5 max-w-lg mx-auto">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    4-4-4-4 Autonomic Nervous System Regulator
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Navy SEAL technique used to rapidly down-regulate cortisol and eliminate pre-exam panic
                  </p>
                </div>

                {/* Animated Breathing Circle */}
                <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                      breathPhase === 'Inhale'
                        ? 'scale-110 bg-emerald-500/20 border-4 border-emerald-500'
                        : breathPhase === 'Hold'
                        ? 'scale-110 bg-teal-500/20 border-4 border-teal-500'
                        : breathPhase === 'Exhale'
                        ? 'scale-75 bg-indigo-500/20 border-4 border-indigo-500'
                        : 'scale-75 bg-slate-500/20 border-4 border-slate-400'
                    }`}
                  />
                  <div className="relative z-10 text-center">
                    <div className="text-sm font-bold uppercase tracking-wider text-slate-500">
                      {breathPhase}
                    </div>
                    <div className="text-4xl font-black font-mono text-slate-900 dark:text-white my-1">
                      {breathSeconds}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">Cycle #{cycleCount}</div>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setIsBreathingRunning((r) => !r);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    {isBreathingRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isBreathingRunning ? 'Pause Breathing' : 'Start Box Breathing'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setIsBreathingRunning(false);
                      setBreathPhase('Inhale');
                      setBreathSeconds(4);
                      setCycleCount(0);
                    }}
                    className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SLEEP CYCLE */}
          {activeTab === 'sleep_cycle' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      90-Minute Ultradian REM Sleep Cycle Calculator
                    </h3>
                    <p className="text-xs text-slate-500">
                      Wake up at the end of a natural sleep cycle to avoid morning cognitive grogginess
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Wake up time:</span>
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={wakeHour}
                      onChange={(e) => setWakeHour(parseInt(e.target.value, 10) || 6)}
                      className="w-14 p-1.5 rounded-xl border bg-white dark:bg-slate-900 text-center font-mono font-bold"
                    />
                    <span>:</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={wakeMinute}
                      onChange={(e) => setWakeMinute(parseInt(e.target.value, 10) || 0)}
                      className="w-14 p-1.5 rounded-xl border bg-white dark:bg-slate-900 text-center font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                      Optimal (6 Cycles · 9.0 Hours)
                    </span>
                    <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 pt-2">
                      {calculateBedtime(6)}
                    </div>
                    <div className="text-slate-500 text-[11px]">Maximum memory consolidation and synaptic plasticity.</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold">
                      Great (5 Cycles · 7.5 Hours)
                    </span>
                    <div className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400 pt-2">
                      {calculateBedtime(5)}
                    </div>
                    <div className="text-slate-500 text-[11px]">Balanced physical recovery and high cognitive focus.</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
                      Minimum (4 Cycles · 6.0 Hours)
                    </span>
                    <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 pt-2">
                      {calculateBedtime(4)}
                    </div>
                    <div className="text-slate-500 text-[11px]">Shortest safe threshold. Never sleep less before exam day!</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 48-HOUR TIMETABLE */}
          {activeTab === 'countdown_48h' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Last 48 Hours Strategic Exam Preparation Schedule
                </h3>

                <div className="space-y-2 text-xs">
                  {[
                    { t: 'T - 48 Hours', title: 'High-Yield Formula & Error Log Review', desc: 'Review your personal mistake journal and memorize key constants. No brand-new topics.' },
                    { t: 'T - 24 Hours', title: 'Stationery Check & Exam Docket Verification', desc: 'Pack transparent pencil case, test calculators, verify candidate seat number and center address.' },
                    { t: 'T - 12 Hours', title: 'Strict Zero-Cramming Cutoff (08:00 PM)', desc: 'Close all past papers. Eat a balanced low-glycemic meal with lean protein. Relax your mind.' },
                    { t: 'T - 3 Hours', title: 'Brain-Fuel Breakfast & Electrolyte Hydration', desc: 'Oatmeal, eggs, or complex carbs with water. Avoid excess refined sugar to prevent mid-exam energy crashes.' },
                    { t: 'T - 45 Mins', title: 'Arrival at Examination Hall Gate', desc: 'Biometric fingerprint verification, frisking compliance, and settling into your allocated seat desk.' },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3"
                    >
                      <span className="w-24 shrink-0 font-mono font-black text-emerald-600 dark:text-emerald-400">
                        {row.t}
                      </span>
                      <div className="space-y-0.5 flex-1">
                        <div className="font-bold text-slate-900 dark:text-white">{row.title}</div>
                        <p className="text-slate-500 leading-relaxed">{row.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BRAIN NUTRITION */}
          {activeTab === 'brain_nutrition' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Science-Backed Nutrition &amp; Hydration Protocol
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Apple className="w-4 h-4" />
                      <span>Recommended Exam Morning Fuel</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                      <li>• <strong>Complex Carbohydrates:</strong> Oats, whole grains, brown bread for slow-release glucose over 3 hours.</li>
                      <li>• <strong>Lean Protein:</strong> Eggs, almonds, yogurt to stimulate sustained dopamine and alertness.</li>
                      <li>• <strong>Hydration:</strong> 400ml water upon waking; sip electrolytes up to 45 mins before paper begins.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Exam Hall Hazards to Avoid</span>
                    </div>
                    <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                      <li>• <strong>Refined Sugars / Candy:</strong> Triggers rapid reactive hypoglycemia (brain fog at 90-minute mark).</li>
                      <li>• <strong>Heavy Greasy Foods:</strong> Diverts blood flow to digestive tract, causing acute lethargy.</li>
                      <li>• <strong>Late Energy Drinks:</strong> Increases pulse rate and bladder urgency during strict lockdown papers.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BLANK MIND RECOVERY */}
          {activeTab === 'blank_mind_recovery' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Emergency 5-Step Somatic Reset for Exam Blank-Out</span>
                  </h3>
                  <p className="text-slate-500 mt-0.5">
                    When sudden panic strikes and your mind goes blank, follow this clinical sequence:
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { step: 1, title: 'Put Down Your Pen and Exhale Fully', text: 'Physically release muscular grip on the pen. Drop shoulders down away from your ears.' },
                    { step: 2, title: 'Ground Your Feet Flat on the Floor', text: 'Feel the contact of both shoe soles against the solid floor to re-engage physical sensory reality.' },
                    { step: 3, title: '5-4-3-2-1 Micro Sensory Scan', text: 'Silently identify 3 physical objects in the room (your desk, the blackboard, the clock) to interrupt the amygdala panic loop.' },
                    { step: 4, title: 'Skip Ahead to a 100% Familiar Question', text: 'Do not stay stuck on Question 1. Find a question you know cold, solve it, and secure immediate confidence points.' },
                    { step: 5, title: 'Return with a Calm Peripheral Perspective', text: 'Re-read the original troublesome question. Your subconscious will have unlocked the retrieval pathway.' },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3"
                    >
                      <span className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-black flex items-center justify-center shrink-0">
                        {s.step}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{s.title}</div>
                        <p className="text-slate-500 mt-0.5">{s.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: POST-EXAM DEBRIEF JOURNAL */}
          {activeTab === 'exam_debrief' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Post-Examination Reflection &amp; Pacing Debrief Journal
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 block mb-1">Paper / Subject Name</label>
                    <input
                      type="text"
                      value={debriefSubject}
                      onChange={(e) => setDebriefSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Pacing Assessment</label>
                    <select
                      value={debriefPacing}
                      onChange={(e) => setDebriefPacing(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer"
                    >
                      <option value="perfect">Paced Perfectly (completed on time with review)</option>
                      <option value="rushed">Rushed at the End (ran out of time on last questions)</option>
                      <option value="idle">Finished Too Fast (likely missed subtle question traps)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Self-Reflection &amp; Lessons for Next Paper</label>
                  <textarea
                    rows={3}
                    value={debriefNotes}
                    onChange={(e) => setDebriefNotes(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-medium">
                  ✓ Reflection saved to local study progress log. Growth mindset transforms past exams into future distinctions!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
