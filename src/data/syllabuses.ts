import { SyllabusDocument } from '../types/examinerIntelligence';

export const OFFICIAL_SYLLABUS_REGISTRY: SyllabusDocument[] = [
  {
    id: 'waec-math-2026',
    board: 'WAEC',
    qualification: 'WASSCE (West African Senior School Certificate)',
    subject: 'General Mathematics',
    level: 'Senior Secondary 1-3',
    syllabusVersion: 'WAEC/WASSCE/SC/2024-2026',
    effectiveYear: '2026',
    sourceReference: 'West African Examinations Council Official Syllabus Scheme & NERDC National Curriculum',
    lastVerifiedDate: '2026-03-15',
    topics: [
      {
        id: 'waec-m-1',
        title: 'Number and Numeration',
        weightPercentage: 25,
        recommendedHours: 30,
        subtopics: [
          {
            id: 'waec-m-1-1',
            title: 'Number Bases & Conversions',
            learningObjectives: [
              'Convert numbers from base 10 to other bases (2, 7, 8, 12, 16) and vice versa',
              'Perform basic modular arithmetic operations and solve linear equations in modular systems',
            ],
            prerequisites: ['Place value notation', 'Basic division algorithm'],
            keyDefinitions: ['Base: Number of unique digits used in a positional numeral system', 'Modulo arithmetic: Arithmetic system for integers where numbers wrap around a certain value'],
            suggestedActivities: ['Binary to decimal fast decoding drill', 'Clock arithmetic problem sets'],
          },
          {
            id: 'waec-m-1-2',
            title: 'Fractions, Decimals, Approximations and Surds',
            learningObjectives: [
              'Simplify surds of the form √a and a√b',
              'Rationalize the denominator of binomial surds (e.g. 1 / (a + √b))',
              'Calculate significant figures and percentage errors',
            ],
            prerequisites: ['Prime factorization', 'Rules of radicals'],
            keyDefinitions: ['Surd: An irrational root of a rational number', 'Conjugate: Binomial formed by negating the second term'],
            suggestedActivities: ['Surd rationalization proofs', 'Laboratory error estimation calculations'],
          },
          {
            id: 'waec-m-1-3',
            title: 'Indices, Logarithms and Sequences (AP & GP)',
            learningObjectives: [
              'Apply the fundamental laws of indices and logarithms to solve exponential equations',
              'Derive and apply formulas for the nth term and sum of first n terms of AP and GP',
            ],
            prerequisites: ['Powers and roots', 'Pattern recognition'],
            keyDefinitions: ['Arithmetic Progression: Sequence where consecutive terms differ by a constant d', 'Geometric Progression: Sequence where consecutive terms have a constant ratio r'],
            suggestedActivities: ['Depreciation and compound interest modeling', 'Sum to infinity proofs'],
          },
        ],
      },
      {
        id: 'waec-m-2',
        title: 'Algebraic Processes',
        weightPercentage: 35,
        recommendedHours: 45,
        subtopics: [
          {
            id: 'waec-m-2-1',
            title: 'Simultaneous & Quadratic Equations',
            learningObjectives: [
              'Solve simultaneous linear equations in two variables algebraically and graphically',
              'Solve quadratic equations by factorization, completing the square, and quadratic formula',
              'Form quadratic equations with given roots α and β',
            ],
            prerequisites: ['Linear equation transposition', 'Expansion of brackets'],
            keyDefinitions: ['Discriminant: b² - 4ac determining the nature of roots', 'Roots: Solutions where f(x) = 0'],
            suggestedActivities: ['Parabola projectile trajectory graphs', 'Cost-profit quadratic optimization'],
          },
          {
            id: 'waec-m-2-2',
            title: 'Linear Inequalities & Linear Programming',
            learningObjectives: [
              'Solve linear inequalities in one and two variables',
              'Graphically represent feasible regions and maximize/minimize objective functions',
            ],
            prerequisites: ['Cartesian plane graphing', 'Boundary line conventions'],
            keyDefinitions: ['Feasible Region: Set of all points satisfying every inequality constraint simultaneously'],
            suggestedActivities: ['Agricultural resource allocation linear program'],
          },
          {
            id: 'waec-m-2-3',
            title: 'Variation (Direct, Inverse, Joint & Partial)',
            learningObjectives: [
              'Express verbal statements of variation in algebraic formulas with constant k',
              'Solve real-world problems involving joint and partial variation',
            ],
            prerequisites: ['Ratio and proportion', 'Subject of formula manipulation'],
            keyDefinitions: ['Partial Variation: Relationship where one variable is sum of two or more parts'],
            suggestedActivities: ['Electricity bill fixed charge plus unit consumption calculations'],
          },
        ],
      },
      {
        id: 'waec-m-3',
        title: 'Geometry and Trigonometry',
        weightPercentage: 25,
        recommendedHours: 35,
        subtopics: [
          {
            id: 'waec-m-3-1',
            title: 'Euclidean Geometry & Circle Theorems',
            learningObjectives: [
              'Prove and apply theorems concerning angles at center and circumference',
              'Apply cyclic quadrilateral theorems and tangent-chord (alternate segment) theorem',
            ],
            prerequisites: ['Parallel line angle properties', 'Isosceles triangle theorems'],
            keyDefinitions: ['Alternate Segment Theorem: Angle between tangent and chord equals angle in alternate segment'],
            suggestedActivities: ['Interactive dynamic circle theorem proofs'],
          },
          {
            id: 'waec-m-3-2',
            title: 'Trigonometric Ratios, Sine & Cosine Rules',
            learningObjectives: [
              'Solve right-angled triangle problems using SOHCAHTOA',
              'Apply the Sine Rule and Cosine Rule to oblique triangles in 2D and 3D surveying/bearings',
            ],
            prerequisites: ['Pythagorean theorem', 'Compass cardinal directions & 3-figure bearings'],
            keyDefinitions: ['Bearing: Clockwise angle measured from true North using 3 digits'],
            suggestedActivities: ['Triangulation navigation exercise'],
          },
        ],
      },
      {
        id: 'waec-m-4',
        title: 'Statistics and Probability',
        weightPercentage: 15,
        recommendedHours: 20,
        subtopics: [
          {
            id: 'waec-m-4-1',
            title: 'Grouped Data Measures of Central Tendency & Dispersion',
            learningObjectives: [
              'Construct histograms, frequency polygons, and cumulative frequency curves (ogive)',
              'Estimate median, quartiles, and percentiles from ogive',
              'Calculate mean, variance, and standard deviation for grouped data',
            ],
            prerequisites: ['Frequency tables', 'Class intervals and midpoints'],
            keyDefinitions: ['Variance: Average of squared deviations from the mean', 'Interquartile Range: Q3 - Q1'],
            suggestedActivities: ['Exam scores percentile distribution analysis'],
          },
          {
            id: 'waec-m-4-2',
            title: 'Theoretical & Experimental Probability',
            learningObjectives: [
              'Calculate probabilities of mutually exclusive and independent events',
              'Use tree diagrams and Venn diagrams to model multi-stage experiments without replacement',
            ],
            prerequisites: ['Set notation', 'Sample space identification'],
            keyDefinitions: ['Independent Events: Outcome of event A does not affect probability of event B'],
            suggestedActivities: ['Dice and playing card conditional probability games'],
          },
        ],
      },
    ],
  },
  {
    id: 'cambridge-igcse-physics-0625',
    board: 'Cambridge_IGCSE',
    qualification: 'Cambridge IGCSE Physics (0625)',
    subject: 'Physics',
    level: 'Upper Secondary (Grades 9-10 / Year 10-11)',
    syllabusVersion: 'Syllabus 0625 for 2024-2026',
    effectiveYear: '2026',
    sourceReference: 'Cambridge Assessment International Education (CAIE) Official Physics Specification',
    lastVerifiedDate: '2026-03-10',
    topics: [
      {
        id: 'caie-phy-1',
        title: 'Motion, Forces and Energy',
        weightPercentage: 35,
        recommendedHours: 40,
        subtopics: [
          {
            id: 'caie-phy-1-1',
            title: 'Physical Quantities, Units & Measurement Techniques',
            learningObjectives: [
              'Distinguish between scalar and vector quantities with examples',
              'Measure small intervals of time, lengths using micrometer screw gauge and vernier caliper',
            ],
            prerequisites: ['Standard SI units', 'Reading analog scales with precision'],
            keyDefinitions: ['Scalar: Magnitude only', 'Vector: Magnitude and direction'],
            suggestedActivities: ['Micrometer zero error calibration lab'],
          },
          {
            id: 'caie-phy-1-2',
            title: 'Kinematics & Speed-Time Graphs',
            learningObjectives: [
              'Calculate speed, velocity, and uniform acceleration',
              'Deduce acceleration from the gradient of a speed-time graph and distance travelled from the area under graph',
            ],
            prerequisites: ['Slope of linear functions', 'Area of trapezoids and triangles'],
            keyDefinitions: ['Acceleration: Rate of change of velocity with respect to time (a = Δv/Δt)'],
            suggestedActivities: ['Ticker timer velocity and acceleration tape analysis'],
          },
          {
            id: 'caie-phy-1-3',
            title: 'Newton\'s Laws of Motion & Momentum',
            learningObjectives: [
              'State and apply Newton\'s three laws of motion (F = ma, action-reaction)',
              'Apply conservation of linear momentum in elastic and inelastic collisions (p = mv)',
            ],
            prerequisites: ['Forces addition', 'Free-body diagrams'],
            keyDefinitions: ['Inertia: Resistance of any physical object to any change in its velocity'],
            suggestedActivities: ['Air track glider collision simulation'],
          },
        ],
      },
      {
        id: 'caie-phy-2',
        title: 'Thermal Physics',
        weightPercentage: 20,
        recommendedHours: 25,
        subtopics: [
          {
            id: 'caie-phy-2-1',
            title: 'Kinetic Particle Model of Matter',
            learningObjectives: [
              'Describe solid, liquid, and gas states in terms of molecular arrangement and motion',
              'Explain Brownian motion as evidence for random molecular collisions',
              'Relate temperature to average kinetic energy of particles',
            ],
            prerequisites: ['Basic atomic theory', 'Pressure concept (P = F/A)'],
            keyDefinitions: ['Absolute Zero: 0 Kelvin (-273.15 °C), point of minimal thermal motion'],
            suggestedActivities: ['Smoke cell Brownian motion microscope observation'],
          },
          {
            id: 'caie-phy-2-2',
            title: 'Thermal Properties & Temperature',
            learningObjectives: [
              'Calculate thermal energy transfers using E = mcΔT and latent heat E = mL',
              'Explain conduction, convection, and thermal radiation (infrared emission and absorption)',
            ],
            prerequisites: ['Conservation of energy', 'Temperature scales'],
            keyDefinitions: ['Specific Heat Capacity: Energy required to raise temperature of 1 kg of substance by 1 °C'],
            suggestedActivities: ['Leslie\'s cube thermal radiation emission comparison'],
          },
        ],
      },
      {
        id: 'caie-phy-3',
        title: 'Waves and Light',
        weightPercentage: 25,
        recommendedHours: 30,
        subtopics: [
          {
            id: 'caie-phy-3-1',
            title: 'General Wave Properties & Sound',
            learningObjectives: [
              'State the wave equation v = fλ and distinguish transverse from longitudinal waves',
              'Describe reflection, refraction, and diffraction through apertures and around obstacles',
            ],
            prerequisites: ['Periodic vibrations', 'Oscillation frequency (f = 1/T)'],
            keyDefinitions: ['Diffraction: Spreading of waves as they pass through a gap comparable to wavelength'],
            suggestedActivities: ['Ripple tank wave interference demonstration'],
          },
          {
            id: 'caie-phy-3-2',
            title: 'Ray Optics: Reflection, Refraction & Thin Lenses',
            learningObjectives: [
              'Apply Snell\'s law (n = sin i / sin r) and determine critical angle for total internal reflection',
              'Draw ray diagrams for real and virtual images formed by converging lenses',
            ],
            prerequisites: ['Normal line geometry', 'Wave speed in denser optical media'],
            keyDefinitions: ['Total Internal Reflection: Complete reflection when angle of incidence exceeds critical angle'],
            suggestedActivities: ['Optical fiber light guide and prism refraction practical'],
          },
        ],
      },
      {
        id: 'caie-phy-4',
        title: 'Electricity and Magnetism',
        weightPercentage: 20,
        recommendedHours: 30,
        subtopics: [
          {
            id: 'caie-phy-4-1',
            title: 'Electric Circuits, Ohm\'s Law & Electrical Safety',
            learningObjectives: [
              'Apply Ohm\'s law V = IR and calculate equivalent resistance in series and parallel networks',
              'Calculate electrical power (P = IV = I²R) and energy (E = Pt)',
              'Explain operation of fuses, circuit breakers, and earth wires',
            ],
            prerequisites: ['Charge conservation', 'Potential difference definition'],
            keyDefinitions: ['Electromotive Force (EMF): Electrical energy supplied per unit charge by a source'],
            suggestedActivities: ['Breadboard resistor circuit current-voltage testing'],
          },
          {
            id: 'caie-phy-4-2',
            title: 'Electromagnetic Effects & Transformers',
            learningObjectives: [
              'State Fleming\'s left-hand motor rule and explain DC electric motor operation',
              'Describe electromagnetic induction (Faraday\'s law and Lenz\'s law)',
              'Apply transformer equations (Vp/Vs = Np/Ns = Is/Ip) for ideal transformers',
            ],
            prerequisites: ['Magnetic field line patterns', 'Current-carrying conductor fields'],
            keyDefinitions: ['Lenz\'s Law: Direction of induced current opposes the change in magnetic flux producing it'],
            suggestedActivities: ['Step-up transformer grid transmission loss demonstration'],
          },
        ],
      },
    ],
  },
  {
    id: 'jamb-biology-2026',
    board: 'JAMB',
    qualification: 'UTME (Unified Tertiary Matriculation Examination)',
    subject: 'Biology',
    level: 'Tertiary Entrance / Advanced Secondary',
    syllabusVersion: 'JAMB/IBASS/BIO/2026',
    effectiveYear: '2026',
    sourceReference: 'Joint Admissions and Matriculation Board Interactive e-Brochure & Syllabus System (IBASS)',
    lastVerifiedDate: '2026-03-01',
    topics: [
      {
        id: 'jamb-bio-1',
        title: 'Form and Functions: Cell Biology & Physiology',
        weightPercentage: 30,
        recommendedHours: 35,
        subtopics: [
          {
            id: 'jamb-bio-1-1',
            title: 'Cell Ultrastructure, Organelles & Diffusion/Osmosis',
            learningObjectives: [
              'Compare prokaryotic and eukaryotic cellular structures and organelle functions (mitochondria, chloroplasts, ribosomes)',
              'Explain passive diffusion, active transport, and osmotic water potential in plant and animal cells',
            ],
            prerequisites: ['Light microscopy', 'Chemical elements in living matter'],
            keyDefinitions: ['Plasmolysis: Shrinking of protoplasm away from cell wall when placed in hypertonic solution'],
            suggestedActivities: ['Potato tuber osmosis osmometer lab'],
          },
          {
            id: 'jamb-bio-1-2',
            title: 'Enzyme Kinetics, Photosynthesis & Cellular Respiration',
            learningObjectives: [
              'Explain lock-and-key and induced-fit enzyme mechanisms and factors affecting rate (pH, temperature, substrate concentration)',
              'Contrast light-dependent and light-independent stages of photosynthesis and aerobic vs anaerobic glycolysis',
            ],
            prerequisites: ['ATP energy currency', 'Chemical bonding'],
            keyDefinitions: ['Substrate: Specific reactant molecule bound by enzyme active site'],
            suggestedActivities: ['Catalase yeast breakdown hydrogen peroxide titration'],
          },
        ],
      },
      {
        id: 'jamb-bio-2',
        title: 'Ecology and Environmental Biology',
        weightPercentage: 25,
        recommendedHours: 25,
        subtopics: [
          {
            id: 'jamb-bio-2-1',
            title: 'Ecosystem Dynamics, Nutrient Cycles & Energy Flow',
            learningObjectives: [
              'Construct food chains, food webs, and ecological pyramids of numbers, biomass, and energy',
              'Trace carbon, nitrogen, and water biogeochemical cycles in tropical biomes',
            ],
            prerequisites: ['Trophic levels', 'Producers, consumers and decomposers'],
            keyDefinitions: ['Trophic Efficiency: Percentage of energy transferred from one trophic level to the next (~10%)'],
            suggestedActivities: ['Soil nutrient quadrat sampling analysis'],
          },
        ],
      },
      {
        id: 'jamb-bio-3',
        title: 'Heredity, Genetics and Evolution',
        weightPercentage: 30,
        recommendedHours: 35,
        subtopics: [
          {
            id: 'jamb-bio-3-1',
            title: 'Mendelian Genetics, Monohybrid & Dihybrid Crosses',
            learningObjectives: [
              'Deduce genotypic and phenotypic ratios using Punnett squares for complete and incomplete dominance',
              'Explain codominance, multiple alleles (ABO blood groups), and sex-linked inheritance (hemophilia, color blindness)',
            ],
            prerequisites: ['Meiosis and chromosome assortment', 'Alleles and genes'],
            keyDefinitions: ['Allele: Alternative form of a gene located at a specific locus on homologous chromosomes'],
            suggestedActivities: ['ABO blood group pedigree tree analysis'],
          },
          {
            id: 'jamb-bio-3-2',
            title: 'DNA Replication, Protein Synthesis & Natural Selection',
            learningObjectives: [
              'Describe the double-helix DNA structure, transcription to mRNA, and translation on ribosomes',
              'Explain Darwinian natural selection, mutation, and adaptation mechanisms in sickle cell anemia resistance to malaria',
            ],
            prerequisites: ['Nucleotide bases (A, T, C, G, U)', 'Genetic code'],
            keyDefinitions: ['Heterozygote Advantage: Case where heterozygous genotype has higher relative fitness than homozygous'],
            suggestedActivities: ['HbA/HbS sickle cell trait population genetics simulator'],
          },
        ],
      },
    ],
  },
  {
    id: 'digital-sat-math-2026',
    board: 'SAT',
    qualification: 'College Board Digital SAT',
    subject: 'Digital SAT Mathematics',
    level: 'High School Senior / College Entrance',
    syllabusVersion: 'College Board Digital SAT Suite Specifications',
    effectiveYear: '2026',
    sourceReference: 'College Board Official Digital SAT Test Specifications & Desmos Framework',
    lastVerifiedDate: '2026-03-20',
    topics: [
      {
        id: 'sat-m-1',
        title: 'Heart of Algebra',
        weightPercentage: 35,
        recommendedHours: 30,
        subtopics: [
          {
            id: 'sat-m-1-1',
            title: 'Linear Equations, Inequalities & Systems in Two Variables',
            learningObjectives: [
              'Solve and interpret linear equations and systems modeling real-world context with infinite, unique, or no solutions',
              'Interpret slope and intercepts in contexts such as marginal cost, rate of increase, and initial values',
            ],
            prerequisites: ['Coordinate plane algebra', 'Point-slope form'],
            keyDefinitions: ['Slope: Constant rate of change (m = Δy/Δx)', 'System Consistency: Parallel lines indicate no solution'],
            suggestedActivities: ['Desmos regression matching exercises'],
          },
        ],
      },
      {
        id: 'sat-m-2',
        title: 'Advanced Math',
        weightPercentage: 35,
        recommendedHours: 35,
        subtopics: [
          {
            id: 'sat-m-2-1',
            title: 'Nonlinear Functions, Parabolas & Quadratics',
            learningObjectives: [
              'Manipulate quadratic, exponential, and polynomial expressions into vertex, factored, and standard forms',
              'Identify vertex, extrema, axis of symmetry, and x-intercepts without graphing calculator assistance',
            ],
            prerequisites: ['Factoring polynomials', 'Completing the square'],
            keyDefinitions: ['Vertex Form: y = a(x - h)² + k where (h, k) represents the parabolic extreme point'],
            suggestedActivities: ['Trajectory apex and projectile range optimization'],
          },
          {
            id: 'sat-m-2-2',
            title: 'Radicals, Rational Exponents & Polynomial Division',
            learningObjectives: [
              'Simplify rational expressions and solve radical equations while checking for extraneous solutions',
              'Apply Remainder and Factor Theorems for polynomial division',
            ],
            prerequisites: ['Exponent rules', 'Long polynomial division'],
            keyDefinitions: ['Extraneous Root: Mathematical solution arising from algebraic manipulation that fails original equation'],
            suggestedActivities: ['Extraneous root diagnostic trap sets'],
          },
        ],
      },
      {
        id: 'sat-m-3',
        title: 'Problem-Solving and Data Analysis',
        weightPercentage: 20,
        recommendedHours: 20,
        subtopics: [
          {
            id: 'sat-m-3-1',
            title: 'Ratios, Percentages, Unit Conversions & Statistical Inferences',
            learningObjectives: [
              'Solve multi-step unit conversions and compound percentage increases/decreases',
              'Evaluate margin of error, sample representation, and statistical significance from observational studies vs experiments',
            ],
            prerequisites: ['Dimensional analysis', 'Normal distribution basics'],
            keyDefinitions: ['Margin of Error: Degree of uncertainty around a sample estimate'],
            suggestedActivities: ['Clinical trial sampling bias evaluation'],
          },
        ],
      },
      {
        id: 'sat-m-4',
        title: 'Geometry and Trigonometry',
        weightPercentage: 10,
        recommendedHours: 15,
        subtopics: [
          {
            id: 'sat-m-4-1',
            title: 'Circles, Triangle Similarity & Right Triangle Trigonometry',
            learningObjectives: [
              'Use circle equation (x - h)² + (y - k)² = r² and calculate arc lengths / sector areas in radians',
              'Apply complementary angle identity: sin(x) = cos(90° - x)',
            ],
            prerequisites: ['Circle radius and diameter', 'Radian to degree conversion (π rad = 180°)'],
            keyDefinitions: ['Sector Area: (1/2)r²θ where θ is in radians'],
            suggestedActivities: ['Radian circle coordinate trigonometry map'],
          },
        ],
      },
    ],
  },
  {
    id: 'waec-chemistry-2026',
    board: 'WAEC',
    qualification: 'WASSCE (Senior Secondary)',
    subject: 'Chemistry',
    level: 'Senior Secondary 1-3',
    syllabusVersion: 'WAEC/CHEM/2026',
    effectiveYear: '2026',
    sourceReference: 'WAEC Official Examination Syllabus Scheme & National Chemistry Benchmarks',
    lastVerifiedDate: '2026-03-12',
    topics: [
      {
        id: 'waec-chem-1',
        title: 'Atomic Structure, Bonding and Periodic Table',
        weightPercentage: 30,
        recommendedHours: 35,
        subtopics: [
          {
            id: 'waec-chem-1-1',
            title: 'Electronic Configuration, Isotopes & Periodic Trends',
            learningObjectives: [
              'Write s, p, d electronic configurations up to atomic number 30 (Zinc)',
              'Explain periodic trends: atomic radius, ionization energy, electron affinity, and electronegativity across periods and down groups',
            ],
            prerequisites: ['Subatomic particles (protons, neutrons, electrons)', 'Mass number and atomic number'],
            keyDefinitions: ['First Ionization Energy: Energy required to remove one mole of electrons from one mole of gaseous atoms'],
            suggestedActivities: ['Periodic trend graph plotting practical'],
          },
          {
            id: 'waec-chem-1-2',
            title: 'Chemical Bonding: Ionic, Covalent, Metallic & Intermolecular Forces',
            learningObjectives: [
              'Explain formation of electrovalent (ionic) and covalent bonds with octet rule and coordinate covalent bonds',
              'Compare physical properties (melting point, electrical conductivity, volatility) based on bonding type and hydrogen bonding',
            ],
            prerequisites: ['Valence electrons', 'Electronegativity differences'],
            keyDefinitions: ['Hydrogen Bond: Strong dipole-dipole attraction between H bound to N, O, or F and an electronegative atom'],
            suggestedActivities: ['Conductivity and solubility testing of sodium chloride vs naphthalene'],
          },
        ],
      },
      {
        id: 'waec-chem-2',
        title: 'Stoichiometry, Chemical Reactions & Electrochemistry',
        weightPercentage: 40,
        recommendedHours: 45,
        subtopics: [
          {
            id: 'waec-chem-2-1',
            title: 'The Mole Concept, Empirical Formulas & Volumetric Analysis',
            learningObjectives: [
              'Calculate molar masses, percentage composition, empirical and molecular formulas',
              'Calculate concentrations in mol/dm³ and g/dm³ and balance redox and acid-base titration reactions',
            ],
            prerequisites: ['Chemical equations balancing', 'Avogadro\'s constant (6.022 × 10²³)'],
            keyDefinitions: ['Standard Solution: Solution of accurately known concentration'],
            suggestedActivities: ['Standardization of hydrochloric acid against sodium trioxocarbonate(IV) titration'],
          },
          {
            id: 'waec-chem-2-2',
            title: 'Electrolysis, Faraday\'s Laws & Electrochemical Cells',
            learningObjectives: [
              'Predict preferential discharge of ions at electrodes during electrolysis of molten and aqueous electrolytes',
              'State and apply Faraday\'s 1st and 2nd Laws of electrolysis (m = ZIt = (M·I·t)/(n·F))',
            ],
            prerequisites: ['Oxidation and reduction definitions', 'Electrochemical series'],
            keyDefinitions: ['Faraday Constant: Charge carried by one mole of electrons (~96,500 Coulombs)'],
            suggestedActivities: ['Copper electroplating calculation and laboratory demonstration'],
          },
        ],
      },
    ],
  },
];
