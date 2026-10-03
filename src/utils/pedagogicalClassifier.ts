/**
 * Pedagogical Topic Classification Engine
 * 
 * Automatically analyzes quiz content, titles, questions, and curriculum themes
 * to assign standardized pedagogical topic categories (e.g., 'STEM', 'History')
 * and structured hashtags for high-precision navigation, filtering, and search
 * in the Curriculum Catalog.
 */

export type CanonicalPedagogicalTopic =
  | 'STEM'
  | 'History'
  | 'Social Sciences'
  | 'Humanities & Literature'
  | 'Arts & Culture'
  | 'Business & Finance'
  | 'General Knowledge';

export interface PedagogicalClassification {
  topic: CanonicalPedagogicalTopic;
  subtopic: string;
  tags: string[];
  topicColor: {
    bg: string;
    text: string;
    border: string;
    badge: string;
    icon: string;
  };
}

export const CANONICAL_PEDAGOGICAL_TOPICS: CanonicalPedagogicalTopic[] = [
  'STEM',
  'History',
  'Social Sciences',
  'Humanities & Literature',
  'Arts & Culture',
  'Business & Finance',
];

export const PEDAGOGICAL_THEME_CONFIG: Record<
  CanonicalPedagogicalTopic,
  {
    icon: string;
    label: string;
    badgeClass: string;
    pillClass: string;
    accentHex: string;
    description: string;
  }
> = {
  STEM: {
    icon: 'Atom',
    label: 'STEM',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    pillClass: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/60',
    accentHex: '#10b981',
    description: 'Science, Technology, Engineering, Mathematics & Computing',
  },
  History: {
    icon: 'Landmark',
    label: 'History',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    pillClass: 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/60',
    accentHex: '#f59e0b',
    description: 'World History, Civilizations, Wars, Revolutions & Epochs',
  },
  'Social Sciences': {
    icon: 'Globe',
    label: 'Social Sciences',
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    pillClass: 'bg-sky-950/40 text-sky-300 border-sky-800/60 hover:bg-sky-900/60',
    accentHex: '#0ea5e9',
    description: 'Psychology, Economics, Politics, Sociology & Law',
  },
  'Humanities & Literature': {
    icon: 'BookOpen',
    label: 'Humanities & Literature',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    pillClass: 'bg-purple-950/40 text-purple-300 border-purple-800/60 hover:bg-purple-900/60',
    accentHex: '#a855f7',
    description: 'Literature, Philosophy, Linguistics, Ethics & Classics',
  },
  'Arts & Culture': {
    icon: 'Palette',
    label: 'Arts & Culture',
    badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    pillClass: 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/60',
    accentHex: '#f43f5e',
    description: 'Visual Art, Architecture, Music, Cinema & Art History',
  },
  'Business & Finance': {
    icon: 'Briefcase',
    label: 'Business & Finance',
    badgeClass: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    pillClass: 'bg-teal-950/40 text-teal-300 border-teal-800/60 hover:bg-teal-900/60',
    accentHex: '#14b8a6',
    description: 'Corporate Finance, Management, Entrepreneurship & Commerce',
  },
  'General Knowledge': {
    icon: 'Sparkles',
    label: 'General Knowledge',
    badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    pillClass: 'bg-slate-950/40 text-slate-300 border-slate-800/60 hover:bg-slate-900/60',
    accentHex: '#64748b',
    description: 'Interdisciplinary & General Curriculum Assessments',
  },
};

// Keyword banks for semantic classification
const STEM_KEYWORDS = [
  'science', 'physics', 'chemistry', 'biology', 'math', 'algebra', 'calculus', 'geometry',
  'quantum', 'algorithm', 'code', 'python', 'javascript', 'react', 'software', 'mitochondria',
  'cell', 'organelle', 'dna', 'rna', 'genetics', 'astronomy', 'space', 'engineering',
  'circuit', 'mechanics', 'thermodynamics', 'neuroscience', 'biochemistry', 'atom',
  'molecule', 'equation', 'theorem', 'electromagnetism', 'evolution', 'ecology', 'enzyme',
  'respiration', 'photosynthesis', 'gravity', 'optics', 'matrix', 'vector', 'program',
  'database', 'computer', 'network', 'cybersecurity', 'qubit', 'cristae', 'membrane',
  'arithmetic', 'statistics', 'astrophysics', 'geology', 'meteorology', 'botany', 'zoology',
  'cellular', 'chromosome', 'wavelength', 'frequency', 'newton', 'einstein', 'turing'
];

const HISTORY_KEYWORDS = [
  'history', 'historical', 'revolution', 'war', 'empire', 'century', 'ancient', 'medieval',
  'dynasty', 'reign', 'treaty', 'monarch', 'battle', 'civilization', 'archaeology',
  'bastille', 'roman', 'greek', 'egyptian', 'renaissance', 'napoleon', 'world war', 'wwi',
  'wwii', 'cold war', 'declaration', 'constitution', 'colonial', 'feudalism', 'era',
  'victorian', 'crusades', 'ottoman', 'byzantine', 'pharaoh', 'caesar', 'alexander',
  'monarchy', 'sovereignty', 'independence', 'presidency', 'treaty of versailles', 'waterloo',
  'holocaust', 'enlightenment', 'reformation', 'civil war', 'prehistory', 'republic'
];

const SOCIAL_SCIENCES_KEYWORDS = [
  'psychology', 'sociology', 'economics', 'macroeconomics', 'microeconomics', 'politics',
  'political', 'government', 'anthropology', 'cognition', 'behavioral', 'inflation',
  'gdp', 'monetary', 'fiscal', 'society', 'policy', 'democracy', 'legislation', 'criminology',
  'demographics', 'social psychology', 'public policy', 'elections', 'voter', 'jurisprudence',
  'mental health', 'freud', 'keynesian', 'supply and demand', 'market equilibrium'
];

const HUMANITIES_KEYWORDS = [
  'literature', 'novel', 'poetry', 'poem', 'philosophy', 'philosophical', 'ethics',
  'author', 'shakespeare', 'playwright', 'drama', 'tragedy', 'metaphor', 'allegory',
  'prose', 'classic', 'existentialism', 'epistemology', 'mythology', 'rhetoric', 'hamlet',
  'iliad', 'odyssey', 'dante', 'literary', 'plato', 'aristotle', 'kant', 'nietzsche',
  'linguistics', 'syntax', 'grammar', 'fiction', 'sonnet', 'soliloquy'
];

const ARTS_KEYWORDS = [
  'art', 'painting', 'sculpture', 'music', 'composer', 'symphony', 'architecture',
  'design', 'cinema', 'film', 'visual art', 'renaissance art', 'baroque', 'impressionism',
  'photography', 'theatre', 'aesthetic', 'harmony', 'tempo', 'mona lisa', 'da vinci',
  'beethoven', 'mozart', 'gothic', 'surrealism', 'cubism'
];

const BUSINESS_KEYWORDS = [
  'business', 'finance', 'marketing', 'management', 'accounting', 'entrepreneur',
  'startup', 'strategy', 'investment', 'stock market', 'commerce', 'supply chain',
  'leadership', 'corporate', 'venture', 'revenue', 'profit', 'balance sheet', 'merger',
  'valuation', 'equity', 'branding', 'sales funnel'
];

function scoreKeywords(text: string, keywords: string[]): number {
  let count = 0;
  for (const kw of keywords) {
    const reg = new RegExp(`\\b${kw.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\$&')}\\b`, 'i');
    if (reg.test(text)) {
      count += kw.length > 5 ? 2 : 1;
    }
  }
  return count;
}

/**
 * Classifies a quiz into its canonical pedagogical topic, subtopic, and standardized tags.
 */
export function classifyPedagogicalTopic(params: {
  title?: string;
  summary?: string;
  inputText?: string;
  questions?: Array<{ question?: string; correct_answer?: string }>;
  declaredTopic?: string;
  declaredSubtopic?: string;
  existingTags?: string[];
}): PedagogicalClassification {
  const {
    title = '',
    summary = '',
    inputText = '',
    questions = [],
    declaredTopic,
    declaredSubtopic,
    existingTags = [],
  } = params;

  // If user or AI explicitly supplied a recognized canonical topic, respect it!
  const cleanDeclared = (declaredTopic || '').trim();
  const directMatch = CANONICAL_PEDAGOGICAL_TOPICS.find(
    (t) => t.toLowerCase() === cleanDeclared.toLowerCase()
  );

  let canonicalTopic: CanonicalPedagogicalTopic;

  if (directMatch) {
    canonicalTopic = directMatch;
  } else {
    // Combine text corpus for semantic frequency scoring
    const questionsText = questions.map((q) => `${q.question || ''} ${q.correct_answer || ''}`).join(' ');
    const corpus = `${title} ${title} ${summary} ${inputText.slice(0, 1000)} ${questionsText} ${existingTags.join(' ')}`.toLowerCase();

    const scores: Record<CanonicalPedagogicalTopic, number> = {
      STEM: scoreKeywords(corpus, STEM_KEYWORDS),
      History: scoreKeywords(corpus, HISTORY_KEYWORDS),
      'Social Sciences': scoreKeywords(corpus, SOCIAL_SCIENCES_KEYWORDS),
      'Humanities & Literature': scoreKeywords(corpus, HUMANITIES_KEYWORDS),
      'Arts & Culture': scoreKeywords(corpus, ARTS_KEYWORDS),
      'Business & Finance': scoreKeywords(corpus, BUSINESS_KEYWORDS),
      'General Knowledge': 0,
    };

    let maxScore = 0;
    let bestTopic: CanonicalPedagogicalTopic = 'STEM'; // Default high-yield topic

    for (const [topicKey, score] of Object.entries(scores)) {
      if (topicKey !== 'General Knowledge' && score > maxScore) {
        maxScore = score;
        bestTopic = topicKey as CanonicalPedagogicalTopic;
      }
    }

    canonicalTopic = maxScore > 0 ? bestTopic : 'STEM';
  }

  // Determine subtopic
  let subtopic = (declaredSubtopic || '').trim();
  const corpus = `${title} ${summary} ${existingTags.join(' ')}`.toLowerCase();

  if (!subtopic) {
    switch (canonicalTopic) {
      case 'STEM':
        if (corpus.includes('bio') || corpus.includes('cell') || corpus.includes('dna') || corpus.includes('mitochond')) {
          subtopic = 'Life Sciences';
        } else if (corpus.includes('code') || corpus.includes('program') || corpus.includes('react') || corpus.includes('javascript') || corpus.includes('algorithm')) {
          subtopic = 'Computer Science';
        } else if (corpus.includes('physics') || corpus.includes('quantum') || corpus.includes('wave') || corpus.includes('relativity') || corpus.includes('energy')) {
          subtopic = 'Physics';
        } else if (corpus.includes('math') || corpus.includes('algebra') || corpus.includes('calculus') || corpus.includes('geometry') || corpus.includes('theorem')) {
          subtopic = 'Mathematics';
        } else if (corpus.includes('chem') || corpus.includes('molecule') || corpus.includes('acid') || corpus.includes('reaction')) {
          subtopic = 'Chemistry';
        } else if (corpus.includes('space') || corpus.includes('planet') || corpus.includes('astro') || corpus.includes('orbit')) {
          subtopic = 'Astronomy';
        } else {
          subtopic = 'Science & Tech';
        }
        break;

      case 'History':
        if (corpus.includes('ancient') || corpus.includes('roman') || corpus.includes('greek') || corpus.includes('egypt')) {
          subtopic = 'Ancient History';
        } else if (corpus.includes('war') || corpus.includes('wwii') || corpus.includes('wwi') || corpus.includes('battle')) {
          subtopic = 'Military History';
        } else if (corpus.includes('revolution') || corpus.includes('bastille') || corpus.includes('french')) {
          subtopic = 'European History';
        } else {
          subtopic = 'World History';
        }
        break;

      case 'Social Sciences':
        if (corpus.includes('psycho') || corpus.includes('cognit') || corpus.includes('mental') || corpus.includes('brain')) {
          subtopic = 'Psychology';
        } else if (corpus.includes('econ') || corpus.includes('inflation') || corpus.includes('market') || corpus.includes('gdp')) {
          subtopic = 'Economics';
        } else if (corpus.includes('politi') || corpus.includes('gov') || corpus.includes('law') || corpus.includes('democ')) {
          subtopic = 'Political Science';
        } else {
          subtopic = 'Sociology';
        }
        break;

      case 'Humanities & Literature':
        if (corpus.includes('novel') || corpus.includes('poetry') || corpus.includes('play') || corpus.includes('shakespeare') || corpus.includes('drama')) {
          subtopic = 'Literature';
        } else if (corpus.includes('philo') || corpus.includes('ethics') || corpus.includes('morality') || corpus.includes('epistemo')) {
          subtopic = 'Philosophy';
        } else {
          subtopic = 'Humanities';
        }
        break;

      case 'Arts & Culture':
        if (corpus.includes('paint') || corpus.includes('sculpt') || corpus.includes('museum') || corpus.includes('canvas')) {
          subtopic = 'Visual Arts';
        } else if (corpus.includes('music') || corpus.includes('symphony') || corpus.includes('harmony') || corpus.includes('composer')) {
          subtopic = 'Music';
        } else if (corpus.includes('architec') || corpus.includes('building') || corpus.includes('monument')) {
          subtopic = 'Architecture';
        } else {
          subtopic = 'Arts & Culture';
        }
        break;

      case 'Business & Finance':
        if (corpus.includes('finan') || corpus.includes('invest') || corpus.includes('stock') || corpus.includes('equity')) {
          subtopic = 'Finance';
        } else if (corpus.includes('market') || corpus.includes('brand') || corpus.includes('customer')) {
          subtopic = 'Marketing';
        } else if (corpus.includes('start') || corpus.includes('venture') || corpus.includes('founder')) {
          subtopic = 'Entrepreneurship';
        } else {
          subtopic = 'Business Management';
        }
        break;

      default:
        subtopic = 'Curriculum Assessment';
    }
  }

  // Compile standardized tags
  const topicTag = `#${canonicalTopic.replace(/[^a-zA-Z0-9]/g, '')}`;
  const subtopicTag = `#${subtopic.replace(/[^a-zA-Z0-9]/g, '')}`;
  const titleTag = `#${title.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}`;

  const setOfTags = new Set<string>();
  setOfTags.add(topicTag);
  if (subtopicTag && subtopicTag.length > 2) setOfTags.add(subtopicTag);
  if (titleTag && titleTag.length > 3) setOfTags.add(titleTag);

  // Preserve existing clean tags
  if (Array.isArray(existingTags)) {
    for (const raw of existingTags) {
      if (!raw || typeof raw !== 'string') continue;
      const clean = raw.trim().startsWith('#')
        ? `#${raw.trim().replace(/^#+/, '').replace(/[^a-zA-Z0-9]/g, '')}`
        : `#${raw.trim().replace(/[^a-zA-Z0-9]/g, '')}`;
      if (clean.length > 2 && clean !== '#' && !setOfTags.has(clean)) {
        setOfTags.add(clean);
      }
    }
  }

  // Add pedagogy tags
  setOfTags.add('#ActiveRecall');
  setOfTags.add('#Curriculum');

  const finalTags = Array.from(setOfTags).slice(0, 6);

  const theme = PEDAGOGICAL_THEME_CONFIG[canonicalTopic] || PEDAGOGICAL_THEME_CONFIG.STEM;

  return {
    topic: canonicalTopic,
    subtopic,
    tags: finalTags,
    topicColor: {
      bg: theme.badgeClass,
      text: theme.badgeClass,
      border: theme.badgeClass,
      badge: theme.badgeClass,
      icon: theme.icon,
    },
  };
}

/**
 * Derives a canonical pedagogical topic from a list of tags or title
 */
export function derivePedagogicalTopic(tags?: string[], title?: string, category?: string): CanonicalPedagogicalTopic {
  const combined = `${category || ''} ${title || ''} ${(tags || []).join(' ')}`.toLowerCase();

  if (combined.includes('stem') || combined.includes('physics') || combined.includes('bio') || combined.includes('math') || combined.includes('chem') || combined.includes('code') || combined.includes('software')) {
    return 'STEM';
  }
  if (combined.includes('history') || combined.includes('revolution') || combined.includes('war') || combined.includes('ancient') || combined.includes('empire') || combined.includes('century')) {
    return 'History';
  }
  if (combined.includes('social') || combined.includes('psych') || combined.includes('econ') || combined.includes('polit') || combined.includes('sociol')) {
    return 'Social Sciences';
  }
  if (combined.includes('humanit') || combined.includes('literat') || combined.includes('philosoph') || combined.includes('poet') || combined.includes('shake')) {
    return 'Humanities & Literature';
  }
  if (combined.includes('art') || combined.includes('paint') || combined.includes('music') || combined.includes('sculpt') || combined.includes('cinema')) {
    return 'Arts & Culture';
  }
  if (combined.includes('busin') || combined.includes('financ') || combined.includes('market') || combined.includes('manage') || combined.includes('entre')) {
    return 'Business & Finance';
  }

  return 'STEM';
}
