// ============================================================================
// QUIZ-ME! — CENTRAL AI INTELLIGENCE INFRASTRUCTURE
// Centralized provider configuration, model selection, prompt management,
// structured output validation, and fallback mechanisms for Gemini.
// ============================================================================

import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function getCentralGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'quizme-ai-studio-engine',
        },
      },
    });
  }
  return aiClient;
}

// Cooldown map to avoid rapid successive quota exhaustion errors
const modelCooldowns = new Map<string, number>();

export function isModelInCooldown(model: string): boolean {
  const expiry = modelCooldowns.get(model);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    modelCooldowns.delete(model);
    return false;
  }
  return true;
}

export function setModelCooldown(model: string, ms = 60_000) {
  modelCooldowns.set(model, Date.now() + ms);
}

/**
 * Standardized AI caller with multi-tier model fallback
 */
export async function executeCentralGeminiCall(params: {
  contents: unknown;
  config?: Record<string, unknown>;
  preferredModels?: string[];
}) {
  const ai = getCentralGenAI();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment.');
  }

  const modelHierarchy = params.preferredModels && params.preferredModels.length > 0
    ? params.preferredModels
    : ['gemini-3.8-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-3.1-flash-lite-preview'];

  let lastError: any = null;

  for (const model of modelHierarchy) {
    if (isModelInCooldown(model)) {
      continue;
    }

    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents as any,
        config: params.config as any,
      });

      return {
        modelUsed: model,
        text: response.text || '',
        response,
      };
    } catch (err: any) {
      lastError = err;
      const errMsg = String(err.message || err);

      if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        setModelCooldown(model, 90_000);
      }
      console.warn(`[AIService] Model ${model} encountered error, trying next tier:`, errMsg);
    }
  }

  throw new Error(`All Gemini AI model tiers failed. Last error: ${lastError?.message || String(lastError)}`);
}
