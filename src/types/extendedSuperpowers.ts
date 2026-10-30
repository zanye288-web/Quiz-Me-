// Extended Examination Superpowers Data Types & Interfaces
// Modules A-J (Features 51 - 150)

export type STEMTab =
  | 'periodic_table'
  | 'chemical_equations'
  | 'ph_calculator'
  | 'kinematics'
  | 'circuits'
  | 'optics'
  | 'genetics'
  | 'units';

export type HumanitiesTab =
  | 'literary_devices'
  | 'peel_structurer'
  | 'timeline'
  | 'readability'
  | 'latin_greek_roots'
  | 'citations'
  | 'comparative_matrix';

export type MathTab =
  | 'quadratic_solver'
  | 'simultaneous_equations'
  | 'statistics'
  | 'normal_distribution'
  | 'geometry_solids'
  | 'circle_theorems'
  | 'sequences'
  | 'combinatorics'
  | 'set_theory';

export type ExamSimTab =
  | 'jamb_cbt'
  | 'seat_slip'
  | 'time_budget'
  | 'guessing_penalty'
  | 'packing_checklist';

export type WellnessTab =
  | 'box_breathing'
  | 'sleep_cycle'
  | 'countdown_48h'
  | 'brain_nutrition'
  | 'blank_mind_recovery'
  | 'exam_debrief';

export type MemoryTab =
  | 'mnemonics'
  | 'forgetting_curve'
  | 'custom_mnemonic'
  | 'sm2_calculator';

export interface ChemicalElement {
  number: number;
  symbol: string;
  name: string;
  atomicMass: number;
  group: number; // 1-18
  period: number; // 1-7
  category:
    | 'alkali_metal'
    | 'alkaline_earth'
    | 'transition_metal'
    | 'post_transition_metal'
    | 'metalloid'
    | 'reactive_nonmetal'
    | 'noble_gas'
    | 'lanthanide'
    | 'actinide';
  phaseAtSTP: 'gas' | 'liquid' | 'solid';
  electronConfiguration: string;
  electronegativity?: number;
  density?: number; // g/cm³
  flameTestColor?: string;
  examHighlight: string;
}

export interface LiteraryDevice {
  term: string;
  category: 'figurative_language' | 'rhetoric' | 'sound_device' | 'structural_device';
  definition: string;
  examplePassage: string;
  sourceOrAuthor: string;
  examinerTip: string;
}

export interface HistoricalEvent {
  year: number;
  yearDisplay: string;
  region: 'West Africa' | 'Europe & UK' | 'Global & Americas';
  title: string;
  description: string;
  syllabusRelevance: string;
}

export interface LatinGreekRoot {
  root: string;
  origin: 'Latin' | 'Greek';
  meaning: string;
  examVocabulary: string[];
  sampleSentence: string;
}

export interface CircleTheorem {
  id: string;
  title: string;
  rule: string;
  examinerNotes: string;
  formula: string;
}

export interface MnemonicItem {
  id: string;
  subject: 'Chemistry' | 'Physics' | 'Biology' | 'Mathematics' | 'Geography' | 'Literature';
  title: string;
  phrase: string;
  meaning: string[];
  boardRelevance: string;
}

export interface CandidateSlipData {
  candidateName: string;
  registrationNumber: string;
  centerNumber: string;
  centerName: string;
  examinationBoard: string;
  sessionYear: string;
  subjects: Array<{ code: string; name: string; date: string; time: string; paper: string }>;
  passportPhoto?: string;
}

export interface MultilingualTerm {
  english: string;
  french: string;
  yoruba: string;
  igbo: string;
  hausa: string;
  swahili: string;
  arabic: string;
  subject: string;
}
