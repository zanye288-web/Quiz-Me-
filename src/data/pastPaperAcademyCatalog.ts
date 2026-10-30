import { ExamFormatId } from '../types/quiz';
import {
  AcademicResourceItem,
  PastPaperQuestionItem,
  TextbookChapterItem,
} from '../components/PastPapersHubView';

export type CheckpointTierClassification =
  | 'Primary Checkpoint (Stages 4–6 · Ages 8–11)'
  | 'Lower Secondary Checkpoint (Stages 7–9 · Ages 11–14)';

export interface SubjectFolderSpec {
  id: string;
  examFormat: ExamFormatId;
  checkpointTier?: CheckpointTierClassification;
  inceptionYear?: number;
  syllabusCode: string;
  subjectName: string;
  category: 'Mathematics & Computing' | 'Sciences' | 'Languages & Literature' | 'Humanities & Business';
  iconEmoji: string;
  sessions: string[];
  papersOffered: Array<{
    paperNumber: string;
    paperTitle: string;
    durationMinutes: number;
    totalMarks: number;
  }>;
  gradeThresholds: {
    distinction: string;
    credit: string;
    pass: string;
  };
  examinerInsights: string[];
  coreQuestions: PastPaperQuestionItem[];
  textbookTitle: string;
  textbookAuthor: string;
  textbookChapters: TextbookChapterItem[];
}

export const PAST_PAPER_ACADEMY_SUBJECTS: SubjectFolderSpec[] = [
  // ==================== 1. WAEC (WASSCE) SUBJECT FOLDERS ====================
  {
    id: 'waec-402-math',
    examFormat: 'waec',
    syllabusCode: 'WAEC 402',
    subjectName: 'General Mathematics',
    category: 'Mathematics & Computing',
    iconEmoji: '📐',
    sessions: [
      '2025 Specimen',
      '2024 May/June (School)',
      '2024 Nov/Dec (GCE)',
      '2023 May/June (School)',
      '2023 Nov/Dec (GCE)',
      '2022 May/June (School)',
      '2021 May/June (School)',
      '2020 May/June (School)',
    ],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Objective Test (50 Multiple Choice Questions)', durationMinutes: 90, totalMarks: 50 },
      { paperNumber: 'Paper 2', paperTitle: 'Essay / Structured Theory (Section A Compulsory & Section B)', durationMinutes: 150, totalMarks: 100 },
    ],
    gradeThresholds: { distinction: 'A1: 75%–100% | B2: 70%–74% | B3: 65%–69%', credit: 'C4: 60%–64% | C5: 55%–59% | C6: 50%–54%', pass: 'D7: 45%–49% | E8: 40%–44%' },
    examinerInsights: [
      'Candidates frequently lose method marks (M1) in Paper 2 by omitting intermediate algebraic steps in logarithm and surd equations.',
      'In Circle Theorems and Bearings, always draw a clear labeled sketch before applying the Sine or Cosine Rule.',
      'Ensure cumulative frequency curves (Ogives) are plotted at upper class boundaries, not class midpoints.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Paper 1 · Objective',
        marks: 2,
        question: 'Evaluate (0.0064)^(-1/2) leaving your answer in standard form.',
        options: ['1.25 × 10^1', '1.25 × 10^(-1)', '8.0 × 10^(-2)', '1.25 × 10^2'],
        answer: '1.25 × 10^1',
        markingSchemeNotes: '0.0064 = 64 × 10^(-4) [M1]. Power (-1/2) gives (8 × 10^(-2))^(-1) = 12.5 = 1.25 × 10^1 [A1].',
      },
      {
        number: 2,
        section: 'Paper 1 · Objective',
        marks: 2,
        question: 'If log_10(2x + 1) - log_10(3x - 2) = 1, find the value of x.',
        options: ['x = 3/4', 'x = 7/4', 'x = 4/3', 'x = 1/2'],
        answer: 'x = 3/4',
        markingSchemeNotes: 'log_10((2x + 1)/(3x - 2)) = 1 => (2x + 1)/(3x - 2) = 10 [M1] => 2x + 1 = 30x - 20 => 28x = 21 => x = 3/4 [A1].',
      },
      {
        number: 3,
        section: 'Paper 1 · Objective',
        marks: 2,
        question: 'A chord of length 24 cm is 5 cm from the center of a circle. Calculate the radius of the circle.',
        options: ['13 cm', '12 cm', '17 cm', '15 cm'],
        answer: '13 cm',
        markingSchemeNotes: 'Half-chord = 12 cm [M1]. By Pythagoras: r = √(12² + 5²) = √169 = 13 cm [A1].',
      },
      {
        number: 4,
        section: 'Paper 2 · Section A (Compulsory Theory)',
        marks: 8,
        question: 'In a class of 50 students, 30 offer Physics, 25 offer Chemistry, and 10 offer neither. Find the number of students who offer both subjects and the probability a random student offers Physics only.',
        options: [
          '15 offer both; P(Physics only) = 3/10',
          '10 offer both; P(Physics only) = 2/5',
          '5 offer both; P(Physics only) = 1/2',
          '15 offer both; P(Physics only) = 3/5',
        ],
        answer: '15 offer both; P(Physics only) = 3/10',
        markingSchemeNotes: 'n(P ∪ C) = 50 - 10 = 40 [M1]. (30 - x) + x + (25 - x) = 40 => x = 15 [A1]. Physics only = 15 => P = 15/50 = 3/10 [A1].',
      },
      {
        number: 5,
        section: 'Paper 2 · Section B (Theory)',
        marks: 12,
        question: 'The 3rd and 6th terms of a Geometric Progression (G.P.) are 18 and 486 respectively. Find the common ratio r and the first term a.',
        options: ['r = 3, a = 2', 'r = 2, a = 3', 'r = 3, a = 6', 'r = 4, a = 2'],
        answer: 'r = 3, a = 2',
        markingSchemeNotes: 'ar² = 18 and ar⁵ = 486 [M1]. Dividing gives r³ = 486/18 = 27 => r = 3 [A1]. Then a(3²) = 18 => a = 2 [A1].',
      },
    ],
    textbookTitle: 'New General Mathematics for Senior Secondary Schools (SS1–SS3 Complete)',
    textbookAuthor: 'M.F. Macrae, A.O. Kalejaiye, Z.I. Chima et al.',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Indices, Logarithms & Surds',
        summary: 'Complete treatment of laws of indices, standard form, logarithms to base 10, and rationalization of conjugate surds.',
        keyFormulasOrRules: [
          'a^m × a^n = a^(m+n) | a^m ÷ a^n = a^(m-n) | a^(-n) = 1/a^n',
          'log(AB) = log A + log B | log(A/B) = log A - log B | log(A^k) = k log A',
          'Conjugate surd identity: (a + √b)(a - √b) = a² - b',
        ],
        workedExample: {
          problem: 'Simplify √75 - √27 + √48',
          solution: '5√3 - 3√3 + 4√3 = 6√3.',
        },
        practicePrompt: 'WAEC Indices, Logarithms and Surds',
      },
      {
        chapterNumber: 2,
        title: 'Circle Theorems, Bearings & Mensuration',
        summary: 'Inscribed angles, cyclic quadrilaterals, alternate segment theorem, sine/cosine rules in 3-figure bearings, and frustum volumes.',
        keyFormulasOrRules: [
          'Angle at center = 2 × Angle at circumference',
          'Opposite angles of a cyclic quadrilateral sum to 180°',
          'Cosine Rule: a² = b² + c² - 2bc cos A | Sine Rule: a/sin A = b/sin B',
        ],
        workedExample: {
          problem: 'Find the area of a sector of radius 14 cm with central angle 90° (π = 22/7).',
          solution: 'Area = (90/360) × (22/7) × 14² = 154 cm².',
        },
        practicePrompt: 'WAEC Circle Theorems and Bearings',
      },
    ],
  },
  {
    id: 'waec-401-further-math',
    examFormat: 'waec',
    syllabusCode: 'WAEC 401',
    subjectName: 'Further Mathematics / Elective Maths',
    category: 'Mathematics & Computing',
    iconEmoji: '♾️',
    sessions: ['2024 May/June (School)', '2024 Nov/Dec (GCE)', '2023 May/June (School)', '2022 May/June (School)', '2021 May/June (School)'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Objective Test (40 Multiple Choice Questions)', durationMinutes: 90, totalMarks: 40 },
      { paperNumber: 'Paper 2', paperTitle: 'Essay (Pure Maths, Mechanics & Statistics & Vectors)', durationMinutes: 150, totalMarks: 100 },
    ],
    gradeThresholds: { distinction: 'A1: 75%+ | B2: 70%–74% | B3: 65%–69%', credit: 'C4–C6: 50%–64%', pass: 'D7–E8: 40%–49%' },
    examinerInsights: [
      'When resolving forces or vectors in Mechanics, clearly state horizontal (i) and vertical (j) components.',
      'In Binomial Theorem expansions, check the sign of alternating terms when the second term is negative.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Paper 1 · Pure Mathematics',
        marks: 2,
        question: 'Find the coefficient of x³ in the binomial expansion of (2 + x)⁵.',
        options: ['40', '80', '10', '20'],
        answer: '40',
        markingSchemeNotes: 'Term in x³ is 5C3 × (2)^(5-3) × x³ = 10 × 4 × x³ = 40x³ [M1, A1].',
      },
      {
        number: 2,
        section: 'Paper 2 · Vectors & Mechanics',
        marks: 8,
        question: 'Given vectors a = 3i - 4j and b = 2i + yj are perpendicular, find the value of scalar y.',
        options: ['y = 1.5 (or 3/2)', 'y = -1.5', 'y = 6', 'y = 2/3'],
        answer: 'y = 1.5 (or 3/2)',
        markingSchemeNotes: 'For perpendicular vectors, dot product a · b = 0 [M1] => 3(2) + (-4)(y) = 0 => 6 - 4y = 0 => y = 6/4 = 1.5 [A1].',
      },
    ],
    textbookTitle: 'Additional / Further Mathematics Project Series (Books 1–3)',
    textbookAuthor: 'Tuttuh-Adegun, Sivasubramaniam & Adegoke',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Polynomials, Partial Fractions & Binomial Theorem',
        summary: 'Remainder and Factor theorems, decomposition into partial fractions, and Pascal’s triangle / nCr expansions.',
        keyFormulasOrRules: [
          'Factor Theorem: If (x - a) is a factor of P(x), then P(a) = 0',
          '(a + b)^n = Σ (nCr) a^(n-r) b^r',
        ],
        workedExample: {
          problem: 'Find the remainder when f(x) = 2x³ - 3x² + 4x - 5 is divided by (x - 2).',
          solution: 'Remainder = f(2) = 2(8) - 3(4) + 4(2) - 5 = 16 - 12 + 8 - 5 = 7.',
        },
        practicePrompt: 'Further Mathematics Polynomials and Calculus',
      },
    ],
  },
  {
    id: 'waec-302-english',
    examFormat: 'waec',
    syllabusCode: 'WAEC 302',
    subjectName: 'English Language (Lexis, Essay & Oral)',
    category: 'Languages & Literature',
    iconEmoji: '📖',
    sessions: ['2024 May/June (School)', '2024 Nov/Dec (GCE)', '2023 May/June (School)', '2022 May/June (School)', '2021 May/June (School)', '2020 May/June (School)'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Objective: Lexis, Structure & Figurative Usage (80 Qs)', durationMinutes: 60, totalMarks: 80 },
      { paperNumber: 'Paper 2', paperTitle: 'Essay Writing, Comprehension & Summary Writing', durationMinutes: 120, totalMarks: 100 },
      { paperNumber: 'Paper 3', paperTitle: 'Test of Orals (Vowels, Consonants, Stress & Intonation)', durationMinutes: 45, totalMarks: 60 },
    ],
    gradeThresholds: { distinction: 'A1: 75%+ | B2–B3: 65%–74%', credit: 'C4–C6: 50%–64%', pass: 'D7–E8: 40%–49%' },
    examinerInsights: [
      'In Summary Writing, every answer must be written as a complete, concise sentence without lifting verbatim clauses from the passage.',
      'In Grammatical Names and Functions, identify both the exact phrase/clause type (e.g., Adverbial Clause of Condition) and its grammatical function.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Paper 1 · Lexis & Nearest in Meaning',
        marks: 1,
        question: 'Choose the option nearest in meaning to the word in italics: The manager’s *austere* lifestyle surprised his flamboyant colleagues.',
        options: ['Spartan and strict', 'Luxurious', 'Generous', 'Pretentious'],
        answer: 'Spartan and strict',
        markingSchemeNotes: '"Austere" means severe, strict, or unadorned/spartan in manner or lifestyle [A1].',
      },
      {
        number: 2,
        section: 'Paper 2 · Grammatical Name & Function',
        marks: 4,
        question: 'State the grammatical name and function of the italicized expression: "*When the bell rang*, the candidates submitted their scripts."',
        options: [
          'Adverbial clause of time; modifies the verb "submitted"',
          'Noun clause; object of the verb "submitted"',
          'Adjectival clause; qualifies the noun "candidates"',
          'Prepositional phrase; modifies "scripts"',
        ],
        answer: 'Adverbial clause of time; modifies the verb "submitted"',
        markingSchemeNotes: 'Grammatical Name: Adverbial clause of time [1 mark]. Function: It modifies the main verb "submitted" [1 mark].',
      },
    ],
    textbookTitle: 'Countdown to WASSCE/NECO English Language & Oral English Mastery',
    textbookAuthor: 'O. Ogunsanwo & Sam Onuigbo',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Grammatical Names, Clauses & Summary Writing Rules',
        summary: 'Distinguishing Noun Clauses, Relative/Adjectival Clauses, and Adverbial Clauses, plus the 5 penalties to avoid in WASSCE Summary.',
        keyFormulasOrRules: [
          'Noun Clause: Answers "What?" or "Who?" (functions as Subject, Object, or Complement)',
          'Adjectival Clause: Introduced by who, whom, whose, which, that — qualifies a preceding noun antecedent',
          'Adverbial Clause: Modifies a verb, adjective, or adverb (Time, Condition, Concession, Purpose, Manner)',
        ],
        workedExample: {
          problem: 'Identify the clause: "The book *that I bought yesterday* is missing."',
          solution: 'Adjectival (Relative) Clause qualifying the noun "book".',
        },
        practicePrompt: 'WAEC English Clauses, Lexis and Summary',
      },
    ],
  },
  {
    id: 'waec-512-physics',
    examFormat: 'waec',
    syllabusCode: 'WAEC 512',
    subjectName: 'Physics',
    category: 'Sciences',
    iconEmoji: '⚡',
    sessions: ['2025 Specimen', '2024 May/June (School)', '2024 Nov/Dec (GCE)', '2023 May/June (School)', '2022 May/June (School)', '2021 May/June (School)'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Objective Test (50 Multiple Choice Questions)', durationMinutes: 75, totalMarks: 50 },
      { paperNumber: 'Paper 2', paperTitle: 'Structured Theory & Essay (Part I & Part II)', durationMinutes: 90, totalMarks: 60 },
      { paperNumber: 'Paper 3', paperTitle: 'Practical / Alternative to Practical Work', durationMinutes: 165, totalMarks: 50 },
    ],
    gradeThresholds: { distinction: 'A1: 75%+ | B2–B3: 65%–74%', credit: 'C4–C6: 50%–64%', pass: 'D7–E8: 40%–49%' },
    examinerInsights: [
      'Always state SI units alongside numerical answers; an answer without a unit loses the accuracy mark (A1).',
      'In Paper 3 (Practical), record all table readings to consistent decimal places and draw the line of best fit spanning at least 75% of the graph grid.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Paper 1 · Mechanics',
        marks: 2,
        question: 'A body of mass 4 kg is accelerated uniformly from 10 m/s to 25 m/s in 5 seconds. Calculate the net force acting on the body.',
        options: ['12 N', '15 N', '20 N', '60 N'],
        answer: '12 N',
        markingSchemeNotes: 'a = (v - u)/t = (25 - 10)/5 = 3 m/s² [M1]. F = ma = 4 × 3 = 12 N [A1].',
      },
      {
        number: 2,
        section: 'Paper 2 · Electricity',
        marks: 6,
        question: 'Three resistors of resistance 2 Ω, 3 Ω, and 6 Ω are connected in parallel across a 12 V battery. Calculate the equivalent resistance and total current drawn.',
        options: ['R_eq = 1.0 Ω; I = 12.0 A', 'R_eq = 11.0 Ω; I = 1.09 A', 'R_eq = 2.0 Ω; I = 6.0 A', 'R_eq = 0.5 Ω; I = 24.0 A'],
        answer: 'R_eq = 1.0 Ω; I = 12.0 A',
        markingSchemeNotes: '1/R_eq = 1/2 + 1/3 + 1/6 = 6/6 = 1 => R_eq = 1.0 Ω [M1]. Total current I = V / R_eq = 12 / 1.0 = 12.0 A [A1].',
      },
    ],
    textbookTitle: 'New School Physics for Senior Secondary Schools',
    textbookAuthor: 'Prof. M.W. Anyakoha',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Mechanics: Projectile Motion, Equilibrium & Machines',
        summary: 'Horizontal/vertical projectile components, principle of moments, mechanical advantage, velocity ratio, and efficiency.',
        keyFormulasOrRules: [
          'Time of Flight T = (2u sinθ)/g | Max Height H = (u² sin²θ)/(2g) | Range R = (u² sin 2θ)/g',
          'Principle of Moments: Sum of Clockwise Moments = Sum of Anticlockwise Moments',
        ],
        workedExample: {
          problem: 'Find the maximum range of a projectile fired at 20 m/s (g = 10 m/s²).',
          solution: 'Max range occurs at θ = 45°: R_max = u²/g = 400/10 = 40 m.',
        },
        practicePrompt: 'WAEC Physics Projectiles and Mechanics',
      },
    ],
  },
  {
    id: 'waec-505-chemistry',
    examFormat: 'waec',
    syllabusCode: 'WAEC 505',
    subjectName: 'Chemistry',
    category: 'Sciences',
    iconEmoji: '🧪',
    sessions: ['2024 May/June (School)', '2024 Nov/Dec (GCE)', '2023 May/June (School)', '2022 May/June (School)', '2021 May/June (School)'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Objective Test (50 Multiple Choice Questions)', durationMinutes: 60, totalMarks: 50 },
      { paperNumber: 'Paper 2', paperTitle: 'Essay / Structured Theory', durationMinutes: 120, totalMarks: 100 },
      { paperNumber: 'Paper 3', paperTitle: 'Practical (Volumetric Titration & Qualitative Salt Analysis)', durationMinutes: 120, totalMarks: 50 },
    ],
    gradeThresholds: { distinction: 'A1: 75%+ | B2–B3: 65%–74%', credit: 'C4–C6: 50%–64%', pass: 'D7–E8: 40%–49%' },
    examinerInsights: [
      'Write balanced chemical equations with correct state symbols: (s), (l), (g), (aq).',
      'In Volumetric Analysis (Paper 3), burette readings must be recorded to two decimal places (e.g., 24.50 cm³), and concordant titre values must agree within ±0.20 cm³.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Paper 1 · Stoichiometry & Gas Laws',
        marks: 2,
        question: 'What volume of oxygen at s.t.p. is required to completely burn 100 cm³ of methane (CH4 + 2O2 → CO2 + 2H2O)?',
        options: ['200 cm³', '100 cm³', '300 cm³', '50 cm³'],
        answer: '200 cm³',
        markingSchemeNotes: 'By Gay-Lussac’s law of combining volumes, 1 volume of CH4 reacts with 2 volumes of O2 => 2 × 100 = 200 cm³ [M1, A1].',
      },
      {
        number: 2,
        section: 'Paper 2 · Electrochemistry',
        marks: 8,
        question: 'Calculate the mass of silver deposited when a current of 2.5 A is passed through aqueous AgNO3 for 32 minutes 10 seconds (Ag = 108, 1 F = 96,500 C).',
        options: ['5.40 g', '2.70 g', '10.80 g', '1.08 g'],
        answer: '5.40 g',
        markingSchemeNotes: 'Time t = 32 × 60 + 10 = 1930 s [M1]. Q = It = 2.5 × 1930 = 4825 C [M1]. Mass = (4825 × 108) / 96500 = 5.40 g [A1].',
      },
    ],
    textbookTitle: 'Essential Chemistry for Senior Secondary Schools',
    textbookAuthor: 'I.A. Odesina (Tonad Publishers)',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Quantitative Stoichiometry, Titration & Faraday’s Laws',
        summary: 'Molar concentration formulas, acid-base titration stoichiometry (C_A V_A / C_B V_B = n_A / n_B), and Faraday’s laws of electrolysis.',
        keyFormulasOrRules: [
          'C_A V_A / C_B V_B = n_A / n_B',
          'Mass Concentration (g/dm³) = Molar Concentration (mol/dm³) × Molar Mass (g/mol)',
          'Q = I × t | Moles of electrons = Q / 96,500',
        ],
        workedExample: {
          problem: '25.0 cm³ of 0.10 mol/dm³ NaOH neutralized 20.0 cm³ of H2SO4. Find the concentration of the acid.',
          solution: '2NaOH + H2SO4 → Na2SO4 + 2H2O (n_A/n_B = 1/2). C_A = (0.10 × 25.0) / (2 × 20.0) = 0.0625 mol/dm³.',
        },
        practicePrompt: 'WAEC Chemistry Titration and Electrolysis',
      },
    ],
  },
  {
    id: 'waec-504-biology',
    examFormat: 'waec',
    syllabusCode: 'WAEC 504',
    subjectName: 'Biology',
    category: 'Sciences',
    iconEmoji: '🧬',
    sessions: ['2024 May/June (School)', '2024 Nov/Dec (GCE)', '2023 May/June (School)', '2022 May/June (School)', '2021 May/June (School)'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Objective Test (50 Multiple Choice Questions)', durationMinutes: 50, totalMarks: 50 },
      { paperNumber: 'Paper 2', paperTitle: 'Essay & Structured Questions', durationMinutes: 100, totalMarks: 70 },
      { paperNumber: 'Paper 3', paperTitle: 'Practical / Biological Drawings & Specimens', durationMinutes: 120, totalMarks: 60 },
    ],
    gradeThresholds: { distinction: 'A1: 75%+ | B2–B3: 65%–74%', credit: 'C4–C6: 50%–64%', pass: 'D7–E8: 40%–49%' },
    examinerInsights: [
      'Biological diagrams in Paper 2 and Paper 3 must have a title, magnification (e.g., ×2), single continuous outlines (no shading), and horizontal guideline labels.',
      'Spell scientific binomial names correctly with Genus capitalized and species lowercase (underlined when handwritten).',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Paper 1 · Genetics & Heredity',
        marks: 2,
        question: 'In a monohybrid cross between two heterozygous tall pea plants (Tt × Tt), what is the phenotypic ratio of tall to dwarf offspring?',
        options: ['3 : 1', '1 : 2 : 1', '1 : 1', '9 : 3 : 3 : 1'],
        answer: '3 : 1',
        markingSchemeNotes: 'Genotypes: 1 TT : 2 Tt : 1 tt. Since T (tall) is dominant, 3 are phenotypically tall and 1 is dwarf => 3 : 1 [A1].',
      },
    ],
    textbookTitle: 'Modern Biology for Senior Secondary Schools',
    textbookAuthor: 'S.T. Ramalingam (Africana First Publishers)',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Cell Structure, Osmosis, Photosynthesis & Mendelian Genetics',
        summary: 'Eukaryotic vs prokaryotic organelles, plasmolysis/turgidity, light and dark stages of photosynthesis, and Punnett square crosses.',
        keyFormulasOrRules: [
          'Magnification = Length of Drawing / Actual Length of Specimen',
          'Photosynthesis: 6CO2 + 6H2O —(Light/Chlorophyll)→ C6H12O6 + 6O2',
          'Dihybrid heterozygous cross phenotypic ratio = 9 : 3 : 3 : 1',
        ],
        workedExample: {
          problem: 'A specimen of actual length 4 cm is drawn 10 cm long. Calculate the magnification.',
          solution: 'Magnification = 10 cm / 4 cm = ×2.5.',
        },
        practicePrompt: 'WAEC Biology Genetics and Cell Physiology',
      },
    ],
  },
  {
    id: 'waec-203-economics',
    examFormat: 'waec',
    syllabusCode: 'WAEC 203',
    subjectName: 'Economics',
    category: 'Humanities & Business',
    iconEmoji: '📈',
    sessions: ['2024 May/June (School)', '2023 May/June (School)', '2022 May/June (School)', '2021 May/June (School)'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Objective Test (50 Multiple Choice Questions)', durationMinutes: 60, totalMarks: 50 },
      { paperNumber: 'Paper 2', paperTitle: 'Section A (Data Response / Quantitative) & Section B (Essay)', durationMinutes: 120, totalMarks: 80 },
    ],
    gradeThresholds: { distinction: 'A1–B3: 65%+', credit: 'C4–C6: 50%–64%', pass: 'D7–E8: 40%–49%' },
    examinerInsights: [
      'Section A Question 1 (Data Response / Mathematical Economics) is compulsory; practice elasticity, cost tables (TC, AC, MC), and national income multipliers.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Paper 2 · Section A (Data Response)',
        marks: 10,
        question: 'When the price of a commodity rises from $10 to $12, quantity demanded falls from 100 units to 70 units. Calculate the price elasticity of demand (PED).',
        options: ['1.5 (Elastic)', '0.67 (Inelastic)', '1.0 (Unitary)', '2.0 (Elastic)'],
        answer: '1.5 (Elastic)',
        markingSchemeNotes: '%ΔQd = (-30/100)×100 = -30%. %ΔP = (2/10)×100 = 20% [M1]. |PED| = 30% / 20% = 1.5 (> 1, Elastic) [A1].',
      },
    ],
    textbookTitle: 'Comprehensive Economics for Senior Secondary Schools',
    textbookAuthor: 'J.U. Anyaele / O.A. Lawal',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Price Elasticity, Theory of Cost & National Income Accounting',
        summary: 'Elasticity coefficients, Total/Average/Marginal Cost schedules, and GDP/GNP/NNP expenditure and income methods.',
        keyFormulasOrRules: [
          'PED = (% Change in Quantity Demanded) / (% Change in Price)',
          'Total Cost (TC) = Total Fixed Cost (TFC) + Total Variable Cost (TVC) | MC = ΔTC / ΔQ',
          'Multiplier k = 1 / (1 - MPC) = 1 / MPS',
        ],
        workedExample: {
          problem: 'If the Marginal Propensity to Consume (MPC) is 0.8, calculate the National Income Multiplier.',
          solution: 'k = 1 / (1 - 0.8) = 1 / 0.2 = 5.',
        },
        practicePrompt: 'WAEC Economics Elasticity and National Income',
      },
    ],
  },

  // ==================== 2. JAMB (UTME CBT) SUBJECT FOLDERS ====================
  {
    id: 'jamb-eng-use-of-english',
    examFormat: 'jamb',
    syllabusCode: 'UTME-ENG',
    subjectName: 'Use of English (Compulsory CBT)',
    category: 'Languages & Literature',
    iconEmoji: '🦅',
    sessions: ['2024 UTME CBT', '2023 UTME CBT', '2022 UTME CBT', '2021 UTME CBT', '2020 UTME CBT', '2019 UTME CBT'],
    papersOffered: [
      { paperNumber: 'CBT Paper', paperTitle: 'Comprehension, Cloze Register, Lexis, Structure & Oral Forms (60 Qs)', durationMinutes: 40, totalMarks: 100 },
    ],
    gradeThresholds: { distinction: '75–100 / 100', credit: '55–74 / 100', pass: '45–54 / 100' },
    examinerInsights: [
      'Use of English is compulsory for all UTME candidates and carries the highest weight in the 400 aggregate.',
      'Pay close attention to Concord rules, phrasal verbs, idiomatic expressions, and emphatic stress (the option that contradicts the capitalized word is correct).',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Emphatic Stress · Oral Forms',
        marks: 2,
        question: 'My mother bought a NEW car yesterday. (Choose the question to which the sentence is the appropriate answer.)',
        options: [
          'Did your mother buy an old car yesterday?',
          'Did your father buy a new car yesterday?',
          'Did your mother rent a new car yesterday?',
          'Did your mother buy a new car last week?',
        ],
        answer: 'Did your mother buy an old car yesterday?',
        markingSchemeNotes: 'In JAMB Emphatic Stress, the correct interrogative option must interrogate/contradict the CAPITALIZED word ("NEW" vs "old") while keeping all other words constant.',
      },
      {
        number: 2,
        section: 'Lexis & Structure · Concord',
        marks: 2,
        question: 'Neither the teacher nor the students _____ present at the assembly.',
        options: ['were', 'was', 'is', 'has been'],
        answer: 'were',
        markingSchemeNotes: 'Rule of Proximity Concord: With "neither...nor", the verb agrees in number with the nearer subject ("the students" = plural -> "were").',
      },
    ],
    textbookTitle: 'The Invisible Teacher & JAMB Remix Use of English',
    textbookAuthor: 'Dele Ashade / O.O. Bamgbose',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Emphatic Stress, Rhymes & 24 Laws of English Concord',
        summary: 'Complete mastery of JAMB Oral English stress rules and grammatical concord patterns.',
        keyFormulasOrRules: [
          'Emphatic Stress Rule: Select the question that changes ONLY the word written in CAPITAL letters.',
          'Each / Every / Nobody / Somebody + Singular Verb (e.g., Everyone has arrived).',
          '"One of the + Plural Noun + Singular Verb" (e.g., One of the boys is here).',
        ],
        workedExample: {
          problem: 'Many a candidate _____ (fail / fails) to read instructions carefully.',
          solution: '"Many a + singular noun" always takes a singular verb: "fails".',
        },
        practicePrompt: 'JAMB Use of English Concord and Oral Stress',
      },
    ],
  },
  {
    id: 'jamb-mth-mathematics',
    examFormat: 'jamb',
    syllabusCode: 'UTME-MTH',
    subjectName: 'JAMB Mathematics (CBT)',
    category: 'Mathematics & Computing',
    iconEmoji: '🔢',
    sessions: ['2024 UTME CBT', '2023 UTME CBT', '2022 UTME CBT', '2021 UTME CBT', '2020 UTME CBT'],
    papersOffered: [
      { paperNumber: 'CBT Paper', paperTitle: '40 High-Speed Multiple Choice Questions (Algebra, Calculus, Matrices, Trig & Stats)', durationMinutes: 30, totalMarks: 100 },
    ],
    gradeThresholds: { distinction: '75–100 / 100', credit: '55–74 / 100', pass: '45–54 / 100' },
    examinerInsights: [
      'JAMB Mathematics heavily tests 2×2 & 3×3 Determinants, Differentiation (maxima/minima), Integration, Binary Operations, and Permutation & Combination.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Matrices & Determinants',
        marks: 2.5,
        question: 'If the determinant of the 2×2 matrix [[2x, 3], [4, 6]] is equal to 12, find the value of x.',
        options: ['x = 2', 'x = 1', 'x = 3', 'x = 4'],
        answer: 'x = 2',
        markingSchemeNotes: 'det = (2x)(6) - (3)(4) = 12x - 12 = 12 => 12x = 24 => x = 2.',
      },
      {
        number: 2,
        section: 'Differential & Integral Calculus',
        marks: 2.5,
        question: 'Evaluate the definite integral ∫₀² (3x² + 2x) dx.',
        options: ['12', '8', '10', '16'],
        answer: '12',
        markingSchemeNotes: 'Antiderivative = [x³ + x²]₀² = (2³ + 2²) - 0 = 8 + 4 = 12.',
      },
    ],
    textbookTitle: 'Lamlad’s UTME Mathematics & JAMB Remix Mathematics',
    textbookAuthor: 'Prof. S.O. Ajala et al.',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Matrices, Binary Operations, Permutations & Calculus Shortcuts',
        summary: 'Fast CBT techniques for 2×2 inverses, cyclic permutations, and power-rule calculus.',
        keyFormulasOrRules: [
          'det [[a, b], [c, d]] = ad - bc',
          'nPr = n! / (n - r)!  |  nCr = n! / [(n - r)! r!]',
          '∫ x^n dx = x^(n+1)/(n+1) + C',
        ],
        workedExample: {
          problem: 'In how many ways can the letters of the word "LEADER" be arranged?',
          solution: '6 letters with "E" repeated twice: 6! / 2! = 720 / 2 = 360 ways.',
        },
        practicePrompt: 'JAMB Mathematics Matrices, Permutations and Calculus',
      },
    ],
  },
  {
    id: 'jamb-phy-chm-bio',
    examFormat: 'jamb',
    syllabusCode: 'UTME-SCI',
    subjectName: 'JAMB Physics, Chemistry & Biology Pack',
    category: 'Sciences',
    iconEmoji: '🔬',
    sessions: ['2024 UTME CBT', '2023 UTME CBT', '2022 UTME CBT', '2021 UTME CBT', '2020 UTME CBT'],
    papersOffered: [
      { paperNumber: 'Physics CBT', paperTitle: '40 Questions (Mechanics, Optics, Electricity & Modern Physics)', durationMinutes: 30, totalMarks: 100 },
      { paperNumber: 'Chemistry CBT', paperTitle: '40 Questions (Organic, Physical & Inorganic Chemistry)', durationMinutes: 30, totalMarks: 100 },
      { paperNumber: 'Biology CBT', paperTitle: '40 Questions (Taxonomy, Physiology, Ecology & Genetics)', durationMinutes: 25, totalMarks: 100 },
    ],
    gradeThresholds: { distinction: '75–100 / 100', credit: '55–74 / 100', pass: '45–54 / 100' },
    examinerInsights: [
      'Memorize IUPAC nomenclature rules, homologous functional groups, and lens/mirror sign conventions (1/f = 1/u + 1/v).',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'JAMB Physics · Optics',
        marks: 2.5,
        question: 'An object is placed 15 cm in front of a converging lens of focal length 10 cm. Calculate the image distance.',
        options: ['30 cm', '6 cm', '25 cm', '15 cm'],
        answer: '30 cm',
        markingSchemeNotes: '1/v = 1/f - 1/u = 1/10 - 1/15 = (3 - 2)/30 = 1/30 => v = 30 cm.',
      },
      {
        number: 2,
        section: 'JAMB Chemistry · Organic',
        marks: 2.5,
        question: 'Which reagent can be used to distinguish between ethene (an alkene) and ethyne (an alkyne)?',
        options: ['Ammoniacal silver(I) nitrate (Tollens’ reagent)', 'Bromine water', 'Acidified KMnO4', 'Limewater'],
        answer: 'Ammoniacal silver(I) nitrate (Tollens’ reagent)',
        markingSchemeNotes: 'Both decolorize bromine water and KMnO4, but only terminal alkynes (ethyne) form a white precipitate with ammoniacal AgNO3.',
      },
    ],
    textbookTitle: 'Lamlad’s SSCE & UTME Physics, Chemistry & Biology Compendium',
    textbookAuthor: 'Lamlad Academic Publications',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'High-Yield UTME Optics, Electrostatics & Organic Functional Groups',
        summary: 'Mirror/lens formulas, capacitor networks, and distinguishing tests for hydrocarbons and alkanols.',
        keyFormulasOrRules: [
          'Lens/Mirror Equation: 1/f = 1/u + 1/v  |  Magnification M = v/u',
          'Capacitors in Parallel: C_eq = C1 + C2  |  Series: 1/C_eq = 1/C1 + 1/C2',
          'Lucas Test distinguishes Primary, Secondary, and Tertiary Alkanols',
        ],
        workedExample: {
          problem: 'Find the effective capacitance of two 6 μF capacitors connected in series.',
          solution: 'C_eq = (6 × 6)/(6 + 6) = 36/12 = 3 μF.',
        },
        practicePrompt: 'JAMB Physics Optics and Organic Chemistry Tests',
      },
    ],
  },

  // ==================== 3. CAMBRIDGE IGCSE SUBJECT FOLDERS ====================
  {
    id: 'igcse-0580-math',
    examFormat: 'igcse',
    syllabusCode: 'IGCSE 0580',
    subjectName: 'Cambridge IGCSE Mathematics (0580 Core & Extended)',
    category: 'Mathematics & Computing',
    iconEmoji: '🌍',
    sessions: ['2025 Specimen', '2024 May/June (s24)', '2024 Oct/Nov (w24)', '2024 Feb/March (m24)', '2023 May/June (s23)', '2023 Oct/Nov (w23)', '2022 May/June (s22)'],
    papersOffered: [
      { paperNumber: 'Paper 2 (21/22/23)', paperTitle: 'Extended Short-Answer Paper', durationMinutes: 90, totalMarks: 70 },
      { paperNumber: 'Paper 4 (41/42/43)', paperTitle: 'Extended Structured Questions Paper', durationMinutes: 150, totalMarks: 130 },
    ],
    gradeThresholds: { distinction: 'A*: 84% | A: 72% | B: 58%', credit: 'C: 45% | D: 36%', pass: 'E: 28%' },
    examinerInsights: [
      'Give non-exact numerical answers correct to 3 significant figures, or 1 decimal place for angles in degrees, unless a different accuracy is specified.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Paper 42 · Functions & Calculus',
        marks: 4,
        question: 'Functions f and g are defined by f(x) = 3x - 2 and g(x) = x² + 1. Find fg(2) and the inverse function f⁻¹(x).',
        options: ['fg(2) = 13; f⁻¹(x) = (x + 2)/3', 'fg(2) = 17; f⁻¹(x) = (x - 2)/3', 'fg(2) = 13; f⁻¹(x) = 3x + 2', 'fg(2) = 11; f⁻¹(x) = (x + 3)/2'],
        answer: 'fg(2) = 13; f⁻¹(x) = (x + 2)/3',
        markingSchemeNotes: 'g(2) = 5 [M1]; f(5) = 13 [A1]. Inverse: x = (y + 2)/3 [M1, A1].',
      },
      {
        number: 2,
        section: 'Paper 22 · Upper & Lower Bounds',
        marks: 3,
        question: 'The length of a rectangle is 12 cm correct to the nearest cm, and its width is 8 cm correct to the nearest cm. Calculate the upper bound of its perimeter.',
        options: ['42 cm', '41 cm', '40.5 cm', '44 cm'],
        answer: '42 cm',
        markingSchemeNotes: 'Upper bound length = 12.5 cm, upper bound width = 8.5 cm [B1]. Perimeter UB = 2(12.5 + 8.5) = 42 cm [M1, A1].',
      },
    ],
    textbookTitle: 'Cambridge IGCSE Mathematics Core and Extended Coursebook (3rd Edition)',
    textbookAuthor: 'Karen Morrison & Nick Hamshaw (Cambridge University Press)',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Bounds of Accuracy, Composite Functions & Differentiation',
        summary: 'Upper/lower bounds in calculations, composite/inverse function algebra, and stationary points via dy/dx = 0.',
        keyFormulasOrRules: [
          'Upper Bound of A / B = UB(A) / LB(B)',
          'Composite fg(x) = f(g(x)) — apply inner function g first',
          'Stationary points occur where gradient dy/dx = 0',
        ],
        workedExample: {
          problem: 'Find the coordinates of the turning point of y = x² - 6x + 11.',
          solution: 'dy/dx = 2x - 6 = 0 => x = 3. At x = 3, y = 9 - 18 + 11 = 2. Turning point is (3, 2).',
        },
        practicePrompt: 'IGCSE 0580 Extended Functions, Bounds and Calculus',
      },
    ],
  },
  {
    id: 'igcse-0625-0620-0610-sciences',
    examFormat: 'igcse',
    syllabusCode: 'IGCSE 0625 / 0620 / 0610',
    subjectName: 'Cambridge IGCSE Physics (0625), Chemistry (0620) & Biology (0610)',
    category: 'Sciences',
    iconEmoji: '⚛️',
    sessions: ['2024 May/June (s24)', '2024 Oct/Nov (w24)', '2024 Feb/March (m24)', '2023 May/June (s23)', '2023 Oct/Nov (w23)', '2022 May/June (s22)'],
    papersOffered: [
      { paperNumber: 'Paper 2 (21/22/23)', paperTitle: 'Extended Multiple Choice (40 Questions)', durationMinutes: 45, totalMarks: 40 },
      { paperNumber: 'Paper 4 (41/42/43)', paperTitle: 'Extended Theory (Structured Questions)', durationMinutes: 75, totalMarks: 80 },
      { paperNumber: 'Paper 6 (61/62/63)', paperTitle: 'Alternative to Practical', durationMinutes: 60, totalMarks: 40 },
    ],
    gradeThresholds: { distinction: 'A*: 78% | A: 66% | B: 54%', credit: 'C: 42% | D: 34%', pass: 'E: 26%' },
    examinerInsights: [
      'In Paper 6 (Alternative to Practical), always state independent, dependent, and almeno two controlled variables when planning an investigation.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'IGCSE Physics 0625 · Paper 42',
        marks: 3,
        question: 'A transformer has 800 turns on its primary coil and 40 turns on its secondary coil. If the primary voltage is 240 V a.c., calculate the secondary output voltage.',
        options: ['12 V', '4800 V', '24 V', '6 V'],
        answer: '12 V',
        markingSchemeNotes: 'V_s / V_p = N_s / N_p [M1] => V_s = 240 × (40 / 800) = 12 V [A1].',
      },
    ],
    textbookTitle: 'Cambridge IGCSE Physics, Chemistry & Biology Coursebooks',
    textbookAuthor: 'David Sang, Richard Harwood & Mary Jones (CUP)',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Electromagnetic Induction, Mole Stoichiometry & Enzyme Kinetics',
        summary: 'Step-up/step-down transformer equations, empirical/molecular formulas, and active-site denaturation curves.',
        keyFormulasOrRules: [
          'V_p / V_s = N_p / N_s  |  For 100% efficient transformer: I_p V_p = I_s V_s',
          'Moles = Mass / Molar Mass = Volume of Gas (dm³) / 24 (at r.t.p.)',
        ],
        workedExample: {
          problem: 'Calculate the volume occupied by 0.25 mol of carbon dioxide gas at r.t.p.',
          solution: 'Volume = 0.25 mol × 24 dm³/mol = 6.0 dm³.',
        },
        practicePrompt: 'IGCSE Sciences Physics, Chemistry and Biology Paper 4',
      },
    ],
  },

  // ==================== 4A. CAMBRIDGE LOWER SECONDARY CHECKPOINT (STAGES 7–9 · AGES 11–14 · 1999–2026) ====================
  {
    id: 'checkpoint-lowersec-0862-math',
    examFormat: 'checkpoint',
    checkpointTier: 'Lower Secondary Checkpoint (Stages 7–9 · Ages 11–14)',
    inceptionYear: 1999,
    syllabusCode: 'CIE 0862 (Legacy 1112)',
    subjectName: 'Cambridge Lower Secondary Checkpoint Mathematics (Stages 7–9)',
    category: 'Mathematics & Computing',
    iconEmoji: '📐',
    sessions: ['2026 Specimen & Oct/Apr', '2025 October Series', '2025 April Series', '2024 October Series', '2024 April Series', '2023 October Series', '2023 April Series', '2022 October Series'],
    papersOffered: [
      { paperNumber: 'Paper 1 (Non-Calculator)', paperTitle: 'Written Structured Paper 1 — Number, Algebra, Geometry & Measure (No Calculator)', durationMinutes: 60, totalMarks: 50 },
      { paperNumber: 'Paper 2 (Calculator)', paperTitle: 'Written Structured Paper 2 — Problem Solving, Sequences, Functions & Statistics (Calculator Allowed)', durationMinutes: 60, totalMarks: 50 },
    ],
    gradeThresholds: { distinction: 'Band 5.0–6.0 (Outstanding — 40–50 / 50 Marks)', credit: 'Band 3.0–4.9 (Solid Mastery — 26–39 / 50 Marks)', pass: 'Band 2.0–2.9 (Developing — 18–25 / 50 Marks)' },
    examinerInsights: [
      'Lower Secondary 0862 Paper 1 strictly prohibits calculators: show full fraction conversion steps (improper fractions and common denominators) to secure the M1 method mark.',
      'On grid/coordinate geometry questions, use a sharp HB pencil and ruler to plot straight-line graphs y = mx + c and enlargements.',
      'Always write your final simplified expression or numerical value on the dotted answer line provided at the bottom-right of each question box.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Paper 1 (Non-Calculator) · Number & Fractions',
        marks: 2,
        question: 'Work out the value of 3/4 ÷ 9/16. Give your answer as a fraction in its simplest form.',
        options: ['4/3 (or 1 1/3)', '27/64', '3/4', '9/12'],
        answer: '4/3 (or 1 1/3)',
        markingSchemeNotes: 'Award [M1] for multiplying by the reciprocal: 3/4 × 16/9 = 48/36. Award [A1] for simplifying fully to 4/3 or 1 1/3.',
      },
      {
        number: 2,
        section: 'Paper 1 (Non-Calculator) · Algebraic Sequences',
        marks: 3,
        question: 'The nth term of a sequence is given by T_n = 4n - 7. Work out the sum of the 5th term and the 10th term. Show your working.',
        options: ['46', '53', '60', '39'],
        answer: '46',
        markingSchemeNotes: 'Award [B1] for 5th term = 4(5) - 7 = 13. Award [B1] for 10th term = 4(10) - 7 = 33. Award [A1] for 13 + 33 = 46 on the answer line.',
      },
      {
        number: 3,
        section: 'Paper 2 (Calculator) · Interior Angles of Polygons',
        marks: 3,
        question: 'A regular polygon has an exterior angle of 24°. Calculate the number of sides of the polygon and the sum of its interior angles.',
        options: ['15 sides; 2340°', '12 sides; 1800°', '15 sides; 2700°', '18 sides; 2880°'],
        answer: '15 sides; 2340°',
        markingSchemeNotes: 'Number of sides n = 360° ÷ 24° = 15 sides [M1, A1]. Sum of interior angles = (15 - 2) × 180° = 13 × 180° = 2340° [B1].',
      },
      {
        number: 4,
        section: 'Paper 2 (Calculator) · Ratio, Percentage & Simultaneous Equations',
        marks: 4,
        question: 'Solve the simultaneous equations: 3x + 2y = 19 and 5x - 2y = 21. Show all your algebraic working.',
        options: ['x = 5, y = 2', 'x = 4, y = 3.5', 'x = 5, y = -2', 'x = 6, y = 0.5'],
        answer: 'x = 5, y = 2',
        markingSchemeNotes: 'Add equations to eliminate y: 8x = 40 [M1] => x = 5 [A1]. Substitute x = 5 into 3(5) + 2y = 19 => 2y = 4 => y = 2 [M1, A1].',
      },
    ],
    textbookTitle: 'Cambridge Lower Secondary Complete Mathematics Stage 7, 8 & 9 Student Coursebook (0862)',
    textbookAuthor: 'Deborah Barton (Oxford University Press) & Byrd, Byrd & Pearce (CUP)',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Stage 7–9 Laws of Indices, Linear & Quadratic Sequences, and Simultaneous Equations',
        summary: 'Mastery of non-calculator fraction/surd manipulation, nth term rules, linear graphs y = mx + c, and polygon geometry.',
        keyFormulasOrRules: [
          'nth term of arithmetic sequence: T_n = a + (n - 1)d',
          'Sum of interior angles of an n-sided polygon = (n - 2) × 180° | Exterior angle of regular polygon = 360° / n',
          'Gradient m = (y₂ - y₁) / (x₂ - x₁) | Pythagoras Theorem: a² + b² = c²',
        ],
        workedExample: {
          problem: 'Find the nth term of the sequence: 7, 11, 15, 19, 23, ...',
          solution: 'Common difference d = +4; first term a = 7. T_n = 4n + (7 - 4) = 4n + 3.',
        },
        practicePrompt: 'Cambridge Lower Secondary Checkpoint 0862 Mathematics Stage 9',
      },
    ],
  },
  {
    id: 'checkpoint-lowersec-0893-science',
    examFormat: 'checkpoint',
    checkpointTier: 'Lower Secondary Checkpoint (Stages 7–9 · Ages 11–14)',
    inceptionYear: 1999,
    syllabusCode: 'CIE 0893 (Legacy 1113)',
    subjectName: 'Cambridge Lower Secondary Checkpoint Science (Stages 7–9: Biology, Chemistry & Physics)',
    category: 'Sciences',
    iconEmoji: '🔬',
    sessions: ['2026 Specimen & Oct/Apr', '2025 October Series', '2025 April Series', '2024 October Series', '2024 April Series', '2023 October Series', '2023 April Series', '2022 October Series'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Written Paper 1 — Biology, Chemistry, Physics, Earth & Space + Thinking and Working Scientifically', durationMinutes: 45, totalMarks: 50 },
      { paperNumber: 'Paper 2', paperTitle: 'Written Paper 2 — Experimental Investigation, Data Tables, Graphs & Extended Scientific Enquiry', durationMinutes: 45, totalMarks: 50 },
    ],
    gradeThresholds: { distinction: 'Band 5.0–6.0 (Outstanding — 39–50 / 50 Marks)', credit: 'Band 3.0–4.9 (Solid Mastery — 25–38 / 50 Marks)', pass: 'Band 2.0–2.9 (Developing — 16–24 / 50 Marks)' },
    examinerInsights: [
      'In Thinking and Working Scientifically (TWS) questions, clearly distinguish the Independent Variable (what you change), Dependent Variable (what you measure), and Control Variables (kept constant for a fair test).',
      'When asked to "Explain", always give both the observation AND the scientific reason (e.g., particle collisions, electron transfer, or mineral ion role).',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Paper 1 · Chemistry — Reactivity Series & Acids',
        marks: 3,
        question: 'Magnesium ribbon reacts with dilute hydrochloric acid to form a salt and a gas. (a) Name the salt formed. (b) Describe the chemical test and positive result for the gas evolved.',
        options: [
          'Magnesium chloride; test with a lighted splint gives a squeaky pop (Hydrogen)',
          'Magnesium sulfate; test with a glowing splint relights it (Oxygen)',
          'Magnesium carbonate; turns limewater milky (Carbon dioxide)',
          'Magnesium oxide; bleaches damp litmus paper (Chlorine)',
        ],
        answer: 'Magnesium chloride; test with a lighted splint gives a squeaky pop (Hydrogen)',
        markingSchemeNotes: '(a) Magnesium chloride [B1]. (b) Hold a lighted/burning splint to the mouth of the test tube [M1]; hydrogen gas burns with a squeaky pop [A1].',
      },
      {
        number: 2,
        section: 'Paper 1 · Biology — Plant Mineral Nutrition & Photosynthesis',
        marks: 2,
        question: 'State the two mineral ions that plants absorb from soil through root hair cells for healthy growth, and give the function of each.',
        options: [
          'Magnesium ions (to make chlorophyll) and Nitrate ions (to make amino acids / proteins)',
          'Sodium ions (for starch) and Chloride ions (for cellulose)',
          'Calcium ions (for glucose) and Iron ions (for osmosis)',
          'Carbonate ions (for xylem) and Sulfate ions (for transpiration)',
        ],
        answer: 'Magnesium ions (to make chlorophyll) and Nitrate ions (to make amino acids / proteins)',
        markingSchemeNotes: 'Award [B1] for Magnesium (Mg²⁺) needed to synthesize chlorophyll; award [B1] for Nitrate (NO₃⁻) needed to convert carbohydrates into amino acids/proteins for growth.',
      },
      {
        number: 3,
        section: 'Paper 2 · Physics — Density, Pressure & Moments',
        marks: 3,
        question: 'A solid metal block has a mass of 540 g and measures 10 cm × 5 cm × 4 cm. Calculate the density of the metal block in g/cm³ and state whether it floats or sinks in water (density = 1.0 g/cm³).',
        options: ['2.7 g/cm³; it sinks because its density is greater than 1.0 g/cm³', '0.37 g/cm³; it floats', '2.7 g/cm³; it floats', '5.4 g/cm³; it sinks'],
        answer: '2.7 g/cm³; it sinks because its density is greater than 1.0 g/cm³',
        markingSchemeNotes: 'Volume V = 10 × 5 × 4 = 200 cm³ [M1]. Density ρ = Mass / Volume = 540 / 200 = 2.7 g/cm³ [A1]. Sinks because 2.7 g/cm³ > 1.0 g/cm³ [B1].',
      },
    ],
    textbookTitle: 'Cambridge Lower Secondary Science Stage 7, 8 & 9 Learner’s Book (0893)',
    textbookAuthor: 'Mary Jones, Diane Fellowes-Freeman & Michael Smyth (Cambridge University Press)',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Photosynthesis, Atomic Bonding, Reactivity Series, Density/Pressure & Earth Tectonics',
        summary: 'Complete Stage 7–9 Science coverage including Thinking and Working Scientifically (TWS) and Earth & Space strands.',
        keyFormulasOrRules: [
          'Density ρ = Mass / Volume (g/cm³) | Pressure P = Force / Area (N/m² or N/cm²)',
          'Moment of a Force = Force (N) × Perpendicular Distance from Pivot (m)',
          'Photosynthesis: Carbon dioxide + Water —(Light & Chlorophyll)→ Glucose + Oxygen',
        ],
        workedExample: {
          problem: 'A force of 15 N is applied at a perpendicular distance of 0.40 m from a pivot. Calculate the moment of the force.',
          solution: 'Moment = F × d = 15 N × 0.40 m = 6.0 N m.',
        },
        practicePrompt: 'Cambridge Lower Secondary Checkpoint 0893 Science Stage 9',
      },
    ],
  },
  {
    id: 'checkpoint-lowersec-0861-english',
    examFormat: 'checkpoint',
    checkpointTier: 'Lower Secondary Checkpoint (Stages 7–9 · Ages 11–14)',
    inceptionYear: 1999,
    syllabusCode: 'CIE 0861 / 0876 (Legacy 1111)',
    subjectName: 'Cambridge Lower Secondary Checkpoint English (First & Second Language · Stages 7–9)',
    category: 'Languages & Literature',
    iconEmoji: '📖',
    sessions: ['2026 Specimen & Oct/Apr', '2025 October Series', '2025 April Series', '2024 October Series', '2024 April Series', '2023 October Series', '2023 April Series', '2022 October Series'],
    papersOffered: [
      { paperNumber: 'Paper 1 (Non-Fiction)', paperTitle: 'Reading Comprehension (Explicit/Implicit Retrieval, Writer’s Effect, Summary) & Informative/Persuasive Writing', durationMinutes: 70, totalMarks: 50 },
      { paperNumber: 'Paper 2 (Fiction)', paperTitle: 'Literary Prose Extract Analysis (Figurative Language, Tone, Structural Shifts) & Narrative/Descriptive Composition', durationMinutes: 70, totalMarks: 50 },
    ],
    gradeThresholds: { distinction: 'Band 5.0–6.0 (38–50 / 50 Marks)', credit: 'Band 3.0–4.9 (25–37 / 50 Marks)', pass: 'Band 2.0–2.9 (16–24 / 50 Marks)' },
    examinerInsights: [
      'When a Reading question specifies "Look at lines 10–16. Give one word or phrase...", answers taken from outside lines 10–16 score 0 marks even if plausible.',
      'In Section B Writing (25 marks), marks are split across Creation of Texts (Wc), Vocabulary & Language (Wv), Structure of Texts (Ws), and Grammar/Punctuation/Spelling (Wg).',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Paper 1 · Writer’s Effect & Figurative Language',
        marks: 2,
        question: 'Read the sentence: "The ancient iron gate groaned in protest as the winter gale wrenched it open." Identify the literary technique used and explain its effect on the reader.',
        options: [
          'Personification; gives the gate human pain/reluctance ("groaned in protest") to emphasize the violence of the storm',
          'Simile; compares the gate to a winter gale using "as"',
          'Alliteration; creates a cheerful, rhythmic melody',
          'Oxymoron; combines two opposite words side by side',
        ],
        answer: 'Personification; gives the gate human pain/reluctance ("groaned in protest") to emphasize the violence of the storm',
        markingSchemeNotes: 'Award [1 mark] for identifying Personification (or metaphor/onomatopoeia on "groaned"). Award [1 mark] for explaining the effect: conveys resistance, age, and the harsh force of the wind.',
      },
      {
        number: 2,
        section: 'Paper 1 · Grammar & Punctuation',
        marks: 2,
        question: 'Explain why dashes (—) are used around the clause in: "The expedition leader — exhausted after three sleepless days on the glacier — ordered the team to pitch camp."',
        options: [
          'To enclose parenthetical (extra) information emphasizing the leader’s extreme fatigue',
          'To indicate direct speech spoken by a second narrator',
          'To join two compound words into a hyphenated adjective',
          'To replace a question mark at the end of an interrogative sentence',
        ],
        answer: 'To enclose parenthetical (extra) information emphasizing the leader’s extreme fatigue',
        markingSchemeNotes: 'Award [1 mark] for recognizing paired dashes as parenthesis / adding extra non-essential detail, and [1 mark] for noting dramatic emphasis on the leader’s exhaustion.',
      },
    ],
    textbookTitle: 'Cambridge Lower Secondary English Stage 7–9 Learner’s Book (0861)',
    textbookAuthor: 'Graham Elsdon (Cambridge University Press)',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Implicit Inference, Writer’s Craft, Punctuation for Effect & Narrative Structuring',
        summary: 'Line-referenced comprehension techniques, summary synthesis in own words, and varietal sentence openers.',
        keyFormulasOrRules: [
          'PEE / PEEL Method: Point → Evidence (short quotation) → Explain effect of specific word choice',
          'Colons (:) introduce an explanation, list, or dramatic reveal | Semicolons (;) link closely related independent clauses',
        ],
        workedExample: {
          problem: 'Combine using a semicolon: "The rain hammered against the slate roof. Inside the cabin, the fire crackled warmly."',
          solution: '"The rain hammered against the slate roof; inside the cabin, the fire crackled warmly."',
        },
        practicePrompt: 'Cambridge Lower Secondary Checkpoint 0861 English Reading and Writing',
      },
    ],
  },

  // ==================== 4B. CAMBRIDGE PRIMARY CHECKPOINT (STAGES 4–6 · AGES 8–11 · 2005–2026) ====================
  {
    id: 'checkpoint-primary-0096-math',
    examFormat: 'checkpoint',
    checkpointTier: 'Primary Checkpoint (Stages 4–6 · Ages 8–11)',
    inceptionYear: 2005,
    syllabusCode: 'CIE 0096 (Legacy 0845)',
    subjectName: 'Cambridge Primary Checkpoint Mathematics (Stages 4–6)',
    category: 'Mathematics & Computing',
    iconEmoji: '🧮',
    sessions: ['2026 Specimen & Oct/Apr', '2025 October Series', '2025 April Series', '2024 October Series', '2024 April Series', '2023 October Series', '2023 April Series', '2022 October Series'],
    papersOffered: [
      { paperNumber: 'Paper 1 (Non-Calculator)', paperTitle: 'Written Paper 1 — Place Value, Decimals, Fractions, Mental Strategies & Geometry (No Calculator)', durationMinutes: 45, totalMarks: 40 },
      { paperNumber: 'Paper 2 (Calculator)', paperTitle: 'Written Paper 2 — Problem Solving, Time, Data Handling, Coordinates & Measure (Calculator Allowed)', durationMinutes: 45, totalMarks: 40 },
    ],
    gradeThresholds: { distinction: 'Band 5.0–6.0 (Outstanding — 32–40 / 40 Marks)', credit: 'Band 3.0–4.9 (Solid Mastery — 20–31 / 40 Marks)', pass: 'Band 2.0–2.9 (Developing — 13–19 / 40 Marks)' },
    examinerInsights: [
      'In Primary Checkpoint 0096, always check whether the question asks you to round to the nearest 10, 100, whole number, or tenth (1 decimal place).',
      'When reflecting or translating a shape on a coordinate grid, translate one vertex (corner) at a time and count grid squares carefully.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Primary 0096 Paper 1 · Place Value & Decimals',
        marks: 1,
        question: 'Write the number forty-five thousand, six hundred and八 (45,608) rounded to the nearest hundred.',
        options: ['45,600', '45,700', '46,000', '45,610'],
        answer: '45,600',
        markingSchemeNotes: 'The tens digit is 0 (< 5), so round down to 45,600 [1 mark].',
      },
      {
        number: 2,
        section: 'Primary 0096 Paper 1 · Fractions, Decimals & Percentages',
        marks: 2,
        question: 'Work out 35% of 240. Show your working in the box provided.',
        options: ['84', '72', '80', '96'],
        answer: '84',
        markingSchemeNotes: '10% of 240 = 24, so 30% = 72 and 5% = 12 [M1]. 72 + 12 = 84 [A1].',
      },
      {
        number: 3,
        section: 'Primary 0096 Paper 2 · Time, Perimeter & Area',
        marks: 2,
        question: 'A rectangular garden has a length of 14 m and a width of 9 m. Calculate (a) the perimeter and (b) the area of the garden.',
        options: ['Perimeter = 46 m; Area = 126 m²', 'Perimeter = 23 m; Area = 126 m²', 'Perimeter = 46 m; Area = 116 m²', 'Perimeter = 126 m; Area = 46 m²'],
        answer: 'Perimeter = 46 m; Area = 126 m²',
        markingSchemeNotes: '(a) Perimeter = 2 × (14 + 9) = 46 m [1 mark]. (b) Area = 14 × 9 = 126 m² [1 mark].',
      },
    ],
    textbookTitle: 'Cambridge Primary Mathematics Stage 4, 5 & 6 Learner’s Book (0096)',
    textbookAuthor: 'Cherri Moseley & Janet Rees (Cambridge University Press)',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Stage 6 Fractions, Decimals, Percentages, 24-Hour Time & Coordinate Reflections',
        summary: 'Complete Stage 4–6 Primary Mathematics revision with Thinking and Working Mathematically (TWM) puzzles.',
        keyFormulasOrRules: [
          '1/2 = 0.5 = 50% | 1/4 = 0.25 = 25% | 3/4 = 0.75 = 75% | 1/5 = 0.2 = 20%',
          'Area of Rectangle = Length × Width | Area of Right-Angled Triangle = ½ × Base × Height',
          'Angles on a straight line add up to 180° | Angles in a triangle add up to 180°',
        ],
        workedExample: {
          problem: 'A train leaves at 09:45 and arrives at 12:20. How long is the journey in hours and minutes?',
          solution: '09:45 to 10:00 is 15 mins; 10:00 to 12:20 is 2 hours 20 mins. Total = 2 hours 35 minutes.',
        },
        practicePrompt: 'Cambridge Primary Checkpoint 0096 Mathematics Stage 6',
      },
    ],
  },
  {
    id: 'checkpoint-primary-0097-science',
    examFormat: 'checkpoint',
    checkpointTier: 'Primary Checkpoint (Stages 4–6 · Ages 8–11)',
    inceptionYear: 2005,
    syllabusCode: 'CIE 0097 (Legacy 0846)',
    subjectName: 'Cambridge Primary Checkpoint Science (Stages 4–6)',
    category: 'Sciences',
    iconEmoji: '🌱',
    sessions: ['2026 Specimen & Oct/Apr', '2025 October Series', '2025 April Series', '2024 October Series', '2024 April Series', '2023 October Series', '2023 April Series', '2022 October Series'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Written Paper 1 — Living Things, Materials, Forces, Light, Electricity & Earth in Space', durationMinutes: 35, totalMarks: 40 },
      { paperNumber: 'Paper 2', paperTitle: 'Written Paper 2 — Fair Testing, Bar/Line Graphs, Food Chains, Reversible Changes & Circuits', durationMinutes: 35, totalMarks: 40 },
    ],
    gradeThresholds: { distinction: 'Band 5.0–6.0 (Outstanding — 31–40 / 40 Marks)', credit: 'Band 3.0–4.9 (Solid Mastery — 20–30 / 40 Marks)', pass: 'Band 2.0–2.9 (Developing — 13–19 / 40 Marks)' },
    examinerInsights: [
      'Use exact scientific terms in Primary Science 0097: write "evaporation" and "condensation" rather than "disappears" or "turns into clouds".',
      'In food chains, remember the arrow (→) always points in the direction of energy transfer (from the eaten organism to the consumer).',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Primary 0097 Paper 1 · States of Matter & Water Cycle',
        marks: 2,
        question: 'Water puddles on a playground dry up on a sunny day. State the name of this change of state and explain why it happens faster on a warm, windy day.',
        options: [
          'Evaporation; higher temperature gives water particles more energy to escape from the liquid surface',
          'Condensation; the sun freezes the liquid water into solid ice',
          'Melting; liquid water turns into a solid',
          'Sublimation; water boils at 100°C on the ground',
        ],
        answer: 'Evaporation; higher temperature gives water particles more energy to escape from the liquid surface',
        markingSchemeNotes: 'Award [1 mark] for Evaporation (liquid to gas below boiling point) and [1 mark] for particles gaining kinetic/heat energy or wind carrying water vapour away.',
      },
      {
        number: 2,
        section: 'Primary 0097 Paper 2 · Flowering Plants & Pollination',
        marks: 2,
        question: 'Which part of a flower produces pollen grains, and which part receives the pollen during pollination?',
        options: [
          'Anther produces pollen; Stigma receives pollen',
          'Petal produces pollen; Sepal receives pollen',
          'Ovary produces pollen; Root receives pollen',
          'Filament produces pollen; Stem receives pollen',
        ],
        answer: 'Anther produces pollen; Stigma receives pollen',
        markingSchemeNotes: 'Award [1 mark] for Anther (male stamen part) and [1 mark] for Stigma (sticky female carpel top).',
      },
    ],
    textbookTitle: 'Cambridge Primary Science Stage 4, 5 & 6 Learner’s Book (0097)',
    textbookAuthor: 'Fiona Baxter & Liz Dilley (Cambridge University Press)',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Plant Life Cycles, Reversible/Irreversible Changes, Electrical Conductors & Solar System',
        summary: 'Stage 4–6 Primary Science core concepts with hands-on fair-test enquiry investigations.',
        keyFormulasOrRules: [
          'Pollination (pollen transferred from anther to stigma) occurs BEFORE Fertilisation (pollen fuses with ovule)',
          'Metals (copper, iron, aluminium) are electrical conductors; plastics, wood, and rubber are electrical insulators',
          'Earth rotates on its axis once every 24 hours (day/night) and orbits the Sun once every 365¼ days',
        ],
        workedExample: {
          problem: 'In the food chain: Grass → Grasshopper → Frog → Snake, identify the Producer and the Primary Consumer.',
          solution: 'Producer = Grass (makes food by photosynthesis); Primary Consumer = Grasshopper (herbivore).',
        },
        practicePrompt: 'Cambridge Primary Checkpoint 0097 Science Stage 6',
      },
    ],
  },
  {
    id: 'checkpoint-primary-0058-english',
    examFormat: 'checkpoint',
    checkpointTier: 'Primary Checkpoint (Stages 4–6 · Ages 8–11)',
    inceptionYear: 2005,
    syllabusCode: 'CIE 0058 / 0057 (Legacy 0844)',
    subjectName: 'Cambridge Primary Checkpoint English (First & Second Language · Stages 4–6)',
    category: 'Languages & Literature',
    iconEmoji: '✍️',
    sessions: ['2026 Specimen & Oct/Apr', '2025 October Series', '2025 April Series', '2024 October Series', '2024 April Series', '2023 October Series', '2023 April Series', '2022 October Series'],
    papersOffered: [
      { paperNumber: 'Paper 1 (Non-Fiction)', paperTitle: 'Reading & Writing Non-Fiction (Information Texts, Biographies, Reports & Persuasive Letters)', durationMinutes: 60, totalMarks: 40 },
      { paperNumber: 'Paper 2 (Fiction)', paperTitle: 'Reading & Writing Fiction (Adventure Stories, Fables, Character Dialogue & Sensory Description)', durationMinutes: 60, totalMarks: 40 },
    ],
    gradeThresholds: { distinction: 'Band 5.0–6.0 (Outstanding — 31–40 / 40 Marks)', credit: 'Band 3.0–4.9 (Solid Mastery — 20–30 / 40 Marks)', pass: 'Band 2.0–2.9 (Developing — 13–19 / 40 Marks)' },
    examinerInsights: [
      'In Primary English 0058, check speech marks ("...") and start a new line whenever a new speaker talks in your story.',
      'Identify passive vs active voice clearly: in passive sentences, the action is done TO the subject (e.g., "The treasure chest was opened by the pirate").',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Primary 0058 Paper 1 · Active & Passive Voice',
        marks: 1,
        question: 'Rewrite the active sentence in the passive voice: "The young inventor designed the solar robot."',
        options: [
          'The solar robot was designed by the young inventor.',
          'The young inventor is designing the solar robot.',
          'The solar robot designed the young inventor.',
          'Tomorrow the young inventor will design the robot.',
        ],
        answer: 'The solar robot was designed by the young inventor.',
        markingSchemeNotes: 'Object ("The solar robot") becomes the subject + past passive verb ("was designed") + agent ("by the young inventor") [1 mark].',
      },
      {
        number: 2,
        section: 'Primary 0058 Paper 2 · Poetic & Figurative Devices',
        marks: 1,
        question: 'Which figurative device is used in the sentence: "The river wound through the valley like a silver ribbon"?',
        options: ['Simile', 'Onomatopoeia', 'Hyperbole', 'Rhyme'],
        answer: 'Simile',
        markingSchemeNotes: 'Compares the river to a silver ribbon using "like" -> Simile [1 mark].',
      },
    ],
    textbookTitle: 'Cambridge Primary English Stage 4, 5 & 6 Learner’s Book (0058)',
    textbookAuthor: 'Sally Burt & Debbie Ridgard (Cambridge University Press)',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Word Classes, Relative Clauses, Direct/Reported Speech & Story Openings',
        summary: 'Stage 4–6 Primary English grammar, punctuation, comprehension retrieval, and story planning.',
        keyFormulasOrRules: [
          'Relative pronouns (who, which, that, whose, where) introduce relative clauses describing a noun',
          'Apostrophes for contraction (don’t = do not) vs possession (the girl’s book)',
        ],
        workedExample: {
          problem: 'Add the correct punctuation to direct speech: Come quickly shouted Maya the boat is leaving',
          solution: '"Come quickly!" shouted Maya. "The boat is leaving."',
        },
        practicePrompt: 'Cambridge Primary Checkpoint 0058 English Stage 6',
      },
    ],
  },

  // ==================== 5. NECO (SSCE) & DIGITAL SAT & AP/IB ====================
  {
    id: 'neco-ssce-core-archive',
    examFormat: 'neco',
    syllabusCode: 'NECO-SSCE',
    subjectName: 'NECO SSCE Mathematics, Biology, Civic & Economics',
    category: 'Mathematics & Computing',
    iconEmoji: '🇳🇬',
    sessions: ['2024 June/July (Internal)', '2024 Nov/Dec (External)', '2023 June/July', '2022 June/July', '2021 June/July'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Objective Paper (60 Multiple Choice Questions)', durationMinutes: 75, totalMarks: 60 },
      { paperNumber: 'Paper 2', paperTitle: 'Essay / Structured Theory Paper', durationMinutes: 120, totalMarks: 60 },
    ],
    gradeThresholds: { distinction: 'A1–B3: 65%+', credit: 'C4–C6: 50%–64%', pass: 'D7–E8: 40%–49%' },
    examinerInsights: [
      'NECO Paper 2 Essay questions reward structured bulleted points with clear definitions and real-world West African examples.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'NECO Mathematics · Progression',
        marks: 8,
        question: 'The 3rd term of an Arithmetic Progression is 11 and the 8th term is 26. Find the common difference and first term.',
        options: ['d = 3, a = 5', 'd = 4, a = 3', 'd = 2, a = 7', 'd = 5, a = 1'],
        answer: 'd = 3, a = 5',
        markingSchemeNotes: 'a + 2d = 11, a + 7d = 26 => 5d = 15 => d = 3, a = 5 [M1, A1].',
      },
    ],
    textbookTitle: 'Hidden Facts in SSCE Mathematics, Biology & Chemistry (NECO/WAEC)',
    textbookAuthor: 'Otumudia Publishers',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Arithmetic & Geometric Progressions, Ecology & Civic Constitutionalism',
        summary: 'Complete past-paper synthesis across NECO SSCE core subjects.',
        keyFormulasOrRules: [
          'A.P. nth term: T_n = a + (n - 1)d  |  Sum S_n = (n/2)[2a + (n - 1)d]',
          'G.P. nth term: T_n = ar^(n - 1)  |  Sum S_n = a(r^n - 1)/(r - 1)',
        ],
        workedExample: {
          problem: 'Find the sum of the first 10 terms of the A.P. 5, 8, 11, 14, ...',
          solution: 'a = 5, d = 3, n = 10. S_10 = (10/2)[2(5) + 9(3)] = 5(10 + 27) = 185.',
        },
        practicePrompt: 'NECO SSCE Sequences, Series and Biology',
      },
    ],
  },
  {
    id: 'sat-ap-ib-international',
    examFormat: 'sat',
    syllabusCode: 'SAT-1600 / AP-IB',
    subjectName: 'College Board Digital SAT & AP / IB Diploma Archive',
    category: 'Mathematics & Computing',
    iconEmoji: '🗽',
    sessions: ['2025 Digital Practice Series', '2024 Bluebook Test 1–6', '2023 International Series', '2022 Series'],
    papersOffered: [
      { paperNumber: 'RW Module 1 & 2', paperTitle: 'Reading & Writing Adaptive Modules (54 Qs)', durationMinutes: 64, totalMarks: 800 },
      { paperNumber: 'Math Module 1 & 2', paperTitle: 'Algebra, Advanced Math & Geometry Adaptive Modules (44 Qs)', durationMinutes: 70, totalMarks: 800 },
    ],
    gradeThresholds: { distinction: '1450–1600 (96th+ Percentile)', credit: '1200–1440', pass: '1000–1190' },
    examinerInsights: [
      'Use Desmos graphing calculator on Digital SAT Math to find system intersections, vertex coordinates, and regression lines in seconds.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Digital SAT Math · Module 2',
        marks: 10,
        question: 'In the linear system 3x + ky = 12 and 6x + 8y = 24, for what value of k does the system have infinitely many solutions?',
        options: ['k = 4', 'k = 2', 'k = 8', 'k = 6'],
        answer: 'k = 4',
        markingSchemeNotes: 'Second equation is 2× the first equation: 2k = 8 => k = 4.',
      },
    ],
    textbookTitle: 'Official Digital SAT Study Guide & College Panda Math Compendium',
    textbookAuthor: 'College Board / Nielson Phu',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Discriminants, Linear Systems & Craft/Structure Reading Transitions',
        summary: 'No-solution vs infinite-solution linear conditions, quadratic vertex forms, and logical transition connectors.',
        keyFormulasOrRules: [
          'Vertex Form: y = a(x - h)² + k has vertex at (h, k)',
          'Parallel lines (no solution): a1/a2 = b1/b2 ≠ c1/c2',
          'Identical lines (infinite solutions): a1/a2 = b1/b2 = c1/c2',
        ],
        workedExample: {
          problem: 'Find the minimum value of f(x) = 2(x - 4)² + 7.',
          solution: 'Since (x - 4)² ≥ 0 and a = 2 > 0, the minimum value is k = 7 at x = 4.',
        },
        practicePrompt: 'Digital SAT Math Module 2 and Reading Transitions',
      },
    ],
  },
  // ==================== ADDITIONAL WAEC, JAMB, IGCSE, CHECKPOINT, NECO & AP/IB FOLDERS ====================
  {
    id: 'waec-210-literature',
    examFormat: 'waec',
    syllabusCode: 'WAEC 210',
    subjectName: 'Literature-in-English (Drama, Prose & Poetry)',
    category: 'Languages & Literature',
    iconEmoji: '🎭',
    sessions: ['2025 Specimen', '2024 May/June (School)', '2024 Nov/Dec (GCE)', '2023 May/June (School)', '2022 May/June (School)', '2021 May/June (School)', '2020 May/June (School)', '2019 May/June'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Objective: Literary Appreciation, Unseen Prose/Poetry & Shakespeare (50 Qs)', durationMinutes: 60, totalMarks: 50 },
      { paperNumber: 'Paper 2', paperTitle: 'African & Non-African Drama and Prose Essay Questions', durationMinutes: 150, totalMarks: 100 },
      { paperNumber: 'Paper 3', paperTitle: 'African & Non-African Poetry Analysis', durationMinutes: 90, totalMarks: 60 },
    ],
    gradeThresholds: { distinction: 'A1–B3: 65%+', credit: 'C4–C6: 50%–64%', pass: 'D7–E8: 40%–49%' },
    examinerInsights: [
      'Always support character and thematic analysis in Paper 2 & 3 with direct textual references and poetic devices.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Paper 1 · Literary Appreciation',
        marks: 2,
        question: 'A figure of speech in which a part is used to represent the whole, or the whole for a part, is called:',
        options: ['Synecdoche', 'Metonymy', 'Oxymoron', 'Litotes'],
        answer: 'Synecdoche',
        markingSchemeNotes: 'Synecdoche substitutes a part for the whole (e.g., "all hands on deck") [A1].',
      },
    ],
    textbookTitle: 'Exam Focus: Literature-in-English (WAEC/NECO/UTME Standard Texts)',
    textbookAuthor: 'University Press PLC',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Figures of Speech, Poetic Meter & Dramatic Irony',
        summary: 'Mastery of unseen poetry analysis, Shakespearean context questions, and African prose characterization.',
        keyFormulasOrRules: [
          'Synecdoche = Part for Whole | Metonymy = Closely Associated Attribute',
          'Dramatic Irony = Audience knows a crucial truth that the character on stage does not know',
        ],
        workedExample: {
          problem: 'Identify the device in: "The crown has decreed a new tax."',
          solution: 'Metonymy ("the crown" represents the monarch/king by association).',
        },
        practicePrompt: 'WAEC Literature-in-English Unseen Poetry and Figures of Speech',
      },
    ],
  },
  {
    id: 'waec-104-accounting-commerce',
    examFormat: 'waec',
    syllabusCode: 'WAEC 104 / 103',
    subjectName: 'Financial Accounting & Commerce',
    category: 'Humanities & Business',
    iconEmoji: '📊',
    sessions: ['2025 Specimen', '2024 May/June (School)', '2024 Nov/Dec (GCE)', '2023 May/June (School)', '2022 May/June (School)', '2021 May/June (School)', '2020 May/June'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Objective Principles of Accounts & Commerce (50 Qs)', durationMinutes: 60, totalMarks: 50 },
      { paperNumber: 'Paper 2', paperTitle: 'Theory & Final Accounts (Trading, Profit & Loss, Balance Sheet & Cashbook)', durationMinutes: 150, totalMarks: 100 },
    ],
    gradeThresholds: { distinction: 'A1–B3: 65%+', credit: 'C4–C6: 50%–64%', pass: 'D7–E8: 40%–49%' },
    examinerInsights: [
      'Ensure double-entry principles are strictly observed and show workings for depreciation, bad debt provisions, and accruals.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Paper 1 · Accounting Equation',
        marks: 2,
        question: 'If a business has Total Assets of ₦450,000 and Total Liabilities of ₦180,000, what is the Owner’s Capital (Equity)?',
        options: ['₦270,000', '₦630,000', '₦180,000', '₦320,000'],
        answer: '₦270,000',
        markingSchemeNotes: 'Accounting Equation: Capital = Assets - Liabilities = 450,000 - 180,000 = ₦270,000 [M1, A1].',
      },
    ],
    textbookTitle: 'Simplified & Amplified Financial Accounting & Essential Commerce',
    textbookAuthor: 'Femi Longe & O.A. Lawal',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Double Entry, Trial Balance, Depreciation & Bank Reconciliation',
        summary: 'Straight-line vs reducing-balance depreciation, suspense accounts, and final accounts of sole traders.',
        keyFormulasOrRules: [
          'Assets = Capital + Liabilities',
          'Gross Profit = Sales (Turnover) - Cost of Goods Sold (Opening Stock + Purchases - Closing Stock)',
        ],
        workedExample: {
          problem: 'Calculate Cost of Goods Sold if Opening Stock = ₦20,000, Net Purchases = ₦85,000, and Closing Stock = ₦15,000.',
          solution: 'COGS = 20,000 + 85,000 - 15,000 = ₦90,000.',
        },
        practicePrompt: 'WAEC Financial Accounting Final Accounts and Bank Reconciliation',
      },
    ],
  },
  {
    id: 'waec-502-agric-geography-civic',
    examFormat: 'waec',
    syllabusCode: 'WAEC 502 / 204 / 216',
    subjectName: 'Agricultural Science, Geography & Civic Education',
    category: 'Sciences',
    iconEmoji: '🌾',
    sessions: ['2025 Specimen', '2024 May/June', '2024 Nov/Dec', '2023 May/June', '2022 May/June', '2021 May/June', '2020 May/June', '2019 May/June'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Objective Paper (50 Multiple Choice Questions)', durationMinutes: 60, totalMarks: 50 },
      { paperNumber: 'Paper 2', paperTitle: 'Essay & Map Reading / Practical Specimen Identification', durationMinutes: 120, totalMarks: 100 },
      { paperNumber: 'Paper 3', paperTitle: 'Practical / Fieldwork & Map Topographical Interpretation', durationMinutes: 90, totalMarks: 60 },
    ],
    gradeThresholds: { distinction: 'A1–B3: 65%+', credit: 'C4–C6: 50%–64%', pass: 'D7–E8: 40%–49%' },
    examinerInsights: [
      'In Map Reading (Geography Paper 2/3), always apply the map scale accurately when converting map distance in cm to ground distance in km.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Geography · Map Scale & Time Zones',
        marks: 3,
        question: 'If the time at Greenwich Meridian (0°) is 12:00 noon, what is the local time at a town located on Longitude 45° East?',
        options: ['3:00 p.m.', '9:00 a.m.', '2:00 p.m.', '4:00 p.m.'],
        answer: '3:00 p.m.',
        markingSchemeNotes: '15° of longitude = 1 hour [M1]. 45° / 15° = 3 hours. Since East gains time: 12:00 noon + 3 hours = 3:00 p.m. [A1].',
      },
    ],
    textbookTitle: 'Essential Agricultural Science, Certificate Physical/Human Geography & Civic Education',
    textbookAuthor: 'O.A. Iwena & R.B. Bunnett',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Soil Science, Topographical Contour Maps & Constitutional Democracy',
        summary: 'Soil profile horizons, longitude/latitude time calculations, and rule of law pillars.',
        keyFormulasOrRules: [
          '360° rotation = 24 hours => 15° = 1 hour (1° = 4 minutes)',
          'East of Greenwich: Add time ("East Gain Add") | West of Greenwich: Subtract time',
        ],
        workedExample: {
          problem: 'Convert a Representative Fraction scale of 1:50,000 into a statement scale in km.',
          solution: '1 cm represents 50,000 cm = 500 m = 0.5 km (or 2 cm to 1 km).',
        },
        practicePrompt: 'WAEC Geography Map Reading and Agricultural Science',
      },
    ],
  },
  {
    id: 'waec-702-data-processing-computer',
    examFormat: 'waec',
    syllabusCode: 'WAEC 702',
    subjectName: 'Data Processing & Computer Studies',
    category: 'Mathematics & Computing',
    iconEmoji: '💻',
    sessions: ['2025 Specimen', '2024 May/June', '2023 May/June', '2022 May/June', '2021 May/June', '2020 May/June'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Objective: Number Bases, Logic Gates, Networking & DBMS (40 Qs)', durationMinutes: 60, totalMarks: 40 },
      { paperNumber: 'Paper 2', paperTitle: 'Essay & Practical Database / SQL / Relational Modeling', durationMinutes: 120, totalMarks: 80 },
    ],
    gradeThresholds: { distinction: 'A1–B3: 65%+', credit: 'C4–C6: 50%–64%', pass: 'D7–E8: 40%–49%' },
    examinerInsights: [
      'Master binary/hexadecimal conversions, Truth Tables for AND/OR/NAND/NOR/XOR gates, and First/Second/Third Normal Form (1NF, 2NF, 3NF).',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Digital Logic & Number Systems',
        marks: 2,
        question: 'Convert the hexadecimal number 2F₁₆ to base 10 (denary).',
        options: ['47', '45', '37', '63'],
        answer: '47',
        markingSchemeNotes: '2 × 16¹ + 15 × 16⁰ = 32 + 15 = 47₁₀ [M1, A1].',
      },
    ],
    textbookTitle: 'Data Processing & Computer Studies for Senior Secondary Schools',
    textbookAuthor: 'Hiit PLC & NERDC Curriculum Series',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Relational Databases, SQL Queries, OSI Model & Logic Gates',
        summary: 'Primary/foreign keys, SQL SELECT/WHERE joins, 7-layer OSI networking model, and Boolean algebra.',
        keyFormulasOrRules: [
          'NAND gate output is 0 ONLY when all inputs are 1',
          'XOR gate output is 1 when inputs are different',
        ],
        workedExample: {
          problem: 'Convert binary 110101₂ to denary.',
          solution: '32 + 16 + 0 + 4 + 0 + 1 = 53₁₀.',
        },
        practicePrompt: 'WAEC Data Processing Logic Gates and Database Normalization',
      },
    ],
  },
  {
    id: 'jamb-eco-gov-lit-crs',
    examFormat: 'jamb',
    syllabusCode: 'UTME-ARTS-SOC',
    subjectName: 'JAMB Economics, Government, Literature & CRS Pack',
    category: 'Humanities & Business',
    iconEmoji: '🏛️',
    sessions: ['2025 Mock CBT', '2024 UTME CBT', '2023 UTME CBT', '2022 UTME CBT', '2021 UTME CBT', '2020 UTME CBT', '2019 UTME CBT'],
    papersOffered: [
      { paperNumber: 'Economics CBT', paperTitle: '40 Questions (Elasticity, Market Structures, National Income & Fiscal Policy)', durationMinutes: 30, totalMarks: 100 },
      { paperNumber: 'Government CBT', paperTitle: '40 Questions (Constitutional Development, Federalism, ECOWAS/AU/UN)', durationMinutes: 25, totalMarks: 100 },
      { paperNumber: 'Literature & CRS CBT', paperTitle: '40 Questions (Prescribed Texts, Unseen Poetry & Biblical Themes)', durationMinutes: 25, totalMarks: 100 },
    ],
    gradeThresholds: { distinction: '75–100 / 100', credit: '55–74 / 100', pass: '45–54 / 100' },
    examinerInsights: [
      'In JAMB Economics, price elasticity of demand (PED) and national income multiplier calculations appear in every session.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'JAMB Economics · Elasticity',
        marks: 2.5,
        question: 'If the Marginal Propensity to Consume (MPC) in an economy is 0.8, calculate the value of the Keynesian National Income Multiplier (k).',
        options: ['5', '4', '1.25', '8'],
        answer: '5',
        markingSchemeNotes: 'Multiplier k = 1 / (1 - MPC) = 1 / (1 - 0.8) = 1 / 0.2 = 5 [M1, A1].',
      },
    ],
    textbookTitle: 'Comprehensive Economics, Essential Government & JAMB Remix Series',
    textbookAuthor: 'J.U. Anyaele & C.C. Dibie',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Elasticity, Keynesian Multiplier & Nigerian Constitutional Timeline (1922–1999)',
        summary: 'Clifford (1922), Richards (1946), Macpherson (1951), Lyttleton (1954) constitutions and macroeconomic equilibrium.',
        keyFormulasOrRules: [
          'Multiplier k = 1 / (1 - MPC) = 1 / MPS',
          'Price Elasticity of Demand (PED) = (% Δ in Quantity Demanded) / (% Δ in Price)',
        ],
        workedExample: {
          problem: 'Which constitution introduced the elective principle in Nigeria?',
          solution: 'The Sir Hugh Clifford Constitution of 1922 (4 elected seats: 3 for Lagos, 1 for Calabar).',
        },
        practicePrompt: 'JAMB Economics Multiplier and Government Constitutions',
      },
    ],
  },
  {
    id: 'igcse-0478-0500-0455-cs-eng-econ',
    examFormat: 'igcse',
    syllabusCode: 'IGCSE 0478 / 0500 / 0455',
    subjectName: 'Cambridge IGCSE Computer Science (0478), English (0500) & Economics (0455)',
    category: 'Mathematics & Computing',
    iconEmoji: '🖥️',
    sessions: ['2025 Specimen', '2024 May/June (s24)', '2024 Oct/Nov (w24)', '2024 Feb/March (m24)', '2023 May/June (s23)', '2023 Oct/Nov (w23)', '2022 May/June (s22)', '2021 May/June (s21)'],
    papersOffered: [
      { paperNumber: 'CS Paper 1 (11/12/13)', paperTitle: 'Computer Systems: Binary, Architecture, Security & Automated Tech', durationMinutes: 105, totalMarks: 75 },
      { paperNumber: 'CS Paper 2 (21/22/23)', paperTitle: 'Algorithms, Programming, Pseudocode, Trace Tables & Logic', durationMinutes: 105, totalMarks: 75 },
      { paperNumber: 'Economics Paper 1 & 2', paperTitle: 'Multiple Choice (0455/12) & Structured Data Response (0455/22)', durationMinutes: 135, totalMarks: 120 },
    ],
    gradeThresholds: { distinction: 'A*: 82% | A: 70% | B: 58%', credit: 'C: 46% | D: 36%', pass: 'E: 28%' },
    examinerInsights: [
      'In IGCSE 0478 Paper 2 trace tables, carefully update loop counters and array indices step-by-step on every iteration.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'IGCSE Computer Science 0478 · Data Representation',
        marks: 3,
        question: 'An uncompressed bitmap image has resolution 1024 × 512 pixels and a color depth of 16 bits (2 bytes) per pixel. Calculate the file size in Kibibytes (KiB).',
        options: ['1024 KiB (1 MiB)', '512 KiB', '2048 KiB', '256 KiB'],
        answer: '1024 KiB (1 MiB)',
        markingSchemeNotes: 'Total bytes = 1024 × 512 × 2 bytes [M1]. Divide by 1024 bytes/KiB = 512 × 2 = 1024 KiB [A1].',
      },
    ],
    textbookTitle: 'Cambridge IGCSE & O Level Computer Science & Economics Coursebooks (2nd Edition)',
    textbookAuthor: 'Sarah Lawrey, Victoria Ellis & Susan Grant (Hodder / CUP)',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Two’s Complement, Von Neumann Fetch-Decode-Execute Cycle & Pseudocode Algorithms',
        summary: 'Registers (PC, MAR, MDR, CIR, ACC), linear/binary search, bubble sort, and SQL.',
        keyFormulasOrRules: [
          '1 KiB = 1024 bytes | 1 MiB = 1024 KiB (IEC binary prefixes)',
          'Sound File Size (bits) = Sample Rate (Hz) × Sample Resolution (bits) × Length (s)',
        ],
        workedExample: {
          problem: 'Represent -18 in 8-bit Two’s Complement binary.',
          solution: '+18 = 00010010. Invert bits = 11101101; add 1 = 11101110₂.',
        },
        practicePrompt: 'IGCSE 0478 Computer Science Fetch-Decode-Execute and Pseudocode',
      },
    ],
  },
  {
    id: 'ap-ib-stem-humanities-complete',
    examFormat: 'ap_ib',
    syllabusCode: 'AP / IB-HL-SL',
    subjectName: 'AP Calculus BC, AP Physics C, AP Chemistry, AP Biology & IB Diploma HL/SL',
    category: 'Sciences',
    iconEmoji: '🎓',
    sessions: ['2025 Specimen', '2024 May Session (TZ1 & TZ2)', '2023 November Session', '2023 May Session', '2022 May Session', '2021 May Session'],
    papersOffered: [
      { paperNumber: 'Section I / Paper 1', paperTitle: 'Multiple Choice Conceptual & Quantitative Analysis', durationMinutes: 90, totalMarks: 60 },
      { paperNumber: 'Section II / Paper 2', paperTitle: 'Free-Response Questions (FRQ) & Extended Data-Based Questions', durationMinutes: 105, totalMarks: 90 },
      { paperNumber: 'Paper 3 (IB HL)', paperTitle: 'Option & Experimental Data Investigation Paper', durationMinutes: 60, totalMarks: 45 },
    ],
    gradeThresholds: { distinction: 'AP Score 5 / IB Level 7 (76%+)', credit: 'AP Score 4 / IB Level 6 (62%–75%)', pass: 'AP Score 3 / IB Level 4–5 (48%–61%)' },
    examinerInsights: [
      'In AP Calculus and Physics FRQs, always justify extrema using sign charts or the Second Derivative Test and include units.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'AP Calculus BC / IB Math AA HL',
        marks: 4,
        question: 'Evaluate the limit: lim_{x → 0} (e^(2x) - 1 - 2x) / x².',
        options: ['2', '1', '4', '0'],
        answer: '2',
        markingSchemeNotes: 'Apply L’Hôpital’s Rule twice (or Maclaurin series): lim_{x→0} (2e^(2x) - 2)/(2x) = lim_{x→0} 4e^(2x)/2 = 2 [M1, A1].',
      },
    ],
    textbookTitle: 'Oxford IB Diploma Programme & Barron’s / Princeton Review AP Compendium',
    textbookAuthor: 'Oxford University Press & College Board',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Taylor/Maclaurin Series, Rotational Dynamics & Chemical Equilibrium (Kp/Kc)',
        summary: 'Power series convergence radii, moment of inertia torque equations, and Gibbs free energy ΔG° = -RT ln K.',
        keyFormulasOrRules: [
          'Maclaurin Series: e^x = 1 + x + x²/2! + x³/3! + ...',
          'ΔG° = ΔH° - TΔS° = -RT ln K = -nFE°_cell',
        ],
        workedExample: {
          problem: 'If ΔH° < 0 and ΔS° > 0 for a chemical reaction, at what temperatures is it spontaneous?',
          solution: 'Since ΔG° = ΔH° - TΔS° is always negative (< 0), it is spontaneous at ALL temperatures.',
        },
        practicePrompt: 'AP and IB Higher Level Calculus, Physics and Chemistry',
      },
    ],
  },

  // ==================== 6. UNITED KINGDOM GCSE (AQA / EDEXCEL / OCR 9–1) ====================
  {
    id: 'gcse-uk-math-8300-1ma1',
    examFormat: 'gcse_uk',
    syllabusCode: 'GCSE 8300 / 1MA1',
    subjectName: 'UK GCSE Mathematics (Higher & Foundation Tier 9–1)',
    category: 'Mathematics & Computing',
    iconEmoji: '🇬🇧',
    sessions: ['2025 Specimen', '2024 June Series', '2024 November Resit', '2023 June Series', '2023 November Series', '2022 June Series', '2021 June Series'],
    papersOffered: [
      { paperNumber: 'Paper 1 (1F / 1H)', paperTitle: 'Non-Calculator Paper (Exact Trig, Surds, Fractions & Algebraic Proof)', durationMinutes: 90, totalMarks: 80 },
      { paperNumber: 'Paper 2 (2F / 2H)', paperTitle: 'Calculator Paper (Bounds, Compound Interest, Circle Theorems & Vectors)', durationMinutes: 90, totalMarks: 80 },
      { paperNumber: 'Paper 3 (3F / 3H)', paperTitle: 'Calculator Problem Solving & Statistics Paper (Histograms & Probability Trees)', durationMinutes: 90, totalMarks: 80 },
    ],
    gradeThresholds: { distinction: 'Grade 9: 83% | Grade 8: 71% | Grade 7: 59%', credit: 'Grade 6: 46% | Grade 5 (Strong Pass): 34%', pass: 'Grade 4 (Standard Pass): 22%' },
    examinerInsights: [
      'In GCSE Higher Paper 1 (Non-Calculator), memorize exact trigonometric values for 0°, 30°, 45°, 60°, and 90°.',
      'For algebraic proof questions ("Prove algebraically that the sum of two consecutive odd numbers..."), represent consecutive odd integers as (2n + 1) and (2n + 3).',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Paper 1H · Non-Calculator Surds & Indices',
        marks: 3,
        question: 'Work out the exact value of (8/27)^(-2/3). Show all your working clearly.',
        options: ['9/4 (or 2.25)', '4/9', '16/81', '-4/9'],
        answer: '9/4 (or 2.25)',
        markingSchemeNotes: 'Cube root of (8/27) = 2/3 [M1]. Negative reciprocal squared: (3/2)² = 9/4 [M1, A1].',
      },
      {
        number: 2,
        section: 'Paper 2H · Algebraic Proof & Functions',
        marks: 4,
        question: 'Solve the simultaneous equations: y = x - 3 and x² + y² = 29.',
        options: ['(5, 2) and (-2, -5)', '(5, 2) and (2, 5)', '(-5, -2) and (2, -5)', '(4, 1) and (-1, -4)'],
        answer: '(5, 2) and (-2, -5)',
        markingSchemeNotes: 'Substitute y = x - 3 into x² + (x - 3)² = 29 [M1] => 2x² - 6x - 20 = 0 => (x - 5)(x + 2) = 0 [M1] => (5, 2) and (-2, -5) [A1].',
      },
    ],
    textbookTitle: 'CGP & Oxford AQA / Edexcel GCSE (9–1) Mathematics Higher Complete Revision & Practice',
    textbookAuthor: 'CGP Books & Oxford University Press',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Grade 8–9 Algebraic Proofs, Histograms & Vector Geometry',
        summary: 'Algebraic parity proofs, frequency density histograms, and collinear vector ratio proofs.',
        keyFormulasOrRules: [
          'Frequency Density = Frequency / Class Width',
          'Exact Trig: sin 30° = 1/2, cos 30° = √3/2, tan 45° = 1',
        ],
        workedExample: {
          problem: 'A histogram class of width 15 has frequency 45. Calculate its Frequency Density.',
          solution: 'Frequency Density = 45 / 15 = 3.0.',
        },
        practicePrompt: 'UK GCSE 9-1 Higher Mathematics Paper 1 and Paper 2',
      },
    ],
  },
  {
    id: 'gcse-uk-sciences-8461-8462-8463',
    examFormat: 'gcse_uk',
    syllabusCode: 'GCSE 8461 / 8462 / 8463',
    subjectName: 'UK GCSE Biology, Chemistry & Physics (Triple & Combined Trilogy)',
    category: 'Sciences',
    iconEmoji: '🔬',
    sessions: ['2024 June Series', '2023 June Series', '2022 June Series', '2021 June Series', '2020 June Series'],
    papersOffered: [
      { paperNumber: 'Paper 1 (Higher)', paperTitle: 'Cell Biology / Atomic Structure / Energy & Electricity (Required Practicals 1–5)', durationMinutes: 105, totalMarks: 100 },
      { paperNumber: 'Paper 2 (Higher)', paperTitle: 'Homeostasis & Genetics / Rates & Organic / Forces, Waves & Magnetism', durationMinutes: 105, totalMarks: 100 },
    ],
    gradeThresholds: { distinction: 'Grade 9: 75% | Grade 8: 66% | Grade 7: 57%', credit: 'Grade 6: 47% | Grade 5: 38%', pass: 'Grade 4: 29%' },
    examinerInsights: [
      'In 6-mark Level of Response (LoR) questions on Required Practicals, structure your answer under Equipment, Independent/Dependent/Control Variables, and Risk Assessment.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'AQA GCSE Physics 8463 · Paper 1',
        marks: 4,
        question: 'A 2.0 kg metal block is heated so its temperature rises by 15 °C when 12,600 J of thermal energy is supplied. Calculate the specific heat capacity of the metal.',
        options: ['420 J/(kg °C)', '840 J/(kg °C)', '630 J/(kg °C)', '210 J/(kg °C)'],
        answer: '420 J/(kg °C)',
        markingSchemeNotes: 'ΔE = m c Δθ => c = 12600 / (2.0 × 15) = 12600 / 30 = 420 J/(kg °C) [M1, A1].',
      },
    ],
    textbookTitle: 'AQA / Edexcel GCSE (9–1) Biology, Chemistry & Physics Student Books',
    textbookAuthor: 'Lawrie Ryan, Ann Fullick & Jim Breithaupt (OUP)',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'GCSE Required Practicals, Specific Heat Capacity & Quantitative Mole Calculations',
        summary: 'Osmosis in potato cylinders, electrolysis of aqueous solutions, and I-V characteristics of filament lamps/diodes.',
        keyFormulasOrRules: [
          'Thermal Energy ΔE = m × c × Δθ  |  Elastic Potential Energy E_e = ½ k e²',
          'Atom Economy = (Mr of Desired Product / Sum of Mr of All Reactants) × 100%',
        ],
        workedExample: {
          problem: 'Calculate the elastic potential energy stored in a spring of spring constant k = 200 N/m extended by 0.10 m.',
          solution: 'E_e = 0.5 × 200 × (0.10)² = 1.0 J.',
        },
        practicePrompt: 'UK GCSE Triple Science Physics Chemistry and Biology Required Practicals',
      },
    ],
  },

  // ==================== 7. CAMBRIDGE & UK GCE AS & A-LEVEL (9709 / 9702 / 9701 / 9700) ====================
  {
    id: 'alevel-9709-math',
    examFormat: 'alevel_uk',
    syllabusCode: 'CAIE 9709 / 9231',
    subjectName: 'GCE AS & A-Level Mathematics (Pure Maths 1 & 3, Mechanics & Statistics)',
    category: 'Mathematics & Computing',
    iconEmoji: '🎓',
    sessions: ['2025 Specimen', '2024 May/June (s24)', '2024 Oct/Nov (w24)', '2024 Feb/March (m24)', '2023 May/June (s23)', '2023 Oct/Nov (w23)', '2022 May/June (s22)'],
    papersOffered: [
      { paperNumber: 'Paper 1 (11/12/13)', paperTitle: 'Pure Mathematics 1 (Quadratics, Coordinate Geometry, Circular Measure, Series & Calculus)', durationMinutes: 110, totalMarks: 75 },
      { paperNumber: 'Paper 3 (31/32/33)', paperTitle: 'Pure Mathematics 3 (Logarithms, Partial Fractions, Integration by Parts, Differential Equations & Complex Numbers)', durationMinutes: 110, totalMarks: 75 },
      { paperNumber: 'Paper 4 & 5 (42/52)', paperTitle: 'Mechanics ( Paper 4 ) & Probability & Statistics 1 ( Paper 5 )', durationMinutes: 75, totalMarks: 50 },
    ],
    gradeThresholds: { distinction: 'A*: 86% | A: 76%', credit: 'B: 65% | C: 54%', pass: 'D: 43% | E: 32%' },
    examinerInsights: [
      'In Pure Mathematics 1 & 3, when the question says "Hence", you MUST use the result from the immediately preceding part to earn method marks.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Paper 12 · Circular Measure & Radian Sectors',
        marks: 5,
        question: 'A sector of a circle of radius 10 cm has central angle 1.2 radians. Find the area of the sector and the length of its perimeter.',
        options: ['Area = 60 cm²; Perimeter = 32 cm', 'Area = 120 cm²; Perimeter = 22 cm', 'Area = 60 cm²; Perimeter = 12 cm', 'Area = 50 cm²; Perimeter = 30 cm'],
        answer: 'Area = 60 cm²; Perimeter = 32 cm',
        markingSchemeNotes: 'Area = ½ r² θ = 0.5 × 100 × 1.2 = 60 cm² [B1]. Arc length s = rθ = 12 cm; Perimeter = 12 + 10 + 10 = 32 cm [M1, A1].',
      },
      {
        number: 2,
        section: 'Paper 32 · Integration & Differential Equations',
        marks: 6,
        question: 'Find the exact value of ∫₀^(π/4) sec²(x) · e^(tan x) dx.',
        options: ['e - 1', 'e', 'e + 1', '1'],
        answer: 'e - 1',
        markingSchemeNotes: 'Let u = tan x => du = sec²(x) dx [M1]. Integral becomes [e^(tan x)]₀^(π/4) = e¹ - e⁰ = e - 1 [A1].',
      },
    ],
    textbookTitle: 'Cambridge International AS & A Level Mathematics: Pure Mathematics 1, 2 & 3 Coursebooks',
    textbookAuthor: 'Sue Pemberton & Julian Gilbey (Cambridge University Press)',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Radian Circular Measure, Binomial Series, Integration by Parts & Argand Diagrams',
        summary: 'Complete A-Level 9709 Pure Mathematics 1 & 3 formula derivations and MF19 booklet applications.',
        keyFormulasOrRules: [
          'Arc Length s = rθ  |  Sector Area A = ½ r² θ  (θ in radians)',
          'Integration by Parts: ∫ u (dv/dx) dx = u v - ∫ v (du/dx) dx',
        ],
        workedExample: {
          problem: 'Express 5 cos θ - 12 sin θ in the form R cos(θ + α) where R > 0 and 0° < α < 90°.',
          solution: 'R = √(5² + 12²) = 13. tan α = 12/5 => α = 67.38°. Answer: 13 cos(θ + 67.4°).',
        },
        practicePrompt: 'CAIE A-Level 9709 Pure Mathematics 1 and 3 Calculus and Trigonometry',
      },
    ],
  },
  {
    id: 'alevel-9702-9701-9700-sciences',
    examFormat: 'alevel_uk',
    syllabusCode: 'CAIE 9702 / 9701 / 9700',
    subjectName: 'GCE AS & A-Level Physics (9702), Chemistry (9701) & Biology (9700)',
    category: 'Sciences',
    iconEmoji: '⚛️',
    sessions: ['2024 May/June (s24)', '2024 Oct/Nov (w24)', '2023 May/June (s23)', '2023 Oct/Nov (w23)', '2022 May/June (s22)'],
    papersOffered: [
      { paperNumber: 'Paper 1 (11/12/13)', paperTitle: 'AS Level Multiple Choice (40 Challenging Analytical Questions)', durationMinutes: 75, totalMarks: 40 },
      { paperNumber: 'Paper 2 (21/22/23)', paperTitle: 'AS Level Structured Questions', durationMinutes: 75, totalMarks: 60 },
      { paperNumber: 'Paper 4 (41/42/43)', paperTitle: 'A2 Level Extended Structured Theory (Gravitational/Electric Fields, Thermodynamics & NMR)', durationMinutes: 120, totalMarks: 100 },
      { paperNumber: 'Paper 5 (51/52/53)', paperTitle: 'Planning, Analysis and Evaluation (Experimental Uncertainties & Linearization)', durationMinutes: 75, totalMarks: 30 },
    ],
    gradeThresholds: { distinction: 'A*: 78% | A: 68%', credit: 'B: 58% | C: 48%', pass: 'D: 39% | E: 30%' },
    examinerInsights: [
      'In Paper 5 (Planning, Analysis & Evaluation), always linearize non-linear equations into y = mx + c form and state how gradient m or y-intercept c yields the constant.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'A-Level Physics 9702 · Paper 42 (SHM & Fields)',
        marks: 4,
        question: 'A body performs Simple Harmonic Motion (SHM) with frequency 2.5 Hz and amplitude 0.040 m. Calculate its maximum speed.',
        options: ['0.63 m/s', '0.10 m/s', '1.26 m/s', '0.31 m/s'],
        answer: '0.63 m/s',
        markingSchemeNotes: 'ω = 2πf = 5π rad/s [M1]. v_max = ω x_0 = 5π × 0.040 = 0.20π ≈ 0.63 m/s [A1].',
      },
    ],
    textbookTitle: 'Cambridge International AS & A Level Physics, Chemistry & Biology Coursebooks (3rd Ed.)',
    textbookAuthor: 'David Sang, Lawrie Ryan & Mary Jones (Cambridge University Press)',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Simple Harmonic Motion, Born-Haber Cycles & Chemiosmotic ATP Synthesis',
        summary: 'SHM acceleration a = -ω²x, lattice enthalpy cycles, and oxidative phosphorylation.',
        keyFormulasOrRules: [
          'SHM: a = -ω²x  |  v = ±ω √(x_0² - x²)  |  ω = 2πf',
          'Henderson-Hasselbalch: pH = pKa + log₁₀([A⁻] / [HA])',
        ],
        workedExample: {
          problem: 'Calculate the pH of a buffer containing 0.20 mol/dm³ ethanoic acid (pKa = 4.76) and 0.20 mol/dm³ sodium ethanoate.',
          solution: 'Since [A⁻] = [HA], log₁₀(1) = 0, so pH = pKa = 4.76.',
        },
        practicePrompt: 'CAIE A-Level 9702 Physics and 9701 Chemistry Paper 4',
      },
    ],
  },

  // ==================== 8. KENYA KCSE (KNEC 121 / 231 / 232 / 233) ====================
  {
    id: 'kcse-kenya-math-sciences',
    examFormat: 'kcse_kenya',
    syllabusCode: 'KNEC 121 / 231 / 232 / 233',
    subjectName: 'KCSE Mathematics (121), Biology (231), Physics (232) & Chemistry (233)',
    category: 'Mathematics & Computing',
    iconEmoji: '🇰🇪',
    sessions: ['2024 KNEC KCSE', '2023 KNEC KCSE', '2022 KNEC KCSE', '2021 KNEC KCSE', '2020 KNEC KCSE', '2019 KNEC KCSE'],
    papersOffered: [
      { paperNumber: 'Paper 1 (121/1 & 233/1)', paperTitle: 'Section I (50 Marks Compulsory) & Section II (50 Marks Chosen from 8 Questions)', durationMinutes: 150, totalMarks: 100 },
      { paperNumber: 'Paper 2 (121/2 & 232/2)', paperTitle: 'Extended Paper: Matrices, Commercial Arithmetic, Vectors, Calculus & Loci', durationMinutes: 150, totalMarks: 100 },
      { paperNumber: 'Paper 3 (231/3 & 233/3)', paperTitle: 'Practical Examination (Titration, Qualitative Analysis & Biological Specimens)', durationMinutes: 135, totalMarks: 40 },
    ],
    gradeThresholds: { distinction: 'Grade A (80%+) | Grade A- (75%–79%)', credit: 'Grade B+ to C+ (55%–74%)', pass: 'Grade C to D+ (35%–54%)' },
    examinerInsights: [
      'In KCSE Mathematics 121/1 & 121/2, Section II questions carry 10 marks each — always show intermediate steps for M1 (Method) and A1 (Accuracy) marks.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'KCSE Mathematics 121/2 · Commercial Arithmetic',
        marks: 4,
        question: 'A car bought for KSh 1,200,000 depreciates at 10% per annum for the first 2 years. Find its value at the end of the 2 years.',
        options: ['KSh 972,000', 'KSh 960,000', 'KSh 1,080,000', 'KSh 980,000'],
        answer: 'KSh 972,000',
        markingSchemeNotes: 'A = P(1 - r/100)^n = 1,200,000 × (0.90)² [M1] = 1,200,000 × 0.81 = KSh 972,000 [A1].',
      },
    ],
    textbookTitle: 'KLB Secondary Mathematics, Biology, Physics & Chemistry Form 1–4 & Golden Tips KCSE',
    textbookAuthor: 'Kenya Literature Bureau (KLB) & Moran Publishers',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Commercial Arithmetic (PAYE Income Tax), 2×2 Matrices & Mole Concept',
        summary: 'Kenya PAYE tax bands, inverse matrix transformations, and volumetric titration calculations.',
        keyFormulasOrRules: [
          'Compound Depreciation: A = P(1 - r/100)^n',
          'Inverse of M = [[a, b], [c, d]] is (1 / (ad - bc)) [[d, -b], [-c, a]]',
        ],
        workedExample: {
          problem: 'Find the inverse of matrix A = [[4, 3], [2, 2]].',
          solution: 'det(A) = 8 - 6 = 2. A⁻¹ = (1/2)[[2, -3], [-2, 4]] = [[1, -1.5], [-1, 2]].',
        },
        practicePrompt: 'KCSE Kenya Mathematics 121 and Chemistry 233 Past Papers',
      },
    ],
  },

  // ==================== 9. SOUTH AFRICA NSC MATRIC (DBE / IEB GRADE 12) ====================
  {
    id: 'nsc-matric-sa-math-phys',
    examFormat: 'nsc_matric_sa',
    syllabusCode: 'DBE / IEB NSC GR12',
    subjectName: 'South Africa NSC Matric Mathematics, Physical Sciences & Life Sciences',
    category: 'Sciences',
    iconEmoji: '🇿🇦',
    sessions: ['2024 Nov NSC Final', '2024 May/June Mid-Year', '2023 Nov NSC Final', '2023 IEB Final', '2022 Nov NSC Final', '2021 Nov NSC Final'],
    papersOffered: [
      { paperNumber: 'Paper 1 (Math / Physics)', paperTitle: 'Algebra, Sequences, Finance, Differential Calculus & Probability / Mechanics & Electrodynamics', durationMinutes: 180, totalMarks: 150 },
      { paperNumber: 'Paper 2 (Math / Chemistry)', paperTitle: 'Statistics, Analytical Geometry, Trigonometry & Euclidean Riders / Organic & Electrochemistry', durationMinutes: 180, totalMarks: 150 },
    ],
    gradeThresholds: { distinction: 'Level 7 (80%–100% Distinction)', credit: 'Level 5–6 (60%–79% Meritorious)', pass: 'Level 4 (50%–59% Bachelor Pass)' },
    examinerInsights: [
      'In NSC Mathematics Paper 2 Euclidean Geometry, every statement MUST be accompanied by the official CAPS acceptable reason in brackets, e.g., (tan-chord theorem) or (opp ∠s of cyclic quad).',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'NSC Mathematics P1 · Cubic Calculus',
        marks: 5,
        question: 'Given f(x) = x³ - 6x² + 9x + 2, determine the x-coordinates of the stationary (turning) points of f.',
        options: ['x = 1 and x = 3', 'x = -1 and x = -3', 'x = 2 and x = 3', 'x = 0 and x = 4'],
        answer: 'x = 1 and x = 3',
        markingSchemeNotes: 'f\'(x) = 3x² - 12x + 9 = 0 [M1] => 3(x - 1)(x - 3) = 0 [M1] => x = 1 or x = 3 [A1].',
      },
    ],
    textbookTitle: 'Mind Action Series & The Answer Series Grade 12 NSC Mathematics & Physical Sciences',
    textbookAuthor: 'Anne Eadie, Mark Phillips & DBE Siyavula',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Future/Present Value Annuities, Cubic Inflection Points & Work-Energy Theorem',
        summary: 'Sinking funds, Euclidean circle riders, Doppler effect, and galvanic vs electrolytic cells.',
        keyFormulasOrRules: [
          'Future Value Annuity: F = x [((1 + i)^n - 1) / i]',
          'Present Value Annuity: P = x [(1 - (1 + i)^(-n)) / i]',
          'Doppler Effect: f_L = [(v ± v_L) / (v ± v_S)] f_S',
        ],
        workedExample: {
          problem: 'Find the point of inflection of f(x) = x³ - 6x² + 9x + 2.',
          solution: 'f\'\'(x) = 6x - 12 = 0 => x = 2. At x = 2, f(2) = 8 - 24 + 18 + 2 = 4. Inflection point: (2, 4).',
        },
        practicePrompt: 'South Africa NSC Matric Grade 12 Mathematics and Physical Sciences',
      },
    ],
  },

  // ==================== 10. INDIA JEE MAIN / ADVANCED, NEET-UG & CBSE CLASS 12 ====================
  {
    id: 'india-jee-neet-cbse',
    examFormat: 'jee_neet_india',
    syllabusCode: 'NTA JEE / NEET / CBSE-12',
    subjectName: 'India JEE Main & Advanced (PCM), NEET-UG (PCB) & CBSE Class 12 Board',
    category: 'Sciences',
    iconEmoji: '🇮🇳',
    sessions: ['2025 Jan Session 1', '2024 April Session 2', '2024 JEE Advanced Paper 1 & 2', '2024 NEET-UG May', '2024 CBSE Class 12 Board', '2023 JEE & NEET'],
    papersOffered: [
      { paperNumber: 'JEE Main Paper 1', paperTitle: 'Physics, Chemistry & Mathematics (75 Questions: MCQs + Numerical Value)', durationMinutes: 180, totalMarks: 300 },
      { paperNumber: 'NEET-UG Paper', paperTitle: 'Physics (45), Chemistry (45), Botany (45) & Zoology (45) — 720 Marks Scale', durationMinutes: 200, totalMarks: 720 },
      { paperNumber: 'CBSE Class 12 Board', paperTitle: 'NCERT Theory, Case-Study Questions & Derivations', durationMinutes: 180, totalMarks: 80 },
    ],
    gradeThresholds: { distinction: '99.0+ NTA Percentile / 650+ NEET / 95%+ CBSE', credit: '95.0+ Percentile / 550+ NEET', pass: '90.0+ Qualifier Cutoff' },
    examinerInsights: [
      'In JEE & NEET (+4 for correct, -1 negative marking), avoid speculative guessing on multi-step numerical traps; use dimensional analysis and limiting-case checks.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'JEE Main Physics · Rotational Mechanics',
        marks: 4,
        question: 'What is the moment of inertia of a uniform solid sphere of mass M and radius R about a tangent to its surface?',
        options: ['(7/5) M R²', '(2/5) M R²', '(5/3) M R²', '(3/5) M R²'],
        answer: '(7/5) M R²',
        markingSchemeNotes: 'I_cm = (2/5)MR² [M1]. By Parallel Axis Theorem: I_tangent = I_cm + MR² = (2/5)MR² + MR² = (7/5)MR² [A1].',
      },
    ],
    textbookTitle: 'NCERT Class 11–12 Exemplar, H.C. Verma Concepts of Physics & Cengage Calculus',
    textbookAuthor: 'Prof. H.C. Verma, NCERT New Delhi & G. Tewani',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Parallel/Perpendicular Axis Theorems, Definite Integral King’s Property & Coordination Chemistry',
        summary: 'Rotational inertia, King’s rule ∫_a^b f(x)dx = ∫_a^b f(a+b-x)dx, and Crystal Field Theory.',
        keyFormulasOrRules: [
          'King’s Property: ∫_a^b f(x) dx = ∫_a^b f(a + b - x) dx',
          'Parallel Axis Theorem: I = I_cm + M d²',
        ],
        workedExample: {
          problem: 'Evaluate I = ∫₀^(π/2) [√(sin x) / (√(sin x) + √(cos x))] dx.',
          solution: 'By King’s Property, 2I = ∫₀^(π/2) 1 dx = π/2 => I = π/4.',
        },
        practicePrompt: 'India JEE Main Advanced and NEET Physics Chemistry Calculus',
      },
    ],
  },

  // ==================== 11. CHINA GAOKAO (NATIONAL COLLEGE ENTRANCE EXAM) ====================
  {
    id: 'china-gaokao-math-lizong',
    examFormat: 'gaokao_china',
    syllabusCode: 'GAOKAO-I / II',
    subjectName: 'China National Gaokao Mathematics & Comprehensive Science (Physics, Chemistry, Biology)',
    category: 'Mathematics & Computing',
    iconEmoji: '🇨🇳',
    sessions: ['2024 National New Curriculum Paper I', '2024 National Paper II', '2023 National Paper I & II', '2022 Beijing/Shanghai/National Series', '2021 National Series'],
    papersOffered: [
      { paperNumber: 'Mathematics (150 Marks)', paperTitle: '8 Single MCQs + 3 Multi-Select MCQs + 3 Fill-in + 5 Proof/Derivation Problems', durationMinutes: 120, totalMarks: 150 },
      { paperNumber: 'Comprehensive Science (300 Marks)', paperTitle: 'Physics (110), Chemistry (100) & Biology (90) Integrated Paper', durationMinutes: 150, totalMarks: 300 },
    ],
    gradeThresholds: { distinction: '650+ / 750 (C9 League / Tsinghua-Peking Tier)', credit: '580–649 / 750 (Project 985/211 Tier)', pass: '480–579 / 750 (Tier-1 Benke)' },
    examinerInsights: [
      'Gaokao Mathematics Q18–Q19 heavily test Conic Sections (ellipses/hyperbolas with Vieta’s chord length formulas) and parametric derivative inequalities.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Gaokao Mathematics · Conic Sections',
        marks: 5,
        question: 'Find the eccentricity e of the ellipse x²/25 + y²/9 = 1.',
        options: ['4/5 (0.8)', '3/5 (0.6)', '5/4 (1.25)', '16/25'],
        answer: '4/5 (0.8)',
        markingSchemeNotes: 'Here a² = 25 (a = 5) and b² = 9. For an ellipse, c = √(a² - b²) = √(25 - 9) = 4. Eccentricity e = c / a = 4/5.',
      },
    ],
    textbookTitle: 'Five-Year Gaokao Three-Year Simulation (五年高考三年模拟) — English Bilingual Edition',
    textbookAuthor: 'Qu一线 (Quxian) Academic Press / PEP Beijing',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Conic Section Chord-Length Vieta Formulas & Charged Particle Cyclotron Motion',
        summary: 'Ellipse/hyperbola focal properties, Vieta’s theorem for line-conic intersections, and Lorentz force R = mv/(qB).',
        keyFormulasOrRules: [
          'Ellipse: c² = a² - b², e = c/a < 1  |  Hyperbola: c² = a² + b², e = c/a > 1',
          'Cyclotron radius in magnetic field: R = (m v) / (q B)  |  Period T = (2π m) / (q B)',
        ],
        workedExample: {
          problem: 'Find the distance between the two foci (2c) of the hyperbola x²/16 - y²/9 = 1.',
          solution: 'c² = a² + b² = 16 + 9 = 25 => c = 5. Focal distance 2c = 10.',
        },
        practicePrompt: 'China Gaokao Mathematics Conic Sections and Physics Electromagnetism',
      },
    ],
  },

  // ==================== 12. AUSTRALIA ATAR (NSW HSC & VICTORIA VCE) ====================
  {
    id: 'australia-atar-hsc-vce',
    examFormat: 'atar_australia',
    syllabusCode: 'NSW HSC / VIC VCE',
    subjectName: 'Australia ATAR Year 12: Maths Methods / Extension, Chemistry & Physics',
    category: 'Mathematics & Computing',
    iconEmoji: '🇦🇺',
    sessions: ['2024 NESA HSC & VCAA VCE', '2023 HSC & VCE Final', '2022 HSC & VCE Final', '2021 HSC & VCE Final'],
    papersOffered: [
      { paperNumber: 'Exam 1 (Tech-Free)', paperTitle: 'Short Answer & Analytical Calculus / Probability without CAS Calculator', durationMinutes: 60, totalMarks: 40 },
      { paperNumber: 'Exam 2 (Tech-Active)', paperTitle: 'MCQ & Extended Application Problems with CAS / Scientific Calculator', durationMinutes: 120, totalMarks: 80 },
    ],
    gradeThresholds: { distinction: 'Band 6 (90%+) / Raw 40+ VCE (95+ ATAR)', credit: 'Band 5 (80%–89%)', pass: 'Band 4 (70%–79%)' },
    examinerInsights: [
      'In VCE Exam 1 (Technology-Free), leave all answers in exact form (e.g., √3, ln 2, π/6) rather than decimal approximations.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'HSC / VCE Maths Methods · Continuous Probability',
        marks: 3,
        question: 'A continuous random variable X has probability density function f(x) = kx for 0 ≤ x ≤ 4, and 0 otherwise. Find the constant k.',
        options: ['1/8', '1/4', '1/16', '1/2'],
        answer: '1/8',
        markingSchemeNotes: 'Total probability ∫₀⁴ kx dx = 1 [M1] => [½ k x²]₀⁴ = 8k = 1 => k = 1/8 [A1].',
      },
    ],
    textbookTitle: 'Cambridge Senior Mathematics (NSW HSC & Victoria VCE) & Jacaranda Physics/Chemistry',
    textbookAuthor: 'Michael Evans, David Greenwood & Cambridge Australia',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Continuous Probability Density Functions, Integration & Chemical Equilibrium',
        summary: 'PDF normalization ∫ f(x)dx = 1, expected value E(X), and Le Chatelier’s principle.',
        keyFormulasOrRules: [
          '∫_{-∞}^{∞} f(x) dx = 1  |  E(X) = ∫ x f(x) dx',
        ],
        workedExample: {
          problem: 'Given f(x) = x/8 on [0, 4], find E(X).',
          solution: 'E(X) = ∫₀⁴ x(x/8) dx = [x³/24]₀⁴ = 64/24 = 8/3.',
        },
        practicePrompt: 'Australia ATAR HSC and VCE Mathematical Methods and Sciences',
      },
    ],
  },

  // ==================== 13. GERMANY ABITUR & FRANCE BACCALAURÉAT ====================
  {
    id: 'europe-abitur-bac-stem',
    examFormat: 'abitur_germany',
    syllabusCode: 'ABITUR-LK / BAC-SPÉ',
    subjectName: 'German Abitur (Leistungskurs) & French Baccalauréat (Spécialité Maths & Sciences)',
    category: 'Mathematics & Computing',
    iconEmoji: '🇩🇪',
    sessions: ['2024 Abitur & Bac Métropole', '2023 Abitur & Bac', '2022 Abitur & Bac', '2021 Abitur & Bac'],
    papersOffered: [
      { paperNumber: 'Teil A / Exercice 1–2', paperTitle: 'Analysis (Kurvendiskussion / Fonctions exp & ln) & Probabilités', durationMinutes: 90, totalMarks: 60 },
      { paperNumber: 'Teil B / Exercice 3–4', paperTitle: 'Analytische Geometrie (3D Vectors & Planes in R³) & Suites par Récurrence', durationMinutes: 150, totalMarks: 90 },
    ],
    gradeThresholds: { distinction: '13–15 Punkte (Note 1.0–1.5) / Mention Très Bien (16+/20)', credit: '10–12 Punkte / Mention Bien (14–15/20)', pass: '05–09 Punkte / Pass (10/20)' },
    examinerInsights: [
      'In Abitur Analytic Geometry and French Bac Géométrie dans l’espace, verify normal vectors n = u × v using the dot product n · u = 0.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Abitur / Bac · 3D Analytic Geometry',
        marks: 4,
        question: 'Find the Cartesian equation of the plane passing through point A(1, 2, -1) with normal vector n = (2, -3, 4).',
        options: ['2x - 3y + 4z = -8', '2x - 3y + 4z = 8', 'x + 2y - z = 4', '2x + 3y + 4z = 0'],
        answer: '2x - 3y + 4z = -8',
        markingSchemeNotes: 'n · (r - a) = 0 => 2(x - 1) - 3(y - 2) + 4(z + 1) = 0 => 2x - 3y + 4z = 2 - 6 - 4 = -8.',
      },
    ],
    textbookTitle: 'Lambacher Schweizer Mathematik Qualifikationsphase & Hachette Spécialité Terminale',
    textbookAuthor: 'Ernst Klett Verlag & Hachette Éducation',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Kurvendiskussion of e-Functions, 3D Plane Intersections & Induction Proofs',
        summary: 'Extrema, inflection points, plane normal forms, and proof by mathematical induction.',
        keyFormulasOrRules: [
          'Product rule on e-functions: d/dx [g(x) e^(kx)] = [g\'(x) + k g(x)] e^(kx)',
          'Distance from point P to plane ax + by + cz + d = 0: D = |ax_0 + by_0 + cz_0 + d| / √(a² + b² + c²)',
        ],
        workedExample: {
          problem: 'Find the derivative of f(x) = (2x + 1) e^x.',
          solution: 'f\'(x) = 2e^x + (2x + 1)e^x = (2x + 3)e^x.',
        },
        practicePrompt: 'German Abitur and French Baccalaureat Mathematics and Physics',
      },
    ],
  },
  {
    id: 'france-bac-physique-math',
    examFormat: 'bac_france',
    syllabusCode: 'BAC-GÉNÉRAL-FR',
    subjectName: 'French Baccalauréat Général: Spécialité Mathématiques, Physique-Chimie & SVT',
    category: 'Sciences',
    iconEmoji: '🇫🇷',
    sessions: ['2024 Juin Métropole (Jour 1 & 2)', '2024 Amérique du Nord & Asie', '2023 Juin Métropole', '2022 Juin Métropole'],
    papersOffered: [
      { paperNumber: 'Épreuve Écrite (4h)', paperTitle: '4 Exercices Indépendants (Suites, Fonctions, Probabilités, Géométrie / Cinétique & Ondes)', durationMinutes: 240, totalMarks: 20 },
      { paperNumber: 'ECE (Pratique)', paperTitle: 'Évaluation des Compétences Expérimentales (Titration, Optics & Python Simulation)', durationMinutes: 60, totalMarks: 20 },
    ],
    gradeThresholds: { distinction: 'Mention Très Bien (16–20 / 20)', credit: 'Mention Bien (14–15.9 / 20)', pass: 'Admis (10–13.9 / 20)' },
    examinerInsights: [
      'Always structure recurrence proofs (raisonnement par récurrence) clearly: Initialisation, Hérédité, and Conclusion.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Bac Physique-Chimie · Acides et Bases',
        marks: 4,
        question: 'An aqueous solution has a hydronium ion concentration [H3O⁺] = 2.0 × 10⁻⁴ mol/L. Given log₁₀(2) ≈ 0.30, calculate its pH.',
        options: ['3.70', '4.30', '4.00', '3.30'],
        answer: '3.70',
        markingSchemeNotes: 'pH = -log₁₀([H3O⁺]) = -log₁₀(2 × 10⁻⁴) = 4 - log₁₀(2) = 4 - 0.30 = 3.70.',
      },
    ],
    textbookTitle: 'Annales ABC du Bac Tout-en-un Terminale (Nathan / Hatier)',
    textbookAuthor: 'Éditions Nathan & Hatier Paris',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Suites Récurrentes, Équations Différentielles y\' = ay + b & Cinétique Chimique',
        summary: 'First-order linear differential equations, half-life t_(1/2) = ln(2)/k, and RC circuit charging.',
        keyFormulasOrRules: [
          'General solution of y\' = ay + b is y(x) = C e^(ax) - b/a',
          'First-order half-life: t_(1/2) = ln(2) / k',
        ],
        workedExample: {
          problem: 'Find the constant equilibrium solution of y\' = -2y + 10.',
          solution: 'Set y\' = 0 => -2y + 10 = 0 => y = 5.',
        },
        practicePrompt: 'French Baccalaureat Terminale Specialite Mathematiques and Physique-Chimie',
      },
    ],
  },

  // ==================== 14. BRAZIL ENEM & GLOBAL IELTS / TOEFL / GRE ====================
  {
    id: 'brazil-enem-mat-natureza',
    examFormat: 'enem_brazil',
    syllabusCode: 'INEP ENEM D1 & D2',
    subjectName: 'Brazil ENEM: Matemática, Ciências da Natureza & Ciências Humanas',
    category: 'Mathematics & Computing',
    iconEmoji: '🇧🇷',
    sessions: ['2024 ENEM Caderno Azul / Amarelo', '2023 ENEM Regular & PPL', '2022 ENEM Regular', '2021 ENEM Regular'],
    papersOffered: [
      { paperNumber: 'Dia 1 (90 Qs + Redação)', paperTitle: 'Linguagens, Códigos e Ciências Humanas + Dissertative Essay', durationMinutes: 330, totalMarks: 1000 },
      { paperNumber: 'Dia 2 (90 Qs)', paperTitle: 'Ciências da Natureza (45 Qs) & Matemática e suas Tecnologias (45 Qs)', durationMinutes: 300, totalMarks: 1000 },
    ],
    gradeThresholds: { distinction: 'TRI 800–1000 (Medicina / USP / UNICAMP)', credit: 'TRI 680–799 (SiSU Federal Universities)', pass: 'TRI 550–679' },
    examinerInsights: [
      'Because ENEM uses Item Response Theory (TRI), securing all easy and medium contextualized questions (ratios, percentages, combinatorics, graph reading) maximizes your scaled score.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'ENEM Matemática · Scale & Spatial Geometry',
        marks: 10,
        question: 'An architect builds a 1:50 scale miniature of a cylindrical water tank. If the miniature holds 2 liters of water, what is the volume of the real tank in liters?',
        options: ['250,000 L', '100 L', '5,000 L', '125,000 L'],
        answer: '250,000 L',
        markingSchemeNotes: 'Volume scales with the CUBE of the linear scale factor (k³) [M1]: V_real = 2 × (50)³ = 2 × 125,000 = 250,000 liters [A1].',
      },
    ],
    textbookTitle: 'Apostila Poliedro / Bernoulli ENEM & Fundamentos de Matemática Elementar',
    textbookAuthor: 'Gelson Iezzi & Sistema Bernoulli / Poliedro',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Cubic Volume Scaling, Combinatorics & Electrical Energy Consumption (kWh)',
        summary: 'Linear vs area vs volume scale ratios (k, k², k³), permutations, and domestic circuit power.',
        keyFormulasOrRules: [
          'Area Ratio = (Linear Scale)²  |  Volume Ratio = (Linear Scale)³',
          'Electrical Energy E (kWh) = Power (kW) × Time (hours)',
        ],
        workedExample: {
          problem: 'A 4,400 W electric shower is used for 15 minutes (0.25 h) per day for 30 days. Find the energy consumed in kWh.',
          solution: 'E = 4.4 kW × 0.25 h × 30 = 33 kWh.',
        },
        practicePrompt: 'Brazil ENEM Mathematics and Natural Sciences Contextualized Problems',
      },
    ],
  },
  {
    id: 'global-ielts-toefl-gre',
    examFormat: 'ielts_toefl',
    syllabusCode: 'IELTS / TOEFL / GRE',
    subjectName: 'IELTS Academic (Band 9), TOEFL iBT (120) & GRE Verbal/Quant Archive',
    category: 'Languages & Literature',
    iconEmoji: '🌐',
    sessions: ['Cambridge IELTS 19 (2024)', 'Cambridge IELTS 18 (2023)', 'Cambridge IELTS 17 (2022)', 'ETS Official TOEFL iBT 2024', 'ETS GRE PowerPrep Plus'],
    papersOffered: [
      { paperNumber: 'Academic Reading & Listening', paperTitle: '3 Long Academic Passages (True/False/Not Given, Matching Headings & Summary Completion)', durationMinutes: 60, totalMarks: 40 },
      { paperNumber: 'Writing Task 1 & 2 / Speaking', paperTitle: 'Data Chart Synthesis (150w) & Academic Discursive Essay (250w)', durationMinutes: 60, totalMarks: 9 },
      { paperNumber: 'GRE Verbal & Quantitative', paperTitle: 'Text Completion, Sentence Equivalence & Quantitative Comparison', durationMinutes: 90, totalMarks: 340 },
    ],
    gradeThresholds: { distinction: 'IELTS Band 8.0–9.0 | TOEFL 110–120 | GRE 325+', credit: 'IELTS Band 7.0–7.5 | TOEFL 95–109', pass: 'IELTS Band 6.0–6.5 | TOEFL 80–94' },
    examinerInsights: [
      'In IELTS Reading, "FALSE" means the passage directly contradicts the statement, whereas "NOT GIVEN" means the information cannot be verified from the passage at all.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'IELTS Academic Reading & GRE Verbal',
        marks: 2,
        question: 'Select the pair of words that produces two sentences with equivalent academic meaning: "Although the initial clinical trial results appeared ______, subsequent peer-reviewed replication confirmed the vaccine’s efficacy."',
        options: ['equivocal / ambiguous', 'conclusive / definitive', 'lucid / transparent', ' deleterious / harmful'],
        answer: 'equivocal / ambiguous',
        markingSchemeNotes: '"Although... subsequent replication confirmed efficacy" requires a contrast word meaning uncertain or open to multiple interpretations ("equivocal" / "ambiguous").',
      },
    ],
    textbookTitle: 'The Official Cambridge Guide to IELTS & ETS Official Guide to the TOEFL iBT / GRE',
    textbookAuthor: 'Pauline Cullen (Cambridge University Press) & ETS',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'True/False/Not Given Logic, Task 2 Cohesion & GRE Quantitative Comparisons',
        summary: 'Distinguishing contradiction from absence of evidence, lexical resource band descriptors, and data sufficiency.',
        keyFormulasOrRules: [
          'TRUE = Paraphrased match | FALSE = Direct contradiction | NOT GIVEN = No evidence either way',
          'Writing Task 2 counts for 2/3 of the total Writing Band Score (spend 40 minutes on Task 2)',
        ],
        workedExample: {
          problem: 'Passage: "Most marine mammals rely on echolocation to navigate murky depths." Statement: "All whales use echolocation exclusively." (T/F/NG?)',
          solution: 'FALSE — "Most" directly contradicts the absolute quantifier "All... exclusively".',
        },
        practicePrompt: 'IELTS Academic Reading Writing and GRE Verbal Quantitative Reasoning',
      },
    ],
  },
  // ==================== NABTEB (NBC / NTC) SUBJECT FOLDERS ====================
  {
    id: 'nabteb-general-math-physics',
    examFormat: 'nabteb',
    inceptionYear: 1992,
    syllabusCode: 'NABTEB 002 / 004',
    subjectName: 'NABTEB General Mathematics, Physics & Technical Drawing (NBC/NTC)',
    category: 'Mathematics & Computing',
    iconEmoji: '🛠️',
    sessions: ['2026 May/June (NBC/NTC)', '2025 Nov/Dec (Modular)', '2025 May/June (NBC/NTC)', '2024 May/June'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Objective Test (50 Multiple Choice Questions)', durationMinutes: 90, totalMarks: 50 },
      { paperNumber: 'Paper 2', paperTitle: 'Structured Theory & Technical Problem Solving', durationMinutes: 150, totalMarks: 100 },
    ],
    gradeThresholds: { distinction: 'A1: 75%+ | B2–B3: 65%–74%', credit: 'C4–C6: 50%–64%', pass: 'D7–E8: 40%–49%' },
    examinerInsights: [
      'Show full geometric construction lines and scale ratios clearly in Technical Drawing and Mensuration questions.',
      'Include SI units on every final numerical answer in Trade Physics and Engineering calculations.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'NABTEB Paper 1 · Objective',
        marks: 2,
        question: 'A machine with a velocity ratio (V.R.) of 5 requires an effort of 250 N to raise a load of 1000 N. Calculate the efficiency of the machine.',
        options: ['80%', '75%', '85%', '90%'],
        answer: '80%',
        markingSchemeNotes: 'Mechanical Advantage (M.A.) = Load / Effort = 1000 / 250 = 4 [M1]. Efficiency = (M.A. / V.R.) × 100% = (4 / 5) × 100% = 80% [A1].',
      },
      {
        number: 2,
        section: 'NABTEB Paper 2 · Structured Theory',
        marks: 8,
        question: 'A cylindrical metal shaft has a diameter of 14 cm and a length of 20 cm (Take π = 22/7). Calculate (a) the curved surface area and (b) the volume of the shaft.',
        options: ['CSA = 880 cm²; Volume = 3080 cm³', 'CSA = 440 cm²; Volume = 1540 cm³', 'CSA = 880 cm²; Volume = 6160 cm³', 'CSA = 616 cm²; Volume = 3080 cm³'],
        answer: 'CSA = 880 cm²; Volume = 3080 cm³',
        markingSchemeNotes: 'Radius r = 7 cm [B1]. (a) CSA = 2πrh = 2 × (22/7) × 7 × 20 = 880 cm² [M1, A1]. (b) Volume = πr²h = (22/7) × 49 × 20 = 3080 cm³ [M1, A1].',
      },
    ],
    textbookTitle: 'NABTEB NBC/NTC General Mathematics & Technical Science Compendium',
    textbookAuthor: 'NABTEB Curriculum & Technical Assessment Panel',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Engineering Mensuration, Simple Machines & Trade Calculations',
        summary: 'Mechanical advantage, velocity ratio, efficiency, and surface area/volume of engineering solids.',
        keyFormulasOrRules: ['M.A. = Load / Effort', 'Efficiency η = (M.A. / V.R.) × 100%', 'V_cylinder = πr²h'],
        workedExample: {
          problem: 'Find the efficiency of a pulley system with V.R. = 4 and M.A. = 3.',
          solution: 'η = (3 / 4) × 100% = 75%.',
        },
        practicePrompt: 'NABTEB General Mathematics and Technical Physics',
      },
    ],
  },
  // ==================== BECE (JUNIOR SECONDARY) SUBJECT FOLDERS ====================
  {
    id: 'bece-math-basic-science',
    examFormat: 'bece',
    inceptionYear: 1990,
    syllabusCode: 'BECE 101 / 102',
    subjectName: 'BECE Mathematics, Basic Science & Technology (JSS3 / JHS3)',
    category: 'Mathematics & Computing',
    iconEmoji: '📘',
    sessions: ['2026 June BECE Series', '2025 June BECE Series', '2024 June BECE Series', '2023 June BECE Series'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Objective Multiple Choice (60 Questions)', durationMinutes: 75, totalMarks: 60 },
      { paperNumber: 'Paper 2', paperTitle: 'Essay & Structured Problem Solving', durationMinutes: 90, totalMarks: 40 },
    ],
    gradeThresholds: { distinction: 'Grade A / Stanine 1: 75%+', credit: 'Grade B–C: 55%–74%', pass: 'Grade D–P: 40%–54%' },
    examinerInsights: [
      'Always simplify fractions to their lowest terms and show step-by-step transposition when solving linear equations.',
      'In Basic Science, distinguish clearly between physical and chemical changes with everyday examples.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'BECE Paper 1 · Objective',
        marks: 2,
        question: 'Solve the equation: 3(2x - 1) = 4x + 7.',
        options: ['x = 5', 'x = 4', 'x = 2', 'x = 3'],
        answer: 'x = 5',
        markingSchemeNotes: 'Expand brackets: 6x - 3 = 4x + 7 [M1] => 6x - 4x = 7 + 3 => 2x = 10 => x = 5 [A1].',
      },
      {
        number: 2,
        section: 'BECE Paper 2 · Structured Theory',
        marks: 4,
        question: 'Find the simple interest on ₦25,000 for 3 years at 8% per annum.',
        options: ['₦6,000', '₦5,000', '₦7,500', '₦4,800'],
        answer: '₦6,000',
        markingSchemeNotes: 'Simple Interest I = (P × R × T) / 100 = (25,000 × 8 × 3) / 100 [M1] = 250 × 24 = ₦6,000 [A1].',
      },
    ],
    textbookTitle: 'Junior Secondary Mathematics & Basic Science BECE Revision Guide',
    textbookAuthor: 'West African Basic Education Panel',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Fractions, Linear Equations, Simple Interest & Plane Shapes',
        summary: 'Core Junior Secondary numeracy, commercial arithmetic, and basic geometric properties.',
        keyFormulasOrRules: ['Simple Interest I = PRT / 100', 'Area of trapezium = ½(a + b)h'],
        workedExample: {
          problem: 'Convert 0.375 to a fraction in its lowest terms.',
          solution: '375 / 1000 = 3 / 8.',
        },
        practicePrompt: 'BECE Junior Secondary Mathematics and Basic Science',
      },
    ],
  },
  // ==================== NBAIS (SAISSCE) SUBJECT FOLDERS ====================
  {
    id: 'nbais-saissce-core',
    examFormat: 'nbais',
    inceptionYear: 1960,
    syllabusCode: 'NBAIS SAISSCE 201',
    subjectName: 'NBAIS Islamic Studies, Arabic & General Mathematics (SAISSCE)',
    category: 'Humanities & Business',
    iconEmoji: '🕌',
    sessions: ['2026 June/July SAISSCE', '2025 Nov/Dec External', '2025 June/July SAISSCE', '2024 June/July SAISSCE'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Objective Test (50 Questions)', durationMinutes: 60, totalMarks: 50 },
      { paperNumber: 'Paper 2', paperTitle: 'Structured Essay & Textual Analysis', durationMinutes: 120, totalMarks: 100 },
    ],
    gradeThresholds: { distinction: 'A1–B3: 65%–100%', credit: 'C4–C6: 50%–64%', pass: 'D7–E8: 40%–49%' },
    examinerInsights: [
      'Support thematic essays in Islamic Studies with accurate Qur’anic and Hadith references and practical moral lessons.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'NBAIS Paper 1 · Objective',
        marks: 2,
        question: 'In Islamic commercial jurisprudence (Fiqh al-Mu’amalat), what is the term for a partnership where one party provides capital and the other provides entrepreneurship/management?',
        options: ['Mudarabah', 'Murabahah', 'Ijarah', 'Wadi’ah'],
        answer: 'Mudarabah',
        markingSchemeNotes: 'Mudarabah is a profit-sharing trustee partnership between the capital provider (Rabb al-Mal) and the managing entrepreneur (Mudarib) [A1].',
      },
    ],
    textbookTitle: 'NBAIS SAISSCE Senior Secondary Compendium',
    textbookAuthor: 'NBAIS Academic Curriculum Directorate',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Foundations of Jurisprudence, Ethics & Quantitative Reasoning',
        summary: 'Structured overview of SAISSCE examination themes and analytical writing.',
        keyFormulasOrRules: ['State textual authority -> Explain context -> Derive contemporary moral/legal application'],
        workedExample: {
          problem: 'Outline two conditions for a valid contract (Aqd).',
          solution: 'Mutual consent (Ijab and Qabul) and lawful subject matter.',
        },
        practicePrompt: 'NBAIS SAISSCE Studies and General Mathematics',
      },
    ],
  },
  // ==================== PEARSON EDEXCEL IGCSE & IAL SUBJECT FOLDERS ====================
  {
    id: 'edexcel-igcse-4ma1-math',
    examFormat: 'edexcel_igcse',
    inceptionYear: 1988,
    syllabusCode: 'Edexcel 4MA1 / WMA11',
    subjectName: 'Pearson Edexcel International GCSE Mathematics A (4MA1) & IAL Pure Maths',
    category: 'Mathematics & Computing',
    iconEmoji: '🇬🇧',
    sessions: ['2026 May/June Series', '2026 January Series', '2025 Oct/Nov Series', '2025 May/June Series'],
    papersOffered: [
      { paperNumber: 'Paper 1H', paperTitle: 'Higher Tier Paper 1H (Calculator Allowed)', durationMinutes: 120, totalMarks: 100 },
      { paperNumber: 'Paper 2H', paperTitle: 'Higher Tier Paper 2H (Calculator Allowed)', durationMinutes: 120, totalMarks: 100 },
    ],
    gradeThresholds: { distinction: 'Grade 9: 82%+ | Grade 8: 71% | Grade 7: 60%', credit: 'Grade 6–4: 36%–59%', pass: 'Grade 3: 26%' },
    examinerInsights: [
      'In Edexcel 4MA1 questions stating "Show clear algebraic working", calculator-only answers without intermediate steps receive 0 marks.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Edexcel 4MA1 Paper 1H · Calculus & Kinematics',
        marks: 4,
        question: 'A particle moves along a straight line such that its displacement s metres from O at time t seconds is given by s = t³ - 6t² + 9t + 4. Find the values of t when the particle is instantaneously at rest.',
        options: ['t = 1 s and t = 3 s', 't = 2 s and t = 3 s', 't = 0 s and t = 4 s', 't = 1 s and t = 6 s'],
        answer: 't = 1 s and t = 3 s',
        markingSchemeNotes: 'Velocity v = ds/dt = 3t² - 12t + 9 [M1]. At rest, v = 0 => 3(t - 1)(t - 3) = 0 [M1] => t = 1 s or t = 3 s [A2].',
      },
    ],
    textbookTitle: 'Pearson Edexcel International GCSE (9–1) Mathematics A Student Book 1 & 2',
    textbookAuthor: 'D. Turner, I. Potts et al. (Pearson Education)',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Differentiation, Kinematics, Histograms & 3D Trigonometry',
        summary: 'Complete Higher Tier 4MA1 toolkit covering gradient functions, stationary points, and frequency density.',
        keyFormulasOrRules: ['v = ds/dt, a = dv/dt', 'Frequency Density = Frequency / Class Width'],
        workedExample: {
          problem: 'Differentiate y = 4x³ - 5x⁻¹ with respect to x.',
          solution: 'dy/dx = 12x² + 5x⁻².',
        },
        practicePrompt: 'Pearson Edexcel International GCSE 4MA1 Mathematics Higher',
      },
    ],
  },
  // ==================== UNEB UGANDA (UCE & UACE) SUBJECT FOLDERS ====================
  {
    id: 'uneb-uace-uce-math-science',
    examFormat: 'uneb_uganda',
    inceptionYear: 1980,
    syllabusCode: 'UNEB P425 / 456',
    subjectName: 'UNEB UACE Principal Mathematics (P425) & UCE Sciences (535/545/553)',
    category: 'Mathematics & Computing',
    iconEmoji: '🇺🇬',
    sessions: ['2026 Nov/Dec UNEB Series', '2025 Nov/Dec UNEB Series', '2024 Nov/Dec UNEB Series', '2023 Nov/Dec UNEB Series'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Pure Mathematics / Core Theory (Section A & B)', durationMinutes: 180, totalMarks: 100 },
      { paperNumber: 'Paper 2', paperTitle: 'Applied Mathematics (Mechanics, Statistics & Numerical Methods)', durationMinutes: 180, totalMarks: 100 },
    ],
    gradeThresholds: { distinction: 'Principal A: 75%+ | Principal B: 65%–74%', credit: 'Principal C–D: 50%–64%', pass: 'Principal E / Subsidiary O: 40%–49%' },
    examinerInsights: [
      'In UNEB P425/2 Numerical Methods, state the Newton-Raphson iterative formula clearly and round each iteration to the requested decimal places.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'UNEB P425/1 · Trigonometry & Algebra',
        marks: 5,
        question: 'Solve the equation 2 cos²θ - sin θ - 1 = 0 for 0° ≤ θ ≤ 180°.',
        options: ['θ = 30° and θ = 150°', 'θ = 60° and θ = 120°', 'θ = 45° and θ = 135°', 'θ = 30° and θ = 90°'],
        answer: 'θ = 30° and θ = 150°',
        markingSchemeNotes: 'Substitute cos²θ = 1 - sin²θ: 2(1 - sin²θ) - sin θ - 1 = 0 => 2 sin²θ + sin θ - 1 = 0 [M1] => (2 sin θ - 1)(sin θ + 1) = 0 => sin θ = 1/2 (since sin θ = -1 has no root in [0°, 180°]) => θ = 30°, 150° [A1].',
      },
    ],
    textbookTitle: 'UNEB UCE & UACE Pure and Applied Mathematics Compendium',
    textbookAuthor: 'Uganda National Curriculum Development Centre (NCDC) Reference',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Trigonometric Identities, Maclaurin Series & Newton-Raphson Iteration',
        summary: 'UACE P425 Pure and Applied Mathematics methods with UNEB marking breakdown.',
        keyFormulasOrRules: ['x_{n+1} = x_n - f(x_n) / f’(x_n)', 'cos²θ + sin²θ = 1'],
        workedExample: {
          problem: 'Find the acute angle satisfying tan 2θ = 1.',
          solution: '2θ = 45° => θ = 22.5°.',
        },
        practicePrompt: 'UNEB Uganda UACE P425 and UCE Mathematics and Sciences',
      },
    ],
  },
  // ==================== ZIMSEC (O-LEVEL & A-LEVEL) SUBJECT FOLDERS ====================
  {
    id: 'zimsec-4004-math-science',
    examFormat: 'zimsec',
    inceptionYear: 1996,
    syllabusCode: 'ZIMSEC 4004 / 6042',
    subjectName: 'ZIMSEC O-Level Mathematics (4004) & Combined Science (4003)',
    category: 'Mathematics & Computing',
    iconEmoji: '🇿🇼',
    sessions: ['2026 November Series', '2026 June Series', '2025 November Series', '2025 June Series', '2024 November Series'],
    papersOffered: [
      { paperNumber: 'Paper 1 (4004/1)', paperTitle: 'Non-Calculator Short Answer Paper (30 Questions)', durationMinutes: 150, totalMarks: 100 },
      { paperNumber: 'Paper 2 (4004/2)', paperTitle: 'Structured & Optional Long Questions (Section A & B)', durationMinutes: 150, totalMarks: 100 },
    ],
    gradeThresholds: { distinction: 'Grade A: 70%–100%', credit: 'Grade B–C: 50%–69%', pass: 'Grade D–E: 35%–49%' },
    examinerInsights: [
      'Paper 1 (4004/1) strictly prohibits calculators; show all fractional, matrix, and index manipulations step by step.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'ZIMSEC 4004/1 · Non-Calculator Paper 1',
        marks: 3,
        question: 'Evaluate 27^(2/3) - (1/4)^(-1) without using a calculator.',
        options: ['5', '13', '9', '4'],
        answer: '5',
        markingSchemeNotes: '27^(2/3) = (³√27)² = 3² = 9 [M1]. (1/4)^(-1) = 4 [B1]. 9 - 4 = 5 [A1].',
      },
    ],
    textbookTitle: 'ZIMSEC New General Mathematics & Combined Science Revision Guide',
    textbookAuthor: 'ZIMSEC Syllabus 4004 / 4003 Panel',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Matrices, Number Bases, Functional Graphs & Consumer Arithmetic',
        summary: 'Core ZIMSEC 4004 Paper 1 & 2 concepts with non-calculator techniques.',
        keyFormulasOrRules: ['det [[a, b], [c, d]] = ad - bc', 'a^(m/n) = (ⁿ√a)^m'],
        workedExample: {
          problem: 'Convert 11011₂ to base 10.',
          solution: '16 + 8 + 0 + 2 + 1 = 27₁₀.',
        },
        practicePrompt: 'ZIMSEC O-Level 4004 Mathematics and Combined Science',
      },
    ],
  },
  // ==================== GED (US HIGH SCHOOL EQUIVALENCY) SUBJECT FOLDERS ====================
  {
    id: 'ged-math-science-rla',
    examFormat: 'ged',
    inceptionYear: 1942,
    syllabusCode: 'GED-MATH-SCI',
    subjectName: 'GED Mathematical Reasoning, Science & Language Arts (RLA)',
    category: 'Mathematics & Computing',
    iconEmoji: '🎓',
    sessions: ['2026 GED Official Testing Series', '2025 GED Testing Series', '2024 GED Testing Series', '2023 GED Testing Series'],
    papersOffered: [
      { paperNumber: 'Part 1 & 2', paperTitle: 'Quantitative Problem Solving & Algebraic Reasoning', durationMinutes: 115, totalMarks: 200 },
      { paperNumber: 'Science & RLA', paperTitle: 'Scientific Data Interpretation & Evidence-Based Reading', durationMinutes: 90, totalMarks: 200 },
    ],
    gradeThresholds: { distinction: '175–200: GED College Ready + Credit', credit: '165–174: GED College Ready', pass: '145–164: High School Equivalency Pass' },
    examinerInsights: [
      'Understand slope-intercept form (y = mx + b) from tables, graphs, and word problems—it accounts for over 25% of GED Math.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'GED Mathematical Reasoning · Linear Functions',
        marks: 4,
        question: 'A plumber charges a flat service fee of $45 plus $60 per hour of labor. Which equation represents the total cost C, in dollars, for h hours of labor, and what is the cost for 3.5 hours?',
        options: ['C = 60h + 45; Total = $255', 'C = 45h + 60; Total = $217.50', 'C = 105h; Total = $367.50', 'C = 60h - 45; Total = $165'],
        answer: 'C = 60h + 45; Total = $255',
        markingSchemeNotes: 'Rate per hour is slope m = 60 and flat fee is y-intercept b = 45 => C = 60h + 45 [M1]. For h = 3.5: C = 60(3.5) + 45 = 210 + 45 = $255 [A1].',
      },
    ],
    textbookTitle: 'GED Test Prep Plus: Mathematical Reasoning, Science, Social Studies & RLA',
    textbookAuthor: 'GED Testing Service Official Prep Compendium',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Linear Equations, Inequalities, Data Statistics & Experimental Design',
        summary: 'High-yield GED formulas, median/mean analysis, and scientific hypothesis testing.',
        keyFormulasOrRules: ['Slope m = (y₂ - y₁) / (x₂ - x₁)', 'Slope-intercept form: y = mx + b'],
        workedExample: {
          problem: 'Find the slope of the line passing through (2, 5) and (6, 17).',
          solution: 'm = (17 - 5) / (6 - 2) = 12 / 4 = 3.',
        },
        practicePrompt: 'GED Mathematical Reasoning and Science Data Analysis',
      },
    ],
  },
];

// Topical Past Paper Packs (like PastPaperAcademy Topical Past Papers!)
export interface TopicalPastPaperPack {
  id: string;
  examFormat: ExamFormatId;
  subject: string;
  topicName: string;
  difficulty: 'Foundation' | 'Standard' | 'Hard / Distinction';
  questionCount: number;
  yearsCovered: string;
  keySubtopics: string[];
  sampleQuestion: PastPaperQuestionItem;
}

export const TOPICAL_PAST_PAPER_PACKS: TopicalPastPaperPack[] = [
  {
    id: 'topical-waec-math-indices-logs',
    examFormat: 'waec',
    subject: 'Mathematics',
    topicName: 'Indices, Logarithms & Surds (Topical Past Questions 2015–2024)',
    difficulty: 'Standard',
    questionCount: 35,
    yearsCovered: '2015–2024 WASSCE',
    keySubtopics: ['Fractional Indices', 'Logarithm Equations', 'Conjugate Surds', 'Standard Form'],
    sampleQuestion: {
      number: 1,
      section: 'Topical WASSCE · Algebra',
      marks: 4,
      question: 'Solve for x: 9^(x + 1) = 27^(x - 1).',
      options: ['x = 5', 'x = 3', 'x = 4', 'x = 2'],
      answer: 'x = 5',
      markingSchemeNotes: '3^(2(x+1)) = 3^(3(x-1)) [M1] => 2x + 2 = 3x - 3 => x = 5 [A1].',
    },
  },
  {
    id: 'topical-waec-math-circle-mensuration',
    examFormat: 'waec',
    subject: 'Mathematics',
    topicName: 'Circle Theorems, Bearings & Solid Mensuration (Topical Pack)',
    difficulty: 'Hard / Distinction',
    questionCount: 40,
    yearsCovered: '2016–2024 WASSCE',
    keySubtopics: ['Cyclic Quadrilaterals', 'Alternate Segment', '3-Figure Bearings', 'Cones & Frustums'],
    sampleQuestion: {
      number: 1,
      section: 'Topical WASSCE · Geometry',
      marks: 6,
      question: 'Two cyclic quadrilateral opposite angles are (3x + 10)° and (2x + 20)°. Find the value of x.',
      options: ['x = 30°', 'x = 25°', 'x = 35°', 'x = 40°'],
      answer: 'x = 30°',
      markingSchemeNotes: 'Opposite angles of a cyclic quadrilateral sum to 180° [M1]: 5x + 30 = 180 => 5x = 150 => x = 30° [A1].',
    },
  },
  {
    id: 'topical-jamb-english-concord-oral',
    examFormat: 'jamb',
    subject: 'Use of English',
    topicName: 'Concord, Lexis, Idioms & Emphatic Stress (UTME Topical Pack)',
    difficulty: 'Standard',
    questionCount: 50,
    yearsCovered: '2014–2024 UTME CBT',
    keySubtopics: ['Proximity Concord', 'Subjunctive High Time', 'Emphatic Stress', 'Vowel/Consonant Sounds'],
    sampleQuestion: {
      number: 1,
      section: 'Topical UTME · Structure',
      marks: 2,
      question: 'It is high time the students _____ making noise in the library.',
      options: ['stopped', 'stop', 'stops', 'are stopping'],
      answer: 'stopped',
      markingSchemeNotes: 'After "It is high time / It is about time", use the simple past tense ("stopped") to express present subjunctive urgency.',
    },
  },
  {
    id: 'topical-jamb-chem-organic-electrolysis',
    examFormat: 'jamb',
    subject: 'Chemistry',
    topicName: 'Organic Chemistry & Faraday’s Electrolysis (UTME & WAEC Pack)',
    difficulty: 'Hard / Distinction',
    questionCount: 42,
    yearsCovered: '2015–2024 UTME & WASSCE',
    keySubtopics: ['IUPAC Nomenclature', 'Alkanols & Esters', 'Faraday’s 1st & 2nd Laws', 'Oxidation Numbers'],
    sampleQuestion: {
      number: 1,
      section: 'Topical Chemistry · Inorganic',
      marks: 2,
      question: 'What is the oxidation number of Chromium (Cr) in K2Cr2O7?',
      options: ['+6', '+7', '+3', '+5'],
      answer: '+6',
      markingSchemeNotes: '2(+1) + 2(Cr) + 7(-2) = 0 => 2 + 2Cr - 14 = 0 => 2Cr = 12 => Cr = +6.',
    },
  },
  {
    id: 'topical-igcse-physics-electricity-waves',
    examFormat: 'igcse',
    subject: 'Physics (0625)',
    topicName: 'Electricity, Magnetism, Waves & Nuclear Physics (IGCSE 0625 Pack)',
    difficulty: 'Hard / Distinction',
    questionCount: 38,
    yearsCovered: '2018–2024 CIE IGCSE',
    keySubtopics: ['Series/Parallel Circuits', 'Transformers', 'Snell’s Law Refraction', 'Half-Life Decay'],
    sampleQuestion: {
      number: 1,
      section: 'Topical IGCSE 0625 · Nuclear Physics',
      marks: 3,
      question: 'A radioactive isotope has a half-life of 8 days. What fraction of the original sample remains undecayed after 24 days?',
      options: ['1/8', '1/3', '1/4', '1/16'],
      answer: '1/8',
      markingSchemeNotes: 'Number of half-lives n = 24 / 8 = 3 [M1]. Remaining fraction = (1/2)³ = 1/8 [A1].',
    },
  },
  {
    id: 'topical-checkpoint-science-enquiry',
    examFormat: 'checkpoint',
    subject: 'Science (0893)',
    topicName: 'Reactivity Series, Forces, Pressure & Photosynthesis (Stage 7–9)',
    difficulty: 'Foundation',
    questionCount: 30,
    yearsCovered: '2019–2024 Checkpoint',
    keySubtopics: ['Metal Displacement', 'Moments & Levers', 'Plant Mineral Deficiencies', 'Sound Waves'],
    sampleQuestion: {
      number: 1,
      section: 'Topical Checkpoint 0893 · Biology',
      marks: 2,
      question: 'Which mineral ion is absorbed by plant roots to synthesize chlorophyll, and what happens when it is deficient?',
      options: [
        'Magnesium ions (Mg²⁺); leaves turn yellow (chlorosis)',
        'Nitrate ions; roots turn blue',
        'Calcium ions; flowers turn purple',
        'Sodium ions; stems elongate rapidly',
      ],
      answer: 'Magnesium ions (Mg²⁺); leaves turn yellow (chlorosis)',
      markingSchemeNotes: 'Magnesium is the central atom in chlorophyll [1 mark]; deficiency causes yellowing between leaf veins (chlorosis) [1 mark].',
    },
  },
  {
    id: 'topical-neco-math-progressions-stats',
    examFormat: 'neco',
    subject: 'General Mathematics',
    topicName: 'Arithmetic & Geometric Progressions, Probability & Statistics (NECO SSCE Pack)',
    difficulty: 'Standard',
    questionCount: 45,
    yearsCovered: '2015–2024 NECO SSCE',
    keySubtopics: ['AP & GP Sums', 'Mean Deviation & Variance', 'Cumulative Frequency Ogives', 'Conditional Probability'],
    sampleQuestion: {
      number: 1,
      section: 'Topical NECO · Sequences & Series',
      marks: 5,
      question: 'Find the sum to infinity of the Geometric Progression: 18, 6, 2, 2/3, ...',
      options: ['27', '24', '36', '26'],
      answer: '27',
      markingSchemeNotes: 'First term a = 18, common ratio r = 6/18 = 1/3 [M1]. S_∞ = a / (1 - r) = 18 / (2/3) = 27 [A1].',
    },
  },
  {
    id: 'topical-sat-math-nonlinear-desmos',
    examFormat: 'sat',
    subject: 'Digital SAT Math',
    topicName: 'Nonlinear Functions, Discriminants & Circle Equations (Bluebook Module 2 Hard)',
    difficulty: 'Hard / Distinction',
    questionCount: 44,
    yearsCovered: '2023–2025 Digital SAT',
    keySubtopics: ['Zero-Solution Discriminants', 'Circle Completing the Square', 'Vertex Translations', 'Exponential Growth'],
    sampleQuestion: {
      number: 1,
      section: 'Digital SAT Math · Module 2',
      marks: 10,
      question: 'The equation x² + y² - 6x + 8y = 24 represents a circle in the xy-plane. What is the radius of the circle?',
      options: ['7', '5', '14', '49'],
      answer: '7',
      markingSchemeNotes: 'Complete the square: (x - 3)² + (y + 4)² = 24 + 9 + 16 = 49 => r = √49 = 7.',
    },
  },
  {
    id: 'topical-ap-ib-calculus-thermodynamics',
    examFormat: 'ap_ib',
    subject: 'AP / IB HL STEM',
    topicName: 'Taylor Series, Differential Equations & Chemical Thermodynamics (AP/IB HL Pack)',
    difficulty: 'Hard / Distinction',
    questionCount: 40,
    yearsCovered: '2016–2024 AP & IB Diploma',
    keySubtopics: ['Maclaurin Polynomials', 'Separable Differential Equations', 'Gibbs Free Energy ΔG°', 'Nernst Equation'],
    sampleQuestion: {
      number: 1,
      section: 'AP Calculus BC / IB Math HL',
      marks: 6,
      question: 'Solve the separable differential equation dy/dx = 2xy given the initial condition y(0) = 3.',
      options: ['y = 3e^(x²)', 'y = 3e^(2x)', 'y = e^(x²) + 2', 'y = 3x² + 3'],
      answer: 'y = 3e^(x²)',
      markingSchemeNotes: '∫ (1/y) dy = ∫ 2x dx => ln|y| = x² + C => y = Ae^(x²). Since y(0) = 3, A = 3 => y = 3e^(x²).',
    },
  },
  {
    id: 'topical-gcse-uk-grade9-algebra-proofs',
    examFormat: 'gcse_uk',
    subject: 'GCSE Mathematics (8300 / 1MA1)',
    topicName: 'Grade 8–9 Algebraic Proofs, Surds, Bounds & Vector Geometry (AQA / Edexcel Pack)',
    difficulty: 'Hard / Distinction',
    questionCount: 48,
    yearsCovered: '2018–2024 UK GCSE 9–1',
    keySubtopics: ['Parity Algebraic Proofs', 'Rationalising Surds', 'Collinear Vector Ratios', 'Velocity-Time Area'],
    sampleQuestion: {
      number: 1,
      section: 'GCSE Higher Paper 1 · Algebraic Proof',
      marks: 4,
      question: 'What is the simplified expression for (2n + 1)² - (2n - 1)², proving it is always a multiple of 8 for any integer n?',
      options: ['8n (which is 8 × n)', '4n² + 2', '8n²', '4n + 8'],
      answer: '8n (which is 8 × n)',
      markingSchemeNotes: '(4n² + 4n + 1) - (4n² - 4n + 1) [M1] = 8n [A1], which is a multiple of 8 for all integers n.',
    },
  },
  {
    id: 'topical-alevel-9709-calculus-differential',
    examFormat: 'alevel_uk',
    subject: 'GCE A-Level Pure Maths (9709)',
    topicName: 'Integration by Parts, Partial Fractions & Differential Equations (CAIE 9709 Paper 3 Pack)',
    difficulty: 'Hard / Distinction',
    questionCount: 52,
    yearsCovered: '2016–2024 CAIE A-Level',
    keySubtopics: ['Integration by Parts', 'Partial Fraction Decomposition', 'Trapezium Rule', 'Argand Loci'],
    sampleQuestion: {
      number: 1,
      section: 'CAIE 9709 Paper 32 · Calculus',
      marks: 5,
      question: 'Evaluate the exact definite integral ∫₁^e x ln(x) dx.',
      options: ['(e² + 1) / 4', '(e² - 1) / 4', 'e² / 2', '(e² + 1) / 2'],
      answer: '(e² + 1) / 4',
      markingSchemeNotes: 'By parts with u = ln x, dv = x dx: [½ x² ln x]₁^e - ∫₁^e ½ x dx = ½ e² - [¼ x²]₁^e = ½ e² - ¼ e² + ¼ = (e² + 1)/4.',
    },
  },
  {
    id: 'topical-kcse-kenya-matrices-commercial',
    examFormat: 'kcse_kenya',
    subject: 'KCSE Mathematics (121/2)',
    topicName: 'Matrices, Transformations, Commercial Arithmetic & 3D Geometry (KNEC Topical Pack)',
    difficulty: 'Standard',
    questionCount: 40,
    yearsCovered: '2014–2024 KNEC KCSE',
    keySubtopics: ['PAYE Tax Bands', 'Matrix Inverses', 'Shear & Stretch', 'Latitude & Longitude Knots'],
    sampleQuestion: {
      number: 1,
      section: 'KNEC 121/2 · Matrices',
      marks: 4,
      question: 'Find the value of k for which the matrix [[k, 4], [3, k + 1]] is singular (has no inverse).',
      options: ['k = 3 or k = -4', 'k = 4 or k = -3', 'k = 2 or k = -6', 'k = 3 only'],
      answer: 'k = 3 or k = -4',
      markingSchemeNotes: 'For a singular matrix, determinant = 0: k(k + 1) - 12 = 0 => k² + k - 12 = 0 => (k + 4)(k - 3) = 0 => k = 3 or -4.',
    },
  },
  {
    id: 'topical-nsc-matric-euclidean-calculus',
    examFormat: 'nsc_matric_sa',
    subject: 'NSC Matric Mathematics',
    topicName: 'Euclidean Circle Geometry Riders & Cubic Calculus Optimization (DBE / IEB Grade 12)',
    difficulty: 'Hard / Distinction',
    questionCount: 45,
    yearsCovered: '2016–2024 NSC Matric',
    keySubtopics: ['Tan-Chord Theorem', 'Proportionality Theorem', 'Cubic Tangents', 'Sinking Funds'],
    sampleQuestion: {
      number: 1,
      section: 'NSC Paper 2 · Analytical Geometry',
      marks: 4,
      question: 'Find the gradient of the tangent to the circle (x - 2)² + (y + 1)² = 25 at the point P(5, 3).',
      options: ['-3/4', '4/3', '3/4', '-4/3'],
      answer: '-3/4',
      markingSchemeNotes: 'Center is C(2, -1). Gradient of radius m_rad = (3 - (-1)) / (5 - 2) = 4/3 [M1]. Tangent is perpendicular: m_tan = -3/4 [A1].',
    },
  },
  {
    id: 'topical-jee-neet-electrostatics-organic',
    examFormat: 'jee_neet_india',
    subject: 'JEE / NEET Physics & Chemistry',
    topicName: 'Electrostatics, Rotational Dynamics & Named Organic Reactions (NTA Topical Archive)',
    difficulty: 'Hard / Distinction',
    questionCount: 60,
    yearsCovered: '2015–2025 JEE & NEET',
    keySubtopics: ['Gauss’s Law Flux', 'Rolling Without Slipping', 'Aldol & Cannizzaro', 'Nernst Cell Potential'],
    sampleQuestion: {
      number: 1,
      section: 'NTA JEE / NEET · Electrostatics',
      marks: 4,
      question: 'A point charge +q is placed at the center of a cube of side L. What is the electric flux passing through any ONE face of the cube?',
      options: ['q / (6 ε₀)', 'q / ε₀', 'q / (4 ε₀)', 'q / (8 ε₀)'],
      answer: 'q / (6 ε₀)',
      markingSchemeNotes: 'By Gauss’s Law, total flux through all 6 faces is q / ε₀. By symmetry, flux through 1 face is q / (6 ε₀).',
    },
  },
  {
    id: 'topical-gaokao-atar-abitur-global',
    examFormat: 'gaokao_china',
    subject: 'Gaokao / ATAR / Abitur Math',
    topicName: 'Conic Sections, Parametric Derivatives & 3D Vector Planes (International Olympiad/Entrance Pack)',
    difficulty: 'Hard / Distinction',
    questionCount: 50,
    yearsCovered: '2018–2024 Global Entrance',
    keySubtopics: ['Ellipse Eccentricity', 'Lorentz Cyclotron Motion', 'Kurvendiskussion e^x', 'Continuous PDFs'],
    sampleQuestion: {
      number: 1,
      section: 'Gaokao Paper I · Sequences',
      marks: 5,
      question: 'In an arithmetic sequence {a_n}, if a_2 + a_8 = 16, what is the sum of the first 9 terms S_9?',
      options: ['72', '64', '80', '144'],
      answer: '72',
      markingSchemeNotes: 'By arithmetic mean symmetry, a_1 + a_9 = a_2 + a_8 = 2a_5 = 16 => a_5 = 8. Then S_9 = 9 × a_5 = 72.',
    },
  },
  {
    id: 'topical-checkpoint-primary-0096-0097',
    examFormat: 'checkpoint',
    subject: 'Primary Checkpoint Math (0096) & Science (0097)',
    topicName: 'Fractions, Decimals, Plant Life Cycles, Fair Testing & States of Matter (Stages 4–6 Pack)',
    difficulty: 'Foundation',
    questionCount: 36,
    yearsCovered: '2005–2026 Primary Checkpoint',
    keySubtopics: ['Place Value & Rounding', 'Coordinate Reflections', 'Evaporation & Condensation', 'Pollination vs Fertilisation'],
    sampleQuestion: {
      number: 1,
      section: 'Topical Primary Checkpoint 0096 · Fractions & Percentages',
      marks: 2,
      question: 'Work out 35% of 240. Show your working.',
      options: ['84', '72', '80', '96'],
      answer: '84',
      markingSchemeNotes: '10% of 240 = 24 => 30% = 72 and 5% = 12 [M1]. 72 + 12 = 84 [A1].',
    },
  },
];

/**
 * Official historical inception year when each examination board started.
 */
export const EXAM_BOARD_INCEPTION_YEARS: Record<ExamFormatId, number> = {
  checkpoint: 1999,
  waec: 1952,
  jamb: 1978,
  neco: 2000,
  nabteb: 1992,
  bece: 1990,
  nbais: 1960,
  igcse: 1988,
  edexcel_igcse: 1988,
  gcse_uk: 1988,
  alevel_uk: 1951,
  sat: 1926,
  ap_ib: 1956,
  ged: 1942,
  kcse_kenya: 1989,
  uneb_uganda: 1980,
  zimsec: 1996,
  nsc_matric_sa: 1970,
  jee_neet_india: 1961,
  gaokao_china: 1952,
  atar_australia: 1967,
  abitur_germany: 1949,
  bac_france: 1946,
  enem_brazil: 1998,
  ielts_toefl: 1964,
  standard_exam: 1990,
};

export interface DocumentProvenanceMeta {
  sourceAuthority: string;
  contentOrigin:
    | 'verified_specimen'
    | 'syllabus_aligned_practice'
    | 'ai_practice_synthesis'
    | 'user_imported_document';
  syllabusVersion: string;
  sourceUrlOrReference: string;
  verificationStatus:
    | 'Verified Curriculum & Syllabus Reference'
    | 'Verified Specimen / Released Framework'
    | 'Syllabus-Aligned Practice Reconstruction (Labeled)'
    | 'AI-Assisted Practice Synthesis (Non-Official)'
    | 'User-Imported Practice Document';
  completenessStatus: string;
  usageRights: string;
  inceptionYear: number;
}

export function getDocumentProvenanceMeta(
  item: AcademicResourceItem,
  folder?: SubjectFolderSpec
): DocumentProvenanceMeta {
  const isUserImported = item.id.startsWith('custom-import-');
  const isCustomAi =
    !isUserImported &&
    (item.id.startsWith('custom-') || item.authorOrBody.includes('AI Synthesis'));
  const isGeneratedSessionPaper =
    item.id.startsWith('ppa-paper-') || item.id.startsWith('ppa-ms-');
  const isSpecimen = item.yearOrEdition.toLowerCase().includes('specimen');
  const inceptionYear =
    folder?.inceptionYear || EXAM_BOARD_INCEPTION_YEARS[item.examFormat] || 1990;
  const syllabusCode = folder?.syllabusCode || item.paperCode.split('/')[0]?.trim() || item.examFormat.toUpperCase();

  if (isUserImported) {
    return {
      sourceAuthority: item.authorOrBody,
      contentOrigin: 'user_imported_document',
      syllabusVersion: `${syllabusCode} User-Provided Document`,
      sourceUrlOrReference: 'Uploaded / Pasted directly by learner in Quiz Me! Ingest Studio',
      verificationStatus: 'User-Imported Practice Document',
      completenessStatus: `Parsed (${item.questions?.length || 0} Structured Questions · Rubric Attached)`,
      usageRights: 'Personal Study & Classroom Review Only',
      inceptionYear,
    };
  }

  if (isCustomAi) {
    return {
      sourceAuthority: 'Quiz Me! AI Assessment Engine (Non-Official Practice)',
      contentOrigin: 'ai_practice_synthesis',
      syllabusVersion: `${syllabusCode} Target Syllabus Alignment`,
      sourceUrlOrReference: 'Synthesized on-demand via Gemini AI Assessment Engine',
      verificationStatus: 'AI-Assisted Practice Synthesis (Non-Official)',
      completenessStatus: `Synthesized Practice Set (${item.questions?.length || 5} Items + Worked Rubric)`,
      usageRights: 'Original AI-Generated Practice Material — Not an Official Exam Board Paper',
      inceptionYear,
    };
  }

  if (isGeneratedSessionPaper) {
    return {
      sourceAuthority: `${item.authorOrBody} · Syllabus ${syllabusCode}`,
      contentOrigin: isSpecimen ? 'verified_specimen' : 'syllabus_aligned_practice',
      syllabusVersion: `${syllabusCode} Curriculum Specification (2024–2026 Active Syllabus)`,
      sourceUrlOrReference: `Authorized ${syllabusCode} Syllabus Topic & Marking Rubric Specification`,
      verificationStatus: isSpecimen
        ? 'Verified Specimen / Released Framework'
        : 'Syllabus-Aligned Practice Reconstruction (Labeled)',
      completenessStatus:
        item.kind === 'marking_scheme'
          ? `Structured M1/A1/B1 Marking Guide (${item.questions?.length || 5} Reference Items)`
          : `Curated ${item.questions?.length || 5}-Question Exam-Style Practice Paper + M1/A1 Rubric`,
      usageRights:
        'Original Syllabus-Aligned Practice & Worked Solutions — Distinct from Copyrighted Board Booklets',
      inceptionYear,
    };
  }

  return {
    sourceAuthority: item.authorOrBody,
    contentOrigin: isSpecimen ? 'verified_specimen' : 'syllabus_aligned_practice',
    syllabusVersion: `${syllabusCode} Official Curriculum Framework`,
    sourceUrlOrReference: `${item.authorOrBody} Published Syllabus & Specimen Reference (${item.paperCode})`,
    verificationStatus: isSpecimen
      ? 'Verified Specimen / Released Framework'
      : 'Verified Curriculum & Syllabus Reference',
    completenessStatus:
      item.kind === 'textbook'
        ? `Complete Revision Compendium (${item.chapters?.length || 3} Core Chapters & Worked Examples)`
        : item.kind === 'marking_scheme'
        ? 'Verified M1/A1/B1 Marking Conventions & Grade Threshold Reference'
        : `Curated Representative Paper (${item.questions?.length || 4} Exemplar Items + M1/A1 Rubric)`,
    usageRights: 'Authorized Educational Revision & Syllabus Reference Material',
    inceptionYear,
  };
}

/**
 * Generates the list of supported syllabus sessions for practice and reference.
 */
export function buildFullHistoricalSessionsForFolder(
  examFormat: ExamFormatId,
  checkpointTier?: CheckpointTierClassification,
  customStartYear?: number
): string[] {
  const startYear =
    customStartYear ||
    (checkpointTier?.startsWith('Primary') ? 2005 : EXAM_BOARD_INCEPTION_YEARS[examFormat] || 1990);
  const endYear = 2026;
  const sessions: string[] = [];

  for (let yr = endYear; yr >= startYear; yr--) {
    if (examFormat === 'checkpoint') {
      if (yr === 2026) {
        sessions.push('2026 October Series');
        sessions.push('2026 May / April Series');
        sessions.push('2026 Specimen Paper');
      } else {
        sessions.push(`${yr} October Series`);
        sessions.push(`${yr} May / April Series`);
      }
    } else if (examFormat === 'waec') {
      if (yr === 2026) {
        sessions.push('2026 May/June (WASSCE School)');
        sessions.push('2026 Nov/Dec (GCE Private)');
      } else {
        sessions.push(`${yr} May/June (WASSCE School)`);
        if (yr >= 2000) {
          sessions.push(`${yr} Nov/Dec (GCE Private)`);
        }
      }
    } else if (examFormat === 'jamb') {
      const modeLabel = yr >= 2014 ? 'UTME CBT' : 'UTME Paper-Pencil (PPT)';
      sessions.push(`${yr} ${modeLabel}`);
    } else if (examFormat === 'neco') {
      sessions.push(`${yr} June/July (SSCE Internal)`);
      if (yr >= 2010) {
        sessions.push(`${yr} Nov/Dec (SSCE External)`);
      }
    } else if (examFormat === 'igcse' || examFormat === 'alevel_uk') {
      const shortYr = String(yr).slice(-2);
      sessions.push(`${yr} May/June (s${shortYr})`);
      sessions.push(`${yr} Oct/Nov (w${shortYr})`);
      if (yr >= 2016) {
        sessions.push(`${yr} Feb/March (m${shortYr})`);
      }
    } else if (examFormat === 'gcse_uk') {
      sessions.push(`${yr} June Series (${yr >= 2017 ? 'Grade 9–1' : 'Legacy A*–G'})`);
      if (yr >= 2015) {
        sessions.push(`${yr} November Series`);
      }
    } else if (examFormat === 'sat') {
      const eraLabel =
        yr >= 2023 ? 'Digital SAT Adaptive Series' : yr >= 2016 ? 'Redesigned 1600 SAT Series' : 'Classic College Board SAT';
      sessions.push(`${yr} ${eraLabel}`);
    } else if (examFormat === 'ap_ib') {
      sessions.push(`${yr} May Session (AP & IB TZ1/TZ2)`);
      if (yr >= 2010) {
        sessions.push(`${yr} November IB Session`);
      }
    } else if (examFormat === 'kcse_kenya') {
      sessions.push(`${yr} KNEC KCSE Series`);
    } else if (examFormat === 'nsc_matric_sa') {
      sessions.push(`${yr} Nov NSC / Matric Final`);
      if (yr >= 2015) {
        sessions.push(`${yr} May/June Mid-Year`);
      }
    } else if (examFormat === 'jee_neet_india') {
      sessions.push(`${yr} JEE / NEET-UG & CBSE Series`);
    } else if (examFormat === 'gaokao_china') {
      sessions.push(`${yr} National Unified Gaokao Paper I & II`);
    } else if (examFormat === 'atar_australia') {
      sessions.push(`${yr} NSW HSC & Victoria VCE Final`);
    } else if (examFormat === 'abitur_germany') {
      sessions.push(`${yr} Abitur Leistungskurs (LK) Haupttermin`);
    } else if (examFormat === 'bac_france') {
      sessions.push(`${yr} Baccalauréat Général Session Juin`);
    } else if (examFormat === 'enem_brazil') {
      sessions.push(`${yr} ENEM Caderno Azul / Amarelo`);
    } else if (examFormat === 'ielts_toefl') {
      sessions.push(`${yr} IELTS Academic & TOEFL iBT Test Series`);
    } else {
      sessions.push(`${yr} Examination Series`);
    }
  }

  return sessions;
}

// Hydrate every subject folder in PAST_PAPER_ACADEMY_SUBJECTS with its syllabus session list
for (const folder of PAST_PAPER_ACADEMY_SUBJECTS) {
  const startYr =
    typeof folder.inceptionYear === 'number'
      ? folder.inceptionYear
      : folder.checkpointTier?.startsWith('Primary')
      ? 2005
      : EXAM_BOARD_INCEPTION_YEARS[folder.examFormat] || 1990;
  folder.inceptionYear = startYr;
  folder.sessions = buildFullHistoricalSessionsForFolder(
    folder.examFormat,
    folder.checkpointTier,
    startYr
  );
}

/**
 * Returns candidate instructions and written exam paper formatting metadata
 * aligned with each examination system's structure.
 */
export function getWrittenExamPaperHeaderMeta(
  folder: SubjectFolderSpec,
  session: string,
  paperNumber: string
): {
  governingHeader: string;
  qualificationSubheader: string;
  paperComponentHeader: string;
  candidateInstructions: string[];
  answerFormatType: 'written_structured_lines' | 'objective_bubbles' | 'mixed_objective_and_theory';
  markingConventionsNote: string;
} {
  const isObj =
    paperNumber.toLowerCase().includes('objective') ||
    paperNumber.toLowerCase().includes('cbt') ||
    paperNumber.toLowerCase().includes('multiple choice') ||
    folder.examFormat === 'jamb';

  if (folder.examFormat === 'checkpoint') {
    const isPrimary = folder.checkpointTier?.startsWith('Primary');
    return {
      governingHeader: 'CAMBRIDGE INTERNATIONAL CURRICULUM ALIGNED PRACTICE',
      qualificationSubheader: isPrimary
        ? 'Cambridge Primary Checkpoint Format (Stages 4–6 · Ages 8–11)'
        : 'Cambridge Lower Secondary Checkpoint Format (Stages 7–9 · Ages 11–14)',
      paperComponentHeader: `${folder.syllabusCode} — ${folder.subjectName} · ${paperNumber} (${session})`,
      candidateInstructions: [
        'Write your Centre number, candidate number and name in the spaces at the top of this page.',
        'Write in dark blue or black pen. You may use an HB pencil for any diagrams, graphs or rough working.',
        'Answer ALL questions in the spaces provided on the question paper. Do not use correction fluid.',
        paperNumber.toLowerCase().includes('non-calculator')
          ? 'NO CALCULATOR ALLOWED on Paper 1. Show all working clearly in the space provided.'
          : 'A scientific calculator may be used where appropriate. Show all steps of working.',
        'The number of marks is given in brackets [ ] at the end of each question or part question.',
      ],
      answerFormatType: 'written_structured_lines',
      markingConventionsNote:
        'M1 = Method mark for correct mathematical/scientific step | A1 = Accuracy mark following correct method | B1 = Independent mark | Scale: Band 0.0 to 6.0',
    };
  }

  if (folder.examFormat === 'waec' || folder.examFormat === 'neco') {
    return {
      governingHeader:
        folder.examFormat === 'waec'
          ? 'WEST AFRICAN SENIOR SCHOOL CERTIFICATE (WASSCE / GCE) FORMAT'
          : 'NATIONAL EXAMINATIONS COUNCIL (NECO SSCE) FORMAT',
      qualificationSubheader:
        folder.examFormat === 'waec'
          ? 'WASSCE Syllabus-Aligned Examination Practice & Marking Rubric'
          : 'NECO SSCE Syllabus-Aligned Examination Practice & Marking Rubric',
      paperComponentHeader: `${folder.syllabusCode} — ${folder.subjectName} · ${paperNumber} (${session})`,
      candidateInstructions: isObj
        ? [
            'Select the correct letter option (A, B, C, or D) for each objective question.',
            'Answer ALL objective questions. Each question carries equal marks.',
            'Review your selections carefully before checking against the marking rubric.',
          ]
        : [
            'Write your Name and Index/Examination Number clearly in the spaces at the top of the page.',
            'Paper 2 consists of Section A (Compulsory questions) and Section B (Structured/Essay questions).',
            'All working must be clearly shown in the ruled spaces; marks are awarded for Method [M1] and Accuracy [A1].',
          ],
      answerFormatType: isObj ? 'objective_bubbles' : 'written_structured_lines',
      markingConventionsNote:
        'M1 = Method Mark | A1 = Accuracy Mark (awarded only if M1 is earned) | B1 = Independent Statement Mark | Grading: A1 (75%+) to F9',
    };
  }

  if (folder.examFormat === 'jamb') {
    return {
      governingHeader: 'JOINT ADMISSIONS AND MATRICULATION BOARD (JAMB UTME) FORMAT',
      qualificationSubheader: 'Unified Tertiary Matriculation Examination CBT Practice & Worked Solutions',
      paperComponentHeader: `${folder.syllabusCode} — ${folder.subjectName} · ${paperNumber} (${session})`,
      candidateInstructions: [
        'Attempt ALL multiple-choice questions (Options A, B, C, D).',
        'In CBT mode, keys A, B, C, D select options, N/P navigate Next/Previous, and S submits.',
        'Aggregate score is scaled out of 400 across your 4 registered UTME subjects (100 per subject).',
      ],
      answerFormatType: 'objective_bubbles',
      markingConventionsNote: '100% Objective Scoring | 0 Negative Marking | Scaled to 100 per subject (400 UTME Aggregate)',
    };
  }

  return {
    governingHeader: `SYLLABUS-ALIGNED EXAMINATION PAPER & MARKING GUIDE`,
    qualificationSubheader: `${folder.syllabusCode} · ${folder.subjectName}`,
    paperComponentHeader: `${paperNumber} — ${session}`,
    candidateInstructions: [
      'Write your Candidate Name and Registration Number in the spaces provided.',
      'Answer all questions in the spaces provided on the question paper.',
      'Show all your working clearly; method marks [M1] are awarded for valid intermediate steps.',
      'The number of marks is given in brackets [ ] at the end of each question.',
    ],
    answerFormatType: isObj ? 'objective_bubbles' : 'written_structured_lines',
    markingConventionsNote: `M1 = Method Mark | A1 = Accuracy Mark | B1 = Independent Mark | Distinction Threshold: ${folder.gradeThresholds.distinction}`,
  };
}

/**
 * Builds syllabus-aligned questions and an M1/A1/B1 Marking Guide for a subject folder,
 * clearly distinguishing core exemplar questions from supplemental parameterized practice items.
 */
export function buildQuestionsForFolderSessionAndPaper(
  folder: SubjectFolderSpec,
  session: string,
  paperNumber: string,
  paperTitle: string
): PastPaperQuestionItem[] {
  const yearMatch = session.match(/\b(19\d{2}|20\d{2})\b/);
  const yr = yearMatch ? parseInt(yearMatch[1], 10) : 2026;
  const baseQuestions = folder.coreQuestions.map((q, idx) => ({
    ...q,
    number: idx + 1,
    section: `${session} · ${paperNumber} (${q.section})`,
    markingSchemeNotes: `[${folder.syllabusCode} · ${paperNumber} · Q${idx + 1} Marking Rubric] ${q.markingSchemeNotes}`,
  }));

  // Add clearly labeled syllabus-aligned supplemental practice items
  const extraStartNum = baseQuestions.length + 1;
  const k = (yr % 7) + 2; // deterministic parameter 2..8

  if (folder.category === 'Mathematics & Computing') {
    baseQuestions.push(
      {
        number: extraStartNum,
        section: `${session} · ${paperNumber} · Syllabus-Aligned Practice Calculation`,
        marks: 3,
        question: `[Syllabus-Aligned Practice · ${yr} Series] Given the linear function f(x) = ${k}x - ${k + 3}, work out (a) the value of f(${k + 2}) and (b) the value of x for which f(x) = ${k * 5 - (k + 3)}. Show all working clearly.`,
        options: [
          `f(${k + 2}) = ${k * (k + 2) - (k + 3)}; x = 5`,
          `f(${k + 2}) = ${k * (k + 2)}; x = 4`,
          `f(${k + 2}) = ${k + 5}; x = 6`,
          `f(${k + 2}) = ${k * 2}; x = 3`,
        ],
        answer: `f(${k + 2}) = ${k * (k + 2) - (k + 3)}; x = 5`,
        markingSchemeNotes: `[Examiner-Style M1/A1 Rubric] (a) Substitute x = ${k + 2}: ${k}(${k + 2}) - ${k + 3} = ${k * (k + 2) - (k + 3)} [B1]. (b) Set ${k}x - ${k + 3} = ${k * 5 - (k + 3)} [M1] => ${k}x = ${k * 5} => x = 5 [A1].`,
      },
      {
        number: extraStartNum + 1,
        section: `${session} · ${paperNumber} · Geometry & Mensuration Practice`,
        marks: 4,
        question: `[Syllabus-Aligned Practice · ${yr} Series] A right-angled triangle has perpendicular sides of length ${3 * k} cm and ${4 * k} cm. Calculate (a) the length of the hypotenuse and (b) the area of the triangle.`,
        options: [
          `Hypotenuse = ${5 * k} cm; Area = ${6 * k * k} cm²`,
          `Hypotenuse = ${7 * k} cm; Area = ${12 * k * k} cm²`,
          `Hypotenuse = ${5 * k} cm; Area = ${12 * k * k} cm²`,
          `Hypotenuse = ${4 * k} cm; Area = ${6 * k * k} cm²`,
        ],
        answer: `Hypotenuse = ${5 * k} cm; Area = ${6 * k * k} cm²`,
        markingSchemeNotes: `[Examiner-Style M1/A1 Rubric] (a) By Pythagoras’ theorem: c = √((${3 * k})² + (${4 * k})²) = √(${9 * k * k} + ${16 * k * k}) = √(${25 * k * k}) = ${5 * k} cm [M1, A1]. (b) Area = ½ × base × height = ½ × ${3 * k} × ${4 * k} = ${6 * k * k} cm² [M1, A1].`,
      }
    );
  } else if (folder.category === 'Sciences') {
    baseQuestions.push(
      {
        number: extraStartNum,
        section: `${session} · ${paperNumber} · Quantitative Science Practice`,
        marks: 3,
        question: `[Syllabus-Aligned Practice · ${yr} Series] In a laboratory investigation, an electric circuit with resistance ${k * 2} Ω carries a steady current of ${k} A for 10 seconds. Calculate (a) the potential difference across the resistor and (b) the total charge transferred.`,
        options: [
          `V = ${2 * k * k} V; Q = ${10 * k} C`,
          `V = ${k} V; Q = ${2 * k} C`,
          `V = ${2 * k * k} V; Q = ${k} C`,
          `V = ${4 * k} V; Q = ${20 * k} C`,
        ],
        answer: `V = ${2 * k * k} V; Q = ${10 * k} C`,
        markingSchemeNotes: `[Examiner-Style M1/A1 Rubric] (a) By Ohm’s Law V = I × R = ${k} A × ${k * 2} Ω = ${2 * k * k} V [M1, A1]. (b) Charge Q = I × t = ${k} A × 10 s = ${10 * k} C [B1].`,
      },
      {
        number: extraStartNum + 1,
        section: `${session} · ${paperNumber} · Experimental Design Practice`,
        marks: 3,
        question: `[Syllabus-Aligned Practice · ${yr} Series] State two variables that must be kept constant (controlled) when investigating the effect of temperature on the rate of an enzyme-catalyzed reaction, and explain why a control tube with boiled enzyme is used.`,
        options: [
          'Keep pH and substrate/enzyme concentration constant; boiled enzyme confirms the reaction requires an active enzyme',
          'Change pH and volume simultaneously; boiled enzyme speeds up the reaction',
          'Keep temperature and time random; boiled enzyme acts as an indicator',
          'Only measure mass; boiled enzyme increases kinetic energy',
        ],
        answer:
          'Keep pH and substrate/enzyme concentration constant; boiled enzyme confirms the reaction requires an active enzyme',
        markingSchemeNotes: `[Examiner-Style M1/A1 Rubric] Award [B1] for pH (buffer) kept constant; award [B1] for enzyme/substrate concentration or volume kept constant; award [B1] for explaining that boiled (denatured) enzyme proves the change is due to enzymatic activity alone.`,
      }
    );
  } else {
    baseQuestions.push({
      number: extraStartNum,
      section: `${session} · ${paperNumber} · Structured Synthesis Practice`,
      marks: 4,
      question: `[Syllabus-Aligned Practice · ${yr} Series (${paperTitle})] Identify the primary analytical requirement when answering a structured command-word question in ${folder.subjectName} (${folder.syllabusCode}).`,
      options: [
        'Address the exact command word, support each point with syllabus evidence/terminology, and write concisely within the allotted marks',
        'Copy the entire stimulus passage verbatim without analysis',
        'Omit definitions and state only single-word fragments',
        'Ignore the mark allocation in brackets [ ]',
      ],
      answer:
        'Address the exact command word, support each point with syllabus evidence/terminology, and write concisely within the allotted marks',
      markingSchemeNotes: `[Examiner-Style M1/A1 Rubric] Award [M1] for direct command-word alignment; [A1] for accurate domain terminology; [B2] for structured evidence and conclusion.`,
    });
  }

  return baseQuestions;
}

/**
 * Builds an on-demand Question Paper (QP) or Marking Guide (MS) AcademicResourceItem for any session,
 * transparently labeled as a Syllabus-Aligned Practice Reconstruction.
 */
export function buildResourceForSessionPaper(
  folder: SubjectFolderSpec,
  session: string,
  paper: SubjectFolderSpec['papersOffered'][number],
  mode: 'QP' | 'MS' = 'QP'
): AcademicResourceItem {
  const qs = buildQuestionsForFolderSessionAndPaper(
    folder,
    session,
    paper.paperNumber,
    paper.paperTitle
  );
  const safeSess = session.replace(/[^a-zA-Z0-9]/g, '');
  const safePaper = paper.paperNumber.replace(/[^a-zA-Z0-9]/g, '');

  if (mode === 'MS') {
    return {
      id: `ppa-ms-${folder.id}-${safeSess}-${safePaper}`,
      title: `[MARKING GUIDE] ${folder.syllabusCode} ${folder.subjectName} (${session}) — ${paper.paperNumber} M1/A1 Rubric`,
      examFormat: folder.examFormat,
      kind: 'marking_scheme',
      subject: folder.subjectName,
      yearOrEdition: `${session} · Marking Guide (MS)`,
      paperCode: `${folder.syllabusCode} / ${paper.paperNumber} MS`,
      durationMinutes: paper.durationMinutes,
      totalMarks: paper.totalMarks,
      pagesCount: 14,
      fileSizeLabel: '1.1 MB',
      authorOrBody: `${folder.syllabusCode} Syllabus-Aligned Marking Guide`,
      description: `Structured M1 (Method), A1 (Accuracy), and B1 (Independent) marking rubric for ${session} ${folder.subjectName} (${paper.paperNumber}: ${paper.paperTitle}), including grade threshold reference (${folder.gradeThresholds.distinction}).`,
      tags: [
        'Marking Guide (MS)',
        'Syllabus-Aligned',
        folder.syllabusCode,
        folder.subjectName,
        session,
        paper.paperNumber,
        ...(folder.checkpointTier ? [folder.checkpointTier] : []),
      ],
      questions: qs,
      chapters: folder.textbookChapters,
    };
  }

  return {
    id: `ppa-paper-${folder.id}-${safeSess}-${safePaper}`,
    title: `${folder.syllabusCode} ${folder.subjectName} (${session}) — ${paper.paperNumber}: ${paper.paperTitle}`,
    examFormat: folder.examFormat,
    kind: 'past_paper',
    subject: folder.subjectName,
    yearOrEdition: session,
    paperCode: `${folder.syllabusCode} / ${paper.paperNumber}`,
    durationMinutes: paper.durationMinutes,
    totalMarks: paper.totalMarks,
    pagesCount: 16,
    fileSizeLabel: '1.4 MB',
    authorOrBody: `${folder.syllabusCode} Syllabus-Aligned Practice Archive`,
    description: `${session} ${folder.subjectName} (${paper.paperNumber} — ${paper.paperTitle}) formatted in written examination layout with Question Paper (QP), M1/A1 Marking Guide (MS), Examiner Insights (ER), and Grade Thresholds (GT: ${folder.gradeThresholds.distinction}).`,
    tags: [
      folder.syllabusCode,
      folder.subjectName,
      session,
      paper.paperNumber,
      'Syllabus-Aligned QP + MS',
      ...(folder.checkpointTier ? [folder.checkpointTier] : []),
    ],
    questions: qs,
  };
}

// Expand Subject Folders + Recent/Milestone Sessions + Marking Guides + Topical Packs into individual AcademicResourceItems
export function buildExpandedPastPaperAcademyResources(
  baseCatalog: AcademicResourceItem[]
): AcademicResourceItem[] {
  const generated: AcademicResourceItem[] = [];

  for (const folder of PAST_PAPER_ACADEMY_SUBJECTS) {
    // 1. Textbook entry for the subject folder
    generated.push({
      id: `ppa-book-${folder.id}`,
      title: folder.textbookTitle,
      examFormat: folder.examFormat,
      kind: 'textbook',
      subject: folder.subjectName,
      yearOrEdition: `Complete Curriculum Edition (Active Syllabus Reference)`,
      paperCode: `${folder.syllabusCode}-BOOK`,
      durationMinutes: 180,
      totalMarks: 100,
      pagesCount: 68,
      fileSizeLabel: '3.4 MB',
      authorOrBody: folder.textbookAuthor,
      description: `Recommended revision textbook companion for ${folder.syllabusCode} ${folder.subjectName} with key formulas, worked examples, and examiner guidance.`,
      tags: [
        'Textbook',
        folder.syllabusCode,
        folder.subjectName,
        folder.category,
        ...(folder.checkpointTier ? [folder.checkpointTier] : []),
      ],
      chapters: folder.textbookChapters,
      questions: folder.coreQuestions,
    });

    // 2. Syllabus & Marking Guide Compendium for the subject folder
    generated.push({
      id: `ppa-syllabus-${folder.id}`,
      title: `${folder.syllabusCode} ${folder.subjectName} — Syllabus Specification, Marking Guide & Grade Thresholds`,
      examFormat: folder.examFormat,
      kind: 'marking_scheme',
      subject: folder.subjectName,
      yearOrEdition: `Active Syllabus & Marking Guide Reference`,
      paperCode: `${folder.syllabusCode}-MS-ER`,
      durationMinutes: 90,
      totalMarks: 100,
      pagesCount: 32,
      fileSizeLabel: '1.8 MB',
      authorOrBody: `${folder.syllabusCode} Curriculum & Assessment Guide`,
      description: `Examiner insights, M1/A1/B1 marking rubrics, and grade threshold reference (${folder.gradeThresholds.distinction}) for ${folder.subjectName}.`,
      tags: [
        'Syllabus & Marking Guide',
        folder.syllabusCode,
        folder.subjectName,
        ...(folder.checkpointTier ? [folder.checkpointTier] : []),
      ],
      questions: folder.coreQuestions,
      chapters: folder.textbookChapters,
    });

    // 3. Index recent & milestone sessions in the flat grid while keeping full session list available on-demand in folder browser
    const indexedSessions = folder.sessions.slice(0, 8);
    for (let sIdx = 0; sIdx < indexedSessions.length; sIdx++) {
      const session = indexedSessions[sIdx];
      for (const paper of folder.papersOffered) {
        const safeSess = session.replace(/[^a-zA-Z0-9]/g, '');
        const safePaper = paper.paperNumber.replace(/[^a-zA-Z0-9]/g, '');
        generated.push({
          id: `ppa-paper-${folder.id}-${safeSess}-${safePaper}`,
          title: `${folder.syllabusCode} ${folder.subjectName} (${session}) — ${paper.paperNumber}: ${paper.paperTitle}`,
          examFormat: folder.examFormat,
          kind: 'past_paper',
          subject: folder.subjectName,
          yearOrEdition: session,
          paperCode: `${folder.syllabusCode} / ${paper.paperNumber}`,
          durationMinutes: paper.durationMinutes,
          totalMarks: paper.totalMarks,
          pagesCount: 16,
          fileSizeLabel: '1.4 MB',
          authorOrBody: `${folder.syllabusCode} Syllabus-Aligned Practice Archive`,
          description: `${session} ${folder.subjectName} (${paper.paperNumber} — ${paper.paperTitle}) written examination practice paper with Question Paper (QP), M1/A1 Marking Guide (MS), and Grade Thresholds (GT: ${folder.gradeThresholds.distinction}).`,
          tags: [
            folder.syllabusCode,
            folder.subjectName,
            session,
            paper.paperNumber,
            'Syllabus-Aligned QP + MS',
            ...(folder.checkpointTier ? [folder.checkpointTier] : []),
          ],
          questions: folder.coreQuestions,
        });

        if (sIdx < 4) {
          generated.push({
            id: `ppa-ms-${folder.id}-${safeSess}-${safePaper}`,
            title: `[MARKING GUIDE] ${folder.syllabusCode} ${folder.subjectName} (${session}) — ${paper.paperNumber} M1/A1 Rubric`,
            examFormat: folder.examFormat,
            kind: 'marking_scheme',
            subject: folder.subjectName,
            yearOrEdition: `${session} · Marking Guide`,
            paperCode: `${folder.syllabusCode} / ${paper.paperNumber} MS`,
            durationMinutes: paper.durationMinutes,
            totalMarks: paper.totalMarks,
            pagesCount: 12,
            fileSizeLabel: '1.1 MB',
            authorOrBody: `${folder.syllabusCode} Syllabus-Aligned Marking Guide`,
            description: `Examiner-style M1/A1/B1 marking rubric for ${session} ${folder.subjectName} (${paper.paperNumber}) with point breakdown and acceptable candidate responses.`,
            tags: [
              'Marking Guide (MS)',
              folder.syllabusCode,
              folder.subjectName,
              session,
              paper.paperNumber,
              ...(folder.checkpointTier ? [folder.checkpointTier] : []),
            ],
            questions: folder.coreQuestions,
          });
        }
      }
    }
  }

  // 4. Include all Topical Past Paper Packs in the unified archive
  for (const pack of TOPICAL_PAST_PAPER_PACKS) {
    generated.push({
      id: `ppa-topical-${pack.id}`,
      title: `${pack.topicName} (${pack.subject})`,
      examFormat: pack.examFormat,
      kind: 'past_paper',
      subject: pack.subject,
      yearOrEdition: pack.yearsCovered,
      paperCode: `TOPICAL-${pack.examFormat.toUpperCase()}`,
      durationMinutes: 60,
      totalMarks: pack.questionCount * 2,
      pagesCount: 14,
      fileSizeLabel: '1.2 MB',
      authorOrBody: 'Syllabus Topical Practice Archive',
      description: `Topical practice booklet (${pack.yearsCovered}) covering ${pack.keySubtopics.join(', ')} with step-by-step M1/A1 marking rubric.`,
      tags: ['Topical Practice', pack.subject, ...pack.keySubtopics],
      questions: [pack.sampleQuestion],
    });
  }

  // Merge without duplicate IDs
  const seen = new Set(baseCatalog.map((b) => b.id));
  const merged = [...baseCatalog];
  for (const item of generated) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }
  return merged;
}


