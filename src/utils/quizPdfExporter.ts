import { jsPDF } from 'jspdf';
import { QuizResponse } from '../types/quiz';
import { QuizSummaryData, AreaForStudy } from '../components/QuizSummaryCard';

export interface CompletedQuizPdfOptions {
  studentName?: string;
  includeExplanations?: boolean;
  includeTakeaways?: boolean;
  includeAreasForStudy?: boolean;
  includeAnswerKey?: boolean;
  includeStudyNotes?: boolean;
  filename?: string;
}

/**
 * Escapes HTML characters for safe printable template generation
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates an elegant, print-optimized HTML document for browser Print-to-PDF
 */
export function generatePrintableQuizHtml(
  quiz: QuizResponse,
  results: {
    score: number;
    total: number;
    timeSpentSeconds?: number;
    answers?: Array<{ questionId: number; isCorrect: boolean; userAnswer: string }>;
  },
  summary?: QuizSummaryData | null,
  options: CompletedQuizPdfOptions = {}
): string {
  const {
    studentName = 'Scholar / Learner',
    includeExplanations = true,
    includeTakeaways = true,
    includeAreasForStudy = true,
    includeStudyNotes = true,
  } = options;

  const accuracy = results.total > 0 ? Math.round((results.score / results.total) * 100) : 0;
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const durationStr = results.timeSpentSeconds
    ? `${Math.floor(results.timeSpentSeconds / 60)}m ${results.timeSpentSeconds % 60}s`
    : 'Self-paced';

  const answerMap = new Map<number, { isCorrect: boolean; userAnswer: string }>();
  if (results.answers) {
    results.answers.forEach((ans) => {
      answerMap.set(ans.questionId, ans);
    });
  }

  // Key takeaways HTML
  const takeawaysHtml =
    includeTakeaways && summary?.keyTakeaways && summary.keyTakeaways.length > 0
      ? `
      <div class="section-box takeaways-box">
        <div class="section-title">
          <span class="icon">✓</span> Key Learning Takeaways
        </div>
        <ul class="takeaways-list">
          ${summary.keyTakeaways
            .map(
              (t, i) => `
            <li>
              <span class="bullet-num">${i + 1}</span>
              <div class="takeaway-text">${escapeHtml(t)}</div>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    `
      : '';

  // Areas for study HTML
  const areasHtml =
    includeAreasForStudy && summary?.areasForStudy && summary.areasForStudy.length > 0
      ? `
      <div class="section-box study-areas-box">
        <div class="section-title">
          <span class="icon">🎯</span> Priority Areas for Further Study
        </div>
        <div class="study-grid">
          ${summary.areasForStudy
            .map((area) => {
              const priorityClass =
                area.needLevel === 'High'
                  ? 'badge-high'
                  : area.needLevel === 'Medium'
                  ? 'badge-medium'
                  : 'badge-low';

              return `
                <div class="study-item">
                  <div class="study-header">
                    <strong class="study-topic">${escapeHtml(area.topic)}</strong>
                    <span class="priority-badge ${priorityClass}">${escapeHtml(area.needLevel)} Priority</span>
                  </div>
                  <p class="study-explanation">${escapeHtml(area.explanation)}</p>
                  <div class="study-action">
                    <strong>Suggested Action:</strong> ${escapeHtml(area.suggestedAction)}
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      </div>
    `
      : '';

  // Questions Review HTML
  const questionsHtml = quiz.questions
    .map((q, idx) => {
      const ansInfo = answerMap.get(q.id);
      const isCorrect = ansInfo ? ansInfo.isCorrect : false;
      const userAnswer = ansInfo?.userAnswer || '(no answer recorded)';
      const statusClass = ansInfo ? (isCorrect ? 'status-correct' : 'status-incorrect') : 'status-unanswered';
      const statusLabel = ansInfo ? (isCorrect ? 'CORRECT' : 'INCORRECT') : 'NOT ATTEMPTED';

      let optionsListHtml = '';
      if (q.type === 'multiple_choice' && q.options && q.options.length > 0) {
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        optionsListHtml = `
          <div class="options-container">
            ${q.options
              .map((opt, optIdx) => {
                const optLetter = letters[optIdx] || String(optIdx + 1);
                const isTarget = opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
                const isUserChoice = opt.trim().toLowerCase() === userAnswer.trim().toLowerCase();

                let optClass = 'opt-default';
                if (isTarget) optClass = 'opt-target';
                else if (isUserChoice && !isCorrect) optClass = 'opt-wrong';

                return `
                  <div class="option-row ${optClass}">
                    <span class="option-letter">(${optLetter})</span>
                    <span class="option-text">${escapeHtml(opt)}</span>
                    ${isTarget ? '<span class="tag-correct">✓ Target Answer</span>' : ''}
                    ${isUserChoice && !isTarget ? '<span class="tag-user">Your Response</span>' : ''}
                  </div>
                `;
              })
              .join('')}
          </div>
        `;
      }

      return `
        <div class="question-card ${statusClass}">
          <div class="question-header">
            <span class="q-number">Question ${idx + 1}</span>
            <span class="q-domain">${escapeHtml(q.domain || 'Core Knowledge')}</span>
            <span class="q-status ${statusClass}">${statusLabel}</span>
          </div>

          <p class="question-text">${escapeHtml(q.question)}</p>

          ${q.code_snippet ? `<pre class="code-snippet"><code>${escapeHtml(q.code_snippet)}</code></pre>` : ''}

          ${optionsListHtml}

          <div class="answer-comparison">
            <div class="ans-row">
              <span class="ans-label">Your Answer:</span>
              <span class="ans-value ${isCorrect ? 'text-correct' : 'text-incorrect'}">${escapeHtml(userAnswer)}</span>
            </div>
            ${
              !isCorrect
                ? `
              <div class="ans-row">
                <span class="ans-label">Correct Target:</span>
                <span class="ans-value text-target">${escapeHtml(q.correct_answer)}</span>
              </div>
            `
                : ''
            }
          </div>

          ${
            includeExplanations && q.explanation
              ? `
            <div class="explanation-box">
              <strong>Pedagogical Explanation:</strong> ${escapeHtml(q.explanation)}
            </div>
          `
              : ''
          }
        </div>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(quiz.quiz_title)} - Study Materials</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 15mm 15mm 15mm;
    }
    *, *:before, *:after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 20px;
    }
    .print-header {
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 15px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .print-title {
      font-size: 18pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px 0;
    }
    .print-meta {
      font-size: 8.5pt;
      color: #64748b;
      margin: 0;
    }
    .score-badge {
      text-align: right;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 8px 14px;
      border-radius: 8px;
    }
    .score-number {
      font-size: 16pt;
      font-weight: 800;
      color: #4f46e5;
      line-height: 1;
    }
    .score-label {
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
      font-size: 9pt;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }
    .meta-table td {
      padding: 6px 12px;
      border-right: 1px solid #e2e8f0;
    }
    .meta-table td:last-child {
      border-right: none;
    }
    .meta-label {
      font-weight: 700;
      color: #475569;
    }

    /* Section Boxes */
    .section-box {
      margin-bottom: 18px;
      padding: 12px 14px;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    .synopsis-box {
      background: #eef2ff;
      border: 1px solid #c7d2fe;
    }
    .takeaways-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
    }
    .study-areas-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
    }
    .section-title {
      font-size: 10.5pt;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .synopsis-text {
      font-size: 9.5pt;
      color: #1e1b4b;
      margin: 0;
      font-style: italic;
      line-height: 1.5;
    }

    /* Takeaways */
    .takeaways-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .takeaways-list li {
      display: flex;
      gap: 8px;
      margin-bottom: 6px;
      font-size: 9pt;
      color: #14532d;
    }
    .bullet-num {
      width: 18px;
      height: 18px;
      background: #22c55e;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 7.5pt;
      font-weight: 800;
      flex-shrink: 0;
      margin-top: 1px;
    }

    /* Study Areas */
    .study-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .study-item {
      background: #ffffff;
      border: 1px solid #fcd34d;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .study-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }
    .study-topic {
      font-size: 9pt;
      color: #78350f;
    }
    .priority-badge {
      font-size: 7pt;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .badge-high { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .badge-medium { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
    .badge-low { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
    .study-explanation {
      font-size: 8.5pt;
      color: #451a03;
      margin: 0 0 4px 0;
    }
    .study-action {
      font-size: 8pt;
      color: #4338ca;
      background: #e0e7ff;
      padding: 4px 8px;
      border-radius: 4px;
    }

    /* Question Cards */
    .question-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .status-correct { border-left: 5px solid #22c55e; }
    .status-incorrect { border-left: 5px solid #ef4444; }
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      margin-bottom: 6px;
    }
    .q-number { font-weight: 800; color: #0f172a; }
    .q-domain { color: #64748b; font-style: italic; }
    .q-status { font-weight: 800; padding: 2px 6px; border-radius: 4px; font-size: 7pt; }
    .status-correct .q-status { background: #dcfce7; color: #166534; }
    .status-incorrect .q-status { background: #fee2e2; color: #991b1b; }
    .question-text {
      font-size: 9.5pt;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 8px 0;
    }
    .options-container {
      margin: 6px 0 8px 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .option-row {
      font-size: 8.5pt;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .opt-target { background: #ecfdf5; border-color: #a7f3d0; font-weight: 700; color: #065f46; }
    .opt-wrong { background: #fef2f2; border-color: #fecaca; color: #991b1b; }
    .tag-correct { margin-left: auto; font-size: 7pt; font-weight: 800; color: #059669; }
    .tag-user { margin-left: auto; font-size: 7pt; font-weight: 800; color: #dc2626; }
    .answer-comparison {
      font-size: 8.5pt;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 6px 8px;
      margin: 6px 0;
    }
    .ans-row { display: flex; gap: 8px; margin-bottom: 2px; }
    .ans-label { font-weight: 700; width: 100px; color: #475569; }
    .text-correct { color: #15803d; font-weight: 700; }
    .text-incorrect { color: #b91c1c; font-weight: 700; }
    .text-target { color: #0369a1; font-weight: 700; }
    .explanation-box {
      font-size: 8pt;
      color: #334155;
      background: #f1f5f9;
      border-left: 3px solid #6366f1;
      padding: 6px 8px;
      border-radius: 0 4px 4px 0;
      margin-top: 6px;
    }
    .code-snippet {
      background: #0f172a;
      color: #f8fafc;
      padding: 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 7.5pt;
      margin: 4px 0 8px 0;
      white-space: pre-wrap;
    }

    /* Study Notes Lined Section */
    .study-notes-section {
      margin-top: 20px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 12px;
      page-break-inside: avoid;
    }
    .notes-lines {
      height: 120px;
      background-image: repeating-linear-gradient(
        transparent,
        transparent 23px,
        #e2e8f0 23px,
        #e2e8f0 24px
      );
      margin-top: 8px;
    }

    /* Print Specific Formatting */
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      a {
        text-decoration: none;
        color: inherit;
      }
    }
  </style>
</head>
<body>
  <!-- Print Controls (visible on screen preview, hidden when printed) -->
  <div class="no-print" style="margin-bottom: 20px; padding: 12px; background: #4f46e5; color: white; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <strong style="font-size: 11pt;">Ready to Print or Save as PDF</strong>
      <div style="font-size: 8.5pt; opacity: 0.9;">In the print preview dialog, select "Save as PDF" as the Destination.</div>
    </div>
    <button onclick="window.print()" style="background: white; color: #4f46e5; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 800; cursor: pointer;">
      Print / Save as PDF
    </button>
  </div>

  <!-- Main Document Header -->
  <div class="print-header">
    <div>
      <h1 class="print-title">${escapeHtml(quiz.quiz_title)}</h1>
      <p class="print-meta">Quiz Me! AI Curriculum & Assessment Engine &bull; Official Study Material</p>
    </div>
    <div class="score-badge">
      <div class="score-number">${results.score}/${results.total}</div>
      <div class="score-label">${accuracy}% &bull; ${summary?.masteryLevel || (accuracy >= 80 ? 'Proficient' : 'Developing')}</div>
    </div>
  </div>

  <!-- Student & Assessment Metadata -->
  <table class="meta-table">
    <tr>
      <td><span class="meta-label">Student Name:</span> ${escapeHtml(studentName)}</td>
      <td><span class="meta-label">Date:</span> ${dateStr}</td>
      <td><span class="meta-label">Difficulty:</span> ${escapeHtml(quiz.difficulty || 'Intermediate')}</td>
      <td><span class="meta-label">Time Spent:</span> ${durationStr}</td>
    </tr>
  </table>

  <!-- AI Executive Synopsis -->
  ${
    summary?.synopsis
      ? `
    <div class="section-box synopsis-box">
      <div class="section-title">
        <span class="icon">✨</span> AI Executive Performance Synopsis
      </div>
      <p class="synopsis-text">"${escapeHtml(summary.synopsis)}"</p>
    </div>
  `
      : ''
  }

  <!-- Key Takeaways -->
  ${takeawaysHtml}

  <!-- Areas for Study -->
  ${areasHtml}

  <!-- Question Breakdown Header -->
  <div style="margin: 24px 0 12px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
    <h2 style="font-size: 12pt; font-weight: 800; margin: 0; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
      Comprehensive Question Review & Pedagogical Explanations
    </h2>
  </div>

  <!-- Questions -->
  ${questionsHtml}

  <!-- Study Notes Section -->
  ${
    includeStudyNotes
      ? `
    <div class="study-notes-section">
      <strong style="font-size: 9.5pt; color: #334155; text-transform: uppercase;">
        Personal Study Notes & Action Items:
      </strong>
      <div class="notes-lines"></div>
    </div>
  `
      : ''
  }

  <div style="margin-top: 25px; text-align: center; font-size: 8pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
    Generated on ${dateStr} by Quiz Me! with Gemini 3.8 Flash &bull; Retain for self-study and spaced repetition review
  </div>
</body>
</html>
  `;
}

/**
 * Generates and downloads a clean, vector PDF document using jsPDF
 */
export function exportCompletedQuizToPdf(
  quiz: QuizResponse,
  results: {
    score: number;
    total: number;
    timeSpentSeconds?: number;
    answers?: Array<{ questionId: number; isCorrect: boolean; userAnswer: string }>;
  },
  summary?: QuizSummaryData | null,
  options: CompletedQuizPdfOptions = {}
): jsPDF {
  const {
    studentName = 'Scholar / Learner',
    includeExplanations = true,
    includeTakeaways = true,
    includeAreasForStudy = true,
    includeStudyNotes = true,
    filename,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const accuracy = results.total > 0 ? Math.round((results.score / results.total) * 100) : 0;
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      y = margin;
      drawHeaderBannerSmall();
    }
  };

  const drawHeaderBannerSmall = () => {
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${quiz.quiz_title} - Study Material | Quiz Me!`,
      margin,
      y
    );
    doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin, y, { align: 'right' });
    y += 5;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  // --- Cover Header ---
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(margin, y, contentWidth, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const truncatedTitle =
    quiz.quiz_title.length > 40 ? quiz.quiz_title.slice(0, 37) + '...' : quiz.quiz_title;
  doc.text(truncatedTitle, margin + 5, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('AI Assessment Summary & High-Yield Study Guide', margin + 5, y + 16);

  // Score badge in top right of header
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - margin - 38, y + 3, 34, 18, 2, 2, 'F');
  doc.setTextColor(79, 70, 229);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`${results.score}/${results.total} (${accuracy}%)`, pageWidth - margin - 21, y + 10, {
    align: 'center',
  });
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    summary?.masteryLevel || (accuracy >= 80 ? 'Proficient' : 'Developing'),
    pageWidth - margin - 21,
    y + 15,
    { align: 'center' }
  );

  y += 28;

  // --- Metadata Bar ---
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 10, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 10, 'S');

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text(`Student:`, margin + 3, y + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${studentName}`, margin + 17, y + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.text(`Date:`, margin + 65, y + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dateStr}`, margin + 74, y + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.text(`Difficulty:`, margin + 115, y + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${quiz.difficulty || 'Standard'}`, margin + 130, y + 6.5);

  const durationText = results.timeSpentSeconds
    ? `${Math.floor(results.timeSpentSeconds / 60)}m ${results.timeSpentSeconds % 60}s`
    : 'Untimed';
  doc.setFont('helvetica', 'bold');
  doc.text(`Time:`, margin + 155, y + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${durationText}`, margin + 165, y + 6.5);

  y += 14;

  // --- Executive AI Synopsis Box ---
  if (summary?.synopsis) {
    checkPageBreak(30);
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.setDrawColor(199, 210, 254); // indigo-200
    const synopsisLines = doc.splitTextToSize(summary.synopsis, contentWidth - 8);
    const boxHeight = synopsisLines.length * 4.2 + 12;

    doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');

    doc.setTextColor(67, 56, 202);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('EXECUTIVE PERFORMANCE SYNOPSIS', margin + 4, y + 6);

    doc.setFont('helvetica', 'italic');
    doc.setTextColor(30, 27, 75);
    doc.setFontSize(8.5);
    doc.text(synopsisLines, margin + 4, y + 11);

    y += boxHeight + 5;
  }

  // --- Key Learning Takeaways ---
  if (includeTakeaways && summary?.keyTakeaways && summary.keyTakeaways.length > 0) {
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('KEY LEARNING TAKEAWAYS', margin, y);
    y += 4;

    doc.setFillColor(240, 253, 244); // emerald-50
    doc.setDrawColor(187, 247, 208); // emerald-200

    summary.keyTakeaways.forEach((takeaway, idx) => {
      const takeawayLines = doc.splitTextToSize(takeaway, contentWidth - 14);
      const itemH = takeawayLines.length * 4 + 4;
      checkPageBreak(itemH);

      doc.roundedRect(margin, y, contentWidth, itemH, 1.5, 1.5, 'FD');

      // Index circle
      doc.setFillColor(34, 197, 94);
      doc.circle(margin + 5, y + 4, 2.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}`, margin + 5, y + 4.8, { align: 'center' });

      doc.setTextColor(20, 83, 45);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(takeawayLines, margin + 10, y + 4.5);

      y += itemH + 2;
    });

    y += 3;
  }

  // --- Areas for Study ---
  if (includeAreasForStudy && summary?.areasForStudy && summary.areasForStudy.length > 0) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('PRIORITY AREAS FOR FURTHER STUDY', margin, y);
    y += 4;

    summary.areasForStudy.forEach((area) => {
      const expLines = doc.splitTextToSize(area.explanation, contentWidth - 10);
      const actLines = doc.splitTextToSize(`Action: ${area.suggestedAction}`, contentWidth - 10);
      const areaHeight = expLines.length * 3.8 + actLines.length * 3.8 + 12;
      checkPageBreak(areaHeight);

      doc.setFillColor(255, 251, 235); // amber-50
      doc.setDrawColor(253, 230, 138); // amber-200
      doc.roundedRect(margin, y, contentWidth, areaHeight, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(120, 53, 15);
      doc.text(area.topic, margin + 4, y + 5);

      // Priority tag
      const isHigh = area.needLevel === 'High';
      doc.setFillColor(isHigh ? 239 : 245, isHigh ? 68 : 158, isHigh ? 68 : 11);
      doc.roundedRect(pageWidth - margin - 22, y + 2, 18, 4.5, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6.5);
      doc.text(`${area.needLevel} Priority`, pageWidth - margin - 13, y + 5.2, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(69, 26, 3);
      doc.text(expLines, margin + 4, y + 9.5);

      const actionY = y + 10 + expLines.length * 3.8;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(67, 56, 202);
      doc.text(actLines, margin + 4, actionY);

      y += areaHeight + 3;
    });

    y += 3;
  }

  // --- Questions Review Section ---
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('QUESTION-BY-QUESTION REVIEW & EXPLANATIONS', margin, y);
  y += 5;

  const answerMap = new Map<number, { isCorrect: boolean; userAnswer: string }>();
  if (results.answers) {
    results.answers.forEach((ans) => {
      answerMap.set(ans.questionId, ans);
    });
  }

  quiz.questions.forEach((q, idx) => {
    const ans = answerMap.get(q.id);
    const isCorrect = ans ? ans.isCorrect : false;
    const userAns = ans?.userAnswer || '(none)';

    const qLines = doc.splitTextToSize(`${idx + 1}. ${q.question}`, contentWidth - 30);
    let estimatedH = qLines.length * 4.2 + 20;

    if (includeExplanations && q.explanation) {
      const expLines = doc.splitTextToSize(`Explanation: ${q.explanation}`, contentWidth - 12);
      estimatedH += expLines.length * 3.6 + 6;
    }

    checkPageBreak(estimatedH);

    // Card background
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, estimatedH, 2, 2, 'FD');

    // Left colored accent border
    doc.setFillColor(isCorrect ? 34 : 239, isCorrect ? 197 : 68, isCorrect ? 94 : 68);
    doc.rect(margin, y, 2.5, estimatedH, 'F');

    // Question Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(qLines, margin + 6, y + 5.5);

    // Status Pill
    doc.setFillColor(isCorrect ? 220 : 254, isCorrect ? 252 : 226, isCorrect ? 231 : 226);
    doc.roundedRect(pageWidth - margin - 22, y + 3, 18, 5, 1, 1, 'F');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isCorrect ? 22 : 153, isCorrect ? 101 : 27, isCorrect ? 52 : 27);
    doc.text(isCorrect ? 'CORRECT' : 'INCORRECT', pageWidth - margin - 13, y + 6.5, {
      align: 'center',
    });

    let currentCardY = y + 5.5 + qLines.length * 4.2;

    // Answer Comparison
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Your Answer:', margin + 6, currentCardY);
    doc.setTextColor(isCorrect ? 22 : 185, isCorrect ? 101 : 28, isCorrect ? 52 : 28);
    doc.text(userAns.slice(0, 70), margin + 30, currentCardY);

    if (!isCorrect) {
      currentCardY += 4;
      doc.setTextColor(71, 85, 105);
      doc.text('Correct Target:', margin + 6, currentCardY);
      doc.setTextColor(3, 105, 161);
      doc.text(q.correct_answer.slice(0, 70), margin + 30, currentCardY);
    }

    currentCardY += 5;

    // Explanation Box
    if (includeExplanations && q.explanation) {
      const expLines = doc.splitTextToSize(q.explanation, contentWidth - 14);
      doc.setFillColor(241, 245, 249);
      const expBoxH = expLines.length * 3.5 + 4;
      doc.rect(margin + 5, currentCardY - 1, contentWidth - 10, expBoxH, 'F');
      doc.setDrawColor(99, 102, 241);
      doc.line(margin + 5, currentCardY - 1, margin + 5, currentCardY - 1 + expBoxH);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);
      doc.text(expLines, margin + 8, currentCardY + 2.5);
      currentCardY += expBoxH + 2;
    }

    y += estimatedH + 4;
  });

  // --- Study Notes Section ---
  if (includeStudyNotes) {
    checkPageBreak(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('STUDENT REFLECTION & STUDY NOTES', margin, y);
    y += 4;

    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, contentWidth, 32, 'S');

    // Light dotted lines for handwriting notes
    doc.setDrawColor(226, 232, 240);
    for (let lineOffset = 8; lineOffset < 30; lineOffset += 7) {
      doc.line(margin + 2, y + lineOffset, pageWidth - margin - 2, y + lineOffset);
    }

    y += 36;
  }

  // --- Footer on all pages ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Quiz Me! AI Study Material • Generated ${dateStr}`,
      margin,
      pageHeight - 6
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  const safeFilename = (filename || `${quiz.quiz_title}_Study_Material`)
    .replace(/[^a-z0-9_-]/gi, '_')
    .toLowerCase();

  doc.save(`${safeFilename}.pdf`);
  return doc;
}

/**
 * Triggers clean browser print dialog with the printable PDF layout
 */
export function printCompletedQuizPdf(
  quiz: QuizResponse,
  results: {
    score: number;
    total: number;
    timeSpentSeconds?: number;
    answers?: Array<{ questionId: number; isCorrect: boolean; userAnswer: string }>;
  },
  summary?: QuizSummaryData | null,
  options: CompletedQuizPdfOptions = {}
): void {
  const htmlContent = generatePrintableQuizHtml(quiz, results, summary, options);

  // Use a clean hidden printable iframe to guarantee reliable printing inside sandboxes
  let printFrame = document.getElementById('quiz-print-frame') as HTMLIFrameElement | null;
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.id = 'quiz-print-frame';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);
  }

  const doc = printFrame.contentWindow?.document || printFrame.contentDocument;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      try {
        printFrame?.contentWindow?.focus();
        printFrame?.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print fallback triggered:', err);
        // Fallback: Open in clean printable tab
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (win) {
          win.onload = () => {
            win.print();
          };
        }
      }
    }, 450);
  }
}
