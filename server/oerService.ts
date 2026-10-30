import { GoogleGenAI, Type } from '@google/genai';
import {
  OpenAccessRepositoryId,
  OpenAccessResourceRecord,
  LicenseClassification,
  OerLiveSearchResultItem,
  OerConvertToPaperRequest,
} from '../src/types/openAccess';
import { OPEN_ACCESS_REPOSITORIES, OPEN_ACCESS_RESOURCES_INDEX } from '../src/data/openAccessRepositories';
import { neutralizePromptInjection } from './securityMiddleware';

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Perform safe fetch with timeout to external OER endpoints
 */
async function fetchWithTimeout(url: string, timeoutMs = 2800): Promise<any> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'QuizMe-OpenEducationBot/1.0 (Educational Assessment Platform; mailto:admin@quizme.edu)',
      },
    });
    clearTimeout(id);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    clearTimeout(id);
    return null;
  }
}

/**
 * Search Gutendex (Project Gutenberg public JSON API)
 */
async function searchGutendex(query: string): Promise<OerLiveSearchResultItem[]> {
  try {
    const data = await fetchWithTimeout(`https://gutendex.com/books/?search=${encodeURIComponent(query)}`);
    if (!data || !Array.isArray(data.results)) return [];

    return data.results.slice(0, 5).map((item: any) => {
      const authors = Array.isArray(item.authors)
        ? item.authors.map((a: any) => a.name).join(', ')
        : 'Unknown Author';
      const webUrl = item.formats?.['text/html'] || `https://www.gutenberg.org/ebooks/${item.id}`;
      return {
        id: `gutenberg-live-${item.id}`,
        title: item.title || 'Untitled Book',
        author: authors,
        repositoryId: 'project_gutenberg' as OpenAccessRepositoryId,
        sourceUrl: webUrl,
        license: 'Public Domain' as LicenseClassification,
        snippet: `Public Domain Gutenberg EBook #${item.id}. Download count: ${item.download_count || 0}. Subjects: ${Array.isArray(item.subjects) ? item.subjects.slice(0, 3).join('; ') : 'Classical Literature'}.`,
        year: 'Classical Edition',
        subject: item.subjects?.[0] || 'Literature & History',
        targetExamBoards: ['waec', 'neco', 'cambridge_igcse', 'sat'],
        isLiveApiResult: true,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Search Internet Archive Open API
 */
async function searchInternetArchive(query: string): Promise<OerLiveSearchResultItem[]> {
  try {
    const cleanQ = encodeURIComponent(`${query} AND mediatype:(texts)`);
    const data = await fetchWithTimeout(
      `https://archive.org/advancedsearch.php?q=${cleanQ}&fl[]=identifier,title,creator,year,description&output=json&rows=5`
    );
    if (!data || !data.response || !Array.isArray(data.response.docs)) return [];

    return data.response.docs.map((doc: any) => ({
      id: `ia-live-${doc.identifier}`,
      title: doc.title || doc.identifier,
      author: doc.creator || 'Internet Archive Contributor',
      repositoryId: 'internet_archive' as OpenAccessRepositoryId,
      sourceUrl: `https://archive.org/details/${doc.identifier}`,
      license: 'Public Domain & Open Access Historical Media' as LicenseClassification,
      snippet: doc.description ? String(doc.description).slice(0, 180) + '...' : 'Digitized open educational document on Internet Archive.',
      year: doc.year ? String(doc.year) : 'Historical Archive',
      subject: 'Historical Curriculum & Science',
      targetExamBoards: ['waec', 'neco', 'cambridge_alevel'],
      isLiveApiResult: true,
    }));
  } catch {
    return [];
  }
}

/**
 * Search Wikibooks Open MediaWiki API
 */
async function searchWikibooks(query: string): Promise<OerLiveSearchResultItem[]> {
  try {
    const data = await fetchWithTimeout(
      `https://en.wikibooks.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=5&format=json`
    );
    if (!data || !Array.isArray(data) || data.length < 4) return [];

    const titles = data[1] || [];
    const snippets = data[2] || [];
    const urls = data[3] || [];

    const results: OerLiveSearchResultItem[] = [];
    for (let i = 0; i < titles.length; i++) {
      if (titles[i] && urls[i]) {
        results.push({
          id: `wikibooks-live-${i}-${encodeURIComponent(titles[i])}`,
          title: titles[i],
          author: 'Wikimedia Open Community',
          repositoryId: 'wikibooks' as OpenAccessRepositoryId,
          sourceUrl: urls[i],
          license: 'CC BY-SA 4.0' as LicenseClassification,
          snippet: snippets[i] || 'Wikibooks collaborative open-content textbook chapter.',
          year: 'Living Open Edition',
          subject: 'Open Mathematics & Science',
          targetExamBoards: ['alevel_uk', 'edexcel_igcse', 'ap_ib'],
          isLiveApiResult: true,
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}

/**
 * Multi-source Unified Search: Merges curated index with live external APIs
 */
export async function searchOpenAccessLibrary(params: {
  query?: string;
  repositoryId?: OpenAccessRepositoryId | 'all';
  targetExamBoard?: string;
  subject?: string;
  priorityRegion?: 'all' | 'west_africa' | 'uk_international' | 'us_admissions';
}) {
  const q = (params.query || '').trim().toLowerCase();
  const repoFilter = params.repositoryId || 'all';
  const examFilter = params.targetExamBoard || 'all';
  const regionFilter = params.priorityRegion || 'all';

  // 1. Filter local curated index
  const matchedCurated = OPEN_ACCESS_RESOURCES_INDEX.filter((res) => {
    // Repository filter
    if (repoFilter !== 'all' && res.repositoryId !== repoFilter) {
      return false;
    }
    // Exam board filter
    if (examFilter !== 'all' && !res.targetExamBoards.includes(examFilter as any)) {
      return false;
    }
    // Priority region filter
    if (regionFilter === 'west_africa') {
      const isWA = res.targetExamBoards.some((b) => ['waec', 'neco', 'jamb', 'bece', 'nabteb'].includes(b));
      if (!isWA && res.repositoryId !== 'nerdc_curriculum') return false;
    } else if (regionFilter === 'uk_international') {
      const isUK = res.targetExamBoards.some((b) =>
        ['cambridge_igcse', 'cambridge_alevel', 'cambridge_checkpoint', 'edexcel_gcse', 'edexcel_alevel', 'aqa_gcse', 'ocr_gcse', 'ib'].includes(b)
      );
      if (!isUK) return false;
    } else if (regionFilter === 'us_admissions') {
      const isUS = res.targetExamBoards.some((b) => ['sat', 'act', 'ap', 'ged', 'psat'].includes(b));
      if (!isUS) return false;
    }

    // Text search query
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

  // 2. Query live APIs if query is provided and repo allows
  let liveResults: OerLiveSearchResultItem[] = [];
  if (q.length >= 2) {
    const liveTasks: Array<Promise<OerLiveSearchResultItem[]>> = [];

    if (repoFilter === 'all' || repoFilter === 'project_gutenberg') {
      liveTasks.push(searchGutendex(q));
    }
    if (repoFilter === 'all' || repoFilter === 'internet_archive') {
      liveTasks.push(searchInternetArchive(q));
    }
    if (repoFilter === 'all' || repoFilter === 'wikibooks') {
      liveTasks.push(searchWikibooks(q));
    }

    const settled = await Promise.allSettled(liveTasks);
    settled.forEach((res) => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        liveResults.push(...res.value);
      }
    });
  }

  return {
    curated: matchedCurated,
    liveExternal: liveResults,
    totalCuratedCount: matchedCurated.length,
    totalLiveCount: liveResults.length,
    repositories: OPEN_ACCESS_REPOSITORIES,
  };
}

/**
 * Transform an Open Access chapter or passage into an official board-aligned practice exam paper
 */
export async function convertOerToExamPaperAI(req: OerConvertToPaperRequest) {
  const resource = OPEN_ACCESS_RESOURCES_INDEX.find((r) => r.id === req.resourceId);
  const chapter = resource?.chaptersOrSections.find((c) => c.id === req.chapterId) || resource?.chaptersOrSections[0];

  const sourceTitle = resource ? resource.title : 'Open Educational Source Material';
  const sourceAuthor = resource ? resource.authorOrOrganization : 'Educational Open Repository';
  const sourceLicense = resource ? resource.license : 'Open Access';
  const sourceRef = resource?.officialCurriculumRef || `OER-${req.resourceId}`;

  const passageContent = req.passageText || chapter?.passageText || chapter?.summary || 'Foundational curriculum principles and worked applications.';
  const safePassage = neutralizePromptInjection(passageContent).slice(0, 4500);

  const targetBoard = req.targetExamBoard || 'waec';
  const targetSubject = req.targetSubject || resource?.subject || 'General Academic Subject';
  const questionCount = Math.min(Math.max(req.questionCount || 5, 3), 10);

  // Board-specific formatting instructions
  let boardGuidance = '';
  if (targetBoard === 'waec' || targetBoard === 'neco') {
    boardGuidance = `Target Examination Board: West African Examinations Council (WAEC / WASSCE) & NECO
Format Requirements:
1. Include Section A (Objective Multiple-Choice Questions) with 4 options ('A', 'B', 'C', 'D').
2. Include Section B (Compulsory & Structured Theory) with rigorous step-by-step M1 (Method), A1 (Accuracy), and B1 (Independent) marking scheme rubrics.
3. Keep the terminology aligned with NERDC Senior Secondary (SSS 1–3) standards.`;
  } else if (targetBoard === 'jamb') {
    boardGuidance = `Target Examination Board: JAMB UTME (Unified Tertiary Matriculation Examination)
Format Requirements:
1. Fast-paced, high-precision Multiple-Choice Questions testing both recall and conceptual application.
2. 4 distinct options ('A', 'B', 'C', 'D') with clear distractors and concise explanation of the key discriminator.`;
  } else if (targetBoard === 'bece') {
    boardGuidance = `Target Examination Board: Basic Education Certificate Examination (BECE)
Format Requirements:
1. Formulated for Junior Secondary School (JSS 3) students.
2. Clear foundational questions covering NERDC Basic Science & Technology or Mathematics standards with simple step-by-step marking rubrics.`;
  } else if (targetBoard === 'igcse' || targetBoard === 'alevel_uk' || targetBoard === 'gcse_uk') {
    boardGuidance = `Target Examination Board: Cambridge Assessment International Education (CAIE - IGCSE / International A-Level)
Format Requirements:
1. Use Cambridge command words: 'State', 'Explain', 'Calculate', 'Deduce', 'Evaluate'.
2. Provide official mark allocation ([1], [2], [4] marks) with explicit Cambridge marking scheme breakdown (M1/A1/B1).`;
  } else if (targetBoard === 'sat' || targetBoard === 'ap_ib') {
    boardGuidance = `Target Examination Board: College Board Digital SAT & AP / International Baccalaureate
Format Requirements:
1. Passages must include direct paired-evidence questions, vocabulary-in-context, or quantitative reasoning items.
2. Provide explanation detailing why the correct choice is logically supported and why the distractors fail.`;
  } else {
    boardGuidance = `Target Examination Board: ${targetBoard.toUpperCase()}
Format Requirements:
1. Structure into Section A (Objective) and Section B (Structured Theory) with official marking scheme notes.`;
  }

  const prompt = `You are a Senior Chief Examiner transforming an Open-Access Educational Resource into a verified, board-aligned practice examination paper.

${boardGuidance}

Source Resource Metadata:
- Title: "${sourceTitle}"
- Organization / Author: "${sourceAuthor}"
- License / Rights: "${sourceLicense}"
- Official Curriculum Ref: "${sourceRef}"
- Target Subject: "${targetSubject}"

Source Passage / Excerpt:
"""
${safePassage}
"""

Generate exactly ${questionCount} examination items based directly on the passage above.
Every question MUST include:
- number (integer: 1 to ${questionCount})
- section (e.g. "Section A · Objective" or "Section B · Structured Theory")
- marks (integer: 1 to 10)
- question (clear, formal examination prompt)
- options (array of 4 string options for multiple choice, or empty array for theory)
- answer (the exact correct answer string)
- markingSchemeNotes (detailed Chief Examiner rubric with [M1], [A1], [B1] points and acceptable alternative methods)

Return valid JSON adhering strictly to the schema.`;

  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            paperTitle: { type: Type.STRING },
            paperCode: { type: Type.STRING },
            targetBoard: { type: Type.STRING },
            durationMinutes: { type: Type.INTEGER },
            totalMarks: { type: Type.INTEGER },
            candidateInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            provenanceHeader: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.INTEGER },
                  section: { type: Type.STRING },
                  marks: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING },
                  markingSchemeNotes: { type: Type.STRING },
                },
                required: ['number', 'section', 'marks', 'question', 'answer', 'markingSchemeNotes'],
              },
            },
          },
          required: ['paperTitle', 'paperCode', 'targetBoard', 'durationMinutes', 'totalMarks', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return {
        success: true,
        data: {
          paperTitle: parsed.paperTitle || `${targetSubject} Practice Paper (${targetBoard.toUpperCase()} Standard)`,
          paperCode: parsed.paperCode || `OER-${targetBoard.toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
          targetBoard,
          subject: targetSubject,
          sourceAttribution: `Derived from "${sourceTitle}" by ${sourceAuthor} (${sourceLicense})`,
          durationMinutes: parsed.durationMinutes || 45,
          totalMarks: parsed.totalMarks || parsed.questions.reduce((sum: number, q: any) => sum + (q.marks || 1), 0),
          candidateInstructions: parsed.candidateInstructions || [
            'Read the source excerpt carefully before attempting questions.',
            'Show all steps clearly in Section B; method marks (M1) will be awarded for valid intermediate calculations.',
          ],
          questions: parsed.questions,
        },
      };
    }
  } catch (err) {
    console.warn('AI conversion failed, falling back to curated schema:', err);
  }

  // Graceful deterministic fallback from curated chapter if AI is unavailable
  const fallbackQuestions = (chapter?.workedProblem ? [
    {
      number: 1,
      section: 'Section A · Conceptual Understanding',
      marks: 2,
      question: `Based on the excerpt from "${sourceTitle}", which principle is foundational to ${targetSubject}?`,
      options: [
        chapter.keyConcepts[0] || 'Foundational conservation invariant',
        'Arbitrary empirical parameter',
        'Unverified heuristic rule',
        'Independent isolated variable',
      ],
      answer: chapter.keyConcepts[0] || 'Foundational conservation invariant',
      markingSchemeNotes: `[B1] for identifying ${chapter.keyConcepts[0] || 'the core principle'} from the source text.`,
    },
    {
      number: 2,
      section: 'Section B · Structured Application',
      marks: 6,
      question: chapter.workedProblem.question,
      options: [],
      answer: chapter.workedProblem.stepByStepSolution,
      markingSchemeNotes: chapter.workedProblem.markSchemeNotes || '[M1] for logical setup. [A1] for correct final derivation.',
    },
  ] : [
    {
      number: 1,
      section: 'Section A · Objective Analysis',
      marks: 2,
      question: `What primary thesis does the passage from "${sourceTitle}" establish regarding ${targetSubject}?`,
      options: [
        'Rigorous systemic causality governs the observed behavior',
        'Observations are purely random without underlying principles',
        'Historical precedent has no bearing on modern analysis',
        'The described system operates without constraints',
      ],
      answer: 'Rigorous systemic causality governs the observed behavior',
      markingSchemeNotes: '[B1] for identifying systemic causality as the governing thesis.',
    },
  ]);

  return {
    success: true,
    data: {
      paperTitle: `${targetSubject} Examination Practice (${targetBoard.toUpperCase()} Specification)`,
      paperCode: `OER-${targetBoard.toUpperCase()}-STD`,
      targetBoard,
      subject: targetSubject,
      sourceAttribution: `Derived from "${sourceTitle}" by ${sourceAuthor} (${sourceLicense})`,
      durationMinutes: 45,
      totalMarks: fallbackQuestions.reduce((s, q) => s + q.marks, 0),
      candidateInstructions: [
        'Answer all questions according to the syllabus requirements.',
        'Method marks (M1) and accuracy marks (A1) are allocated according to the official mark scheme.',
      ],
      questions: fallbackQuestions,
    },
  };
}
