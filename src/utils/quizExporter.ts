import { QuizResponse } from '../types/quiz';

/**
 * Generates a clean, validated, usable JSON object for export
 */
export function formatQuizUsableJson(quiz: QuizResponse): string {
  const exportPayload = {
    app: 'Quiz Me!',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    quiz_title: quiz.quiz_title,
    summary: quiz.summary,
    persona: quiz.persona,
    difficulty: quiz.difficulty,
    total_questions: quiz.questions.length,
    questions: quiz.questions.map((q, idx) => ({
      index: idx + 1,
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options || [],
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      hint: q.gamified_feedback?.hint || '',
      cognitive_domain: q.domain || 'Knowledge',
      rubric: q.rubric || null,
      blank_context: q.blank_context || null,
      code_snippet: q.code_snippet || null,
    })),
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Downloads the quiz as a .json file
 */
export function downloadQuizJson(quiz: QuizResponse, filename?: string) {
  const jsonContent = formatQuizUsableJson(quiz);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = (filename || quiz.quiz_title || 'quiz').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  link.href = url;
  link.download = `${safeName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats the quiz as clean Markdown for notes, Google Docs, or LMS
 */
export function formatQuizMarkdown(quiz: QuizResponse, includeAnswers = true): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  let md = `# ${quiz.quiz_title || 'Quiz Worksheet'}\n`;
  md += `**Date:** ${dateStr} | **Difficulty:** ${quiz.difficulty} | **Persona:** ${quiz.persona}\n\n`;
  if (quiz.summary) {
    md += `> **Overview:** ${quiz.summary}\n\n`;
  }
  md += `---\n\n## Questions\n\n`;

  quiz.questions.forEach((q, idx) => {
    md += `### ${idx + 1}. ${q.question}\n`;
    if (q.type === 'multiple_choice' && q.options && q.options.length > 0) {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      q.options.forEach((opt, optIdx) => {
        md += `- **(${letters[optIdx] || optIdx + 1})** ${opt}\n`;
      });
      md += `\n`;
    } else if (q.type === 'fill_in_blank' && q.blank_context) {
      md += `_Sentence:_ "${q.blank_context.prefix || ''} [ ________ ] ${q.blank_context.suffix || ''}"\n`;
      if (q.blank_context.word_bank && q.blank_context.word_bank.length > 0) {
        md += `_Word Bank:_ ${q.blank_context.word_bank.join(' • ')}\n`;
      }
      md += `\n`;
    } else if (q.type === 'open_explanation') {
      md += `_Provide a structured explanation below:_\n\n_________________________________________________________________\n\n_________________________________________________________________\n\n`;
    } else {
      md += `\n_________________________________________________________________\n\n`;
    }

    const hintText = q.gamified_feedback?.hint;
    if (hintText) {
      md += `*Hint:* ${hintText}\n\n`;
    }
  });

  if (includeAnswers) {
    md += `\n---\n\n## Teacher Answer Key & Explanations\n\n`;
    quiz.questions.forEach((q, idx) => {
      md += `**${idx + 1}. Correct Answer:** ${q.correct_answer}\n\n`;
      md += `> **Pedagogical Explanation:** ${q.explanation}\n\n`;
      if (q.rubric && Array.isArray(q.rubric) && q.rubric.length > 0) {
        md += `*Scoring Rubric:* ${q.rubric.join(' • ')}\n\n`;
      }
      md += `---\n\n`;
    });
  }

  return md;
}

/**
 * Downloads the quiz as a .docx / .doc file formatted with clean styles
 * ready to open directly in Microsoft Word, Google Docs, and Apple Pages.
 */
export function downloadQuizDocFile(quiz: QuizResponse, includeAnswers = true, filename?: string) {
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const safeName = (filename || quiz.quiz_title || 'quiz').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();

  // Create an HTML document with Microsoft Word namespace tags
  const questionsHtml = quiz.questions
    .map((q, idx) => {
      let optionsHtml = '';
      if (q.type === 'multiple_choice' && q.options && q.options.length > 0) {
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        optionsHtml = `
          <div style="margin: 10px 0 16px 20px;">
            ${q.options
              .map(
                (opt, optIdx) => `
              <div style="margin-bottom: 6px; font-size: 11pt; color: #2d3748;">
                <span style="display:inline-block; width: 22px; font-weight: bold;">(${letters[optIdx] || optIdx + 1})</span>
                <span>${escapeHtml(opt)}</span>
              </div>
            `
              )
              .join('')}
          </div>
        `;
      } else if (q.type === 'fill_in_blank' && q.blank_context) {
        optionsHtml = `
          <div style="margin: 10px 0 16px 20px; font-style: italic; color: #334155;">
            <p>"${escapeHtml(q.blank_context.prefix || '')} <u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u> ${escapeHtml(q.blank_context.suffix || '')}"</p>
            ${
              q.blank_context.word_bank && q.blank_context.word_bank.length > 0
                ? `<p style="font-size: 10pt; color: #64748b;"><strong>Word Bank:</strong> ${escapeHtml(q.blank_context.word_bank.join(' &bull; '))}</p>`
                : ''
            }
          </div>
        `;
      } else if (q.type === 'open_explanation') {
        optionsHtml = `
          <div style="margin: 12px 0 20px 20px; border-bottom: 1px dotted #94a3b8; height: 60px;">
            <span style="font-size: 9pt; color: #94a3b8;">Write your response here...</span>
          </div>
        `;
      } else {
        optionsHtml = `
          <div style="margin: 12px 0 20px 20px; border-bottom: 1px dotted #94a3b8; height: 50px;"></div>
        `;
      }

      return `
        <div style="margin-bottom: 22px; page-break-inside: avoid;">
          <p style="font-size: 12pt; font-weight: bold; margin: 0 0 6px 0; color: #1e293b;">
            ${idx + 1}. ${escapeHtml(q.question)}
          </p>
          ${optionsHtml}
          ${q.gamified_feedback?.hint ? `<p style="font-size: 9pt; color: #6366f1; margin: 4px 0 0 20px;"><em>Hint: ${escapeHtml(q.gamified_feedback.hint)}</em></p>` : ''}
        </div>
      `;
    })
    .join('');

  const answerKeyHtml = includeAnswers
    ? `
      <div style="page-break-before: always; margin-top: 40px; padding-top: 20px; border-top: 2px solid #cbd5e1;">
        <h2 style="color: #4f46e5; font-size: 16pt; margin-bottom: 15px;">Answer Key & Detailed Pedagogical Solutions</h2>
        <p style="font-size: 10pt; color: #64748b; margin-bottom: 20px;">Use this section for scoring, self-assessment, or classroom review.</p>
        ${quiz.questions
          .map(
            (q, idx) => `
          <div style="margin-bottom: 18px; padding: 12px; background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 4px;">
            <p style="margin: 0 0 6px 0; font-weight: bold; font-size: 11pt; color: #0f172a;">
              ${idx + 1}. Correct Answer: <span style="color: #16a34a;">${escapeHtml(q.correct_answer)}</span>
            </p>
            <p style="margin: 0; font-size: 10pt; color: #334155; line-height: 1.4;">
              <strong>Explanation:</strong> ${escapeHtml(q.explanation)}
            </p>
            ${
              q.rubric && Array.isArray(q.rubric) && q.rubric.length > 0
                ? `<p style="margin: 6px 0 0 0; font-size: 9pt; color: #64748b;"><em>Rubric: ${escapeHtml(q.rubric.join(' • '))}</em></p>`
                : ''
            }
          </div>
        `
          )
          .join('')}
      </div>
    `
    : '';

  const docHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(quiz.quiz_title)}</title>
      <style>
        body {
          font-family: 'Calibri', 'Arial', sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #1e293b;
          margin: 40px;
        }
        h1 {
          font-size: 20pt;
          color: #1e1b4b;
          margin-bottom: 4px;
        }
        .header-meta {
          font-size: 10pt;
          color: #64748b;
          margin-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 10px;
        }
        .student-box {
          border: 1px solid #cbd5e1;
          padding: 10px 15px;
          margin-bottom: 25px;
          background-color: #f8fafc;
          font-size: 10.5pt;
        }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(quiz.quiz_title)}</h1>
      <div class="header-meta">
        <strong>Date:</strong> ${dateStr} &nbsp;|&nbsp;
        <strong>Difficulty:</strong> ${escapeHtml(quiz.difficulty)} &nbsp;|&nbsp;
        <strong>Total Questions:</strong> ${quiz.questions.length} &nbsp;|&nbsp;
        <strong>Platform:</strong> Quiz Me! Assessment Engine
      </div>

      <div class="student-box">
        <table style="width: 100%;">
          <tr>
            <td style="width: 50%;"><strong>Student Name:</strong> ____________________________</td>
            <td style="width: 25%;"><strong>Date:</strong> ____________</td>
            <td style="width: 25%;"><strong>Score:</strong> ______ / ${quiz.questions.length}</td>
          </tr>
        </table>
      </div>

      ${quiz.summary ? `<p style="font-size: 10.5pt; color: #475569; margin-bottom: 24px; font-style: italic;"><strong>Overview:</strong> ${escapeHtml(quiz.summary)}</p>` : ''}

      <div>
        ${questionsHtml}
      </div>

      ${answerKeyHtml}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', docHtml], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the quiz as a .md file
 */
export function downloadQuizMarkdown(quiz: QuizResponse, includeAnswers = true, filename?: string) {
  const mdContent = formatQuizMarkdown(quiz, includeAnswers);
  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = (filename || quiz.quiz_title || 'quiz').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  link.href = url;
  link.download = `${safeName}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
