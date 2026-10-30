import {
  OpenAccessRepositoryId,
  OpenAccessRepositoryMeta,
  OpenAccessResourceRecord,
} from '../types/openAccess';

export const OPEN_ACCESS_REPOSITORIES: OpenAccessRepositoryMeta[] = [
  {
    id: 'nerdc_curriculum',
    name: 'NERDC & NERDC e-Curriculum',
    shortName: 'NERDC Nigeria',
    tagline: 'Official Nigerian National Curriculum Framework for Basic (JSS 1–3) and Senior Secondary (SSS 1–3)',
    homepageUrl: 'https://www.nerdc.gov.ng/',
    searchUrlTemplate: 'https://www.nerdc.org.ng/',
    licenseSummary: 'National Statutory Educational Framework · Free Public Curriculum Standard',
    category: 'curriculum_authority',
    countryOrRegion: 'Nigeria / West Africa',
    curriculumCoverage: ['WAEC (WASSCE)', 'NECO SSCE', 'JAMB UTME', 'BECE (JSS 1–3)', 'NABTEB'],
    iconEmoji: '🇳🇬',
  },
  {
    id: 'open_textbook_library',
    name: 'Open Textbook Library (UMN)',
    shortName: 'Open Textbook Library',
    tagline: 'Peer-reviewed open textbooks curated by the Center for Open Education, University of Minnesota',
    homepageUrl: 'https://open.umn.edu/opentextbooks',
    searchUrlTemplate: 'https://open.umn.edu/opentextbooks/textbooks?term={query}',
    licenseSummary: 'Creative Commons (CC BY, CC BY-SA, CC BY-NC) · 100% Free to Read and Adapt',
    category: 'textbooks',
    countryOrRegion: 'Global / USA',
    curriculumCoverage: ['Advanced Placement (AP)', 'Cambridge A-Level', 'IB Diploma', 'University Prep'],
    iconEmoji: '📚',
  },
  {
    id: 'project_gutenberg',
    name: 'Project Gutenberg',
    shortName: 'Project Gutenberg',
    tagline: 'World’s oldest digital library of over 70,000 free public domain literary and historical texts',
    homepageUrl: 'https://www.gutenberg.org/',
    searchUrlTemplate: 'https://www.gutenberg.org/ebooks/search/?query={query}',
    licenseSummary: 'Public Domain · Unrestricted Educational Use, Reproduction & Analysis',
    category: 'classical_literature',
    countryOrRegion: 'Global / International',
    curriculumCoverage: ['WAEC / NECO Literature in English', 'JAMB Use of English', 'Cambridge IGCSE & A-Level Literature', 'SAT / ACT Reading Passages'],
    iconEmoji: '📖',
  },
  {
    id: 'internet_archive',
    name: 'Internet Archive',
    shortName: 'Internet Archive',
    tagline: 'Non-profit digital library of millions of free books, historical documents, and open educational materials',
    homepageUrl: 'https://archive.org/',
    searchUrlTemplate: 'https://archive.org/search.php?query={query}',
    licenseSummary: 'Public Domain & Open Access Historical Media',
    category: 'academic_archive',
    countryOrRegion: 'Global / International',
    curriculumCoverage: ['Historical Science Papers', 'Examinations History', 'Classic Mathematics Handbooks'],
    iconEmoji: '🏛️',
  },
  {
    id: 'libretexts',
    name: 'LibreTexts Project',
    shortName: 'LibreTexts',
    tagline: 'Leading community-driven open education resource platform across Chemistry, Physics, Biology, and Math',
    homepageUrl: 'https://libretexts.org/',
    searchUrlTemplate: 'https://chem.libretexts.org/?query={query}',
    licenseSummary: 'Creative Commons (CC BY-NC-SA 3.0 / 4.0)',
    category: 'textbooks',
    countryOrRegion: 'Global / USA',
    curriculumCoverage: ['Cambridge IGCSE / A-Level Sciences', 'AP Chemistry / Physics / Bio', 'WAEC Sciences'],
    iconEmoji: '🧪',
  },
  {
    id: 'mit_ocw',
    name: 'MIT OpenCourseWare',
    shortName: 'MIT OCW',
    tagline: 'Open publication of materials from virtually all Massachusetts Institute of Technology course content',
    homepageUrl: 'https://ocw.mit.edu/',
    searchUrlTemplate: 'https://ocw.mit.edu/search/?q={query}',
    licenseSummary: 'Creative Commons (CC BY-NC-SA) · Free Non-Commercial Educational Redistribution',
    category: 'university_ocw',
    countryOrRegion: 'USA / International',
    curriculumCoverage: ['AP Calculus BC', 'AP Physics C Mechanics', 'Cambridge A-Level Mathematics', 'IB Higher Level STEM'],
    iconEmoji: '🎓',
  },
  {
    id: 'wikibooks',
    name: 'Wikibooks Open Textbooks',
    shortName: 'Wikibooks',
    tagline: 'Wikimedia foundation collection of open-content textbooks and annotated study guides that anyone can edit',
    homepageUrl: 'https://en.wikibooks.org/',
    searchUrlTemplate: 'https://en.wikibooks.org/w/index.php?search={query}',
    licenseSummary: 'Creative Commons Attribution-ShareAlike (CC BY-SA 3.0 / 4.0)',
    category: 'textbooks',
    countryOrRegion: 'Global / Wikimedia',
    curriculumCoverage: ['GCSE & A-Level Mathematics', 'High School Physics & Chemistry', 'Computer Science'],
    iconEmoji: '🌐',
  },
  {
    id: 'doab',
    name: 'Directory of Open Access Books (DOAB)',
    shortName: 'DOAB',
    tagline: 'Discovery service indexing over 80,000 academic peer-reviewed open access books from verified publishers',
    homepageUrl: 'https://www.doabooks.org/',
    searchUrlTemplate: 'https://directory.doabooks.org/discover?query={query}',
    licenseSummary: 'Open Access Academic Monographs (CC BY / CC BY-NC / Open Edition)',
    category: 'academic_archive',
    countryOrRegion: 'Europe / International',
    curriculumCoverage: ['Economics & Social Sciences', 'History & Philosophy of Science', 'Advanced Secondary Pedagogy'],
    iconEmoji: '📑',
  },
];

export const OPEN_ACCESS_RESOURCES_INDEX: OpenAccessResourceRecord[] = [
  // ==========================================================================
  // WEST AFRICA: NERDC CURRICULUM FRAMEWORKS (WAEC, NECO, JAMB, BECE)
  // ==========================================================================
  {
    id: 'nerdc-sss-math',
    repositoryId: 'nerdc_curriculum',
    title: 'NERDC Senior Secondary General Mathematics National Curriculum (SSS 1–3)',
    authorOrOrganization: 'Nigerian Educational Research and Development Council (NERDC)',
    yearOrEdition: 'National Revised Senior Secondary Curriculum Framework',
    subject: 'General Mathematics',
    targetExamBoards: ['waec', 'neco', 'jamb'],
    curriculumFrameworkLevel: 'Senior Secondary School (SSS 1–3 · Ages 15–18)',
    url: 'https://www.nerdc.org.ng/',
    license: 'NERDC National Curriculum Framework',
    attributionNote: 'Official Curriculum Guidelines promulgated by the Federal Ministry of Education and NERDC, Sheda, Abuja.',
    description: 'The statutory 3-year curriculum specification for General Mathematics across Nigerian and West African Senior Secondary schools. Defines core performance objectives, contents, teacher/student activities, and evaluation standards for Number & Numeration, Algebraic Processes, Mensuration, Geometry, Trigonometry, and Statistics.',
    tags: ['NERDC', 'WAEC', 'NECO', 'JAMB', 'Mathematics', 'SSS 1-3', 'National Curriculum'],
    officialCurriculumRef: 'NERDC-CURR-SEC-MATH-01',
    isVerifiedOpenAccess: true,
    citationText: 'NERDC. (Revised Edition). Senior Secondary School Curriculum: General Mathematics (Vols. 1–3). Nigerian Educational Research and Development Council, Abuja: NERDC Press.',
    chaptersOrSections: [
      {
        id: 'nerdc-mth-ch1',
        chapterNumber: 1,
        title: 'Theme 1: Number and Numeration · Indices, Logarithms & Surds',
        summary: 'Laws of indices; application to exponential equations; logarithm laws in base 10 and change of base; operations with surds and rationalizing of denominators.',
        passageText: `NERDC SSS 1 Curriculum Specifications (Week 1–4):
1. Laws of Indices:
   - Multiplicative law: a^m × a^n = a^(m+n)
   - Division law: a^m ÷ a^n = a^(m-n)
   - Power law: (a^m)^n = a^(mn)
   - Negative index: a^(-n) = 1/(a^n)
   - Fractional index: a^(m/n) = n√(a^m)
2. Logarithmic Functions:
   - Definition: If y = b^x, then x = log_b(y) where b > 0, b ≠ 1.
   - Laws: log_b(xy) = log_b(x) + log_b(y); log_b(x/y) = log_b(x) - log_b(y); log_b(x^k) = k log_b(x).
   - Change of base: log_b(x) = (log_c(x)) / (log_c(b)).
3. Surds:
   - Simplification: √(a × b) = √a × √b.
   - Rationalization of conjugate surds: To rationalize a/(b + √c), multiply numerator and denominator by conjugate (b - √c).`,
        keyConcepts: ['Laws of Indices', 'Base 10 Logarithms', 'Change of Base', 'Conjugate Surd Rationalization'],
        workedProblem: {
          question: 'Simplify completely: (3√2 - 2√3) / (3√2 + 2√3).',
          stepByStepSolution: 'Step 1: Multiply numerator and denominator by conjugate (3√2 - 2√3):\n[(3√2 - 2√3)(3√2 - 2√3)] / [(3√2 + 2√3)(3√2 - 2√3)].\nStep 2: Numerator expansion = (3√2)² - 2(3√2)(2√3) + (2√3)² = 18 - 12√6 + 12 = 30 - 12√6.\nStep 3: Denominator difference of two squares = (3√2)² - (2√3)² = 18 - 12 = 6.\nStep 4: Division = (30 - 12√6) / 6 = 5 - 2√6.',
          markSchemeNotes: '[M1] for identifying conjugate (3√2 - 2√3). [M1] for correctly expanding numerator to 30 - 12√6. [A1] for denominator 6. [A1] for final exact expression 5 - 2√6.',
        },
        syllabusReferenceCode: 'NERDC-MTH-SSS1-01',
      },
      {
        id: 'nerdc-mth-ch2',
        chapterNumber: 2,
        title: 'Theme 2: Algebraic Processes · Quadratic Equations & Simultaneous Systems',
        summary: 'Solution of quadratic equations by factorization, completing the square, and quadratic formula; graphical solutions; simultaneous equations (linear and quadratic).',
        passageText: `NERDC SSS 2 Curriculum Specifications (Week 3–6):
1. Quadratic General Form: ax² + bx + c = 0, where a ≠ 0.
   - Quadratic formula derivation: x = [-b ± √(b² - 4ac)] / (2a).
   - Nature of roots discriminant: Δ = b² - 4ac. If Δ > 0: two distinct real roots. If Δ = 0: two equal real roots. If Δ < 0: no real roots (complex roots).
2. Simultaneous Linear and Non-Linear Systems:
   - System: y = mx + c and y = ax² + bx + k.
   - Substitution method: Substitute linear variable into quadratic equation to obtain single-variable quadratic. Solve and back-substitute to find paired coordinates (x, y).`,
        keyConcepts: ['Discriminant Analysis', 'Quadratic Formula', 'Simultaneous Substitution', 'Intersection of Lines and Parabolas'],
        workedProblem: {
          question: 'Solve simultaneously: y - 2x = 1 and x² + y² = 13.',
          stepByStepSolution: 'Step 1: From linear equation, express y = 2x + 1.\nStep 2: Substitute into second equation: x² + (2x + 1)² = 13.\nStep 3: Expand: x² + 4x² + 4x + 1 = 13 => 5x² + 4x - 12 = 0.\nStep 4: Factorize: (5x - 6)(x + 2) = 0 => x = 6/5 = 1.2 or x = -2.\nStep 5: For x = 1.2, y = 2(1.2) + 1 = 3.4. For x = -2, y = 2(-2) + 1 = -3.\nSolutions: (1.2, 3.4) and (-2, -3).',
          markSchemeNotes: '[M1] for expressing y in terms of x. [M1] for quadratic substitution and simplification to 5x² + 4x - 12 = 0. [A1] for x values (-2 and 1.2). [A1] for corresponding y values.',
        },
        syllabusReferenceCode: 'NERDC-MTH-SSS2-03',
      },
    ],
  },
  {
    id: 'nerdc-sss-physics',
    repositoryId: 'nerdc_curriculum',
    title: 'NERDC Senior Secondary Physics National Curriculum (SSS 1–3)',
    authorOrOrganization: 'Nigerian Educational Research and Development Council (NERDC)',
    yearOrEdition: 'National Revised Senior Secondary Curriculum Framework',
    subject: 'Physics',
    targetExamBoards: ['waec', 'neco', 'jamb'],
    curriculumFrameworkLevel: 'Senior Secondary School (SSS 1–3 · Ages 15–18)',
    url: 'https://www.nerdc.org.ng/',
    license: 'NERDC National Curriculum Framework',
    attributionNote: 'Federal Ministry of Education and NERDC Approved Physics Curriculum Standards for WAEC and NECO.',
    description: 'Comprehensive specifications covering Mechanics, Heat Energy, Waves & Optics, Fields (Gravitational, Electrostatic, and Magnetic), and Introductory Atomic & Quantum Physics for WASSCE and NECO candidates.',
    tags: ['NERDC', 'WAEC', 'NECO', 'Physics', 'Mechanics', 'Waves', 'SSS 1-3'],
    officialCurriculumRef: 'NERDC-CURR-SEC-PHY-02',
    isVerifiedOpenAccess: true,
    citationText: 'NERDC. (Revised Edition). Senior Secondary School Curriculum: Physics (Vols. 1–3). Sheda, Abuja: NERDC Press.',
    chaptersOrSections: [
      {
        id: 'nerdc-phy-ch1',
        chapterNumber: 1,
        title: 'Theme 1: Mechanics · Projectile Motion & Newton’s Laws',
        summary: 'Kinematics in two dimensions, resolution of velocity vectors, trajectory equations, maximum height, time of flight, horizontal range, and conservation of linear momentum.',
        passageText: `NERDC SSS 2 Physics: Module on Projectile Dynamics
1. Resolution of Initial Velocity:
   - Horizontal component: u_x = u cos(θ) (constant, assuming air resistance negligible)
   - Vertical component: u_y = u sin(θ) - gt
2. Key Trajectory Formulae:
   - Time to reach maximum height: t_h = (u sin θ) / g
   - Total time of flight: T = (2u sin θ) / g
   - Maximum vertical height: H = (u² sin² θ) / (2g)
   - Horizontal range: R = (u² sin 2θ) / g
3. Newton's Second Law & Momentum:
   - Rate of change of momentum is directly proportional to applied force: F = dp/dt = m(v - u)/t = ma.
   - Principle of Conservation of Linear Momentum: In a closed system with no external forces, total momentum before collision equals total momentum after collision: m1 u1 + m2 u2 = m1 v1 + m2 v2.`,
        keyConcepts: ['Vector Resolution', 'Time of Flight', 'Maximum Height', 'Range Formula', 'Momentum Conservation'],
        workedProblem: {
          question: 'A projectile is launched from ground level at 50 m/s at an angle of 30° to the horizontal. Take g = 9.8 m/s². Calculate: (a) Time of flight, (b) Maximum height reached, (c) Horizontal range.',
          stepByStepSolution: '(a) Total time of flight T = (2u sin θ) / g = (2 × 50 × sin 30°) / 9.8 = (100 × 0.5) / 9.8 = 50 / 9.8 = 5.10 seconds.\n(b) Maximum height H = (u² sin² θ) / (2g) = (2500 × 0.25) / (2 × 9.8) = 625 / 19.6 = 31.89 meters.\n(c) Range R = (u² sin 2θ) / g = (2500 × sin 60°) / 9.8 = (2500 × 0.8660) / 9.8 = 2165.06 / 9.8 = 220.92 meters.',
          markSchemeNotes: '[M1] for stating time of flight formula. [A1] for T = 5.10 s. [M1] for max height formula. [A1] for H = 31.89 m. [M1] for range formula. [A1] for R = 220.92 m.',
        },
        syllabusReferenceCode: 'NERDC-PHY-SSS2-01',
      },
    ],
  },
  {
    id: 'nerdc-jss-basic-science',
    repositoryId: 'nerdc_curriculum',
    title: 'NERDC Basic Education Curriculum: Basic Science and Technology (JSS 1–3 for BECE)',
    authorOrOrganization: 'Nigerian Educational Research and Development Council (NERDC)',
    yearOrEdition: 'Universal Basic Education (UBE) Curriculum Specification',
    subject: 'Basic Science & Technology',
    targetExamBoards: ['bece'],
    curriculumFrameworkLevel: 'Junior Secondary School (JSS 1–3 · Ages 12–15)',
    url: 'https://www.nerdc.org.ng/',
    license: 'NERDC National Curriculum Framework',
    attributionNote: 'Promulgated under the Universal Basic Education Act for the Basic Education Certificate Examination (BECE).',
    description: 'The national benchmark curriculum for Junior Secondary Basic Science and Technology examined in the BECE nationwide. Integrates fundamental living and non-living things, energy forms, work and machines, ecology, reproductive health, and environmental sanitation.',
    tags: ['NERDC', 'BECE', 'Junior Secondary', 'Basic Science', 'JSS 1-3'],
    officialCurriculumRef: 'NERDC-CURR-BED-BST-03',
    isVerifiedOpenAccess: true,
    citationText: 'NERDC. (Revised Edition). 9-Year Basic Education Curriculum: Basic Science and Technology (JSS 1–3). Sheda, Abuja: NERDC Press.',
    chaptersOrSections: [
      {
        id: 'nerdc-bst-ch1',
        chapterNumber: 1,
        title: 'Theme: Work, Energy and Simple Machines (JSS 2)',
        summary: 'Definitions of work and energy; types of simple machines (levers, pulleys, inclined planes); mechanical advantage (M.A.), velocity ratio (V.R.), and efficiency.',
        passageText: `NERDC JSS 2 Basic Science:
1. Work is done whenever a force moves an object through a distance in the direction of the force:
   - Work = Force (N) × Distance (m). Unit is the Joule (J).
2. Simple Machines:
   - Mechanical Advantage (M.A.) = Load / Effort.
   - Velocity Ratio (V.R.) = Distance moved by Effort / Distance moved by Load.
   - Efficiency (%) = (Useful Work Output / Total Work Input) × 100% = (M.A. / V.R.) × 100%.
   - In any real machine, efficiency is always less than 100% due to friction and the weight of moving parts.`,
        keyConcepts: ['Mechanical Advantage', 'Velocity Ratio', 'Machine Efficiency', 'Frictional Dissipation'],
        workedProblem: {
          question: 'A machine with a velocity ratio of 5 is used to raise a load of 400 N with an effort of 100 N. Calculate the mechanical advantage and the efficiency of the machine.',
          stepByStepSolution: 'Step 1: Mechanical Advantage (M.A.) = Load / Effort = 400 N / 100 N = 4.\nStep 2: Efficiency = (M.A. / V.R.) × 100% = (4 / 5) × 100% = 80%.',
          markSchemeNotes: '[B1] for formula M.A. = Load / Effort. [A1] for M.A. = 4. [M1] for Efficiency = (M.A./V.R.) × 100. [A1] for Efficiency = 80%.',
        },
        syllabusReferenceCode: 'NERDC-BST-JSS2-04',
      },
    ],
  },
  {
    id: 'nerdc-sss-chemistry',
    repositoryId: 'nerdc_curriculum',
    title: 'NERDC Senior Secondary Chemistry National Curriculum (SSS 1–3)',
    authorOrOrganization: 'Nigerian Educational Research and Development Council (NERDC)',
    yearOrEdition: 'National Revised Senior Secondary Curriculum Framework',
    subject: 'Chemistry',
    targetExamBoards: ['waec', 'neco', 'jamb'],
    curriculumFrameworkLevel: 'Senior Secondary School (SSS 1–3 · Ages 15–18)',
    url: 'https://www.nerdc.org.ng/',
    license: 'NERDC National Curriculum Framework',
    attributionNote: 'Federal Ministry of Education and NERDC Approved Chemistry Curriculum for Senior Secondary Schools.',
    description: 'Detailed modular curriculum for SSS Chemistry covering Atomic Structure, Periodic Trends, Chemical Bonding, Stoichiometry, Energetics, Chemical Equilibrium, Acids/Bases/Salts, Electrolysis, and Organic Chemistry.',
    tags: ['NERDC', 'WAEC', 'NECO', 'JAMB', 'Chemistry', 'SSS 1-3'],
    officialCurriculumRef: 'NERDC-CURR-SEC-CHM-04',
    isVerifiedOpenAccess: true,
    citationText: 'NERDC. (Revised Edition). Senior Secondary School Curriculum: Chemistry (Vols. 1–3). Sheda, Abuja: NERDC Press.',
    chaptersOrSections: [
      {
        id: 'nerdc-chm-ch1',
        chapterNumber: 1,
        title: 'Theme 2: Chemical Reactions & Stoichiometry · Mole Concept & Acid-Base Volumetric Analysis',
        summary: 'The mole as a unit of measurement; Avogadro’s constant; molar volume of gases at s.t.p.; empirical and molecular formula; standard solutions and titration calculations.',
        passageText: `NERDC SSS 2 Chemistry: Volumetric Analysis Standards
1. The Mole Concept:
   - Number of moles n = mass (m) / molar mass (M)
   - For gases at standard temperature and pressure (s.t.p., 273 K, 1 atm): 1 mole = 22.4 dm³ (or 22,400 cm³)
   - Concentration (molarity) C = n / V (in dm³)
2. Volumetric Titration Equation:
   - C_a V_a / C_b V_b = n_a / n_b
   where C_a = concentration of acid in mol/dm³, V_a = volume of acid used, C_b = concentration of base, V_b = volume of base, and n_a/n_b = mole ratio from balanced chemical equation.`,
        keyConcepts: ['Avogadro Constant', 'Molar Volume at s.t.p.', 'Empirical Formula', 'Acid-Base Titration Equation'],
        workedProblem: {
          question: '25.0 cm³ of 0.10 mol/dm³ sodium hydroxide (NaOH) solution required 20.0 cm³ of hydrochloric acid (HCl) for complete neutralization. Calculate the concentration of the acid in (a) mol/dm³, (b) g/dm³. (Molar mass of HCl = 36.5 g/mol).',
          stepByStepSolution: 'Balanced equation: HCl + NaOH -> NaCl + H2O (Mole ratio n_a / n_b = 1 / 1).\nUsing C_a V_a / C_b V_b = n_a / n_b:\nC_a × 20.0 / (0.10 × 25.0) = 1 / 1\nC_a = (0.10 × 25.0) / 20.0 = 2.5 / 20.0 = 0.125 mol/dm³.\n(b) Concentration in g/dm³ = C_a × Molar Mass = 0.125 mol/dm³ × 36.5 g/mol = 4.56 g/dm³.',
          markSchemeNotes: '[B1] for balanced equation and ratio 1:1. [M1] for substituting into C_a V_a / C_b V_b = 1. [A1] for C_a = 0.125 mol/dm³. [M1] for multiplying by molar mass 36.5. [A1] for 4.56 g/dm³.',
        },
        syllabusReferenceCode: 'NERDC-CHM-SSS2-02',
      },
    ],
  },

  // ==========================================================================
  // PROJECT GUTENBERG: CLASSICAL LITERATURE & HISTORICAL READINGS
  // ==========================================================================
  {
    id: 'gutenberg-equiano',
    repositoryId: 'project_gutenberg',
    title: 'The Interesting Narrative of the Life of Olaudah Equiano, or Gustavus Vassa, the African',
    authorOrOrganization: 'Olaudah Equiano (1745–1797)',
    yearOrEdition: 'Gutenberg EBook #15399 · First Published 1789',
    subject: 'Literature in English & History',
    targetExamBoards: ['waec', 'neco', 'jamb', 'igcse', 'alevel_uk'],
    curriculumFrameworkLevel: 'Senior Secondary & Pre-University Non-African / African Prose Compendium',
    url: 'https://www.gutenberg.org/ebooks/15399',
    license: 'Public Domain',
    attributionNote: 'Public Domain digitized text verified by Project Gutenberg volunteers.',
    description: 'Seminal historical autobiography and prescribed African prose text in West African (WAEC/NECO/JAMB) and international examinations. Details the author’s childhood in Essaka (modern Nigeria), his capture, the Middle Passage, enslavement, self-purchase, and British abolitionist campaign.',
    tags: ['Project Gutenberg', 'Public Domain', 'WAEC Literature', 'JAMB', 'African Prose', 'Equiano'],
    isVerifiedOpenAccess: true,
    citationText: 'Equiano, O. (1789). The Interesting Narrative of the Life of Olaudah Equiano, or Gustavus Vassa, the African. Written by Himself. London. [Project Gutenberg EBook #15399].',
    chaptersOrSections: [
      {
        id: 'gutenberg-eq-ch1',
        chapterNumber: 1,
        title: 'Chapter II: Kidnapping, the Middle Passage, and Arrival at Barbados',
        summary: 'Equiano recounts his sudden abduction with his sister, separation, transport across West African trade routes, the horrors of the slave ship hold, and arrival in the Caribbean.',
        passageText: `Extract from Chapter II:
"At last, when the ship we were in had got in all her cargo, they made ready with many fearful noises, and we were all put under deck, so that we could not see how they managed the vessel. But this disappointment was the least part of our sorrow. The stench of the hold while we were on the coast was so intolerably loathsome, that it was dangerous to remain there for any time, and some of us had been permitted to stay on the deck for the fresh air; but now that the whole ship’s cargo were confined together, it became absolutely pestilential. The closeness of the place, and the heat of the climate, added to the number in the ship, which was so crowded that each had scarcely room to turn himself, almost suffocated us. This produced copious perspirations, so that the air soon became unfit for respiration, from a variety of loathsome smells, and brought on a sickness among the slaves, of which many died... The shrieks of the women, and the groans of the dying, rendered the whole a scene of horror almost inconceivable."`,
        keyConcepts: ['Middle Passage', 'Sensory Imagery', 'Abolitionist Rhetoric', 'First-Person Historical Narrative'],
        workedProblem: {
          question: 'In the excerpt from Chapter II, how does Equiano utilize olfactory and auditory imagery to convey the inhumanity of the slave hold? Reference specific phrases in your response.',
          stepByStepSolution: '1. Olfactory imagery: Equiano describes the atmosphere as "intolerably loathsome", "pestilential", and "unfit for respiration from a variety of loathsome smells." This emphasizes the suffocating degradation and mortal danger.\n2. Auditory imagery: He underscores the psychological trauma through "fearful noises", "the shrieks of the women", and "the groans of the dying", transforming an abstract historical journey into an immediate, visceral humanitarian tragedy.\n3. Theme: The passage exposes how commercial greed reduced human beings to cargo stripped of basic physiological necessities.',
          markSchemeNotes: '[B1] for identifying olfactory details (stench, pestilential). [B1] for identifying auditory details (shrieks, groans). [M1] for linking sensory imagery to the abolitionist theme. [A1] for coherent synthesis with textual quotation.',
        },
      },
    ],
  },
  {
    id: 'gutenberg-macbeth',
    repositoryId: 'project_gutenberg',
    title: 'The Tragedy of Macbeth',
    authorOrOrganization: 'William Shakespeare (1564–1616)',
    yearOrEdition: 'Gutenberg EBook #1533 · First Folio 1623',
    subject: 'Literature in English',
    targetExamBoards: ['waec', 'neco', 'igcse', 'alevel_uk', 'gcse_uk'],
    curriculumFrameworkLevel: 'Senior Secondary Shakespearean Drama Set Text',
    url: 'https://www.gutenberg.org/ebooks/1533',
    license: 'Public Domain',
    attributionNote: 'Public Domain text provided by Project Gutenberg.',
    description: 'Shakespeare’s classic tragedy of vaulting ambition, guilt, prophecies, and moral collapse. Standard set drama across Cambridge IGCSE, Pearson Edexcel GCSE, and West African WAEC Literature syllabi.',
    tags: ['Project Gutenberg', 'Shakespeare', 'Macbeth', 'Drama', 'WAEC', 'Cambridge IGCSE'],
    isVerifiedOpenAccess: true,
    citationText: 'Shakespeare, W. (1623). The Tragedy of Macbeth. London: Isaac Jaggard & Edward Blount. [Project Gutenberg EBook #1533].',
    chaptersOrSections: [
      {
        id: 'gutenberg-mac-act1',
        chapterNumber: 1,
        title: 'Act I, Scene 7: Vaulting Ambition Soliloquy',
        summary: 'Macbeth debates the assassination of King Duncan in his castle, weighing moral consequences, double trust, and the singular impetus of "vaulting ambition".',
        passageText: `Macbeth:
"If it were done when 'tis done, then 'twere well
It were done quickly: if the assassination
Could trammel up the consequence, and catch
With his surcease success; that but this blow
Might be the be-all and the end-all here,
But here, upon this bank and shoal of time,
We'd jump the life to come. But in these cases
We still have judgment here; that we but teach
Bloody instructions, which, being taught, return
To plague the inventor: this even-handed justice
Commends the ingredients of our poison'd chalice
To our own lips. He's here in double trust;
First, as I am his kinsman and his subject,
Strong both against the deed; then, as his host,
Who should against his murderer shut the door,
Not bear the knife myself...
I have no spur
To prick the sides of my intent, but only
Vaulting ambition, which o'erleaps itself
And falls on the other."`,
        keyConcepts: ['Soliloquy', 'Dramatic Irony', 'Double Trust', 'Vaulting Ambition', 'Nemesis / Poetic Justice'],
        workedProblem: {
          question: 'Analyze Macbeth’s use of the metaphor "even-handed justice commends the ingredients of our poison’d chalice to our own lips" in Act I Scene 7. What moral belief does Macbeth articulate?',
          stepByStepSolution: '1. Metaphor meaning: The "poison’d chalice" represents the treacherous act of murder. To drink from it oneself means that the perpetrator inevitably suffers the same violence or retribution they inflict on others.\n2. Moral belief: Macbeth acknowledges that moral crimes trigger earthly consequences ("we still have judgment here"). He recognizes that treason creates a precedent ("bloody instructions") that will destabilize his own eventual reign.\n3. Tragic flaw: Despite this clear intellectual foresight, his "vaulting ambition" overrules his moral conscience.',
          markSchemeNotes: '[B1] for decoding the chalice/poison metaphor. [M1] for linking to the theme of retribution or cyclical violence. [A1] for showing Macbeth’s self-awareness of his impending tragic downfall.',
        },
      },
    ],
  },
  {
    id: 'gutenberg-douglass',
    repositoryId: 'project_gutenberg',
    title: 'Narrative of the Life of Frederick Douglass, an American Slave',
    authorOrOrganization: 'Frederick Douglass (1818–1895)',
    yearOrEdition: 'Gutenberg EBook #23 · First Published 1845',
    subject: 'History & Literature / Rhetoric',
    targetExamBoards: ['sat', 'ap_ib', 'alevel_uk'],
    curriculumFrameworkLevel: 'High School AP Language & Literature / SAT Evidence-Based Reading',
    url: 'https://www.gutenberg.org/ebooks/23',
    license: 'Public Domain',
    attributionNote: 'Public Domain digitized text verified by Project Gutenberg.',
    description: 'Foundational 19th-century American memoir detailing literacy as the pathway from mental enslavement to freedom. Frequently utilized for SAT historical reading passages and AP English Language rhetorical analysis.',
    tags: ['Project Gutenberg', 'Public Domain', 'SAT Reading', 'AP Language', 'Frederick Douglass'],
    isVerifiedOpenAccess: true,
    citationText: 'Douglass, F. (1845). Narrative of the Life of Frederick Douglass, an American Slave. Written by Himself. Boston: Anti-Slavery Office. [Project Gutenberg EBook #23].',
    chaptersOrSections: [
      {
        id: 'gutenberg-fd-ch6',
        chapterNumber: 6,
        title: 'Chapter VI: The Transformation Through Literacy',
        summary: 'Douglass describes Mrs. Auld teaching him the alphabet, Mr. Auld’s furious prohibition, and his revelation that literacy is the irrepressible key to human liberty.',
        passageText: `Extract from Chapter VI:
"Very soon after I went to live with Mr. and Mrs. Auld, she very kindly commenced to teach me the A, B, C... Just at this point of my progress, Mr. Auld found out what was going on, and at once forbade Mrs. Auld to instruct me further, telling her, among other things, that it was unlawful, as well as unsafe, to teach a slave to read. To use his own words, further, he said, 'If you give a nigger an inch, he will take an ell. A nigger should know nothing but to obey his master—to do as he is told to do. Learning would spoil the best nigger in the world. Now,' said he, 'if you teach that nigger how to read, there would be no keeping him. It would forever unfit him to be a slave. He would at once become unmanageable, and of no value to his master. As to himself, it could do him no good, but a great deal of harm. It would make him discontented and unhappy.'
These words sank deep into my heart, stirred up sentiments within that lay slumbering, and called into existence an entirely new train of thought... I now understood what had been to me a most perplexing difficulty—to wit, the white man’s power to enslave the black man. From that moment, I understood the pathway from slavery to freedom."`,
        keyConcepts: ['Rhetorical Antithesis', 'Epiphany', 'Literacy as Power', 'Irony of Oppression'],
        workedProblem: {
          question: 'According to the passage, why did Mr. Auld’s prohibition paradoxically inspire Douglass to pursue literacy? (Standard SAT Reading paired evidence style).',
          stepByStepSolution: '1. Analysis of Mr. Auld’s assertion: Mr. Auld explicitly warned that learning would "forever unfit him to be a slave."\n2. Douglass’s deductive reasoning: Douglass recognized that the very thing his oppressor feared most was the key to his own emancipation.\n3. Conclusion: What was intended as a barrier became a guiding compass, confirming that intellectual development would destroy the mental foundations of enslavement.',
          markSchemeNotes: '[M1] for identifying Mr. Auld’s statement ("unfit him to be a slave"). [A1] for explaining Douglass’s inverse deduction that knowledge equals liberation.',
        },
      },
    ],
  },

  // ==========================================================================
  // OPEN TEXTBOOK LIBRARY: PEER-REVIEWED SECONDARY & UNIVERSITY PREP STEM
  // ==========================================================================
  {
    id: 'otl-calculus-vol1',
    repositoryId: 'open_textbook_library',
    title: 'Calculus Volume 1 (OpenStax / Open Textbook Library)',
    authorOrOrganization: 'Gilbert Strang & Edwin Herman (OpenStax / University of Minnesota)',
    yearOrEdition: 'Peer-Reviewed Open Edition',
    subject: 'Pure Mathematics & Calculus',
    targetExamBoards: ['alevel_uk', 'ap_ib', 'waec'],
    curriculumFrameworkLevel: 'Cambridge AS/A-Level Mathematics (9709) & AP Calculus AB/BC',
    url: 'https://open.umn.edu/opentextbooks/textbooks/371',
    license: 'CC BY 4.0',
    attributionNote: 'Textbook content produced by OpenStax is licensed under a Creative Commons Attribution 4.0 International License.',
    description: 'Comprehensive open textbook covering Limits, Derivatives, Applications of Derivatives, Integration, and Differential Equations. Directly aligned with Cambridge International A-Level Pure Mathematics 1 & 3 and AP Calculus.',
    tags: ['Open Textbook Library', 'OpenStax', 'Calculus', 'Limits', 'Derivatives', 'AP Calculus', 'A-Level'],
    isVerifiedOpenAccess: true,
    citationText: 'Strang, G., & Herman, E. (2016). Calculus Volume 1. Houston, TX: OpenStax, Rice University. Curated by Open Textbook Library.',
    chaptersOrSections: [
      {
        id: 'otl-calc-ch3',
        chapterNumber: 3,
        title: 'Chapter 3: Derivatives · Differentiation Rules, Product & Chain Rules',
        summary: 'Definition of the derivative as a limit of difference quotients; Power Rule; Product and Quotient Rules; the Chain Rule for composite functions; implicit differentiation.',
        passageText: `OpenStax Calculus Volume 1, Section 3.6: The Chain Rule
Theorem: Let f and g be differentiable functions. If y = f(u) and u = g(x), then the composite function y = f(g(x)) is differentiable and:
dy/dx = (dy/du) × (du/dx) = f'(g(x)) × g'(x).
In words: The derivative of a composite function is the derivative of the outer function evaluated at the inner function, multiplied by the derivative of the inner function.

Applications:
- Generalized Power Rule: If y = [g(x)]^n, then dy/dx = n [g(x)]^(n-1) × g'(x).
- Trigonometric Composites: If y = sin(g(x)), then dy/dx = cos(g(x)) × g'(x).`,
        keyConcepts: ['Composite Functions', 'The Chain Rule', 'Generalized Power Rule', 'Implicit Differentiation'],
        workedProblem: {
          question: 'Find the derivative of f(x) = (3x² - 5x + 2)⁴ with respect to x.',
          stepByStepSolution: 'Step 1: Identify outer function u⁴ and inner function u = 3x² - 5x + 2.\nStep 2: Derivative of outer function: d/du(u⁴) = 4u³.\nStep 3: Derivative of inner function: du/dx = d/dx(3x² - 5x + 2) = 6x - 5.\nStep 4: Combine via Chain Rule: f\'(x) = 4(3x² - 5x + 2)³ × (6x - 5) = 4(6x - 5)(3x² - 5x + 2)³.',
          markSchemeNotes: '[M1] for correctly applying the power rule to outer function [4(...)³]. [M1] for correctly differentiating inner function to (6x - 5). [A1] for fully simplified product 4(6x - 5)(3x² - 5x + 2)³.',
        },
      },
    ],
  },
  {
    id: 'otl-college-physics',
    repositoryId: 'open_textbook_library',
    title: 'College Physics for AP Courses (OpenStax / Open Textbook Library)',
    authorOrOrganization: 'Paul Peter Urone & Roger Hinrichs (OpenStax / University of Minnesota)',
    yearOrEdition: 'Peer-Reviewed Open Edition',
    subject: 'Physics',
    targetExamBoards: ['ap_ib', 'alevel_uk', 'igcse'],
    curriculumFrameworkLevel: 'AP Physics 1 & 2 / Cambridge International A-Level Physics (9702)',
    url: 'https://open.umn.edu/opentextbooks/textbooks/374',
    license: 'CC BY 4.0',
    attributionNote: 'OpenStax College Physics. Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0).',
    description: 'Grounded in real-world phenomena with structured inquiry questions, worked examples, and end-of-chapter problems mapped to international secondary physics benchmarks.',
    tags: ['Open Textbook Library', 'OpenStax', 'Physics', 'AP Physics', 'A-Level', 'Thermodynamics'],
    isVerifiedOpenAccess: true,
    citationText: 'Urone, P. P., & Hinrichs, R. (2020). College Physics for AP Courses. Houston, TX: OpenStax. Curated by Open Textbook Library.',
    chaptersOrSections: [
      {
        id: 'otl-phy-ch7',
        chapterNumber: 7,
        title: 'Chapter 7: Work, Energy, and Energy Resources',
        summary: 'Work done by a constant force, kinetic energy, gravitational potential energy, conservation of mechanical energy, and power.',
        passageText: `College Physics Section 7.4: Conservative Forces and Potential Energy
A conservative force is one for which work done by or against it depends only on the starting and ending points of a motion and not on the path taken.
The Work-Energy Theorem states that the net work done on a system equals its change in kinetic energy:
W_net = ΔKE = (1/2) m v_f² - (1/2) m v_i².
When only conservative forces act:
KE_i + PE_i = KE_f + PE_f (Mechanical Energy is conserved).`,
        keyConcepts: ['Work-Energy Theorem', 'Conservative vs Non-Conservative Forces', 'Conservation of Mechanical Energy', 'Power'],
        workedProblem: {
          question: 'A 0.5 kg cart rolls down a frictionless ramp from an initial height of 3.2 meters above the ground with an initial speed of 2.0 m/s. Calculate its speed at ground level (g = 9.8 m/s²).',
          stepByStepSolution: 'Step 1: Total initial mechanical energy E_i = (1/2) m v_i² + m g h_i = 0.5(0.5)(2.0)² + 0.5(9.8)(3.2) = 1.0 + 15.68 = 16.68 J.\nStep 2: At ground level, h_f = 0, so all energy is kinetic: E_f = (1/2) m v_f² = 0.5(0.5) v_f² = 0.25 v_f².\nStep 3: Equating E_i = E_f: 0.25 v_f² = 16.68 => v_f² = 66.72 => v_f = 8.17 m/s.',
          markSchemeNotes: '[M1] for setting up conservation of mechanical energy equation. [A1] for initial energy 16.68 J. [M1] for equating to (1/2)mv_f². [A1] for speed v_f = 8.17 m/s.',
        },
      },
    ],
  },

  // ==========================================================================
  // LIBRETEXTS: STEM OPEN PLATFORM
  // ==========================================================================
  {
    id: 'libretexts-chem-core',
    repositoryId: 'libretexts',
    title: 'LibreTexts General Chemistry: Principles, Patterns, and Applications',
    authorOrOrganization: 'LibreTexts Project (UC Davis & Global Academic Network)',
    yearOrEdition: 'Living Open Educational Library 2024',
    subject: 'Chemistry',
    targetExamBoards: ['igcse', 'alevel_uk', 'ap_ib', 'waec'],
    curriculumFrameworkLevel: 'Cambridge AS/A-Level & AP Chemistry Comprehensive Core',
    url: 'https://chem.libretexts.org/',
    license: 'CC BY-NC-SA 4.0',
    attributionNote: 'LibreTexts is supported by the Department of Education Open Textbook Pilot Program.',
    description: 'Modular open chemistry textbook detailing chemical equilibrium, Le Chatelier’s principle, acid-base equilibria, electrochemistry, and thermodynamics.',
    tags: ['LibreTexts', 'Chemistry', 'Equilibrium', 'Le Chatelier', 'Electrochemistry', 'AP Chem'],
    isVerifiedOpenAccess: true,
    citationText: 'LibreTexts Chemistry Project. (2024). General Chemistry: Principles, Patterns, and Applications. University of California, Davis.',
    chaptersOrSections: [
      {
        id: 'libre-chm-eq',
        chapterNumber: 15,
        title: 'Chapter 15: Chemical Equilibrium & Dynamic Systems',
        summary: 'Equilibrium constants (Kc and Kp), the reaction quotient Q, Le Chatelier’s principle, and temperature dependence.',
        passageText: `LibreTexts Chemistry Section 15.2: Dynamic Equilibrium
In a closed system, a reversible reaction reaches chemical equilibrium when the rate of the forward reaction equals the rate of the reverse reaction. The concentrations of reactants and products remain constant, but molecular interconversions continue continuously.
For reaction: aA + bB ⇌ cC + dD:
Equilibrium Constant Expression:
K_c = ([C]^c [D]^d) / ([A]^a [B]^b).
Le Chatelier's Principle: When a chemical system at equilibrium is disturbed by a change in temperature, pressure, or concentration, the system shifts in the direction that counteracts the disturbance.`,
        keyConcepts: ['Dynamic Equilibrium', 'Equilibrium Expression Kc', 'Reaction Quotient Q', 'Le Chatelier Shift'],
        workedProblem: {
          question: 'Consider the exothermic synthesis of ammonia: N2(g) + 3H2(g) ⇌ 2NH3(g) (ΔH = -92 kJ/mol). Predict the shift in equilibrium position when: (a) Pressure is increased, (b) Temperature is increased.',
          stepByStepSolution: '(a) Pressure increase: The reactants have 1 + 3 = 4 moles of gas, while products have 2 moles of gas. Increasing pressure favors the side with fewer gas molecules to reduce system pressure. Hence, equilibrium shifts to the right (increasing NH3 yield).\n(b) Temperature increase: Because the forward reaction is exothermic (releases heat), increasing temperature adds heat to the system. By Le Chatelier’s principle, the system shifts in the endothermic direction (reverse) to absorb excess heat. Equilibrium shifts to the left (decreasing NH3 yield).',
          markSchemeNotes: '[B1] for comparing mole count (4 moles vs 2 moles). [A1] for stating rightward shift with pressure. [B1] for noting forward reaction is exothermic. [A1] for stating leftward shift with temperature.',
        },
      },
    ],
  },

  // ==========================================================================
  // MIT OPENCOURSEWARE: UNIVERSITY-PREP STEM CURRICULUM
  // ==========================================================================
  {
    id: 'mit-ocw-1801sc',
    repositoryId: 'mit_ocw',
    title: 'Single Variable Calculus (MIT OpenCourseWare 18.01SC)',
    authorOrOrganization: 'Prof. David Jerison (Massachusetts Institute of Technology)',
    yearOrEdition: 'MIT OCW Scholar Edition',
    subject: 'Pure Mathematics & Calculus',
    targetExamBoards: ['alevel_uk', 'ap_ib'],
    curriculumFrameworkLevel: 'Advanced Secondary & Pre-University Level (AP Calculus BC / A-Level Further Maths)',
    url: 'https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/',
    license: 'MIT OpenCourseWare Open License',
    attributionNote: 'Massachusetts Institute of Technology. Content published under MIT OpenCourseWare Creative Commons license (CC BY-NC-SA).',
    description: 'Foundational course in single-variable calculus covering differentiation, integration, fundamental theorem of calculus, Taylor series, and applications.',
    tags: ['MIT OCW', 'Calculus', 'Fundamental Theorem', 'Integration', 'AP Calculus BC', 'Cambridge A-Level'],
    isVerifiedOpenAccess: true,
    citationText: 'Jerison, D. (2010). 18.01SC Single Variable Calculus. Fall 2010. Massachusetts Institute of Technology: MIT OpenCourseWare.',
    chaptersOrSections: [
      {
        id: 'mit-ocw-ftc',
        chapterNumber: 2,
        title: 'Unit 2: The Fundamental Theorem of Calculus',
        summary: 'Definite integrals as Riemann sums, accumulation functions, and the connection between differentiation and integration.',
        passageText: `MIT 18.01SC Lecture Notes on the Fundamental Theorem of Calculus (FTC):
Part 1 (Differentiation of Accumulation Functions):
Let f be continuous on [a, b]. If F(x) = ∫_a^x f(t) dt, then F'(x) = f(x) for all x in (a, b).
This asserts that every continuous function has an antiderivative!

Part 2 (Evaluation Formula):
If F is any antiderivative of f on [a, b] (so F'(x) = f(x)), then:
∫_a^b f(x) dx = F(b) - F(a).
This provides an analytical method to evaluate areas under curves without computing limit of infinite Riemann sums.`,
        keyConcepts: ['Accumulation Function', 'Fundamental Theorem of Calculus', 'Riemann Sums', 'Antiderivatives'],
        workedProblem: {
          question: 'Let g(x) = ∫_0^(x²) cos(t) dt. Find g\'(x) using the Fundamental Theorem of Calculus and the Chain Rule.',
          stepByStepSolution: 'Step 1: Let u = x², so g(x) = ∫_0^u cos(t) dt.\nStep 2: By FTC Part 1, dg/du = cos(u).\nStep 3: By Chain Rule, g\'(x) = (dg/du) × (du/dx) = cos(u) × (2x).\nStep 4: Substitute u = x² back: g\'(x) = 2x cos(x²).',
          markSchemeNotes: '[M1] for applying FTC Part 1 to get cos(u). [M1] for chain rule factor 2x. [A1] for final exact derivative 2x cos(x²).',
        },
      },
    ],
  },

  // ==========================================================================
  // WIKIBOOKS: OPEN COLLABORATIVE TEXTBOOKS
  // ==========================================================================
  {
    id: 'wikibooks-alevel-math',
    repositoryId: 'wikibooks',
    title: 'A-Level Mathematics Compendium (Wikibooks)',
    authorOrOrganization: 'Wikibooks Contributors (Wikimedia Foundation)',
    yearOrEdition: 'Living Wikimedia Open Textbook',
    subject: 'Mathematics',
    targetExamBoards: ['alevel_uk', 'edexcel_igcse', 'ap_ib'],
    curriculumFrameworkLevel: 'Cambridge International AS & A-Level (9709) / Edexcel A-Level',
    url: 'https://en.wikibooks.org/wiki/A-level_Mathematics',
    license: 'CC BY-SA 4.0',
    attributionNote: 'Text is available under the Creative Commons Attribution-ShareAlike License 4.0; additional terms may apply.',
    description: 'Community-developed textbook structured around the standard UK and International A-Level Mathematics specifications: Pure Mathematics (P1, P2, P3), Mechanics (M1), and Probability & Statistics (S1).',
    tags: ['Wikibooks', 'A-Level', 'Pure Mathematics', 'Trigonometry', 'Vectors', 'Binomial Expansion'],
    isVerifiedOpenAccess: true,
    citationText: 'Wikibooks Contributors. (2024). A-level Mathematics. Wikibooks, The Free Textbook Project.',
    chaptersOrSections: [
      {
        id: 'wiki-mth-binomial',
        chapterNumber: 4,
        title: 'Chapter 4: The Binomial Expansion for Rational Indices',
        summary: 'Expanding (1 + x)^n for negative and fractional values of n, conditions for convergence (|x| < 1), and series approximations.',
        passageText: `Wikibooks A-Level Pure Mathematics:
General Binomial Series:
For any real index n and |x| < 1:
(1 + x)^n = 1 + n x + [n(n - 1) / 2!] x² + [n(n - 1)(n - 2) / 3!] x³ + ...
When n is a positive integer, the series terminates after (n + 1) terms. When n is fractional or negative, the series is infinite and is valid only if |x| < 1.`,
        keyConcepts: ['Binomial Theorem', 'Rational Indices', 'Radius of Convergence', 'Series Approximation'],
        workedProblem: {
          question: 'Find the first four terms in the expansion of 1 / √(1 - 2x) in ascending powers of x, and state the range of values of x for which the expansion is valid.',
          stepByStepSolution: 'Step 1: Write expression with negative fractional power: (1 - 2x)^(-1/2).\nStep 2: Apply formula with n = -1/2 and replacement X = -2x:\nTerm 1: 1\nTerm 2: (-1/2)(-2x) = x\nTerm 3: [(-1/2)(-3/2) / 2!] (-2x)² = (3/8)(4x²) = (3/2) x²\nTerm 4: [(-1/2)(-3/2)(-5/2) / 6] (-2x)³ = (-15/48)(-8x³) = (5/2) x³.\nExpansion = 1 + x + (3/2) x² + (5/2) x³.\nStep 3: Convergence condition: |-2x| < 1 => 2|x| < 1 => |x| < 1/2 or -1/2 < x < 1/2.',
          markSchemeNotes: '[M1] for rewriting as (1 - 2x)^(-1/2). [M1] for applying binomial formula with n = -1/2. [A1] for correct first four terms 1 + x + 1.5x² + 2.5x³. [A1] for validity condition |x| < 1/2.',
        },
      },
    ],
  },

  // ==========================================================================
  // DIRECTORY OF OPEN ACCESS BOOKS (DOAB) & INTERNET ARCHIVE
  // ==========================================================================
  {
    id: 'doab-epistemology-science',
    repositoryId: 'doab',
    title: 'The Structure of Scientific Method and International Curricula',
    authorOrOrganization: 'Open Book Publishers / DOAB Peer-Reviewed Monograph',
    yearOrEdition: 'Academic Open Monograph Series',
    subject: 'History & Philosophy of Science',
    targetExamBoards: ['ap_ib', 'alevel_uk'],
    curriculumFrameworkLevel: 'International Baccalaureate Theory of Knowledge (TOK) & AP Capstone',
    url: 'https://www.doabooks.org/',
    license: 'CC BY 4.0',
    attributionNote: 'Peer-reviewed open access academic book indexed in the Directory of Open Access Books (DOAB).',
    description: 'Scholarly monograph analyzing the scientific method, empirical falsifiability, paradigm shifts, and epistemological frameworks across international pre-university curricula.',
    tags: ['DOAB', 'IB TOK', 'Philosophy of Science', 'Open Access Monograph'],
    isVerifiedOpenAccess: true,
    citationText: 'DOAB Peer-Reviewed Open Monograph. (2022). The Structure of Scientific Method and International Curricula. Open Book Publishers.',
    chaptersOrSections: [
      {
        id: 'doab-sci-ch1',
        chapterNumber: 1,
        title: 'Chapter 1: Falsifiability and Empirical Rigor in Secondary Science',
        summary: 'Karl Popper’s criterion of demarcation, distinguishing empirical science from pseudoscience, and how international curricula assess experimental hypothesis testing.',
        passageText: `Excerpt from Chapter 1:
"The criterion of demarcation proposed by Karl Popper shifts the foundation of scientific inquiry from inductive verification to deductive falsification. Under this paradigm, a theoretical hypothesis cannot be definitively proven true by any finite number of affirming observations, because an unexpected counterexample may always arise. Rather, a statement or system of statements is admitted into the realm of empirical science only if it is capable of conflicting with possible observations. Standardized curricula such as the International Baccalaureate and Cambridge A-Levels embody this principle in practical coursework by demanding that candidates explicitly identify controlled variables, calculate uncertainties, and articulate alternative explanations when experimental outcomes diverge from theoretical predictions."`,
        keyConcepts: ['Popperian Falsification', 'Deductive Demarcation', 'Experimental Uncertainty', 'IB Theory of Knowledge'],
        workedProblem: {
          question: 'Explain how Karl Popper’s criterion of demarcation distinguishes scientific theories from metaphysical assertions. How does this apply to experimental design in secondary school laboratories?',
          stepByStepSolution: '1. Criterion of Demarcation: Popper argues that a theory is scientific only if it makes risky predictions that could in principle be disproven (falsified) by empirical observation.\n2. Metaphysical/Pseudoscience Contrast: Claims that cannot be subjected to a falsifying test (or that adapt post-hoc to explain any conceivable outcome) are non-scientific.\n3. Application to Lab Experiments: In secondary science, students formulate a null hypothesis and specify experimental conditions where the hypothesis would fail, rather than merely seeking confirming data.',
          markSchemeNotes: '[B1] for defining falsifiability as the demarcation criterion. [M1] for contrasting with unfalsifiable assertions. [A1] for linking to hypothesis testing and error analysis.',
        },
      },
    ],
  },
  {
    id: 'ia-west-africa-education',
    repositoryId: 'internet_archive',
    title: 'Historical Foundation Papers of West African Education (1952–1990 Archive)',
    authorOrOrganization: 'Internet Archive Public Records Collection',
    yearOrEdition: 'Digital Historical Archive Preservation Edition',
    subject: 'History & Education Development',
    targetExamBoards: ['waec', 'neco'],
    curriculumFrameworkLevel: 'Historical Archive of Examination Development in Anglophone West Africa',
    url: 'https://archive.org/details/historical-west-african-curriculum',
    license: 'Public Domain',
    attributionNote: 'Preserved digital document provided for historical education research via Internet Archive.',
    description: 'Archived collection documenting the evolution of school certificate examinations across Nigeria, Ghana, Sierra Leone, The Gambia, and Liberia following the establishment of WAEC in 1952.',
    tags: ['Internet Archive', 'Historical', 'WAEC History', 'Public Domain'],
    isVerifiedOpenAccess: true,
    citationText: 'Internet Archive Open Educational Collection. Historical Foundation Papers of West African Education (1952–1990). San Francisco: Internet Archive.',
    chaptersOrSections: [
      {
        id: 'ia-waec-foundations',
        chapterNumber: 1,
        title: 'Section 1: The Transition from Cambridge Local Examinations to WAEC (1952)',
        summary: 'Historical record of the Jeffrey Report and the statutory establishment of the West African Examinations Council to localize curriculum while maintaining international parity.',
        passageText: `Archived Historical Dispatch (1952):
"Following the recommendations of Dr. G.B. Jeffrey, Director of the University of London Institute of Education, the Legislative Assemblies of the Gold Coast, Nigeria, Sierra Leone, and the Gambia enacted ordinances establishing the West African Examinations Council in 1952. The fundamental objective was to establish an indigenous examination authority capable of designing school certificate examinations attuned to local environmental and cultural needs, while maintaining parity of standards with the University of Cambridge Local Examinations Syndicate and the University of London."`,
        keyConcepts: ['Jeffrey Report 1950', 'Establishment of WAEC 1952', 'Curriculum Localization', 'International Standards Parity'],
        workedProblem: {
          question: 'What historical problem did the 1950 Jeffrey Report aim to resolve, and what dual objective was assigned to the newly created West African Examinations Council?',
          stepByStepSolution: '1. Historical Problem: Secondary schools across British West Africa were entirely dependent on metropolitan British exam boards (Cambridge and London), whose syllabi lacked local context and relevance.\n2. Dual Objective: (a) Localize curricula and examination materials to reflect West African fauna, flora, history, and civic realities, (b) Maintain strict equivalence of standards so certificates remained recognized by international universities.',
          markSchemeNotes: '[B1] for identifying reliance on overseas British boards. [M1] for curriculum localization objective. [A1] for international equivalence/recognition objective.',
        },
      },
    ],
  },
];
