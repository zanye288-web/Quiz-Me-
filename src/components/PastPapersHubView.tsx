import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Download,
  Search,
  GraduationCap,
  CheckCircle2,
  Sparkles,
  Play,
  Eye,
  Printer,
  Bookmark,
  BookmarkCheck,
  Award,
  Clock,
  Layers,
  Filter,
  X,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  FileSpreadsheet,
  FolderDown,
} from 'lucide-react';
import {
  ExamFormatId,
  PersonaType,
  QuizResponse,
  Question,
} from '../types/quiz';
import {
  EXAM_FORMAT_CATALOG,
  getExamFormatSpec,
  buildPrebuiltExamByFormat,
  evaluateExamBoardGrade,
} from '../utils/examFormats';
import {
  PAST_PAPER_ACADEMY_SUBJECTS,
  TOPICAL_PAST_PAPER_PACKS,
  buildExpandedPastPaperAcademyResources,
  buildResourceForSessionPaper,
  getWrittenExamPaperHeaderMeta,
  getDocumentProvenanceMeta,
  EXAM_BOARD_INCEPTION_YEARS,
  SubjectFolderSpec,
  TopicalPastPaperPack,
} from '../data/pastPaperAcademyCatalog';
import { soundFx } from '../utils/audio';
import { OpenAccessHubView } from './open-access/OpenAccessHubView';

export type ResourceKind = 'past_paper' | 'textbook' | 'marking_scheme' | 'syllabus';

export interface PastPaperQuestionItem {
  number: number;
  section: string;
  marks: number;
  question: string;
  options?: string[];
  answer: string;
  markingSchemeNotes: string;
}

export interface TextbookChapterItem {
  chapterNumber: number;
  title: string;
  summary: string;
  keyFormulasOrRules: string[];
  workedExample: {
    problem: string;
    solution: string;
  };
  practicePrompt: string;
}

export interface AcademicResourceItem {
  id: string;
  title: string;
  examFormat: ExamFormatId;
  kind: ResourceKind;
  subject: string;
  yearOrEdition: string;
  paperCode: string;
  durationMinutes: number;
  totalMarks: number;
  pagesCount: number;
  fileSizeLabel: string;
  authorOrBody: string;
  description: string;
  tags: string[];
  questions?: PastPaperQuestionItem[];
  chapters?: TextbookChapterItem[];
}

interface PastPapersHubViewProps {
  persona: PersonaType;
  selectedExamFormat?: ExamFormatId;
  onStartQuiz: (quiz: QuizResponse) => void;
  onOpenNotesGenerator?: (topic: string, examFormat: ExamFormatId) => void;
  onOpenWorksheet?: (quiz: QuizResponse) => void;
}

const SAVED_RESOURCES_KEY = 'quizme_saved_past_papers_v1';

export const ACADEMIC_RESOURCES_CATALOG: AcademicResourceItem[] = [
  // ==================== WAEC (WASSCE) ====================
  {
    id: 'waec-math-2024-p12',
    title: 'WASSCE General Mathematics Paper 1 & 2 (Objective & Theory)',
    examFormat: 'waec',
    kind: 'past_paper',
    subject: 'Mathematics',
    yearOrEdition: 'May/June 2024',
    paperCode: 'WAEC 402/1 & 402/2',
    durationMinutes: 150,
    totalMarks: 150,
    pagesCount: 18,
    fileSizeLabel: '1.4 MB',
    authorOrBody: 'West African Examinations Council (WAEC)',
    description:
      'Complete 50 multiple-choice objective items and 13 compulsory/optional Section A & B theory questions covering Indices, Logarithms, Mensuration, Trigonometry, Circle Theorems, and Statistics with full M1/A1 marking scheme.',
    tags: ['WAEC', 'WASSCE 2024', 'Mathematics', 'Objectives + Theory', 'Marking Scheme'],
    questions: [
      {
        number: 1,
        section: 'Paper 1 · Section A (Objective)',
        marks: 2,
        question: 'Evaluate (0.0064)^(-1/2) leaving your answer in standard form.',
        options: ['1.25 × 10^1', '1.25 × 10^(-1)', '8.0 × 10^(-2)', '1.25 × 10^2'],
        answer: '1.25 × 10^1',
        markingSchemeNotes:
          '0.0064 = 64 × 10^(-4) [M1]. Raising to power (-1/2) gives (8 × 10^(-2))^(-1) = 1 / 0.08 = 12.5 = 1.25 × 10^1 [A1].',
      },
      {
        number: 2,
        section: 'Paper 1 · Section A (Objective)',
        marks: 2,
        question: 'If log_10(2x + 1) - log_10(3x - 2) = 1, find the value of x.',
        options: ['x = 3/4', 'x = 21/28 (or 3/4)', 'x = 7/4', 'x = 4/3'],
        answer: 'x = 3/4',
        markingSchemeNotes:
          'Apply quotient law: log_10((2x + 1)/(3x - 2)) = 1 => (2x + 1)/(3x - 2) = 10^1 = 10 [M1]. 2x + 1 = 30x - 20 => 28x = 21 => x = 21/28 = 3/4 [A1].',
      },
      {
        number: 3,
        section: 'Paper 1 · Section A (Objective)',
        marks: 2,
        question: 'A chord of length 24 cm is 5 cm from the center of a circle. Calculate the radius of the circle.',
        options: ['13 cm', '12 cm', '17 cm', '15 cm'],
        answer: '13 cm',
        markingSchemeNotes:
          'Perpendicular from center bisects chord into 12 cm segments [M1]. By Pythagoras theorem: r = √(12² + 5²) = √(144 + 25) = √169 = 13 cm [A1].',
      },
      {
        number: 4,
        section: 'Paper 2 · Section B (Essay / Theory)',
        marks: 12,
        question:
          'In a class of 50 students, 30 offer Physics, 25 offer Chemistry, and 10 offer neither subject. (a) Find the number of students who offer both subjects. (b) Find the probability that a student chosen at random offers Physics only.',
        options: [
          '15 offer both; P(Physics only) = 15/50 = 3/10',
          '10 offer both; P(Physics only) = 20/50 = 2/5',
          '5 offer both; P(Physics only) = 25/50 = 1/2',
          '15 offer both; P(Physics only) = 30/50 = 3/5',
        ],
        answer: '15 offer both; P(Physics only) = 15/50 = 3/10',
        markingSchemeNotes:
          'n(U) = 50, n(P ∪ C) = 50 - 10 = 40 [M1]. Let n(P ∩ C) = x. Then (30 - x) + x + (25 - x) = 40 => 55 - x = 40 => x = 15 [A1]. Physics only = 30 - 15 = 15. Probability = 15/50 = 3/10 [A1].',
      },
    ],
  },
  {
    id: 'waec-physics-2024-p12',
    title: 'WASSCE Physics Paper 1, 2 & 3 (Objectives, Theory & Practical)',
    examFormat: 'waec',
    kind: 'past_paper',
    subject: 'Physics',
    yearOrEdition: 'May/June 2024',
    paperCode: 'WAEC 512/1–3',
    durationMinutes: 165,
    totalMarks: 160,
    pagesCount: 22,
    fileSizeLabel: '1.8 MB',
    authorOrBody: 'West African Examinations Council (WAEC)',
    description:
      'Official WASSCE Physics Past Question Paper covering Mechanics, Projectile Motion, Heat Capacity, Waves, Optics, Current Electricity, and Atomic Physics with Chief Examiner solutions.',
    tags: ['WAEC', 'Physics', 'Mechanics & Electricity', 'Practical Alternative'],
    questions: [
      {
        number: 1,
        section: 'Paper 1 · Objective',
        marks: 2,
        question:
          'A body of mass 4 kg is accelerated from 10 m/s to 25 m/s in 5 seconds. Calculate the net force acting on the body.',
        options: ['12 N', '15 N', '20 N', '60 N'],
        answer: '12 N',
        markingSchemeNotes:
          'Acceleration a = (v - u)/t = (25 - 10)/5 = 3 m/s² [M1]. Force F = ma = 4 kg × 3 m/s² = 12 N [A1].',
      },
      {
        number: 2,
        section: 'Paper 1 · Objective',
        marks: 2,
        question:
          'Three resistors of resistance 2 Ω, 3 Ω, and 6 Ω are connected in parallel. What is their equivalent resistance?',
        options: ['1.0 Ω', '11.0 Ω', '0.5 Ω', '2.0 Ω'],
        answer: '1.0 Ω',
        markingSchemeNotes:
          '1/R_eq = 1/2 + 1/3 + 1/6 = (3 + 2 + 1)/6 = 6/6 = 1 Ω⁻¹ => R_eq = 1.0 Ω [M1, A1].',
      },
      {
        number: 3,
        section: 'Paper 2 · Structured Theory',
        marks: 10,
        question:
          'A projectile is launched at 40 m/s at an angle of 30° to the horizontal (take g = 10 m/s²). Calculate the maximum height reached and the total time of flight.',
        options: [
          'Max Height = 20 m; Time of Flight = 4.0 s',
          'Max Height = 40 m; Time of Flight = 8.0 s',
          'Max Height = 20 m; Time of Flight = 2.0 s',
          'Max Height = 15 m; Time of Flight = 3.5 s',
        ],
        answer: 'Max Height = 20 m; Time of Flight = 4.0 s',
        markingSchemeNotes:
          'H = (u² sin²θ)/(2g) = (1600 × 0.25)/20 = 20 m [M1, A1]. T = (2u sinθ)/g = (2 × 40 × 0.5)/10 = 4.0 s [M1, A1].',
      },
    ],
  },
  {
    id: 'waec-textbook-math-ngm',
    title: 'New General Mathematics for Senior Secondary Schools (SS1–SS3 Compendium)',
    examFormat: 'waec',
    kind: 'textbook',
    subject: 'Mathematics',
    yearOrEdition: 'Revised WASSCE / NECO Edition',
    paperCode: 'TEXT-WAEC-MTH-01',
    durationMinutes: 180,
    totalMarks: 100,
    pagesCount: 64,
    fileSizeLabel: '3.2 MB',
    authorOrBody: 'Macrae, Kalejaiye, Chima et al. (Study Compendium)',
    description:
      'Complete WAEC/NECO Senior Secondary Mathematics textbook companion with worked examples, logarithm & trigonometric tables guide, geometric proofs, and graded revision exercises.',
    tags: ['Textbook', 'WAEC', 'NECO', 'SS1-SS3 Mathematics', 'Worked Examples'],
    chapters: [
      {
        chapterNumber: 1,
        title: 'Indices, Logarithms & Surds',
        summary:
          'Covers laws of indices, standard form, fractional & negative exponents, logarithm laws, and rationalization of conjugate surds.',
        keyFormulasOrRules: [
          'a^m × a^n = a^(m + n)  |  a^m ÷ a^n = a^(m - n)  |  a^(-n) = 1 / a^n',
          'log_b(MN) = log_b(M) + log_b(N)  |  log_b(M/N) = log_b(M) - log_b(N)',
          'Rationalizing surds: 1 / (a + √b) = (a - √b) / (a² - b)',
        ],
        workedExample: {
          problem: 'Simplify: √75 - √27 + √48',
          solution: '√(25×3) - √(9×3) + √(16×3) = 5√3 - 3√3 + 4√3 = 6√3.',
        },
        practicePrompt: 'Laws of Indices, Logarithms and Rationalizing Surds',
      },
      {
        chapterNumber: 2,
        title: 'Quadratic Equations, Functions & Graphs',
        summary:
          'Factorization, completing the square, quadratic formula, sum and product of roots (α + β = -b/a, αβ = c/a), and graphical turning points.',
        keyFormulasOrRules: [
          'x = [-b ± √(b² - 4ac)] / (2a)',
          'Discriminant Δ = b² - 4ac (>0 two distinct real roots, =0 equal roots, <0 complex roots)',
          'Equation from roots α, β: x² - (α + β)x + αβ = 0',
        ],
        workedExample: {
          problem: 'If α and β are the roots of 2x² - 7x + 3 = 0, find α + β and αβ.',
          solution: 'Here a = 2, b = -7, c = 3. Sum α + β = -(-7)/2 = 7/2. Product αβ = 3/2.',
        },
        practicePrompt: 'Quadratic Equations, Roots and Discriminants',
      },
      {
        chapterNumber: 3,
        title: 'Circle Theorems & Mensuration of Plane/Solid Shapes',
        summary:
          'Angles subtended by arcs, cyclic quadrilaterals, alternate segment theorem, arc length, sector area, and surface area/volume of cones, spheres, and frustums.',
        keyFormulasOrRules: [
          'Angle at center = 2 × Angle at circumference subtended by the same arc',
          'Opposite interior angles of a cyclic quadrilateral sum to 180°',
          'Length of Arc = (θ/360°) × 2πr  |  Area of Sector = (θ/360°) × πr²',
        ],
        workedExample: {
          problem: 'Find the area of a sector of a circle of radius 14 cm subtending an angle of 90° at the center (π = 22/7).',
          solution: 'Area = (90/360) × (22/7) × 14 × 14 = (1/4) × 616 = 154 cm².',
        },
        practicePrompt: 'Circle Theorems, Cyclic Quadrilaterals and Sector Mensuration',
      },
    ],
  },
  {
    id: 'waec-textbook-physics-anyakoha',
    title: 'New School Physics & Essential Chemistry Core Revision Textbook',
    examFormat: 'waec',
    kind: 'textbook',
    subject: 'Physics & Chemistry',
    yearOrEdition: 'Senior Secondary Compendium',
    paperCode: 'TEXT-WAEC-SCI-02',
    durationMinutes: 180,
    totalMarks: 100,
    pagesCount: 58,
    fileSizeLabel: '2.9 MB',
    authorOrBody: 'M.W. Anyakoha / Odesina Syllabus Guide',
    description:
      'Essential WAEC/JAMB/NECO Physics and Chemistry reference textbook with derivations, Faraday’s laws of electrolysis, gas laws, stoichiometry, and circuit analysis.',
    tags: ['Textbook', 'Physics', 'Chemistry', 'WAEC & JAMB', 'Formulas & Laws'],
    chapters: [
      {
        chapterNumber: 1,
        title: 'Kinematics, Newton’s Laws & Work-Energy-Power',
        summary:
          'Uniformly accelerated motion, projectile trajectories, conservation of linear momentum, elastic/inelastic collisions, and mechanical efficiency.',
        keyFormulasOrRules: [
          'v = u + at  |  s = ut + ½at²  |  v² = u² + 2as',
          'Impulse I = Ft = mv - mu  |  Kinetic Energy KE = ½mv²',
          'Efficiency η = (Work Output / Work Input) × 100% = (MA / VR) × 100%',
        ],
        workedExample: {
          problem: 'A machine of velocity ratio 5 lifts a load of 400 N with an effort of 100 N. Find its efficiency.',
          solution: 'Mechanical Advantage MA = Load / Effort = 400 / 100 = 4. Efficiency = (4 / 5) × 100% = 80%.',
        },
        practicePrompt: 'Kinematics, Mechanical Advantage and Conservation of Energy',
      },
      {
        chapterNumber: 2,
        title: 'Gas Laws, Mole Concept & Electrolysis (Faraday’s Laws)',
        summary:
          'Boyle’s law, Charles’s law, Ideal Gas Equation (PV = nRT), molar mass stoichiometry, and quantitative electrolysis calculations.',
        keyFormulasOrRules: [
          '(P₁V₁)/T₁ = (P₂V₂)/T₂  (Temperature T must be in Kelvin: K = °C + 273)',
          'Quantity of Electricity Q = I × t (Coulombs)  |  1 Faraday = 96,500 C/mol e⁻',
          'Mass deposited m = (Molar Mass × I × t) / (z × 96,500)',
        ],
        workedExample: {
          problem: 'Calculate the mass of copper deposited when a current of 2.0 A flows through CuSO4 solution for 965 seconds (Cu = 64, 1 F = 96,500 C).',
          solution: 'Q = It = 2.0 × 965 = 1930 C. Cu²⁺ + 2e⁻ → Cu requires 2 × 96,500 C for 64 g. Mass = (64 × 1930) / (2 × 96500) = 0.64 g.',
        },
        practicePrompt: 'Electrolysis Faraday Laws and Ideal Gas Stoichiometry',
      },
    ],
  },

  // ==================== JAMB (UTME CBT) ====================
  {
    id: 'jamb-cbt-2024-pack',
    title: 'JAMB UTME 2024 CBT Past Questions: Use of English, Math, Physics & Chemistry',
    examFormat: 'jamb',
    kind: 'past_paper',
    subject: 'UTME 4-Subject Aggregate',
    yearOrEdition: '2024 UTME CBT Series',
    paperCode: 'JAMB-CBT-2024-400',
    durationMinutes: 120,
    totalMarks: 400,
    pagesCount: 24,
    fileSizeLabel: '1.6 MB',
    authorOrBody: 'Joint Admissions and Matriculation Board (JAMB)',
    description:
      'High-speed JAMB CBT past questions with step-by-step explanations covering Use of English (Comprehension, Lexis, Oral Forms), Mathematics, Physics, and Chemistry.',
    tags: ['JAMB UTME', 'CBT Past Paper', '400 Aggregate', 'Speed Drill'],
    questions: [
      {
        number: 1,
        section: 'Use of English · Lexis & Structure',
        marks: 2,
        question:
          'Choose the option nearest in meaning to the emphasized word: The chairman’s remarks were considered *innocuous* by the committee.',
        options: ['Harmless', 'Offensive', 'Provocative', 'Ambiguous'],
        answer: 'Harmless',
        markingSchemeNotes:
          '"Innocuous" means not harmful or offensive (harmless). Frequently tested in JAMB Synonym/Antonym sections.',
      },
      {
        number: 2,
        section: 'Mathematics · Calculus & Algebra',
        marks: 2,
        question: 'Find the derivative dy/dx of the function y = 3x³ - 5x² + 4x - 9 at x = 2.',
        options: ['20', '16', '24', '12'],
        answer: '20',
        markingSchemeNotes:
          'dy/dx = 9x² - 10x + 4. At x = 2: 9(4) - 10(2) + 4 = 36 - 20 + 4 = 20.',
      },
      {
        number: 3,
        section: 'Chemistry · Atomic Structure & Periodicity',
        marks: 2,
        question:
          'An element X has atomic number 17. What is the formula of the compound formed when X combines with Magnesium (atomic number 12)?',
        options: ['MgX2', 'Mg2X', 'MgX', 'Mg3X2'],
        answer: 'MgX2',
        markingSchemeNotes:
          'Mg (2,8,2) has valency +2; X (2,8,7, Chlorine) has valency -1. Crossing valencies yields MgX2.',
      },
      {
        number: 4,
        section: 'Physics · Electrostatics & Capacitors',
        marks: 2,
        question: 'Calculate the energy stored in a 20 μF capacitor charged to a potential difference of 100 V.',
        options: ['0.10 J', '1.00 J', '0.20 J', '2.00 J'],
        answer: '0.10 J',
        markingSchemeNotes:
          'E = ½CV² = 0.5 × (20 × 10⁻⁶ F) × (100²) = 10 × 10⁻⁶ × 10⁴ = 0.10 J.',
      },
    ],
  },
  {
    id: 'jamb-remix-textbook',
    title: 'JAMB UTME Remix & Syllabus Mastery Compendium (All Core Subjects)',
    examFormat: 'jamb',
    kind: 'textbook',
    subject: 'Use of English & Sciences',
    yearOrEdition: '2025/2026 UTME Syllabus Edition',
    paperCode: 'TEXT-JAMB-RMX-01',
    durationMinutes: 120,
    totalMarks: 400,
    pagesCount: 48,
    fileSizeLabel: '2.5 MB',
    authorOrBody: 'UTME Academic Board Compendium',
    description:
      'Targeted JAMB CBT study textbook covering Concord rules, Oral English vowel/consonant traps, Organic Chemistry functional groups, and rapid mental math shortcuts.',
    tags: ['Textbook', 'JAMB Remix', 'Use of English', 'CBT Shortcuts'],
    chapters: [
      {
        chapterNumber: 1,
        title: '24 Golden Rules of English Concord & Subjunctive Mood',
        summary:
          'Master proximity concord (neither...nor), parenthetical accompaniment (along with, as well as), collective nouns, and high-tense triggers (It is high time + past tense).',
        keyFormulasOrRules: [
          'Subject + "along with / together with / as well as" + Noun → Verb agrees with the FIRST subject',
          '"Neither A nor B" / "Either A or B" → Verb agrees with the NEARER subject (B)',
          '"It is high time / It is about time + Subject + Simple Past Verb" (e.g., It is high time we left)',
        ],
        workedExample: {
          problem: 'Choose the correct verb: The principal, together with his vice-principals, (is / are) attending the seminar.',
          solution: 'The singular head subject "The principal" governs the verb despite "together with his vice-principals". Answer: "is".',
        },
        practicePrompt: 'JAMB Use of English Concord Rules and Lexis',
      },
      {
        chapterNumber: 2,
        title: 'Organic Chemistry IUPAC Nomenclature & Homologous Series',
        summary:
          'Alkanes, Alkenes, Alkynes, Alkanols, Alkanals, Alkanones, Alkanoic acids, and Esterification reactions tested in JAMB Chemistry.',
        keyFormulasOrRules: [
          'Alkanes: C_n H_(2n+2) (Substitution)  |  Alkenes: C_n H_(2n) (Addition, decolorizes bromine water)',
          'Primary Alkanol --[O]--> Alkanal --[O]--> Alkanoic Acid',
          'Alkanol + Alkanoic Acid ⇌ Alkyl Alkanoate (Ester) + Water (conc. H2SO4 catalyst)',
        ],
        workedExample: {
          problem: 'What is the product of reacting ethanoic acid with ethanol in the presence of concentrated H2SO4?',
          solution: 'Ethyl ethanoate (CH3COOC2H5, a sweet-smelling ester) and water.',
        },
        practicePrompt: 'Organic Chemistry Homologous Series and Functional Groups',
      },
    ],
  },

  // ==================== CAMBRIDGE CHECKPOINT ====================
  {
    id: 'checkpoint-math-sci-2024',
    title: 'Cambridge Lower Secondary Checkpoint Mathematics (0862) & Science (0893) Papers 1 & 2',
    examFormat: 'checkpoint',
    kind: 'past_paper',
    subject: 'Mathematics & Science',
    yearOrEdition: 'October 2024 Series',
    paperCode: 'CIE 0862/01 & 0893/02',
    durationMinutes: 60,
    totalMarks: 50,
    pagesCount: 16,
    fileSizeLabel: '1.2 MB',
    authorOrBody: 'Cambridge Assessment International Education (CAIE)',
    description:
      'Authentic Stage 9 Cambridge Checkpoint structured past paper with command words (State, Explain, Calculate, Suggest) and Band 0.0–6.0 mark scheme.',
    tags: ['Cambridge Checkpoint', 'Stage 9', '0862 Math', '0893 Science', 'Mark Scheme'],
    questions: [
      {
        number: 1,
        section: 'Mathematics 0862 · Paper 1 (Non-Calculator)',
        marks: 2,
        question: 'Work out the value of 3/4 ÷ 9/16. Give your answer in its simplest form.',
        options: ['4/3 (or 1 1/3)', '27/64', '3/4', '12/9'],
        answer: '4/3 (or 1 1/3)',
        markingSchemeNotes:
          '3/4 × 16/9 [M1] = 48/36 = 4/3 or 1 1/3 [A1].',
      },
      {
        number: 2,
        section: 'Mathematics 0862 · Paper 2 (Calculator)',
        marks: 3,
        question:
          'The nth term of a sequence is given by T_n = 4n - 7. Work out the sum of the 5th term and the 10th term.',
        options: ['46', '53', '60', '39'],
        answer: '46',
        markingSchemeNotes:
          '5th term = 4(5) - 7 = 13 [B1]. 10th term = 4(10) - 7 = 33 [B1]. Sum = 13 + 33 = 46 [A1].',
      },
      {
        number: 3,
        section: 'Science 0893 · Paper 1 (Structured)',
        marks: 3,
        question:
          'Magnesium ribbon reacts with dilute hydrochloric acid to produce a salt and a gas. State the name of the salt formed and describe the chemical test for the gas.',
        options: [
          'Magnesium chloride; Hydrogen gas gives a squeaky pop with a lighted splint',
          'Magnesium sulfate; Oxygen gas relights a glowing splint',
          'Magnesium oxide; Carbon dioxide turns limewater milky',
          'Magnesium hydride; Chlorine bleaches damp litmus paper',
        ],
        answer: 'Magnesium chloride; Hydrogen gas gives a squeaky pop with a lighted splint',
        markingSchemeNotes:
          'Salt: Magnesium chloride (MgCl2) [1 mark]. Gas: Hydrogen (H2) [1 mark]; test with lighted splint produces a squeaky pop [1 mark].',
      },
    ],
  },
  {
    id: 'checkpoint-learner-textbook',
    title: 'Cambridge Lower Secondary Checkpoint Stage 7–9 Complete Revision Coursebook',
    examFormat: 'checkpoint',
    kind: 'textbook',
    subject: 'Mathematics, Science & English',
    yearOrEdition: 'Cambridge Curriculum Framework Edition',
    paperCode: 'TEXT-CIE-CHK-09',
    durationMinutes: 90,
    totalMarks: 50,
    pagesCount: 44,
    fileSizeLabel: '2.1 MB',
    authorOrBody: 'Cambridge International Curriculum Series',
    description:
      'Stage 7, 8 & 9 Checkpoint Learner’s Textbook covering Number, Algebra, Geometry, Scientific Enquiry, Photosynthesis, Forces, and Reactivity Series.',
    tags: ['Textbook', 'Cambridge Checkpoint', 'Stage 7–9', 'Scientific Enquiry'],
    chapters: [
      {
        chapterNumber: 1,
        title: 'Reactivity Series of Metals & Displacement Reactions',
        summary:
          'Order of reactivity from Potassium to Gold, reactions with cold water, steam, and dilute acids, and displacement of less reactive metals from aqueous salt solutions.',
        keyFormulasOrRules: [
          'Order: K > Na > Ca > Mg > Al > (C) > Zn > Fe > Pb > (H) > Cu > Ag > Au',
          'More reactive metal displaces a less reactive metal from its salt solution',
          'Metal + Acid → Salt + Hydrogen gas (squeaky pop test)',
        ],
        workedExample: {
          problem: 'Explain what happens when a strip of zinc metal is placed in blue copper(II) sulfate solution.',
          solution:
            'Zinc is higher in the reactivity series than copper, so zinc displaces copper: Zn + CuSO4 → ZnSO4 + Cu. The blue solution fades to colorless and a reddish-brown coating of copper forms.',
        },
        practicePrompt: 'Cambridge Checkpoint Reactivity Series and Displacement Reactions',
      },
    ],
  },

  // ==================== NECO (SSCE) ====================
  {
    id: 'neco-ssce-2024-bio-math',
    title: 'NECO SSCE Internal June/July 2024 Biology & Mathematics Past Paper',
    examFormat: 'neco',
    kind: 'past_paper',
    subject: 'Biology & Mathematics',
    yearOrEdition: 'June/July 2024',
    paperCode: 'NECO-SSCE-2024',
    durationMinutes: 150,
    totalMarks: 120,
    pagesCount: 20,
    fileSizeLabel: '1.5 MB',
    authorOrBody: 'National Examinations Council (NECO)',
    description:
      'Official NECO SSCE objective and essay questions covering Cell Biology, Ecology, Genetics, Sequence & Series, and Bearing & Distances.',
    tags: ['NECO SSCE', 'Biology', 'Mathematics', 'Essay & Objectives'],
    questions: [
      {
        number: 1,
        section: 'Biology · Paper 1 Objective',
        marks: 2,
        question: 'Which organelle is responsible for the synthesis of ATP through aerobic cellular respiration?',
        options: ['Mitochondrion', 'Ribosome', 'Golgi apparatus', 'Lysosome'],
        answer: 'Mitochondrion',
        markingSchemeNotes:
          'The mitochondrion is the site of the Krebs cycle and oxidative phosphorylation (ATP synthesis).',
      },
      {
        number: 2,
        section: 'Mathematics · Paper 2 Essay',
        marks: 10,
        question:
          'The 3rd term of an Arithmetic Progression (A.P.) is 11 and the 8th term is 26. Find the common difference d and the first term a.',
        options: ['d = 3, a = 5', 'd = 4, a = 3', 'd = 5, a = 1', 'd = 2, a = 7'],
        answer: 'd = 3, a = 5',
        markingSchemeNotes:
          'T_3 = a + 2d = 11; T_8 = a + 7d = 26 [M1]. Subtracting gives 5d = 15 => d = 3 [A1]. Substituting d = 3 gives a = 11 - 6 = 5 [A1].',
      },
    ],
  },

  // ==================== CAMBRIDGE IGCSE ====================
  {
    id: 'igcse-0580-0625-2024',
    title: 'Cambridge IGCSE Extended Mathematics (0580) & Physics (0625) Paper 2 & Paper 4',
    examFormat: 'igcse',
    kind: 'past_paper',
    subject: 'IGCSE Extended Math & Physics',
    yearOrEdition: 'May/June 2024 Series',
    paperCode: 'IGCSE 0580/42 & 0625/42',
    durationMinutes: 120,
    totalMarks: 130,
    pagesCount: 20,
    fileSizeLabel: '1.7 MB',
    authorOrBody: 'Cambridge International Education (CIE)',
    description:
      'IGCSE Extended Tier past paper with structured multi-step questions, differentiation, vectors, electromagnetic induction, and A*–G grade threshold table.',
    tags: ['Cambridge IGCSE', 'Extended Tier', '0580 Math', '0625 Physics'],
    questions: [
      {
        number: 1,
        section: 'IGCSE 0580 · Paper 4 Extended',
        marks: 4,
        question: 'Functions f and g are defined by f(x) = 3x - 2 and g(x) = x² + 1. Find fg(2) and the inverse function f⁻¹(x).',
        options: [
          'fg(2) = 13; f⁻¹(x) = (x + 2)/3',
          'fg(2) = 17; f⁻¹(x) = (x - 2)/3',
          'fg(2) = 13; f⁻¹(x) = 3x + 2',
          'fg(2) = 11; f⁻¹(x) = (x + 3)/2',
        ],
        answer: 'fg(2) = 13; f⁻¹(x) = (x + 2)/3',
        markingSchemeNotes:
          'g(2) = 2² + 1 = 5 [M1]. f(5) = 3(5) - 2 = 13 [A1]. Let y = 3x - 2 => x = (y + 2)/3 => f⁻¹(x) = (x + 2)/3 [M1, A1].',
      },
    ],
  },

  // ==================== DIGITAL SAT & AP / IB ====================
  {
    id: 'sat-digital-bluebook-2024',
    title: 'College Board Digital SAT Full Practice Test (Reading & Writing + Math Modules 1 & 2)',
    examFormat: 'sat',
    kind: 'past_paper',
    subject: 'Digital SAT Reading, Writing & Math',
    yearOrEdition: '2024/2025 Adaptive Bluebook Series',
    paperCode: 'SAT-CB-M12',
    durationMinutes: 134,
    totalMarks: 1600,
    pagesCount: 26,
    fileSizeLabel: '2.0 MB',
    authorOrBody: 'College Board Assessment Guide',
    description:
      'Complete Digital SAT adaptive modules featuring passage-per-question Reading & Writing craft/structure items and Desmos-ready Algebra & Advanced Math problems.',
    tags: ['Digital SAT', 'College Board', '1600 Scale', 'Adaptive Modules'],
    questions: [
      {
        number: 1,
        section: 'Math Module 2 (Hard Adaptive)',
        marks: 10,
        question:
          'In the system of equations 3x + ky = 12 and 6x + 8y = 24, for what value of k does the system have infinitely many solutions?',
        options: ['k = 4', 'k = 2', 'k = 8', 'k = 6'],
        answer: 'k = 4',
        markingSchemeNotes:
          'For infinitely many solutions, the second equation must be an exact scalar multiple (×2) of the first: 2 × k = 8 => k = 4.',
      },
    ],
  },
  {
    id: 'ap-ib-stem-compendium',
    title: 'AP Calculus / Biology & IB Diploma HL Past Paper & Formula Booklet',
    examFormat: 'ap_ib',
    kind: 'textbook',
    subject: 'AP & IB Higher Level STEM',
    yearOrEdition: '2024/2025 Curriculum Edition',
    paperCode: 'AP-IB-HL-01',
    durationMinutes: 120,
    totalMarks: 100,
    pagesCount: 52,
    fileSizeLabel: '2.8 MB',
    authorOrBody: 'College Board & International Baccalaureate Guide',
    description:
      'Data booklet, FRQ scoring rubrics, and higher-level synthesis chapters for AP Calculus, AP Biology, and IB Physics/Chemistry HL.',
    tags: ['AP / IB', 'Formula Booklet', 'FRQ Rubrics', 'Higher Level'],
    chapters: [
      {
        chapterNumber: 1,
        title: 'Fundamental Theorem of Calculus & Differential Equations',
        summary:
          'Definite integrals as net accumulation of rate of change, separation of variables, and slope fields for AP Calculus AB/BC and IB Math AA HL.',
        keyFormulasOrRules: [
          '∫_a^b f\'(x) dx = f(b) - f(a)',
          'd/dx [ ∫_a^x g(t) dt ] = g(x)',
          'Exponential growth/decay: dy/dt = ky  =>  y(t) = y_0 e^(kt)',
        ],
        workedExample: {
          problem: 'Solve the separable differential equation dy/dx = 2xy given y(0) = 3.',
          solution: '∫ (1/y) dy = ∫ 2x dx => ln|y| = x² + C => y = Ae^(x²). Since y(0) = 3, A = 3, so y = 3e^(x²).',
        },
        practicePrompt: 'AP and IB Calculus Integration and Differential Equations',
      },
    ],
  },
];

const WORLD_REGION_SLOTS: Array<{ id: string; label: string; emoji: string }> = [
  { id: 'All Regions', label: 'All Countries & Regions', emoji: '🌍' },
  { id: 'West & East Africa', label: 'Africa (WAEC, JAMB, NECO, KCSE, Matric)', emoji: '🇳🇬' },
  { id: 'United Kingdom & Europe', label: 'UK & Europe (GCSE, A-Level, Abitur, Bac)', emoji: '🇬🇧' },
  { id: 'North & South America', label: 'Americas (Digital SAT, ACT, AP, ENEM)', emoji: '🇺🇸' },
  { id: 'Asia & Oceania', label: 'Asia & Oceania (JEE/NEET, Gaokao, ATAR)', emoji: '🇮🇳' },
  { id: 'Global / International', label: 'International (IGCSE, Checkpoint, IB, IELTS)', emoji: '🌐' },
];

const SUBJECT_CATEGORY_SLOTS: Array<{
  id: 'all' | SubjectFolderSpec['category'];
  label: string;
  emoji: string;
}> = [
  { id: 'all', label: 'All Subject Slots', emoji: '🗂️' },
  { id: 'Mathematics & Computing', label: 'Mathematics & Computing', emoji: '📐' },
  { id: 'Sciences', label: 'Sciences (Physics, Chem, Bio)', emoji: '🔬' },
  { id: 'Languages & Literature', label: 'English, Languages & Literature', emoji: '📖' },
  { id: 'Humanities & Business', label: 'Economics, Business & Humanities', emoji: '📈' },
];

export const PastPapersHubView: React.FC<PastPapersHubViewProps> = ({
  persona,
  selectedExamFormat = 'waec',
  onStartQuiz,
  onOpenNotesGenerator,
  onOpenWorksheet,
}) => {
  // PastPapersAcademy View Mode: 'directory' | 'topical' | 'open_access' | 'textbooks' | 'grid' | 'registry_analytics'
  const [hubViewMode, setHubViewMode] = useState<
    'directory' | 'topical' | 'open_access' | 'textbooks' | 'grid' | 'registry_analytics'
  >('directory');
  const [activeRegionSlot, setActiveRegionSlot] = useState<string>('All Regions');
  const [activeBoardFilter, setActiveBoardFilter] = useState<ExamFormatId | 'all'>('all');
  const [activeCheckpointTier, setActiveCheckpointTier] = useState<'all' | 'Lower Secondary' | 'Primary'>('all');
  const [activeCategorySlot, setActiveCategorySlot] = useState<'all' | SubjectFolderSpec['category']>('all');
  const [activeDecadeFilter, setActiveDecadeFilter] = useState<
    'all' | '2020-2026' | '2010-2019' | '2000-2009' | '1990-1999' | '1980-1989' | 'earlier'
  >('all');
  const [activeSessionSlot, setActiveSessionSlot] = useState<string>('all');
  const [activePaperTypeSlot, setActivePaperTypeSlot] = useState<'all' | 'QP' | 'MS' | 'ER' | 'GT' | 'TEXTBOOK'>('all');
  const [activeKindFilter, setActiveKindFilter] = useState<'all' | 'past_paper' | 'textbook' | 'marking_scheme'>('all');
  const [showAiBuilderDrawer, setShowAiBuilderDrawer] = useState<boolean>(false);
  const [showIngestParserDrawer, setShowIngestParserDrawer] = useState<boolean>(false);

  const [selectedSubjectFolderId, setSelectedSubjectFolderId] = useState<string>(
    PAST_PAPER_ACADEMY_SUBJECTS[0]?.id || 'waec-402-math'
  );
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});
  const [activeExaminerModal, setActiveExaminerModal] = useState<{
    folder: SubjectFolderSpec;
    session: string;
    mode: 'ER' | 'GT';
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewResource, setPreviewResource] = useState<AcademicResourceItem | null>(null);
  const [showMarkingSchemeInPreview, setShowMarkingSchemeInPreview] = useState<boolean>(true);
  const [paperStudyMode, setPaperStudyMode] = useState<'written_paper' | 'split_qp_ms' | 'mark_scheme_table'>('split_qp_ms');
  const [candidateName, setCandidateName] = useState<string>('Candidate Student');
  const [candidateCentreNo, setCandidateCentreNo] = useState<string>('NG001 / GB402');
  const [studentWrittenWorking, setStudentWrittenWorking] = useState<Record<string, string>>({});
  const [studentFinalAnswers, setStudentFinalAnswers] = useState<Record<string, string>>({});
  const [studentSelfMarks, setStudentSelfMarks] = useState<Record<string, number>>({});
  const [studyTimerSeconds, setStudyTimerSeconds] = useState<number>(3600);
  const [isStudyTimerRunning, setIsStudyTimerRunning] = useState<boolean>(false);

  const [completedSessions, setCompletedSessions] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('quizme_completed_past_sessions_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [flaggedQuestionKeys, setFlaggedQuestionKeys] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('quizme_flagged_past_questions_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_RESOURCES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Custom AI Past Paper & Textbook Generator state
  const [customExamBoard, setCustomExamBoard] = useState<ExamFormatId>(selectedExamFormat);
  const [customSubject, setCustomSubject] = useState<string>('Mathematics');
  const [customYear, setCustomYear] = useState<string>('2026');
  const [customResourceKind, setCustomResourceKind] = useState<'past_paper' | 'textbook'>('past_paper');
  const [customResources, setCustomResources] = useState<AcademicResourceItem[]>([]);
  const [isSynthesizingCustom, setIsSynthesizingCustom] = useState<boolean>(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Past Paper Document Ingestion & Parser state
  const [rawPaperImportText, setRawPaperImportText] = useState<string>('');
  const [importPaperBoard, setImportPaperBoard] = useState<ExamFormatId>(selectedExamFormat);
  const [importPaperSubject, setImportPaperSubject] = useState<string>('Mathematics');
  const [importPaperYear, setImportPaperYear] = useState<string>('2025 May/June');
  const [isParsingImportedPaper, setIsParsingImportedPaper] = useState<boolean>(false);

  // Per-question AI Examiner Marking & AI Personal Tutor state
  const [aiQuestionFeedback, setAiQuestionFeedback] = useState<Record<string, string>>({});
  const [markingQuestionKey, setMarkingQuestionKey] = useState<string | null>(null);
  const [aiTutorExplanation, setAiTutorExplanation] = useState<Record<string, string>>({});
  const [explainingQuestionKey, setExplainingQuestionKey] = useState<string | null>(null);

  // AI Examiner Marking for written working + final answer
  const handleAiMarkQuestionWorking = async (
    qKey: string,
    q: PastPaperQuestionItem,
    paperTitle: string
  ) => {
    soundFx.playSelect();
    setMarkingQuestionKey(qKey);
    const working = studentWrittenWorking[qKey] || '';
    const finalAns = studentFinalAnswers[qKey] || '';
    const combinedResponse = `Working Steps: ${working || '(None shown)'} | Final Answer: ${finalAns || '(None written)'}`;

    try {
      const res = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `[${paperTitle} · Q${q.number} (${q.marks} Marks)] ${q.question}`,
          correctAnswer: q.answer,
          userAnswer: combinedResponse,
          explanation: q.markingSchemeNotes,
          persona: 'Teacher',
          rubric: [q.markingSchemeNotes, `Official Answer: ${q.answer}`],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const isCorrect = Boolean(data.isCorrect);
        const partialRatio = isCorrect
          ? 1
          : working.trim().length > 12
          ? 0.5
          : 0;
        const awardedMarks = Math.round(q.marks * partialRatio);
        setStudentSelfMarks((prev) => ({ ...prev, [qKey]: awardedMarks }));
        setAiQuestionFeedback((prev) => ({
          ...prev,
          [qKey]: `[AI Examiner Awarded ${awardedMarks}/${q.marks} Marks] ${
            data.feedback || q.markingSchemeNotes
          }`,
        }));
        setShowMarkingSchemeInPreview(true);
      } else {
        throw new Error('Fallback mark evaluation');
      }
    } catch {
      const cleanUser = (finalAns + ' ' + working).trim().toLowerCase();
      const cleanOfficial = q.answer.trim().toLowerCase();
      const fullMatch = cleanUser.includes(cleanOfficial) && cleanOfficial.length > 0;
      const hasMethod = working.trim().length > 10;
      const awardedMarks = fullMatch ? q.marks : hasMethod ? Math.max(1, Math.floor(q.marks / 2)) : 0;
      setStudentSelfMarks((prev) => ({ ...prev, [qKey]: awardedMarks }));
      setAiQuestionFeedback((prev) => ({
        ...prev,
        [qKey]: `[Examiner Rubric Check: ${awardedMarks}/${q.marks} Marks] ${
          fullMatch
            ? 'Full Method [M1] and Accuracy [A1] marks awarded.'
            : hasMethod
            ? 'Partial Method [M1] credit awarded for working steps; verify final accuracy [A1] against the Official Mark Scheme.'
            : 'Please show intermediate working steps [M1] and final answer [A1].'
        }`,
      }));
      setShowMarkingSchemeInPreview(true);
    } finally {
      setMarkingQuestionKey(null);
    }
  };

  // AI Personal Tutor step-by-step worked solution for any past-paper question
  const handleAskAiTutorForQuestion = async (
    qKey: string,
    q: PastPaperQuestionItem,
    paperTitle: string
  ) => {
    soundFx.playSelect();
    setExplainingQuestionKey(qKey);
    try {
      const res = await fetch('/api/ask-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `[${paperTitle} · Q${q.number}] ${q.question}`,
          correctAnswer: q.answer,
          explanation: q.markingSchemeNotes,
          userQuery:
            'Provide a clear, step-by-step worked solution showing how to earn every M1 (Method) and A1 (Accuracy) mark, the underlying syllabus concept, and one common examiner trap to avoid.',
          persona: 'Student',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiTutorExplanation((prev) => ({
          ...prev,
          [qKey]: data.reply || data.explanation || q.markingSchemeNotes,
        }));
      } else {
        throw new Error('Fallback tutor explanation');
      }
    } catch {
      setAiTutorExplanation((prev) => ({
        ...prev,
        [qKey]: `Step-by-Step Tutor Walkthrough: 1) Identify the command word and given values in Q${q.number}. 2) Apply the official method: ${q.markingSchemeNotes}. 3) Confirm your final answer matches "${q.answer}" with appropriate units.`,
      }));
    } finally {
      setExplainingQuestionKey(null);
    }
  };

  // Parse pasted/uploaded raw past paper text into a structured Written Exam Paper + Mark Scheme
  const handleParseImportedPastPaper = async () => {
    if (!rawPaperImportText.trim()) return;
    soundFx.playClick();
    setIsParsingImportedPaper(true);
    const spec = getExamFormatSpec(importPaperBoard);
    const cleanSubj = importPaperSubject.trim() || 'Mathematics';

    try {
      const lines = rawPaperImportText
        .split(/\n+/)
        .map((l) => l.trim())
        .filter((l) => l.length > 8);
      const seedQuestions = lines.slice(0, 12).map((line, idx) => ({
        id: idx + 1,
        type: 'open_explanation',
        question: line,
        correct_answer: 'See Official Mark Scheme',
        explanation: `Method [M1] and Accuracy [A1] rubric for ${spec.shortName} ${cleanSubj}`,
      }));

      const res = await fetch('/api/organize-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizTitle: `${spec.shortName} ${importPaperYear} ${cleanSubj} Imported Past Paper`,
          difficulty: 'Intermediate',
          questions: seedQuestions,
        }),
      });

      let parsedQuestions: PastPaperQuestionItem[] = [];
      if (res.ok) {
        const data = await res.json();
        const items = data.organizedExam?.items || [];
        if (Array.isArray(items) && items.length > 0) {
          parsedQuestions = items.map((it: any, idx: number) => ({
            number: idx + 1,
            section: it.sectionTitle || `${spec.shortName} ${importPaperYear} · Section A`,
            marks: Number(it.marks) || 4,
            question: it.formattedQuestion || seedQuestions[idx]?.question || `Question ${idx + 1}`,
            answer: it.acceptableAnswers || 'Verified in Mark Scheme',
            markingSchemeNotes:
              it.markingGuidance ||
              `Award [M1] for valid method and [A1] for accurate conclusion.`,
          }));
        }
      }

      if (parsedQuestions.length === 0) {
        parsedQuestions = seedQuestions.map((sq, idx) => ({
          number: idx + 1,
          section: `${spec.shortName} ${importPaperYear} · Structured Paper`,
          marks: 4,
          question: sq.question,
          answer: 'Refer to step-by-step derivation',
          markingSchemeNotes: `[Imported Paper Rubric · Q${idx + 1}] Award [M1] for correct formula/principle and [A1] for accurate final evaluation.`,
        }));
      }

      const totalMarks = parsedQuestions.reduce((acc, q) => acc + q.marks, 0);
      const importedResource: AcademicResourceItem = {
        id: `custom-import-${importPaperBoard}-${Date.now()}`,
        title: `${spec.shortName} ${cleanSubj} (${importPaperYear}) — Imported Past Paper & Mark Scheme`,
        examFormat: importPaperBoard,
        kind: 'past_paper',
        subject: cleanSubj,
        yearOrEdition: importPaperYear,
        paperCode: `${spec.shortName.toUpperCase().slice(0, 4)}-IMP-${new Date().getFullYear()}`,
        durationMinutes: 90,
        totalMarks,
        pagesCount: Math.max(4, parsedQuestions.length * 2),
        fileSizeLabel: '1.1 MB',
        authorOrBody: `${spec.governingBody} (User-Imported & Structured)`,
        description: `Structured examination paper and separated M1/A1 Mark Scheme parsed from uploaded document text (${parsedQuestions.length} questions).`,
        tags: [spec.shortName, cleanSubj, importPaperYear, 'Imported Past Paper', 'QP + MS'],
        questions: parsedQuestions,
      };

      setCustomResources((prev) => [importedResource, ...prev]);
      setShowIngestParserDrawer(false);
      setRawPaperImportText('');
      setPreviewResource(importedResource);
      soundFx.playComplete();
    } finally {
      setIsParsingImportedPaper(false);
    }
  };

  useEffect(() => {
    if (!isStudyTimerRunning) return;
    const interval = setInterval(() => {
      setStudyTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isStudyTimerRunning]);

  const toggleCompleteSession = (sessionKey: string) => {
    soundFx.playSelect();
    setCompletedSessions((prev) => {
      const next = prev.includes(sessionKey) ? prev.filter((k) => k !== sessionKey) : [...prev, sessionKey];
      try {
        localStorage.setItem('quizme_completed_past_sessions_v1', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleFlagQuestion = (qKey: string) => {
    soundFx.playSelect();
    setFlaggedQuestionKeys((prev) => {
      const next = prev.includes(qKey) ? prev.filter((k) => k !== qKey) : [...prev, qKey];
      try {
        localStorage.setItem('quizme_flagged_past_questions_v1', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleSaveResource = (id: string) => {
    soundFx.playSelect();
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(SAVED_RESOURCES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const expandedCatalog = useMemo(
    () => buildExpandedPastPaperAcademyResources(ACADEMIC_RESOURCES_CATALOG),
    []
  );

  const allResources = useMemo(
    () => [...customResources, ...expandedCatalog],
    [customResources, expandedCatalog]
  );

  // Filter Exam Boards by chosen World Region Slot
  const visibleExamBoards = useMemo(() => {
    return EXAM_FORMAT_CATALOG.filter((spec) => {
      if (spec.id === 'standard_exam') return false;
      if (activeRegionSlot === 'All Regions') return true;
      return spec.worldRegion === activeRegionSlot;
    });
  }, [activeRegionSlot]);

  // Count resources per exam board for quick slot badges
  const boardCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of allResources) {
      map[r.examFormat] = (map[r.examFormat] || 0) + 1;
    }
    return map;
  }, [allResources]);

  const filteredSubjectFolders = useMemo(() => {
    return PAST_PAPER_ACADEMY_SUBJECTS.filter((f) => {
      const spec = getExamFormatSpec(f.examFormat);
      if (activeRegionSlot !== 'All Regions' && spec.worldRegion !== activeRegionSlot) return false;
      if (activeBoardFilter !== 'all' && f.examFormat !== activeBoardFilter) return false;
      if (activeCheckpointTier !== 'all' && f.examFormat === 'checkpoint') {
        if (activeCheckpointTier === 'Lower Secondary' && !f.checkpointTier?.startsWith('Lower Secondary')) {
          return false;
        }
        if (activeCheckpointTier === 'Primary' && !f.checkpointTier?.startsWith('Primary')) {
          return false;
        }
      }
      if (activeCategorySlot !== 'all' && f.category !== activeCategorySlot) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          f.subjectName.toLowerCase().includes(q) ||
          f.syllabusCode.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          f.textbookTitle.toLowerCase().includes(q) ||
          (f.checkpointTier || '').toLowerCase().includes(q) ||
          (spec.countryName || '').toLowerCase().includes(q) ||
          spec.shortName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeRegionSlot, activeBoardFilter, activeCheckpointTier, activeCategorySlot, searchQuery]);

  const activeSubjectFolder: SubjectFolderSpec = useMemo(() => {
    return (
      filteredSubjectFolders.find((f) => f.id === selectedSubjectFolderId) ||
      filteredSubjectFolders[0] ||
      PAST_PAPER_ACADEMY_SUBJECTS[0]
    );
  }, [filteredSubjectFolders, selectedSubjectFolderId]);

  const filteredTopicalPacks = useMemo(() => {
    return TOPICAL_PAST_PAPER_PACKS.filter((p) => {
      const spec = getExamFormatSpec(p.examFormat);
      if (activeRegionSlot !== 'All Regions' && spec.worldRegion !== activeRegionSlot) return false;
      if (activeBoardFilter !== 'all' && p.examFormat !== activeBoardFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.topicName.toLowerCase().includes(q) ||
          p.subject.toLowerCase().includes(q) ||
          p.keySubtopics.some((s) => s.toLowerCase().includes(q)) ||
          spec.shortName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeRegionSlot, activeBoardFilter, searchQuery]);

  const filteredResources = useMemo(() => {
    return allResources.filter((item) => {
      const spec = getExamFormatSpec(item.examFormat);
      if (activeRegionSlot !== 'All Regions' && spec.worldRegion !== activeRegionSlot) {
        return false;
      }
      if (activeBoardFilter !== 'all' && item.examFormat !== activeBoardFilter) {
        return false;
      }
      if (activeCheckpointTier !== 'all' && item.examFormat === 'checkpoint') {
        const hasPrimary = item.tags.some((t) => t.toLowerCase().includes('primary'));
        const hasLowerSec = item.tags.some((t) => t.toLowerCase().includes('lower secondary'));
        if (activeCheckpointTier === 'Primary' && !hasPrimary) return false;
        if (activeCheckpointTier === 'Lower Secondary' && !hasLowerSec) return false;
      }
      if (activeKindFilter !== 'all' && item.kind !== activeKindFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSubj = item.subject.toLowerCase().includes(q);
        const matchCode = item.paperCode.toLowerCase().includes(q);
        const matchYr = item.yearOrEdition.toLowerCase().includes(q);
        const matchCountry = (spec.countryName || '').toLowerCase().includes(q);
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
        return matchTitle || matchSubj || matchCode || matchYr || matchCountry || matchTags;
      }
      return true;
    });
  }, [allResources, activeRegionSlot, activeBoardFilter, activeCheckpointTier, activeKindFilter, searchQuery]);

  // Trigger a real browser file download formatted in official written exam layout or official Mark Scheme table
  const handleDownloadResourceFile = (
    item: AcademicResourceItem,
    format: 'html_booklet' | 'markdown' | 'marking_scheme'
  ) => {
    soundFx.playComplete();
    const spec = getExamFormatSpec(item.examFormat);
    const safeFilename = item.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (format === 'markdown') {
      const lines: string[] = [
        `# ${item.title}`,
        `**Exam Board:** ${spec.fullName} (${spec.governingBody})`,
        `**Paper Code:** ${item.paperCode} | **Edition/Series:** ${item.yearOrEdition}`,
        `**Subject:** ${item.subject} | **Duration:** ${item.durationMinutes} mins | **Total Marks:** ${item.totalMarks}`,
        '',
        `> ${item.description}`,
        '',
      ];

      if (item.questions && item.questions.length > 0) {
        lines.push('## Official Written Examination Questions & Mark Scheme', '');
        item.questions.forEach((q) => {
          lines.push(`### Question ${q.number} (${q.section}) — [${q.marks} Marks]`);
          lines.push(q.question, '');
          if (q.options) {
            q.options.forEach((opt, idx) => {
              lines.push(`- **${String.fromCharCode(65 + idx)}.** ${opt}`);
            });
            lines.push('');
          }
          lines.push('**Working Space:** `........................................................................`');
          lines.push(`**Answer Line:** \`.................................................... [${q.marks}]\``);
          lines.push(`**Official Mark Scheme Answer:** ${q.answer}`);
          lines.push(`**Examiner M1/A1 Marking Guidance:** ${q.markingSchemeNotes}`, '');
        });
      }

      if (item.chapters && item.chapters.length > 0) {
        lines.push('## Textbook Chapters & Worked Examples', '');
        item.chapters.forEach((ch) => {
          lines.push(`### Chapter ${ch.chapterNumber}: ${ch.title}`);
          lines.push(ch.summary, '');
          lines.push('**Key Formulas & Syllabus Rules:**');
          ch.keyFormulasOrRules.forEach((rule) => lines.push(`- \`${rule}\``));
          lines.push('');
          lines.push(`**Worked Example:** ${ch.workedExample.problem}`);
          lines.push(`**Solution:** ${ch.workedExample.solution}`, '');
        });
      }

      const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeFilename}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadToast(`Downloaded "${item.title}" (.md Study Pack)`);
      setTimeout(() => setDownloadToast(null), 4000);
      return;
    }

    const isMarkSchemeOnly = format === 'marking_scheme' || item.kind === 'marking_scheme';
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${item.title} — ${spec.shortName}</title>
  <style>
    body { font-family: 'Times New Roman', Georgia, serif; color: #0f172a; max-width: 860px; margin: 28px auto; padding: 0 24px; line-height: 1.55; }
    .cover-box { border: 3px solid #0f172a; padding: 22px; background: #ffffff; margin-bottom: 24px; }
    .board-title { font-family: system-ui, sans-serif; font-weight: 900; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 10px; }
    h1 { font-size: 22px; margin: 8px 0 4px; color: #0f172a; }
    .candidate-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px; margin-top: 14px; border: 2px solid #0f172a; padding: 10px; font-family: system-ui, sans-serif; font-size: 12px; }
    .candidate-cell { border-bottom: 1px dotted #475569; padding-bottom: 4px; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 14px; padding-top: 12px; border-top: 2px solid #0f172a; font-family: system-ui, sans-serif; font-size: 12px; }
    .instructions { margin-top: 12px; padding: 10px 14px; background: #f8fafc; border: 1px solid #94a3b8; font-family: system-ui, sans-serif; font-size: 12px; }
    .q-card { border: 1.5px solid #0f172a; padding: 18px; margin-bottom: 18px; page-break-inside: avoid; }
    .q-header { display: flex; justify-content: space-between; font-family: system-ui, sans-serif; font-weight: 800; font-size: 13px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 10px; }
    .working-lines { margin-top: 14px; border-top: 1px dotted #64748b; border-bottom: 1px dotted #64748b; height: 56px; position: relative; }
    .answer-line { text-align: right; font-family: system-ui, sans-serif; font-weight: 700; font-size: 13px; margin-top: 12px; }
    .scheme { margin-top: 12px; padding: 12px; background: #ecfdf5; border-left: 4px solid #059669; font-family: system-ui, sans-serif; font-size: 12.5px; }
    table.ms-table { width: 100%; border-collapse: collapse; font-family: system-ui, sans-serif; font-size: 13px; margin-top: 16px; }
    table.ms-table th, table.ms-table td { border: 1.5px solid #0f172a; padding: 10px; text-align: left; vertical-align: top; }
    table.ms-table th { background: #f1f5f9; font-weight: 800; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="cover-box">
    <div class="board-title">${spec.badgeEmoji} ${spec.governingBody} — ${spec.fullName}</div>
    <h1>${item.title}</h1>
    <p style="margin:4px 0;color:#334155;font-size:13px;">${item.description}</p>
    <div class="candidate-grid">
      <div class="candidate-cell"><strong>CANDIDATE NAME:</strong> ................................................................</div>
      <div class="candidate-cell"><strong>CENTRE NUMBER:</strong> ........................</div>
      <div class="candidate-cell"><strong>CANDIDATE NUMBER:</strong> ........................</div>
    </div>
    <div class="meta-grid">
      <div><strong>Syllabus / Paper:</strong><br/>${item.paperCode}</div>
      <div><strong>Examination Series:</strong><br/>${item.yearOrEdition}</div>
      <div><strong>Time Allowed:</strong><br/>${item.durationMinutes} Minutes</div>
      <div><strong>Maximum Marks:</strong><br/>${item.totalMarks} Marks</div>
    </div>
    <div class="instructions">
      <strong>INSTRUCTIONS TO CANDIDATES:</strong> Write in dark blue or black pen. Answer ALL questions in the spaces provided. Show all your working clearly; Method Marks [M1] and Accuracy Marks [A1] are awarded according to the Official Mark Scheme.
    </div>
  </div>
  ${
    item.questions && item.questions.length > 0
      ? isMarkSchemeOnly
        ? `<h2>OFFICIAL EXAMINER MARK SCHEME (MS) RUBRIC TABLE</h2>
           <table class="ms-table">
             <thead>
               <tr>
                 <th style="width:8%">Q#</th>
                 <th style="width:28%">Acceptable Official Answer</th>
                 <th style="width:10%">Marks</th>
                 <th>Examiner M1 / A1 / B1 Marking Guidance & Working</th>
               </tr>
             </thead>
             <tbody>
               ${item.questions
                 .map(
                   (q) => `<tr>
                     <td><strong>${q.number}</strong></td>
                     <td><strong>${q.answer}</strong></td>
                     <td><strong>[${q.marks}]</strong></td>
                     <td>${q.markingSchemeNotes}</td>
                   </tr>`
                 )
                 .join('')}
             </tbody>
           </table>`
        : `<h2>OFFICIAL WRITTEN EXAMINATION PAPER & MARK SCHEME</h2>` +
          item.questions
            .map(
              (q) => `
      <div class="q-card">
        <div class="q-header">
          <span><strong>${q.number}</strong> &nbsp; ${q.section}</span>
          <span>[${q.marks} Marks]</span>
        </div>
        <div style="font-size:15.5px;font-weight:600;">${q.question}</div>
        ${
          q.options
            ? `<div style="margin:10px 0;font-family:system-ui,sans-serif;font-size:13.5px;">${q.options
                .map((opt, idx) => `<div style="margin:4px 0;">[ &nbsp; ] <strong>${String.fromCharCode(65 + idx)}.</strong> ${opt}</div>`)
                .join('')}</div>`
            : ''
        }
        <div class="working-lines"></div>
        <div class="answer-line">........................................................................ [${q.marks}]</div>
        <div class="scheme">
          <strong>✓ Official Mark Scheme Answer:</strong> ${q.answer}<br/>
          <strong>Examiner M1/A1 Guidance:</strong> ${q.markingSchemeNotes}
        </div>
      </div>`
            )
            .join('')
      : ''
  }
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeFilename}-${format === 'marking_scheme' ? 'official-mark-scheme' : 'written-exam-paper'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadToast(
      `Downloaded "${item.title}" (${format === 'marking_scheme' ? 'Official Mark Scheme Table' : 'Written Exam Paper Booklet'})`
    );
    setTimeout(() => setDownloadToast(null), 4000);
  };

  // Convert any Past Paper or Textbook into a live interactive QuizResponse and launch in QuizRunner
  const handlePracticePastPaperInteractive = (item: AcademicResourceItem) => {
    soundFx.playSelect();
    if (item.questions && item.questions.length > 0) {
      const convertedQuestions: Question[] = item.questions.map((q, idx) => ({
        id: idx + 1,
        type: 'multiple_choice',
        question: `[${item.paperCode} · ${q.section}] ${q.question}`,
        options:
          q.options && q.options.length >= 2
            ? q.options
            : [
                q.answer,
                'Cannot be determined from the given values',
                'Half of the calculated magnitude',
                'Double the standard reference value',
              ],
        correct_answer: q.answer,
        explanation: q.markingSchemeNotes,
        topic: item.subject,
        bloom_level: 'Apply',
        domain: 'Applied Logic',
        gamified_feedback: {
          success_quote: 'Official Past Paper Mark Awarded!',
          hint: 'Review the syllabus formula and marking scheme conventions.',
        },
      }));

      const prebuiltExtra = buildPrebuiltExamByFormat(item.examFormat, persona);
      const combinedQuestions = [
        ...convertedQuestions,
        ...prebuiltExtra.questions
          .slice(0, 3)
          .map((eq, i) => ({ ...eq, id: convertedQuestions.length + i + 1 })),
      ];

      onStartQuiz({
        app_name: 'Quiz Me!',
        persona,
        quiz_title: `${item.title} (${item.yearOrEdition})`,
        summary: item.description,
        difficulty: 'Intermediate',
        examFormat: item.examFormat,
        questions: combinedQuestions,
        study_guide: prebuiltExtra.study_guide,
        tags: item.tags,
      });
    } else {
      const prebuilt = buildPrebuiltExamByFormat(item.examFormat, persona);
      onStartQuiz({
        ...prebuilt,
        quiz_title: `${item.title} — Chapter Checkpoint Exam`,
        examFormat: item.examFormat,
      });
    }
  };

  // Custom AI Past Paper / Textbook Synthesizer
  const handleSynthesizeCustomResource = async () => {
    soundFx.playClick();
    setIsSynthesizingCustom(true);
    const spec = getExamFormatSpec(customExamBoard);
    const cleanSubj = customSubject.trim() || 'Mathematics';

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona,
          inputText: `${spec.fullName} (${spec.governingBody}) ${customYear} ${cleanSubj} ${
            customResourceKind === 'past_paper' ? 'Official Past Paper Questions and Marking Scheme' : 'Complete Textbook Chapter and Worked Examples'
          }\n\n${spec.aiPromptDirective}`,
          questionTypes: ['multiple_choice'],
          difficulty: 'Intermediate',
          questionCount: 5,
          targetAudience: 'High School (14-18)',
          intelligenceScope: 'exam_olympiad_rigor',
        }),
      });

      let synthesizedQuestions: PastPaperQuestionItem[] = [];
      if (res.ok) {
        const quizData: QuizResponse = await res.json();
        synthesizedQuestions = (quizData.questions || []).map((q, i) => ({
          number: i + 1,
          section: `${spec.shortName} ${customYear} · Section A`,
          marks: 3,
          question: q.question,
          options: q.options || undefined,
          answer: q.correct_answer,
          markingSchemeNotes: q.explanation,
        }));
      }

      if (synthesizedQuestions.length === 0) {
        const fallbackQuiz = buildPrebuiltExamByFormat(customExamBoard, persona);
        synthesizedQuestions = fallbackQuiz.questions.map((q, i) => ({
          number: i + 1,
          section: `${spec.shortName} ${customYear} · Core Paper`,
          marks: 3,
          question: q.question,
          options: q.options || undefined,
          answer: q.correct_answer,
          markingSchemeNotes: q.explanation,
        }));
      }

      const newResource: AcademicResourceItem = {
        id: `custom-${customExamBoard}-${Date.now()}`,
        title:
          customResourceKind === 'past_paper'
            ? `[AI Practice Paper] ${spec.shortName} ${customYear} ${cleanSubj} Practice Paper & Marking Guide`
            : `[AI Study Guide] ${spec.shortName} ${cleanSubj} Revision Compendium (${customYear} Edition)`,
        examFormat: customExamBoard,
        kind: customResourceKind,
        subject: cleanSubj,
        yearOrEdition: `${customYear} Practice Series`,
        paperCode: `${spec.shortName.toUpperCase().slice(0, 4)}-AI-${customYear}-${Math.floor(100 + Math.random() * 899)}`,
        durationMinutes: spec.defaultTimeMinutes || 90,
        totalMarks: 100,
        pagesCount: 16,
        fileSizeLabel: '1.3 MB',
        authorOrBody: `Quiz Me! AI Assessment Engine (${spec.shortName} Syllabus-Aligned Practice)`,
        description: `AI-synthesized practice ${
          customResourceKind === 'past_paper' ? 'paper with M1/A1 marking rubric (Non-Official Practice Material)' : 'study guide chapters, formulas, and worked examples'
        } aligned to ${spec.fullName} ${cleanSubj}.`,
        tags: [spec.shortName, cleanSubj, customYear, 'AI Practice Synthesis (Non-Official)'],
        questions: synthesizedQuestions,
        chapters:
          customResourceKind === 'textbook'
            ? synthesizedQuestions.map((sq, idx) => ({
                chapterNumber: idx + 1,
                title: `${cleanSubj} Core Unit ${idx + 1}`,
                summary: sq.markingSchemeNotes,
                keyFormulasOrRules: [
                  `Master ${spec.shortName} syllabus objective ${idx + 1} for ${cleanSubj}`,
                  `Apply ${spec.governingBody} M1/A1 marking conventions`,
                ],
                workedExample: {
                  problem: sq.question,
                  solution: `${sq.answer} — ${sq.markingSchemeNotes}`,
                },
                practicePrompt: `${cleanSubj} (${spec.shortName})`,
              }))
            : undefined,
      };

      setCustomResources((prev) => [newResource, ...prev]);
      setPreviewResource(newResource);
      soundFx.playComplete();
    } catch {
      // ignore
    } finally {
      setIsSynthesizingCustom(false);
    }
  };

  // Sessions inside the active subject folder filtered by activeDecadeFilter and activeSessionSlot
  const visibleSessionsInFolder = useMemo(() => {
    if (!activeSubjectFolder) return [];
    return activeSubjectFolder.sessions.filter((s) => {
      if (activeSessionSlot !== 'all' && s !== activeSessionSlot) {
        return false;
      }
      if (activeDecadeFilter !== 'all') {
        const yearMatch = s.match(/\b(19\d{2}|20\d{2})\b/);
        const yr = yearMatch ? parseInt(yearMatch[1], 10) : 2026;
        if (activeDecadeFilter === '2020-2026' && (yr < 2020 || yr > 2026)) return false;
        if (activeDecadeFilter === '2010-2019' && (yr < 2010 || yr > 2019)) return false;
        if (activeDecadeFilter === '2000-2009' && (yr < 2000 || yr > 2009)) return false;
        if (activeDecadeFilter === '1990-1999' && (yr < 1990 || yr > 1999)) return false;
        if (activeDecadeFilter === '1980-1989' && (yr < 1980 || yr > 1989)) return false;
        if (activeDecadeFilter === 'earlier' && yr >= 1980) return false;
      }
      return true;
    });
  }, [activeSubjectFolder, activeSessionSlot, activeDecadeFilter]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 py-5 space-y-6 pb-14 animate-in fade-in duration-300">
      {/* Download Notification Toast */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-lg flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* ==================== FRIENDLY, CLEAN HEADER ==================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
              <span>{EXAM_FORMAT_CATALOG.length - 1} Global Examination Systems</span>
              <span aria-hidden="true">·</span>
              <span>All Years Up to 2026</span>
              <span aria-hidden="true">·</span>
              <span>Verified Question Papers, Mark Schemes &amp; AI Examiner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Global Past Paper Library &amp; Exam Engine
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Browse authentic examination papers, official M1/A1 marking schemes, examiner reports, and AI-marked practice across 25+ examination boards worldwide.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Available Papers</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white tabular-nums">
                  {allResources.length}
                </span>
              </div>
              <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Years Completed</span>
                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {completedSessions.length}
                </span>
              </div>
              <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="text-slate-500 dark:text-slate-400 block">Flagged Qs</span>
                <span className="font-bold text-sm text-amber-600 dark:text-amber-400 tabular-nums">
                  {flaggedQuestionKeys.length}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowIngestParserDrawer((prev) => !prev);
                setShowAiBuilderDrawer(false);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FolderDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{showIngestParserDrawer ? 'Close Parser' : 'Import / Parse Paper'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setShowAiBuilderDrawer((prev) => !prev);
                setShowIngestParserDrawer(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>{showAiBuilderDrawer ? 'Close Custom Builder' : 'Create Custom Paper'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Past Paper Document Ingestion & Parser Drawer */}
        {showIngestParserDrawer && (
          <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Document Ingestion &amp; Past-Paper Parser
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Paste raw questions or examination text below to automatically segment questions, preserve numbering, and generate a separated M1/A1 Mark Scheme.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIngestParserDrawer(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <select
                value={importPaperBoard}
                onChange={(e) => setImportPaperBoard(e.target.value as ExamFormatId)}
                aria-label="Imported Paper Exam Board"
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {EXAM_FORMAT_CATALOG.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.badgeEmoji} {spec.shortName} ({spec.governingBody})
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={importPaperSubject}
                onChange={(e) => setImportPaperSubject(e.target.value)}
                placeholder="Subject (e.g., Physics, Chemistry, Mathematics)"
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />

              <input
                type="text"
                value={importPaperYear}
                onChange={(e) => setImportPaperYear(e.target.value)}
                placeholder="Year / Series (e.g., 2024 May/June Paper 2)"
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <textarea
              rows={3}
              value={rawPaperImportText}
              onChange={(e) => setRawPaperImportText(e.target.value)}
              placeholder="Paste raw past-paper questions here (one question per line or paragraph)..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />

            <div className="flex justify-end">
              <button
                type="button"
                disabled={isParsingImportedPaper || !rawPaperImportText.trim()}
                onClick={handleParseImportedPastPaper}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>
                  {isParsingImportedPaper
                    ? 'Parsing Paper & Mark Scheme...'
                    : 'Parse & Add to Past Paper Library'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Custom Paper Generator */}
        {showAiBuilderDrawer && (
          <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Generate a Custom Practice Paper or Study Guide
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pick any exam board, subject, and year to build a printable written paper with a mark scheme.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAiBuilderDrawer(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              <select
                value={customExamBoard}
                onChange={(e) => setCustomExamBoard(e.target.value as ExamFormatId)}
                aria-label="Select Exam Board"
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {EXAM_FORMAT_CATALOG.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.badgeEmoji} {spec.shortName} ({spec.countryName || spec.regionTag})
                  </option>
                ))}
              </select>

              <select
                value={customResourceKind}
                onChange={(e) => setCustomResourceKind(e.target.value as 'past_paper' | 'textbook')}
                aria-label="Select Resource Type"
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="past_paper">Written Past Paper + Mark Scheme</option>
                <option value="textbook">Revision Textbook + Worked Examples</option>
              </select>

              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Subject (e.g., Further Maths, Chemistry)"
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
              />

              <select
                value={customYear}
                onChange={(e) => setCustomYear(e.target.value)}
                aria-label="Select Exam Series Year"
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {[
                  '2026 May/June',
                  '2026 Specimen',
                  '2025 Oct/Nov',
                  '2025 May/June',
                  '2024',
                  '2023',
                  '2022',
                  '2021',
                  '2020',
                  '2015',
                  '2010',
                  '2005',
                  '2000',
                  '1995',
                  '1990',
                ].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr} Series
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={isSynthesizingCustom}
                onClick={handleSynthesizeCustomResource}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSynthesizingCustom ? 'Generating...' : 'Build Paper'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== SIMPLE, EASY-TO-USE NAVIGATION & FILTER BAR ==================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4 shadow-2xs">
        {/* Top Row: 4 Clear View Tabs + Search Input */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl">
            {[
              { id: 'directory', label: `Browse by Subject (${PAST_PAPER_ACADEMY_SUBJECTS.length})` },
              { id: 'topical', label: `Practice by Topic (${TOPICAL_PAST_PAPER_PACKS.length})` },
              { id: 'open_access', label: 'Open Educational Resources & Curricula (9 Repositories)' },
              { id: 'textbooks', label: 'Subject Textbooks' },
              { id: 'grid', label: 'All Papers List' },
              { id: 'registry_analytics', label: `Exam Systems Registry (${EXAM_FORMAT_CATALOG.length - 1})` },
            ].map((mode) => {
              const isPicked = hubViewMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    setHubViewMode(
                      mode.id as
                        | 'directory'
                        | 'topical'
                        | 'open_access'
                        | 'textbooks'
                        | 'grid'
                        | 'registry_analytics'
                    );
                    if (mode.id === 'textbooks') {
                      setActiveKindFilter('textbook');
                    } else if (mode.id === 'grid') {
                      setActiveKindFilter('all');
                    }
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isPicked
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>

          {/* Clean Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subject, code (0580, 0862, 0096), board, or year..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Row 1: Region & Subject Department Dropdowns + Exam Board Pills */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-4 flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Region / Country
              </label>
              <select
                value={activeRegionSlot}
                onChange={(e) => {
                  soundFx.playSelect();
                  setActiveRegionSlot(e.target.value);
                  setActiveBoardFilter('all');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {WORLD_REGION_SLOTS.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.emoji} {region.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Subject Area
              </label>
              <select
                value={activeCategorySlot}
                onChange={(e) => {
                  soundFx.playSelect();
                  setActiveCategorySlot(e.target.value as 'all' | SubjectFolderSpec['category']);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {SUBJECT_CATEGORY_SLOTS.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exam Board Selector */}
          <div className="md:col-span-8">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Exam Board ({visibleExamBoards.length} Available)
              </label>
              {(activeRegionSlot !== 'All Regions' ||
                activeBoardFilter !== 'all' ||
                activeCheckpointTier !== 'all' ||
                activeCategorySlot !== 'all' ||
                activeDecadeFilter !== 'all' ||
                activeSessionSlot !== 'all' ||
                activePaperTypeSlot !== 'all' ||
                searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setActiveRegionSlot('All Regions');
                    setActiveBoardFilter('all');
                    setActiveCheckpointTier('all');
                    setActiveCategorySlot('all');
                    setActiveDecadeFilter('all');
                    setActiveSessionSlot('all');
                    setActivePaperTypeSlot('all');
                    setSearchQuery('');
                  }}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => {
                  soundFx.playSelect();
                  setActiveBoardFilter('all');
                  setActiveCheckpointTier('all');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border shrink-0 transition-colors cursor-pointer ${
                  activeBoardFilter === 'all'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                All Boards
              </button>

              {visibleExamBoards.map((spec) => {
                const isSelected = activeBoardFilter === spec.id;
                return (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setActiveBoardFilter(spec.id);
                      const firstMatchingFolder = PAST_PAPER_ACADEMY_SUBJECTS.find(
                        (f) => f.examFormat === spec.id
                      );
                      if (firstMatchingFolder) {
                        setSelectedSubjectFolderId(firstMatchingFolder.id);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    <span>{spec.badgeEmoji}</span>
                    <span>{spec.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Clean Cambridge Checkpoint Level Switcher (Primary vs Lower Secondary) */}
        {(activeBoardFilter === 'all' || activeBoardFilter === 'checkpoint') && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="text-xs text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">
                Cambridge Checkpoint Level:
              </span>{' '}
              Choose between Primary (Stages 4–6) and Lower Secondary (Stages 7–9)
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Checkpoint Levels' },
                {
                  id: 'Primary',
                  label: 'Primary Checkpoint (Stages 4–6 · Ages 8–11)',
                },
                {
                  id: 'Lower Secondary',
                  label: 'Lower Secondary Checkpoint (Stages 7–9 · Ages 11–14)',
                },
              ].map((tier) => {
                const isPicked =
                  activeBoardFilter === 'checkpoint' && activeCheckpointTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setActiveBoardFilter('checkpoint');
                      setActiveCheckpointTier(tier.id as 'all' | 'Lower Secondary' | 'Primary');
                      const matchingFolder = PAST_PAPER_ACADEMY_SUBJECTS.find((f) => {
                        if (f.examFormat !== 'checkpoint') return false;
                        if (tier.id === 'Primary') return f.checkpointTier?.startsWith('Primary');
                        if (tier.id === 'Lower Secondary')
                          return f.checkpointTier?.startsWith('Lower Secondary');
                        return true;
                      });
                      if (matchingFolder) {
                        setSelectedSubjectFolderId(matchingFolder.id);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      isPicked
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                    }`}
                  >
                    {tier.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ==================== VIEW 1: CLEAN TWO-COLUMN SUBJECT & YEAR BROWSER ==================== */}
      {hubViewMode === 'directory' && activeSubjectFolder && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Clean Subject List */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
            <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Subjects ({filteredSubjectFolders.length})
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Select a subject
              </span>
            </div>

            <div className="p-2.5 space-y-1.5 max-h-[calc(100vh-240px)] min-h-[480px] overflow-y-auto">
              {filteredSubjectFolders.map((folder) => {
                const isSelected = folder.id === activeSubjectFolder.id;
                const boardSpec = getExamFormatSpec(folder.examFormat);
                const startYear =
                  folder.inceptionYear || EXAM_BOARD_INCEPTION_YEARS[folder.examFormat] || 1990;

                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setSelectedSubjectFolderId(folder.id);
                      setActiveSessionSlot('all');
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 dark:border-indigo-500'
                        : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-base shrink-0 mt-0.5">
                        {folder.iconEmoji}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {folder.subjectName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {folder.syllabusCode}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{boardSpec.shortName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{startYear}–2026</span>
                        </div>
                        {folder.checkpointTier && (
                          <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                            {folder.checkpointTier}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-400'
                      }`}
                    />
                  </button>
                );
              })}

              {filteredSubjectFolders.length === 0 && (
                <div className="p-8 text-center space-y-3">
                  <p className="text-xs text-slate-500">
                    No subjects match your current filters.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveRegionSlot('All Regions');
                      setActiveBoardFilter('all');
                      setActiveCheckpointTier('all');
                      setActiveCategorySlot('all');
                      setSearchQuery('');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Show All Subjects
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Subject Overview + Clean Year & Paper List */}
          <div className="lg:col-span-8 space-y-4">
            {/* Subject Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {getExamFormatSpec(activeSubjectFolder.examFormat).badgeEmoji}{' '}
                      {getExamFormatSpec(activeSubjectFolder.examFormat).fullName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      Syllabus {activeSubjectFolder.syllabusCode}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Years{' '}
                      {activeSubjectFolder.inceptionYear ||
                        EXAM_BOARD_INCEPTION_YEARS[activeSubjectFolder.examFormat] ||
                        1990}
                      –2026
                    </span>
                    {activeSubjectFolder.checkpointTier && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {activeSubjectFolder.checkpointTier}
                        </span>
                      </>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {activeSubjectFolder.iconEmoji} {activeSubjectFolder.subjectName}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {activeSubjectFolder.sessions.length} Exam Series Available · Includes Written Question Papers &amp; Official Mark Schemes
                  </p>
                </div>

                {/* Clean Subject Actions (Textbook, Examiner Tips, AI Notes) */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {(() => {
                    const subjectBook: AcademicResourceItem = {
                      id: `ppa-book-${activeSubjectFolder.id}`,
                      title: activeSubjectFolder.textbookTitle,
                      examFormat: activeSubjectFolder.examFormat,
                      kind: 'textbook',
                      subject: activeSubjectFolder.subjectName,
                      yearOrEdition: 'Complete Curriculum Edition (Up to 2026 Syllabus)',
                      paperCode: `${activeSubjectFolder.syllabusCode}-BOOK`,
                      durationMinutes: 180,
                      totalMarks: 100,
                      pagesCount: 68,
                      fileSizeLabel: '3.4 MB',
                      authorOrBody: activeSubjectFolder.textbookAuthor,
                      description: `Complete textbook & worked examples for ${activeSubjectFolder.syllabusCode} ${activeSubjectFolder.subjectName}.`,
                      tags: ['Textbook', activeSubjectFolder.syllabusCode, activeSubjectFolder.subjectName],
                      chapters: activeSubjectFolder.textbookChapters,
                      questions: activeSubjectFolder.coreQuestions,
                    };
                    return (
                      <button
                        type="button"
                        onClick={() => setPreviewResource(subjectBook)}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-400 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Read Textbook</span>
                      </button>
                    );
                  })()}

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setActiveExaminerModal({
                        folder: activeSubjectFolder,
                        session: activeSubjectFolder.sessions[0] || '2026 Series',
                        mode: 'ER',
                      });
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-400 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    Grade Boundaries &amp; Tips
                  </button>

                  {onOpenNotesGenerator && (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenNotesGenerator(
                          `${activeSubjectFolder.syllabusCode} ${activeSubjectFolder.subjectName}`,
                          activeSubjectFolder.examFormat
                        )
                      }
                      className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Study Notes</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Clean Year Filter Bar: Decade Tabs + Single Jump-to-Year Dropdown */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'All Years' },
                    { id: '2020-2026', label: '2020–2026' },
                    { id: '2010-2019', label: '2010–2019' },
                    { id: '2000-2009', label: '2000–2009' },
                    { id: '1990-1999', label: '1990–1999' },
                    { id: '1980-1989', label: '1980–1989' },
                    { id: 'earlier', label: 'Pre-1980' },
                  ].map((era) => (
                    <button
                      key={era.id}
                      type="button"
                      onClick={() => {
                        soundFx.playSelect();
                        setActiveDecadeFilter(
                          era.id as
                            | 'all'
                            | '2020-2026'
                            | '2010-2019'
                            | '2000-2009'
                            | '1990-1999'
                            | '1980-1989'
                            | 'earlier'
                        );
                        setActiveSessionSlot('all');
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        activeDecadeFilter === era.id
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {era.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={activeSessionSlot}
                    onChange={(e) => {
                      soundFx.playSelect();
                      const val = e.target.value;
                      setActiveSessionSlot(val);
                      if (val !== 'all') {
                        setExpandedSessions((prev) => ({ ...prev, [val]: true }));
                      }
                    }}
                    aria-label="Filter by Exam Year Series"
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">
                      Jump to Year / Series ({visibleSessionsInFolder.length})
                    </option>
                    {visibleSessionsInFolder.map((sess) => (
                      <option key={sess} value={sess}>
                        {sess}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      const next: Record<string, boolean> = {};
                      visibleSessionsInFolder.forEach((s) => {
                        next[s] = true;
                      });
                      setExpandedSessions(next);
                    }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer shrink-0"
                  >
                    Expand All
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      const next: Record<string, boolean> = {};
                      visibleSessionsInFolder.forEach((s) => {
                        next[s] = false;
                      });
                      setExpandedSessions(next);
                    }}
                    className="text-xs font-semibold text-slate-500 hover:underline cursor-pointer shrink-0"
                  >
                    Collapse
                  </button>
                </div>
              </div>
            </div>

            {/* Clean Accordion List of Exam Years & Papers */}
            <div className="space-y-3">
              {visibleSessionsInFolder.map((session, sessionIdx) => {
                const isExpanded = expandedSessions[session] ?? sessionIdx < 3;
                const sessionCompletionKey = `${activeSubjectFolder.id}::${session}`;
                const isSessionCompleted = completedSessions.includes(sessionCompletionKey);

                return (
                  <div
                    key={session}
                    className={`rounded-2xl border overflow-hidden transition-colors ${
                      isSessionCompleted
                        ? 'border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {/* Year / Session Header */}
                    <div className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick();
                          setExpandedSessions((prev) => ({ ...prev, [session]: !isExpanded }));
                        }}
                        className="flex items-center gap-2.5 text-left cursor-pointer flex-1 min-w-0"
                      >
                        <ChevronRight
                          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                            isExpanded ? 'rotate-90 text-indigo-600' : ''
                          }`}
                        />
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {session}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                          · {activeSubjectFolder.papersOffered.length} Papers &amp; Mark Schemes
                        </span>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            soundFx.playClick();
                            setActiveExaminerModal({
                              folder: activeSubjectFolder,
                              session,
                              mode: 'ER',
                            });
                          }}
                          className="text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 cursor-pointer hidden sm:inline"
                        >
                          Examiner Report
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleCompleteSession(sessionCompletionKey)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                            isSessionCompleted
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                          }`}
                        >
                          {isSessionCompleted ? '✓ Completed' : 'Mark Done'}
                        </button>
                      </div>
                    </div>

                    {/* Papers inside this Year / Session */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {activeSubjectFolder.papersOffered.map((paper) => {
                          const paperResource = buildResourceForSessionPaper(
                            activeSubjectFolder,
                            session,
                            paper,
                            'QP'
                          );
                          const msResource = buildResourceForSessionPaper(
                            activeSubjectFolder,
                            session,
                            paper,
                            'MS'
                          );

                          return (
                            <div
                              key={paper.paperNumber}
                              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                            >
                              <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                    {paper.paperNumber}
                                  </span>
                                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {paper.paperTitle}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                                  <span>{paper.durationMinutes} mins</span>
                                  <span aria-hidden="true">·</span>
                                  <span>{paper.totalMarks} Marks</span>
                                  <span aria-hidden="true">·</span>
                                  <span>Written Paper + Step-by-Step Mark Scheme</span>
                                </div>
                              </div>

                              {/* Clear, Human-Friendly Action Buttons */}
                              <div className="flex flex-wrap items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    soundFx.playClick();
                                    setPaperStudyMode('split_qp_ms');
                                    setShowMarkingSchemeInPreview(true);
                                    setStudyTimerSeconds((paper.durationMinutes || 60) * 60);
                                    setIsStudyTimerRunning(false);
                                    setPreviewResource(paperResource);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Open Paper &amp; Mark Scheme</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    soundFx.playClick();
                                    setPaperStudyMode('mark_scheme_table');
                                    setShowMarkingSchemeInPreview(true);
                                    setPreviewResource(msResource);
                                  }}
                                  className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-semibold cursor-pointer flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Mark Scheme</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handlePracticePastPaperInteractive(paperResource)}
                                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer flex items-center gap-1"
                                >
                                  <Play className="w-3 h-3" />
                                  <span>Timed Quiz</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDownloadResourceFile(paperResource, 'html_booklet')}
                                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-400 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer flex items-center gap-1"
                                  title="Download Printable Question Paper & Mark Scheme Booklet"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================== VIEW 2: TOPICAL PAST PAPERS (BY SYLLABUS TOPIC) ==================== */}
      {hubViewMode === 'topical' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTopicalPacks.map((pack: TopicalPastPaperPack) => {
            const spec = getExamFormatSpec(pack.examFormat);
            const topicalResource: AcademicResourceItem = {
              id: pack.id,
              title: pack.topicName,
              examFormat: pack.examFormat,
              kind: 'past_paper',
              subject: pack.subject,
              yearOrEdition: pack.yearsCovered,
              paperCode: `TOPICAL-${spec.shortName.toUpperCase().slice(0, 4)}`,
              durationMinutes: 45,
              totalMarks: pack.questionCount * 2,
              pagesCount: 12,
              fileSizeLabel: '1.1 MB',
              authorOrBody: `${spec.shortName} Topical Archive`,
              description: `Compiled topical past questions (${pack.yearsCovered}) covering: ${pack.keySubtopics.join(', ')}.`,
              tags: [spec.shortName, pack.subject, ...pack.keySubtopics],
              questions: [pack.sampleQuestion],
            };

            return (
              <div
                key={pack.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4 hover:border-indigo-400 transition-all shadow-2xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {spec.badgeEmoji} {spec.shortName} · {pack.subject}
                    </span>
                    <span>
                      {pack.difficulty} · {pack.questionCount} Questions
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {pack.topicName}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Subtopics: {pack.keySubtopics.join(' · ')}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="font-semibold text-slate-500 dark:text-slate-400">
                      Sample Question ({pack.sampleQuestion.marks} Marks):
                    </div>
                    <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                      {pack.sampleQuestion.question}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaperStudyMode('split_qp_ms');
                      setPreviewResource(topicalResource);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer text-center"
                  >
                    Open Paper &amp; Mark Scheme
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePracticePastPaperInteractive(topicalResource)}
                    className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Quiz</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadResourceFile(topicalResource, 'html_booklet')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 cursor-pointer"
                    title="Download Topic Pack"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== VIEW: OPEN EDUCATIONAL RESOURCES & CURRICULA (9 REPOSITORIES) ==================== */}
      {hubViewMode === 'open_access' && (
        <OpenAccessHubView
          persona={persona}
          selectedExamFormat={activeBoardFilter !== 'all' ? activeBoardFilter : selectedExamFormat}
          onStartQuiz={onStartQuiz}
          onOpenNotesGenerator={onOpenNotesGenerator}
          onOpenWorksheet={onOpenWorksheet}
        />
      )}

      {/* ==================== VIEW 3 & 4: TEXTBOOKS LIBRARY / ALL PAPERS LIST ==================== */}
      {(hubViewMode === 'grid' || hubViewMode === 'textbooks') && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Showing {Math.min(filteredResources.length, 180)} of {filteredResources.length} resources
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: `All (${allResources.length})` },
                { id: 'past_paper', label: 'Question Papers' },
                { id: 'marking_scheme', label: 'Mark Schemes' },
                { id: 'textbook', label: 'Textbooks' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    setActiveKindFilter(tab.id as 'all' | 'past_paper' | 'textbook' | 'marking_scheme');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    activeKindFilter === tab.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredResources.slice(0, 180).map((item) => {
              const spec = getExamFormatSpec(item.examFormat);
              const isSaved = savedIds.includes(item.id);
              const isTextbook = item.kind === 'textbook';
              const isMarkScheme = item.kind === 'marking_scheme';

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4 hover:border-indigo-400 transition-all shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {spec.badgeEmoji} {spec.shortName}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {isTextbook ? 'Textbook' : isMarkScheme ? 'Mark Scheme' : 'Question Paper'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.yearOrEdition}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleSaveResource(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 cursor-pointer"
                        title={isSaved ? 'Remove bookmark' : 'Bookmark resource'}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {item.authorOrBody} · <span className="font-mono">{item.paperCode}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span>{item.durationMinutes} mins</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.totalMarks} Marks</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.pagesCount} pages</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setPaperStudyMode(isMarkScheme ? 'mark_scheme_table' : 'split_qp_ms');
                        setPreviewResource(item);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isTextbook ? 'Read Book' : 'Open Paper & MS'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePracticePastPaperInteractive(item)}
                      className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Quiz</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadResourceFile(
                          item,
                          isMarkScheme ? 'marking_scheme' : 'html_booklet'
                        )
                      }
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-400 text-slate-600 dark:text-slate-300 cursor-pointer"
                      title="Download Booklet"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== VIEW 5: GLOBAL EXAMINATION SYSTEMS REGISTRY, PROVENANCE & READINESS ANALYTICS ==================== */}
      {hubViewMode === 'registry_analytics' && (
        <div className="space-y-6">
          {/* Personal Exam Readiness & Self/AI-Marking Analytics Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Personal Examination Readiness &amp; Marking Analytics
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tracks your self-marked and AI-marked written paper responses, completed examination series, and bookmarked papers.
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Provenance Policy: Authentic Syllabus &amp; Specimen Papers Clearly Separated from AI Practice Synthesis
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  Supported Exam Systems
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5 block">
                  {EXAM_FORMAT_CATALOG.length - 1} Systems
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  Questions Self / AI-Marked
                </span>
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums mt-0.5 block">
                  {Object.keys(studentSelfMarks).length} Questions
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  Completed Exam Series
                </span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5 block">
                  {completedSessions.length} Series
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  Bookmarked Papers
                </span>
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5 block">
                  {savedIds.length} Saved
                </span>
              </div>
            </div>
          </div>

          {/* Complete 25+ Global Examination Systems Registry Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Global Examination Systems Registry &amp; Verification Matrix ({EXAM_FORMAT_CATALOG.length - 1} Boards)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click any examination system to filter subjects, historical sessions, question papers, and official marking schemes.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200">
                    <th className="p-3.5">Examination System</th>
                    <th className="p-3.5">Governing Authority &amp; Region</th>
                    <th className="p-3.5">Archive Span</th>
                    <th className="p-3.5">Paper Structure &amp; Scale</th>
                    <th className="p-3.5">Verification &amp; Rights</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {EXAM_FORMAT_CATALOG.filter((s) => s.id !== 'standard_exam').map((spec) => {
                    const startYr = EXAM_BOARD_INCEPTION_YEARS[spec.id] || 1990;
                    const count = boardCounts[spec.id] || 0;
                    return (
                      <tr
                        key={spec.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{spec.badgeEmoji}</span>
                            <div>
                              <div>{spec.shortName}</div>
                              <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                                { count } Indexed Papers &amp; Mark Schemes
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300">
                          <div className="font-semibold">{spec.governingBody}</div>
                          <div className="text-[11px] text-slate-500">{spec.regionTag}</div>
                        </td>
                        <td className="p-3.5 font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                          {startYr}–2026
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          <div>{spec.paperStructure}</div>
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                            {spec.gradingScaleLabel}
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                            Verified Syllabus &amp; Mark Scheme Structure
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Authorized Educational Practice Reference
                          </div>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              soundFx.playSelect();
                              setActiveRegionSlot('All Regions');
                              setActiveBoardFilter(spec.id);
                              const folder = PAST_PAPER_ACADEMY_SUBJECTS.find(
                                (f) => f.examFormat === spec.id
                              );
                              if (folder) setSelectedSubjectFolderId(folder.id);
                              setHubViewMode('directory');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
                          >
                            Open Papers
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Examiner Report & Grade Boundaries Modal */}
      {activeExaminerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Examiner Guidance &amp; Grade Boundaries
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeExaminerModal.folder.syllabusCode} {activeExaminerModal.folder.subjectName} ({activeExaminerModal.session})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveExaminerModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    Distinction / Top Grade
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    {activeExaminerModal.folder.gradeThresholds.distinction}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                    Credit / Strong Pass
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    {activeExaminerModal.folder.gradeThresholds.credit}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Minimum Pass Threshold
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    {activeExaminerModal.folder.gradeThresholds.pass}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Key Examiner Tips &amp; Common Mistakes to Avoid
                </h4>
                <ul className="space-y-2">
                  {activeExaminerModal.folder.examinerInsights.map((insight, i) => (
                    <li
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 leading-relaxed"
                    >
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveExaminerModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== AUTHENTIC WRITTEN EXAM PAPER & ACTIVE STUDY WORKBENCH MODAL ==================== */}
      {previewResource && (() => {
        const matchedFolder =
          PAST_PAPER_ACADEMY_SUBJECTS.find(
            (f) =>
              f.examFormat === previewResource.examFormat &&
              (previewResource.subject.includes(f.subjectName) ||
                previewResource.paperCode.includes(f.syllabusCode))
          ) || activeSubjectFolder;
        const paperMeta = getWrittenExamPaperHeaderMeta(
          matchedFolder,
          previewResource.yearOrEdition,
          previewResource.paperCode
        );
        const candidateHeaderBoxes = [
          'Candidate Full Name',
          'Centre / School Number',
          'Candidate / Index Number',
        ];
        const questions = previewResource.questions || [];
        const totalPossibleMarks =
          questions.reduce((acc, q) => acc + (q.marks || 0), 0) || previewResource.totalMarks || 100;
        const awardedMarksTotal = questions.reduce((acc, q) => {
          const qKey = `${previewResource.id}::q${q.number}`;
          return acc + (studentSelfMarks[qKey] || 0);
        }, 0);
        const percentageScore =
          totalPossibleMarks > 0 ? Math.round((awardedMarksTotal / totalPossibleMarks) * 100) : 0;
        const gradeEval = evaluateExamBoardGrade(previewResource.examFormat, percentageScore);

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-4 max-h-[94vh] flex flex-col">
              {/* Top Bar: Title + Timer + Self-Marked Score */}
              <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300 mb-0.5">
                    <span className="font-semibold text-amber-300">
                      {paperMeta.governingHeader}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">
                      {previewResource.paperCode} ({previewResource.yearOrEdition})
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white truncate">
                    {previewResource.title}
                  </h2>
                </div>

                {/* Live Study Timer + Self-Marking Grade Calculator */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {questions.length > 0 && (
                    <>
                      <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-2 text-xs">
                        <Clock className="w-3.5 h-3.5 text-amber-300" />
                        <span className="font-mono font-bold text-white tabular-nums">
                          {formatTimer(studyTimerSeconds)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsStudyTimerRunning((p) => !p)}
                          className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold cursor-pointer"
                        >
                          {isStudyTimerRunning ? 'Pause' : 'Start Timer'}
                        </button>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-2 text-xs">
                        <Award className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-semibold text-white tabular-nums">
                          Score: {awardedMarksTotal} / {totalPossibleMarks} ({percentageScore}%)
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                          {gradeEval.gradeBadge}
                        </span>
                      </div>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setPreviewResource(null)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Study Mode Switcher & Download Toolbar */}
              <div className="px-4 sm:px-6 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                {questions.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl">
                    {[
                      {
                        id: 'split_qp_ms',
                        label: 'Split View (Paper + Mark Scheme)',
                      },
                      {
                        id: 'written_paper',
                        label: 'Written Exam Paper Only',
                      },
                      {
                        id: 'mark_scheme_table',
                        label: 'Mark Scheme Table Only',
                      },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          soundFx.playSelect();
                          setPaperStudyMode(
                            m.id as 'written_paper' | 'split_qp_ms' | 'mark_scheme_table'
                          );
                          if (m.id === 'written_paper') {
                            setShowMarkingSchemeInPreview(false);
                          } else {
                            setShowMarkingSchemeInPreview(true);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          paperStudyMode === m.id
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Official Curriculum Textbook &amp; Worked Examples
                  </span>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {paperStudyMode === 'written_paper' && questions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowMarkingSchemeInPreview((prev) => !prev)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      {showMarkingSchemeInPreview ? 'Hide Answers' : 'Reveal Answers'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDownloadResourceFile(previewResource, 'html_booklet')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Paper</span>
                  </button>
                  {questions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleDownloadResourceFile(previewResource, 'marking_scheme')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Mark Scheme</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const item = previewResource;
                      setPreviewResource(null);
                      handlePracticePastPaperInteractive(item);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Timed Quiz</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/70 dark:bg-slate-950">
                {questions.length > 0 && (
                  <>
                    {/* Clean Written Examination Cover Sheet */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                        <div>
                          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {paperMeta.governingHeader} — {paperMeta.qualificationSubheader}
                          </div>
                          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                            {paperMeta.paperComponentHeader}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                            Time: {previewResource.durationMinutes} mins
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                            Max Marks: [{totalPossibleMarks}]
                          </span>
                        </div>
                      </div>

                      {/* Candidate Name / Centre Number Boxes */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {candidateHeaderBoxes.map((boxLabel, idx) => (
                          <div
                            key={boxLabel}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                          >
                            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                              {boxLabel}
                            </label>
                            {idx === 0 ? (
                              <input
                                type="text"
                                value={candidateName}
                                onChange={(e) => setCandidateName(e.target.value)}
                                className="w-full bg-transparent font-mono font-semibold text-slate-900 dark:text-white focus:outline-none"
                              />
                            ) : (
                              <input
                                type="text"
                                value={candidateCentreNo}
                                onChange={(e) => setCandidateCentreNo(e.target.value)}
                                className="w-full bg-transparent font-mono font-semibold text-slate-900 dark:text-white focus:outline-none"
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Provenance, Verification Status & Usage Rights */}
                      {(() => {
                        const prov = getDocumentProvenanceMeta(previewResource, matchedFolder);
                        return (
                          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                  {prov.verificationStatus}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{prov.completenessStatus}</span>
                                <span aria-hidden="true">·</span>
                                <span>Syllabus: {prov.syllabusVersion}</span>
                              </div>
                              <span>{prov.usageRights}</span>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                              <span>Source Authority: {prov.sourceAuthority}</span>
                              <span>Reference: {prov.sourceUrlOrReference}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* MODE 3: FULL OFFICIAL MARK SCHEME RUBRIC TABLE */}
                    {paperStudyMode === 'mark_scheme_table' ? (
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
                        <div className="px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold">
                            Official Mark Scheme (MS) — {previewResource.paperCode} ({previewResource.yearOrEdition})
                          </span>
                          <span className="text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-md">
                            Total: {totalPossibleMarks} Marks
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200">
                                <th className="p-3.5 border-r border-slate-200 dark:border-slate-700 w-16">Q#</th>
                                <th className="p-3.5 border-r border-slate-200 dark:border-slate-700 w-1/3">
                                  Acceptable Official Answer
                                </th>
                                <th className="p-3.5 border-r border-slate-200 dark:border-slate-700 w-20 text-center">
                                  Marks
                                </th>
                                <th className="p-3.5">
                                  Examiner M1 / A1 Marking Notes &amp; Method Guidance
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                              {questions.map((q) => (
                                <tr key={q.number} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                                  <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400 border-r border-slate-200 dark:border-slate-700">
                                    Q{q.number}
                                  </td>
                                  <td className="p-3.5 font-semibold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-700">
                                    {q.answer}
                                  </td>
                                  <td className="p-3.5 font-mono font-bold text-center text-emerald-700 dark:text-emerald-400 border-r border-slate-200 dark:border-slate-700 tabular-nums">
                                    [{q.marks}]
                                  </td>
                                  <td className="p-3.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {q.markingSchemeNotes}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      /* MODE 1 & 2: WRITTEN EXAM PAPER BOOKLET OR SPLIT-SCREEN WRITTEN QP + MARK SCHEME */
                      <div className="space-y-4">
                        {questions.map((q) => {
                          const qKey = `${previewResource.id}::q${q.number}`;
                          const workingText = studentWrittenWorking[qKey] || '';
                          const finalAnsText = studentFinalAnswers[qKey] || '';
                          const awarded = studentSelfMarks[qKey];
                          const isFlagged = flaggedQuestionKeys.includes(qKey);
                          const showMsPanel =
                            paperStudyMode === 'split_qp_ms' || showMarkingSchemeInPreview;

                          return (
                            <div
                              key={q.number}
                              className={`grid grid-cols-1 ${
                                showMsPanel ? 'lg:grid-cols-12' : ''
                              } gap-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs`}
                            >
                              {/* Left Side: Written Examination Question + Working Space + Answer Line */}
                              <div
                                className={`${
                                  showMsPanel
                                    ? 'lg:col-span-7 lg:border-r lg:border-slate-200 dark:lg:border-slate-800 lg:pr-5'
                                    : ''
                                } space-y-3.5`}
                              >
                                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-800 text-white font-mono text-xs font-bold flex items-center justify-center">
                                      {q.number}
                                    </span>
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                      {q.section}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => toggleFlagQuestion(qKey)}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                                        isFlagged
                                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300'
                                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                      }`}
                                    >
                                      {isFlagged ? 'Flagged' : 'Flag'}
                                    </button>
                                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                                      [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                                    </span>
                                  </div>
                                </div>

                                {/* Written Exam Question Prompt */}
                                <p className="text-sm sm:text-base font-serif text-slate-900 dark:text-white leading-relaxed">
                                  {q.question}
                                </p>

                                {/* Multiple Choice Options if applicable */}
                                {q.options && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                    {q.options.map((opt, idx) => {
                                      const isSelectedOpt = finalAnsText === opt;
                                      return (
                                        <button
                                          key={idx}
                                          type="button"
                                          onClick={() => {
                                            setStudentFinalAnswers((prev) => ({ ...prev, [qKey]: opt }));
                                            const isRight =
                                              opt.trim().toLowerCase() === q.answer.trim().toLowerCase();
                                            setStudentSelfMarks((prev) => ({
                                              ...prev,
                                              [qKey]: isRight ? q.marks : 0,
                                            }));
                                          }}
                                          className={`px-3 py-2 rounded-xl border text-left text-xs font-semibold flex items-center gap-2.5 cursor-pointer transition-all ${
                                            isSelectedOpt
                                              ? 'bg-indigo-600 text-white border-indigo-600'
                                              : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400'
                                          }`}
                                        >
                                          <span className="w-5 h-5 rounded bg-black/10 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                                            {String.fromCharCode(65 + idx)}
                                          </span>
                                          <span>{opt}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Written Working Space */}
                                <div className="space-y-1.5 pt-1">
                                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
                                    Working Space (Show your steps):
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={workingText}
                                    onChange={(e) =>
                                      setStudentWrittenWorking((prev) => ({
                                        ...prev,
                                        [qKey]: e.target.value,
                                      }))
                                    }
                                    placeholder="Write your formula, substitution, and working steps here..."
                                    className="w-full p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                                  />
                                </div>

                                {/* Final Answer Line + AI Examiner Mark + AI Tutor Buttons */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <button
                                      type="button"
                                      disabled={markingQuestionKey === qKey}
                                      onClick={() =>
                                        handleAiMarkQuestionWorking(qKey, q, previewResource.title)
                                      }
                                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                                    >
                                      <Sparkles className="w-3.5 h-3.5" />
                                      <span>
                                        {markingQuestionKey === qKey
                                          ? 'AI Marking...'
                                          : 'AI Mark My Working'}
                                      </span>
                                    </button>

                                    <button
                                      type="button"
                                      disabled={explainingQuestionKey === qKey}
                                      onClick={() =>
                                        handleAskAiTutorForQuestion(qKey, q, previewResource.title)
                                      }
                                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                                    >
                                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                      <span>
                                        {explainingQuestionKey === qKey
                                          ? 'Explaining...'
                                          : 'Step-by-Step Tutor'}
                                      </span>
                                    </button>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-serif italic text-slate-600 dark:text-slate-400">
                                      Answer =
                                    </span>
                                    <input
                                      type="text"
                                      value={finalAnsText}
                                      onChange={(e) =>
                                        setStudentFinalAnswers((prev) => ({
                                          ...prev,
                                          [qKey]: e.target.value,
                                        }))
                                      }
                                      placeholder="Write final answer..."
                                      className="sm:w-56 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        soundFx.playSelect();
                                        const cleanUser = finalAnsText.trim().toLowerCase();
                                        const cleanOfficial = q.answer.trim().toLowerCase();
                                        const isMatch =
                                          cleanUser.length > 0 &&
                                          (cleanOfficial.includes(cleanUser) ||
                                            cleanUser.includes(cleanOfficial));
                                        setStudentSelfMarks((prev) => ({
                                          ...prev,
                                          [qKey]: isMatch ? q.marks : 0,
                                        }));
                                        setShowMarkingSchemeInPreview(true);
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold cursor-pointer"
                                    >
                                      Check Answer
                                    </button>
                                  </div>
                                </div>

                                {/* AI Examiner Feedback Callout */}
                                {aiQuestionFeedback[qKey] && (
                                  <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                                    {aiQuestionFeedback[qKey]}
                                  </div>
                                )}

                                {/* AI Personal Tutor Worked Solution Callout */}
                                {aiTutorExplanation[qKey] && (
                                  <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-slate-800 dark:text-slate-200 space-y-1 leading-relaxed">
                                    <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center justify-between">
                                      <span>AI Personal Tutor — Worked Solution &amp; Concept Guide</span>
                                      <span className="text-[11px] font-normal text-amber-700 dark:text-amber-400">
                                        AI-Generated Pedagogical Walkthrough
                                      </span>
                                    </div>
                                    <p className="whitespace-pre-line">{aiTutorExplanation[qKey]}</p>
                                  </div>
                                )}
                              </div>

                              {/* Right Side: Official Mark Scheme & Self-Grading */}
                              {showMsPanel && (
                                <div className="lg:col-span-5 flex flex-col justify-between gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-4">
                                  <div className="space-y-2.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                        Official Mark Scheme (Q{q.number})
                                      </span>
                                      <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                                        [{q.marks} Marks]
                                      </span>
                                    </div>

                                    <div className="text-xs font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-900 p-3 rounded-lg border border-emerald-200/80 dark:border-emerald-800">
                                      <span className="text-emerald-700 dark:text-emerald-400 block text-[10px] uppercase font-bold mb-0.5">
                                        Official Answer:
                                      </span>
                                      {q.answer}
                                    </div>

                                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                      <strong className="text-emerald-800 dark:text-emerald-300">
                                        Examiner Marking Notes:
                                      </strong>{' '}
                                      {q.markingSchemeNotes}
                                    </div>
                                  </div>

                                  {/* Self-Grading Buttons */}
                                  <div className="pt-2.5 border-t border-emerald-200/70 dark:border-emerald-800/70 flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                                      Your Marks:
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: q.marks + 1 }, (_, m) => m).map((mVal) => {
                                        const isSelectedMark = awarded === mVal;
                                        return (
                                          <button
                                            key={mVal}
                                            type="button"
                                            onClick={() => {
                                              soundFx.playSelect();
                                              setStudentSelfMarks((prev) => ({
                                                ...prev,
                                                [qKey]: mVal,
                                              }));
                                            }}
                                            className={`w-7 h-7 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                                              isSelectedMark
                                                ? 'bg-emerald-600 text-white border-emerald-600'
                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-emerald-200 dark:border-slate-700 hover:bg-emerald-100'
                                            }`}
                                          >
                                            {mVal}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {previewResource.chapters && previewResource.chapters.length > 0 && (
                  <div className="space-y-4">
                    {previewResource.chapters.map((ch) => (
                      <div
                        key={ch.chapterNumber}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Chapter {ch.chapterNumber}
                          </span>
                          {onOpenNotesGenerator && (
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewResource(null);
                                onOpenNotesGenerator(ch.practicePrompt, previewResource.examFormat);
                              }}
                              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            >
                              Generate Study Guide on Chapter →
                            </button>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {ch.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {ch.summary}
                        </p>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                          <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                            Key Formulas &amp; Syllabus Rules
                          </div>
                          <ul className="space-y-1 text-xs font-mono text-slate-800 dark:text-slate-200">
                            {ch.keyFormulasOrRules.map((rule, i) => (
                              <li key={i}>• {rule}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                          <div className="font-bold text-emerald-900 dark:text-emerald-300">
                            Worked Example: {ch.workedExample.problem}
                          </div>
                          <div className="text-emerald-800 dark:text-emerald-200">
                            <strong>Solution:</strong> {ch.workedExample.solution}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

