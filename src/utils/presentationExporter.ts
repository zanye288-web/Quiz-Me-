import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';

export type SlideLayoutType =
  | 'hero-cover'
  | 'split-visual'
  | 'bento-grid'
  | 'timeline-process'
  | 'data-chart'
  | 'comparison-table'
  | 'interactive-lab';

export type InteractiveWidgetType =
  | 'none'
  | 'quiz'
  | 'poll'
  | 'flashcards'
  | 'accordion'
  | 'simulator';

export interface SlideBentoItem {
  title: string;
  description: string;
  metricOrBadge?: string;
}

export interface SlideTimelineStep {
  step: string;
  title: string;
  detail: string;
}

export interface SlideChartBar {
  label: string;
  value: number;
  unit?: string;
}

export interface SlideComparisonRow {
  feature: string;
  leftValue: string;
  rightValue: string;
}

export interface SlideQuizWidget {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
  points?: number;
}

export interface SlidePollWidget {
  prompt: string;
  options: Array<{ label: string; votes: number }>;
}

export interface SlideFlashcardItem {
  front: string;
  back: string;
}

export interface SlideAccordionItem {
  title: string;
  content: string;
}

export interface SlideSimulatorWidget {
  title: string;
  variableLabel: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  formulaDescription: string;
  multiplier: number;
  outputLabel: string;
  outputUnit: string;
}

export interface PresentationSlide {
  id: string;
  slideNumber: number;
  layout: SlideLayoutType;
  kicker?: string;
  title: string;
  subtitle?: string;
  bullets: string[];
  bentoItems?: SlideBentoItem[];
  timelineSteps?: SlideTimelineStep[];
  chartData?: {
    chartTitle: string;
    bars: SlideChartBar[];
  };
  comparisonData?: {
    leftHeader: string;
    rightHeader: string;
    rows: SlideComparisonRow[];
  };
  imageUrl?: string | null;
  imageCaption?: string;
  imageLayout?: 'right' | 'left' | 'top' | 'background';
  imageSource?: string;
  imageAttribution?: string;
  interactiveType: InteractiveWidgetType;
  quizWidget?: SlideQuizWidget;
  pollWidget?: SlidePollWidget;
  flashcardsWidget?: SlideFlashcardItem[];
  accordionWidget?: SlideAccordionItem[];
  simulatorWidget?: SlideSimulatorWidget;
  speakerNotes: string;
  keyTakeaway?: string;
}

export interface PresentationDeck {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  themeId: string;
  difficulty: string;
  subjectOrExam?: string;
  createdAt: string;
  slides: PresentationSlide[];
}

interface ThemeColors {
  bgHex: string;
  cardHex: string;
  textHex: string;
  mutedHex: string;
  accentHex: string;
  borderHex: string;
}

const THEME_PALETTES: Record<string, ThemeColors> = {
  'gamma-dark': {
    bgHex: '0F172A',
    cardHex: '1E293B',
    textHex: 'F8FAFC',
    mutedHex: '94A3B8',
    accentHex: '06B6D4',
    borderHex: '334155',
  },
  'gamma-emerald': {
    bgHex: '064E3B',
    cardHex: '065F46',
    textHex: 'ECFDF5',
    mutedHex: 'A7F3D0',
    accentHex: '10B981',
    borderHex: '047857',
  },
  'gamma-ocean': {
    bgHex: '082F49',
    cardHex: '0C4A6E',
    textHex: 'F0F9FF',
    mutedHex: 'BAE6FD',
    accentHex: '38BDF8',
    borderHex: '0369A1',
  },
  'gamma-sunset': {
    bgHex: '1C1917',
    cardHex: '292524',
    textHex: 'FEF3C7',
    mutedHex: 'D6D3D1',
    accentHex: 'F59E0B',
    borderHex: '44403C',
  },
  'gamma-minimal': {
    bgHex: 'F8FAFC',
    cardHex: 'FFFFFF',
    textHex: '0F172A',
    mutedHex: '475569',
    accentHex: '4F46E5',
    borderHex: 'CBD5E1',
  },
  'gamma-royal': {
    bgHex: '1E1B4B',
    cardHex: '312E81',
    textHex: 'EEF2FF',
    mutedHex: 'C7D2FE',
    accentHex: '818CF8',
    borderHex: '4338CA',
  },
};

function getThemePalette(themeId: string): ThemeColors {
  return THEME_PALETTES[themeId] || THEME_PALETTES['gamma-dark'];
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'gamma-presentation'
  );
}

// ============================================================================
// 1. EXPORT TO POWERPOINT (.PPTX) VIA PPTXGENJS
// ============================================================================
export async function exportPresentationToPptx(
  deck: PresentationDeck,
  includeSpeakerNotes = true,
  includeAnswerKeys = true
): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = deck.author || 'Quiz Me! Presentation Studio';
  pptx.title = deck.title;
  pptx.subject = deck.subtitle || 'Interactive Presentation Deck';

  const palette = getThemePalette(deck.themeId);

  for (let i = 0; i < deck.slides.length; i++) {
    const s = deck.slides[i];
    const slide = pptx.addSlide();
    slide.background = { color: palette.bgHex };

    // Top Header Kicker & Slide Index
    slide.addText(
      `${s.kicker ? s.kicker.toUpperCase() + '  •  ' : ''}SLIDE ${i + 1} OF ${deck.slides.length}`,
      {
        x: 0.6,
        y: 0.35,
        w: 8.8,
        h: 0.3,
        fontSize: 9,
        bold: true,
        color: palette.accentHex,
        fontFace: 'Arial',
      }
    );

    // Slide Title
    slide.addText(s.title || `Slide ${i + 1}`, {
      x: 0.6,
      y: 0.65,
      w: 8.8,
      h: 0.65,
      fontSize: s.layout === 'hero-cover' ? 26 : 20,
      bold: true,
      color: palette.textHex,
      fontFace: 'Arial',
    });

    let currentY = 1.35;

    if (s.subtitle) {
      slide.addText(s.subtitle, {
        x: 0.6,
        y: currentY,
        w: 8.8,
        h: 0.45,
        fontSize: 12,
        color: palette.mutedHex,
        fontFace: 'Arial',
      });
      currentY += 0.5;
    }

    // Main Content Area based on Layout
    if (s.layout === 'bento-grid' && s.bentoItems && s.bentoItems.length > 0) {
      const items = s.bentoItems.slice(0, 4);
      items.forEach((item, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const boxX = 0.6 + col * 4.45;
        const boxY = currentY + row * 1.35;
        slide.addShape(pptx.ShapeType.roundRect, {
          x: boxX,
          y: boxY,
          w: 4.25,
          h: 1.2,
          fill: { color: palette.cardHex },
          line: { color: palette.borderHex, pt: 1 },
        });
        slide.addText(
          `${item.metricOrBadge ? '[' + item.metricOrBadge + '] ' : ''}${item.title}`,
          {
            x: boxX + 0.15,
            y: boxY + 0.12,
            w: 3.95,
            h: 0.35,
            fontSize: 12,
            bold: true,
            color: palette.accentHex,
            fontFace: 'Arial',
          }
        );
        slide.addText(item.description, {
          x: boxX + 0.15,
          y: boxY + 0.48,
          w: 3.95,
          h: 0.65,
          fontSize: 10,
          color: palette.textHex,
          fontFace: 'Arial',
        });
      });
      currentY += 2.8;
    } else if (s.layout === 'timeline-process' && s.timelineSteps && s.timelineSteps.length > 0) {
      const steps = s.timelineSteps.slice(0, 4);
      steps.forEach((st, idx) => {
        const boxY = currentY + idx * 0.65;
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.6,
          y: boxY,
          w: 8.8,
          h: 0.55,
          fill: { color: palette.cardHex },
          line: { color: palette.borderHex, pt: 1 },
        });
        slide.addText(`${st.step}: ${st.title} — ${st.detail}`, {
          x: 0.75,
          y: boxY + 0.08,
          w: 8.5,
          h: 0.4,
          fontSize: 10.5,
          color: palette.textHex,
          fontFace: 'Arial',
        });
      });
      currentY += steps.length * 0.65 + 0.15;
    } else if (s.layout === 'comparison-table' && s.comparisonData) {
      const rows: any[] = [
        [
          { text: 'Feature / Dimension', options: { bold: true, color: palette.accentHex, fill: palette.cardHex } },
          { text: s.comparisonData.leftHeader, options: { bold: true, color: palette.textHex, fill: palette.cardHex } },
          { text: s.comparisonData.rightHeader, options: { bold: true, color: palette.textHex, fill: palette.cardHex } },
        ],
        ...s.comparisonData.rows.map((r) => [
          { text: r.feature, options: { bold: true, color: palette.textHex } },
          { text: r.leftValue, options: { color: palette.mutedHex } },
          { text: r.rightValue, options: { color: palette.mutedHex } },
        ]),
      ];
      slide.addTable(rows, {
        x: 0.6,
        y: currentY,
        w: 8.8,
        fontSize: 10,
        border: { pt: 1, color: palette.borderHex },
        fill: { color: palette.bgHex },
      });
      currentY += 2.2;
    } else if (s.bullets && s.bullets.length > 0) {
      const bulletObjects = s.bullets.map((b) => ({
        text: b,
        options: { bullet: true, color: palette.textHex, fontSize: 12, breakLine: true },
      }));
      slide.addText(bulletObjects, {
        x: 0.6,
        y: currentY,
        w: 8.8,
        h: 1.9,
        fontFace: 'Arial',
        valign: 'top',
      });
      currentY += 2.0;
    }

    // Interactive Widget Callout Box on Slide
    if (s.interactiveType === 'quiz' && s.quizWidget) {
      const q = s.quizWidget;
      const optsText = q.options
        .map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt}`)
        .join('    ');
      const answerLine = includeAnswerKeys
        ? `\n✓ Correct Answer: ${q.correctAnswer} — ${q.explanation}`
        : '';
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6,
        y: Math.min(currentY, 3.85),
        w: 8.8,
        h: 1.35,
        fill: { color: palette.cardHex },
        line: { color: palette.accentHex, pt: 1.5 },
      });
      slide.addText(
        `⚡ INTERACTIVE CHECKPOINT: ${q.question}\n${optsText}${answerLine}`,
        {
          x: 0.75,
          y: Math.min(currentY, 3.85) + 0.1,
          w: 8.5,
          h: 1.15,
          fontSize: 9.5,
          color: palette.textHex,
          fontFace: 'Arial',
        }
      );
    } else if (s.keyTakeaway) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6,
        y: 4.55,
        w: 8.8,
        h: 0.6,
        fill: { color: palette.cardHex },
        line: { color: palette.accentHex, pt: 1 },
      });
      slide.addText(`Key Takeaway: ${s.keyTakeaway}`, {
        x: 0.75,
        y: 4.63,
        w: 8.5,
        h: 0.45,
        fontSize: 10,
        bold: true,
        color: palette.accentHex,
        fontFace: 'Arial',
      });
    }

    if (includeSpeakerNotes && s.speakerNotes) {
      slide.addNotes(s.speakerNotes);
    }
  }

  await pptx.writeFile({ fileName: `${slugify(deck.title)}.pptx` });
}

// ============================================================================
// 2. EXPORT TO WIDESCREEN PDF (.PDF) VIA JSPDF
// ============================================================================
export function exportPresentationToPdf(
  deck: PresentationDeck,
  includeSpeakerNotes = true,
  includeAnswerKeys = true
): void {
  // 16:9 Widescreen Landscape in mm (297mm x 167mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [297, 167],
  });

  const palette = getThemePalette(deck.themeId);
  const bgRgb = hexToRgb(palette.bgHex);
  const cardRgb = hexToRgb(palette.cardHex);
  const textRgb = hexToRgb(palette.textHex);
  const mutedRgb = hexToRgb(palette.mutedHex);
  const accentRgb = hexToRgb(palette.accentHex);
  const borderRgb = hexToRgb(palette.borderHex);

  deck.slides.forEach((s, idx) => {
    if (idx > 0) {
      doc.addPage([297, 167], 'landscape');
    }

    // Slide Background
    doc.setFillColor(bgRgb[0], bgRgb[1], bgRgb[2]);
    doc.rect(0, 0, 297, 167, 'F');

    // Top Accent Bar
    doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.rect(0, 0, 297, 2.5, 'F');

    // Kicker & Slide Number
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    const kickerText = `${s.kicker ? s.kicker.toUpperCase() + '  •  ' : ''}SLIDE ${idx + 1} OF ${deck.slides.length}  •  ${deck.title.toUpperCase()}`;
    doc.text(kickerText, 16, 14);

    // Slide Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(s.layout === 'hero-cover' ? 24 : 19);
    doc.setTextColor(textRgb[0], textRgb[1], textRgb[2]);
    const titleLines = doc.splitTextToSize(s.title, 265);
    doc.text(titleLines, 16, 25);

    let yPos = 25 + titleLines.length * 8;

    // Subtitle
    if (s.subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(mutedRgb[0], mutedRgb[1], mutedRgb[2]);
      const subLines = doc.splitTextToSize(s.subtitle, 265);
      doc.text(subLines, 16, yPos);
      yPos += subLines.length * 5.5 + 4;
    } else {
      yPos += 4;
    }

    // Layout Content
    if (s.layout === 'bento-grid' && s.bentoItems && s.bentoItems.length > 0) {
      const items = s.bentoItems.slice(0, 4);
      items.forEach((item, bIdx) => {
        const col = bIdx % 2;
        const row = Math.floor(bIdx / 2);
        const boxX = 16 + col * 134;
        const boxY = yPos + row * 34;

        doc.setFillColor(cardRgb[0], cardRgb[1], cardRgb[2]);
        doc.setDrawColor(borderRgb[0], borderRgb[1], borderRgb[2]);
        doc.roundedRect(boxX, boxY, 128, 30, 3, 3, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
        doc.text(
          `${item.metricOrBadge ? '[' + item.metricOrBadge + '] ' : ''}${item.title}`,
          boxX + 5,
          boxY + 8
        );

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(textRgb[0], textRgb[1], textRgb[2]);
        const descLines = doc.splitTextToSize(item.description, 118);
        doc.text(descLines.slice(0, 3), boxX + 5, boxY + 15);
      });
      yPos += 72;
    } else if (s.layout === 'timeline-process' && s.timelineSteps && s.timelineSteps.length > 0) {
      s.timelineSteps.slice(0, 4).forEach((st) => {
        doc.setFillColor(cardRgb[0], cardRgb[1], cardRgb[2]);
        doc.setDrawColor(borderRgb[0], borderRgb[1], borderRgb[2]);
        doc.roundedRect(16, yPos, 265, 14, 2, 2, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
        doc.text(`${st.step} · ${st.title}:`, 20, yPos + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(textRgb[0], textRgb[1], textRgb[2]);
        const dLines = doc.splitTextToSize(st.detail, 195);
        doc.text(dLines[0] || '', 82, yPos + 6);
        yPos += 16.5;
      });
    } else {
      // Standard bullets
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(textRgb[0], textRgb[1], textRgb[2]);
      (s.bullets || []).slice(0, 6).forEach((b) => {
        const bLines = doc.splitTextToSize(`•  ${b}`, 260);
        doc.text(bLines, 18, yPos);
        yPos += bLines.length * 5.5 + 2.5;
      });
    }

    // Interactive Checkpoint / Widget Box at bottom of slide
    if (s.interactiveType === 'quiz' && s.quizWidget) {
      const q = s.quizWidget;
      const boxTop = Math.min(Math.max(yPos + 2, 108), 116);
      doc.setFillColor(cardRgb[0], cardRgb[1], cardRgb[2]);
      doc.setDrawColor(accentRgb[0], accentRgb[1], accentRgb[2]);
      doc.roundedRect(16, boxTop, 265, 34, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
      doc.text(`INTERACTIVE KNOWLEDGE CHECK: ${q.question}`, 21, boxTop + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(textRgb[0], textRgb[1], textRgb[2]);
      const optRow = q.options
        .map((o, oIdx) => `${String.fromCharCode(65 + oIdx)}) ${o}`)
        .join('     ');
      const optLines = doc.splitTextToSize(optRow, 255);
      doc.text(optLines.slice(0, 2), 21, boxTop + 14);

      if (includeAnswerKeys) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(mutedRgb[0], mutedRgb[1], mutedRgb[2]);
        const ansLines = doc.splitTextToSize(
          `Answer: ${q.correctAnswer} — ${q.explanation}`,
          255
        );
        doc.text(ansLines.slice(0, 2), 21, boxTop + 25);
      }
    } else if (s.keyTakeaway) {
      doc.setFillColor(cardRgb[0], cardRgb[1], cardRgb[2]);
      doc.setDrawColor(borderRgb[0], borderRgb[1], borderRgb[2]);
      doc.roundedRect(16, 134, 265, 14, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(accentRgb[0], accentRgb[1], accentRgb[2]);
      doc.text(`Key Takeaway: ${s.keyTakeaway}`, 21, 142.5);
    }

    // Speaker Notes Footer Strip
    if (includeSpeakerNotes && s.speakerNotes) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(mutedRgb[0], mutedRgb[1], mutedRgb[2]);
      const noteLine = doc.splitTextToSize(`Speaker Notes: ${s.speakerNotes}`, 265);
      doc.text(noteLine[0] || '', 16, 159);
    }
  });

  doc.save(`${slugify(deck.title)}-slides.pdf`);
}

// ============================================================================
// 3. EXPORT STANDALONE INTERACTIVE HTML5 WEB PRESENTATION (.HTML)
// ============================================================================
export function exportPresentationToInteractiveHtml(deck: PresentationDeck): void {
  const palette = getThemePalette(deck.themeId);
  const serializedDeck = JSON.stringify(deck).replace(/</g, '\\u003c');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${deck.title} — Interactive Gamma Presentation</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #${palette.bgHex};
      color: #${palette.textHex};
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    header {
      padding: 14px 24px;
      border-bottom: 1px solid #${palette.borderHex};
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .deck-title { font-weight: 800; font-size: 16px; }
    .controls { display: flex; gap: 10px; align-items: center; }
    button {
      background: #${palette.accentHex};
      color: #0f172a;
      border: none;
      padding: 8px 16px;
      border-radius: 10px;
      font-weight: 800;
      cursor: pointer;
      font-size: 13px;
    }
    button:disabled { opacity: 0.4; cursor: not-allowed; }
    main {
      flex: 1;
      max-width: 1050px;
      width: 100%;
      margin: 28px auto;
      padding: 0 20px;
    }
    .slide-card {
      background: #${palette.cardHex};
      border: 1px solid #${palette.borderHex};
      border-radius: 24px;
      padding: 36px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.35);
    }
    .kicker {
      color: #${palette.accentHex};
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 8px;
    }
    h1 { font-size: 32px; line-height: 1.2; margin-bottom: 12px; }
    .subtitle { color: #${palette.mutedHex}; font-size: 17px; margin-bottom: 24px; line-height: 1.5; }
    ul.bullets { margin: 16px 0 24px 22px; display: grid; gap: 10px; font-size: 16px; line-height: 1.6; }
    .bento-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin: 20px 0; }
    .bento-box {
      padding: 18px;
      border-radius: 16px;
      border: 1px solid #${palette.borderHex};
      background: rgba(0,0,0,0.18);
    }
    .bento-box h3 { color: #${palette.accentHex}; margin-bottom: 6px; font-size: 16px; }
    .interactive-box {
      margin-top: 26px;
      padding: 22px;
      border-radius: 18px;
      border: 2px solid #${palette.accentHex};
      background: rgba(0,0,0,0.22);
    }
    .opt-btn {
      display: block;
      width: 100%;
      text-align: left;
      margin-top: 10px;
      padding: 12px 16px;
      background: #${palette.bgHex};
      color: #${palette.textHex};
      border: 1px solid #${palette.borderHex};
      border-radius: 12px;
      font-weight: 600;
    }
    .opt-btn.correct { border-color: #10b981; background: rgba(16, 185, 129, 0.2); }
    .opt-btn.wrong { border-color: #f43f5e; background: rgba(244, 63, 94, 0.2); }
    .notes-box {
      margin-top: 20px;
      padding: 16px;
      border-radius: 14px;
      border: 1px dashed #${palette.borderHex};
      color: #${palette.mutedHex};
      font-size: 13px;
      line-height: 1.5;
    }
    img.slide-img {
      width: 100%;
      max-height: 300px;
      object-fit: cover;
      border-radius: 16px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <header>
    <div>
      <div class="deck-title" id="headerTitle"></div>
      <div style="font-size:12px;opacity:0.75" id="slideCounter"></div>
    </div>
    <div class="controls">
      <button id="prevBtn" onclick="changeSlide(-1)">← Previous</button>
      <button id="nextBtn" onclick="changeSlide(1)">Next →</button>
    </div>
  </header>
  <main>
    <div class="slide-card" id="slideContainer"></div>
  </main>
  <script>
    const deck = ${serializedDeck};
    let currentIdx = 0;
    document.getElementById('headerTitle').textContent = deck.title;

    function renderSlide() {
      const s = deck.slides[currentIdx];
      document.getElementById('slideCounter').textContent = 'Slide ' + (currentIdx + 1) + ' of ' + deck.slides.length;
      document.getElementById('prevBtn').disabled = currentIdx === 0;
      document.getElementById('nextBtn').disabled = currentIdx === deck.slides.length - 1;

      let html = '';
      if (s.kicker) html += '<div class="kicker">' + s.kicker + '</div>';
      html += '<h1>' + s.title + '</h1>';
      if (s.subtitle) html += '<div class="subtitle">' + s.subtitle + '</div>';
      if (s.imageUrl) html += '<img class="slide-img" src="' + s.imageUrl + '" alt="Slide visual" />';

      if (s.bentoItems && s.bentoItems.length) {
        html += '<div class="bento-grid">';
        s.bentoItems.forEach(item => {
          html += '<div class="bento-box"><h3>' + (item.metricOrBadge ? '[' + item.metricOrBadge + '] ' : '') + item.title + '</h3><p style="font-size:14px;line-height:1.5">' + item.description + '</p></div>';
        });
        html += '</div>';
      }

      if (s.bullets && s.bullets.length) {
        html += '<ul class="bullets">';
        s.bullets.forEach(b => { html += '<li>' + b + '</li>'; });
        html += '</ul>';
      }

      if (s.interactiveType === 'quiz' && s.quizWidget) {
        html += '<div class="interactive-box"><div class="kicker">⚡ Interactive Knowledge Check</div><h3 style="margin-bottom:10px">' + s.quizWidget.question + '</h3>';
        s.quizWidget.options.forEach((opt, i) => {
          html += '<button class="opt-btn" onclick="checkQuiz(this, ' + i + ')">' + String.fromCharCode(65 + i) + '. ' + opt + '</button>';
        });
        html += '<div id="quizFeedback" style="margin-top:12px;font-size:14px;display:none"></div></div>';
      }

      if (s.speakerNotes) {
        html += '<div class="notes-box"><strong>Speaker Notes:</strong> ' + s.speakerNotes + '</div>';
      }

      document.getElementById('slideContainer').innerHTML = html;
    }

    function checkQuiz(btn, idx) {
      const s = deck.slides[currentIdx];
      const q = s.quizWidget;
      const chosen = q.options[idx];
      const isRight = chosen.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      btn.classList.add(isRight ? 'correct' : 'wrong');
      const fb = document.getElementById('quizFeedback');
      fb.style.display = 'block';
      fb.innerHTML = (isRight ? '✅ <strong>Correct!</strong> ' : '❌ <strong>Correct Answer: ' + q.correctAnswer + '</strong> — ') + q.explanation;
    }

    function changeSlide(delta) {
      const next = currentIdx + delta;
      if (next >= 0 && next < deck.slides.length) {
        currentIdx = next;
        renderSlide();
      }
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') changeSlide(1);
      if (e.key === 'ArrowLeft') changeSlide(-1);
    });

    renderSlide();
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(deck.title)}-interactive.html`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// 4. EXPORT TO MARKDOWN (.MD) & WORD HANDOUT (.DOC)
// ============================================================================
export function formatPresentationMarkdown(deck: PresentationDeck): string {
  const lines: string[] = [
    `# ${deck.title}`,
    `> ${deck.subtitle}`,
    `> **Author:** ${deck.author} | **Slides:** ${deck.slides.length} | **Difficulty:** ${deck.difficulty}`,
    '',
    '---',
    '',
  ];

  deck.slides.forEach((s, idx) => {
    lines.push(`## Slide ${idx + 1}: ${s.title}`);
    if (s.kicker) lines.push(`*${s.kicker}*`);
    if (s.subtitle) lines.push(`\n**${s.subtitle}**\n`);

    if (s.bullets && s.bullets.length > 0) {
      s.bullets.forEach((b) => lines.push(`- ${b}`));
      lines.push('');
    }

    if (s.bentoItems && s.bentoItems.length > 0) {
      lines.push('### Key Pillars');
      s.bentoItems.forEach((item) => {
        lines.push(`- **${item.title}** ${item.metricOrBadge ? `(${item.metricOrBadge})` : ''}: ${item.description}`);
      });
      lines.push('');
    }

    if (s.timelineSteps && s.timelineSteps.length > 0) {
      lines.push('### Process & Timeline');
      s.timelineSteps.forEach((st) => {
        lines.push(`1. **${st.step} — ${st.title}**: ${st.detail}`);
      });
      lines.push('');
    }

    if (s.interactiveType === 'quiz' && s.quizWidget) {
      lines.push(`### ⚡ Interactive Checkpoint`);
      lines.push(`**Question:** ${s.quizWidget.question}`);
      s.quizWidget.options.forEach((opt, oIdx) => {
        lines.push(`  - ${String.fromCharCode(65 + oIdx)}) ${opt}`);
      });
      lines.push(`  - **Correct Answer:** ${s.quizWidget.correctAnswer}`);
      lines.push(`  - **Explanation:** ${s.quizWidget.explanation}`);
      lines.push('');
    }

    if (s.keyTakeaway) {
      lines.push(`> **Key Takeaway:** ${s.keyTakeaway}\n`);
    }

    if (s.speakerNotes) {
      lines.push(`*Speaker Notes:* ${s.speakerNotes}\n`);
    }

    lines.push('---\n');
  });

  return lines.join('\n');
}

export function exportPresentationToMarkdown(deck: PresentationDeck): void {
  const md = formatPresentationMarkdown(deck);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(deck.title)}-handout.md`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPresentationToWordDoc(deck: PresentationDeck): void {
  const htmlBody = deck.slides
    .map(
      (s, i) => `
      <div style="margin-bottom:28px;page-break-inside:avoid;border-bottom:1px solid #cbd5e1;padding-bottom:18px;">
        <p style="color:#4f46e5;font-size:10pt;font-weight:bold;text-transform:uppercase;margin:0;">Slide ${i + 1} · ${s.kicker || s.layout}</p>
        <h2 style="font-size:18pt;margin:4px 0 8px 0;color:#0f172a;">${s.title}</h2>
        ${s.subtitle ? `<p style="font-size:12pt;color:#475569;margin-bottom:10px;"><em>${s.subtitle}</em></p>` : ''}
        ${
          s.bullets?.length
            ? `<ul>${s.bullets.map((b) => `<li style="font-size:11pt;margin-bottom:4px;">${b}</li>`).join('')}</ul>`
            : ''
        }
        ${
          s.bentoItems?.length
            ? `<table border="1" cellspacing="0" cellpadding="8" style="width:100%;border-collapse:collapse;margin:10px 0;">
                ${s.bentoItems
                  .map(
                    (b) =>
                      `<tr><td style="width:35%;font-weight:bold;background:#f8fafc;">${b.title} ${b.metricOrBadge ? `(${b.metricOrBadge})` : ''}</td><td>${b.description}</td></tr>`
                  )
                  .join('')}
               </table>`
            : ''
        }
        ${
          s.interactiveType === 'quiz' && s.quizWidget
            ? `<div style="background:#f1f5f9;padding:12px;border-left:4px solid #4f46e5;margin-top:10px;">
                <p style="margin:0 0 6px 0;font-weight:bold;">Interactive Quiz: ${s.quizWidget.question}</p>
                <p style="margin:0 0 6px 0;font-size:10pt;">${s.quizWidget.options.map((o, idx) => `${String.fromCharCode(65 + idx)}) ${o}`).join(' &nbsp;|&nbsp; ')}</p>
                <p style="margin:0;font-size:10pt;color:#047857;"><strong>Answer:</strong> ${s.quizWidget.correctAnswer} — ${s.quizWidget.explanation}</p>
               </div>`
            : ''
        }
        ${s.speakerNotes ? `<p style="font-size:9.5pt;color:#64748b;margin-top:10px;"><strong>Speaker Notes:</strong> ${s.speakerNotes}</p>` : ''}
      </div>`
    )
    .join('');

  const docContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset="utf-8"><title>${deck.title}</title></head>
    <body style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5;">
      <h1 style="font-size:24pt;color:#1e1b4b;margin-bottom:4px;">${deck.title}</h1>
      <p style="font-size:13pt;color:#475569;margin-top:0;">${deck.subtitle}</p>
      <hr/>
      ${htmlBody}
    </body>
  </html>`;

  const blob = new Blob(['\ufeff', docContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(deck.title)}-handout.doc`;
  a.click();
  URL.revokeObjectURL(url);
}
