import {
  ExamFormatId,
  QuestionType,
  DifficultyType,
  QuizResponse,
  PersonaType,
} from '../types/quiz';

export type WorldRegionSlot =
  | 'All Regions'
  | 'West & East Africa'
  | 'United Kingdom & Europe'
  | 'North & South America'
  | 'Asia & Oceania'
  | 'Global / International';

export interface ExamFormatSpec {
  id: ExamFormatId;
  shortName: string;
  fullName: string;
  badgeEmoji: string;
  countryFlag?: string;
  regionTag: string;
  countryName?: string;
  worldRegion?: WorldRegionSlot;
  governingBody?: string;
  aiPromptDirective?: string;
  description: string;
  paperStructure: string;
  gradingScaleLabel: string;
  defaultQuestionTypes: QuestionType[];
  defaultTimeMinutes: number;
  defaultPassingScore: number;
  allowHintsInExam: boolean;
  calculatorAllowed: boolean;
  aiBlueprintDirective: string;
  sampleTopics: string[];
  sampleSubjects?: string[];
}

export const EXAM_FORMAT_CATALOG: ExamFormatSpec[] = [
  {
    id: 'checkpoint',
    shortName: 'Checkpoint (Primary & Lower Sec)',
    fullName: 'Cambridge Primary (Stages 4–6) & Lower Secondary (Stages 7–9) Checkpoint',
    badgeEmoji: '🇬🇧',
    regionTag: 'Cambridge Primary (0096/0097/0058) & Lower Secondary (0862/0893/0861)',
    countryName: 'United Kingdom / International',
    worldRegion: 'Global / International',
    governingBody: 'Cambridge Assessment International Education (CAIE)',
    description:
      'Classified into Primary Checkpoint (Stages 4–6 · Ages 8–11 · 0096/0097/0058) and Lower Secondary Checkpoint (Stages 7–9 · Ages 11–14 · 0862/0893/0861) with written structured booklets and M1/A1 Mark Schemes up to 2026.',
    paperStructure: 'Paper 1 (Non-Calculator / Reading & Enquiry) + Paper 2 (Calculator / Applied Structured)',
    gradingScaleLabel: '0.0 – 6.0 Statement of Achievement Band Scale (50 Raw Marks)',
    defaultQuestionTypes: ['multiple_choice', 'fill_in_blank', 'open_explanation'],
    defaultTimeMinutes: 15,
    defaultPassingScore: 70,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as a Cambridge Primary (Stages 4-6) or Lower Secondary (Stages 7-9) Checkpoint written examination paper. Use official Cambridge command words ("State", "Describe", "Explain why", "Calculate", "Predict what happens when", "Tick (✓) one box"). Include structured multi-part reasoning, Thinking and Working Mathematically/Scientifically scenarios, and M1/A1/B1 mark-scheme explanations.',
    sampleTopics: [
      'Cambridge Lower Secondary Checkpoint (Stages 7–9): Math (0862), Science (0893) & English (0861)',
      'Cambridge Primary Checkpoint (Stages 4–6): Math (0096), Science (0097) & English (0058)',
      'Cambridge Checkpoint Scientific Enquiry: Variables, Fair Testing, Forces & Chemical Changes',
      'Cambridge Checkpoint Mathematics: Thinking & Working Mathematically, Algebra, Geometry & Fractions',
    ],
  },
  {
    id: 'waec',
    shortName: 'WAEC (WASSCE)',
    fullName: 'West African Senior School Certificate Examination (WAEC)',
    badgeEmoji: '🇳🇬',
    regionTag: 'West Africa (Nigeria, Ghana, Sierra Leone, Gambia, Liberia)',
    countryName: 'Nigeria & West Africa',
    worldRegion: 'West & East Africa',
    governingBody: 'West African Examinations Council (WAEC)',
    description:
      'Official WASSCE format combining Paper 1 (4-Option Objective A–D) and Paper 2 (Structured Theory & Essay) graded on the A1–F9 scale.',
    paperStructure: 'Paper 1 (Objective A–D) + Paper 2 (Theory / Structured Essay)',
    gradingScaleLabel: 'WAEC A1 – F9 Credit Scale',
    defaultQuestionTypes: ['multiple_choice', 'open_explanation', 'fill_in_blank'],
    defaultTimeMinutes: 20,
    defaultPassingScore: 50,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as an official WAEC (WASSCE) examination paper. Combine Paper 1 Objective Multiple-Choice questions (4 options A–D with plausible syllabus distractors) and Paper 2 Theory/Structured questions using WAEC command phrasing ("Define", "State two differences between...", "Calculate showing full working", "Explain the mechanism of..."). Align explanations with official WAEC Chief Examiner marking schemes.',
    sampleTopics: [
      'WAEC WASSCE Biology: Cell Division, Genetics, Ecology & Mammalian Anatomy',
      'WAEC WASSCE Mathematics: Logarithms, Quadratic Equations, Trigonometry & Probability',
      'WAEC WASSCE Chemistry: Periodic Table, Stoichiometry, Organic Chemistry & Electrolysis',
      'WAEC WASSCE Physics: Projectile Motion, Ohm’s Law, Waves & Atomic Physics',
    ],
  },
  {
    id: 'jamb',
    shortName: 'JAMB (UTME)',
    fullName: 'JAMB Unified Tertiary Matriculation Examination (CBT)',
    badgeEmoji: '⚡',
    regionTag: 'Nigeria (JAMB CBT)',
    countryName: 'Nigeria',
    worldRegion: 'West & East Africa',
    governingBody: 'Joint Admissions and Matriculation Board (JAMB)',
    description:
      'High-speed Computer-Based Test (CBT) with 100% 4-Option Objective MCQs, time-pressured analytical traps, and 400-point UTME aggregate scoring.',
    paperStructure: '100% CBT Objective 4-Option Multiple Choice (A–D)',
    gradingScaleLabel: '0 – 400 UTME Aggregate Score',
    defaultQuestionTypes: ['multiple_choice'],
    defaultTimeMinutes: 10,
    defaultPassingScore: 60,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as a JAMB UTME Computer-Based Test (CBT). Every question MUST be a high-yield 4-option Multiple Choice question (Options A–D) designed for rapid analytical reasoning. Include classic JAMB syllabus traps, edge-case calculations, and Use-of-English / core subject precision.',
    sampleTopics: [
      'JAMB UTME Use of English: Lexis, Structure, Oral Forms & Comprehension',
      'JAMB UTME Physics & Mathematics High-Yield CBT Calculation Drill',
      'JAMB UTME Chemistry & Biology Rapid Objective Past-Question Synthesis',
    ],
  },
  {
    id: 'neco',
    shortName: 'NECO (SSCE)',
    fullName: 'National Examinations Council (NECO SSCE)',
    badgeEmoji: '🏛️',
    regionTag: 'Nigeria (NECO)',
    countryName: 'Nigeria',
    worldRegion: 'West & East Africa',
    governingBody: 'National Examinations Council (NECO)',
    description:
      'Senior Secondary Certificate Examination format combining Objective questions and Theory definitions aligned with the national curriculum.',
    paperStructure: 'Paper I (Objective) + Paper II (Essay & Theory)',
    gradingScaleLabel: 'NECO A1 – F9 Scale',
    defaultQuestionTypes: ['multiple_choice', 'fill_in_blank', 'open_explanation'],
    defaultTimeMinutes: 20,
    defaultPassingScore: 50,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as a NECO SSCE examination paper with syllabus-accurate Objective questions and structured Theory prompts requiring clear definitions, laws, and step-by-step derivations.',
    sampleTopics: [
      'NECO SSCE Government & Civic Education: Constitutional Development & Federalism',
      'NECO SSCE Agricultural Science & Biology Core Syllabus Review',
    ],
  },
  {
    id: 'nabteb',
    shortName: 'NABTEB (NBC/NTC)',
    fullName: 'National Business and Technical Examinations Board (NABTEB NBC / NTC)',
    badgeEmoji: '🛠️',
    regionTag: 'Nigeria (NABTEB Technical & Business)',
    countryName: 'Nigeria',
    worldRegion: 'West & East Africa',
    governingBody: 'National Business and Technical Examinations Board (NABTEB)',
    description:
      'National Business Certificate (NBC) and National Technical Certificate (NTC) examinations covering General Education, Engineering Trades, and Business Studies.',
    paperStructure: 'Paper I (Objective) + Paper II (Essay / Trade Theory & Practical)',
    gradingScaleLabel: 'NABTEB A1 – F9 Credit Scale',
    defaultQuestionTypes: ['multiple_choice', 'open_explanation', 'fill_in_blank'],
    defaultTimeMinutes: 20,
    defaultPassingScore: 50,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as an official NABTEB (NBC/NTC) examination paper combining General Education (Mathematics, Physics, Chemistry, English) and Technical/Business Trade Theory with M1/A1 marking schemes.',
    sampleTopics: [
      'NABTEB NBC/NTC General Mathematics, Physics & Technical Drawing',
      'NABTEB Office Practice, Financial Accounting & Electrical Installation Trade Theory',
    ],
  },
  {
    id: 'bece',
    shortName: 'BECE (JSS3 / JHS3)',
    fullName: 'Basic Education Certificate Examination (WAEC Ghana / NECO Nigeria BECE)',
    badgeEmoji: '📘',
    regionTag: 'West Africa (Nigeria & Ghana Junior Secondary BECE)',
    countryName: 'Nigeria & Ghana',
    worldRegion: 'West & East Africa',
    governingBody: 'WAEC (Ghana/Sierra Leone/Gambia) & NECO / State Ministries (Nigeria)',
    description:
      'Junior Secondary (JSS3 / JHS3) transition examination covering Mathematics, Integrated/Basic Science, English Studies, and Basic Technology.',
    paperStructure: 'Paper 1 (Objective Multiple Choice) + Paper 2 (Structured Theory & Essay)',
    gradingScaleLabel: 'BECE Distinction (A / Stanine 1) to Pass',
    defaultQuestionTypes: ['multiple_choice', 'fill_in_blank', 'open_explanation'],
    defaultTimeMinutes: 15,
    defaultPassingScore: 55,
    allowHintsInExam: false,
    calculatorAllowed: false,
    aiBlueprintDirective:
      'Format strictly as a Basic Education Certificate Examination (BECE) paper for JSS3/JHS3 candidates with clear foundational objectives and structured theory questions.',
    sampleTopics: [
      'BECE Mathematics & Basic Science: Fractions, Simple Equations, Energy & Living Organisms',
      'BECE English Studies & Basic Technology: Comprehension, Grammar & Technical Drawing',
    ],
  },
  {
    id: 'nbais',
    shortName: 'NBAIS (SAISSCE)',
    fullName: 'National Board for Arabic and Islamic Studies (NBAIS SAISSCE)',
    badgeEmoji: '🕌',
    regionTag: 'Nigeria (NBAIS Senior Secondary)',
    countryName: 'Nigeria',
    worldRegion: 'West & East Africa',
    governingBody: 'National Board for Arabic and Islamic Studies (NBAIS)',
    description:
      'Senior Arabic and Islamic Secondary School Certificate Examination (SAISSCE) integrating conventional STEM/Humanities subjects with Arabic & Islamic Studies.',
    paperStructure: 'Paper 1 (Objective) + Paper 2 (Structured Essay & Textual Analysis)',
    gradingScaleLabel: 'NBAIS A1 – F9 Scale',
    defaultQuestionTypes: ['multiple_choice', 'open_explanation', 'fill_in_blank'],
    defaultTimeMinutes: 20,
    defaultPassingScore: 50,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as an official NBAIS SAISSCE examination paper with clear objective items and structured analytical theory questions.',
    sampleTopics: [
      'NBAIS SAISSCE Islamic Studies, Arabic Language, General Mathematics & Civic Education',
    ],
  },
  {
    id: 'igcse',
    shortName: 'IGCSE / O-Level',
    fullName: 'Cambridge IGCSE & GCE O-Level (Extended)',
    badgeEmoji: '🌍',
    regionTag: 'International GCSE (160+ Countries)',
    countryName: 'International / UK',
    worldRegion: 'Global / International',
    governingBody: 'Cambridge International Education (CIE) & Edexcel',
    description:
      'Extended tier Paper 2 (MCQ), Paper 4 (Structured Theory), and Paper 6 (Alternative to Practical) graded from A* to G (9–1).',
    paperStructure: 'Paper 2 (MCQ) + Paper 4 (Extended Theory) + Paper 6 (Practical)',
    gradingScaleLabel: 'IGCSE A* – G (Grade 9 – 1)',
    defaultQuestionTypes: ['multiple_choice', 'open_explanation', 'fill_in_blank'],
    defaultTimeMinutes: 20,
    defaultPassingScore: 65,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as a Cambridge IGCSE Extended examination (Paper 2 MCQ + Paper 4 Structured Theory + Paper 6 Experimental Design). Emphasize command words ("State", "Suggest", "Deduce", "Calculate") and mark-point bulleted explanations.',
    sampleTopics: [
      'Cambridge IGCSE Physics & Chemistry Extended Paper 2 & Paper 4 Mock',
      'Cambridge IGCSE Computer Science: Algorithms, Binary Logic & Systems',
    ],
  },
  {
    id: 'edexcel_igcse',
    shortName: 'Pearson Edexcel IGCSE / IAL',
    fullName: 'Pearson Edexcel International GCSE (9–1) & International AS/A-Level (IAL)',
    badgeEmoji: '🇬🇧',
    regionTag: 'UK & International (Pearson Edexcel 4MA1 / WMA11)',
    countryName: 'United Kingdom / International',
    worldRegion: 'Global / International',
    governingBody: 'Pearson Edexcel Qualifications',
    description:
      'Pearson Edexcel International GCSE (9–1) Paper 1H/2H and Modular International A-Level (IAL Pure Maths P1–P4, Physics, Chemistry, Biology).',
    paperStructure: 'Paper 1H & 2H (Calculator Allowed) / IAL Modular Units 1–6',
    gradingScaleLabel: 'Edexcel Grade 9 – 1 (IGCSE) / A* – E (IAL)',
    defaultQuestionTypes: ['multiple_choice', 'open_explanation', 'fill_in_blank'],
    defaultTimeMinutes: 20,
    defaultPassingScore: 65,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as a Pearson Edexcel International GCSE (4MA1 / 4PH1 / 4CH1) or International A-Level (WMA11 / WPH11) paper with M1/A1/B1 Edexcel mark scheme notes.',
    sampleTopics: [
      'Pearson Edexcel International GCSE Mathematics A (4MA1) Higher Paper 1H & 2H',
      'Pearson Edexcel IAL Pure Mathematics P1/P2 & Physics Unit 1',
    ],
  },
  {
    id: 'gcse_uk',
    shortName: 'UK GCSE (9–1)',
    fullName: 'United Kingdom GCSE (AQA / Edexcel / OCR Grade 9–1)',
    badgeEmoji: '🇬🇧',
    regionTag: 'United Kingdom (AQA, Edexcel, OCR)',
    countryName: 'United Kingdom',
    worldRegion: 'United Kingdom & Europe',
    governingBody: 'AQA, Pearson Edexcel & OCR Examination Boards',
    description:
      'Official UK GCSE Higher & Foundation Tier papers (Paper 1 Non-Calculator, Paper 2 & 3 Calculator) graded on the Ofqual 9–1 numerical scale.',
    paperStructure: 'Paper 1 + Paper 2 + Paper 3 (Higher & Foundation Tier)',
    gradingScaleLabel: 'UK Ofqual Grade 9 – 1 Scale',
    defaultQuestionTypes: ['multiple_choice', 'fill_in_blank', 'open_explanation'],
    defaultTimeMinutes: 20,
    defaultPassingScore: 65,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as an official UK GCSE (AQA / Pearson Edexcel / OCR) Higher Tier paper. Include structured multi-mark reasoning questions, 6-mark extended evaluation prompts, and clear M1/A1/B1 mark scheme breakdown.',
    sampleTopics: [
      'AQA / Edexcel GCSE Mathematics (8300 / 1MA1) Higher Paper 1 & 2',
      'AQA GCSE Combined Trilogy & Separate Sciences (Biology 8461, Chemistry 8462, Physics 8463)',
      'AQA GCSE English Literature & Language Paper 1 & 2',
    ],
  },
  {
    id: 'alevel_uk',
    shortName: 'GCE A-Level',
    fullName: 'Cambridge International & UK GCE AS & A-Level (9709 / 9702 / 9701)',
    badgeEmoji: '🎓',
    regionTag: 'UK & Commonwealth (CAIE, Edexcel, AQA)',
    countryName: 'United Kingdom & Commonwealth',
    worldRegion: 'United Kingdom & Europe',
    governingBody: 'CAIE, Pearson Edexcel & AQA A-Level Boards',
    description:
      'Advanced Level university-entry examinations covering Pure Mathematics, Mechanics, Statistics, and Advanced Sciences graded A*–E.',
    paperStructure: 'AS Level (Papers 1, 2, 3) + A2 Level (Papers 4 & 5)',
    gradingScaleLabel: 'GCE A-Level A* – E Scale',
    defaultQuestionTypes: ['multiple_choice', 'open_explanation', 'fill_in_blank'],
    defaultTimeMinutes: 25,
    defaultPassingScore: 65,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as a Cambridge International / UK GCE A-Level examination paper (e.g., 9709 Mathematics, 9702 Physics, 9701 Chemistry, 9700 Biology). Require rigorous mathematical proofs, multi-step calculus/mechanics derivations, and exact mark-scheme points.',
    sampleTopics: [
      'CAIE A-Level Pure Mathematics 1 & 3 (9709): Integration by Parts, Vectors & Differential Equations',
      'CAIE A-Level Physics (9702) & Chemistry (9701): Quantum Physics, Circular Motion & Organic Synthesis',
    ],
  },
  {
    id: 'sat',
    shortName: 'Digital SAT / ACT',
    fullName: 'US College Board Digital SAT & ACT Assessment',
    badgeEmoji: '🇺🇸',
    regionTag: 'United States & Global (College Board / ACT)',
    countryName: 'United States',
    worldRegion: 'North & South America',
    governingBody: 'College Board & ACT Inc.',
    description:
      'Passage-based analytical Reading & Writing and quantitative Math problem solving with Student-Produced Responses (400–1600 scale).',
    paperStructure: 'Module 1 (Foundational) + Module 2 (Adaptive Upper Tier)',
    gradingScaleLabel: '400 – 1600 Scaled Score (ACT 1–36)',
    defaultQuestionTypes: ['multiple_choice', 'fill_in_blank'],
    defaultTimeMinutes: 15,
    defaultPassingScore: 70,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as the College Board Digital SAT. Include concise evidence-based reading/grammar vignettes and multi-step quantitative math problems (both 4-option MCQ and grid-in fill-in-the-blank).',
    sampleTopics: [
      'Digital SAT Math Module 2: Nonlinear Functions, Systems of Equations & Geometry',
      'Digital SAT Reading & Writing: Craft, Structure, Logical Transitions & Evidence',
    ],
  },
  {
    id: 'ap_ib',
    shortName: 'AP / IB Diploma',
    fullName: 'Advanced Placement (AP) & IB Diploma Higher/Standard Level',
    badgeEmoji: '🏆',
    regionTag: 'International Baccalaureate & US AP',
    countryName: 'USA / Switzerland (Global)',
    worldRegion: 'Global / International',
    governingBody: 'International Baccalaureate Organization (IBO) & College Board',
    description:
      'Stimulus-based Section I Multiple Choice and Section II Free-Response Questions (FRQ) scored on the 1–5 AP / 1–7 IB scale.',
    paperStructure: 'Paper 1 (Stimulus MCQ) + Paper 2 (Free-Response FRQ) + Paper 3 (Data)',
    gradingScaleLabel: 'AP 1–5 / IB 1–7 Scale',
    defaultQuestionTypes: ['multiple_choice', 'open_explanation', 'code_media_challenge'],
    defaultTimeMinutes: 25,
    defaultPassingScore: 70,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as an AP / IB Higher Level exam with stimulus-based analytical MCQs and Free-Response Questions (FRQs) accompanied by explicit scoring rubrics.',
    sampleTopics: [
      'AP Computer Science & Calculus: Algorithmic Complexity & Derivative Applications',
      'IB Biology & Chemistry HL: Molecular Genetics & Chemical Kinetics',
    ],
  },
  {
    id: 'kcse_kenya',
    shortName: 'KCSE (Kenya)',
    fullName: 'Kenya Certificate of Secondary Education (KNEC KCSE)',
    badgeEmoji: '🇰🇪',
    regionTag: 'East Africa (Kenya KNEC)',
    countryName: 'Kenya & East Africa',
    worldRegion: 'West & East Africa',
    governingBody: 'Kenya National Examinations Council (KNEC)',
    description:
      'Official KNEC KCSE Paper 1, Paper 2, and Paper 3 examinations across Mathematics (121), English (101), Kiswahili, Biology (231), Physics (232), and Chemistry (233) graded on the A to E 12-point scale.',
    paperStructure: 'Paper 1 (Short Answer/Core) + Paper 2 (Extended/Structured) + Paper 3 (Practical)',
    gradingScaleLabel: 'KNEC Grade A – E (12-Point Scale)',
    defaultQuestionTypes: ['multiple_choice', 'open_explanation', 'fill_in_blank'],
    defaultTimeMinutes: 20,
    defaultPassingScore: 60,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as a Kenya National Examinations Council (KNEC) KCSE paper. Use official KNEC syllabus codes (121 Math, 231 Biology, 232 Physics, 233 Chemistry) and Section I (50 marks) + Section II (50 marks) structured breakdown.',
    sampleTopics: [
      'KCSE Mathematics (121/1 & 121/2): Matrices, Commercial Arithmetic, Vectors & Three-Dimensional Geometry',
      'KCSE Chemistry (233) & Biology (231): Mole Concept, Organic Chemistry & Genetics',
    ],
  },
  {
    id: 'uneb_uganda',
    shortName: 'UNEB (UCE & UACE)',
    fullName: 'Uganda National Examinations Board — UCE (O-Level) & UACE (A-Level)',
    badgeEmoji: '🇺🇬',
    regionTag: 'East Africa (Uganda UNEB UCE & UACE)',
    countryName: 'Uganda & East Africa',
    worldRegion: 'West & East Africa',
    governingBody: 'Uganda National Examinations Board (UNEB)',
    description:
      'Official Uganda Certificate of Education (UCE) and Uganda Advanced Certificate of Education (UACE Principal Passes A–E) across Mathematics, Sciences, and Humanities.',
    paperStructure: 'Paper 1 (Core / Pure) + Paper 2 (Applied / Structured) + Paper 3 (Practical)',
    gradingScaleLabel: 'UACE Principal A–E / UCE Competency Scale',
    defaultQuestionTypes: ['multiple_choice', 'open_explanation', 'fill_in_blank'],
    defaultTimeMinutes: 20,
    defaultPassingScore: 60,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as a Uganda National Examinations Board (UNEB) UCE or UACE Principal subject paper with structured derivations and UNEB examiner marking points.',
    sampleTopics: [
      'UNEB UACE Principal Mathematics (P425/1 & P425/2) & UCE Mathematics (456)',
      'UNEB UACE & UCE Biology (553 / P530), Physics (535) & Chemistry (545)',
    ],
  },
  {
    id: 'zimsec',
    shortName: 'ZIMSEC (O & A-Level)',
    fullName: 'Zimbabwe School Examinations Council (ZIMSEC O-Level & A-Level)',
    badgeEmoji: '🇿🇼',
    regionTag: 'Southern Africa (Zimbabwe ZIMSEC)',
    countryName: 'Zimbabwe',
    worldRegion: 'West & East Africa',
    governingBody: 'Zimbabwe School Examinations Council (ZIMSEC)',
    description:
      'Official ZIMSEC Ordinary Level (4004 Mathematics, Combined Science) and Advanced Level (6042 Pure Maths, Physics, Chemistry) June & November sessions.',
    paperStructure: 'Paper 1 (Non-Calculator / MCQ) + Paper 2 (Structured & Long Questions)',
    gradingScaleLabel: 'ZIMSEC Grade A – U Scale',
    defaultQuestionTypes: ['multiple_choice', 'open_explanation', 'fill_in_blank'],
    defaultTimeMinutes: 20,
    defaultPassingScore: 60,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as a Zimbabwe School Examinations Council (ZIMSEC) O-Level or A-Level paper with ZIMSEC syllabus codes (4004, 4003, 6042) and step-by-step marking schemes.',
    sampleTopics: [
      'ZIMSEC O-Level Mathematics (4004/1 & 4004/2) & Combined Science (4003)',
      'ZIMSEC A-Level Pure Mathematics (6042) & Chemistry',
    ],
  },
  {
    id: 'ged',
    shortName: 'GED (US Diploma)',
    fullName: 'General Educational Development (GED High School Equivalency Test)',
    badgeEmoji: '🎓',
    regionTag: 'United States & International (GED Testing Service)',
    countryName: 'United States',
    worldRegion: 'North & South America',
    governingBody: 'GED Testing Service (ACE / Pearson VUE)',
    description:
      'Official 4-subject US High School Equivalency credential covering Mathematical Reasoning, Reasoning Through Language Arts (RLA), Science, and Social Studies (100–200 scale).',
    paperStructure: 'Part 1 (No Calculator) + Part 2 (TI-30XS Calculator & Data Analysis)',
    gradingScaleLabel: '100 – 200 Scale (145 Pass · 165+ College Ready)',
    defaultQuestionTypes: ['multiple_choice', 'fill_in_blank', 'open_explanation'],
    defaultTimeMinutes: 15,
    defaultPassingScore: 65,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as an official GED Testing Service assessment across Mathematical Reasoning, Science data analysis, Social Studies primary sources, and Reasoning Through Language Arts.',
    sampleTopics: [
      'GED Mathematical Reasoning & Science: Algebraic Functions, Geometry & Experimental Data',
      'GED Reasoning Through Language Arts (RLA) & Social Studies Civics',
    ],
  },
  {
    id: 'nsc_matric_sa',
    shortName: 'NSC Matric (SA)',
    fullName: 'South Africa National Senior Certificate (DBE / IEB Matric)',
    badgeEmoji: '🇿🇦',
    regionTag: 'South Africa (DBE / IEB Matric)',
    countryName: 'South Africa',
    worldRegion: 'West & East Africa',
    governingBody: 'Department of Basic Education (DBE) & Umalusi / IEB',
    description:
      'Grade 12 NSC Matric Paper 1 & Paper 2 examinations for Mathematics, Physical Sciences, Life Sciences, and Accounting graded on Achievement Levels 1–7.',
    paperStructure: 'Paper 1 (Algebra/Calculus or Physics) + Paper 2 (Analytical Geometry/Trig or Chemistry)',
    gradingScaleLabel: 'NSC Level 7 (80%–100% Distinction) to Level 1',
    defaultQuestionTypes: ['multiple_choice', 'open_explanation', 'fill_in_blank'],
    defaultTimeMinutes: 20,
    defaultPassingScore: 60,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as a South African DBE / IEB Grade 12 National Senior Certificate (Matric) examination paper with CAPS-aligned formulas, Euclidean geometry riders, and Physical Sciences Paper 1/2 guidelines.',
    sampleTopics: [
      'NSC Matric Mathematics Paper 1 & 2: Cubic Functions, Financial Maths & Euclidean Circle Geometry',
      'NSC Matric Physical Sciences: Vertical Projectile Motion, Work-Energy Theorem & Chemical Equilibrium',
    ],
  },
  {
    id: 'jee_neet_india',
    shortName: 'JEE / NEET / CBSE',
    fullName: 'India JEE Main/Advanced, NEET-UG & CBSE Class 12 Board',
    badgeEmoji: '🇮🇳',
    regionTag: 'India (NTA JEE / NEET & CBSE)',
    countryName: 'India',
    worldRegion: 'Asia & Oceania',
    governingBody: 'National Testing Agency (NTA) & CBSE New Delhi',
    description:
      'High-rigor NTA JEE (Physics, Chemistry, Mathematics) and NEET-UG (Physics, Chemistry, Biology) +4/-1 entrance papers and CBSE Class 12 Board exams.',
    paperStructure: 'Section A (Single Correct MCQ +4/-1) + Section B (Numerical Value Questions)',
    gradingScaleLabel: 'NTA Percentile & AIR Rank / CBSE 100-Mark Scale',
    defaultQuestionTypes: ['multiple_choice', 'fill_in_blank'],
    defaultTimeMinutes: 20,
    defaultPassingScore: 65,
    allowHintsInExam: false,
    calculatorAllowed: false,
    aiBlueprintDirective:
      'Format strictly as an NTA JEE Main/Advanced or NEET-UG / CBSE Class 12 examination paper. Include multi-concept analytical physics/chemistry/math problems and NCERT-aligned biological mechanisms.',
    sampleTopics: [
      'JEE Main & Advanced Physics & Calculus: Rotational Mechanics, Electrostatics & Definite Integrals',
      'NEET-UG & CBSE Class 12 Biology & Chemistry: Coordination Compounds, Electrochemistry & Human Physiology',
    ],
  },
  {
    id: 'gaokao_china',
    shortName: 'Gaokao (China)',
    fullName: 'China National College Entrance Examination (Gaokao 全国高考)',
    badgeEmoji: '🇨🇳',
    regionTag: 'China (National Unified Gaokao Paper I & II)',
    countryName: 'China',
    worldRegion: 'Asia & Oceania',
    governingBody: 'Ministry of Education of the People’s Republic of China (NEEA)',
    description:
      'National Unified Gaokao 750-point examination covering Chinese, Mathematics (Conic Sections, Derivatives, Sequences), English, and Comprehensive Sciences (L综: Physics, Chemistry, Biology).',
    paperStructure: 'Single/Multiple Choice + Fill-in-the-Blank + 5 Multi-Part Proof/Derivation Problems',
    gradingScaleLabel: '0 – 750 Gaokao Aggregate Scale (150 per Core Subject)',
    defaultQuestionTypes: ['multiple_choice', 'fill_in_blank', 'open_explanation'],
    defaultTimeMinutes: 25,
    defaultPassingScore: 70,
    allowHintsInExam: false,
    calculatorAllowed: false,
    aiBlueprintDirective:
      'Format strictly as the Chinese National College Entrance Examination (Gaokao, translated into clear academic English). Emphasize high-rigor algebraic manipulation, conic section geometry, derivative inequalities, and electromagnetic motion.',
    sampleTopics: [
      'Gaokao Mathematics National Paper I: Conic Sections (Ellipses/Parabolas), Sequences & Derivative Proofs',
      'Gaokao Comprehensive Science (Physics & Chemistry): Charged Particles in Magnetic Fields & Redox Equilibrium',
    ],
  },
  {
    id: 'atar_australia',
    shortName: 'ATAR (HSC / VCE)',
    fullName: 'Australia ATAR Senior Secondary (NSW HSC & Victoria VCE)',
    badgeEmoji: '🇦🇺',
    regionTag: 'Australia (NSW NESA HSC / Victoria VCAA VCE)',
    countryName: 'Australia',
    worldRegion: 'Asia & Oceania',
    governingBody: 'NESA (NSW HSC) & VCAA (Victoria VCE)',
    description:
      'Australian Year 12 HSC and VCE external examinations across Mathematical Methods, Specialist Maths, Chemistry, Physics, and English towards the 99.95 ATAR rank.',
    paperStructure: 'Section I (Objective MCQ) + Section II (Extended Response & Technology-Active/Free)',
    gradingScaleLabel: 'Band 6 / Study Score 50 (ATAR 0.00 – 99.95)',
    defaultQuestionTypes: ['multiple_choice', 'open_explanation', 'fill_in_blank'],
    defaultTimeMinutes: 20,
    defaultPassingScore: 65,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as an Australian NSW HSC or Victoria VCE Year 12 examination paper. Include Band 6 extended mathematical modeling and scientific analysis prompts.',
    sampleTopics: [
      'NSW HSC & VCE Mathematical Methods / Extension 1: Calculus, Continuous Random Variables & Trigonometry',
      'HSC & VCE Chemistry & Physics: Equilibrium Constants, Spectroscopy & Electromagnetism',
    ],
  },
  {
    id: 'abitur_germany',
    shortName: 'Abitur (Germany)',
    fullName: 'German Abitur & European Baccalaureate (Mathematik, Physik & Chemie LK)',
    badgeEmoji: '🇩🇪',
    regionTag: 'Germany & DACH (Leistungskurs Abitur)',
    countryName: 'Germany & Austria/Switzerland',
    worldRegion: 'United Kingdom & Europe',
    governingBody: 'Kultusministerkonferenz (KMK) Germany',
    description:
      'German Gymnasium Leistungskurs (Advanced Course) Abitur examinations covering Analysis, Linear Algebra/Analytic Geometry, Stochastics, and Natural Sciences (0–15 Notenpunkte, Grade 1.0–4.0).',
    paperStructure: 'Teil A (Hilfsmittelfrei / No Calculator) + Teil B (CAS / Scientific Context)',
    gradingScaleLabel: '15 – 0 Notenpunkte (Abiturnote 1.0 – 4.0)',
    defaultQuestionTypes: ['multiple_choice', 'open_explanation', 'fill_in_blank'],
    defaultTimeMinutes: 20,
    defaultPassingScore: 60,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as a German Abitur Leistungskurs examination (in English with German technical terminology references where helpful). Cover Analysis (Kurvendiskussion), Analytic Geometry (Planes/Vectors in R³), and Stochastics.',
    sampleTopics: [
      'Abitur Mathematik Leistungskurs: Kurvendiskussion (e-Functions), 3D Vector Planes & Binomial Stochastics',
      'Abitur Physik & Chemie LK: Induction, Quantum Photoelectric Effect & Acid-Base Titration Curves',
    ],
  },
  {
    id: 'bac_france',
    shortName: 'Baccalauréat (FR)',
    fullName: 'French Baccalauréat Général (Spécialité Mathématiques & Physique-Chimie)',
    badgeEmoji: '🇫🇷',
    regionTag: 'France & Francophonie (Bac Général)',
    countryName: 'France',
    worldRegion: 'United Kingdom & Europe',
    governingBody: 'Ministère de l’Éducation Nationale (France)',
    description:
      'Official French Terminale Spécialité Mathématiques, Physique-Chimie, and SVT Baccalauréat papers graded on the 0–20 scale (Mention Très Bien ≥ 16/20).',
    paperStructure: '4 Compulsory Structured Exercises (Probabilités, Suites/Fonctions, Géométrie dans l’espace)',
    gradingScaleLabel: '0 – 20 Scale (Mention Très Bien ≥ 16/20)',
    defaultQuestionTypes: ['multiple_choice', 'open_explanation', 'fill_in_blank'],
    defaultTimeMinutes: 20,
    defaultPassingScore: 60,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as a French Baccalauréat Général Terminale Spécialité examination (presented in English). Emphasize recurrence sequences (raisonnement par récurrence), 3D orthogonal geometry, differential equations, and acid-base/mechanics synthesis.',
    sampleTopics: [
      'Baccalauréat Spécialité Mathématiques: Suites par Récurrence, Logarithme Népérien & Géométrie 3D',
      'Baccalauréat Physique-Chimie: Cinétique Chimique, Mouvement dans un Champ Uniforme & Ondes',
    ],
  },
  {
    id: 'enem_brazil',
    shortName: 'ENEM (Brazil)',
    fullName: 'Brazil Exame Nacional do Ensino Médio (ENEM & FUVEST)',
    badgeEmoji: '🇧🇷',
    regionTag: 'Brazil & Latin America (INEP ENEM)',
    countryName: 'Brazil',
    worldRegion: 'North & South America',
    governingBody: 'INEP — Ministério da Educação (MEC Brazil)',
    description:
      'Brazilian national university entrance examination testing contextualized problem-solving in Mathematics, Natural Sciences (Ciências da Natureza), and Humanities scored via Item Response Theory (TRI 0–1000).',
    paperStructure: 'Day 1 (Languages, Humanities & Essay) + Day 2 (45 Nature Sciences + 45 Mathematics)',
    gradingScaleLabel: 'TRI 0 – 1000 Scaled Score',
    defaultQuestionTypes: ['multiple_choice'],
    defaultTimeMinutes: 15,
    defaultPassingScore: 65,
    allowHintsInExam: false,
    calculatorAllowed: false,
    aiBlueprintDirective:
      'Format strictly as the Brazilian ENEM (Exame Nacional do Ensino Médio) in English. Each question must open with a real-world scientific, economic, or environmental context paragraph followed by a 5-option or 4-option analytical problem.',
    sampleTopics: [
      'ENEM Matemática e suas Tecnologias: Combinatorics, Spatial Geometry, Ratio/Scale & Statistics',
      'ENEM Ciências da Natureza: Ecology, Electrochemistry, Calorimetry & Electrical Power',
    ],
  },
  {
    id: 'ielts_toefl',
    shortName: 'IELTS / TOEFL / GRE',
    fullName: 'Global English Proficiency & Graduate Admissions (IELTS, TOEFL iBT & GRE)',
    badgeEmoji: '🌐',
    regionTag: 'Global University Admissions (British Council / ETS)',
    countryName: 'Global / International',
    worldRegion: 'Global / International',
    governingBody: 'British Council, IDP, Cambridge & ETS',
    description:
      'International academic English reading comprehension, lexical precision, academic writing cohesion, and GRE quantitative/verbal reasoning (IELTS Band 0–9 / TOEFL 0–120).',
    paperStructure: 'Academic Reading Passages + Lexical/Grammatical Precision + Quantitative Reasoning',
    gradingScaleLabel: 'IELTS Band 0.0 – 9.0 / TOEFL 0 – 120 / GRE 260 – 340',
    defaultQuestionTypes: ['multiple_choice', 'fill_in_blank', 'open_explanation'],
    defaultTimeMinutes: 15,
    defaultPassingScore: 70,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format strictly as an Academic IELTS / TOEFL iBT / GRE Verbal & Quantitative assessment. Include True/False/Not Given analytical inference, academic vocabulary in context, and quantitative comparison questions.',
    sampleTopics: [
      'IELTS Academic Reading & Writing Task 2: Inference, Paraphrasing & Lexical Cohesion',
      'TOEFL iBT & GRE Verbal/Quantitative: Academic Passage Synthesis & Data Interpretation',
    ],
  },
  {
    id: 'standard_exam',
    shortName: 'Standard Exam',
    fullName: 'General Proctored Academic Exam',
    badgeEmoji: '📝',
    regionTag: 'Universal',
    countryName: 'Universal',
    worldRegion: 'Global / International',
    governingBody: 'Universal Academic Standards Board',
    description:
      'Balanced timed assessment across cognitive domains with percentage and letter grade reporting.',
    paperStructure: 'Mixed Objective & Short Response',
    gradingScaleLabel: 'A+ to F Letter Grade (0–100%)',
    defaultQuestionTypes: ['multiple_choice', 'fill_in_blank', 'open_explanation'],
    defaultTimeMinutes: 15,
    defaultPassingScore: 70,
    allowHintsInExam: false,
    calculatorAllowed: true,
    aiBlueprintDirective:
      'Format as a rigorous academic examination testing recall, application, and analytical reasoning.',
    sampleTopics: ['Comprehensive Multi-Topic Academic Benchmark Exam'],
  },
];

export function getExamFormatSpec(formatId?: ExamFormatId): ExamFormatSpec {
  const found =
    EXAM_FORMAT_CATALOG.find((f) => f.id === formatId) || EXAM_FORMAT_CATALOG[0];
  return {
    ...found,
    countryFlag: found.countryFlag || found.badgeEmoji,
    governingBody: found.governingBody || found.regionTag,
    aiPromptDirective: found.aiPromptDirective || found.aiBlueprintDirective,
    sampleSubjects: found.sampleSubjects || found.sampleTopics,
  };
}

export function getAllExamFormatSpecs(): ExamFormatSpec[] {
  return EXAM_FORMAT_CATALOG.map((found) => ({
    ...found,
    countryFlag: found.countryFlag || found.badgeEmoji,
    governingBody: found.governingBody || found.regionTag,
    aiPromptDirective: found.aiPromptDirective || found.aiBlueprintDirective,
    sampleSubjects: found.sampleSubjects || found.sampleTopics,
  }));
}

/**
 * Computes an authentic board-specific grade/score badge from a percentage (0-100).
 */
export function evaluateExamBoardGrade(
  formatId: ExamFormatId | undefined,
  accuracyPercent: number
): {
  boardName: string;
  gradeBadge: string;
  scaledScoreText: string;
  verdict: string;
} {
  const pct = Math.max(0, Math.min(100, Math.round(accuracyPercent)));
  const spec = getExamFormatSpec(formatId);

  if (formatId === 'waec' || formatId === 'neco' || formatId === 'nabteb' || formatId === 'nbais') {
    let grade = 'F9 (Fail)';
    let verdict = 'Needs Remediation — Below Credit Pass';
    if (pct >= 75) {
      grade = 'A1 (Excellent)';
      verdict = 'Distinction — Top Honours!';
    } else if (pct >= 70) {
      grade = 'B2 (Very Good)';
      verdict = 'Strong Distinction Standing!';
    } else if (pct >= 65) {
      grade = 'B3 (Good)';
      verdict = 'Upper Credit Standing!';
    } else if (pct >= 60) {
      grade = 'C4 (Credit)';
      verdict = 'Solid Credit Pass (University Entry Eligible)';
    } else if (pct >= 55) {
      grade = 'C5 (Credit)';
      verdict = 'Credit Pass (University Entry Eligible)';
    } else if (pct >= 50) {
      grade = 'C6 (Credit)';
      verdict = 'Minimum Credit Pass Achieved';
    } else if (pct >= 45) {
      grade = 'D7 (Pass)';
      verdict = 'Ordinary Pass — Aim for 50%+ for C6 Credit';
    } else if (pct >= 40) {
      grade = 'E8 (Pass)';
      verdict = 'Marginal Pass — Review Paper 1 & 2 Explanations';
    }
    return {
      boardName: spec.shortName,
      gradeBadge: grade,
      scaledScoreText: `${pct}% Raw Score`,
      verdict,
    };
  }

  if (formatId === 'jamb') {
    const utmeScore = Math.round((pct / 100) * 400);
    let verdict = 'Below Cut-Off — Keep Drilling CBT Speed & Accuracy';
    if (utmeScore >= 300) {
      verdict = 'First-Tier Competitive Merit Cut-Off (Medicine / Engineering / Law Tier)!';
    } else if (utmeScore >= 250) {
      verdict = 'Strong Federal University Merit Cut-Off Achieved!';
    } else if (utmeScore >= 200) {
      verdict = 'General University Admission Cut-Off Passed!';
    } else if (utmeScore >= 160) {
      verdict = 'Minimum Institutional Cut-Off Reached';
    }
    return {
      boardName: 'JAMB UTME CBT',
      gradeBadge: `${utmeScore} / 400`,
      scaledScoreText: `${utmeScore} UTME Aggregate (${pct}%)`,
      verdict,
    };
  }

  if (formatId === 'checkpoint') {
    const band = Math.min(6.0, Math.max(0.0, Number(((pct / 100) * 6.0).toFixed(1))));
    const raw50 = Math.round((pct / 100) * 50);
    let verdict = 'Developing — Review Core Enquiry Strands';
    if (band >= 5.0) {
      verdict = 'Outstanding Achievement (Band 5.0 – 6.0)!';
    } else if (band >= 4.0) {
      verdict = 'High Achievement (Band 4.0 – 4.9)!';
    } else if (band >= 3.0) {
      verdict = 'Solid Checkpoint Mastery (Band 3.0 – 3.9)';
    }
    return {
      boardName: 'Cambridge Checkpoint',
      gradeBadge: `Band ${band.toFixed(1)} / 6.0`,
      scaledScoreText: `${raw50} / 50 Marks (${pct}%)`,
      verdict,
    };
  }

  if (formatId === 'igcse') {
    let grade = 'U';
    if (pct >= 90) grade = 'A* (Grade 9)';
    else if (pct >= 80) grade = 'A (Grade 8/7)';
    else if (pct >= 70) grade = 'B (Grade 6)';
    else if (pct >= 60) grade = 'C (Grade 5/4)';
    else if (pct >= 50) grade = 'D (Grade 3)';
    else if (pct >= 40) grade = 'E (Grade 2)';
    else if (pct >= 30) grade = 'F/G (Grade 1)';
    return {
      boardName: 'Cambridge IGCSE',
      gradeBadge: grade,
      scaledScoreText: `${pct}% Extended Scale`,
      verdict: pct >= 60 ? 'IGCSE Credit / Distinction Achieved!' : 'Keep practicing Extended Paper 4 questions',
    };
  }

  if (formatId === 'sat') {
    const satScore = Math.round(400 + (pct / 100) * 1200);
    return {
      boardName: 'Digital SAT',
      gradeBadge: `${satScore} / 1600`,
      scaledScoreText: `${satScore} Scaled (${pct}%)`,
      verdict: satScore >= 1350 ? 'Top Percentile College Readiness!' : 'Solid Modular Progress',
    };
  }

  if (formatId === 'ap_ib') {
    const apScore = pct >= 85 ? 5 : pct >= 72 ? 4 : pct >= 58 ? 3 : pct >= 45 ? 2 : 1;
    const ibScore = Math.max(1, Math.min(7, Math.round((pct / 100) * 7)));
    return {
      boardName: 'AP / IB Exam',
      gradeBadge: `AP ${apScore}/5 • IB ${ibScore}/7`,
      scaledScoreText: `${pct}% Composite`,
      verdict: apScore >= 3 ? 'Qualified for College Credit!' : 'Review Free-Response Rubrics',
    };
  }

  const letter =
    pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F';
  return {
    boardName: 'Standard Exam',
    gradeBadge: `Grade ${letter} (${pct}%)`,
    scaledScoreText: `${pct}% Score`,
    verdict: pct >= 70 ? 'Exam Passed!' : 'Keep Practicing Weak Topics',
  };
}

/**
 * Builds an instant, authentic mock exam for the chosen Exam Format (Checkpoint, WAEC, JAMB, NECO, IGCSE, SAT, AP/IB)
 * so learners can immediately test and experience the exact format!
 */
export function buildPrebuiltExamByFormat(
  formatId: ExamFormatId,
  persona: PersonaType = 'Student'
): QuizResponse {
  const spec = getExamFormatSpec(formatId);

  if (formatId === 'checkpoint') {
    return {
      app_name: 'Quiz Me!',
      persona,
      examFormat: 'checkpoint',
      quiz_title: '🇬🇧 Cambridge Checkpoint Mock: Science & Mathematics Diagnostic',
      summary:
        'Official Cambridge Checkpoint format featuring Paper 1 (Core Enquiry & Structured Fill-in) and Paper 2 (Applied Reasoning & Command-Word Explanations) scored on the 0.0–6.0 scale.',
      difficulty: 'Intermediate',
      tags: ['#ExamMode', '#CambridgeCheckpoint', '#Paper1_Paper2'],
      questions: [
        {
          id: 9101,
          type: 'multiple_choice',
          topic: 'Cellular Biology & Genetics',
          domain: 'Foundations',
          difficulty: 'Beginner',
          bloom_level: 'Understand',
          points: 10,
          question:
            '[CHECKPOINT PAPER 1 • Q1 — State & Identify] A student observes a plant leaf palisade cell under a light microscope. Which two structures are present in this plant cell but absent in a human cheek cell?',
          options: [
            'Chloroplasts and a rigid cellulose cell wall',
            'Nucleus and cell membrane',
            'Mitochondria and cytoplasm',
            'Ribosomes and nuclear envelope',
          ],
          correct_answer: 'Chloroplasts and a rigid cellulose cell wall',
          explanation:
            '[Checkpoint Mark Scheme — 1 mark] Plant palisade cells contain chloroplasts for photosynthesis and a cellulose cell wall for structural support; animal cells lack both.',
          gamified_feedback: {
            success_quote: '🇬🇧 Checkpoint Paper 1 Mark Awarded!',
            hint: 'Think about photosynthesis and what gives plant cells a fixed rectangular shape.',
          },
        },
        {
          id: 9102,
          type: 'fill_in_blank',
          topic: 'Physics & Mechanics',
          domain: 'Applied Logic',
          difficulty: 'Intermediate',
          bloom_level: 'Apply',
          points: 10,
          question:
            '[CHECKPOINT PAPER 1 • Q2 — Scientific Enquiry] Complete the energy conservation statement for a pendulum swinging from its highest point to the lowest point:',
          blank_context: {
            prefix: 'As the pendulum bob swings downward, gravitational potential energy is transferred into',
            suffix: 'energy as its speed reaches a maximum at the bottom of the arc.',
            word_bank: ['kinetic', 'chemical', 'nuclear', 'elastic'],
          },
          correct_answer: 'kinetic',
          explanation:
            '[Checkpoint Mark Scheme — 1 mark] By conservation of energy, lost gravitational potential energy (mgh) converts into kinetic energy (½mv²) as speed increases.',
          gamified_feedback: {
            success_quote: '🇬🇧 Scientific Enquiry Strand Verified!',
            hint: 'What form of energy is associated with motion and speed?',
          },
        },
        {
          id: 9103,
          type: 'multiple_choice',
          topic: 'Mathematics & Probability',
          domain: 'Analytical Reasoning',
          difficulty: 'Intermediate',
          bloom_level: 'Apply',
          points: 10,
          question:
            '[CHECKPOINT PAPER 2 • Q3 — Calculate] In a Cambridge Checkpoint experiment, the ratio of copper to zinc in a brass alloy is 7 : 3. If the total mass of the alloy sample is 250 g, calculate the mass of copper.',
          options: ['175 g', '75 g', '150 g', '210 g'],
          correct_answer: '175 g',
          explanation:
            '[Checkpoint Mark Scheme — 2 marks] Total parts = 7 + 3 = 10 parts. Value of 1 part = 250 g ÷ 10 = 25 g. Mass of copper = 7 × 25 g = 175 g.',
          gamified_feedback: {
            success_quote: '🇬🇧 Full Working Marks Earned!',
            hint: 'Add the ratio parts (7 + 3 = 10) first, then find the mass of 7 parts.',
          },
        },
        {
          id: 9104,
          type: 'multiple_choice',
          topic: 'Physics & Mechanics',
          domain: 'Analytical Reasoning',
          difficulty: 'Master',
          bloom_level: 'Analyze',
          points: 10,
          question:
            '[CHECKPOINT PAPER 2 • Q4 — Predict & Explain] A student investigates how the current in a circuit changes when a second identical lamp is connected in series. What happens to the ammeter reading and why?',
          options: [
            'The current decreases because adding a second lamp in series doubles the total circuit resistance',
            'The current doubles because there are two lamps producing light',
            'The current stays unchanged because voltage is zero',
            'The current increases only in the first lamp and drops in the second',
          ],
          correct_answer:
            'The current decreases because adding a second lamp in series doubles the total circuit resistance',
          explanation:
            '[Checkpoint Mark Scheme — 2 marks] In a series circuit, R_total = R₁ + R₂. Since V is constant and I = V / R_total, increasing resistance reduces the current everywhere in the loop.',
          gamified_feedback: {
            success_quote: '🇬🇧 Band 6.0 Analytical Reasoning!',
            hint: 'Use Ohm’s Law (I = V / R) when total resistance in series increases.',
          },
        },
        {
          id: 9105,
          type: 'open_explanation',
          topic: 'Cellular Biology & Genetics',
          domain: 'Applied Logic',
          difficulty: 'Master',
          bloom_level: 'Analyze',
          points: 10,
          question:
            '[CHECKPOINT PAPER 2 • Q5 — Structured Explanation] Explain why increasing the temperature of an enzyme-controlled reaction from 20°C to 37°C increases the reaction rate, but heating it to 70°C causes the reaction to stop.',
          correct_answer:
            'From 20°C to 37°C kinetic energy increases so enzyme-substrate collisions are more frequent; at 70°C the enzyme denatures and its active site loses its complementary shape.',
          explanation:
            '[Checkpoint Mark Scheme — 3 marks] (1) Higher temperature (20°C→37°C) increases kinetic energy and collision frequency. (2) At 70°C thermal agitation breaks bonds holding the tertiary structure. (3) The active site denatures so the substrate can no longer fit.',
          rubric: [
            'Mentions increased kinetic energy / collision frequency between 20°C and 37°C',
            'States that the enzyme denatures at high temperature (70°C)',
            'Explains that the active site changes shape and no longer fits the substrate',
          ],
          gamified_feedback: {
            success_quote: '🇬🇧 Cambridge Checkpoint Mock Complete!',
            hint: 'Compare kinetic collision rate at 37°C with active-site denaturation at 70°C.',
          },
        },
      ],
    };
  }

  if (formatId === 'waec') {
    return {
      app_name: 'Quiz Me!',
      persona,
      examFormat: 'waec',
      quiz_title: '🇳🇬 WAEC (WASSCE) Official Mock: Paper 1 (Objective) & Paper 2 (Theory)',
      summary:
        'Authentic West African Senior School Certificate Examination (WASSCE) combining Paper 1 4-Option Objectives and Paper 2 Structured Theory graded on the A1–F9 scale.',
      difficulty: 'Intermediate',
      tags: ['#ExamMode', '#WAEC', '#WASSCE'],
      questions: [
        {
          id: 9201,
          type: 'multiple_choice',
          topic: 'Physics & Mechanics',
          domain: 'Applied Logic',
          difficulty: 'Intermediate',
          bloom_level: 'Apply',
          points: 20,
          question:
            '[WAEC PAPER 1 OBJECTIVE • Q1] A body of mass 4 kg is acted upon by a constant net force of 20 N for 3 seconds from rest. Calculate the kinetic energy acquired by the body at the end of the 3rd second.',
          options: ['450 J', '150 J', '300 J', '60 J'],
          correct_answer: '450 J',
          explanation:
            '[WAEC Chief Examiner Solution] Step 1: Acceleration a = F / m = 20 N / 4 kg = 5 m/s². Step 2: Final velocity v = u + at = 0 + (5)(3) = 15 m/s. Step 3: Kinetic Energy KE = ½mv² = ½ × 4 × (15)² = 2 × 225 = 450 J.',
          gamified_feedback: {
            success_quote: '🇳🇬 A1 Distinction Calculation!',
            hint: 'Find acceleration a = F/m first, then velocity v = at, then KE = ½mv².',
          },
        },
        {
          id: 9202,
          type: 'multiple_choice',
          topic: 'Cellular Biology & Genetics',
          domain: 'Foundations',
          difficulty: 'Intermediate',
          bloom_level: 'Understand',
          points: 20,
          question:
            '[WAEC PAPER 1 OBJECTIVE • Q2] Which of the following processes is directly responsible for the reduction of chromosome number from diploid (2n) to haploid (n) during gamete formation?',
          options: [
            'Separation of homologous chromosomes during Anaphase I of Meiosis',
            'Separation of sister chromatids during Anaphase of Mitosis',
            'Replication of DNA during Interphase S-phase',
            'Binary fission of somatic cells',
          ],
          correct_answer: 'Separation of homologous chromosomes during Anaphase I of Meiosis',
          explanation:
            '[WAEC Marking Scheme] Meiosis I is the reduction division because homologous chromosome pairs separate into different daughter cells during Anaphase I, halving ploidy from 2n to n.',
          gamified_feedback: {
            success_quote: '🇳🇬 WASSCE Objective Spot-On!',
            hint: 'Distinguish between Meiosis I (homologous pairs) and Mitosis (sister chromatids).',
          },
        },
        {
          id: 9203,
          type: 'multiple_choice',
          topic: 'Mathematics & Probability',
          domain: 'Analytical Reasoning',
          difficulty: 'Intermediate',
          bloom_level: 'Apply',
          points: 20,
          question:
            '[WAEC PAPER 1 OBJECTIVE • Q3] A fair die is tossed once. What is the probability of obtaining a number that is BOTH prime and odd?',
          options: ['1/3', '1/2', '2/3', '1/6'],
          correct_answer: '1/3',
          explanation:
            '[WAEC Marking Scheme] Sample space S = {1, 2, 3, 4, 5, 6}. Prime numbers on a die = {2, 3, 5}. Prime numbers that are ALSO odd = {3, 5} (since 2 is even and 1 is not prime). Probability = 2 / 6 = 1/3.',
          gamified_feedback: {
            success_quote: '🇳🇬 Classic WAEC Trap Avoided (2 is even, 1 is not prime)!',
            hint: 'List the primes {2, 3, 5} and keep only the odd ones!',
          },
        },
        {
          id: 9204,
          type: 'fill_in_blank',
          topic: 'Computer Science & Algorithms',
          domain: 'Syntax & Execution',
          difficulty: 'Intermediate',
          bloom_level: 'Apply',
          points: 20,
          question:
            '[WAEC PAPER 2 STRUCTURED • Q4] Complete the WASSCE Data Processing principle regarding relational databases:',
          blank_context: {
            prefix: 'In a relational database table, a field (or combination of fields) that uniquely identifies every individual record without any duplicate or NULL values is called the',
            suffix: 'key.',
            word_bank: ['primary', 'foreign', 'secondary', 'composite'],
          },
          correct_answer: 'primary',
          explanation:
            '[WAEC Marking Scheme] A Primary Key uniquely identifies each tuple/record in a relational table and enforces entity integrity (no duplicates, no NULLs).',
          gamified_feedback: {
            success_quote: '🇳🇬 Paper 2 Structured Credit Earned!',
            hint: 'Which key uniquely identifies each row in a table?',
          },
        },
        {
          id: 9205,
          type: 'open_explanation',
          topic: 'Physics & Mechanics',
          domain: 'Analytical Reasoning',
          difficulty: 'Master',
          bloom_level: 'Analyze',
          points: 20,
          question:
            '[WAEC PAPER 2 THEORY • Q5 (a)] State Ohm’s Law and explain why the resistance of a metallic conductor increases as its temperature rises.',
          correct_answer:
            'Ohm’s Law states that the current flowing through a metallic conductor is directly proportional to the potential difference across its ends provided temperature and other physical conditions remain constant. When temperature rises, positive metal ions vibrate with greater amplitude, increasing collision frequency with drift electrons and increasing resistance.',
          explanation:
            '[WAEC Paper 2 Chief Examiner Rubric — 4 Marks] (1) Correct statement of I ∝ V',
          rubric: [
            'States that current (I) is directly proportional to potential difference (V)',
            'Includes the essential condition: provided temperature / physical conditions remain constant',
            'Explains that higher temperature increases thermal vibration of lattice ions, impeding electron flow',
          ],
          gamified_feedback: {
            success_quote: '🏆 WAEC WASSCE Paper 1 & 2 Complete!',
            hint: 'Remember the mandatory WAEC caveat: "provided temperature and other physical conditions remain constant".',
          },
        },
      ],
    };
  }

  if (formatId === 'jamb') {
    return {
      app_name: 'Quiz Me!',
      persona,
      examFormat: 'jamb',
      quiz_title: '⚡ JAMB UTME CBT Mock: 400-Scale Speed & Precision Drill',
      summary:
        'Official JAMB UTME Computer-Based Test (CBT) simulation. 100% 4-Option Objective MCQs with UTME 400-point aggregate scoring and CBT keyboard shortcuts.',
      difficulty: 'Master',
      tags: ['#ExamMode', '#JAMB', '#UTME_CBT'],
      questions: [
        {
          id: 9301,
          type: 'multiple_choice',
          topic: 'World History & Civilizations',
          domain: 'Analytical Reasoning',
          difficulty: 'Intermediate',
          bloom_level: 'Apply',
          points: 20,
          question:
            '[JAMB USE OF ENGLISH • LEXIS & STRUCTURE] Choose the option that best completes the sentence: "Neither the principal nor the teachers ______ present when the commissioner arrived."',
          options: ['were', 'was', 'is', 'has been'],
          correct_answer: 'were',
          explanation:
            '[JAMB UTME Rule of Proximity] With correlative conjunctions "neither... nor" and "either... or", the verb agrees with the nearer subject ("teachers", which is plural) in the past tense ("arrived" → "were").',
          gamified_feedback: {
            success_quote: '⚡ JAMB Concord Trap Cleared (+80/400 Scale)!',
            hint: 'Apply the Rule of Proximity: match the verb to the closer noun ("teachers").',
          },
        },
        {
          id: 9302,
          type: 'multiple_choice',
          topic: 'Physics & Mechanics',
          domain: 'Applied Logic',
          difficulty: 'Master',
          bloom_level: 'Apply',
          points: 20,
          question:
            '[JAMB UTME PHYSICS • CBT Q2] A projectile is fired at an angle of 30° to the horizontal with an initial velocity of 40 m/s. Calculate the time taken to reach its maximum height. [Take g = 10 m/s²]',
          options: ['2.0 s', '4.0 s', '3.5 s', '8.0 s'],
          correct_answer: '2.0 s',
          explanation:
            '[JAMB CBT Fast Formula] Time to maximum height t = (u sin θ) / g = (40 × sin 30°) / 10 = (40 × 0.5) / 10 = 20 / 10 = 2.0 s.',
          gamified_feedback: {
            success_quote: '⚡ Rapid CBT Calculation! (t = u sin θ / g)',
            hint: 'Use t = (u sin 30°) / g where sin 30° = 0.5.',
          },
        },
        {
          id: 9303,
          type: 'multiple_choice',
          topic: 'Computer Science & Algorithms',
          domain: 'Analytical Reasoning',
          difficulty: 'Intermediate',
          bloom_level: 'Analyze',
          points: 20,
          question:
            '[JAMB UTME QUANTITATIVE & CS • CBT Q3] Convert the hexadecimal number 2F₁₆ to its binary (base 2) equivalent.',
          options: ['00101111₂', '00101010₂', '11110010₂', '01001111₂'],
          correct_answer: '00101111₂',
          explanation:
            '[JAMB CBT Nibble Method] Convert each hex digit to a 4-bit binary nibble: 2₁₆ = 0010₂ and F₁₆ (15) = 1111₂. Concatenating gives 00101111₂.',
          gamified_feedback: {
            success_quote: '⚡ Base Conversion Locked In!',
            hint: '2 in 4-bit binary is 0010, and F (15) in 4-bit binary is 1111.',
          },
        },
        {
          id: 9304,
          type: 'multiple_choice',
          topic: 'Cellular Biology & Genetics',
          domain: 'Foundations',
          difficulty: 'Intermediate',
          bloom_level: 'Understand',
          points: 20,
          question:
            '[JAMB UTME BIOLOGY • CBT Q4] In mammals, which blood vessel carries oxygenated blood directly from the lungs to the left atrium of the heart?',
          options: ['Pulmonary vein', 'Pulmonary artery', 'Aorta', 'Superior vena cava'],
          correct_answer: 'Pulmonary vein',
          explanation:
            '[JAMB Syllabus Key Exception] While most veins carry deoxygenated blood, the Pulmonary Vein is the classic exception: it carries freshly oxygenated blood from the lungs to the left atrium.',
          gamified_feedback: {
            success_quote: '⚡ Classic JAMB Biology Exception Nailed!',
            hint: 'Veins go TO the heart; which vessel brings oxygenated blood from the lungs to the heart?',
          },
        },
        {
          id: 9305,
          type: 'multiple_choice',
          topic: 'Mathematics & Probability',
          domain: 'Applied Logic',
          difficulty: 'Master',
          bloom_level: 'Analyze',
          points: 20,
          question:
            '[JAMB UTME MATHEMATICS • CBT Q5] Find the derivative dy/dx of the function y = 3x³ − 4x² + 7x − 12 at x = 2.',
          options: ['27', '19', '35', '15'],
          correct_answer: '27',
          explanation:
            '[JAMB Calculus Solution] Differentiating term by term: dy/dx = 9x² − 8x + 7. Substituting x = 2: dy/dx = 9(2)² − 8(2) + 7 = 36 − 16 + 7 = 27.',
          gamified_feedback: {
            success_quote: '🏆 JAMB 400-Scale CBT Simulation Complete!',
            hint: 'Differentiate y to get dy/dx = 9x² - 8x + 7, then plug in x = 2.',
          },
        },
      ],
    };
  }

  // Default fallback for NECO, IGCSE, SAT, AP/IB
  return {
    app_name: 'Quiz Me!',
    persona,
    examFormat: formatId,
    quiz_title: `${spec.badgeEmoji} ${spec.fullName} — Syllabus-Aligned Practice Paper`,
    summary: `${spec.description} (${spec.paperStructure})`,
    difficulty: 'Intermediate',
    tags: ['#ExamMode', `#Format_${formatId}`],
    questions: [
      {
        id: 9401,
        type: 'multiple_choice',
        topic: 'Physics & Mechanics',
        domain: 'Foundations',
        difficulty: 'Intermediate',
        bloom_level: 'Apply',
        points: 20,
        question: `[${spec.shortName.toUpperCase()} • PRACTICE SECTION I Q1] An object of mass 5 kg accelerates uniformly from 2 m/s to 10 m/s in 4 seconds. What is the magnitude of the resultant force acting on the object?`,
        options: ['10 N', '20 N', '40 N', '8 N'],
        correct_answer: '10 N',
        explanation: `[${spec.shortName} Practice Solution Guide] Acceleration a = (v − u) / t = (10 − 2) / 4 = 2 m/s². Resultant force F = ma = 5 kg × 2 m/s² = 10 N.`,
        gamified_feedback: {
          success_quote: `${spec.badgeEmoji} Section I Mark Verified!`,
          hint: 'Calculate acceleration a = (v - u)/t first, then multiply by mass m.',
        },
      },
      {
        id: 9402,
        type: 'multiple_choice',
        topic: 'Computer Science & Algorithms',
        domain: 'Analytical Reasoning',
        difficulty: 'Intermediate',
        bloom_level: 'Analyze',
        points: 20,
        question: `[${spec.shortName.toUpperCase()} • PRACTICE SECTION I Q2] Why does Binary Search achieve O(log N) time complexity on a sorted array of N elements?`,
        options: [
          'It halves the remaining search interval after every midpoint comparison',
          'It inspects every element sequentially from index 0 to N-1',
          'It sorts the array on every step using nested loops',
          'It hashes every element into a single bucket',
        ],
        correct_answer: 'It halves the remaining search interval after every midpoint comparison',
        explanation: `[${spec.shortName} Practice Solution Guide] Eliminating half of the remaining candidates on each comparison yields at most log₂(N) steps.`,
        gamified_feedback: {
          success_quote: `${spec.badgeEmoji} Logarithmic Halving Mastered!`,
          hint: 'How much of the search space is discarded after each midpoint check?',
        },
      },
      {
        id: 9403,
        type: 'fill_in_blank',
        topic: 'Cellular Biology & Genetics',
        domain: 'Foundations',
        difficulty: 'Intermediate',
        bloom_level: 'Understand',
        points: 20,
        question: `[${spec.shortName.toUpperCase()} • STRUCTURED RESPONSE Q3] Complete the cellular respiration equation principle:`,
        blank_context: {
          prefix: 'During aerobic cellular respiration in the mitochondria, glucose and oxygen react to synthesize',
          suffix: 'molecules as the cell’s primary energy currency, releasing carbon dioxide and water.',
          word_bank: ['ATP', 'DNA', 'RNA', 'cellulose'],
        },
        correct_answer: 'ATP',
        explanation: `[${spec.shortName} Mark Scheme] Adenosine triphosphate (ATP) is the universal chemical energy currency produced by oxidative phosphorylation in mitochondria.`,
        gamified_feedback: {
          success_quote: `${spec.badgeEmoji} Structured Response Correct!`,
          hint: 'What 3-letter molecule is the energy currency of the cell?',
        },
      },
      {
        id: 9404,
        type: 'multiple_choice',
        topic: 'Mathematics & Probability',
        domain: 'Applied Logic',
        difficulty: 'Master',
        bloom_level: 'Apply',
        points: 20,
        question: `[${spec.shortName.toUpperCase()} • QUANTITATIVE Q4] If 3^(2x - 1) = 27, what is the value of x?`,
        options: ['2', '3', '1.5', '4'],
        correct_answer: '2',
        explanation: `[${spec.shortName} Mark Scheme] Rewrite 27 as 3³. Equating exponents gives 2x − 1 = 3 → 2x = 4 → x = 2.`,
        gamified_feedback: {
          success_quote: `${spec.badgeEmoji} Exponential Equation Solved!`,
          hint: 'Express 27 as a power of 3 (3³ = 27) and equate the exponents.',
        },
      },
      {
        id: 9405,
        type: 'open_explanation',
        topic: 'World History & Civilizations',
        domain: 'Analytical Reasoning',
        difficulty: 'Master',
        bloom_level: 'Analyze',
        points: 20,
        question: `[${spec.shortName.toUpperCase()} • SECTION II FREE RESPONSE Q5] Explain how the invention of the printing press transformed scientific and academic knowledge transmission across Europe.`,
        correct_answer:
          'The printing press drastically lowered the cost of books, standardized scientific texts and diagrams, and enabled rapid peer review and widespread literacy.',
        explanation: `[${spec.shortName} Mark Scheme] Mass reproduction eliminated scribal copying errors, democratized access to texts, and accelerated the Scientific Revolution.`,
        rubric: [
          'Mentions rapid, low-cost reproduction of books and treatises',
          'Explains how standardization preserved accurate data and diagrams',
          'Connects widespread availability to literacy and scientific collaboration',
        ],
        gamified_feedback: {
          success_quote: `🏆 ${spec.shortName} Mock Exam Complete!`,
          hint: 'Consider cost, accuracy of copies, and how fast scientists could share discoveries.',
        },
      },
    ],
  };
}
