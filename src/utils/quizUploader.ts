import { QuizResponse, Question, DifficultyType, PersonaType } from '../types/quiz';

export interface ParseQuizResult {
  success: boolean;
  quiz?: QuizResponse;
  rawQuestionsCount?: number;
  fileName?: string;
  error?: string;
}

/**
 * Intelligent parser that converts uploaded JSON or structured text/markdown
 * into a robust, normalized QuizResponse for QuizMe.
 */
export function parseUploadedQuiz(
  fileContent: string,
  fileName = 'uploaded_quiz.json',
  fallbackPersona: PersonaType = 'Student'
): ParseQuizResult {
  const trimmed = fileContent.trim();
  if (!trimmed) {
    return {
      success: false,
      error: 'The uploaded file is empty. Please upload a valid quiz file.',
      fileName,
    };
  }

  // 1. Try parsing as JSON first
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return normalizeJsonQuiz(parsed, fileName, fallbackPersona);
    } catch (jsonErr: any) {
      // If JSON parse failed, and it might be text or slightly malformed JSON, try text parsing
      console.warn('JSON parse failed, attempting text/markdown parse fallback:', jsonErr);
    }
  }

  // 2. Try parsing as structured Markdown or plain text quiz
  const textResult = parseTextQuiz(trimmed, fileName, fallbackPersona);
  if (textResult.success) {
    return textResult;
  }

  return {
    success: false,
    error:
      'Could not parse the uploaded quiz. Please ensure your file is valid JSON or formatted as numbered questions with options and answers.',
    fileName,
  };
}

/**
 * Normalizes any JSON payload into a strict QuizResponse
 */
function normalizeJsonQuiz(
  data: any,
  fileName: string,
  fallbackPersona: PersonaType
): ParseQuizResult {
  let questionsArray: any[] = [];
  let title = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  let summary = 'Uploaded scholar assessment';
  let difficulty: DifficultyType = 'Intermediate';
  let persona: PersonaType = fallbackPersona;
  let studyGuide: any = undefined;
  let tags: string[] = ['uploaded', 'custom'];

  if (Array.isArray(data)) {
    questionsArray = data;
  } else if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data.questions)) {
      questionsArray = data.questions;
    } else if (Array.isArray(data.items)) {
      questionsArray = data.items;
    } else if (Array.isArray(data.quiz?.questions)) {
      questionsArray = data.quiz.questions;
    } else if (data.data && Array.isArray(data.data.questions)) {
      questionsArray = data.data.questions;
    }

    if (data.quiz_title) title = String(data.quiz_title).trim();
    else if (data.title) title = String(data.title).trim();
    else if (data.name) title = String(data.name).trim();

    if (data.summary) summary = String(data.summary).trim();
    else if (data.description) summary = String(data.description).trim();

    if (['Beginner', 'Intermediate', 'Master'].includes(data.difficulty)) {
      difficulty = data.difficulty;
    }

    if (data.persona === 'Teacher' || data.persona === 'Student') {
      persona = data.persona;
    }

    if (data.study_guide && typeof data.study_guide === 'object') {
      studyGuide = data.study_guide;
    }

    if (Array.isArray(data.tags)) {
      tags = data.tags.map((t: any) => String(t));
    }
  }

  if (!questionsArray || questionsArray.length === 0) {
    return {
      success: false,
      error: 'No questions found in the uploaded JSON. Ensure your quiz has a "questions" array.',
      fileName,
    };
  }

  // Normalize each question
  const normalizedQuestions: Question[] = [];

  for (let i = 0; i < questionsArray.length; i++) {
    const raw = questionsArray[i];
    if (!raw || typeof raw !== 'object') continue;

    const qText = String(raw.question || raw.prompt || raw.title || '').trim();
    if (!qText) continue;

    // Normalize options
    let rawOptions: string[] = [];
    if (Array.isArray(raw.options)) {
      rawOptions = raw.options.map((o: any) => String(o).trim()).filter(Boolean);
    } else if (Array.isArray(raw.choices)) {
      rawOptions = raw.choices.map((c: any) => String(c).trim()).filter(Boolean);
    } else if (Array.isArray(raw.answers)) {
      rawOptions = raw.answers.map((a: any) => String(a).trim()).filter(Boolean);
    }

    // Determine correct answer
    let correctAnswer = String(
      raw.correct_answer || raw.correctAnswer || raw.answer || raw.correct || ''
    ).trim();

    // If correct answer is a letter like "A", "B", "C", "D" and options exist, map to option text
    if (/^[A-Da-d]$/.test(correctAnswer) && rawOptions.length > 0) {
      const idx = correctAnswer.toUpperCase().charCodeAt(0) - 65;
      if (rawOptions[idx]) {
        correctAnswer = rawOptions[idx];
      }
    } else if (/^\d+$/.test(correctAnswer) && rawOptions.length > 0) {
      const idx = parseInt(correctAnswer, 10) - 1;
      if (idx >= 0 && rawOptions[idx]) {
        correctAnswer = rawOptions[idx];
      }
    }

    // Fallback if no correct answer specified: pick first option
    if (!correctAnswer && rawOptions.length > 0) {
      correctAnswer = rawOptions[0];
    }

    // If options don't contain correct answer and it's multiple choice, append it
    if (rawOptions.length > 0 && !rawOptions.includes(correctAnswer)) {
      rawOptions.push(correctAnswer);
    }

    const explanation = String(
      raw.explanation ||
        raw.rationale ||
        raw.why ||
        `Correct answer is: ${correctAnswer}.`
    ).trim();

    const hint =
      raw.gamified_feedback?.hint ||
      raw.hint ||
      'Consider the primary definitions and core principles.';

    const successQuote =
      raw.gamified_feedback?.success_quote ||
      raw.success_quote ||
      'Excellent deductive reasoning!';

    const points = typeof raw.points === 'number' ? raw.points : 10;

    normalizedQuestions.push({
      id: i + 1,
      type: raw.type && ['multiple_choice', 'fill_in_blank', 'open_explanation', 'code_media_challenge'].includes(raw.type)
        ? raw.type
        : rawOptions.length > 0
        ? 'multiple_choice'
        : 'fill_in_blank',
      question: qText,
      options: rawOptions.length > 0 ? rawOptions : null,
      correct_answer: correctAnswer || 'Correct',
      explanation,
      gamified_feedback: {
        success_quote: successQuote,
        hint,
      },
      points,
      bloom_level: raw.bloom_level || 'Understand',
      domain: raw.domain || 'Analytical Reasoning',
    });
  }

  if (normalizedQuestions.length === 0) {
    return {
      success: false,
      error: 'Found questions in file, but none contained valid question text.',
      fileName,
    };
  }

  const finalQuiz: QuizResponse = {
    app_name: 'Quiz Me!',
    persona,
    quiz_title: title || 'Uploaded Quiz',
    summary: summary || `Assessment containing ${normalizedQuestions.length} custom questions`,
    difficulty,
    questions: normalizedQuestions,
    study_guide: studyGuide || {
      key_takeaways: normalizedQuestions.slice(0, 5).map((q) => q.question),
      core_vocabulary: [],
      recommended_review: 'Review any questions you miss during your assessment session.',
    },
    tags: tags.includes('uploaded') ? tags : [...tags, 'uploaded'],
    created_at: new Date().toISOString(),
  };

  return {
    success: true,
    quiz: finalQuiz,
    rawQuestionsCount: normalizedQuestions.length,
    fileName,
  };
}

/**
 * Parses plain text or Markdown quiz format:
 * e.g.
 * 1. Question text
 * A) Option 1
 * B) Option 2
 * Answer: B
 * Explanation: ...
 */
function parseTextQuiz(
  text: string,
  fileName: string,
  fallbackPersona: PersonaType
): ParseQuizResult {
  const lines = text.split(/\r?\n/);
  const questions: Question[] = [];

  let currentTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  let currentQuestionText = '';
  let currentOptions: string[] = [];
  let currentAnswer = '';
  let currentExplanation = '';
  let currentHint = '';

  const flushQuestion = () => {
    if (currentQuestionText.trim()) {
      let resolvedAnswer = currentAnswer.trim();

      // If answer is letter, map to option
      if (/^[A-Da-d]$/.test(resolvedAnswer) && currentOptions.length > 0) {
        const idx = resolvedAnswer.toUpperCase().charCodeAt(0) - 65;
        if (currentOptions[idx]) {
          resolvedAnswer = currentOptions[idx];
        }
      }

      if (!resolvedAnswer && currentOptions.length > 0) {
        resolvedAnswer = currentOptions[0];
      }

      questions.push({
        id: questions.length + 1,
        type: currentOptions.length > 0 ? 'multiple_choice' : 'fill_in_blank',
        question: currentQuestionText.trim(),
        options: currentOptions.length > 0 ? currentOptions : null,
        correct_answer: resolvedAnswer || 'Correct',
        explanation: currentExplanation.trim() || `The correct answer is: ${resolvedAnswer}`,
        gamified_feedback: {
          success_quote: 'Great analytical recall!',
          hint: currentHint.trim() || 'Focus on the key terminology in the question.',
        },
        points: 10,
        bloom_level: 'Apply',
      });
    }

    currentQuestionText = '';
    currentOptions = [];
    currentAnswer = '';
    currentExplanation = '';
    currentHint = '';
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check title line at the very top (e.g., "Title: ..." or "# ...")
    if (i < 3 && /^#+\s+(.*)$/i.test(line)) {
      currentTitle = line.replace(/^#+\s+/, '').trim();
      continue;
    }
    if (i < 3 && /^title[\:\s]+(.*)$/i.test(line)) {
      currentTitle = line.replace(/^title[\:\s]+/i, '').trim();
      continue;
    }

    // Check for question start: e.g. "1. ...", "1) ...", "Q1: ...", "Question 1: ..."
    const qMatch = line.match(/^(?:Q\d+[\:\.\)]|Question\s*\d+[\:\.]|\d+[\.\)])\s*(.*)$/i);
    if (qMatch) {
      flushQuestion();
      currentQuestionText = qMatch[1].trim();
      continue;
    }

    // Check for option: e.g. "A) ...", "A. ...", "- [ ] ...", "a) ..."
    const optMatch = line.match(/^[A-Da-d][\.\)]\s*(.*)$/);
    if (optMatch && currentQuestionText) {
      currentOptions.push(optMatch[1].trim());
      continue;
    }

    // Check for Answer line: "Answer: ...", "Correct: ...", "Ans: ..."
    const ansMatch = line.match(/^(?:Answer|Correct(?:\s*Answer)?|Ans)[\:\s\-]+(.*)$/i);
    if (ansMatch && currentQuestionText) {
      currentAnswer = ansMatch[1].trim();
      continue;
    }

    // Check for Explanation line: "Explanation: ...", "Why: ..."
    const expMatch = line.match(/^(?:Explanation|Rationale|Reason|Why)[\:\s\-]+(.*)$/i);
    if (expMatch && currentQuestionText) {
      currentExplanation = expMatch[1].trim();
      continue;
    }

    // Check for Hint line: "Hint: ..."
    const hintMatch = line.match(/^(?:Hint|Tip)[\:\s\-]+(.*)$/i);
    if (hintMatch && currentQuestionText) {
      currentHint = hintMatch[1].trim();
      continue;
    }

    // Continuation of question text if we haven't seen options yet
    if (currentQuestionText && currentOptions.length === 0 && !currentAnswer) {
      currentQuestionText += ' ' + line;
    }
  }

  flushQuestion();

  if (questions.length === 0) {
    return {
      success: false,
      error: 'Could not extract any questions from the plain text file.',
      fileName,
    };
  }

  const finalQuiz: QuizResponse = {
    app_name: 'Quiz Me!',
    persona: fallbackPersona,
    quiz_title: currentTitle || 'Uploaded Quiz',
    summary: `Assessment imported from text (${questions.length} questions)`,
    difficulty: 'Intermediate',
    questions,
    study_guide: {
      key_takeaways: questions.slice(0, 5).map((q) => q.question),
      core_vocabulary: [],
      recommended_review: 'Review any questions you miss during your assessment session.',
    },
    tags: ['uploaded', 'text-import'],
    created_at: new Date().toISOString(),
  };

  return {
    success: true,
    quiz: finalQuiz,
    rawQuestionsCount: questions.length,
    fileName,
  };
}

/**
 * Helper to generate a clean sample JSON template for users to copy or download
 */
export function getSampleQuizJson(): string {
  const sample: QuizResponse = {
    app_name: 'Quiz Me!',
    persona: 'Student',
    quiz_title: 'Introduction to Computer Science & Algorithms',
    summary: 'Core algorithmic complexity and data structures assessment',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 1,
        type: 'multiple_choice',
        question: 'What is the average time complexity of searching in a balanced Binary Search Tree (BST)?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correct_answer: 'O(log n)',
        explanation:
          'In a balanced binary search tree, half of the remaining nodes are eliminated at each step, yielding logarithmic O(log n) search time.',
        gamified_feedback: {
          success_quote: 'Flawless algorithmic complexity knowledge!',
          hint: 'Think about halving the search space at each depth level.',
        },
        points: 10,
        bloom_level: 'Understand',
        domain: 'Analytical Reasoning',
      },
      {
        id: 2,
        type: 'multiple_choice',
        question: 'Which data structure operates on a Last-In, First-Out (LIFO) order of elements?',
        options: ['Queue', 'Stack', 'Linked List', 'Priority Heap'],
        correct_answer: 'Stack',
        explanation:
          'A stack pushes and pops items from the top, meaning the last element added is the first one removed (LIFO).',
        gamified_feedback: {
          success_quote: 'Great recall of fundamental data structures!',
          hint: 'Think of a stack of cafeteria trays.',
        },
        points: 10,
        bloom_level: 'Remember',
        domain: 'Foundations',
      },
    ],
    study_guide: {
      key_takeaways: [
        'Balanced BSTs provide O(log n) lookup operations.',
        'Stacks enforce LIFO ordering, queues enforce FIFO ordering.',
      ],
      core_vocabulary: [
        {
          term: 'Binary Search Tree',
          definition: 'A node-based binary tree where left children are smaller and right children are larger.',
        },
        {
          term: 'LIFO',
          definition: 'Last-In, First-Out access principle characteristic of stack structures.',
        },
      ],
      recommended_review: 'Review Big-O asymptotic notation and standard collections.',
    },
    tags: ['computer-science', 'algorithms', 'data-structures'],
  };

  return JSON.stringify(sample, null, 2);
}
