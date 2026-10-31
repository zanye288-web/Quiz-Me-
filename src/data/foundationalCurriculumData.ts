// Comprehensive Foundational Curriculum Data
// First-principles axioms, prerequisite trees, and scaffolded thinking ladders

import { FoundationalAxiom, FoundationDiagnosticQuestion } from '../types/foundation';

export const FOUNDATIONAL_AXIOMS: FoundationalAxiom[] = [
  // MATHEMATICS FOUNDATIONS
  {
    id: 'math_bodmas',
    domain: 'mathematics',
    title: 'Operational Precedence Hierarchy (BODMAS / PEMDAS)',
    oneSentenceRule: 'Calculations must proceed strictly from Brackets/Parentheses, to Orders/Exponents, to Division and Multiplication (left-to-right), and finally Addition and Subtraction (left-to-right).',
    firstPrinciplesExplanation: 'Multiplication is repeated addition and exponents are repeated multiplication; thus, operations of higher combinatorial power must collapse into simpler units before lower-level accumulative operations take place.',
    commonMisconception: 'Assuming multiplication always precedes division regardless of left-to-right reading order (e.g., treating 12 ÷ 3 × 2 as 12 ÷ 6 = 2 instead of 4 × 2 = 8).',
    scaffoldedExample: {
      problem: 'Evaluate: 8 + 4 × (6 - 2)² ÷ 8',
      steps: [
        'Step 1 (Brackets): Resolve interior term (6 - 2) = 4. Expression becomes 8 + 4 × 4² ÷ 8',
        'Step 2 (Orders): Evaluate exponent 4² = 16. Expression becomes 8 + 4 × 16 ÷ 8',
        'Step 3 (Multiplication & Division left-to-right): 4 × 16 = 64; then 64 ÷ 8 = 8. Expression becomes 8 + 8',
        'Step 4 (Addition): 8 + 8 = 16',
      ],
      answer: '16',
    },
    visualAnchorOrFormula: 'B → O/E → D/M → A/S',
    prerequisites: ['Counting', 'Basic Addition/Multiplication'],
  },
  {
    id: 'math_negative_signs',
    domain: 'mathematics',
    title: 'The Law of Signs & Negative Arithmetic',
    oneSentenceRule: 'Multiplying or dividing two numbers with identical signs yields positive (+); multiplying or dividing two numbers with differing signs yields negative (-).',
    firstPrinciplesExplanation: 'A negative sign represents a 180° geometric reversal of direction on the real number line. Reversing direction twice brings you back to the positive orientation (- × - = +).',
    commonMisconception: 'Confusing addition of negatives (-3 + -5 = -8) with multiplication of negatives (-3 × -5 = +15).',
    scaffoldedExample: {
      problem: 'Simplify: -5 - (-8) + (-3) × (-2)',
      steps: [
        'Step 1 (Multiplication first): (-3) × (-2) = +6 (like signs give positive)',
        'Step 2 (Subtracting a negative): -5 - (-8) is equivalent to -5 + 8 = +3',
        'Step 3 (Final sum): +3 + 6 = 9',
      ],
      answer: '9',
    },
    visualAnchorOrFormula: '(+) × (+) = (+)  |  (-) × (-) = (+)  |  (+) × (-) = (-)',
    prerequisites: ['Integer number line'],
  },
  {
    id: 'math_algebra_balance',
    domain: 'mathematics',
    title: 'The Golden Rule of Algebraic Invariants',
    oneSentenceRule: 'An equation is a balanced scale; whatever operation is applied to the left-hand side must be applied identically to the right-hand side to preserve equality.',
    firstPrinciplesExplanation: 'Variables represent unknown quantities governed by relational equivalence. Applying inverse operations (subtraction undoes addition; division undoes multiplication) isolates the target variable without disturbing equivalence.',
    commonMisconception: 'Moving a term across the equals sign without inverting its operation (e.g. turning 3x = 12 into x = 12 - 3 instead of x = 12 ÷ 3).',
    scaffoldedExample: {
      problem: 'Solve for x: (2x + 5) / 3 = 7',
      steps: [
        'Step 1 (Inverse of division): Multiply both sides by 3 → 2x + 5 = 21',
        'Step 2 (Inverse of addition): Subtract 5 from both sides → 2x = 16',
        'Step 3 (Inverse of multiplication): Divide both sides by 2 → x = 8',
      ],
      answer: 'x = 8',
    },
    visualAnchorOrFormula: 'If A = B, then A ∘ k = B ∘ k',
    prerequisites: ['Basic arithmetic', 'Variable notation'],
  },

  // PHYSICS FOUNDATIONS
  {
    id: 'phys_newton_laws',
    domain: 'physics',
    title: 'Newton\'s First Law: Inertia & Equilibrium',
    oneSentenceRule: 'An object remains at rest or in uniform straight-line motion at constant velocity unless acted upon by a net non-zero external resultant force.',
    firstPrinciplesExplanation: 'Force is not required to sustain motion; force is required only to alter velocity (i.e. to produce acceleration a = F_net / m). In the absence of net friction, a projectile travels eternally.',
    commonMisconception: 'Believing that a moving object must have an active forward force pushing it (Aristotelian fallacy). At terminal velocity or cruising speed, forward force exactly equals resistive drag (F_net = 0).',
    scaffoldedExample: {
      problem: 'A 1000 kg car cruises along a straight highway at a constant velocity of 25 m/s. If total friction is 600 N, what is the net forward force?',
      steps: [
        'Step 1: Check kinematic status: Velocity is constant, which means acceleration a = 0 m/s²',
        'Step 2: Apply Newton\'s 2nd Law F_net = m × a → F_net = 1000 × 0 = 0 N',
        'Step 3: Forward engine force equals resistive force (600 N - 600 N = 0 N net force)',
      ],
      answer: 'Net force = 0 N (Engine thrust is 600 N)',
    },
    visualAnchorOrFormula: '∑F = 0  ⟺  v = constant  (a = 0)',
    prerequisites: ['Velocity', 'Acceleration', 'Resultant vector'],
  },
  {
    id: 'phys_energy_conservation',
    domain: 'physics',
    title: 'The Law of Universal Conservation of Energy',
    oneSentenceRule: 'Energy cannot be created or destroyed; it can only be transformed from one form to another, such that the total energy of an isolated system remains constant.',
    firstPrinciplesExplanation: 'In mechanical systems free of dissipative friction, loss of gravitational potential energy (mgh) converts directly into kinetic energy (½mv²), maintaining mechanical invariant E_total = PE + KE.',
    commonMisconception: 'Believing energy is "consumed" or "lost". It is merely dissipated as non-recoverable thermal vibrations in surrounding air or contact surfaces.',
    scaffoldedExample: {
      problem: 'A 2 kg stone is dropped from a cliff 20 m high. Assuming g = 10 m/s² and no air resistance, find its speed just before impact.',
      steps: [
        'Step 1: Initial energy at top: PE = mgh = 2 × 10 × 20 = 400 J (KE = 0)',
        'Step 2: By conservation of energy, all PE converts to KE at the bottom: ½mv² = 400 J',
        'Step 3: Solve for v: ½ × 2 × v² = 400 → v² = 400 → v = 20 m/s',
      ],
      answer: 'v = 20 m/s',
    },
    visualAnchorOrFormula: 'E_initial = E_final  |  mgh = ½mv²',
    prerequisites: ['Work = Force × Distance', 'Kinetic & Potential energy definitions'],
  },

  // CHEMISTRY FOUNDATIONS
  {
    id: 'chem_mole_concept',
    domain: 'chemistry',
    title: 'The Mole Concept & Conservation of Mass',
    oneSentenceRule: 'One mole of any chemical substance contains exactly 6.022 × 10²³ constituent particles (Avogadro\'s number) and has a mass in grams equal to its relative formula mass.',
    firstPrinciplesExplanation: 'Atoms react as whole indivisible discrete units, not as arbitrary grams. The mole bridges the subatomic microscopic world of atomic mass units (u) with measurable laboratory masses in grams.',
    commonMisconception: 'Assuming 10 grams of Reactant A will react with 10 grams of Reactant B. Mass never reacts 1:1 unless molar masses happen to be identical; reactions follow stoichiometric mole ratios.',
    scaffoldedExample: {
      problem: 'How many grams of water (H₂O, M = 18 g/mol) are produced by completely burning 16 g of methane (CH₄, M = 16 g/mol)? Reaction: CH₄ + 2O₂ → CO₂ + 2H₂O',
      steps: [
        'Step 1: Calculate moles of methane: n = mass / M = 16 g / 16 g/mol = 1.0 mol CH₄',
        'Step 2: Look at the stoichiometric ratio: 1 mol CH₄ produces 2 mol H₂O',
        'Step 3: Calculate moles of water: 1.0 mol × 2 = 2.0 mol H₂O',
        'Step 4: Convert moles to grams: mass = n × M = 2.0 mol × 18 g/mol = 36 g',
      ],
      answer: '36 g of H₂O',
    },
    visualAnchorOrFormula: 'n = m / M  |  N = n × N_A (6.022 × 10²³)',
    prerequisites: ['Atomic structure', 'Periodic table masses'],
  },
  {
    id: 'chem_ph_equilibrium',
    domain: 'chemistry',
    title: 'The Logarithmic pH Scale & Water Autoionization',
    oneSentenceRule: 'pH is the negative logarithm to base 10 of hydrogen ion concentration [H⁺]; each whole-unit decrease in pH represents a tenfold (10×) increase in acidity.',
    firstPrinciplesExplanation: 'Pure water self-ionizes in an equilibrium H₂O ⇌ H⁺ + OH⁻ with ionic product K_w = [H⁺][OH⁻] = 1.0 × 10⁻¹⁴ at 25°C. When [H⁺] = [OH⁻] = 10⁻⁷ M, pH = -log(10⁻⁷) = 7.0 (neutral).',
    commonMisconception: 'Thinking a solution of pH 3 is "twice as acidic" as pH 6. Because the scale is logarithmic, pH 3 has 10³ = 1000 times higher hydrogen ion concentration than pH 6.',
    scaffoldedExample: {
      problem: 'What is the pH of a 0.01 M hydrochloric acid (HCl) solution?',
      steps: [
        'Step 1: Identify acid type: HCl is a strong monoprotic acid that dissociates completely into H⁺ and Cl⁻',
        'Step 2: Therefore, [H⁺] = 0.01 M = 10⁻² M',
        'Step 3: Compute pH = -log₁₀[H⁺] = -log₁₀(10⁻²) = -(-2) = 2.0',
      ],
      answer: 'pH = 2.0',
    },
    visualAnchorOrFormula: 'pH = -log₁₀[H⁺]  |  pH + pOH = 14',
    prerequisites: ['Logarithms to base 10', 'Equilibrium constants'],
  },

  // BIOLOGY FOUNDATIONS
  {
    id: 'bio_cell_osmosis',
    domain: 'biology',
    title: 'The Principles of Diffusion & Osmotic Potential',
    oneSentenceRule: 'Osmosis is the net movement of water molecules from a region of higher water potential (dilute) to lower water potential (concentrated) across a partially permeable membrane.',
    firstPrinciplesExplanation: 'Solute particles bind water molecules into hydration shells, decreasing the concentration of free, unbonded water molecules available to diffuse through membrane pores.',
    commonMisconception: 'Confusing the direction of water movement with solute movement. Water moves TOWARD the higher solute concentration to dilute it.',
    scaffoldedExample: {
      problem: 'A plant cell placed in pure distilled water becomes turgid rather than bursting. Why?',
      steps: [
        'Step 1: Distilled water has higher water potential than the plant cell cytoplasm',
        'Step 2: Water enters the vacuole via osmosis by net inflow',
        'Step 3: The rigid cellulose cell wall exerts opposing turgor pressure preventing cell lysis (unlike animal red blood cells which burst)',
      ],
      answer: 'Cell wall prevents bursting by developing turgor pressure.',
    },
    visualAnchorOrFormula: 'Ψ = Ψ_s + Ψ_p (Water potential gradient)',
    prerequisites: ['Cell membrane structure', 'Solutions and solute'],
  },

  // LITERATURE & LANGUAGE FOUNDATIONS
  {
    id: 'lit_rhetorical_triangle',
    domain: 'literature_english',
    title: 'Aristotle\'s Foundational Rhetorical Triangle',
    oneSentenceRule: 'Any persuasive text or speech relies upon a triadic balance between Ethos (speaker authority/credibility), Pathos (audience emotional appeal), and Logos (rational logic/evidence).',
    firstPrinciplesExplanation: 'An argument failing in credibility (Ethos) is dismissed as deceitful; one lacking emotional resonance (Pathos) fails to motivate action; one lacking verifiable logic (Logos) is refuted under scrutiny.',
    commonMisconception: 'Treating rhetoric as "dishonest ornament". Rhetoric is the fundamental architectural framework by which human consciousness interprets evidence and narrative motives.',
    scaffoldedExample: {
      problem: 'In Antony\'s funeral oration in Julius Caesar, how does "Brutus is an honourable man" function?',
      steps: [
        'Step 1: On surface level, Antony acknowledges Brutus\'s Ethos (credibility)',
        'Step 2: He juxtaposes Caesar weeping for the poor (Pathos) and refusing the crown thrice (Logos)',
        'Step 3: The relentless repetition turns the assertion into lethal verbal irony, dismantling Brutus\'s credibility',
      ],
      answer: 'Verbal irony subverting Ethos through contradictory Logos and Pathos.',
    },
    visualAnchorOrFormula: 'Ethos (Credibility) ↔ Pathos (Emotion) ↔ Logos (Reason)',
    prerequisites: ['Basic reading comprehension', 'Essay structure'],
  },

  // EXAM TECHNIQUE FOUNDATIONS
  {
    id: 'exam_time_per_mark',
    domain: 'exam_technique',
    title: 'The Mathematical Time-per-Mark Rule',
    oneSentenceRule: 'Always budget exam minutes strictly by dividing available solving time by total allocated marks (typically 1.0 to 1.2 minutes per mark) to avoid running out of time on high-tariff questions.',
    firstPrinciplesExplanation: 'Examiners award marks uniformly per assessment objective. Spending 20 minutes on a 3-mark question sacrifices 15 potential method marks at the end of the paper.',
    commonMisconception: 'Perfectionist trap: spending 30% of total exam time polishing Question 1 because it appears first.',
    scaffoldedExample: {
      problem: 'In a 2-hour (120 min) WAEC Theory paper worth 100 marks, how long should you spend on an 8-mark question?',
      steps: [
        'Step 1: Deduct 10 min reading and 10 min final check → 100 minutes net solving time',
        'Step 2: 100 minutes / 100 marks = 1.0 minute per mark',
        'Step 3: 8 marks × 1.0 min = 8 minutes maximum',
      ],
      answer: 'Maximum 8 minutes before moving forward.',
    },
    visualAnchorOrFormula: 'Time Allocated = Marks × (Net Exam Minutes / Total Marks)',
    prerequisites: ['Pacing awareness'],
  },
];

export const FOUNDATION_DIAGNOSTIC_QUESTIONS: FoundationDiagnosticQuestion[] = [
  {
    id: 'fdq_1',
    domain: 'mathematics',
    prerequisiteConcept: 'Operational Precedence (BODMAS)',
    question: 'What is the correct evaluation of the expression: 18 - 3 × 4 + 6 ÷ 2?',
    options: ['9', '8', '33', '15'],
    correctAnswer: '9',
    foundationExplanation: 'By BODMAS, multiplication and division take precedence: 3 × 4 = 12 and 6 ÷ 2 = 3. The expression becomes 18 - 12 + 3. Working left-to-right: 18 - 12 = 6, and 6 + 3 = 9.',
  },
  {
    id: 'fdq_2',
    domain: 'physics',
    prerequisiteConcept: 'Newton\'s First Law & Net Force',
    question: 'A satellite orbits Earth at constant speed in a circular path. Is its net force zero?',
    options: [
      'No, because its direction is continuously changing, requiring a centripetal force',
      'Yes, because its speed is constant',
      'Yes, because there is no air friction in outer space',
      'No, because it is running out of fuel',
    ],
    correctAnswer: 'No, because its direction is continuously changing, requiring a centripetal force',
    foundationExplanation: 'Velocity is a vector quantity having both magnitude (speed) and direction. Even though speed is constant, the direction changes every microsecond, which is an acceleration requiring a gravitational centripetal force.',
  },
  {
    id: 'fdq_3',
    domain: 'chemistry',
    prerequisiteConcept: 'Mole Ratio vs Mass Ratio',
    question: 'In the reaction 2H₂ + O₂ → 2H₂O, 4 moles of H₂ react with 2 moles of O₂. How many moles of H₂O are produced?',
    options: ['4 moles', '2 moles', '6 moles', '8 moles'],
    correctAnswer: '4 moles',
    foundationExplanation: 'The stoichiometric mole ratio between H₂ and H₂O is 2:2 (or 1:1). Therefore, 4 moles of H₂ produce exactly 4 moles of H₂O when excess oxygen is available.',
  },
  {
    id: 'fdq_4',
    domain: 'biology',
    prerequisiteConcept: 'Osmosis & Water Potential',
    question: 'What happens to a red blood cell when placed in a concentrated salt solution (hypertonic)?',
    options: [
      'It shrinks and crenates because water leaves the cell by osmosis',
      'It swells and bursts because salt enters the cell',
      'It remains unchanged because the membrane is impermeable',
      'It divides rapidly into two daughter cells',
    ],
    correctAnswer: 'It shrinks and crenates because water leaves the cell by osmosis',
    foundationExplanation: 'Water moves from higher water potential (inside the cell cytoplasm) to lower water potential (the hypertonic salty exterior) across the cell membrane, causing cell crenation.',
  },
];
