export interface ThematicVisualAsset {
  keywords: string[];
  url: string;
  caption: string;
  category: string;
}

export const THEMATIC_VISUAL_ASSETS: ThematicVisualAsset[] = [
  // 1. Space, Astronomy & Cosmology
  {
    category: 'Space',
    keywords: ['space', 'astronomy', 'planet', 'mars', 'orbit', 'galaxy', 'star', 'telescope', 'apollo', 'universe', 'cosmic', 'nasa', 'solar', 'moon', 'black hole', 'nebula'],
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    caption: 'Deep space exploration, celestial bodies, and planetary science.',
  },
  {
    category: 'Space',
    keywords: ['space', 'galaxy', 'nebula', 'hubble', 'star', 'cosmos', 'milky way'],
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&auto=format&fit=crop&q=80',
    caption: 'Interstellar gas clouds, stellar nurseries, and emission nebulae.',
  },
  {
    category: 'Space',
    keywords: ['space', 'moon', 'lunar', 'apollo', 'crater', 'satellite'],
    url: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?w=1200&auto=format&fit=crop&q=80',
    caption: 'High-resolution lunar surface topography, crater rims, and orbital geography.',
  },
  {
    category: 'Space',
    keywords: ['space', 'planet', 'mars', 'rover', 'surface', 'red planet'],
    url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1200&auto=format&fit=crop&q=80',
    caption: 'Planetary geology, Martian terrain, and robotic interplanetary exploration.',
  },
  {
    category: 'Space',
    keywords: ['space', 'telescope', 'observatory', 'astrophysics', 'night sky', 'stargazing'],
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80',
    caption: 'Astronomical observatory tracking deep sky cosmological phenomena.',
  },

  // 2. Cellular Biology, Genetics & Biochemistry
  {
    category: 'Biology',
    keywords: ['biology', 'cell', 'mitochondria', 'dna', 'genetics', 'organism', 'evolution', 'photosynthesis', 'membrane', 'protein', 'enzyme', 'bacteria', 'microbiology'],
    url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=1200&auto=format&fit=crop&q=80',
    caption: 'Cellular biology, genetic replication, and microscopic biochemistry.',
  },
  {
    category: 'Biology',
    keywords: ['dna', 'helix', 'genetics', 'chromosome', 'genome', 'mutation', 'crispr'],
    url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&auto=format&fit=crop&q=80',
    caption: 'Double helix DNA molecular architecture and genomic transcription.',
  },
  {
    category: 'Biology',
    keywords: ['microscope', 'laboratory', 'pathology', 'slide', 'specimen', 'biochemistry'],
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
    caption: 'High-power optical microscopy and biological cellular research.',
  },
  {
    category: 'Biology',
    keywords: ['bacteria', 'microbiology', 'petri dish', 'culture', 'virus', 'pathogen', 'immunology'],
    url: 'https://images.unsplash.com/photo-1583912267670-6575ad362c3e?w=1200&auto=format&fit=crop&q=80',
    caption: 'Microbial cultures, immunological response mechanisms, and cellular defense.',
  },
  {
    category: 'Biology',
    keywords: ['botany', 'chloroplast', 'plant cell', 'photosynthesis', 'leaf', 'flora'],
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&auto=format&fit=crop&q=80',
    caption: 'Plant cell wall morphology, chloroplast distribution, and light energy conversion.',
  },

  // 3. Human Anatomy, Neuroscience & Medicine
  {
    category: 'Medicine',
    keywords: ['medicine', 'health', 'anatomy', 'brain', 'heart', 'organ', 'clinical', 'disease', 'neuron', 'immune', 'physiology', 'doctor', 'medical', 'neuroscience'],
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop&q=80',
    caption: 'Human anatomy, physiological systems, and medical diagnostics.',
  },
  {
    category: 'Medicine',
    keywords: ['brain', 'neuron', 'neuroscience', 'synapse', 'cognitive', 'psychology', 'memory'],
    url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1200&auto=format&fit=crop&q=80',
    caption: 'Neuroanatomical mapping, synaptic connectivity, and cognitive pathways.',
  },
  {
    category: 'Medicine',
    keywords: ['cardiovascular', 'heart', 'circulation', 'artery', 'blood', 'pulse'],
    url: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=1200&auto=format&fit=crop&q=80',
    caption: 'Cardiovascular hemodynamic flow and anatomical heart structure.',
  },
  {
    category: 'Medicine',
    keywords: ['skeleton', 'bone', 'orthopedic', 'xray', 'radiology', 'spine'],
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&auto=format&fit=crop&q=80',
    caption: 'Radiographic diagnostic imaging and human skeletal structural framework.',
  },

  // 4. Fundamental Physics, Optics & Thermodynamics
  {
    category: 'Physics',
    keywords: ['quantum', 'physics', 'atom', 'particle', 'gravity', 'thermodynamic', 'relativity', 'wave', 'laser', 'electron', 'superposition', 'mechanics', 'force', 'energy'],
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop&q=80',
    caption: 'Fundamental physics, wave-particle duality, and energy interactions.',
  },
  {
    category: 'Physics',
    keywords: ['optics', 'light', 'laser', 'refraction', 'spectrum', 'prism', 'beam'],
    url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&auto=format&fit=crop&q=80',
    caption: 'Electromagnetic wave propagation, optical dispersion, and refraction physics.',
  },
  {
    category: 'Physics',
    keywords: ['magnetic', 'magnetism', 'field', 'electricity', 'flux', 'induction'],
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    caption: 'Electrodynamic field lines, flux density, and magnetic potential.',
  },
  {
    category: 'Physics',
    keywords: ['thermodynamics', 'entropy', 'heat', 'temperature', 'plasma', 'fusion'],
    url: 'https://images.unsplash.com/photo-1517976487507-5989f6512470?w=1200&auto=format&fit=crop&q=80',
    caption: 'Thermal kinetics, high-energy plasma states, and enthalpy transfer.',
  },

  // 5. Chemistry, Molecular Science & Materials
  {
    category: 'Chemistry',
    keywords: ['chemistry', 'molecule', 'reaction', 'acid', 'compound', 'element', 'solution', 'bonding', 'periodic', 'chemical', 'ph', 'catalyst'],
    url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&auto=format&fit=crop&q=80',
    caption: 'Chemical reactions, molecular bonding, and laboratory experiments.',
  },
  {
    category: 'Chemistry',
    keywords: ['crystal', 'mineral', 'lattice', 'solid state', 'structure', 'quartz'],
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    caption: 'Crystalline lattice geometry and solid-state materials crystallography.',
  },
  {
    category: 'Chemistry',
    keywords: ['solution', 'titration', 'beaker', 'flask', 'experiment', 'liquid'],
    url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80',
    caption: 'Stoichiometric aqueous reactions and quantitative laboratory titration.',
  },

  // 6. Computer Science, Programming & Artificial Intelligence
  {
    category: 'Computing',
    keywords: ['code', 'programming', 'javascript', 'python', 'algorithm', 'software', 'typescript', 'react', 'function', 'variable', 'data', 'backend', 'web', 'computer'],
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    caption: 'Software engineering, algorithmic structures, and computer science.',
  },
  {
    category: 'Computing',
    keywords: ['chip', 'microprocessor', 'semiconductor', 'hardware', 'cpu', 'silicon'],
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
    caption: 'Semiconductor integrated circuit architecture and microchip lithography.',
  },
  {
    category: 'Computing',
    keywords: ['data center', 'server', 'cloud', 'network', 'infrastructure', 'database'],
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80',
    caption: 'High-throughput cloud computing clusters and distributed server infrastructure.',
  },
  {
    category: 'Computing',
    keywords: ['ai', 'robotics', 'neural network', 'machine learning', 'automation', 'sensor'],
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
    caption: 'Artificial intelligence modeling, autonomous robotics, and neural computation.',
  },

  // 7. Mathematics, Geometry & Logic
  {
    category: 'Mathematics',
    keywords: ['math', 'calculus', 'geometry', 'equation', 'algebra', 'derivative', 'integral', 'matrix', 'theorem', 'number', 'statistic', 'probability', 'proof'],
    url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&auto=format&fit=crop&q=80',
    caption: 'Mathematical proofs, analytical equations, and geometric principles.',
  },
  {
    category: 'Mathematics',
    keywords: ['fractal', 'fibonacci', 'golden ratio', 'geometry', 'symmetry', 'pattern'],
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    caption: 'Geometric self-similarity, fractal recurrence, and recursive topology.',
  },
  {
    category: 'Mathematics',
    keywords: ['statistics', 'graph', 'chart', 'data', 'distribution', 'probability'],
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    caption: 'Statistical modeling, distribution density curves, and data analytics.',
  },

  // 8. Ancient Civilizations, History & Archaeology
  {
    category: 'History',
    keywords: ['history', 'war', 'revolution', 'ancient', 'empire', 'rome', 'greece', 'renaissance', 'century', 'dynasty', 'treaty', 'civilization', 'medieval', 'america', 'world war', 'archaeology', 'pyramid', 'pharaoh', 'colosseum'],
    url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1200&auto=format&fit=crop&q=80',
    caption: 'Historical milestones, world civilizations, and archival heritage.',
  },
  {
    category: 'History',
    keywords: ['egypt', 'pyramid', 'giza', 'pharaoh', 'nile', 'monument'],
    url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200&auto=format&fit=crop&q=80',
    caption: 'Ancient Old Kingdom monumental masonry and the Pyramids of Giza.',
  },
  {
    category: 'History',
    keywords: ['rome', 'colosseum', 'gladiator', 'roman empire', 'antiquity', 'forum'],
    url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&auto=format&fit=crop&q=80',
    caption: 'Classical Flavian Amphitheatre architecture and imperial Roman engineering.',
  },
  {
    category: 'History',
    keywords: ['greece', 'athens', 'parthenon', 'acropolis', 'classical', 'philosophy'],
    url: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&auto=format&fit=crop&q=80',
    caption: 'Classical Athenian Acropolis architecture and classical Greek antiquities.',
  },
  {
    category: 'History',
    keywords: ['castle', 'medieval', 'knight', 'fortress', 'feudal', 'middle ages'],
    url: 'https://images.unsplash.com/photo-1533158307587-828f0a76ef46?w=1200&auto=format&fit=crop&q=80',
    caption: 'High Medieval defensive fortification architecture and castle bastions.',
  },

  // 9. Geography, Geology & Earth Sciences
  {
    category: 'Earth',
    keywords: ['earth', 'geography', 'climate', 'ocean', 'volcano', 'atmosphere', 'ecosystem', 'weather', 'tectonic', 'river', 'mountain', 'nature', 'environmental', 'geology'],
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80',
    caption: 'Planetary ecosystems, geological dynamics, and physical geography.',
  },
  {
    category: 'Earth',
    keywords: ['volcano', 'lava', 'magma', 'geothermal', 'crust', 'eruption'],
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    caption: 'Igneous volcanology, plate boundary volcanism, and thermal magma systems.',
  },
  {
    category: 'Earth',
    keywords: ['ocean', 'marine', 'wave', 'sea', 'current', 'tide', 'abyss'],
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    caption: 'Oceanographic hydrodynamic circulation and coastal marine environments.',
  },
  {
    category: 'Earth',
    keywords: ['glacier', 'arctic', 'ice', 'polar', 'climate change', 'antarctica'],
    url: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1200&auto=format&fit=crop&q=80',
    caption: 'Polar cryosphere dynamics, glacial calving, and high-latitude climate monitoring.',
  },
  {
    category: 'Earth',
    keywords: ['canyon', 'strata', 'rock', 'sediment', 'erosion', 'fault'],
    url: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=1200&auto=format&fit=crop&q=80',
    caption: 'Sedimentary stratigraphic deposition and continental fluvial erosion.',
  },

  // 10. Literature, Philosophy & Linguistics
  {
    category: 'Literature',
    keywords: ['literature', 'poetry', 'novel', 'author', 'shakespeare', 'book', 'writing', 'philosophy', 'metaphor', 'drama', 'fiction', 'language', 'linguistics', 'ethics'],
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=80',
    caption: 'Classical literature, philosophical thought, and literary rhetoric.',
  },
  {
    category: 'Literature',
    keywords: ['library', 'books', 'archive', 'scholar', 'study', 'manuscript'],
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&auto=format&fit=crop&q=80',
    caption: 'Scholarly archival research, classical codices, and historical manuscripts.',
  },
  {
    category: 'Literature',
    keywords: ['statue', 'sculpture', 'philosophy', 'thinker', 'dialectic', 'epistemology'],
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80',
    caption: 'Philosophical inquiry, ethical rationalism, and intellectual discourse.',
  },

  // 11. Visual Arts, Architecture & Design
  {
    category: 'Art',
    keywords: ['art', 'music', 'painting', 'design', 'sculpture', 'color', 'composition', 'harmony', 'architecture', 'orchestra', 'film', 'renaissance art'],
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80',
    caption: 'Visual arts, compositional design, and creative culture.',
  },
  {
    category: 'Art',
    keywords: ['architecture', 'building', 'modernist', 'cathedral', 'structure', 'facade'],
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    caption: 'Monumental structural architecture, cantilevered spatial design, and proportions.',
  },
  {
    category: 'Art',
    keywords: ['sculpture', 'marble', 'classical art', 'museum', 'renaissance'],
    url: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=1200&auto=format&fit=crop&q=80',
    caption: 'Classical figurative sculpture, marble chiseling, and anatomical proportioning.',
  },

  // 12. Economics, Commerce & Global Trade
  {
    category: 'Economics',
    keywords: ['business', 'finance', 'economy', 'market', 'money', 'trade', 'management', 'investment', 'banking', 'supply', 'startup', 'inflation', 'gdp'],
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    caption: 'Financial economics, market trading, and global commerce.',
  },
  {
    category: 'Economics',
    keywords: ['trade', 'shipping', 'cargo', 'logistics', 'port', 'freight'],
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
    caption: 'Global container logistics, maritime supply chains, and international commerce.',
  },
  {
    category: 'Economics',
    keywords: ['banking', 'currency', 'capital', 'exchange', 'macroeconomics'],
    url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
    caption: 'Monetary capital assets, institutional exchange mechanisms, and liquidity.',
  },

  // 13. Engineering, Robotics & Applied Technology
  {
    category: 'Engineering',
    keywords: ['engineering', 'bridge', 'structure', 'aerospace', 'turbine', 'energy', 'solar', 'wind'],
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&auto=format&fit=crop&q=80',
    caption: 'Renewable energy engineering, photovoltaic systems, and clean infrastructure.',
  },
  {
    category: 'Engineering',
    keywords: ['bridge', 'civil engineering', 'suspension', 'steel', 'concrete'],
    url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&auto=format&fit=crop&q=80',
    caption: 'Civil engineering structural dynamics, tension cable load, and span mechanics.',
  },
];

// Rich fallback collection across academic & intellectual domains for general use
export const GENERAL_FALLBACK_ASSETS: Array<{ url: string; caption: string }> = [
  {
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
    caption: 'Interactive conceptual analysis and cognitive evaluation.',
  },
  {
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80',
    caption: 'Analytical assessment, focused inquiry, and structured recall.',
  },
  {
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1200&auto=format&fit=crop&q=80',
    caption: 'Academic research, foundational concepts, and knowledge retention.',
  },
  {
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80',
    caption: 'Curriculum development, systematic study, and pedagogical review.',
  },
  {
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80',
    caption: 'Scientific discovery, empirical analysis, and laboratory verification.',
  },
  {
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80',
    caption: 'Strategic reasoning, critical evaluation, and analytical methodology.',
  },
  {
    url: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=1200&auto=format&fit=crop&q=80',
    caption: 'Cognitive active recall, problem synthesis, and mastery practice.',
  },
  {
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&auto=format&fit=crop&q=80',
    caption: 'Adaptive learning frameworks, subject literacy, and intellectual growth.',
  },
];

/**
 * Resolves a high-quality educational image from the curated library matching the context.
 * Computes a weighted relevance score based on keyword overlap, prioritizing hyper-specific matches,
 * intelligently rotating images, and avoiding duplicate URLs if usedUrls set is supplied.
 */
export function resolveThematicVisual(
  contextText: string,
  index = 0,
  usedUrls?: Set<string>
): { url: string; caption: string; layout: 'top' | 'left' | 'split' } {
  const lower = (contextText || '').toLowerCase();
  const layouts: Array<'top' | 'left' | 'split'> = ['top', 'left', 'split'];
  const layout = layouts[index % layouts.length];

  // 1. Calculate relevance score for each asset based on keyword matches
  const scoredAssets = THEMATIC_VISUAL_ASSETS.map((asset) => {
    let score = 0;
    for (const keyword of asset.keywords) {
      if (lower.includes(keyword)) {
        // Multi-word phrase matches carry much higher pedagogical specificity
        score += keyword.includes(' ') ? 12 : 3;
      }
    }
    return { asset, score };
  }).filter((item) => item.score > 0);

  // Sort descending by highest score
  scoredAssets.sort((a, b) => b.score - a.score);

  if (scoredAssets.length > 0) {
    // If usedUrls provided, prioritize top-ranked assets not yet used in this quiz
    if (usedUrls) {
      for (const item of scoredAssets) {
        if (!usedUrls.has(item.asset.url)) {
          usedUrls.add(item.asset.url);
          return { url: item.asset.url, caption: item.asset.caption, layout };
        }
      }
    }

    // Otherwise pick from the top-scoring tier (top 3 highest scores) rotated by index
    const topScore = scoredAssets[0].score;
    const topTier = scoredAssets.filter((item) => item.score >= Math.max(3, topScore * 0.7));
    const chosen = topTier[index % topTier.length].asset;
    if (usedUrls) usedUrls.add(chosen.url);
    return {
      url: chosen.url,
      caption: chosen.caption,
      layout,
    };
  }

  // 2. Fallback to broad general academic collection
  if (usedUrls) {
    for (let i = 0; i < GENERAL_FALLBACK_ASSETS.length; i++) {
      const candidate = GENERAL_FALLBACK_ASSETS[(index + i) % GENERAL_FALLBACK_ASSETS.length];
      if (!usedUrls.has(candidate.url)) {
        usedUrls.add(candidate.url);
        return { url: candidate.url, caption: candidate.caption, layout };
      }
    }
  }

  const chosen = GENERAL_FALLBACK_ASSETS[index % GENERAL_FALLBACK_ASSETS.length];
  if (usedUrls) usedUrls.add(chosen.url);
  return {
    url: chosen.url,
    caption: chosen.caption,
    layout,
  };
}
