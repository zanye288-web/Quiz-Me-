import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Feather,
  Clock,
  FileText,
  Search,
  Copy,
  Check,
  Sparkles,
  Quote,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { HumanitiesTab, LiteraryDevice } from '../../types/extendedSuperpowers';
import {
  LITERARY_DEVICES,
  HISTORICAL_CHRONOLOGY,
  LATIN_GREEK_ROOTS,
} from '../../data/extendedExaminationData';

interface HumanitiesLiteratureModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: HumanitiesTab;
}

export const HumanitiesLiteratureModal: React.FC<HumanitiesLiteratureModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'literary_devices',
}) => {
  const [activeTab, setActiveTab] = useState<HumanitiesTab>(initialTab);

  // Literary Devices State
  const [deviceSearch, setDeviceSearch] = useState<string>('');
  const [selectedDevice, setSelectedDevice] = useState<LiteraryDevice>(LITERARY_DEVICES[0]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // PEEL Paragraph Structurer State
  const [peelPoint, setPeelPoint] = useState<string>(
    'Shakespeare presents Macbeth’s moral deterioration as the direct consequence of unchecked political ambition.'
  );
  const [peelEvidence, setPeelEvidence] = useState<string>(
    'In his soliloquy, Macbeth acknowledges that he has "no spur / To prick the sides of my intent, but only / Vaulting ambition" (Act 1, Scene 7).'
  );
  const [peelExplanation, setPeelExplanation] = useState<string>(
    'The equestrian metaphor of "vaulting ambition" which "o\'erleaps itself" depicts ambition as an uncontrollable beast that risks catastrophic collapse, highlighting his internal awareness of transgression.'
  );
  const [peelLink, setPeelLink] = useState<string>(
    'Consequently, Shakespeare cautions the Jacobean audience against usurping the Divine Right of Kings, framing ambition devoid of moral restraint as inherently self-destructive.'
  );

  // Readability Estimator State
  const [sampleText, setSampleText] = useState<string>(
    'The Industrial Revolution was the transition to new manufacturing processes in Great Britain, continental Europe, and the United States, that occurred during the period from around 1760 to about 1820–1840. This transition included going from hand production methods to machines; new chemical manufacturing and iron production processes; the increasing use of water power and the development of machine tools.'
  );

  // Citation Generator State
  const [citeAuthor, setCiteAuthor] = useState<string>('Achebe, Chinua');
  const [citeYear, setCiteYear] = useState<string>('1958');
  const [citeTitle, setCiteTitle] = useState<string>('Things Fall Apart');
  const [citePublisher, setCitePublisher] = useState<string>('Heinemann Educational Books');
  const [citeFormat, setCiteFormat] = useState<'APA' | 'MLA' | 'Chicago' | 'Harvard'>('APA');

  // Comparative Matrix State
  const [compTextA, setCompTextA] = useState<string>('Macbeth (Shakespeare)');
  const [compTextB, setCompTextB] = useState<string>('Things Fall Apart (Achebe)');

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    soundFx.playClick();
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filtered devices
  const filteredDevices = LITERARY_DEVICES.filter(
    (d) =>
      d.term.toLowerCase().includes(deviceSearch.toLowerCase()) ||
      d.definition.toLowerCase().includes(deviceSearch.toLowerCase())
  );

  // Readability metrics
  const words = sampleText.trim() ? sampleText.trim().split(/\s+/).length : 0;
  const sentences = sampleText.trim() ? (sampleText.match(/[.!?]+/g) || []).length || 1 : 0;
  const chars = sampleText.replace(/\s+/g, '').length;
  const avgWordLen = words > 0 ? (chars / words).toFixed(1) : '0';
  const readingTimeMin = (words / 200).toFixed(1);
  const readingEase = words > 0 && sentences > 0 ? Math.round(206.835 - 1.015 * (words / sentences) - 84.6 * (chars / words / 3.5)) : 70;

  // Citation formatting
  const formattedCitation =
    citeFormat === 'APA'
      ? `${citeAuthor} (${citeYear}). ${citeTitle}. ${citePublisher}.`
      : citeFormat === 'MLA'
      ? `${citeAuthor}. ${citeTitle}. ${citePublisher}, ${citeYear}.`
      : citeFormat === 'Chicago'
      ? `${citeAuthor}. ${citeYear}. ${citeTitle}. London: ${citePublisher}.`
      : `${citeAuthor} (${citeYear}) ${citeTitle}. London: ${citePublisher}.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Humanities, Literature &amp; Essay Suite
                </h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                  WAEC Lit · IGCSE · AP English
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Literary Devices, PEEL Essay Builder, Historical Timelines, Readability Metrics &amp; Citations
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
            { id: 'literary_devices' as HumanitiesTab, label: 'Literary Devices & Rhetoric', icon: Feather },
            { id: 'peel_structurer' as HumanitiesTab, label: 'PEEL Essay Paragraph Drafter', icon: FileText },
            { id: 'timeline' as HumanitiesTab, label: 'Historical Chronology', icon: Clock },
            { id: 'readability' as HumanitiesTab, label: 'Passage Readability & Lexile', icon: Sparkles },
            { id: 'latin_greek_roots' as HumanitiesTab, label: 'Latin & Greek Roots Lexicon', icon: HelpCircle },
            { id: 'citations' as HumanitiesTab, label: 'Academic Citation Generator', icon: Quote },
            { id: 'comparative_matrix' as HumanitiesTab, label: 'Comparative Literature Matrix', icon: Layers },
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
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-2xs font-bold border border-slate-200/80 dark:border-slate-700'
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
          {/* TAB 1: LITERARY DEVICES */}
          {activeTab === 'literary_devices' && (
            <div className="space-y-5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={deviceSearch}
                  onChange={(e) => setDeviceSearch(e.target.value)}
                  placeholder="Search 40+ literary and rhetorical devices (e.g. synecdoche, chiasmus, anaphora)..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {filteredDevices.map((d) => {
                    const isSelected = selectedDevice.term === d.term;
                    return (
                      <button
                        key={d.term}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setSelectedDevice(d);
                        }}
                        className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20'
                            : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{d.term}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 capitalize">
                            {d.category.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-1">{d.definition}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Device Detail Stage */}
                <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold uppercase">
                        {selectedDevice.category.replace('_', ' ')}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                        {selectedDevice.term}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(`${selectedDevice.term}: ${selectedDevice.definition}\nExample: ${selectedDevice.examplePassage}`, 'device')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'device' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'device' ? 'Copied' : 'Copy Definition'}</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong className="text-slate-900 dark:text-white block mb-1">Formal Literary Definition:</strong>
                    {selectedDevice.definition}
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs">
                    <div className="font-bold text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5" />
                      <span>Exemplar Textual Citation ({selectedDevice.sourceOrAuthor})</span>
                    </div>
                    <blockquote className="italic text-amber-900/90 dark:text-amber-200/90 pl-3 border-l-2 border-amber-400 dark:border-amber-600 my-2">
                      {selectedDevice.examplePassage}
                    </blockquote>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Chief Examiner Evaluation Guidance</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {selectedDevice.examinerTip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PEEL PARAGRAPH STRUCTURER */}
          {activeTab === 'peel_structurer' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    PEEL Essay Paragraph Drafter (Point · Evidence · Explanation · Link)
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${peelPoint} ${peelEvidence} ${peelExplanation} ${peelLink}`, 'peel')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold cursor-pointer"
                  >
                    {copiedKey === 'peel' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'peel' ? 'Paragraph Copied' : 'Copy Full Paragraph'}</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      [P] Point (Clear topic assertion answering the exam prompt)
                    </label>
                    <textarea
                      rows={2}
                      value={peelPoint}
                      onChange={(e) => setPeelPoint(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      [E] Evidence (Embedded textual citation or verbatim quotation)
                    </label>
                    <textarea
                      rows={2}
                      value={peelEvidence}
                      onChange={(e) => setPeelEvidence(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      [E] Explanation (Close analysis of imagery, metaphor, connotation, and structural effect)
                    </label>
                    <textarea
                      rows={3}
                      value={peelExplanation}
                      onChange={(e) => setPeelExplanation(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      [L] Link (Connect back to the central thesis and historical/social context)
                    </label>
                    <textarea
                      rows={2}
                      value={peelLink}
                      onChange={(e) => setPeelLink(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                </div>

                {/* Synthesized Paragraph */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Synthesized Essay Output</div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">{peelPoint} </span>
                    <span className="text-teal-600 dark:text-teal-400 font-mono">{peelEvidence} </span>
                    <span>{peelExplanation} </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{peelLink}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HISTORICAL CHRONOLOGY */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Historical Chronology &amp; Comparative Timeline
                </h3>
                <div className="space-y-3">
                  {HISTORICAL_CHRONOLOGY.map((ev, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs"
                    >
                      <div className="w-16 shrink-0 font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                        {ev.yearDisplay}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{ev.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {ev.region}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{ev.description}</p>
                        <div className="text-[11px] font-mono text-teal-600 dark:text-teal-400">
                          Syllabus Anchor: {ev.syllabusRelevance}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: READABILITY & LEXILE */}
          {activeTab === 'readability' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Reading Comprehension Lexile &amp; Readability Estimator
                </h3>
                <textarea
                  rows={4}
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                  placeholder="Paste examination reading comprehension passage here..."
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs text-center">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Word Count</div>
                    <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{words}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Sentences</div>
                    <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{sentences}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Avg Word Len</div>
                    <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{avgWordLen} ch</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Reading Time</div>
                    <div className="text-base font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{readingTimeMin} min</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-slate-400 text-[10px] font-mono">Flesch Ease</div>
                    <div className="text-base font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">{readingEase} / 100</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LATIN & GREEK ROOTS */}
          {activeTab === 'latin_greek_roots' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Classical Etymological Roots (SAT · GRE · IGCSE Advanced Vocabulary)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {LATIN_GREEK_ROOTS.map((r, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-base text-amber-600 dark:text-amber-400">
                          {r.root} ({r.origin})
                        </span>
                        <span className="text-slate-500 font-bold">Meaning: &ldquo;{r.meaning}&rdquo;</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {r.examVocabulary.map((v) => (
                          <span
                            key={v}
                            className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono text-[11px]"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                        &ldquo;{r.sampleSentence}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CITATIONS */}
          {activeTab === 'citations' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Academic Citation Generator (APA · MLA · Chicago · Harvard)
                  </h3>
                  <div className="flex gap-1 text-xs">
                    {(['APA', 'MLA', 'Chicago', 'Harvard'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setCiteFormat(fmt);
                        }}
                        className={`px-3 py-1 rounded-xl font-bold cursor-pointer ${
                          citeFormat === fmt
                            ? 'bg-amber-500 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Author(s)</label>
                    <input
                      type="text"
                      value={citeAuthor}
                      onChange={(e) => setCiteAuthor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Publication Year</label>
                    <input
                      type="text"
                      value={citeYear}
                      onChange={(e) => setCiteYear(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Book / Document Title</label>
                    <input
                      type="text"
                      value={citeTitle}
                      onChange={(e) => setCiteTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Publisher / Institution</label>
                    <input
                      type="text"
                      value={citePublisher}
                      onChange={(e) => setCitePublisher(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>
                </div>

                {/* Formatted output */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="font-mono text-slate-800 dark:text-slate-200 pr-3">{formattedCitation}</div>
                  <button
                    type="button"
                    onClick={() => handleCopy(formattedCitation, 'cite')}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold cursor-pointer"
                  >
                    {copiedKey === 'cite' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'cite' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: COMPARATIVE LITERATURE MATRIX */}
          {activeTab === 'comparative_matrix' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Comparative Literature Cross-Text Matrix
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Text A (e.g. Drama / Novel)</label>
                    <input
                      type="text"
                      value={compTextA}
                      onChange={(e) => setCompTextA(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-1">Text B (Paired Comparison)</label>
                    <input
                      type="text"
                      value={compTextB}
                      onChange={(e) => setCompTextB(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-3 bg-amber-500/10 p-2.5 font-bold border-b border-slate-200 dark:border-slate-800">
                    <span>Critical Dimension</span>
                    <span className="text-amber-700 dark:text-amber-300">{compTextA}</span>
                    <span className="text-teal-700 dark:text-teal-300">{compTextB}</span>
                  </div>
                  {[
                    { dim: 'Central Tragic Flaw', a: 'Vaulting ambition & hubris', b: 'Fear of weakness & rigid inflexibility' },
                    { dim: 'Cosmic / Cultural Order', a: 'Divine Right of Kings & Great Chain of Being', b: 'Igbo clan traditions, Ani (Earth goddess) & Chi' },
                    { dim: 'Fate vs Free Will', a: 'Equivocal prophecies of the Weird Sisters', b: 'Agbala oracle vs personal wrestling with one’s chi' },
                    { dim: 'Climax & Catastrophe', a: 'Birnam Wood advances; beheaded by Macduff', b: 'Clan refuses war; suicide by hanging at tree' },
                  ].map((row, idx) => (
                    <div key={idx} className="grid grid-cols-3 p-3 border-b border-slate-100 dark:border-slate-800/80">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{row.dim}</span>
                      <span className="text-slate-600 dark:text-slate-400 pr-2">{row.a}</span>
                      <span className="text-slate-600 dark:text-slate-400">{row.b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
