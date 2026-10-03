import { Router, Request, Response } from 'express';
import {
  generateQuizFromAI,
  evaluateAnswerAI,
  askTutorAI,
  generatePedagogicalSummaryAI,
  generateQuizRecommendationsAI,
  generateFlashcardsAI,
  generateQuizSummaryAI,
  generateStudyRecommendationsAI,
  generateTrackTakeawaysAI,
  generateIntelligentNotesAI,
  tutorInteractiveSessionAI,
  analyzeQuizMistakesAI,
  transcribeSpokenAnswerAI,
} from './geminiService';
import { searchAllImages, searchWebImages, searchWikimediaImages } from './imageService';
import { resolveThematicVisual, THEMATIC_VISUAL_ASSETS } from '../src/utils/thematicImages';
import { synthesizeGoogleCloudSpeech } from './ttsService';
import {
  securityHeadersMiddleware,
  aiGenerationRateLimiter,
  searchRateLimiter,
  ttsRateLimiter,
  isSafeExternalHttpUrl,
  clampInteger,
  sanitizeString,
  sanitizeErrorMessage,
} from './securityMiddleware';

export const apiRouter = Router();

// Apply security headers across all API routes
apiRouter.use(securityHeadersMiddleware);

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1. AI Quiz Generation (Rate limited, input bounded, SSRF safe)
apiRouter.post('/generate-quiz', aiGenerationRateLimiter, async (req: Request, res: Response) => {
  try {
    const {
      inputText,
      mediaUrl,
      files,
      persona,
      questionTypes,
      difficulty,
      questionCount,
      customInstructions,
      promptStyle,
      targetAudience,
      focusSubtopics,
      creativityLevel,
      language,
      languageName,
    } = req.body;

    // Validate mediaUrl to prevent SSRF against internal subnets or cloud metadata
    let safeMediaUrl: string | undefined = undefined;
    if (mediaUrl && typeof mediaUrl === 'string') {
      const trimmedUrl = mediaUrl.trim();
      if (trimmedUrl) {
        if (!isSafeExternalHttpUrl(trimmedUrl)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid media URL. Only public http:// and https:// links are supported.',
          });
        }
        safeMediaUrl = trimmedUrl;
      }
    }

    // Input bounds clamping (defense against buffer/memory and token exhaustion)
    const boundedCount = clampInteger(questionCount, 1, 30, 5);
    const sanitizedInput = sanitizeString(inputText, 50_000);
    const sanitizedCustom = customInstructions ? sanitizeString(customInstructions, 2_000) : undefined;
    const sanitizedSubtopics = focusSubtopics ? sanitizeString(focusSubtopics, 500) : undefined;

    const quiz = await generateQuizFromAI({
      inputText: sanitizedInput,
      mediaUrl: safeMediaUrl,
      files: Array.isArray(files) ? files.slice(0, 10) : [],
      persona: persona === 'Teacher' ? 'Teacher' : 'Student',
      questionTypes: Array.isArray(questionTypes) && questionTypes.length > 0
        ? questionTypes
        : ['multiple_choice', 'fill_in_blank', 'open_explanation', 'code_media_challenge'],
      difficulty: ['Beginner', 'Intermediate', 'Master'].includes(difficulty)
        ? difficulty
        : 'Intermediate',
      questionCount: boundedCount,
      customInstructions: sanitizedCustom,
      promptStyle: promptStyle ? sanitizeString(promptStyle, 100) : undefined,
      targetAudience: targetAudience ? sanitizeString(targetAudience, 100) : undefined,
      focusSubtopics: sanitizedSubtopics,
      creativityLevel: creativityLevel !== undefined
        ? Math.max(0.1, Math.min(1.0, Number(creativityLevel) || 0.7))
        : undefined,
      language: language ? sanitizeString(language, 20) : undefined,
      languageName: languageName ? sanitizeString(languageName, 50) : undefined,
    });

    res.json({ success: true, quiz });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[API Router] Live quiz generation error:', err);
    res.status(500).json({
      success: false,
      error: sanitizeErrorMessage(err, 'Unable to generate quiz from your input. Please refine your prompt and retry.'),
    });
  }
});

// 2. Visual Image Search (Rate limited, query clamped)
apiRouter.post('/search-images', searchRateLimiter, async (req: Request, res: Response) => {
  try {
    const { query, engine = 'all', limit = 12 } = req.body;
    const q = sanitizeString(query, 120);

    if (!q) {
      // If no query, return curated thematic assets
      return res.json({
        success: true,
        images: THEMATIC_VISUAL_ASSETS.map((a) => ({
          url: a.url,
          thumbnail: a.url,
          caption: a.caption,
          source: 'Curated Gallery',
          attribution: 'Unsplash Educational',
        })),
      });
    }

    const searchLimit = clampInteger(limit, 4, 24, 12);
    let images = [];

    if (engine === 'web') {
      images = await searchWebImages(q, searchLimit);
    } else if (engine === 'wikimedia') {
      images = await searchWikimediaImages(q, searchLimit);
    } else {
      images = await searchAllImages(q, searchLimit, 'all');
    }

    if (images.length > 0) {
      return res.json({ success: true, images });
    }

    // Graceful fallback: thematic search if no live hits
    const fallback = resolveThematicVisual(q, 0);
    res.json({
      success: true,
      images: [
        {
          url: fallback.url,
          thumbnail: fallback.url,
          caption: fallback.caption,
          source: 'Thematic Visual',
          attribution: 'Unsplash Educational Collection',
        },
        ...THEMATIC_VISUAL_ASSETS.slice(0, 5).map((a) => ({
          url: a.url,
          thumbnail: a.url,
          caption: a.caption,
          source: 'Curated Gallery',
          attribution: 'Unsplash Educational',
        })),
      ],
    });
  } catch (err: unknown) {
    console.warn('[API Router] Image search warning:', err);
    res.status(500).json({
      success: false,
      error: sanitizeErrorMessage(err, 'Image search temporarily unavailable'),
    });
  }
});

// 3. Flashcards Generation (Rate limited, input bounded)
apiRouter.post('/generate-flashcards', aiGenerationRateLimiter, async (req: Request, res: Response) => {
  try {
    const { topic, notes, cardCount, difficulty, focusArea, customInstructions } = req.body;
    const sanitizedTopic = sanitizeString(topic, 200, 'General Concepts');
    const sanitizedNotes = sanitizeString(notes, 30_000);
    const boundedCount = clampInteger(cardCount, 2, 20, 8);

    const result = await generateFlashcardsAI({
      topic: sanitizedTopic,
      notes: sanitizedNotes,
      cardCount: boundedCount,
      difficulty: ['Beginner', 'Intermediate', 'Master'].includes(difficulty) ? difficulty : 'Intermediate',
      focusArea: focusArea ? sanitizeString(focusArea, 300) : undefined,
      customInstructions: customInstructions ? sanitizeString(customInstructions, 1_000) : undefined,
    });
    res.json({ success: true, deck: result });
  } catch {
    console.info('[API Router] Flashcard generation using conceptual deck fallback.');
    const safeTopic = sanitizeString(req.body?.topic, 200, 'General Concepts');
    res.json({
      success: true,
      deck: {
        title: `${safeTopic} Essential Flashcards`,
        topic: safeTopic,
        cards: [
          {
            id: 1,
            front: `What is the primary governing principle of ${safeTopic}?`,
            back: 'The core conceptual foundation and rule-based mechanism that dictates systemic behavior.',
            mnemonic: 'Core Rule: Ground complex questions in primary principles.',
            detailedExplanation: 'Understanding foundational mechanics allows you to analyze novel scenarios and deduce accurate conclusions.',
            category: 'Foundations',
            difficulty: req.body?.difficulty || 'Intermediate',
          },
        ],
      },
    });
  }
});

// 4. Answer Evaluation (Rate limited, input clamped)
apiRouter.post('/evaluate-answer', searchRateLimiter, async (req: Request, res: Response) => {
  try {
    const { question, correctAnswer, userAnswer, explanation, persona, rubric } = req.body;
    const sanitizedUserAnswer = sanitizeString(userAnswer, 3_000);
    const result = await evaluateAnswerAI({
      question: sanitizeString(question, 1_000),
      correctAnswer: sanitizeString(correctAnswer, 1_000),
      userAnswer: sanitizedUserAnswer,
      explanation: sanitizeString(explanation, 2_000),
      persona: persona === 'Teacher' ? 'Teacher' : 'Student',
      rubric: Array.isArray(rubric) ? rubric.map((r) => sanitizeString(r, 200)) : undefined,
    });
    res.json({ success: true, ...result });
  } catch {
    const isMatch =
      String(req.body?.userAnswer || '').trim().toLowerCase() ===
      String(req.body?.correctAnswer || '').trim().toLowerCase();
    res.json({
      success: true,
      isCorrect: isMatch,
      score: isMatch ? 100 : 70,
      feedback: isMatch
        ? 'Spot on! Solid execution and understanding.'
        : `Good effort! Key points focus on: ${sanitizeString(req.body?.correctAnswer, 200) || 'the core concept'}.`,
    });
  }
});

// 5. Ask Tutor (Rate limited, input clamped, full assessment & question adaptive)
apiRouter.post('/ask-tutor', searchRateLimiter, async (req: Request, res: Response) => {
  try {
    const {
      question,
      userQuery,
      persona,
      correctAnswer,
      explanation,
      quizTitle,
      targetAudience,
      tutorStyle,
      history,
      passedTopics,
      failedTopics,
    } = req.body;

    const sanitizedQuery = sanitizeString(userQuery, 1_500);
    const validStyles = ['friendly_mascot', 'socratic', 'quick_booster', 'deep_dive'];
    const safeStyle = validStyles.includes(tutorStyle) ? tutorStyle : 'friendly_mascot';

    const safeHistory = Array.isArray(history)
      ? history.slice(-10).map((h) => ({
          sender: h.sender === 'user' ? ('user' as const) : ('tutor' as const),
          text: sanitizeString(h.text, 1_000),
        }))
      : undefined;

    const safePassed = Array.isArray(passedTopics)
      ? passedTopics.slice(0, 10).map((t) => sanitizeString(t, 100))
      : undefined;

    const safeFailed = Array.isArray(failedTopics)
      ? failedTopics.slice(0, 10).map((t) => sanitizeString(t, 100))
      : undefined;

    const result = await askTutorAI({
      question: question ? sanitizeString(question, 1_000) : undefined,
      userQuery: sanitizedQuery,
      persona: persona === 'Teacher' ? 'Teacher' : 'Student',
      correctAnswer: correctAnswer ? sanitizeString(correctAnswer, 1_000) : undefined,
      explanation: explanation ? sanitizeString(explanation, 2_000) : undefined,
      quizTitle: quizTitle ? sanitizeString(quizTitle, 200) : undefined,
      targetAudience: targetAudience ? sanitizeString(targetAudience, 100) : undefined,
      tutorStyle: safeStyle,
      history: safeHistory,
      passedTopics: safePassed,
      failedTopics: safeFailed,
    });
    res.json({ success: true, reply: result.reply });
  } catch {
    res.json({
      success: true,
      reply: `Here is the key takeaway: ${sanitizeString(req.body?.explanation, 200) || 'Focus on the core concept.'} Remember that understanding foundational principles is key to mastering any problem!`,
    });
  }
});

// 5b. Study Recommendations & Sources (Videos, Websites, Documents, Tutor Plan)
apiRouter.post('/study-recommendations', searchRateLimiter, async (req: Request, res: Response) => {
  try {
    const {
      quizTitle,
      targetAudience,
      persona,
      score,
      total,
      accuracy,
      passedQuestions,
      failedQuestions,
    } = req.body;

    const sanitizedTitle = sanitizeString(quizTitle, 200, 'Learning Assessment');
    const sanitizedAudience = targetAudience ? sanitizeString(targetAudience, 100) : undefined;
    const safeScore = clampInteger(score, 0, 1000, 0);
    const safeTotal = clampInteger(total, 1, 1000, 1);
    const safeAccuracy = clampInteger(accuracy, 0, 100, 0);

    const safePassed = Array.isArray(passedQuestions)
      ? passedQuestions.slice(0, 20).map((q) => ({
          id: clampInteger(q.id, 0, 10000, 0),
          questionText: sanitizeString(q.questionText, 300),
          domain: q.domain ? sanitizeString(q.domain, 100) : undefined,
          userAnswer: sanitizeString(q.userAnswer, 200),
          correctAnswer: sanitizeString(q.correctAnswer, 200),
          explanation: sanitizeString(q.explanation, 500),
        }))
      : [];

    const safeFailed = Array.isArray(failedQuestions)
      ? failedQuestions.slice(0, 20).map((q) => ({
          id: clampInteger(q.id, 0, 10000, 0),
          questionText: sanitizeString(q.questionText, 300),
          domain: q.domain ? sanitizeString(q.domain, 100) : undefined,
          userAnswer: sanitizeString(q.userAnswer, 200),
          correctAnswer: sanitizeString(q.correctAnswer, 200),
          explanation: sanitizeString(q.explanation, 500),
        }))
      : [];

    const recommendations = await generateStudyRecommendationsAI({
      quizTitle: sanitizedTitle,
      targetAudience: sanitizedAudience,
      persona: persona === 'Teacher' ? 'Teacher' : 'Student',
      score: safeScore,
      total: safeTotal,
      accuracy: safeAccuracy,
      passedQuestions: safePassed,
      failedQuestions: safeFailed,
    });

    res.json({ success: true, recommendations });
  } catch (error: unknown) {
    console.warn('[API Router] Study recommendations error:', error);
    res.status(500).json({
      success: false,
      error: sanitizeErrorMessage(error, 'Unable to generate personalized study recommendations.'),
    });
  }
});

// 5c. QuizTrack Key Takeaways Summary (Source Material AI synthesis for pre-quiz review)
apiRouter.post('/track-takeaways', searchRateLimiter, async (req: Request, res: Response) => {
  try {
    const { trackTitle, sourceMaterial, summary, questions, persona, targetAudience } = req.body;

    const sanitizedTitle = sanitizeString(trackTitle, 200, 'Curriculum Track');
    const sanitizedSource = sourceMaterial ? sanitizeString(sourceMaterial, 20_000) : undefined;
    const sanitizedSummary = summary ? sanitizeString(summary, 2_000) : undefined;
    const sanitizedAudience = targetAudience ? sanitizeString(targetAudience, 100) : undefined;

    const safeQuestions = Array.isArray(questions)
      ? questions.slice(0, 10).map((q) => ({
          question: sanitizeString(q.question, 400),
          correct_answer: sanitizeString(q.correct_answer, 200),
          explanation: q.explanation ? sanitizeString(q.explanation, 400) : undefined,
        }))
      : undefined;

    const takeaways = await generateTrackTakeawaysAI({
      trackTitle: sanitizedTitle,
      sourceMaterial: sanitizedSource,
      summary: sanitizedSummary,
      questions: safeQuestions,
      persona: persona === 'Teacher' ? 'Teacher' : 'Student',
      targetAudience: sanitizedAudience,
    });

    res.json({ success: true, takeaways });
  } catch (error: unknown) {
    console.warn('[API Router] Track takeaways error:', error);
    res.status(500).json({
      success: false,
      error: sanitizeErrorMessage(error, 'Unable to generate track key takeaways.'),
    });
  }
});



// 6. Pedagogical Summary
apiRouter.post('/pedagogical-summary', searchRateLimiter, async (req: Request, res: Response) => {
  try {
    const { quizTitle, persona, score, total, accuracy, answers } = req.body;
    const summary = await generatePedagogicalSummaryAI({
      quizTitle: sanitizeString(quizTitle, 200, 'Learning Assessment'),
      persona: persona === 'Teacher' ? 'Teacher' : 'Student',
      score: clampInteger(score, 0, 1000, 0),
      total: clampInteger(total, 1, 1000, 1),
      accuracy: clampInteger(accuracy, 0, 100, 0),
      answers: Array.isArray(answers) ? answers.slice(0, 50) : [],
    });
    res.json({ success: true, summary });
  } catch {
    const accuracy = clampInteger(req.body?.accuracy, 0, 100, 0);
    res.json({
      success: true,
      summary: {
        headline: accuracy >= 80 ? 'Mastery Level: Solid Subject Proficiency' : 'Developing: Foundation Established',
        pedagogicalOverview: `The learner achieved an accuracy of ${accuracy}% on this assessment, demonstrating active engagement with the material.`,
        strengths: ['Analytical focus on core concepts', 'Strong problem solving engagement'],
        areasForImprovement: ['Review subtle terminology distinctions', 'Practice timed recall exercises'],
        actionableRecommendation: 'Revisit missed questions using the Flashcards mode and review tutor explanations.',
        bloomLevelFocus: accuracy >= 80 ? 'Analyze & Apply' : 'Remember & Understand',
      },
    });
  }
});

// 7. Quiz Summary
apiRouter.post('/quiz-summary', searchRateLimiter, async (req: Request, res: Response) => {
  try {
    const {
      quizTitle,
      quizSummary,
      persona,
      difficulty,
      score,
      total,
      accuracy,
      timeSpentSeconds,
      questions,
    } = req.body;

    const summary = await generateQuizSummaryAI({
      quizTitle: sanitizeString(quizTitle, 200, 'Quiz Assessment'),
      quizSummary: quizSummary ? sanitizeString(quizSummary, 500) : undefined,
      persona: persona === 'Teacher' ? 'Teacher' : 'Student',
      difficulty: ['Beginner', 'Intermediate', 'Master'].includes(difficulty) ? (difficulty as any) : 'Intermediate',
      score: clampInteger(score, 0, 1000, 0),
      total: clampInteger(total, 1, 1000, 1),
      accuracy: clampInteger(accuracy, 0, 100, 0),
      timeSpentSeconds: clampInteger(timeSpentSeconds, 0, 86400, 0),
      questions: Array.isArray(questions) ? questions.slice(0, 50) : [],
    });

    res.json({ success: true, summary });
  } catch {
    const accuracy = clampInteger(req.body?.accuracy, 0, 100, 0);
    res.json({
      success: true,
      summary: {
        synopsis: `Completed "${sanitizeString(req.body?.quizTitle, 100) || 'Assessment'}" with an accuracy score of ${accuracy}%. Key learning objectives were reviewed and reinforced.`,
        masteryLevel: accuracy >= 80 ? 'Proficient Understanding' : 'Developing Competence',
        keyTakeaways: [
          'Active recall solidifies conceptual mental models.',
          'Reviewing explanations immediately locks in corrective knowledge.',
        ],
        areasForStudy: [],
        quickStudyTip: 'Use spaced repetition: revisit these concepts in 48 hours to lock them into long-term memory.',
        suggestedNextStep: 'Generate an Advanced follow-up quiz or practice with the flashcard deck.',
      },
    });
  }
});

// 8. Recommended Quizzes
apiRouter.post('/recommended-quizzes', searchRateLimiter, async (req: Request, res: Response) => {
  try {
    const { persona, stats, recentQuizzes } = req.body;
    const result = await generateQuizRecommendationsAI({
      persona: persona === 'Teacher' ? 'Teacher' : 'Student',
      stats,
      recentQuizzes: Array.isArray(recentQuizzes) ? recentQuizzes.slice(0, 10) : [],
    });
    res.json({ success: true, ...result });
  } catch {
    res.json({
      success: true,
      recommendations: [],
      source: 'fallback',
    });
  }
});

// 9. Text-to-Speech Synthesis (Rate limited, payload length checked)
apiRouter.post('/tts', ttsRateLimiter, async (req: Request, res: Response) => {
  try {
    const { text, languageCode, voiceName, gender, speakingRate, pitch } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required for TTS synthesis.',
      });
    }

    // Limit text length to 3,000 characters to prevent API quota drain and memory spikes
    const sanitizedText = sanitizeString(text, 3_000);

    const result = await synthesizeGoogleCloudSpeech({
      text: sanitizedText,
      languageCode: languageCode ? sanitizeString(languageCode, 20) : 'en-US',
      voiceName: voiceName ? sanitizeString(voiceName, 50) : undefined,
      gender: ['FEMALE', 'MALE', 'NEUTRAL'].includes(gender) ? gender : 'NEUTRAL',
      speakingRate: Math.max(0.25, Math.min(2.0, Number(speakingRate) || 1.0)),
      pitch: Math.max(-20.0, Math.min(20.0, Number(pitch) || 0.0)),
    });

    res.json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Google Cloud TTS Error:', err);
    res.status(500).json({
      success: false,
      error: sanitizeErrorMessage(err, 'Failed to synthesize speech.'),
      fallbackToBrowser: true,
    });
  }
});

// 10. Intelligent Study Notes Generator
apiRouter.post('/intelligent-notes', aiGenerationRateLimiter, async (req: Request, res: Response) => {
  try {
    const {
      topic,
      subject,
      sourceType,
      contextDetails,
      missedQuestions,
      persona,
      learnerLevel,
    } = req.body;

    const notes = await generateIntelligentNotesAI({
      topic: sanitizeString(topic, 200, 'Core Subject Foundations'),
      subject: subject ? sanitizeString(subject, 100) : undefined,
      sourceType: sourceType ? sanitizeString(sourceType, 50) : undefined,
      contextDetails: contextDetails ? sanitizeString(contextDetails, 2000) : undefined,
      missedQuestions: Array.isArray(missedQuestions)
        ? missedQuestions.slice(0, 10).map((m: any) => ({
            question: sanitizeString(m.question, 500),
            userAnswer: sanitizeString(m.userAnswer, 200),
            correctAnswer: sanitizeString(m.correctAnswer, 200),
            explanation: m.explanation ? sanitizeString(m.explanation, 500) : undefined,
          }))
        : undefined,
      persona: persona === 'Teacher' ? 'Teacher' : 'Student',
      learnerLevel: learnerLevel ? sanitizeString(learnerLevel, 50) : undefined,
    });

    res.json({ success: true, notes });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: sanitizeErrorMessage(error, 'Failed to generate study notes.'),
    });
  }
});

// 11. Interactive AI Academic Tutor Session
apiRouter.post('/tutor-chat', searchRateLimiter, async (req: Request, res: Response) => {
  try {
    const { message, history, learnerContext, currentQuizTitle, persona } = req.body;

    const result = await tutorInteractiveSessionAI({
      message: sanitizeString(message, 1500, 'Can you explain this concept?'),
      history: Array.isArray(history)
        ? history.slice(-10).map((h: any) => ({
            sender: h.sender === 'user' ? 'user' : 'tutor',
            text: sanitizeString(h.text, 1000),
          }))
        : undefined,
      learnerContext,
      currentQuizTitle: currentQuizTitle ? sanitizeString(currentQuizTitle, 200) : undefined,
      persona: persona === 'Teacher' ? 'Teacher' : 'Student',
    });

    res.json({ success: true, ...result });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: sanitizeErrorMessage(error, 'Tutor session error.'),
      reply: 'I am here to help! Let us review the foundational concepts step by step.',
    });
  }
});

// 12. Quiz Performance & Mistakes Diagnostic Engine
apiRouter.post('/analyze-mistakes', searchRateLimiter, async (req: Request, res: Response) => {
  try {
    const { quizTitle, totalQuestions, score, questions } = req.body;

    const analysis = await analyzeQuizMistakesAI({
      quizTitle: sanitizeString(quizTitle, 200, 'Learning Assessment'),
      totalQuestions: clampInteger(totalQuestions, 1, 500, 1),
      score: clampInteger(score, 0, 500, 0),
      questions: Array.isArray(questions)
        ? questions.slice(0, 50).map((q: any) => ({
            id: Number(q.id) || 1,
            question: sanitizeString(q.question, 500),
            options: Array.isArray(q.options) ? q.options.map((o: any) => sanitizeString(o, 200)) : undefined,
            correctAnswer: sanitizeString(q.correctAnswer, 200),
            userAnswer: sanitizeString(q.userAnswer, 200),
            explanation: sanitizeString(q.explanation, 500),
            domain: q.domain ? sanitizeString(q.domain, 100) : undefined,
            isCorrect: Boolean(q.isCorrect),
          }))
        : [],
    });

    res.json({ success: true, analysis });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: sanitizeErrorMessage(error, 'Mistake analysis error.'),
    });
  }
});

// 12b. Spoken Quiz Answer Transcription (Microphone Voice Answer fallback)
apiRouter.post('/transcribe-answer', searchRateLimiter, async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType, language, options, question } = req.body;
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ success: false, error: 'Audio data is required.' });
    }
    const result = await transcribeSpokenAnswerAI({
      audioBase64,
      mimeType: mimeType ? sanitizeString(mimeType, 60) : 'audio/webm',
      language: language ? sanitizeString(language, 20) : 'en-US',
      options: Array.isArray(options) ? options.slice(0, 8).map((o: any) => sanitizeString(o, 300)) : undefined,
      question: question ? sanitizeString(question, 500) : undefined,
    });
    res.json({ success: true, ...result });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: sanitizeErrorMessage(error, 'Failed to transcribe voice answer.'),
    });
  }
});

// ============================================================================
// 13. LIVE MULTIPLAYER BATTLE SERVER STORE & SYNCHRONOUS ROOM ENDPOINTS
// ============================================================================
const liveRoomsStore = new Map<string, any>();

// Periodically prune stale rooms older than 4 hours
setInterval(() => {
  const cutoff = Date.now() - 4 * 60 * 60 * 1000;
  for (const [code, room] of liveRoomsStore.entries()) {
    if ((room.updatedAt || room.createdAt || 0) < cutoff) {
      liveRoomsStore.delete(code);
    }
  }
}, 15 * 60 * 1000).unref();

// List active lobbies
apiRouter.get('/live/rooms', (_req: Request, res: Response) => {
  const activeRooms: any[] = [];
  for (const room of liveRoomsStore.values()) {
    if (room.status !== 'finished') {
      activeRooms.push({
        roomCode: room.roomCode,
        hostName: room.hostName,
        quizTitle: room.quiz?.quiz_title || 'Live Quiz Battle',
        questionCount: room.quiz?.questions?.length || 5,
        participantCount: Object.keys(room.participants || {}).length,
        status: room.status,
        createdAt: room.createdAt,
      });
    }
  }
  activeRooms.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  res.json({ success: true, rooms: activeRooms.slice(0, 20) });
});

// Get room state
apiRouter.get('/live/room/:roomCode', (req: Request, res: Response) => {
  const code = String(req.params.roomCode || '').trim().toUpperCase();
  const room = liveRoomsStore.get(code);
  if (!room) {
    return res.status(404).json({ success: false, error: 'Room not found.' });
  }
  res.json({ success: true, session: room });
});

// Create or upsert a live session room
apiRouter.post('/live/create', (req: Request, res: Response) => {
  try {
    const { session } = req.body;
    if (!session || !session.roomCode) {
      return res.status(400).json({ success: false, error: 'Invalid session payload.' });
    }
    const code = String(session.roomCode).trim().toUpperCase();
    const cleanSession = JSON.parse(JSON.stringify({
      ...session,
      id: code,
      roomCode: code,
      updatedAt: Date.now(),
    }));
    liveRoomsStore.set(code, cleanSession);
    res.json({ success: true, session: cleanSession });
  } catch (err) {
    res.status(500).json({ success: false, error: sanitizeErrorMessage(err, 'Failed to create room.') });
  }
});

// Join an existing live session room
apiRouter.post('/live/join', (req: Request, res: Response) => {
  try {
    const { roomCode, participant, fallbackSession } = req.body;
    const code = String(roomCode || '').trim().toUpperCase();
    let room = liveRoomsStore.get(code);
    if (!room && fallbackSession && fallbackSession.roomCode) {
      room = JSON.parse(JSON.stringify(fallbackSession));
      liveRoomsStore.set(code, room);
    }
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found. Please check the 6-digit PIN.' });
    }
    if (room.status === 'finished') {
      return res.status(400).json({ success: false, error: 'This live session has already ended.' });
    }
    if (!participant || !participant.id) {
      return res.status(400).json({ success: false, error: 'Invalid participant data.' });
    }
    room.participants = room.participants || {};
    room.participants[participant.id] = {
      ...participant,
      score: room.participants[participant.id]?.score ?? 0,
      streak: room.participants[participant.id]?.streak ?? 0,
      answers: room.participants[participant.id]?.answers ?? {},
      hasAnsweredCurrent: room.participants[participant.id]?.hasAnsweredCurrent ?? false,
      isReady: true,
      joinedAt: room.participants[participant.id]?.joinedAt ?? Date.now(),
      lastActive: Date.now(),
    };
    room.updatedAt = Date.now();
    liveRoomsStore.set(code, room);
    res.json({ success: true, session: room });
  } catch (err) {
    res.status(500).json({ success: false, error: sanitizeErrorMessage(err, 'Failed to join room.') });
  }
});

// Update room status / advance question / add participants
apiRouter.post('/live/update', (req: Request, res: Response) => {
  try {
    const { roomCode, updates, resetAnsweredFlags, fallbackSession } = req.body;
    const code = String(roomCode || '').trim().toUpperCase();
    let room = liveRoomsStore.get(code);
    if (!room && fallbackSession && fallbackSession.roomCode) {
      room = JSON.parse(JSON.stringify(fallbackSession));
      liveRoomsStore.set(code, room);
    }
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found.' });
    }
    if (updates && typeof updates === 'object') {
      if (updates.participants && typeof updates.participants === 'object') {
        room.participants = { ...(room.participants || {}), ...updates.participants };
        const { participants: _p, ...rest } = updates;
        Object.assign(room, rest);
      } else {
        Object.assign(room, updates);
      }
    }
    if (resetAnsweredFlags && room.participants) {
      for (const pid of Object.keys(room.participants)) {
        room.participants[pid].hasAnsweredCurrent = false;
      }
    }
    room.updatedAt = Date.now();
    liveRoomsStore.set(code, room);
    res.json({ success: true, session: room });
  } catch (err) {
    res.status(500).json({ success: false, error: sanitizeErrorMessage(err, 'Failed to update room.') });
  }
});

// Submit participant answer
apiRouter.post('/live/answer', (req: Request, res: Response) => {
  try {
    const { roomCode, participantId, questionIndex, answer, newScore, newStreak, fallbackSession } = req.body;
    const code = String(roomCode || '').trim().toUpperCase();
    let room = liveRoomsStore.get(code);
    if (!room && fallbackSession && fallbackSession.roomCode) {
      room = JSON.parse(JSON.stringify(fallbackSession));
      liveRoomsStore.set(code, room);
    }
    if (!room) {
      return res.status(404).json({ success: false, error: 'Room not found.' });
    }
    room.participants = room.participants || {};
    if (!room.participants[participantId]) {
      room.participants[participantId] = {
        id: participantId,
        name: 'Scholar',
        avatarSeed: 'scholar',
        avatarColor: 'indigo',
        role: 'student',
        score: 0,
        streak: 0,
        answers: {},
        hasAnsweredCurrent: false,
        isReady: true,
        joinedAt: Date.now(),
        lastActive: Date.now(),
      };
    }
    const p = room.participants[participantId];
    p.answers = p.answers || {};
    p.answers[questionIndex] = {
      ...answer,
      answeredAt: Date.now(),
    };
    p.score = typeof newScore === 'number' ? newScore : p.score + (answer?.pointsEarned || 0);
    p.streak = typeof newStreak === 'number' ? newStreak : p.streak;
    p.hasAnsweredCurrent = true;
    p.lastActive = Date.now();
    room.updatedAt = Date.now();
    liveRoomsStore.set(code, room);
    res.json({ success: true, session: room });
  } catch (err) {
    res.status(500).json({ success: false, error: sanitizeErrorMessage(err, 'Failed to submit answer.') });
  }
});


