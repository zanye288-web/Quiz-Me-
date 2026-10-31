import React, { createContext, useContext, useState, useEffect } from 'react';
import { soundFx } from '../utils/audio';
import { QuestionFoundationScaffold } from '../types/foundation';

const FOUNDATION_STORAGE_KEY = 'quizme_foundation_tier_mode_v1';

interface FoundationContextValue {
  isFoundationMode: boolean;
  toggleFoundationMode: () => void;
  setFoundationMode: (enabled: boolean) => void;
  getFoundationScaffolding: (topic?: string, questionText?: string) => QuestionFoundationScaffold;
}

const FoundationContext = createContext<FoundationContextValue | undefined>(undefined);

export const FoundationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFoundationMode, setIsFoundationModeState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FOUNDATION_STORAGE_KEY);
      return saved ? saved === 'true' : true; // Default to ON to support foundational learning for all candidates
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem(FOUNDATION_STORAGE_KEY, String(isFoundationMode));
  }, [isFoundationMode]);

  const toggleFoundationMode = () => {
    soundFx.playClick();
    setIsFoundationModeState((prev) => !prev);
  };

  const setFoundationMode = (enabled: boolean) => {
    soundFx.playClick();
    setIsFoundationModeState(enabled);
  };

  const getFoundationScaffolding = (topic?: string, questionText?: string): QuestionFoundationScaffold => {
    const t = (topic || '').toLowerCase();
    const q = (questionText || '').toLowerCase();

    if (t.includes('math') || t.includes('algebra') || q.includes('solve') || q.includes('equation') || q.includes('calculate')) {
      return {
        prerequisiteRule: 'Algebraic Balancing Invariant: Apply identical inverse operations to both sides of the equals sign.',
        vocabularyClarifications: {
          'Coefficient': 'The multiplier number placed directly in front of a variable (e.g. in 5x, 5 is the coefficient).',
          'Evaluate': 'Calculate the exact numerical value by substituting given numbers.',
          'Simplify': 'Combine like terms and reduce fractions to their lowest terms.',
        },
        firstPrinciplesSteps: [
          'Step 1: Identify what is given and isolate the primary variable or operation.',
          'Step 2: Eliminate brackets and apply BODMAS operational precedence.',
          'Step 3: Collect like terms onto one side of the equals sign and solve.',
        ],
        keyFormulaOrDiagram: 'BODMAS Hierarchy: Brackets → Orders → Division/Multiplication → Addition/Subtraction',
        examinerTrapToAvoid: 'Never drop negative signs when distributing across parentheses: -(a - b) = -a + b.',
      };
    }

    if (t.includes('physic') || q.includes('force') || q.includes('velocity') || q.includes('energy') || q.includes('motion')) {
      return {
        prerequisiteRule: 'Newtonian Motion Principle: Net acceleration only occurs when unbalanced resultant forces exist (F_net = ma).',
        vocabularyClarifications: {
          'Scalar': 'A quantity with magnitude only (e.g., speed, distance, mass, energy).',
          'Vector': 'A quantity having both magnitude and directional orientation (e.g., velocity, displacement, force).',
          'Inertia': 'The innate physical resistance of any mass to a change in its velocity.',
        },
        firstPrinciplesSteps: [
          'Step 1: Write down known physical quantities with standard SI units (m, s, kg, N).',
          'Step 2: Select the governing conservation law (e.g. Energy Conservation or Momentum Conservation).',
          'Step 3: Substitute values and check dimensional consistency of the final answer.',
        ],
        keyFormulaOrDiagram: 'v = u + at  |  s = ut + ½at²  |  v² = u² + 2as  |  F = ma',
        examinerTrapToAvoid: 'Always check if units need conversion (e.g. km/h to m/s, or grams to kilograms) before calculating.',
      };
    }

    if (t.includes('chem') || q.includes('mole') || q.includes('atom') || q.includes('reaction') || q.includes('acid')) {
      return {
        prerequisiteRule: 'Conservation of Mass & Stoichiometry: Atoms are neither created nor destroyed; reactions follow whole-number mole ratios.',
        vocabularyClarifications: {
          'Mole': 'Standard chemical measuring unit containing 6.022 × 10²³ particles (n = mass / Molar Mass).',
          'Anion': 'A negatively charged ion that has gained electrons (migrates to anode).',
          'Cation': 'A positively charged ion that has lost electrons (migrates to cathode).',
        },
        firstPrinciplesSteps: [
          'Step 1: Ensure the chemical equation is properly balanced on both sides.',
          'Step 2: Convert given masses or volumes into moles (n = m / M).',
          'Step 3: Use the stoichiometric coefficients ratio to find target moles.',
        ],
        keyFormulaOrDiagram: 'n = mass (g) / Molar Mass (g/mol)  |  c = n / V (mol/dm³)',
        examinerTrapToAvoid: 'Never use mass directly in chemical ratios; always convert to moles first.',
      };
    }

    if (t.includes('bio') || q.includes('cell') || q.includes('gene') || q.includes('organ') || q.includes('plant')) {
      return {
        prerequisiteRule: 'Structure-Function Adaptation: Biological cellular structures are specialized to minimize diffusion distances and maximize surface area.',
        vocabularyClarifications: {
          'Osmosis': 'Net diffusion of water from high water potential to low water potential across a partially permeable membrane.',
          'Allele': 'Alternative variant form of a specific gene (e.g. dominant B vs recessive b).',
          'Enzyme': 'Biological protein catalyst that lowers the activation energy of metabolic reactions.',
        },
        firstPrinciplesSteps: [
          'Step 1: Identify whether the phenomenon is physical diffusion, enzymatic catalysis, or genetic inheritance.',
          'Step 2: Relate the cellular structure to its specific physiological role.',
          'Step 3: Cite the controlling factor (e.g., surface area-to-volume ratio or concentration gradient).',
        ],
        keyFormulaOrDiagram: 'Surface Area : Volume Ratio = High diffusion efficiency in microscopic cells',
        examinerTrapToAvoid: 'Do not confuse active transport (requires ATP energy against gradient) with passive diffusion.',
      };
    }

    // Default General Literature / Humanities / Social Sciences Scaffolding
    return {
      prerequisiteRule: 'First Principles of Textual Evidence: An analytical assertion must always be supported by textual evidence and context.',
      vocabularyClarifications: {
        'Theme': 'The central underlying message, moral argument, or societal critique in a text.',
        'Connotation': 'The emotional, cultural, or symbolic aura evoked by a word beyond its literal dictionary definition.',
        'Syntax': 'The deliberate arrangement of words and phrases to create well-formed sentences.',
      },
      firstPrinciplesSteps: [
        'Step 1: Read the passage closely to identify tone, speaker intent, and central subject.',
        'Step 2: Pinpoint key literary devices, verbs, and stylistic choices.',
        'Step 3: Explain the emotional and thematic effect upon the reader or audience.',
      ],
      keyFormulaOrDiagram: 'PEEL Framework: Point → Evidence → Explanation → Link to Thesis',
      examinerTrapToAvoid: 'Avoid simple plot retelling; Chief Examiners award marks for analysis of writer craft and technique.',
    };
  };

  return (
    <FoundationContext.Provider
      value={{
        isFoundationMode,
        toggleFoundationMode,
        setFoundationMode,
        getFoundationScaffolding,
      }}
    >
      {children}
    </FoundationContext.Provider>
  );
};

export const useFoundation = (): FoundationContextValue => {
  const context = useContext(FoundationContext);
  if (!context) {
    throw new Error('useFoundation must be used within a FoundationProvider');
  }
  return context;
};
