import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Search,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Copy,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileText,
  Play,
  RotateCcw,
  SlidersHorizontal,
  X,
  Compass,
  GraduationCap,
} from 'lucide-react';
import { ExamFormatId, PersonaType, QuizResponse, Question } from '../../types/quiz';
import {
  OpenAccessRepositoryId,
  OpenAccessResourceRecord,
  OerChapterOrPassage,
  OerLiveSearchResultItem,
} from '../../types/openAccess';
import {
  OPEN_ACCESS_REPOSITORIES,
  OPEN_ACCESS_RESOURCES_INDEX,
} from '../../data/openAccessRepositories';
import { soundFx } from '../../utils/audio';

interface OpenAccessHubViewProps {
  persona: PersonaType;
  selectedExamFormat?: ExamFormatId;
  onStartQuiz: (quiz: QuizResponse) => void;
  onOpenNotesGenerator?: (topic: string, examFormat: ExamFormatId) => void;
  onOpenWorksheet?: (quiz: QuizResponse) => void;
}

type PriorityRegionFilter = 'all' | 'west_africa' | 'uk_international' | 'us_admissions';

export const OpenAccessHubView: React.FC<OpenAccessHubViewProps> = ({
  persona,
  selectedExamFormat,
  onStartQuiz,
  onOpenNotesGenerator,
}) => {
  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<OpenAccessRepositoryId | 'all'>('all');
  const [priorityRegion, setPriorityRegion] = useState<PriorityRegionFilter>('all');
  const [selectedBoard, setSelectedBoard] = useState<ExamFormatId | 'all'>(selectedExamFormat || 'all');

  // Reader modal state
  const [activeReadingResource, setActiveReadingResource] = useState<OpenAccessResourceRecord | null>(null);
  const [activeReadingChapter, setActiveReadingChapter] = useState<OerChapterOrPassage | null>(null);
  const [copiedCitation, setCopiedCitation] = useState(false);

  // Convert to paper modal state
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [targetResourceToConvert, setTargetResourceToConvert] = useState<OpenAccessResourceRecord | null>(null);
  const [conversionBoard, setConversionBoard] = useState<ExamFormatId>(
    selectedExamFormat && selectedExamFormat !== 'waec' ? selectedExamFormat : 'waec'
  );
  const [conversionCount, setConversionCount] = useState<number>(5);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<any | null>(null);
  const [conversionError, setConversionError] = useState<string | null>(null);

  // Live external search results
  const [liveExternalResults, setLiveExternalResults] = useState<OerLiveSearchResultItem[]>([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);

  // Debounced API search when query is typed
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 3) {
      setLiveExternalResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLive(true);
      try {
        const resp = await fetch('/api/oer/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: trimmed,
            repositoryId: selectedRepo,
            priorityRegion,
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.success && Array.isArray(data.liveExternal)) {
            setLiveExternalResults(data.liveExternal);
          }
        }
      } catch {
        // Fall back gracefully to curated items
      } finally {
        setIsSearchingLive(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedRepo, priorityRegion]);

  // Client-side filtering of curated resources for immediate response
  const filteredCuratedResources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return OPEN_ACCESS_RESOURCES_INDEX.filter((res) => {
      // Repository filter
      if (selectedRepo !== 'all' && res.repositoryId !== selectedRepo) {
        return false;
      }
      // Priority region filter
      if (priorityRegion === 'west_africa') {
        const isWA = res.targetExamBoards.some((b) =>
          ['waec', 'neco', 'jamb', 'bece', 'nabteb'].includes(b)
        );
        if (!isWA && res.repositoryId !== 'nerdc_curriculum') return false;
      } else if (priorityRegion === 'uk_international') {
        const isUK = res.targetExamBoards.some((b) =>
          ['cambridge_igcse', 'cambridge_alevel', 'cambridge_checkpoint', 'edexcel_gcse', 'edexcel_alevel', 'aqa_gcse', 'ocr_gcse', 'ib'].includes(b)
        );
        if (!isUK) return false;
      } else if (priorityRegion === 'us_admissions') {
        const isUS = res.targetExamBoards.some((b) =>
          ['sat', 'act', 'ap', 'ged', 'psat'].includes(b)
        );
        if (!isUS) return false;
      }
      // Specific exam board filter
      if (selectedBoard !== 'all' && !res.targetExamBoards.includes(selectedBoard)) {
        return false;
      }
      // Text search
      if (q) {
        const matchTitle = res.title.toLowerCase().includes(q);
        const matchSubject = res.subject.toLowerCase().includes(q);
        const matchOrg = res.authorOrOrganization.toLowerCase().includes(q);
        const matchDesc = res.description.toLowerCase().includes(q);
        const matchTags = res.tags.some((t) => t.toLowerCase().includes(q));
        const matchChapters = res.chaptersOrSections.some(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.summary.toLowerCase().includes(q) ||
            c.keyConcepts.some((k) => k.toLowerCase().includes(q))
        );
        return matchTitle || matchSubject || matchOrg || matchDesc || matchTags || matchChapters;
      }
      return true;
    });
  }, [searchQuery, selectedRepo, priorityRegion, selectedBoard]);

  // Handle Copy Citation
  const handleCopyCitation = (citation: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    soundFx.playClick();
    setTimeout(() => setCopiedCitation(false), 2200);
  };

  // Open Convert Modal
  const openConvertModal = (resource: OpenAccessResourceRecord, chapter?: OerChapterOrPassage) => {
    soundFx.playSelect();
    setTargetResourceToConvert(resource);
    setActiveReadingChapter(chapter || resource.chaptersOrSections[0] || null);
    // Auto-select first matching target board
    if (resource.targetExamBoards.length > 0) {
      setConversionBoard(resource.targetExamBoards[0]);
    }
    setConversionResult(null);
    setConversionError(null);
    setConvertModalOpen(true);
  };

  // Execute Conversion via API
  const handleExecuteConversion = async () => {
    if (!targetResourceToConvert) return;
    setIsConverting(true);
    setConversionError(null);
    soundFx.playClick();

    try {
      const resp = await fetch('/api/oer/convert-to-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: targetResourceToConvert.id,
          chapterId: activeReadingChapter?.id,
          passageText: activeReadingChapter?.passageText,
          targetExamBoard: conversionBoard,
          targetSubject: targetResourceToConvert.subject,
          questionCount: conversionCount,
        }),
      });

      if (!resp.ok) {
        throw new Error('Failed to convert open-access resource to exam paper.');
      }

      const json = await resp.json();
      if (json.success && json.data) {
        setConversionResult(json.data);
        soundFx.playComplete();
      } else {
        throw new Error(json.error || 'Unable to parse generated examination items.');
      }
    } catch (err: any) {
      setConversionError(err.message || 'Error communicating with examination converter.');
    } finally {
      setIsConverting(false);
    }
  };

  // Start Interactive Practice from Converted Paper
  const handleLaunchPractice = (paperData: any) => {
    if (!paperData || !Array.isArray(paperData.questions)) return;
    soundFx.playSelect();

    // Map questions to QuizMe Question format
    const mappedQuestions: Question[] = paperData.questions.map((q: any, idx: number) => {
      const hasOpts = Array.isArray(q.options) && q.options.length >= 2;
      return {
        id: idx + 1,
        question: `[${q.section || 'Question ' + (idx + 1)}] (${q.marks || 2} marks)\n${q.question}`,
        type: hasOpts ? 'multiple_choice' : 'open_explanation',
        options: hasOpts ? q.options : undefined,
        correct_answer: q.answer,
        explanation: q.markingSchemeNotes
          ? `Chief Examiner Marking Rubric:\n${q.markingSchemeNotes}`
          : `Official Answer: ${q.answer}`,
        topic: paperData.subject || targetResourceToConvert?.subject || 'Examination Practice',
        difficulty: 'Intermediate',
      };
    });

    const quizResponse: QuizResponse = {
      app_name: 'Quiz Me!',
      persona,
      quiz_title: paperData.paperTitle || `${paperData.subject} Practice Paper`,
      summary: `Authentic examination practice derived from ${paperData.sourceAttribution || 'Open Educational Resource'} aligned with ${String(paperData.targetBoard || '').toUpperCase()} specifications.`,
      questions: mappedQuestions,
      difficulty: 'Intermediate',
      examFormat: (paperData.targetBoard as ExamFormatId) || 'waec',
      tags: [paperData.subject || 'OER', 'Open Educational Resource', 'Mark Scheme Rubric'],
    };

    setConvertModalOpen(false);
    onStartQuiz(quizResponse);
  };

  return (
    <div className="space-y-6">
      {/* ==================== 9 REPOSITORIES BANNER ==================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>9 Legally Verified Open-Access Repositories &amp; National Curricula</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Open Educational Resources &amp; Curriculum Directory
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl">
              Access textbooks, public domain classics, curriculum frameworks, and courseware from verified open authorities. Convert any authentic chapter or passage into board-aligned examination practice sets with step-by-step M1/A1 marking schemes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 block">Curated Guides</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white tabular-nums">
                {OPEN_ACCESS_RESOURCES_INDEX.length}
              </span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500 block">Curriculum Systems</span>
              <span className="font-bold text-sm text-indigo-600 dark:text-indigo-400 tabular-nums">
                WAEC · NECO · JAMB · CAIE · SAT
              </span>
            </div>
          </div>
        </div>

        {/* 9 Repositories Visual Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          {OPEN_ACCESS_REPOSITORIES.map((repo) => {
            const isSelected = selectedRepo === repo.id;
            return (
              <div
                key={repo.id}
                onClick={() => {
                  soundFx.playSelect();
                  setSelectedRepo((prev) => (prev === repo.id ? 'all' : repo.id));
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs ring-1 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xl">{repo.iconEmoji}</span>
                    <a
                      href={repo.homepageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title={`Visit ${repo.name} website`}
                      className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 rounded"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                    {repo.shortName}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {repo.tagline}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Verified</span>
                  <span className="truncate max-w-[80px]">{repo.countryOrRegion}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================== FILTERS & SEARCH ROW ==================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3.5 shadow-2xs">
        {/* Priority Regions Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {[
              { id: 'all', label: 'All Regions' },
              { id: 'west_africa', label: '🇳🇬 West Africa (WAEC · NECO · JAMB · BECE)' },
              { id: 'uk_international', label: '🇬🇧 UK & International (Cambridge · GCSE)' },
              { id: 'us_admissions', label: '🇺🇸 US & Admissions (SAT · ACT · AP · IB)' },
            ].map((reg) => {
              const active = priorityRegion === reg.id;
              return (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    setPriorityRegion(reg.id as PriorityRegionFilter);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {reg.label}
                </button>
              );
            })}
          </div>

          {selectedRepo !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedRepo('all')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline self-start sm:self-center"
            >
              Reset Repository Filter (Viewing {OPEN_ACCESS_REPOSITORIES.find((r) => r.id === selectedRepo)?.shortName})
            </button>
          )}
        </div>

        {/* Search Bar & Target Board Dropdown */}
        <div className="flex flex-col md:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, syllabus code, author, passage keywords, or book title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value as ExamFormatId | 'all')}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Examination Boards</option>
              <option value="waec">WAEC (WASSCE)</option>
              <option value="neco">NECO SSCE</option>
              <option value="jamb">JAMB UTME</option>
              <option value="bece">BECE (Junior Secondary)</option>
              <option value="igcse">Cambridge IGCSE</option>
              <option value="alevel_uk">Cambridge / UK A-Level</option>
              <option value="gcse_uk">Pearson Edexcel / UK GCSE</option>
              <option value="sat">Digital SAT</option>
              <option value="ap_ib">AP &amp; International Baccalaureate</option>
            </select>
          </div>
        </div>
      </div>

      {/* ==================== CURATED OPEN RESOURCES LIST ==================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Curated Open-Access Syllabi &amp; Textbooks
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-400">
              {filteredCuratedResources.length} items
            </span>
          </div>
          {isSearchingLive && (
            <span className="text-xs text-indigo-600 dark:text-indigo-400 animate-pulse font-medium">
              Querying external repositories...
            </span>
          )}
        </div>

        {filteredCuratedResources.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No matching open resources found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your query or resetting the regional and repository filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedRepo('all');
                setPriorityRegion('all');
                setSelectedBoard('all');
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCuratedResources.map((res) => {
              const repoMeta = OPEN_ACCESS_REPOSITORIES.find((r) => r.id === res.repositoryId);
              return (
                <div
                  key={res.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3.5 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-2.5">
                    {/* Header tags */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        <span>{repoMeta?.iconEmoji}</span>
                        <span>{repoMeta?.shortName}</span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {res.license}
                        </span>
                      </div>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1"
                        title="Open source textbook on repository"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {res.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {res.description}
                    </p>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span><strong>Author/Org:</strong> {res.authorOrOrganization}</span>
                      <span>·</span>
                      <span><strong>Subject:</strong> {res.subject}</span>
                    </div>

                    {/* Target Exam Boards badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {res.targetExamBoards.map((b) => (
                        <span
                          key={b}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                        >
                          {b.replace('_', ' ')}
                        </span>
                      ))}
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium ml-1">
                        {res.curriculumFrameworkLevel}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        setActiveReadingResource(res);
                        setActiveReadingChapter(res.chaptersOrSections[0] || null);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Read Passages ({res.chaptersOrSections.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openConvertModal(res)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Convert to Board Practice</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================== LIVE EXTERNAL REPOSITORY RESULTS (GUTENBERG, IA, WIKIBOOKS) ==================== */}
      {liveExternalResults.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Live External Repository Results (Project Gutenberg · Internet Archive · Wikibooks)
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-600 dark:text-indigo-400">
              {liveExternalResults.length} live records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {liveExternalResults.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase">
                      {item.repositoryId.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {item.license}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                    {item.title}
                  </h4>
                  {item.author && (
                    <p className="text-[11px] text-slate-500">By {item.author}</p>
                  )}
                  {item.snippet && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                      {item.snippet}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>Read on Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== VERBATIM PASSAGE & PROVENANCE READER MODAL ==================== */}
      {activeReadingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {activeReadingResource.license}
                  </span>
                  <span>·</span>
                  <span>{activeReadingResource.authorOrOrganization}</span>
                  <span>·</span>
                  <span>{activeReadingResource.yearOrEdition}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeReadingResource.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveReadingResource(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Chapter switcher + Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Chapter navigation if multiple chapters */}
              {activeReadingResource.chaptersOrSections.length > 1 && (
                <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                  {activeReadingResource.chaptersOrSections.map((ch, idx) => {
                    const isSelected = activeReadingChapter?.id === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          soundFx.playSelect();
                          setActiveReadingChapter(ch);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        Section {idx + 1}: {ch.title.split('·')[0].slice(0, 30)}
                      </button>
                    );
                  })}
                </div>
              )}

              {activeReadingChapter && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {activeReadingChapter.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {activeReadingChapter.summary}
                    </p>
                  </div>

                  {/* Verbatim text box */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Verbatim Authorized Text / Syllabus Specification
                    </span>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed select-text">
                      {activeReadingChapter.passageText}
                    </div>
                  </div>

                  {/* Key Concepts */}
                  {activeReadingChapter.keyConcepts && activeReadingChapter.keyConcepts.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Curriculum Key Concepts
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeReadingChapter.keyConcepts.map((k) => (
                          <span
                            key={k}
                            className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-medium text-indigo-700 dark:text-indigo-300"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sample Worked Problem with Mark Scheme */}
                  {activeReadingChapter.workedProblem && (
                    <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                        <GraduationCap className="w-4 h-4 text-amber-600" />
                        <span>Syllabus Worked Benchmark Problem &amp; Official Rubric</span>
                      </div>
                      <p className="text-xs font-medium text-slate-900 dark:text-white whitespace-pre-wrap">
                        {activeReadingChapter.workedProblem.question}
                      </p>
                      <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400">Step-by-Step Solution:</p>
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {activeReadingChapter.workedProblem.stepByStepSolution}
                        </p>
                        {activeReadingChapter.workedProblem.markSchemeNotes && (
                          <div className="mt-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200/50 dark:border-amber-900/40 font-mono text-[11px] text-indigo-700 dark:text-indigo-300">
                            {activeReadingChapter.workedProblem.markSchemeNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Citation Box */}
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                        Academic Citation &amp; Provenance:
                      </span>
                      <p className="text-slate-500 dark:text-slate-400 select-text font-serif">
                        {activeReadingResource.citationText}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCitation(activeReadingResource.citationText)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      {copiedCitation ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Citation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
              <a
                href={activeReadingResource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Read Full Document at {activeReadingResource.authorOrOrganization}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => {
                  const res = activeReadingResource;
                  const ch = activeReadingChapter;
                  setActiveReadingResource(null);
                  openConvertModal(res, ch || undefined);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Convert into Board Practice Paper</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CONVERT TO BOARD PRACTICE EXAM MODAL ==================== */}
      {convertModalOpen && targetResourceToConvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Examination Synthesis &amp; Marking Scheme Generator</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Convert Open Resource to Board Practice Paper
                </h3>
                <p className="text-xs text-slate-500">
                  Source: &ldquo;{targetResourceToConvert.title}&rdquo; ({targetResourceToConvert.license})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConvertModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {!conversionResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Target Examination System
                      </label>
                      <select
                        value={conversionBoard}
                        onChange={(e) => setConversionBoard(e.target.value as ExamFormatId)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                      >
                        <optgroup label="West Africa">
                          <option value="waec">WAEC (WASSCE) Objective + Theory</option>
                          <option value="neco">NECO SSCE</option>
                          <option value="jamb">JAMB UTME</option>
                          <option value="bece">BECE (Junior Secondary)</option>
                        </optgroup>
                        <optgroup label="UK & International">
                          <option value="igcse">Cambridge IGCSE</option>
                          <option value="alevel_uk">Cambridge International A-Level</option>
                          <option value="gcse_uk">Pearson Edexcel GCSE</option>
                        </optgroup>
                        <optgroup label="US & Admissions">
                          <option value="sat">College Board Digital SAT</option>
                          <option value="ap_ib">Advanced Placement (AP) &amp; IB</option>
                        </optgroup>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Number of Examination Questions
                      </label>
                      <select
                        value={conversionCount}
                        onChange={(e) => setConversionCount(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                      >
                        <option value={3}>3 High-Yield Questions (Quick Practice)</option>
                        <option value={5}>5 Questions (Standard Section)</option>
                        <option value={8}>8 Questions (Full Paper Sample)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      Source Excerpt for Question Generation:
                    </span>
                    <p className="text-slate-500 font-mono line-clamp-3">
                      {activeReadingChapter?.passageText || targetResourceToConvert.description}
                    </p>
                  </div>

                  {conversionError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                      {conversionError}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isConverting}
                    onClick={handleExecuteConversion}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    {isConverting ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        <span>Synthesizing Board Examination &amp; Mark Scheme...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Authentic Examination Paper</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* Successful Conversion Output */
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Examination Paper Successfully Generated &amp; Calibrated</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {conversionResult.paperTitle}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {conversionResult.sourceAttribution} · {conversionResult.totalMarks} Marks · {conversionResult.durationMinutes} mins
                    </p>
                  </div>

                  {/* Questions Preview */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Generated Questions &amp; Marking Rubrics ({conversionResult.questions?.length})
                    </span>
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {conversionResult.questions?.map((q: any, i: number) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                            <span>Q{q.number || i + 1} · {q.section}</span>
                            <span className="text-indigo-600 dark:text-indigo-400">[{q.marks} marks]</span>
                          </div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {q.question}
                          </p>
                          <div className="pt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                            Mark Scheme: {q.markingSchemeNotes || q.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Launch Actions */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setConversionResult(null)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                    >
                      Regenerate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLaunchPractice(conversionResult)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start Interactive Exam Practice Now</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
