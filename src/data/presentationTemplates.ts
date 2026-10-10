import { PresentationDeck, PresentationSlide } from '../utils/presentationExporter';
import { resolveThematicVisual } from '../utils/thematicImages';
import { QuizResponse } from '../types/quiz';

export const CURATED_PRESENTATION_TEMPLATES: PresentationDeck[] = [
  {
    id: 'tpl-bioenergetics-masterclass',
    title: 'Cellular Bioenergetics: Photosynthesis & ATP Synthesis',
    subtitle: 'Interactive Visual Masterclass with Live Checkpoints, 3D Flip Cards & Rate Simulators',
    author: 'Gamma AI+ Interactive Studio',
    themeId: 'gamma-emerald',
    difficulty: 'Intermediate',
    subjectOrExam: 'IGCSE / WAEC / AP Biology',
    createdAt: '2026-10-08',
    slides: [
      {
        id: 'slide-1',
        slideNumber: 1,
        layout: 'hero-cover',
        kicker: 'Module 01 · Cellular Bioenergetics',
        title: 'How Living Cells Capture & Transform Solar Energy',
        subtitle:
          'From chloroplast thylakoid membranes to mitochondrial cristae: mastering coupled energy transfer for WAEC, IGCSE, and AP Biology.',
        bullets: [
          'Light-dependent photophosphorylation vs. the Calvin-Benson cycle',
          'Chemiosmotic proton gradients and rotary ATP Synthase catalysis',
          'Limiting factors and quantitative rate simulation',
        ],
        imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200&auto=format&fit=crop&q=80',
        imageCaption: 'High-resolution cellular imaging of chloroplast and mitochondrial energy networks.',
        imageLayout: 'right',
        interactiveType: 'poll',
        pollWidget: {
          prompt: 'Audience Warm-Up Poll: Which stage of cellular respiration generates the largest yield of ATP?',
          options: [
            { label: 'Glycolysis in the cytosol (2 ATP net)', votes: 8 },
            { label: 'Krebs / Citric Acid Cycle (2 ATP)', votes: 14 },
            { label: 'Oxidative Phosphorylation & Electron Transport Chain (~32–34 ATP)', votes: 68 },
          ],
        },
        speakerNotes:
          'Welcome everyone! Start by launching the live warm-up poll to gauge prior knowledge on ATP yield before diving into chloroplast structure.',
        keyTakeaway: 'Autotrophs convert electromagnetic photon energy into chemical bond energy (ATP and NADPH).',
      },
      {
        id: 'slide-2',
        slideNumber: 2,
        layout: 'bento-grid',
        kicker: 'Core Architecture · 4 Pillars',
        title: 'Chloroplast Ultrastructure & Functional Compartments',
        subtitle: 'Each structural compartment of the chloroplast is specialized for a distinct biochemical phase.',
        bullets: [],
        bentoItems: [
          {
            title: 'Thylakoid Lumen & Membrane',
            metricOrBadge: 'Light Phase',
            description:
              'Houses Photosystem II (P680), Photosystem I (P700), cytochrome b6f, and ATP synthase for photolysis and chemiosmosis.',
          },
          {
            title: 'Chloroplast Stroma',
            metricOrBadge: 'Calvin Cycle',
            description:
              'Enzyme-rich fluid matrix containing RuBisCO where CO2 is fixed into ribulose bisphosphate (RuBP) to synthesize triose phosphate.',
          },
          {
            title: 'Photosynthetic Pigments',
            metricOrBadge: '430nm & 660nm',
            description:
              'Chlorophyll a, chlorophyll b, and carotenoids harvest blue and red wavelengths while reflecting green light.',
          },
          {
            title: 'Double Membrane Envelope',
            metricOrBadge: 'Selective Transport',
            description:
              'Regulates metabolite flux of phosphate, triose sugars, and dicarboxylates between the cytosol and stroma.',
          },
        ],
        interactiveType: 'flashcards',
        flashcardsWidget: [
          {
            front: 'What is Photolysis of Water?',
            back: '2H2O → 4H+ + 4e- + O2. Catalyzed by the oxygen-evolving complex in Photosystem II to replace excited electrons.',
          },
          {
            front: 'Role of NADP+ Reductase?',
            back: 'Transfers high-energy electrons at the end of Photosystem I to reduce NADP+ + H+ into NADPH for the Calvin cycle.',
          },
          {
            front: 'Why does Cyclic Photophosphorylation occur?',
            back: 'Generates extra ATP without producing NADPH when stromal ATP:NADPH ratio drops below the 3:2 requirement of carbon fixation.',
          },
        ],
        speakerNotes:
          'Walk through the 4 Bento cards first, then click each interactive flashcard below to test student recall on photolysis and NADP+ reduction.',
        keyTakeaway: 'Spatial separation between thylakoid lumen (high H+) and stroma (low H+) drives ATP synthesis.',
      },
      {
        id: 'slide-3',
        slideNumber: 3,
        layout: 'timeline-process',
        kicker: 'Step-by-Step Pathway',
        title: 'The Z-Scheme & Non-Cyclic Electron Flow',
        subtitle: 'Tracing a single photon strike from water oxidation to carbon fixation.',
        bullets: [],
        timelineSteps: [
          {
            step: 'Stage 01',
            title: 'Photoexcitation at PSII (P680)',
            detail: 'Photons excite chlorophyll electrons; water is split (photolysis) releasing O2 gas and protons into the lumen.',
          },
          {
            step: 'Stage 02',
            title: 'Plastoquinone & Cytochrome b6f Proton Pump',
            detail: 'Electrons cascade down the transport chain, actively pumping H+ ions across the thylakoid membrane.',
          },
          {
            step: 'Stage 03',
            title: 'Re-excitation at PSI (P700) & Ferredoxin',
            detail: 'A second photon boosts electron energy at PSI, reducing NADP+ to NADPH via ferredoxin-NADP+ reductase.',
          },
          {
            step: 'Stage 04',
            title: 'Chemiosmosis & Calvin Cycle Carbon Fixation',
            detail: 'Protons flow through CF0-CF1 ATP Synthase to form ATP, which powers RuBisCO-mediated CO2 assimilation.',
          },
        ],
        interactiveType: 'simulator',
        simulatorWidget: {
          title: 'Interactive Photosynthetic Rate & Light Intensity Simulator',
          variableLabel: 'Incident Light Intensity (PAR)',
          unit: 'μmol·m⁻²·s⁻¹',
          min: 50,
          max: 1200,
          step: 50,
          defaultValue: 450,
          formulaDescription: 'Models O2 evolution rate as photon flux increases toward RuBisCO saturation.',
          multiplier: 0.18,
          outputLabel: 'Estimated O2 Evolution Rate',
          outputUnit: 'mL O2 / hr',
        },
        speakerNotes:
          'Use the interactive slider during the presentation to show how increasing light intensity boosts O2 output proportionally.',
        keyTakeaway: 'Every 1 molecule of CO2 fixed in the Calvin cycle requires 3 ATP and 2 NADPH molecules.',
      },
      {
        id: 'slide-4',
        slideNumber: 4,
        layout: 'comparison-table',
        kicker: 'Comparative Biochemistry',
        title: 'C3 vs. C4 & CAM Photosynthetic Adaptations',
        subtitle: 'How tropical and arid plants overcome RuBisCO photorespiration.',
        bullets: [],
        comparisonData: {
          leftHeader: 'C3 Pathway (Rice, Wheat)',
          rightHeader: 'C4 Pathway (Maize, Sugarcane)',
          rows: [
            {
              feature: 'Primary CO2 Acceptor',
              leftValue: '5-Carbon RuBP (via RuBisCO)',
              rightValue: '3-Carbon PEP (via PEP Carboxylase)',
            },
            {
              feature: 'First Stable Product',
              leftValue: '3-Phosphoglycerate (3-PGA, 3C)',
              rightValue: 'Oxaloacetate (OAA, 4C)',
            },
            {
              feature: 'Kranz Leaf Anatomy',
              leftValue: 'Absent (Mesophyll cells only)',
              rightValue: 'Present (Mesophyll + Bundle Sheath)',
            },
            {
              feature: 'Photorespiration Loss',
              leftValue: 'High under heat/drought (up to 25%)',
              rightValue: 'Negligible (CO2 concentrated at RuBisCO)',
            },
          ],
        },
        interactiveType: 'quiz',
        quizWidget: {
          question: 'Why does PEP Carboxylase in C4 plants prevent wasteful photorespiration at high temperatures?',
          options: [
            'PEP Carboxylase has a high affinity for HCO3- and zero affinity for O2 gas',
            'PEP Carboxylase directly splits water molecules without sunlight',
            'C4 plants do not use the Calvin cycle or RuBisCO at any point',
            'PEP Carboxylase operates exclusively inside mitochondrial cristae',
          ],
          correctAnswer: 'PEP Carboxylase has a high affinity for HCO3- and zero affinity for O2 gas',
          explanation:
            'Unlike RuBisCO, which competitively binds O2 at high temperatures, PEP carboxylase exclusively fixes bicarbonate into 4-carbon acids that are shuttled to bundle-sheath cells.',
          hint: 'Think about substrate specificity between CO2/bicarbonate and oxygen.',
          points: 25,
        },
        speakerNotes:
          'Have students compare row 1 and row 4 in the comparison matrix before attempting the interactive checkpoint question.',
        keyTakeaway: 'C4 plants spatially separate initial carbon capture (mesophyll) from the Calvin cycle (bundle sheath).',
      },
    ],
  },
  {
    id: 'tpl-ai-neural-networks',
    title: 'Modern Deep Learning & Transformer Architectures',
    subtitle: 'From Perceptrons and Backpropagation to Multi-Head Self-Attention',
    author: 'Gamma AI+ Interactive Studio',
    themeId: 'gamma-dark',
    difficulty: 'Master',
    subjectOrExam: 'Computer Science & AI Engineering',
    createdAt: '2026-10-08',
    slides: [
      {
        id: 'ai-slide-1',
        slideNumber: 1,
        layout: 'hero-cover',
        kicker: 'Artificial Intelligence · Deep Learning Deck',
        title: 'Inside Transformer Neural Networks & Attention Mechanisms',
        subtitle: 'Understanding how parallel token embeddings and scaled dot-product attention revolutionized sequence modeling.',
        bullets: [
          'Why Recurrent Neural Networks (RNNs) struggled with long-range dependencies',
          'Query (Q), Key (K), and Value (V) matrix projections explained visually',
          'Scaling laws, compute budgets, and inference optimization',
        ],
        imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
        imageCaption: 'High-dimensional representation of neural network weights and attention heads.',
        imageLayout: 'right',
        interactiveType: 'accordion',
        accordionWidget: [
          {
            title: '1. Why scale dot products by 1 / √d_k?',
            content:
              'For large key dimensions d_k, the dot products Q·K^T grow large in magnitude, pushing the softmax function into regions with vanishingly small gradients. Dividing by √d_k stabilizes variance to 1.',
          },
          {
            title: '2. Role of Positional Encoding',
            content:
              'Because self-attention is permutation-invariant and processes all tokens simultaneously, sinusoidal or rotary positional embeddings (RoPE) inject token order information.',
          },
        ],
        speakerNotes: 'Open the two interactive accordions on Slide 1 to explain scaling factors and RoPE positional encodings.',
        keyTakeaway: 'Self-attention connects all tokens in O(1) sequential operations compared to O(n) in RNNs.',
      },
      {
        id: 'ai-slide-2',
        slideNumber: 2,
        layout: 'data-chart',
        kicker: 'Performance Benchmarks',
        title: 'Context Window & Training Throughput Comparison',
        subtitle: 'Comparing sequential recurrent architectures against parallelized Multi-Head Attention.',
        bullets: [
          'Parallel matrix multiplication saturates modern GPU tensor cores',
          'FlashAttention reduces memory I/O complexity by tiling SRAM blocks',
        ],
        chartData: {
          chartTitle: 'Relative Training Throughput (Tokens / Sec Normalized)',
          bars: [
            { label: 'Vanilla RNN', value: 18, unit: 'x' },
            { label: 'Bi-Directional LSTM', value: 32, unit: 'x' },
            { label: 'Standard Transformer', value: 78, unit: 'x' },
            { label: 'FlashAttention-2 Transformer', value: 96, unit: 'x' },
          ],
        },
        interactiveType: 'quiz',
        quizWidget: {
          question: 'What is the computational complexity of standard self-attention with respect to sequence length N?',
          options: ['O(N²) quadratic complexity', 'O(log N) logarithmic complexity', 'O(1) constant complexity', 'O(N!) factorial complexity'],
          correctAnswer: 'O(N²) quadratic complexity',
          explanation: 'Every token attends to every other token in the sequence, producing an N × N attention weight matrix.',
          hint: 'Think of the dimensions of the attention matrix when multiplying Q (N×d) by K^T (d×N).',
          points: 30,
        },
        speakerNotes: 'Highlight the bar chart showing FlashAttention-2 throughput gains before asking the complexity question.',
        keyTakeaway: 'Standard self-attention scales quadratically O(N²) with sequence length N.',
      },
    ],
  },
  {
    id: 'tpl-waec-jamb-physics',
    title: 'Electromagnetism, Faraday’s Law & AC Generators',
    subtitle: 'Complete Exam Revision Presentation for WAEC, JAMB UTME & Cambridge IGCSE Physics',
    author: 'Gamma AI+ Interactive Studio',
    themeId: 'gamma-ocean',
    difficulty: 'Intermediate',
    subjectOrExam: 'WAEC / JAMB / IGCSE Physics',
    createdAt: '2026-10-08',
    slides: [
      {
        id: 'phys-1',
        slideNumber: 1,
        layout: 'split-visual',
        kicker: 'Electromagnetic Induction · Exam Revision',
        title: 'Faraday’s & Lenz’s Laws of Electromagnetic Induction',
        subtitle: 'How changing magnetic flux linkage induces electromotive force (EMF) in conductors.',
        bullets: [
          'Faraday’s Law: Induced EMF is directly proportional to the rate of change of magnetic flux linkage (E = -N ΔΦ / Δt)',
          'Lenz’s Law: The direction of induced current always opposes the change in magnetic flux that produces it (Conservation of Energy)',
          'Fleming’s Right-Hand Dynamo Rule predicts induced current direction',
        ],
        imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&auto=format&fit=crop&q=80',
        imageCaption: 'Magnetic field lines, solenoid induction, and alternating current dynamo principles.',
        imageLayout: 'right',
        interactiveType: 'simulator',
        simulatorWidget: {
          title: 'Interactive Transformer Turns-Ratio Voltage Calculator',
          variableLabel: 'Secondary Coil Turns (Ns) [with Primary Np = 100, Vp = 240V]',
          unit: 'turns',
          min: 25,
          max: 500,
          step: 25,
          defaultValue: 200,
          formulaDescription: 'Applies the ideal transformer equation Vs = Vp × (Ns / Np) where Vp = 240V and Np = 100 turns.',
          multiplier: 2.4,
          outputLabel: 'Induced Secondary Voltage (Vs)',
          outputUnit: 'Volts (V)',
        },
        speakerNotes: 'Demonstrate step-down (<100 turns) vs step-up (>100 turns) transformer operation live using the slider.',
        keyTakeaway: 'Lenz’s negative sign in E = -N(dΦ/dt) is a direct consequence of the Law of Conservation of Energy.',
      },
      {
        id: 'phys-2',
        slideNumber: 2,
        layout: 'bento-grid',
        kicker: 'High-Yield Exam Traps',
        title: 'Minimizing Power Losses in Real Transformers',
        subtitle: 'Frequently tested Paper 2 theory table for WAEC, NECO, and IGCSE Physics.',
        bullets: [],
        bentoItems: [
          {
            title: 'Eddy Current Losses',
            metricOrBadge: 'Laminated Core',
            description: 'Insulated iron laminations block circulating eddy current loops inside the core, preventing I²R heating.',
          },
          {
            title: 'Hysteresis Loss',
            metricOrBadge: 'Soft Iron Core',
            description: 'Soft iron magnetizes and demagnetizes easily 50/60 times per second with minimal magnetic energy retention.',
          },
          {
            title: 'Copper (Joule) Heating',
            metricOrBadge: 'Thick Low-R Wire',
            description: 'High-current windings use thick, low-resistance copper wire to minimize P = I²R thermal dissipation.',
          },
          {
            title: 'Flux Leakage',
            metricOrBadge: 'Shell Core Design',
            description: 'Winding secondary coils directly over primary coils ensures maximum magnetic flux linkage.',
          },
        ],
        interactiveType: 'quiz',
        quizWidget: {
          question: 'Why is electrical power transmitted across national grids at very high voltages (e.g., 330 kV) and low current?',
          options: [
            'To minimize power loss as heat in transmission cables since P_loss = I²R',
            'Because electrons travel faster in air than in copper cables',
            'To increase the resistance of the aluminum transmission pylons',
            'Because step-down transformers only work with direct current (DC)',
          ],
          correctAnswer: 'To minimize power loss as heat in transmission cables since P_loss = I²R',
          explanation: 'Stepping up voltage by a factor of 10 reduces current I by a factor of 10, cutting I²R heating loss by a factor of 100.',
          hint: 'Recall the formula for resistive power dissipation in a cable of resistance R.',
          points: 20,
        },
        speakerNotes: 'Emphasize the four causes of transformer inefficiency—this appears almost every year in WAEC and IGCSE Paper 2.',
        keyTakeaway: 'Laminating the soft-iron core reduces eddy currents; using thick copper wire reduces I²R Joule heating.',
      },
    ],
  },
];

/**
 * Converts a QuizResponse (either from AI generation or imported deck) into a rich,
 * multi-layout PresentationDeck with diverse interactive widgets.
 */
export function convertQuizToPresentationDeck(
  quiz: QuizResponse,
  themeId = 'gamma-dark',
  includeMixedInteractives = true,
  targetSlideCount?: number
): PresentationDeck {
  const layoutCycle: PresentationSlide['layout'][] = [
    'hero-cover',
    'split-visual',
    'bento-grid',
    'timeline-process',
    'data-chart',
    'comparison-table',
  ];

  const baseSlides: PresentationSlide[] = (quiz.questions || []).map((q, idx) => {
    const layout = idx === 0 ? 'hero-cover' : layoutCycle[(idx % (layoutCycle.length - 1)) + 1];
    const visual = resolveThematicVisual(
      `${quiz.quiz_title || ''} ${q.correct_answer || ''} ${q.image_search_query || ''} ${q.question || ''}`,
      idx
    );
    const imgUrl = q.image_url || visual.url;

    // Synthesize rich slide bullets from question & explanation
    const explanationSentences = (q.explanation || '')
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const bullets =
      explanationSentences.length >= 2
        ? explanationSentences
        : [
            q.explanation || `Core principle governing ${q.correct_answer}.`,
            `Key concept focus: ${q.correct_answer}`,
            q.gamified_feedback?.hint || 'Analyze the underlying mechanism and eliminate distractors systematically.',
          ];

    const bentoItems =
      layout === 'bento-grid'
        ? (q.options || []).slice(0, 4).map((opt, oIdx) => ({
            title: opt,
            metricOrBadge:
              opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()
                ? 'Core Principle'
                : `Concept ${oIdx + 1}`,
            description:
              opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()
                ? q.explanation || 'Primary verified mechanism in this topic.'
                : `Contrast this option against ${q.correct_answer} when evaluating exam scenarios.`,
          }))
        : undefined;

    const timelineSteps =
      layout === 'timeline-process'
        ? [
            {
              step: 'Phase 01',
              title: 'Identify Core Premise',
              detail: q.question,
            },
            {
              step: 'Phase 02',
              title: 'Apply Governing Mechanism',
              detail: explanationSentences[0] || q.explanation || 'Evaluate governing rules and definitions.',
            },
            {
              step: 'Phase 03',
              title: 'Verify Outcome',
              detail: `Confirmed Result: ${q.correct_answer}`,
            },
          ]
        : undefined;

    const chartData =
      layout === 'data-chart'
        ? {
            chartTitle: 'Conceptual Mastery & Exam Weighting Breakdown',
            bars: [
              { label: 'Core Theory', value: 88, unit: '%' },
              { label: 'Applied Problem Solving', value: 94, unit: '%' },
              { label: 'Exam Frequency', value: 82, unit: '%' },
              { label: 'Synthesis Depth', value: 90, unit: '%' },
            ],
          }
        : undefined;

    const comparisonData =
      layout === 'comparison-table'
        ? {
            leftHeader: 'Verified Principle',
            rightHeader: 'Common Exam Misconception',
            rows: [
              {
                feature: 'Primary Mechanism',
                leftValue: q.correct_answer,
                rightValue: (q.options || []).find((o) => o !== q.correct_answer) || 'Surface assumption',
              },
              {
                feature: 'Diagnostic Rationale',
                leftValue: explanationSentences[0] || q.explanation || 'Supported by empirical evidence',
                rightValue: 'Overlooks boundary conditions or key variables',
              },
            ],
          }
        : undefined;

    // Pick interactive widget type
    let interactiveType: PresentationSlide['interactiveType'] = 'quiz';
    if (includeMixedInteractives && idx > 0 && idx % 4 === 2) {
      interactiveType = 'flashcards';
    } else if (includeMixedInteractives && idx > 0 && idx % 5 === 3) {
      interactiveType = 'accordion';
    } else if (includeMixedInteractives && idx > 0 && idx % 6 === 4) {
      interactiveType = 'simulator';
    } else if (includeMixedInteractives && idx > 0 && idx % 7 === 5) {
      interactiveType = 'poll';
    }

    return {
      id: `slide-${idx + 1}-${Date.now()}`,
      slideNumber: idx + 1,
      layout,
      kicker: `${quiz.examFormat ? quiz.examFormat.toUpperCase() + ' · ' : ''}${q.domain || 'Interactive Concept Slide'}`,
      title:
        idx === 0
          ? quiz.quiz_title || q.question
          : q.question.length > 78
          ? `${q.correct_answer}: ${q.domain || 'Core Analysis'}`
          : q.question,
      subtitle:
        idx === 0
          ? quiz.summary || q.question
          : q.question.length > 78
          ? q.question
          : explanationSentences[0] || '',
      bullets,
      bentoItems,
      timelineSteps,
      chartData,
      comparisonData,
      imageUrl: imgUrl,
      imageCaption: q.image_caption || visual.caption,
      imageLayout: 'right',
      imageSource: q.image_source || 'Unsplash',
      imageAttribution: q.image_attribution || 'Unsplash Educational Collection',
      interactiveType,
      quizWidget: {
        question: q.question,
        options: q.options && q.options.length >= 2 ? q.options : [q.correct_answer, 'Alternative Hypothesis A', 'Alternative Hypothesis B', 'Alternative Hypothesis C'],
        correctAnswer: q.correct_answer,
        explanation: q.explanation || 'Review the core concept notes above.',
        hint: q.gamified_feedback?.hint || 'Focus on the primary definition and governing variables.',
        points: q.points || 20,
      },
      pollWidget: {
        prompt: `Audience Pulse: How confident are you in applying "${q.correct_answer}" to multi-step exam problems?`,
        options: [
          { label: 'Ready for Distinction / A* Level Problems', votes: 34 },
          { label: 'Understand Core Theory, Need More Practice', votes: 48 },
          { label: 'Want Another Worked Example Walkthrough', votes: 18 },
        ],
      },
      flashcardsWidget: [
        {
          front: q.question,
          back: `${q.correct_answer} — ${q.explanation}`,
        },
        {
          front: `Key Hint for ${q.correct_answer}`,
          back: q.gamified_feedback?.hint || q.explanation || 'Remember the foundational rule.',
        },
      ],
      accordionWidget: [
        {
          title: `Deep-Dive Explanation: Why ${q.correct_answer}?`,
          content: q.explanation || 'Detailed analytical breakdown of this concept.',
        },
        {
          title: 'Exam Strategy & Hint',
          content: q.gamified_feedback?.hint || 'Eliminate options that contradict conservation or foundational laws.',
        },
      ],
      simulatorWidget: {
        title: `Interactive ${q.correct_answer.slice(0, 28)} Rate & Scaling Model`,
        variableLabel: 'Input Parameter Magnitude',
        unit: 'units',
        min: 10,
        max: 500,
        step: 10,
        defaultValue: 120,
        formulaDescription: 'Models proportional system output as input parameter scales.',
        multiplier: 1.65,
        outputLabel: 'Calculated System Response',
        outputUnit: 'units',
      },
      speakerNotes: `Present the core visual and key takeaways first. Then invite students to complete the interactive ${interactiveType} activity on "${q.correct_answer}".`,
      keyTakeaway: `${q.correct_answer}: ${explanationSentences[0] || q.explanation || ''}`,
    };
  });

  const initialDeck: PresentationDeck = {
    id: `deck-${Date.now()}`,
    title: quiz.quiz_title || 'Interactive Gamma Presentation',
    subtitle: quiz.summary || 'AI-Synthesized Interactive Presentation Deck',
    author: 'Gamma AI+ Studio',
    themeId,
    difficulty: quiz.difficulty || 'Intermediate',
    subjectOrExam: quiz.examFormat ? quiz.examFormat.toUpperCase() : 'Academic & Professional',
    createdAt: new Date().toISOString().split('T')[0],
    slides: baseSlides,
  };

  if (targetSlideCount && targetSlideCount > initialDeck.slides.length) {
    return expandPresentationDeckToTargetSlides(initialDeck, targetSlideCount);
  }
  return initialDeck;
}

const PEDAGOGICAL_EXPANSION_LENSES = [
  {
    kickerSuffix: 'Theoretical Foundations',
    titlePrefix: 'Core Principle & Axioms',
    layout: 'split-visual' as const,
    interactive: 'quiz' as const,
    focusNote: 'Establish the fundamental definitions, governing equations, and boundary conditions.',
  },
  {
    kickerSuffix: '4-Pillar Architecture',
    titlePrefix: 'Structural Breakdown',
    layout: 'bento-grid' as const,
    interactive: 'flashcards' as const,
    focusNote: 'Deconstruct the concept into four mutually exclusive, collectively exhaustive dimensions.',
  },
  {
    kickerSuffix: 'Step-by-Step Mechanism',
    titlePrefix: 'Chronological Process & Workflow',
    layout: 'timeline-process' as const,
    interactive: 'simulator' as const,
    focusNote: 'Trace the sequential stages from initial stimulus to final equilibrium state.',
  },
  {
    kickerSuffix: 'Quantitative Benchmarks',
    titlePrefix: 'Empirical Data & Scaling Laws',
    layout: 'data-chart' as const,
    interactive: 'poll' as const,
    focusNote: 'Analyze how changing variables alters system efficiency and measurable output.',
  },
  {
    kickerSuffix: 'Comparative Matrix',
    titlePrefix: 'Contrast & Boundary Cases',
    layout: 'comparison-table' as const,
    interactive: 'accordion' as const,
    focusNote: 'Contrast the primary mechanism against competing models and common misconceptions.',
  },
  {
    kickerSuffix: 'Worked Exam Walkthrough',
    titlePrefix: 'Chief Examiner M1/A1 Solution',
    layout: 'split-visual' as const,
    interactive: 'quiz' as const,
    focusNote: 'Walk through how method marks (M1) and accuracy marks (A1) are awarded in standardized exams.',
  },
];

/**
 * Expands any PresentationDeck up to `targetCount` slides (supports 100, 150, 200+ slides)
 * with structured, non-repetitive pedagogical modules so users can generate and export
 * 100+ slide PowerPoint (.PPTX) and Widescreen (.PDF) decks seamlessly.
 */
export function expandPresentationDeckToTargetSlides(
  deck: PresentationDeck,
  targetCount: number
): PresentationDeck {
  const clampedTarget = Math.max(1, Math.min(250, Math.round(targetCount)));
  if (deck.slides.length >= clampedTarget) {
    return {
      ...deck,
      slides: deck.slides.slice(0, clampedTarget).map((s, idx) => ({
        ...s,
        slideNumber: idx + 1,
      })),
    };
  }

  const seedSlides = deck.slides.length > 0 ? deck.slides : CURATED_PRESENTATION_TEMPLATES[0].slides;
  const expanded: PresentationSlide[] = [...seedSlides];

  while (expanded.length < clampedTarget) {
    const nextIdx = expanded.length;
    const seed = seedSlides[nextIdx % seedSlides.length];
    const lens = PEDAGOGICAL_EXPANSION_LENSES[nextIdx % PEDAGOGICAL_EXPANSION_LENSES.length];
    const moduleNum = Math.floor(nextIdx / seedSlides.length) + 1;
    const visual = resolveThematicVisual(`${deck.title} ${seed.title}`, nextIdx);

    const baseTitleClean = seed.title.replace(/^(Module \d+ · |Slide #\d+: )/i, '');
    const newSlide: PresentationSlide = {
      ...JSON.parse(JSON.stringify(seed)),
      id: `slide-${nextIdx + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      slideNumber: nextIdx + 1,
      layout: lens.layout,
      kicker: `Module ${moduleNum} · Slide ${nextIdx + 1} · ${lens.kickerSuffix}`,
      title: `${lens.titlePrefix}: ${baseTitleClean}`,
      subtitle: `${lens.focusNote} (${deck.title} — Section ${moduleNum}.${(nextIdx % seedSlides.length) + 1})`,
      imageUrl: visual.url,
      imageCaption: visual.caption,
      interactiveType: lens.interactive,
      bullets: [
        ...seed.bullets,
        `Module ${moduleNum} Analytical Extension: ${lens.focusNote}`,
      ].slice(0, 4),
      bentoItems: seed.bentoItems || [
        {
          title: 'Primary Mechanism',
          metricOrBadge: `M${moduleNum}.1`,
          description: seed.bullets[0] || lens.focusNote,
        },
        {
          title: 'Quantitative Rule',
          metricOrBadge: `M${moduleNum}.2`,
          description: seed.bullets[1] || 'Verify units, significant figures, and conservation laws.',
        },
        {
          title: 'Experimental Evidence',
          metricOrBadge: `M${moduleNum}.3`,
          description: seed.bullets[2] || 'Controlled observation confirms theoretical predictions.',
        },
        {
          title: 'Examiner Pitfall Check',
          metricOrBadge: `M${moduleNum}.4`,
          description: seed.keyTakeaway || 'Avoid conflating correlation with direct mechanistic causation.',
        },
      ],
      timelineSteps: seed.timelineSteps || [
        {
          step: `Step ${moduleNum}.1`,
          title: 'Initial Boundary Condition',
          detail: seed.bullets[0] || 'Define input state and governing parameters.',
        },
        {
          step: `Step ${moduleNum}.2`,
          title: 'Core Transformation',
          detail: seed.bullets[1] || lens.focusNote,
        },
        {
          step: `Step ${moduleNum}.3`,
          title: 'Verified Output & Application',
          detail: seed.keyTakeaway || 'Confirm result against exam marking scheme.',
        },
      ],
      chartData: seed.chartData || {
        chartTitle: `Module ${moduleNum} Performance & Mastery Distribution`,
        bars: [
          { label: 'Foundation Recall', value: 78 + (nextIdx % 15), unit: '%' },
          { label: 'Analytical Application', value: 84 + (nextIdx % 12), unit: '%' },
          { label: 'Exam Problem Synthesis', value: 89 + (nextIdx % 10), unit: '%' },
        ],
      },
      comparisonData: seed.comparisonData || {
        leftHeader: 'Standard Equilibrium State',
        rightHeader: 'Perturbed / High-Load State',
        rows: [
          {
            feature: 'Governing Principle',
            leftValue: seed.bullets[0] || 'Baseline rate law',
            rightValue: lens.focusNote,
          },
          {
            feature: 'Diagnostic Outcome',
            leftValue: 'Predictable linear response',
            rightValue: seed.keyTakeaway || 'Requires non-linear boundary correction',
          },
        ],
      },
      speakerNotes: `Slide ${nextIdx + 1} (${lens.kickerSuffix}): ${lens.focusNote} Walk students through the visual layout and launch the ${lens.interactive} activity.`,
    };

    expanded.push(newSlide);
  }

  return {
    ...deck,
    slides: expanded,
  };
}

