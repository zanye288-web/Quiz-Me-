import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  AlertCircle,
  CheckCircle2,
  Radio,
  FileAudio,
} from 'lucide-react';
import { IngestFileInput } from '../types/quiz';
import { soundFx } from '../utils/audio';

interface AudioRecorderStudioProps {
  onAudioRecorded: (file: IngestFileInput) => void;
  onGenerateDirectly?: (file: IngestFileInput) => void;
  isLoading?: boolean;
}

export const AudioRecorderStudio: React.FC<AudioRecorderStudioProps> = ({
  onAudioRecorded,
  onGenerateDirectly,
  isLoading = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(16).fill(10));
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isSavedToFiles, setIsSavedToFiles] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const MAX_RECORDING_SECONDS = 180; // 3 minutes limit for high quality spoken notes

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Audio waveform animation visualizer loop
  const updateVisualizer = () => {
    if (!analyserRef.current || !isRecording || isPaused) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample 16 discrete frequency buckets
    const bucketSize = Math.floor(dataArray.length / 16);
    const newLevels: number[] = [];
    for (let i = 0; i < 16; i++) {
      let sum = 0;
      for (let j = 0; j < bucketSize; j++) {
        sum += dataArray[i * bucketSize + j];
      }
      const avg = sum / bucketSize;
      // Map 0-255 to 10-100%
      const normalized = Math.max(10, Math.min(100, (avg / 255) * 100));
      newLevels.push(normalized);
    }

    setAudioLevels(newLevels);
    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  };

  const startRecording = async () => {
    setPermissionError(null);
    setIsSavedToFiles(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError('Audio recording is not supported in your current browser environment.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Initialize Web Audio API Analyser
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
      } catch (e) {
        console.warn('AudioContext analyser initialization fallback:', e);
      }

      // Check supported recording format
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordedBlob(finalBlob);
        const url = URL.createObjectURL(finalBlob);
        setAudioUrl(url);
        soundFx.playRecordStop();

        // Release media stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingSeconds(0);
      soundFx.playRecordStart();

      // Start duration timer
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev + 1 >= MAX_RECORDING_SECONDS) {
            stopRecording();
            return MAX_RECORDING_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);

      // Start visualizer animation
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Microphone access failed:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionError('Microphone permission was denied. Please allow microphone access in your browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setPermissionError('No microphone hardware detected on your device.');
      } else {
        setPermissionError(`Microphone error: ${error.message || 'Unable to access microphone'}`);
      }
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsPaused(false);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const resetRecording = () => {
    soundFx.playClick();
    if (isRecording) {
      stopRecording();
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordedBlob(null);
    setRecordingSeconds(0);
    setPlaybackProgress(0);
    setIsPlaying(false);
    setIsSavedToFiles(false);
    setAudioLevels(new Array(16).fill(10));
  };

  const togglePlayback = () => {
    if (!audioElementRef.current) return;

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      soundFx.playClick();
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (!audioElementRef.current) return;
    const current = audioElementRef.current.currentTime;
    const dur = audioElementRef.current.duration || recordingSeconds || 1;
    setPlaybackProgress((current / dur) * 100);
  };

  const handleAudioLoadedMetadata = () => {
    if (!audioElementRef.current) return;
    setAudioDuration(audioElementRef.current.duration);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setPlaybackProgress(0);
  };

  // Convert Blob to Base64 file item
  const convertBlobToFile = async (blob: Blob): Promise<IngestFileInput> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        const ext = blob.type.includes('mp4') ? 'mp4' : blob.type.includes('ogg') ? 'ogg' : 'webm';
        const fileInput: IngestFileInput = {
          name: `voice_note_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.${ext}`,
          size: blob.size,
          mimeType: blob.type || 'audio/webm',
          base64Data,
        };
        resolve(fileInput);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSaveToFiles = async () => {
    if (!recordedBlob) return;
    soundFx.playCorrect();
    const file = await convertBlobToFile(recordedBlob);
    onAudioRecorded(file);
    setIsSavedToFiles(true);
  };

  const handleDirectQuizGeneration = async () => {
    if (!recordedBlob || isLoading) return;
    soundFx.playClick();
    const file = await convertBlobToFile(recordedBlob);
    if (onGenerateDirectly) {
      onGenerateDirectly(file);
    } else {
      onAudioRecorded(file);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>Voice & Audio Lecture Ingestion</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Speak your notes, lecture thoughts, or study concepts aloud. Gemini's native multimodal audio model will analyze your speech and create a custom quiz.
          </p>
        </div>

        {/* Max Duration Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <FileAudio className="w-3.5 h-3.5 text-indigo-500" />
          <span>Max 3 min audio</span>
        </div>
      </div>

      {/* Permission Error Alert */}
      {permissionError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Microphone Access Error</p>
            <p>{permissionError}</p>
          </div>
        </div>
      )}

      {/* Interactive Recording Deck */}
      <div className="relative rounded-3xl p-6 sm:p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 overflow-hidden text-center transition-all">
        {/* Background glow when recording */}
        {isRecording && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.35, 0.15] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-indigo-500/20 pointer-events-none rounded-3xl"
          />
        )}

        <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
          {/* Main Visual Waveform Area */}
          <div className="w-full max-w-md h-24 flex items-center justify-center gap-1.5 px-4">
            {isRecording ? (
              // Active Real-time Audio Waves
              audioLevels.map((lvl, index) => (
                <motion.div
                  key={index}
                  animate={{ height: `${Math.max(12, lvl)}%` }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="flex-1 bg-gradient-to-t from-rose-600 to-indigo-500 rounded-full min-h-[6px] max-h-[90px]"
                />
              ))
            ) : audioUrl ? (
              // Static/Playback Wave Bars
              new Array(24).fill(0).map((_, index) => {
                const barProgress = (index / 24) * 100;
                const isPassed = playbackProgress >= barProgress;
                const pseudoHeight = 25 + ((index * 37) % 65);
                return (
                  <div
                    key={index}
                    style={{ height: `${pseudoHeight}%` }}
                    className={`flex-1 rounded-full transition-colors duration-150 ${
                      isPassed
                        ? 'bg-indigo-600 dark:bg-indigo-400'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                );
              })
            ) : (
              // Idle placeholder Waveform
              new Array(18).fill(0).map((_, index) => (
                <div
                  key={index}
                  style={{ height: `${20 + ((index * 17) % 40)}%` }}
                  className="flex-1 bg-slate-200 dark:bg-slate-700/60 rounded-full"
                />
              ))
            )}
          </div>

          {/* Time and Status Display */}
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-mono font-black text-slate-900 dark:text-white tracking-tight">
              {isRecording
                ? formatTime(recordingSeconds)
                : audioUrl
                ? `${formatTime(audioDuration || recordingSeconds)}`
                : '00:00'}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isRecording ? (
                <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  Recording Audio...
                </span>
              ) : audioUrl ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Audio Ready
                </span>
              ) : (
                'Ready to Record'
              )}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {!isRecording && !audioUrl && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                id="start-audio-record-btn"
                onClick={startRecording}
                className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2.5 cursor-pointer transition-all"
              >
                <Mic className="w-5 h-5" />
                <span>Start Recording</span>
              </motion.button>
            )}

            {isRecording && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                id="stop-audio-record-btn"
                onClick={stopRecording}
                className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-sm shadow-lg shadow-slate-900/20 flex items-center gap-2.5 cursor-pointer transition-all"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>Finish Recording</span>
              </motion.button>
            )}

            {audioUrl && !isRecording && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Play / Pause Preview Button */}
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Preview</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Listen Preview</span>
                    </>
                  )}
                </button>

                {/* Reset / Record Again */}
                <button
                  type="button"
                  onClick={resetRecording}
                  className="px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Record Again</span>
                </button>

                {/* Add to Attached Files */}
                <button
                  type="button"
                  onClick={handleSaveToFiles}
                  disabled={isSavedToFiles}
                  className={`px-4 py-3 rounded-2xl border font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
                    isSavedToFiles
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSavedToFiles ? 'Added to Files ✓' : 'Add to Files'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Spoken Topic Prompts Hint */}
          {!isRecording && !audioUrl && (
            <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              <span className="font-bold text-slate-700 dark:text-slate-300">Tip: </span>
              Try saying: <span className="italic">"Here is a summary of the French Revolution: In 1789, the Estates-General convened..."</span>
            </div>
          )}

          {/* Fast Track Action Button */}
          {audioUrl && !isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full pt-4 border-t border-slate-200 dark:border-slate-700/60 max-w-md"
            >
              <button
                type="button"
                id="generate-quiz-from-audio-btn"
                disabled={isLoading}
                onClick={handleDirectQuizGeneration}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-600 via-indigo-600 to-violet-600 hover:from-rose-700 hover:to-violet-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Audio & Generating Quiz...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Quiz from This Audio</span>
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Hidden HTML Audio Element for Playback */}
          {audioUrl && (
            <audio
              ref={audioElementRef}
              src={audioUrl}
              onTimeUpdate={handleAudioTimeUpdate}
              onLoadedMetadata={handleAudioLoadedMetadata}
              onEnded={handleAudioEnded}
              className="hidden"
            />
          )}
        </div>
      </div>
    </div>
  );
};
