import { ExamFormatId } from '../types/quiz';
import {
  AcademicResourceItem,
  PastPaperQuestionItem,
  TextbookChapterItem,
} from '../components/PastPapersHubView';

export interface SubjectFolderSpec {
  id: string;
  examFormat: ExamFormatId;
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

  // ==================== 4. CAMBRIDGE CHECKPOINT (STAGE 7–9) ====================
  {
    id: 'checkpoint-0862-0893-0861',
    examFormat: 'checkpoint',
    syllabusCode: 'CIE 0862 / 0893 / 0861',
    subjectName: 'Cambridge Lower Secondary Checkpoint (Math, Science & English)',
    category: 'Sciences',
    iconEmoji: '🏛️',
    sessions: ['2024 October Series', '2024 April Series', '2023 October Series', '2023 April Series', '2022 October Series'],
    papersOffered: [
      { paperNumber: 'Paper 1', paperTitle: 'Non-Calculator / Structured Core Paper', durationMinutes: 60, totalMarks: 50 },
      { paperNumber: 'Paper 2', paperTitle: 'Calculator / Extended Enquiry Paper', durationMinutes: 60, totalMarks: 50 },
    ],
    gradeThresholds: { distinction: 'Band 5.0–6.0 (Outstanding)', credit: 'Band 3.0–4.9 (Solid)', pass: 'Band 2.0–2.9' },
    examinerInsights: [
      'Show clear working on all 2-mark and 3-mark questions; method marks (M1) are awarded even if arithmetic slips occur.',
    ],
    coreQuestions: [
      {
        number: 1,
        section: 'Mathematics 0862 · Paper 1',
        marks: 2,
        question: 'Work out 3/4 ÷ 9/16 in its simplest fraction form.',
        options: ['4/3 (or 1 1/3)', '27/64', '3/4', '9/12'],
        answer: '4/3 (or 1 1/3)',
        markingSchemeNotes: '3/4 × 16/9 [M1] = 4/3 or 1 1/3 [A1].',
      },
    ],
    textbookTitle: 'Cambridge Lower Secondary Complete Mathematics & Science Stage 7–9',
    textbookAuthor: 'Hodder Education / Cambridge University Press',
    textbookChapters: [
      {
        chapterNumber: 1,
        title: 'Stage 9 Algebraic Sequences, Reactivity Series & Scientific Enquiry',
        summary: 'nth term rules, metal displacement reactions, density/pressure formulas, and control variables.',
        keyFormulasOrRules: [
          'Pressure P = Force / Area (N/m² or Pa)  |  Density ρ = Mass / Volume (g/cm³)',
          'nth term of linear sequence: T_n = a + (n - 1)d',
        ],
        workedExample: {
          problem: 'A block of mass 240 g has volume 80 cm³. Calculate its density.',
          solution: 'Density = 240 g / 80 cm³ = 3.0 g/cm³.',
        },
        practicePrompt: 'Cambridge Checkpoint Stage 9 Mathematics and Science',
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
];

// Expand ALL Subject Folders + ALL Sessions + ALL Topical Packs into individual downloadable AcademicResourceItems
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
      yearOrEdition: 'Complete Curriculum Edition',
      paperCode: `${folder.syllabusCode}-BOOK`,
      durationMinutes: 180,
      totalMarks: 100,
      pagesCount: 68,
      fileSizeLabel: '3.4 MB',
      authorOrBody: folder.textbookAuthor,
      description: `Official recommended textbook & revision companion for ${folder.syllabusCode} ${folder.subjectName} with key formulas, worked examples, and examiner tips.`,
      tags: ['Textbook', folder.syllabusCode, folder.subjectName, folder.category],
      chapters: folder.textbookChapters,
      questions: folder.coreQuestions,
    });

    // 2. Official Syllabus & Examiner Report Compendium for the subject folder
    generated.push({
      id: `ppa-syllabus-${folder.id}`,
      title: `${folder.syllabusCode} ${folder.subjectName} — Official Syllabus, Examiner Report & Grade Thresholds`,
      examFormat: folder.examFormat,
      kind: 'marking_scheme',
      subject: folder.subjectName,
      yearOrEdition: '2024–2026 Official Syllabus',
      paperCode: `${folder.syllabusCode}-SYLLABUS-ER`,
      durationMinutes: 90,
      totalMarks: 100,
      pagesCount: 24,
      fileSizeLabel: '1.1 MB',
      authorOrBody: `${folder.syllabusCode} Chief Examiner Panel`,
      description: `Principal Examiner insights, common candidate pitfalls, M1/A1 marking conventions, and official grade thresholds (${folder.gradeThresholds.distinction}) for ${folder.subjectName}.`,
      tags: ['Syllabus & Examiner Report', folder.syllabusCode, folder.subjectName, 'Grade Thresholds'],
      questions: folder.coreQuestions,
      chapters: folder.textbookChapters,
    });

    // 3. Past paper entries for EVERY session & EVERY paper offered
    for (const session of folder.sessions) {
      for (const paper of folder.papersOffered) {
        generated.push({
          id: `ppa-paper-${folder.id}-${session.replace(/[^a-zA-Z0-9]/g, '')}-${paper.paperNumber.replace(/[^a-zA-Z0-9]/g, '')}`,
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
          authorOrBody: `Official ${folder.syllabusCode} Past Paper Archive`,
          description: `${session} ${folder.subjectName} (${paper.paperNumber} — ${paper.paperTitle}) complete with Question Paper (QP), Official Marking Scheme (MS), Examiner Report (ER), and Grade Thresholds (GT: ${folder.gradeThresholds.distinction}).`,
          tags: [folder.syllabusCode, folder.subjectName, session, paper.paperNumber, 'QP + MS + ER'],
          questions: folder.coreQuestions.map((q, idx) => ({
            ...q,
            number: idx + 1,
            section: `${session} · ${paper.paperNumber}`,
          })),
        });
      }
    }
  }

  // 4. Also include all Topical Past Paper Packs in the unified archive
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
      authorOrBody: 'PastPaperAcademy Topical Archive',
      description: `Topical past paper booklet (${pack.yearsCovered}) covering ${pack.keySubtopics.join(', ')} with step-by-step marking scheme.`,
      tags: ['Topical Past Paper', pack.subject, ...pack.keySubtopics],
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
