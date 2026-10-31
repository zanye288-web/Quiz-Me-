import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  BookOpen,
  Layers,
  Printer,
  Copy,
  Check,
  Edit3,
  X,
  FileCheck,
  Maximize2,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { scanWorksheetFile } from '../services/relationalDb';
import { Question, QuizResponse } from '../types/quiz';

interface ScannedItem {
  id: number;
  questionNumber?: string;
  question: string;
  mathFormulas?: string[];
  questionType: 'multiple_choice' | 'open_ended' | 'fill_blank';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  confidence: 'high' | 'medium' | 'uncertain';
  notes: string;
}

interface SmartWorksheetScannerViewProps {
  onStartQuizWithQuestions: (quiz: QuizResponse) => void;
  onGenerateNotesFromText: (title: string, text: string) => void;
  onExportWorksheet?: (quiz: QuizResponse) => void;
}

export const SmartWorksheetScannerView: React.FC<SmartWorksheetScannerViewProps> = ({
  onStartQuizWithQuestions,
  onGenerateNotesFromText,
  onExportWorksheet,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [manualText, setManualText] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extracted Result State
  const [scanResult, setScanResult] = useState<{
    title: string;
    subject: string;
    detectedTopic: string;
    confidenceScore: number;
    rawTextPreview: string;
    extractedQuestions: ScannedItem[];
    extractionNotes: string[];
  } | null>(null);

  const [copiedText, setCopiedText] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMsg(null);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
    }
  };

  const handleScan = async () => {
    if (!file && !manualText.trim()) {
      setErrorMsg('Please select a photo, scan, or paste worksheet text first.');
      return;
    }

    setIsScanning(true);
    setErrorMsg(null);
    soundFx.playSelect();

    try {
      let imageBase64: string | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (file && imagePreview) {
        imageBase64 = imagePreview;
        mimeType = file.type || 'image/jpeg';
      }

      const res = await scanWorksheetFile({
        imageBase64,
        mimeType,
        textSnippet: manualText.trim() || undefined,
        fileName: file?.name,
      });

      if (res.success) {
        soundFx.playComplete();
        setScanResult({
          title: res.title || 'Scanned Exam Worksheet',
          subject: res.subject || 'General Studies',
          detectedTopic: res.detectedTopic || 'Exam Practice',
          confidenceScore: res.confidenceScore || 90,
          rawTextPreview: res.rawTextPreview || '',
          extractedQuestions: res.extractedQuestions || [],
          extractionNotes: res.extractionNotes || [],
        });
      } else {
        setErrorMsg(res.error || 'Failed to scan worksheet.');
      }
    } catch (err: any) {
      console.error('Worksheet scan error:', err);
      setErrorMsg(err.message || 'Error processing worksheet with AI Vision.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdateQuestion = (id: number, updatedText: string) => {
    if (!scanResult) return;
    setScanResult({
      ...scanResult,
      extractedQuestions: scanResult.extractedQuestions.map((q) =>
        q.id === id ? { ...q, question: updatedText } : q
      ),
    });
  };

  const handleConvertIntoQuiz = () => {
    if (!scanResult) return;
    soundFx.playClick();

    const formattedQuestions: Question[] = scanResult.extractedQuestions.map((q, idx) => ({
      id: idx + 1,
      type: 'multiple_choice',
      question: q.question,
      options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: q.correctAnswer || (q.options ? q.options[0] : 'Sample Answer'),
      explanation: q.explanation || 'Extracted from uploaded examination worksheet.',
      difficulty: 'Intermediate',
      topic: scanResult.detectedTopic,
      gamified_feedback: {
        success_quote: 'Verified correct extraction!',
        hint: 'Review the question premises carefully.',
      },
    }));

    const newQuiz: QuizResponse = {
      app_name: 'Quiz Me!',
      quiz_title: scanResult.title,
      summary: `Extracted from exam worksheet (${scanResult.detectedTopic}). Confidence: ${scanResult.confidenceScore}%.`,
      difficulty: 'Intermediate',
      persona: 'Teacher',
      questions: formattedQuestions,
      tags: [scanResult.subject, scanResult.detectedTopic, 'Scanned Worksheet'],
      aiVerified: true,
      aiVerificationScore: scanResult.confidenceScore,
    };

    onStartQuizWithQuestions(newQuiz);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Banner */}
      <div className="comic-panel rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-purple-500/10 border-2 border-slate-900 dark:border-slate-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-2 rounded-2xl bg-cyan-600 text-white border-2 border-slate-950 shadow-xs">
                <Camera className="w-5 h-5" />
              </span>
              <span className="comic-badge px-2.5 py-1 rounded bg-cyan-400 text-slate-950 border border-slate-950 text-xs font-black uppercase tracking-wider">
                SMART OCR WORKSHEET SCANNER
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                AI Vision + LaTeX Formula Recognition
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Smart Worksheet &amp; Exam Paper Scanner
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Snap a photo or upload an image of your exam papers, homework, or textbook exercises. AI Vision extracts the questions, formulas, and mark schemes so you can practice them interactively.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload / Camera Dropzone */}
        <div className="lg:col-span-5 space-y-4">
          <div className="comic-panel rounded-3xl p-6 bg-white dark:bg-slate-900 border-2 border-slate-900/20 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-500" />
              <span>Upload or Photograph Worksheet</span>
            </h3>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden max-h-52 border border-slate-300 dark:border-slate-700">
                  <img
                    src={imagePreview}
                    alt="Worksheet Preview"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-slate-950/80 text-white rounded text-[10px] font-bold">
                    Click to change photo
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Click to choose photo or drag &amp; drop
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Supports PNG, JPG, WEBP, or scanned PDFs
                  </div>
                </div>
              )}
            </div>

            {/* Optional text paste alternative */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Or paste text/questions manually:
              </label>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Paste OCR text, question bank, or problem set here..."
                rows={4}
                className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              onClick={handleScan}
              disabled={isScanning}
              className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting Questions &amp; Formulas...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Scan Worksheet with AI Vision</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Extraction Results & Conversion Actions */}
        <div className="lg:col-span-7">
          {scanResult ? (
            <div className="comic-panel rounded-3xl p-6 bg-white dark:bg-slate-900 border-2 border-slate-900/20 dark:border-slate-800 space-y-5">
              {/* Result Meta Banner */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase">
                      {scanResult.confidenceScore}% Confidence
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {scanResult.subject} • {scanResult.detectedTopic}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    {scanResult.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleConvertIntoQuiz}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Play as Quiz</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Extraction Ambiguity Notes */}
              {scanResult.extractionNotes.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 space-y-1">
                  <div className="text-xs font-black uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>OCR Verification Notes:</span>
                  </div>
                  {scanResult.extractionNotes.map((note, idx) => (
                    <div key={idx} className="text-xs text-slate-700 dark:text-slate-300">
                      • {note}
                    </div>
                  ))}
                </div>
              )}

              {/* Extracted Questions List */}
              <div className="space-y-3">
                <div className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Extracted Questions ({scanResult.extractedQuestions.length} Found):
                </div>

                {scanResult.extractedQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                        {q.questionNumber || idx + 1}
                      </span>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            q.confidence === 'high'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {q.confidence}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingItemId(editingItemId === q.id ? null : q.id)}
                          className="text-slate-400 hover:text-indigo-600 p-1 cursor-pointer"
                          title="Edit question text"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {editingItemId === q.id ? (
                      <textarea
                        value={q.question}
                        onChange={(e) => handleUpdateQuestion(q.id, e.target.value)}
                        rows={3}
                        className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-indigo-400 text-slate-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                        {q.question}
                      </p>
                    )}

                    {/* Options if MC */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-2 rounded-lg text-xs border ${
                              q.correctAnswer && opt.toLowerCase().includes(q.correctAnswer.toLowerCase())
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="font-mono text-slate-400 mr-1.5">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Conversion Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleConvertIntoQuiz}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Quiz from Scanned Paper</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onGenerateNotesFromText(
                      scanResult.title,
                      scanResult.extractedQuestions.map((q) => q.question).join('\n\n')
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Generate Revision Notes</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="comic-panel rounded-3xl p-12 bg-white dark:bg-slate-900 border-2 border-slate-900/15 dark:border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 mx-auto flex items-center justify-center border-2 border-cyan-300 dark:border-cyan-800">
                <FileCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Upload a Paper or Photo to Begin
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Take a photo of any handwritten or printed worksheet. The AI scanner extracts question numbers, LaTeX mathematical formulas, and diagrams for instant revision.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
