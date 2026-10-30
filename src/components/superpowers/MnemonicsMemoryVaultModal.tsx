import React, { useState } from 'react';
import {
  X,
  Brain,
  Sparkles,
  TrendingUp,
  Search,
  Plus,
  Copy,
  Check,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { MemoryTab, MnemonicItem } from '../../types/extendedSuperpowers';
import { MNEMONICS_CATALOG } from '../../data/extendedExaminationData';

interface MnemonicsMemoryVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: MemoryTab;
}

export const MnemonicsMemoryVaultModal: React.FC<MnemonicsMemoryVaultModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'mnemonics',
}) => {
  const [activeTab, setActiveTab] = useState<MemoryTab>(initialTab);

  // Mnemonics Vault State
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom Mnemonic State
  const [customLetters, setCustomLetters] = useState<string>('K P C O F G S');
  const [customPhrase, setCustomPhrase] = useState<string>('King Philip Came Over For Good Soup');
  const [customTitle, setCustomTitle] = useState<string>('Linnaean Biological Classification (Kingdom, Phylum, Class, Order, Family, Genus, Species)');

  // SM-2 Calculator State
  const [smRepetition, setSmRepetition] = useState<number>(3);
  const [smGrade, setSmGrade] = useState<number>(4); // 0 to 5
  const [smEasiness, setSmEasiness] = useState<number>(2.5);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    soundFx.playClick();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMnemonics = MNEMONICS_CATALOG.filter((m) => {
    const matchesSubject = selectedSubject === 'All' || m.subject === selectedSubject;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phrase.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // SM-2 calculation
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const updatedEF = Math.max(1.3, smEasiness + (0.1 - (5 - smGrade) * (0.08 + (5 - smGrade) * 0.02))).toFixed(2);
  let nextIntervalDays = 1;
  if (smGrade < 3) {
    nextIntervalDays = 1;
  } else if (smRepetition === 1) {
    nextIntervalDays = 1;
  } else if (smRepetition === 2) {
    nextIntervalDays = 6;
  } else {
    nextIntervalDays = Math.round(6 * Math.pow(parseFloat(updatedEF), smRepetition - 2));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Mnemonics Vault &amp; Spaced Memory Engine
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                  SM-2 · Forgetting Curve · Acronyms
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Examination Mnemonics Library, Ebbinghaus Forgetting Curve Simulator &amp; SuperMemo SM-2 Interval Engine
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
            { id: 'mnemonics' as MemoryTab, label: 'High-Yield Mnemonics Vault', icon: Sparkles },
            { id: 'forgetting_curve' as MemoryTab, label: 'Ebbinghaus Forgetting Curve', icon: TrendingUp },
            { id: 'sm2_calculator' as MemoryTab, label: 'SM-2 Spaced Interval Engine', icon: Calendar },
            { id: 'custom_mnemonic' as MemoryTab, label: 'Custom Acronym Builder', icon: Plus },
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
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-2xs font-bold border border-slate-200/80 dark:border-slate-700'
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
          {/* TAB 1: MNEMONICS VAULT */}
          {activeTab === 'mnemonics' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search mnemonics by keyword, subject, or acronym..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto text-xs">
                  {['All', 'Chemistry', 'Physics', 'Biology', 'Mathematics', 'Geography'].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedSubject(sub);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                        selectedSubject === sub
                          ? 'bg-purple-600 text-white'
                          : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMnemonics.map((m) => (
                  <div
                    key={m.id}
                    className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">
                        {m.subject}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(`${m.title}\nPhrase: "${m.phrase}"\nMeaning:\n${m.meaning.join('\n')}`, m.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.title}</h4>
                      <p className="font-mono text-xs text-purple-600 dark:text-purple-400 font-bold mt-1">
                        &ldquo;{m.phrase}&rdquo;
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs font-mono">
                      {m.meaning.map((line, idx) => (
                        <div key={idx} className="text-slate-700 dark:text-slate-300">
                          {line}
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-500 italic">
                      Exam Relevance: {m.boardRelevance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FORGETTING CURVE */}
          {activeTab === 'forgetting_curve' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Hermann Ebbinghaus Forgetting Curve &amp; Spaced Retrieval Visualizer
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Without structured review, humans lose over 70% of new information within 48 hours. Spaced intervals reset retention to near 100%.
                  </p>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 space-y-3 text-xs">
                  <div className="grid grid-cols-5 text-center font-mono text-[11px] text-slate-400 border-b pb-2">
                    <span>Immediately</span>
                    <span>24 Hours</span>
                    <span>Day 3</span>
                    <span>Day 7</span>
                    <span>Day 30</span>
                  </div>

                  {/* Curve 1: No Review */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold text-rose-600 dark:text-rose-400">
                      <span>Without Review (Cramming Fallacy)</span>
                      <span>Drops to 18%</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 h-5 text-center font-mono text-[10px] text-white">
                      <span className="bg-rose-500 rounded-md flex items-center justify-center">100%</span>
                      <span className="bg-rose-600 rounded-md flex items-center justify-center">54%</span>
                      <span className="bg-rose-700 rounded-md flex items-center justify-center">35%</span>
                      <span className="bg-rose-800 rounded-md flex items-center justify-center">25%</span>
                      <span className="bg-rose-950 rounded-md flex items-center justify-center">18%</span>
                    </div>
                  </div>

                  {/* Curve 2: With Spaced Retrieval */}
                  <div className="space-y-1 pt-3">
                    <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                      <span>With Quiz Me! 4-Stage Spaced Repetition</span>
                      <span>Sustained 94%</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 h-5 text-center font-mono text-[10px] text-white">
                      <span className="bg-emerald-500 rounded-md flex items-center justify-center">100%</span>
                      <span className="bg-emerald-500 rounded-md flex items-center justify-center">92%</span>
                      <span className="bg-emerald-600 rounded-md flex items-center justify-center">95%</span>
                      <span className="bg-emerald-600 rounded-md flex items-center justify-center">96%</span>
                      <span className="bg-emerald-700 rounded-md flex items-center justify-center">94%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SM-2 CALCULATOR */}
          {activeTab === 'sm2_calculator' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    SuperMemo SM-2 Interval Calculation Engine
                  </h3>
                  <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">
                    I_n = I_(n-1) × EF
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Repetition Number (n)</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={smRepetition}
                      onChange={(e) => setSmRepetition(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Current Easiness Factor (EF)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={smEasiness}
                      onChange={(e) => setSmEasiness(parseFloat(e.target.value) || 2.5)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Recall Quality Grade (0 to 5)</label>
                    <select
                      value={smGrade}
                      onChange={(e) => setSmGrade(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono cursor-pointer"
                    >
                      <option value="5">5: Perfect response with zero hesitation</option>
                      <option value="4">4: Correct response with minor hesitation</option>
                      <option value="3">3: Correct response with significant effort</option>
                      <option value="2">2: Incorrect response; correct answer seemed easy</option>
                      <option value="1">1: Incorrect response; correct answer remembered</option>
                      <option value="0">0: Complete blackout</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-around text-center text-xs">
                  <div>
                    <div className="text-slate-400 text-[10px] font-mono">Updated Easiness Factor</div>
                    <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400 mt-1">
                      {updatedEF}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:border-slate-800" />
                  <div>
                    <div className="text-slate-400 text-[10px] font-mono">Next Review Interval</div>
                    <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                      {nextIntervalDays} Days
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Scheduled on optimal decay boundary</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOM ACRONYM BUILDER */}
          {activeTab === 'custom_mnemonic' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Custom Mnemonic &amp; Acronym Phrase Generator
                </h3>

                <div>
                  <label className="text-slate-500 block mb-1">Concept Title / Description</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 block mb-1">First Letters to Memorize</label>
                    <input
                      type="text"
                      value={customLetters}
                      onChange={(e) => setCustomLetters(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Your Memorable Catchphrase</label>
                    <input
                      type="text"
                      value={customPhrase}
                      onChange={(e) => setCustomPhrase(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-purple-600 dark:text-purple-400"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-purple-900 dark:text-purple-200">{customTitle}</div>
                    <div className="font-mono text-purple-700 dark:text-purple-300 text-sm font-black mt-1">
                      &ldquo;{customPhrase}&rdquo; ({customLetters})
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-xl bg-purple-600 text-white font-bold">
                    Saved to Deck
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
