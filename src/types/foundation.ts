// Foundation Tier & Prerequisite Scaffolding Data Types

export type FoundationSubjectDomain =
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'literature_english'
  | 'exam_technique'
  | 'cognitive_learning';

export interface FoundationalAxiom {
  id: string;
  domain: FoundationSubjectDomain;
  title: string;
  oneSentenceRule: string;
  firstPrinciplesExplanation: string;
  commonMisconception: string;
  scaffoldedExample: {
    problem: string;
    steps: string[];
    answer: string;
  };
  visualAnchorOrFormula?: string;
  prerequisites: string[];
}

export interface QuestionFoundationScaffold {
  domain?: FoundationSubjectDomain;
  topic?: string;
  depthLevel?: number;
  prerequisiteRule: string;
  firstPrinciple?: string;
  formula?: string;
  examinerTrap?: string;
  scaffoldedSteps?: string[];
  vocabularyClarifications?: Record<string, string>;
  firstPrinciplesSteps?: string[];
  keyFormulaOrDiagram?: string;
  examinerTrapToAvoid?: string;
}

export interface FoundationDiagnosticQuestion {
  id: string;
  domain: FoundationSubjectDomain;
  prerequisiteConcept: string;
  question: string;
  options: string[];
  correctAnswer: string;
  foundationExplanation: string;
}
