/**
 * Server-side Text-to-Speech service.
 * Supports:
 * 1. Dedicated Google Cloud Text-to-Speech (when GOOGLE_CLOUD_TTS_API_KEY or GOOGLE_CLOUD_API_KEY is configured).
 * 2. Gemini native Text-to-Speech (gemini-3.1-flash-tts-preview) via @google/genai SDK with GEMINI_API_KEY.
 * 3. Graceful browser synthesis fallback for zero-downtime audio delivery.
 */

import { GoogleGenAI, Modality } from '@google/genai';

export interface SynthesizeSpeechParams {
  text: string;
  languageCode?: string; // e.g. 'en-US', 'es-ES', 'ja-JP', 'fr-FR'
  voiceName?: string; // e.g. 'es-ES-Neural2-A', 'en-US-Journey-F', 'Puck', 'Kore', 'Zephyr'
  gender?: 'FEMALE' | 'MALE' | 'NEUTRAL';
  speakingRate?: number; // 0.5 to 2.0 (default 1.0)
  pitch?: number; // -20.0 to 20.0 semitones (default 0.0)
}

export interface SynthesizeSpeechResult {
  success: boolean;
  audioBase64?: string;
  contentType?: string;
  error?: string;
  fallbackToBrowser?: boolean;
  engineUsed?: 'google_cloud_tts' | 'gemini_tts' | 'browser_fallback';
}

/**
 * Wraps raw 16-bit 24kHz linear PCM audio buffer in a valid RIFF/WAV header
 * so any browser `<audio>` tag or Web Audio API can play it directly.
 */
function pcmToWavBase64(
  pcmBase64: string,
  sampleRate = 24000,
  numChannels = 1,
  bitDepth = 16
): string {
  const pcmBuffer = Buffer.from(pcmBase64, 'base64');
  const byteRate = sampleRate * numChannels * (bitDepth / 8);
  const blockAlign = numChannels * (bitDepth / 8);
  const wavHeader = Buffer.alloc(44);

  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(36 + pcmBuffer.length, 4);
  wavHeader.write('WAVE', 8);
  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  wavHeader.writeUInt16LE(1, 20); // PCM format
  wavHeader.writeUInt16LE(numChannels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(byteRate, 28);
  wavHeader.writeUInt16LE(blockAlign, 32);
  wavHeader.writeUInt16LE(bitDepth, 34);
  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([wavHeader, pcmBuffer]).toString('base64');
}

/**
 * Attempts Gemini native TTS using gemini-3.1-flash-tts-preview
 */
async function synthesizeWithGeminiTTS(
  sanitizedText: string,
  languageCode: string,
  voiceName?: string
): Promise<{ success: boolean; audioBase64?: string; contentType?: string }> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return { success: false };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Valid Gemini TTS voice names: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr'
    const validGeminiVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    let selectedVoice = 'Kore';
    if (voiceName && validGeminiVoices.includes(voiceName)) {
      selectedVoice = voiceName;
    }

    const promptText = `Speak naturally in ${languageCode}: ${sanitizedText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const rawPcm = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (rawPcm) {
      const wavBase64 = pcmToWavBase64(rawPcm, 24000);
      return {
        success: true,
        audioBase64: wavBase64,
        contentType: 'audio/wav',
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.info('Gemini TTS synthesis attempt note:', msg);
  }

  return { success: false };
}

export async function synthesizeGoogleCloudSpeech(
  params: SynthesizeSpeechParams
): Promise<SynthesizeSpeechResult> {
  const {
    text,
    languageCode = 'en-US',
    voiceName,
    gender = 'NEUTRAL',
    speakingRate = 1.0,
    pitch = 0.0,
  } = params;

  // Clean Markdown, brackets, and code fences for clear pronunciation
  const sanitizedText = text
    .replace(/```[\s\S]*?```/g, ' [code block] ')
    .replace(/[*_#`~[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!sanitizedText) {
    return {
      success: false,
      error: 'No text provided to synthesize.',
    };
  }

  // 1. Check if a dedicated Google Cloud Text-to-Speech API key is provided
  const gcpApiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;

  if (gcpApiKey) {
    try {
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${gcpApiKey}`;
      const payload = {
        input: { text: sanitizedText },
        voice: {
          languageCode,
          ...(voiceName && !['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].includes(voiceName)
            ? { name: voiceName }
            : {}),
          ssmlGender: gender,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: Math.max(0.25, Math.min(2.0, speakingRate)),
          pitch: Math.max(-20.0, Math.min(20.0, pitch)),
          sampleRateHertz: 24000,
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = (await res.json()) as { audioContent?: string };
        if (data.audioContent) {
          return {
            success: true,
            audioBase64: data.audioContent,
            contentType: 'audio/mp3',
            engineUsed: 'google_cloud_tts',
          };
        }
      } else {
        const errText = await res.text().catch(() => '');
        console.info(`Google Cloud TTS returned status ${res.status}:`, errText.slice(0, 150));
      }
    } catch (gcpErr) {
      console.info('Google Cloud TTS REST error:', (gcpErr as Error)?.message || gcpErr);
    }
  }

  // 2. Fallback to Gemini native TTS if GEMINI_API_KEY is available
  if (process.env.GEMINI_API_KEY) {
    const geminiResult = await synthesizeWithGeminiTTS(sanitizedText, languageCode, voiceName);
    if (geminiResult.success && geminiResult.audioBase64) {
      return {
        success: true,
        audioBase64: geminiResult.audioBase64,
        contentType: geminiResult.contentType || 'audio/wav',
        engineUsed: 'gemini_tts',
      };
    }
  }

  // 3. Graceful fallback to Browser Web Speech API
  return {
    success: false,
    fallbackToBrowser: true,
    engineUsed: 'browser_fallback',
    error: 'Audio synthesizing via high-fidelity local browser speech engine.',
  };
}
