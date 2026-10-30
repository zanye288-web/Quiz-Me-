import { ExamFormatId } from './quiz';

export type OpenAccessRepositoryId =
  | 'open_textbook_library'
  | 'project_gutenberg'
  | 'internet_archive'
  | 'doab'
  | 'wikibooks'
  | 'nerdc_curriculum'
  | 'mit_ocw'
  | 'libretexts';

export type LicenseClassification =
  | 'CC BY 4.0'
  | 'CC BY-SA 4.0'
  | 'CC BY-NC 4.0'
  | 'CC BY-NC-SA 4.0'
  | 'Public Domain'
  | 'NERDC National Curriculum Framework'
  | 'MIT OpenCourseWare Open License'
  | 'Open Access / Fair Educational Use';

export interface OpenAccessRepositoryMeta {
  id: OpenAccessRepositoryId;
  name: string;
  shortName: string;
  tagline: string;
  homepageUrl: string;
  searchUrlTemplate?: string;
  licenseSummary: string;
  category: 'curriculum_authority' | 'textbooks' | 'classical_literature' | 'university_ocw' | 'academic_archive';
  countryOrRegion: string;
  curriculumCoverage: string[];
  iconEmoji: string;
}

export interface OerChapterOrPassage {
  id: string;
  chapterNumber?: number;
  title: string;
  summary: string;
  passageText: string;
  keyConcepts: string[];
  workedProblem?: {
    question: string;
    stepByStepSolution: string;
    markSchemeNotes?: string;
  };
  syllabusReferenceCode?: string;
}

export interface OpenAccessResourceRecord {
  id: string;
  repositoryId: OpenAccessRepositoryId;
  title: string;
  authorOrOrganization: string;
  yearOrEdition: string;
  subject: string;
  targetExamBoards: ExamFormatId[];
  curriculumFrameworkLevel: string; // e.g. "NERDC Senior Secondary (SSS 1–3)", "Cambridge IGCSE & O-Level"
  url: string;
  license: LicenseClassification;
  licenseUrl?: string;
  attributionNote: string;
  description: string;
  tags: string[];
  officialCurriculumRef?: string;
  chaptersOrSections: OerChapterOrPassage[];
  isVerifiedOpenAccess: boolean;
  citationText: string;
}

export interface OerSearchQuery {
  query?: string;
  repositoryId?: OpenAccessRepositoryId | 'all';
  targetExamBoard?: ExamFormatId | 'all';
  subject?: string;
  priorityRegion?: 'all' | 'west_africa' | 'uk_international' | 'us_admissions';
}

export interface OerLiveSearchResultItem {
  id: string;
  title: string;
  author?: string;
  repositoryId: OpenAccessRepositoryId;
  sourceUrl: string;
  license: LicenseClassification;
  snippet?: string;
  year?: string;
  subject?: string;
  targetExamBoards?: ExamFormatId[];
  isLiveApiResult: boolean;
}

export interface OerConvertToPaperRequest {
  resourceId: string;
  chapterId?: string;
  passageText?: string;
  targetExamBoard: ExamFormatId;
  targetSubject: string;
  questionCount?: number;
  paperType?: 'objective' | 'theory' | 'combined';
}
