import React, { useState, useMemo } from 'react';
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
} from '../utils/examFormats';
import {
  PAST_PAPER_ACADEMY_SUBJECTS,
  TOPICAL_PAST_PAPER_PACKS,
  buildExpandedPastPaperAcademyResources,
  SubjectFolderSpec,
  TopicalPastPaperPack,
} from '../data/pastPaperAcademyCatalog';
import { soundFx } from '../utils/audio';

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

export const PastPapersHubView: React.FC<PastPapersHubViewProps> = ({
  persona,
  selectedExamFormat = 'waec',
  onStartQuiz,
  onOpenNotesGenerator,
  onOpenWorksheet,
}) => {
  // PastPaperAcademy View Mode: 'directory' | 'topical' | 'textbooks' | 'grid'
  const [hubViewMode, setHubViewMode] = useState<'directory' | 'topical' | 'textbooks' | 'grid'>('directory');
  const [activeBoardFilter, setActiveBoardFilter] = useState<ExamFormatId | 'all'>('all');
  const [activeKindFilter, setActiveKindFilter] = useState<'all' | 'past_paper' | 'textbook' | 'marking_scheme'>('all');
  const [selectedSubjectFolderId, setSelectedSubjectFolderId] = useState<string>(
    PAST_PAPER_ACADEMY_SUBJECTS[0]?.id || 'waec-402-math'
  );
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({
    '2025 Specimen': true,
    '2024 May/June (School)': true,
    '2024 UTME CBT': true,
    '2024 May/June (s24)': true,
    '2024 October Series': true,
  });
  const [activeExaminerModal, setActiveExaminerModal] = useState<{
    folder: SubjectFolderSpec;
    session: string;
    mode: 'ER' | 'GT';
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewResource, setPreviewResource] = useState<AcademicResourceItem | null>(null);
  const [showMarkingSchemeInPreview, setShowMarkingSchemeInPreview] = useState<boolean>(true);
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
  const [customYear, setCustomYear] = useState<string>('2024');
  const [customResourceKind, setCustomResourceKind] = useState<'past_paper' | 'textbook'>('past_paper');
  const [customResources, setCustomResources] = useState<AcademicResourceItem[]>([]);
  const [isSynthesizingCustom, setIsSynthesizingCustom] = useState<boolean>(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

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

  const filteredSubjectFolders = useMemo(() => {
    return PAST_PAPER_ACADEMY_SUBJECTS.filter((f) => {
      if (activeBoardFilter !== 'all' && f.examFormat !== activeBoardFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          f.subjectName.toLowerCase().includes(q) ||
          f.syllabusCode.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          f.textbookTitle.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeBoardFilter, searchQuery]);

  const activeSubjectFolder: SubjectFolderSpec = useMemo(() => {
    return (
      filteredSubjectFolders.find((f) => f.id === selectedSubjectFolderId) ||
      filteredSubjectFolders[0] ||
      PAST_PAPER_ACADEMY_SUBJECTS[0]
    );
  }, [filteredSubjectFolders, selectedSubjectFolderId]);

  const filteredTopicalPacks = useMemo(() => {
    return TOPICAL_PAST_PAPER_PACKS.filter((p) => {
      if (activeBoardFilter !== 'all' && p.examFormat !== activeBoardFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.topicName.toLowerCase().includes(q) ||
          p.subject.toLowerCase().includes(q) ||
          p.keySubtopics.some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [activeBoardFilter, searchQuery]);

  const filteredResources = useMemo(() => {
    return allResources.filter((item) => {
      if (activeBoardFilter !== 'all' && item.examFormat !== activeBoardFilter) {
        return false;
      }
      if (activeKindFilter !== 'all' && item.kind !== activeKindFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSubj = item.subject.toLowerCase().includes(q);
        const matchCode = item.paperCode.toLowerCase().includes(q);
        const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
        return matchTitle || matchSubj || matchCode || matchTags;
      }
      return true;
    });
  }, [allResources, activeBoardFilter, activeKindFilter, searchQuery]);

  // Trigger a real browser file download (HTML Printable Booklet or Markdown/Text) without window.open
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
        lines.push('## Official Past Paper Questions & Marking Scheme', '');
        item.questions.forEach((q) => {
          lines.push(`### Question ${q.number} (${q.section}) — [${q.marks} Marks]`);
          lines.push(q.question, '');
          if (q.options) {
            q.options.forEach((opt, idx) => {
              lines.push(`- **${String.fromCharCode(65 + idx)}.** ${opt}`);
            });
            lines.push('');
          }
          lines.push(`**Correct Answer:** ${q.answer}`);
          lines.push(`**Examiner Marking Scheme:** ${q.markingSchemeNotes}`, '');
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

    // Printable HTML Exam Booklet / Textbook PDF-ready document
    const includeScheme = format === 'marking_scheme' || true;
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${item.title} — ${spec.shortName}</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #0f172a; max-width: 860px; margin: 32px auto; padding: 0 24px; line-height: 1.6; }
    .cover-box { border: 3px solid #0f172a; border-radius: 16px; padding: 24px; background: #f8fafc; margin-bottom: 28px; }
    .badge { display: inline-block; background: #4f46e5; color: #fff; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.06em; }
    h1 { font-size: 24px; margin: 10px 0 6px; color: #0f172a; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 2px dashed #cbd5e1; font-size: 13px; }
    .q-card { border: 2px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 18px; page-break-inside: avoid; }
    .q-header { display: flex; justify-content: space-between; font-weight: 800; font-size: 13px; color: #4f46e5; margin-bottom: 8px; }
    .options { list-style: none; padding-left: 0; margin: 12px 0; }
    .options li { padding: 6px 10px; margin-bottom: 6px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; }
    .scheme { margin-top: 12px; padding: 12px; border-radius: 8px; background: #ecfdf5; border-left: 4px solid #10b981; font-size: 13px; }
    .formula-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; border-radius: 8px; font-family: monospace; margin: 10px 0; }
    @media print { .no-print { display: none; } body { margin: 0; } }
  </style>
</head>
<body>
  <div class="cover-box">
    <span class="badge">${spec.badgeEmoji} ${spec.fullName} · ${item.kind === 'textbook' ? 'OFFICIAL TEXTBOOK COMPENDIUM' : 'OFFICIAL PAST PAPER & MARKING SCHEME'}</span>
    <h1>${item.title}</h1>
    <p style="margin:4px 0;color:#475569;font-size:14px;">${item.description}</p>
    <div class="meta-grid">
      <div><strong>Paper Code:</strong><br/>${item.paperCode}</div>
      <div><strong>Series / Edition:</strong><br/>${item.yearOrEdition}</div>
      <div><strong>Duration:</strong><br/>${item.durationMinutes} Minutes</div>
      <div><strong>Total Marks:</strong><br/>${item.totalMarks} Marks</div>
    </div>
  </div>
  ${
    item.questions && item.questions.length > 0
      ? `<h2>Examination Questions${includeScheme ? ' & Marking Scheme' : ''}</h2>` +
        item.questions
          .map(
            (q) => `
      <div class="q-card">
        <div class="q-header">
          <span>Question ${q.number} · ${q.section}</span>
          <span>[${q.marks} Marks]</span>
        </div>
        <div style="font-weight:700;font-size:15px;">${q.question}</div>
        ${
          q.options
            ? `<ul class="options">${q.options
                .map((opt, idx) => `<li><strong>${String.fromCharCode(65 + idx)}.</strong> ${opt}</li>`)
                .join('')}</ul>`
            : ''
        }
        ${
          includeScheme
            ? `<div class="scheme"><strong>Official Answer:</strong> ${q.answer}<br/><strong>Marking Scheme & Working:</strong> ${q.markingSchemeNotes}</div>`
            : ''
        }
      </div>`
          )
          .join('')
      : ''
  }
  ${
    item.chapters && item.chapters.length > 0
      ? `<h2>Textbook Chapters, Formulas & Worked Examples</h2>` +
        item.chapters
          .map(
            (ch) => `
      <div class="q-card">
        <div class="q-header">
          <span>Chapter ${ch.chapterNumber}</span>
          <span>${item.subject}</span>
        </div>
        <h3 style="margin:4px 0 8px;">${ch.title}</h3>
        <p>${ch.summary}</p>
        <div class="formula-box">
          <strong>Key Formulas & Principles:</strong><br/>
          ${ch.keyFormulasOrRules.map((f) => `• ${f}`).join('<br/>')}
        </div>
        <div class="scheme">
          <strong>Worked Example:</strong> ${ch.workedExample.problem}<br/>
          <strong>Step-by-Step Solution:</strong> ${ch.workedExample.solution}
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
    a.download = `${safeFilename}-${format === 'marking_scheme' ? 'marking-scheme' : 'booklet'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadToast(
      `Downloaded "${item.title}" (${format === 'marking_scheme' ? 'Marking Scheme' : 'Printable Exam/Textbook Booklet'})`
    );
    setTimeout(() => setDownloadToast(null), 4000);
  };

  // Convert any Past Paper or Textbook into a live interactive QuizResponse and launch in QuizRunner
  const handlePracticePastPaperInteractive = (item: AcademicResourceItem) => {
    soundFx.playStart();
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
        pedagogical_topic: item.subject,
        pedagogical_subtopic: q.section,
        bloom_level: 'Apply',
        cognitive_domain: 'Quantitative & Analytical',
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
          options: q.options,
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
          options: q.options,
          answer: q.correct_answer,
          markingSchemeNotes: q.explanation,
        }));
      }

      const newResource: AcademicResourceItem = {
        id: `custom-${customExamBoard}-${Date.now()}`,
        title:
          customResourceKind === 'past_paper'
            ? `${spec.shortName} ${customYear} ${cleanSubj} Past Paper & Marking Scheme`
            : `${spec.shortName} ${cleanSubj} Complete Revision Textbook (${customYear} Edition)`,
        examFormat: customExamBoard,
        kind: customResourceKind,
        subject: cleanSubj,
        yearOrEdition: `${customYear} Series`,
        paperCode: `${spec.shortName.toUpperCase().slice(0, 4)}-${customYear}-${Math.floor(100 + Math.random() * 899)}`,
        durationMinutes: spec.defaultTimeMinutes || 90,
        totalMarks: 100,
        pagesCount: 16,
        fileSizeLabel: '1.3 MB',
        authorOrBody: `${spec.governingBody} AI Synthesis`,
        description: `Custom generated ${spec.fullName} ${
          customResourceKind === 'past_paper' ? 'past paper with full M1/A1 marking scheme' : 'textbook chapters, formulas, and worked examples'
        } for ${cleanSubj}.`,
        tags: [spec.shortName, cleanSubj, customYear, customResourceKind === 'past_paper' ? 'Past Paper' : 'Textbook'],
        questions: synthesizedQuestions,
        chapters:
          customResourceKind === 'textbook'
            ? synthesizedQuestions.map((sq, idx) => ({
                chapterNumber: idx + 1,
                title: `${cleanSubj} Core Unit ${idx + 1}`,
                summary: sq.markingSchemeNotes,
                keyFormulasOrRules: [
                  `Master ${spec.shortName} syllabus objective ${idx + 1} for ${cleanSubj}`,
                  `Apply official ${spec.governingBody} marking scheme conventions`,
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Download Notification Banner */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white border-2 border-slate-950 shadow-xl flex items-center gap-2.5 text-xs font-black animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="comic-tab-hero rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="comic-badge px-3 py-1 rounded-xl bg-amber-300 text-slate-950 border-2 border-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <FolderDown className="w-3.5 h-3.5" />
                <span>OFFICIAL PAST PAPERS &amp; TEXTBOOKS HUB</span>
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-950/60 border border-white/25 text-xs font-extrabold text-cyan-200">
                WAEC · JAMB · Checkpoint · NECO · IGCSE · SAT · AP/IB
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Download Past Papers, Marking Schemes &amp;{' '}
              <span className="inline-block px-3 py-0.5 rounded-xl bg-amber-300 text-slate-950 border-b-3 border-amber-600">
                Exam Textbooks
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 font-semibold leading-relaxed max-w-2xl">
              Browse and download printable past question booklets, step-by-step Chief Examiner marking schemes, and subject revision textbooks — or practice any paper live in timed CBT mode.
            </p>
          </div>

          {/* Quick Stats Pill Card */}
          <div className="grid grid-cols-3 gap-2.5 bg-slate-950/55 p-3.5 rounded-2xl border-2 border-slate-950 self-start lg:self-center shrink-0">
            <div className="text-center px-2">
              <div className="text-xl font-black text-amber-300">{allResources.length}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                Papers &amp; Books
              </div>
            </div>
            <div className="text-center px-2 border-x border-white/15">
              <div className="text-xl font-black text-emerald-400">8</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                Exam Boards
              </div>
            </div>
            <div className="text-center px-2">
              <div className="text-xl font-black text-cyan-300">{savedIds.length}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                Bookmarked
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom On-Demand Past Paper & Textbook Synthesizer Bar */}
      <div className="p-5 rounded-3xl border-2 border-b-4 border-indigo-200 dark:border-indigo-900/70 bg-gradient-to-r from-indigo-50/70 via-white to-amber-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
              ✨ On-Demand AI Past Paper &amp; Textbook Builder
            </span>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              Need a specific exam year, subject paper, or textbook chapter? Generate &amp; download it instantly:
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <select
            value={customExamBoard}
            onChange={(e) => setCustomExamBoard(e.target.value as ExamFormatId)}
            aria-label="Select Exam Board"
            className="px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-extrabold text-slate-900 dark:text-white"
          >
            {EXAM_FORMAT_CATALOG.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.badgeEmoji} {spec.shortName}
              </option>
            ))}
          </select>

          <select
            value={customResourceKind}
            onChange={(e) => setCustomResourceKind(e.target.value as 'past_paper' | 'textbook')}
            aria-label="Select Resource Type"
            className="px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-extrabold text-slate-900 dark:text-white"
          >
            <option value="past_paper">📄 Past Paper + Marking Scheme</option>
            <option value="textbook">📚 Revision Textbook + Worked Examples</option>
          </select>

          <input
            type="text"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            placeholder="Subject (e.g., Chemistry, Economics, Biology)"
            className="px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
          />

          <select
            value={customYear}
            onChange={(e) => setCustomYear(e.target.value)}
            aria-label="Select Exam Series Year"
            className="px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-extrabold text-slate-900 dark:text-white"
          >
            {['2025 Specimen', '2024', '2023', '2022', '2021', '2020'].map((yr) => (
              <option key={yr} value={yr}>
                📅 {yr} Series
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={isSynthesizingCustom}
            onClick={handleSynthesizeCustomResource}
            className="arcade-btn px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-black border-2 border-slate-950 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isSynthesizingCustom ? 'Building Booklet...' : 'Generate & Open'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Controls + PastPaperAcademy View Mode Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 space-y-4 shadow-xs">
        {/* Top Row: PastPaperAcademy Organization Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'directory', emoji: '📁', label: 'Subject & Year Folders (PastPaperAcademy)' },
              { id: 'topical', emoji: '🎯', label: `Topical Past Papers (${TOPICAL_PAST_PAPER_PACKS.length})` },
              { id: 'textbooks', emoji: '📚', label: 'Textbooks & Syllabus Books' },
              { id: 'grid', emoji: '🗂️', label: `All Papers Archive (${allResources.length})` },
            ].map((mode) => {
              const isPicked = hubViewMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    setHubViewMode(mode.id as 'directory' | 'topical' | 'textbooks' | 'grid');
                    if (mode.id === 'textbooks') {
                      setActiveKindFilter('textbook');
                    } else if (mode.id === 'grid') {
                      setActiveKindFilter('all');
                    }
                  }}
                  className={`arcade-btn px-3.5 py-2 rounded-2xl text-xs font-black border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    isPicked
                      ? 'bg-indigo-600 text-white border-slate-950 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  <span>{mode.emoji}</span>
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
            QP = Question Paper · MS = Mark Scheme · ER = Examiner Report · GT = Grade Threshold
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Exam Board Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                soundFx.playSelect();
                setActiveBoardFilter('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer whitespace-nowrap ${
                activeBoardFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              🌍 All Exams ({allResources.length})
            </button>
            {EXAM_FORMAT_CATALOG.filter((f) => f.id !== 'general').map((spec) => {
              const isSelected = activeBoardFilter === spec.id;
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    setActiveBoardFilter(spec.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  <span>{spec.badgeEmoji}</span>
                  <span>{spec.shortName}</span>
                </button>
              );
            })}
          </div>

          {/* Resource Type Switcher */}
          {hubViewMode === 'grid' && (
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              {[
                { id: 'all', label: `All (${allResources.length})` },
                { id: 'past_paper', label: '📄 Past Papers' },
                { id: 'textbook', label: '📚 Textbooks' },
                { id: 'marking_scheme', label: '✅ Syllabuses & ER' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    soundFx.playSelect();
                    setActiveKindFilter(tab.id as 'all' | 'past_paper' | 'textbook' | 'marking_scheme');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    activeKindFilter === tab.id
                      ? 'bg-amber-300 text-slate-950 border-slate-950'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by syllabus code (0580, 0625, WAEC 402, UTME-ENG), subject, year, or textbook title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ==================== VIEW 1: PASTPAPERACADEMY SUBJECT & YEAR DIRECTORY ==================== */}
      {hubViewMode === 'directory' && activeSubjectFolder && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Qualification & Subject Folders Sidebar */}
          <div className="lg:col-span-4 space-y-2.5">
            <div className="px-3 py-2 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs font-black">
              <span>📂 Subject Folders ({filteredSubjectFolders.length})</span>
              <span className="text-amber-300">Syllabus Code</span>
            </div>

            <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
              {filteredSubjectFolders.map((folder) => {
                const isSelected = folder.id === activeSubjectFolder.id;
                const boardSpec = getExamFormatSpec(folder.examFormat);
                const totalPaperFiles = folder.sessions.length * folder.papersOffered.length;

                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => {
                      soundFx.playSelect();
                      setSelectedSubjectFolderId(folder.id);
                    }}
                    className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                      isSelected
                        ? 'border-indigo-600 dark:border-amber-400 bg-indigo-50/90 dark:bg-indigo-950/70 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg shrink-0 border border-slate-200 dark:border-slate-700">
                        {folder.iconEmoji}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 font-mono text-[10px] font-black">
                            {folder.syllabusCode}
                          </span>
                          <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">
                            {boardSpec.shortName}
                          </span>
                        </div>
                        <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-white mt-1 truncate">
                          {folder.subjectName}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                          {folder.sessions.length} Sessions · {totalPaperFiles} Papers + Textbook
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 mt-2 transition-transform ${
                        isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Subject Folder -> Textbook Banner + Year/Session Accordions + QP/MS/ER/GT Table */}
          <div className="lg:col-span-8 space-y-4">
            {/* Subject Folder Header & Grade Threshold Strip */}
            <div className="p-5 rounded-3xl border-2 border-slate-900 dark:border-slate-700 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-300 text-slate-950 font-mono text-xs font-black">
                      {activeSubjectFolder.syllabusCode}
                    </span>
                    <span className="text-xs font-extrabold text-cyan-300">
                      {getExamFormatSpec(activeSubjectFolder.examFormat).fullName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold text-indigo-200">
                      {activeSubjectFolder.category}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    {activeSubjectFolder.iconEmoji} {activeSubjectFolder.subjectName} — Past Papers, Schemes &amp; Textbook
                  </h2>
                </div>

                {onOpenNotesGenerator && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenNotesGenerator(
                        `${activeSubjectFolder.syllabusCode} ${activeSubjectFolder.subjectName}`,
                        activeSubjectFolder.examFormat
                      )
                    }
                    className="arcade-btn px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-2 border-slate-950 text-xs font-black cursor-pointer flex items-center gap-1.5 self-start shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Syllabus Notes</span>
                  </button>
                )}
              </div>

              {/* Official Grade Thresholds Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/15 text-xs">
                <div className="p-2.5 rounded-xl bg-white/10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                    🏆 Distinction Threshold
                  </span>
                  <span className="font-bold text-white">{activeSubjectFolder.gradeThresholds.distinction}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                    ⭐ Credit Threshold
                  </span>
                  <span className="font-bold text-white">{activeSubjectFolder.gradeThresholds.credit}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
                    ✓ Pass Threshold
                  </span>
                  <span className="font-bold text-white">{activeSubjectFolder.gradeThresholds.pass}</span>
                </div>
              </div>
            </div>

            {/* Official Recommended Subject Textbook Card */}
            {(() => {
              const subjectBook: AcademicResourceItem = {
                id: `ppa-book-${activeSubjectFolder.id}`,
                title: activeSubjectFolder.textbookTitle,
                examFormat: activeSubjectFolder.examFormat,
                kind: 'textbook',
                subject: activeSubjectFolder.subjectName,
                yearOrEdition: 'Complete Curriculum Edition',
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
                <div className="p-4 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase">
                        📚 Recommended Syllabus Textbook
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        By {activeSubjectFolder.textbookAuthor}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {activeSubjectFolder.textbookTitle}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewResource(subjectBook)}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-400 text-xs font-black text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Chapters</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadResourceFile(subjectBook, 'html_booklet')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-300" />
                      <span>Download Textbook</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Year & Session Folders Accordion (PastPaperAcademy Style — All Sessions Included!) */}
            <div className="flex items-center justify-between px-1 pt-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                📅 All Exam Years &amp; Series ({activeSubjectFolder.sessions.length} Sessions · {activeSubjectFolder.sessions.length * activeSubjectFolder.papersOffered.length} Papers)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    const next: Record<string, boolean> = {};
                    activeSubjectFolder.sessions.forEach((s) => {
                      next[s] = true;
                    });
                    setExpandedSessions(next);
                  }}
                  className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Expand All Years
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setHubViewMode('grid');
                    setActiveKindFilter('all');
                  }}
                  className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  View All {allResources.length} Papers →
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {activeSubjectFolder.sessions.map((session) => {
                const isExpanded = expandedSessions[session] ?? true;
                return (
                  <div
                    key={session}
                    className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs"
                  >
                    {/* Session Folder Header */}
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setExpandedSessions((prev) => ({ ...prev, [session]: !isExpanded }));
                      }}
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50/50 dark:hover:bg-slate-800 flex items-center justify-between gap-2 text-left cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{isExpanded ? '📂' : '📁'}</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {session}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black">
                          {activeSubjectFolder.papersOffered.length} Papers (QP + MS + ER + GT)
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                        {isExpanded ? 'Hide Papers ▲' : 'View Papers ▼'}
                      </span>
                    </button>

                    {/* Paired Paper Rows inside the Session */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {activeSubjectFolder.papersOffered.map((paper) => {
                          const paperResource: AcademicResourceItem = {
                            id: `ppa-${activeSubjectFolder.id}-${session}-${paper.paperNumber}`,
                            title: `${activeSubjectFolder.syllabusCode} ${activeSubjectFolder.subjectName} — ${paper.paperNumber}: ${paper.paperTitle}`,
                            examFormat: activeSubjectFolder.examFormat,
                            kind: 'past_paper',
                            subject: activeSubjectFolder.subjectName,
                            yearOrEdition: session,
                            paperCode: `${activeSubjectFolder.syllabusCode} / ${paper.paperNumber}`,
                            durationMinutes: paper.durationMinutes,
                            totalMarks: paper.totalMarks,
                            pagesCount: 16,
                            fileSizeLabel: '1.4 MB',
                            authorOrBody: `${activeSubjectFolder.syllabusCode} Official Board`,
                            description: `${session} ${activeSubjectFolder.subjectName} (${paper.paperTitle}) with full questions and marking scheme.`,
                            tags: [activeSubjectFolder.syllabusCode, session, paper.paperNumber],
                            questions: activeSubjectFolder.coreQuestions.map((q, idx) => ({
                              ...q,
                              number: idx + 1,
                              section: `${session} · ${paper.paperNumber}`,
                            })),
                          };

                          return (
                            <div
                              key={paper.paperNumber}
                              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-slate-900 text-white dark:bg-slate-700">
                                    {paper.paperNumber}
                                  </span>
                                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                                    {paper.paperTitle}
                                  </span>
                                </div>
                                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-3">
                                  <span>⏱️ {paper.durationMinutes} mins</span>
                                  <span>🏆 {paper.totalMarks} Marks</span>
                                  <span>📄 {session}</span>
                                </div>
                              </div>

                              {/* PastPaperAcademy Paired Quick Action Badges: QP | MS | ER | GT | CBT */}
                              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadResourceFile(paperResource, 'html_booklet')}
                                  className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="Download Question Paper Booklet (QP)"
                                >
                                  <Download className="w-3 h-3 text-amber-300" />
                                  <span>QP</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    soundFx.playClick();
                                    setShowMarkingSchemeInPreview(true);
                                    setPreviewResource(paperResource);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="View & Download Official Marking Scheme (MS)"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>MS</span>
                                </button>

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
                                  className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-black cursor-pointer"
                                  title="View Chief Examiner Report (ER)"
                                >
                                  ER
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    soundFx.playClick();
                                    setActiveExaminerModal({
                                      folder: activeSubjectFolder,
                                      session,
                                      mode: 'GT',
                                    });
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-[11px] font-black cursor-pointer"
                                  title="View Session Grade Thresholds (GT)"
                                >
                                  GT
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handlePracticePastPaperInteractive(paperResource)}
                                  className="px-3 py-1.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 border border-slate-950 text-[11px] font-black cursor-pointer flex items-center gap-1"
                                  title="Practice this paper in Timed CBT Mode"
                                >
                                  <Play className="w-3 h-3 fill-slate-950" />
                                  <span>CBT</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="rounded-3xl border-2 border-b-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4 hover:border-indigo-400 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-black">
                      {spec.badgeEmoji} {spec.shortName} · {pack.subject}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 text-[11px] font-black">
                      {pack.difficulty} · {pack.questionCount} Qs ({pack.yearsCovered})
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    🎯 {pack.topicName}
                  </h3>

                  <div className="flex flex-wrap gap-1.5">
                    {pack.keySubtopics.map((sub) => (
                      <span
                        key={sub}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300"
                      >
                        • {sub}
                      </span>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="font-black text-indigo-600 dark:text-indigo-400">
                      Sample Past Question ({pack.sampleQuestion.marks} Marks):
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {pack.sampleQuestion.question}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadResourceFile(topicalResource, 'html_booklet')}
                    className="arcade-btn flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-300" />
                    <span>Download Topical Pack (QP+MS)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePracticePastPaperInteractive(topicalResource)}
                    className="py-2 px-3.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 border border-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Practice Topic CBT</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== VIEW 3 & 4: TEXTBOOKS LIBRARY / ALL PAPERS GRID ==================== */}
      {(hubViewMode === 'grid' || hubViewMode === 'textbooks') && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((item) => {
          const spec = getExamFormatSpec(item.examFormat);
          const isSaved = savedIds.includes(item.id);
          const isTextbook = item.kind === 'textbook';

          return (
            <div
              key={item.id}
              className="rounded-3xl border-2 border-b-[5px] border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-700 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4 hover:border-indigo-400 transition-all shadow-xs"
            >
              <div className="space-y-3">
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-black">
                      {spec.badgeEmoji} {spec.shortName}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        isTextbook
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {isTextbook ? '📚 Official Textbook' : '📄 Past Paper + Scheme'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {item.yearOrEdition}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSaveResource(item.id)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 cursor-pointer"
                    title={isSaved ? 'Remove from saved' : 'Bookmark Past Paper / Textbook'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Title & Author */}
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.authorOrBody} · Code: <span className="font-mono text-indigo-600 dark:text-indigo-400">{item.paperCode}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                {/* Metadata Strip */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    {item.durationMinutes} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    {item.totalMarks} Marks
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    {item.pagesCount} pages ({item.fileSizeLabel})
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadResourceFile(item, 'html_booklet')}
                  className="arcade-btn flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>Download Booklet</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadResourceFile(item, 'markdown')}
                  className="py-2.5 px-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-400 text-xs font-extrabold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                  title="Download Markdown / Text Revision Pack"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                  <span>.MD</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setPreviewResource(item);
                  }}
                  className="py-2.5 px-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Read / Scheme</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePracticePastPaperInteractive(item)}
                  className="py-2.5 px-3.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 border-2 border-slate-950 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Practice this past paper interactively in timed Exam Mode"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Practice CBT</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Examiner Report (ER) & Grade Thresholds (GT) Modal */}
      {activeExaminerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-900 dark:border-slate-700 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white flex items-center justify-between gap-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-300 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  {activeExaminerModal.mode === 'ER' ? 'CHIEF EXAMINER REPORT (ER)' : 'OFFICIAL GRADE THRESHOLDS (GT)'}
                </span>
                <h3 className="text-base sm:text-lg font-black mt-1">
                  {activeExaminerModal.folder.syllabusCode} {activeExaminerModal.folder.subjectName} ({activeExaminerModal.session})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveExaminerModal(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">
                    Distinction
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                    {activeExaminerModal.folder.gradeThresholds.distinction}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <div className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300">
                    Credit
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                    {activeExaminerModal.folder.gradeThresholds.credit}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                  <div className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-300">
                    Pass
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5">
                    {activeExaminerModal.folder.gradeThresholds.pass}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Chief Examiner Observations &amp; Candidate Pitfalls to Avoid:
                </h4>
                <ul className="space-y-2">
                  {activeExaminerModal.folder.examinerInsights.map((insight, i) => (
                    <li
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-l-4 border-purple-500 text-xs font-semibold text-slate-700 dark:text-slate-200"
                    >
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveExaminerModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-black cursor-pointer"
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Reader & Marking Scheme Modal */}
      {previewResource && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-900 dark:border-slate-700 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">
                    {getExamFormatSpec(previewResource.examFormat).fullName}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {previewResource.paperCode} · {previewResource.yearOrEdition}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {previewResource.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewResource(null)}
                className="p-2 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Toolbar */}
            <div className="px-6 py-3 bg-indigo-50/60 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {previewResource.questions && previewResource.questions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowMarkingSchemeInPreview((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer transition-all ${
                      showMarkingSchemeInPreview
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {showMarkingSchemeInPreview ? '✓ Marking Scheme Visible' : 'Show Marking Scheme'}
                  </button>
                )}
                {onOpenNotesGenerator && (
                  <button
                    type="button"
                    onClick={() => {
                      const topic = `${previewResource.subject} (${previewResource.title})`;
                      setPreviewResource(null);
                      onOpenNotesGenerator(topic, previewResource.examFormat);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate AI Notes from Paper</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadResourceFile(previewResource, 'html_booklet')}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>Download Booklet (.HTML)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const item = previewResource;
                    setPreviewResource(null);
                    handlePracticePastPaperInteractive(item);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 border border-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Start Timed CBT</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {previewResource.questions && previewResource.questions.length > 0 && (
                <div className="space-y-4">
                  {previewResource.questions.map((q) => (
                    <div
                      key={q.number}
                      className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs font-black text-indigo-600 dark:text-indigo-400">
                        <span>
                          Question {q.number} · {q.section}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                          [{q.marks} Marks]
                        </span>
                      </div>

                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                        {q.question}
                      </p>

                      {q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, idx) => {
                            const isCorrectOpt = showMarkingSchemeInPreview && opt === q.answer;
                            return (
                              <div
                                key={idx}
                                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                                  isCorrectOpt
                                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {showMarkingSchemeInPreview && (
                        <div className="p-3.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border-l-4 border-emerald-500 text-xs space-y-1">
                          <div className="font-black text-emerald-900 dark:text-emerald-300">
                            ✓ Official Answer: {q.answer}
                          </div>
                          <div className="text-emerald-800 dark:text-emerald-200 font-medium">
                            <strong>Examiner Marking Scheme:</strong> {q.markingSchemeNotes}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {previewResource.chapters && previewResource.chapters.length > 0 && (
                <div className="space-y-4">
                  {previewResource.chapters.map((ch) => (
                    <div
                      key={ch.chapterNumber}
                      className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Chapter {ch.chapterNumber}
                        </span>
                        {onOpenNotesGenerator && (
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewResource(null);
                              onOpenNotesGenerator(ch.practicePrompt, previewResource.examFormat);
                            }}
                            className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                          >
                            Generate Full Study Guide on Chapter →
                          </button>
                        )}
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {ch.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {ch.summary}
                      </p>

                      <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-500 space-y-1">
                        <div className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                          Key Formulas &amp; Syllabus Rules
                        </div>
                        <ul className="space-y-1 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                          {ch.keyFormulasOrRules.map((rule, i) => (
                            <li key={i}>• {rule}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border-l-4 border-emerald-500 text-xs space-y-1">
                        <div className="font-black text-emerald-900 dark:text-emerald-300">
                          Worked Example: {ch.workedExample.problem}
                        </div>
                        <div className="text-emerald-800 dark:text-emerald-200 font-medium">
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
      )}
    </div>
  );
};
