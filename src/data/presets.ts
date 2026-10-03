import { QuizResponse } from '../types/quiz';

export interface PresetTopic {
  id: string;
  title: string;
  category: string;
  pedagogical_topic?: 'STEM' | 'History' | 'Social Sciences' | 'Humanities & Literature' | 'Arts & Culture' | 'Business & Finance' | string;
  pedagogical_subtopic?: string;
  icon: string;
  description: string;
  mediaType: 'text' | 'video' | 'code' | 'science';
  inputText: string;
  mediaUrl?: string;
  suggestedTypes: Array<'multiple_choice' | 'fill_in_blank' | 'open_explanation' | 'code_media_challenge'>;
  prebuiltTeacherQuiz: QuizResponse;
  prebuiltStudentQuiz: QuizResponse;
}

export const PRESET_TOPICS: PresetTopic[] = [
  {
    id: 'quantum-computing',
    title: 'Quantum Computing & Qubits',
    category: 'Physics & Tech',
    pedagogical_topic: 'STEM',
    pedagogical_subtopic: 'Physics & Computing',
    icon: 'Atom',
    description: 'Superposition, entanglement, and quantum gates explained simply.',
    mediaType: 'science',
    inputText: `Quantum computing leverages quantum mechanical phenomena such as superposition and quantum entanglement to perform computations. Unlike classical bits that can only be 0 or 1, quantum bits (qubits) can exist in a superposition of states |0⟩ and |1⟩ simultaneously.
At [01:24], researchers demonstrate how the Hadamard gate puts a qubit into equal superposition.
At [03:45], the concept of quantum entanglement is explored, where the quantum state of two or more particles cannot be described independently.
At [06:12], decoherence is identified as the primary hardware challenge: ambient thermal noise and electromagnetic interference disrupt delicate qubit states.`,
    mediaUrl: 'https://youtube.com/watch?v=JhHMJCUmq28',
    suggestedTypes: ['multiple_choice', 'fill_in_blank', 'open_explanation', 'code_media_challenge'],
    prebuiltStudentQuiz: {
      app_name: 'Quiz Me!',
      persona: 'Student',
      quiz_title: 'Quantum Computing Fundamentals & Qubits',
      summary: 'A structured evaluation of quantum superposition, entanglement, and quantum logic gates.',
      difficulty: 'Intermediate',
      pedagogical_topic: 'STEM',
      pedagogical_subtopic: 'Physics & Computing',
      tags: ['#STEM', '#Physics', '#QuantumMechanics', '#LinearAlgebra', '#CircuitGates', '#Decoherence'],
      questions: [
        {
          id: 1,
          type: 'multiple_choice',
          question: 'What physical property allows a quantum bit (qubit) to exist in a linear combination of states |0⟩ and |1⟩ concurrently?',
          options: ['Superposition', 'Decoherence', 'Quantum Teleportation', 'Binary Overdrive'],
          correct_answer: 'Superposition',
          explanation: 'Superposition allows quantum bits to exist in a linear combination of states |0⟩ and |1⟩ until measured.',
          media_timestamp: '01:24',
          domain: 'Foundations',
          bloom_level: 'Remember',
          points: 15,
          gamified_feedback: {
            success_quote: 'Accurate concept recall! Superposition is fundamental to quantum advantage.',
            hint: 'Think about being in multiple basis states simultaneously before measurement.'
          }
        },
        {
          id: 2,
          type: 'fill_in_blank',
          question: 'When two qubits are linked such that measuring one instantly sets the state of the other, they are in a state of quantum ________.',
          correct_answer: 'entanglement',
          domain: 'Applied Logic',
          bloom_level: 'Understand',
          points: 20,
          blank_context: {
            prefix: 'When two qubits are linked such that measuring one instantly sets the state of the other, they are in a state of quantum ',
            suffix: '.',
            word_bank: ['entanglement', 'tunneling', 'resonance', 'compilation']
          },
          explanation: 'Entanglement produces non-local correlations between particles that cannot be explained by classical mechanics.',
          media_timestamp: '03:45',
          gamified_feedback: {
            success_quote: 'Spot on! Correct identification of quantum entanglement.',
            hint: 'Recall the state where composite wavefunctions cannot be factored into product states.'
          }
        },
        {
          id: 3,
          type: 'code_media_challenge',
          question: 'At timestamp [01:24], which quantum logic gate is used to rotate a qubit from |0⟩ into equal superposition (|0⟩ + |1⟩)/√2?',
          options: ['Hadamard Gate (H)', 'Pauli-X Gate (NOT)', 'CNOT Gate', 'Phase S Gate'],
          correct_answer: 'Hadamard Gate (H)',
          media_timestamp: '01:24',
          domain: 'Syntax & Execution',
          bloom_level: 'Apply',
          points: 25,
          code_snippet: `# Qiskit Quantum Circuit snippet
from qiskit import QuantumCircuit
qc = QuantumCircuit(1)
# Apply transformation to create superposition:
qc.h(0) # <-- Which gate is this?`,
          language: 'python',
          explanation: 'The Hadamard gate (H) maps basis states |0⟩ and |1⟩ to symmetric superpositions.',
          gamified_feedback: {
            success_quote: 'Correct calculation of quantum operator transformation.',
            hint: 'Look at the function `qc.h(0)` in the code snippet.'
          }
        },
        {
          id: 4,
          type: 'open_explanation',
          question: 'Explain why "decoherence" represents a primary engineering obstacle in superconducting quantum processors.',
          correct_answer: 'Decoherence happens when external noise, thermal energy, or magnetic interference causes qubits to lose their quantum phase coherence and collapse into classical errors.',
          explanation: 'Decoherence destroys fragile superposition and quantum information due to environmental thermal and electromagnetic noise.',
          media_timestamp: '06:12',
          domain: 'Analytical Reasoning',
          bloom_level: 'Analyze',
          points: 30,
          gamified_feedback: {
            success_quote: 'Comprehensive analysis of the thermodynamic isolation constraint.',
            hint: 'Think about environmental noise, heat, and loss of phase coherence.'
          }
        }
      ]
    },
    prebuiltTeacherQuiz: {
      app_name: 'Quiz Me!',
      persona: 'Teacher',
      quiz_title: 'Foundational Principles of Quantum Information Systems',
      summary: 'Curriculum-aligned formative assessment evaluating core quantum mechanics principles, circuit representations, and hardware error thresholds.',
      difficulty: 'Intermediate',
      study_guide: {
        key_takeaways: [
          'Qubits utilize linear combinations of Hilbert space vectors (|0⟩ and |1⟩).',
          'Unitary transformations (such as Hadamard and CNOT) preserve total quantum probability.',
          'Decoherence times (T1 and T2) set strict upper bounds on circuit depth before error mitigation.'
        ],
        core_vocabulary: [
          { term: 'Superposition', definition: 'The capacity of a quantum system to exist concurrently across multiple orthonormal basis states.' },
          { term: 'Quantum Entanglement', definition: 'Non-separable multi-particle state where composite wavefunctions cannot be factored into individual particle states.' },
          { term: 'Decoherence', definition: 'Loss of quantum coherence caused by unwanted thermodynamic coupling with the external environment.' }
        ],
        recommended_review: 'Review Dirac bra-ket notation and standard single-qubit unitary gate matrices.'
      },
      questions: [
        {
          id: 1,
          type: 'multiple_choice',
          question: 'Which mathematical condition distinguishes a valid single-qubit pure state α|0⟩ + β|1⟩ in Dirac notation?',
          options: ['|α|² + |β|² = 1 (Unit Probability)', 'α + β = 0', 'α × β = 1', '|α| = |β| at all times'],
          correct_answer: '|α|² + |β|² = 1 (Unit Probability)',
          explanation: 'Conservation of total probability dictates that the sum of the squared moduli of complex probability amplitudes must strictly equal 1.',
          media_timestamp: '01:24',
          pedagogy_note: 'Assesses standard quantum vector normalization understanding.',
          gamified_feedback: {
            success_quote: 'Accurate and rigorously justified. Full marks.',
            hint: 'Consider the requirement for total probability conservation across all measurement outcomes.'
          }
        },
        {
          id: 2,
          type: 'fill_in_blank',
          question: 'A two-qubit Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 represents a maximally ________ state that cannot be factored into product states.',
          correct_answer: 'entangled',
          blank_context: {
            prefix: 'A two-qubit Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 represents a maximally ',
            suffix: ' state that cannot be factored into product states.',
            word_bank: ['entangled', 'decoherent', 'classical', 'orthogonal']
          },
          explanation: 'Bell states demonstrate maximal quantum entanglement, violating Bell inequalities and confirming quantum non-locality.',
          media_timestamp: '03:45',
          pedagogy_note: 'Reinforces tensor product factorization and non-separability.',
          gamified_feedback: {
            success_quote: 'Excellent terminology recall and theoretical alignment.',
            hint: 'Recall the term for states that cannot be decomposed into |ψ_A⟩ ⊗ |ψ_B⟩.'
          }
        },
        {
          id: 3,
          type: 'code_media_challenge',
          question: 'Inspect the quantum circuit diagram code at [01:24]. What is the resulting state vector after applying the Hadamard gate to ground state |0⟩?',
          options: ['(|0⟩ + |1⟩)/√2', '|1⟩', '(|0⟩ - |1⟩)/√2', 'Undefined / Collapsed'],
          correct_answer: '(|0⟩ + |1⟩)/√2',
          media_timestamp: '01:24',
          code_snippet: `// Applying Unitary Hadamard Transformation:
H * |0> = 1/√2 * [ 1  1 ] * [ 1 ] = 1/√2 * [ 1 ]
                 [ 1 -1 ]   [ 0 ]          [ 1 ]
// Resulting State Vector: (|0> + |1>)/√2`,
          language: 'typescript',
          explanation: 'Matrix multiplication of the normalized Hadamard operator with the standard column vector [1, 0]^T yields [1/√2, 1/√2]^T.',
          gamified_feedback: {
            success_quote: 'Correct mathematical calculation of the unitary gate product.',
            hint: 'Multiply the Hadamard 2x2 matrix by the standard [1, 0] column vector.'
          }
        },
        {
          id: 4,
          type: 'open_explanation',
          question: 'Explain the physical mechanisms of environmental decoherence and its impact on quantum circuit depth.',
          correct_answer: 'Decoherence arises from unwanted physical interactions between qubits and ambient stray electromagnetic radiation, thermal vibrations (phonons), and materials defects. This introduces phase flips and energy relaxation, limiting the maximum sequence of gate operations (circuit depth) achievable before fidelity drops below fault-tolerant thresholds.',
          explanation: 'Standard pedagogical explanation should address: 1) Environmental coupling sources (thermal, magnetic, radiation); 2) Phase dampening / T2 coherence time; 3) Circuit depth constraint.',
          media_timestamp: '06:12',
          rubric: [
            'Identifies thermal/electromagnetic noise as root driver (30%)',
            'Mentions loss of phase coherence or wave collapse (35%)',
            'Connects coherence window to gate execution constraints (35%)'
          ],
          gamified_feedback: {
            success_quote: 'Comprehensive analysis addressing both the microscopic cause and structural engineering limit.',
            hint: 'Detail the interaction between ambient temperature and qubit wavefunction collapse.'
          }
        }
      ]
    }
  },
  {
    id: 'python-concurrency',
    title: 'Python Async/Await & Event Loop',
    category: 'Software & Code',
    pedagogical_topic: 'STEM',
    pedagogical_subtopic: 'Computer Science',
    icon: 'Code2',
    description: 'Master coroutines, async/await patterns, non-blocking I/O, and race conditions.',
    mediaType: 'code',
    inputText: `In Python, asynchronous programming is powered by the 'asyncio' library and an underlying single-threaded Event Loop.
Functions defined with 'async def' return coroutines that must be awaited using 'await'.
At timestamp [02:10], we compare CPU-bound vs I/O-bound tasks: asyncio excels at I/O concurrency (network calls, DB queries), while multiprocessing is required for CPU-heavy calculations due to the Global Interpreter Lock (GIL).
At [04:30], asyncio.gather(*tasks) is demonstrated to execute multiple coroutines concurrently without blocking the main event loop.`,
    mediaUrl: 'https://docs.python.org/3/library/asyncio.html',
    suggestedTypes: ['multiple_choice', 'fill_in_blank', 'code_media_challenge', 'open_explanation'],
    prebuiltStudentQuiz: {
      app_name: 'Quiz Me!',
      persona: 'Student',
      quiz_title: 'Async Python Mastery: Speed Up Your Code! 🐍⚡',
      summary: 'Level up your asynchronous Python powers with coroutines, event loops, and non-blocking I/O.',
      difficulty: 'Intermediate',
      questions: [
        {
          id: 1,
          type: 'multiple_choice',
          question: 'What keyword in Python converts a standard function into an asynchronous coroutine?',
          options: ['async def', 'thread def', 'coroutine def', 'defer func'],
          correct_answer: 'async def',
          explanation: 'Using `async def` defines a native coroutine function that yields control back to the event loop when awaited.',
          gamified_feedback: {
            success_quote: 'Boom! You are writing async code like a senior dev! 🚀',
            hint: 'It starts with "async" followed by the standard function keyword.'
          }
        },
        {
          id: 2,
          type: 'code_media_challenge',
          question: 'Inspect the code snippet below. Which helper function allows running multiple async tasks concurrently and gathering their results?',
          options: ['asyncio.gather()', 'asyncio.run_parallel()', 'asyncio.wait_all()', 'asyncio.combine()'],
          correct_answer: 'asyncio.gather()',
          media_timestamp: '04:30',
          code_snippet: `import asyncio

async def fetch_data(id):
    await asyncio.sleep(1)
    return f"Data {id}"

async def main():
    # Run 3 network fetches concurrently in 1 second:
    results = await asyncio.________(
        fetch_data(1),
        fetch_data(2),
        fetch_data(3)
    )
    print(results)`,
          language: 'python',
          explanation: '`asyncio.gather()` takes multiple awaitables, schedules them on the event loop, and aggregates results in order.',
          gamified_feedback: {
            success_quote: 'High-five! 3x concurrency multiplier activated! 🔥',
            hint: 'Think of "gathering" or collecting fruits together.'
          }
        },
        {
          id: 3,
          type: 'fill_in_blank',
          question: 'Because of the Global Interpreter Lock (GIL), asyncio is ideal for ________-bound operations, not CPU-heavy number crunching.',
          correct_answer: 'I/O',
          blank_context: {
            prefix: 'Because of the Global Interpreter Lock (GIL), asyncio is ideal for ',
            suffix: '-bound operations, not CPU-heavy number crunching.',
            word_bank: ['I/O', 'RAM', 'GPU', 'Disk']
          },
          explanation: 'Async shines when waiting for network, socket, or file I/O because the thread can do other work while waiting.',
          media_timestamp: '02:10',
          gamified_feedback: {
            success_quote: 'Nailed it! Input/Output efficiency at its finest.',
            hint: 'Stands for Input/Output (2 letters).'
          }
        }
      ]
    },
    prebuiltTeacherQuiz: {
      app_name: 'Quiz Me!',
      persona: 'Teacher',
      quiz_title: 'Asynchronous Architecture & Concurrency in Modern Python',
      summary: 'Rigorous assessment evaluating event loop lifecycle, cooperative multitasking semantics, and GIL concurrency trade-offs.',
      difficulty: 'Intermediate',
      questions: [
        {
          id: 1,
          type: 'multiple_choice',
          question: 'What occurs under the hood when an un-awaited coroutine is called directly in Python (e.g. `result = fetch_data()`)?',
          options: ['A coroutine object is created, but no execution takes place', 'It runs synchronously on the main thread', 'It spawns a background OS thread', 'It immediately raises a SyntaxError at compile time'],
          correct_answer: 'A coroutine object is created, but no execution takes place',
          explanation: 'Calling an async def function returns a coroutine object immediately without executing its body until it is scheduled on an active event loop with await, asyncio.run(), or create_task().',
          gamified_feedback: {
            success_quote: 'Accurate technical analysis of Python coroutine dispatch semantics.',
            hint: 'Recall that async functions return generator-like generator/coroutine frames.'
          }
        },
        {
          id: 2,
          type: 'open_explanation',
          question: 'Differentiate between preemptive multithreading and cooperative multitasking within the context of the Python asyncio Event Loop.',
          correct_answer: 'Preemptive multithreading relies on the OS kernel scheduler to interrupt running threads via time-slicing and context switching, requiring locks/mutexes to prevent race conditions. Cooperative multitasking in asyncio relies on tasks explicitly yielding control back to the single-threaded event loop at defined await points (I/O boundaries), preventing arbitrary mid-operation preemption.',
          explanation: 'Student should explain the fundamental distinction: OS scheduler preemption vs voluntary yield at await points.',
          gamified_feedback: {
            success_quote: 'Exemplary explanation of scheduling mechanisms and thread safety.',
            hint: 'Contrast OS kernel preemption with explicit task yielding via await.'
          }
        }
      ]
    }
  },
  {
    id: 'crispr-gene-editing',
    title: 'CRISPR-Cas9 & Genetic Engineering',
    category: 'Biology & Medicine',
    pedagogical_topic: 'STEM',
    pedagogical_subtopic: 'Life Sciences',
    icon: 'Dna',
    description: 'Guide RNAs, Cas9 molecular scissors, double-strand breaks, and targeted gene modification.',
    mediaType: 'science',
    inputText: `CRISPR-Cas9 is a revolutionary gene-editing technology derived from a bacterial adaptive immune system.
Cas9 is an endonuclease enzyme acting as 'molecular scissors' that cuts target DNA strands.
The guide RNA (gRNA) contains a 20-nucleotide sequence that matches and binds to the target genomic region.
At [02:40], the PAM (Protospacer Adjacent Motif) sequence (5'-NGG-3') is highlighted as the crucial recognition tag required for Cas9 binding.
At [05:15], after Cas9 induces a double-strand break (DSB), the cell repairs the cut via Non-Homologous End Joining (NHEJ, causing gene knockout) or Homology-Directed Repair (HDR, enabling precise gene insertion).`,
    mediaUrl: 'https://nature.com/articles/crispr-overview',
    suggestedTypes: ['multiple_choice', 'fill_in_blank', 'open_explanation'],
    prebuiltStudentQuiz: {
      app_name: 'Quiz Me!',
      persona: 'Student',
      quiz_title: 'CRISPR Bio-Hack: Rewrite the Code of Life! 🧬✂️',
      summary: 'Test your genetics knowledge on molecular scissors, guide RNAs, and revolutionary gene editing.',
      difficulty: 'Intermediate',
      pedagogical_topic: 'STEM',
      pedagogical_subtopic: 'Life Sciences',
      tags: ['#STEM', '#LifeSciences', '#Biology', '#CRISPR', '#Genetics', '#ActiveRecall'],
      questions: [
        {
          id: 1,
          type: 'multiple_choice',
          question: 'What is the role of Cas9 in the CRISPR-Cas9 complex?',
          options: ['Molecular scissors that cut DNA strands', 'A scanner that produces light', 'A protein that glues RNA together', 'A virus that attacks bacteria'],
          correct_answer: 'Molecular scissors that cut DNA strands',
          explanation: 'Cas9 is an endonuclease enzyme that creates precise double-strand cuts in genomic DNA.',
          gamified_feedback: {
            success_quote: 'Snip snip! You mastered the molecular scissors! ✂️🌟',
            hint: 'Think of an enzyme that makes precise cuts in the DNA double helix.'
          }
        },
        {
          id: 2,
          type: 'fill_in_blank',
          question: 'To direct Cas9 to the exact gene sequence you want to edit, researchers provide a custom ________ RNA.',
          correct_answer: 'guide',
          blank_context: {
            prefix: 'To direct Cas9 to the exact gene sequence you want to edit, researchers provide a custom ',
            suffix: ' RNA.',
            word_bank: ['guide', 'messenger', 'ribosomal', 'transfer']
          },
          explanation: 'Guide RNA (gRNA) pairs with the complementary target DNA sequence to guide Cas9 directly to the target location.',
          gamified_feedback: {
            success_quote: 'Bullseye! Direct hit on the genome target! 🎯',
            hint: 'Word meaning a compass or map leader (starts with "g").'
          }
        }
      ]
    },
    prebuiltTeacherQuiz: {
      app_name: 'Quiz Me!',
      persona: 'Teacher',
      quiz_title: 'CRISPR-Cas9 Mechanisms, PAM Recognition, and DNA Repair Pathways',
      summary: 'Standards-aligned assessment examining endonuclease mechanics, PAM motif verification, and NHEJ vs HDR repair outcomes.',
      difficulty: 'Master',
      pedagogical_topic: 'STEM',
      pedagogical_subtopic: 'Life Sciences',
      tags: ['#STEM', '#LifeSciences', '#Biology', '#CRISPR', '#Endonuclease'],
      questions: [
        {
          id: 1,
          type: 'multiple_choice',
          question: 'What is the canonical Protospacer Adjacent Motif (PAM) sequence recognized by Streptococcus pyogenes Cas9 (SpCas9)?',
          options: ['5\'-NGG-3\'', '5\'-TATA-3\'', '5\'-AAG-3\'', '5\'-CCCG-3\''],
          correct_answer: '5\'-NGG-3\'',
          explanation: 'SpCas9 strictly requires a 5\'-NGG-3\' PAM sequence immediately adjacent to the 3\' end of the target protospacer on the non-target strand to initiate DNA unwinding and cleavage.',
          media_timestamp: '02:40',
          pedagogy_note: 'Verifies understanding of strict PAM motif constraints in CRISPR cleavage design.',
          gamified_feedback: {
            success_quote: 'Accurate biochemical identification of the SpCas9 PAM consensus.',
            hint: 'Identify the 3-base motif containing two Guanine residues.'
          }
        }
      ]
    }
  },
  {
    id: 'french-revolution',
    title: 'The French Revolution & Fall of the Bastille',
    category: 'History',
    pedagogical_topic: 'History',
    pedagogical_subtopic: 'European & World History',
    icon: 'Landmark',
    description: 'The Estates-General, Storming of the Bastille, Declaration of the Rights of Man, and the Reign of Terror.',
    mediaType: 'text',
    inputText: `In 1789, fiscal crisis, bad harvests, and popular unrest led King Louis XVI to convene the Estates-General. On July 14, 1789, Parisian insurgents stormed the medieval fortress and prison known as the Bastille, symbolizing the overthrow of royal despotism. In August 1789, the National Constituent Assembly published the Declaration of the Rights of Man and of the Citizen, proclaiming liberty, equality, and popular sovereignty. By 1793, the radical Jacobins led by Maximilien Robespierre established the Committee of Public Safety, initiating the Reign of Terror.`,
    suggestedTypes: ['multiple_choice', 'fill_in_blank', 'open_explanation'],
    prebuiltStudentQuiz: {
      app_name: 'Quiz Me!',
      persona: 'Student',
      quiz_title: 'The French Revolution: Liberty, Equality & The Bastille 🇫🇷⚔️',
      summary: 'Explore the key events, revolutionary ideals, and dramatic turning points of the French Revolution.',
      difficulty: 'Intermediate',
      pedagogical_topic: 'History',
      pedagogical_subtopic: 'European & World History',
      tags: ['#History', '#WorldHistory', '#FrenchRevolution', '#Bastille', '#Enlightenment', '#ActiveRecall'],
      questions: [
        {
          id: 1,
          type: 'multiple_choice',
          question: 'What iconic Parisian fortress was stormed by citizens on July 14, 1789, marking the flashpoint of the French Revolution?',
          options: ['The Bastille', 'The Louvre', 'Palace of Versailles', 'Notre-Dame'],
          correct_answer: 'The Bastille',
          explanation: 'The Storming of the Bastille on July 14, 1789 symbolized the dramatic collapse of royal absolute authority in Paris.',
          gamified_feedback: {
            success_quote: 'Vive la Révolution! Landmark historical recall achieved! 🏰🔥',
            hint: 'A medieval fortress prison that held gunpowder.'
          }
        },
        {
          id: 2,
          type: 'fill_in_blank',
          question: 'The revolutionary document adopted in August 1789 establishing universal human liberties was the Declaration of the Rights of ________ and of the Citizen.',
          correct_answer: 'Man',
          blank_context: {
            prefix: 'Declaration of the Rights of ',
            suffix: ' and of the Citizen.',
            word_bank: ['Man', 'Monarchs', 'Nobility', 'State']
          },
          explanation: 'The Declaration of the Rights of Man and of the Citizen proclaimed liberty, property, and freedom from oppression.',
          gamified_feedback: {
            success_quote: 'Foundational human rights knowledge unlocked! 📜✨',
            hint: 'A 3-letter word referring to humankind.'
          }
        }
      ]
    },
    prebuiltTeacherQuiz: {
      app_name: 'Quiz Me!',
      persona: 'Teacher',
      quiz_title: 'Sociopolitical Dynamics & Historiography of the French Revolution',
      summary: 'Comprehensive curriculum module on institutional breakdown, revolutionary legislation, and Jacobin governance.',
      difficulty: 'Master',
      pedagogical_topic: 'History',
      pedagogical_subtopic: 'European History',
      tags: ['#History', '#WorldHistory', '#FrenchRevolution', '#Robespierre', '#Jacobins'],
      questions: [
        {
          id: 1,
          type: 'multiple_choice',
          question: 'Which revolutionary governing body directed the Reign of Terror during the height of the radical republic in 1793-1794?',
          options: ['Committee of Public Safety', 'National Assembly', 'Directory', 'Estates-General'],
          correct_answer: 'Committee of Public Safety',
          explanation: 'The Committee of Public Safety, led primarily by Maximilien Robespierre and Louis Antoine de Saint-Just, oversaw the revolutionary tribunal and wartime mobilization during the Terror.',
          pedagogy_note: 'Assesses institutional understanding of radical phase power concentration.',
          gamified_feedback: {
            success_quote: 'Flawless institutional governance recall.',
            hint: 'Headed by Robespierre to suppress counter-revolution.'
          }
        }
      ]
    }
  },
  {
    id: 'macroeconomics-policy',
    title: 'Macroeconomics, Inflation & Monetary Policy',
    category: 'Social Sciences',
    pedagogical_topic: 'Social Sciences',
    pedagogical_subtopic: 'Economics & Public Policy',
    icon: 'TrendingUp',
    description: 'Central bank interest rates, consumer price index (CPI), demand-pull inflation, and fiscal stimulus mechanics.',
    mediaType: 'text',
    inputText: `Macroeconomics analyzes economy-wide phenomena such as inflation, price levels, rate of economic growth, national income, gross domestic product (GDP), and changes in unemployment.
Monetary policy is conducted by a nation's central bank (such as the Federal Reserve or European Central Bank) by adjusting the benchmark interest rate and controlling the money supply. When inflation rises above target levels, the central bank implements contractionary monetary policy by raising interest rates to reduce aggregate demand. Fiscal policy, in contrast, involves government expenditure and tax collection set by legislative bodies.`,
    suggestedTypes: ['multiple_choice', 'fill_in_blank', 'open_explanation'],
    prebuiltStudentQuiz: {
      app_name: 'Quiz Me!',
      persona: 'Student',
      quiz_title: 'Macroeconomics 101: Inflation, Central Banks & Money 📈💵',
      summary: 'Learn how interest rates, supply and demand, and central bank decisions shape the global economy.',
      difficulty: 'Intermediate',
      pedagogical_topic: 'Social Sciences',
      pedagogical_subtopic: 'Economics & Public Policy',
      tags: ['#SocialSciences', '#Economics', '#Macroeconomics', '#Inflation', '#MonetaryPolicy', '#ActiveRecall'],
      questions: [
        {
          id: 1,
          type: 'multiple_choice',
          question: 'What action does a central bank typically take when seeking to cool down high inflation in the economy?',
          options: ['Raises interest rates', 'Lowers interest rates to zero', 'Prints more physical banknotes', 'Abolishes bank reserve requirements'],
          correct_answer: 'Raises interest rates',
          explanation: 'Raising benchmark interest rates increases the cost of borrowing, cooling down consumer spending and capital investment to dampen inflation.',
          gamified_feedback: {
            success_quote: 'Economic mastery! Central bank mechanism nailed! 🏦🎯',
            hint: 'Think about increasing the cost of borrowing money.'
          }
        },
        {
          id: 2,
          type: 'fill_in_blank',
          question: 'The total monetary value of all finished goods and services produced within a country in a specific time period is Gross Domestic ________ (GDP).',
          correct_answer: 'Product',
          blank_context: {
            prefix: 'Gross Domestic ',
            suffix: ' (GDP).',
            word_bank: ['Product', 'Profit', 'Purchase', 'Price']
          },
          explanation: 'Gross Domestic Product (GDP) represents the comprehensive scorecard of a country’s economic health.',
          gamified_feedback: {
            success_quote: 'Spot on! GDP definition internalized! 📊',
            hint: 'Starts with "P" - the output of production.'
          }
        }
      ]
    },
    prebuiltTeacherQuiz: {
      app_name: 'Quiz Me!',
      persona: 'Teacher',
      quiz_title: 'Macroeconomic Equilibrium, Inflation Dynamics & Central Bank Transmission',
      summary: 'Rigorous assessment on IS-LM frameworks, Phillips Curve trade-offs, and central bank balance sheet mechanisms.',
      difficulty: 'Master',
      pedagogical_topic: 'Social Sciences',
      pedagogical_subtopic: 'Economics',
      tags: ['#SocialSciences', '#Economics', '#Macroeconomics', '#MonetaryTransmission', '#PhillipsCurve'],
      questions: [
        {
          id: 1,
          type: 'multiple_choice',
          question: 'Under the standard Keynesian Phillips curve model, what is the short-run relationship between inflation and unemployment?',
          options: ['Inverse relationship (higher inflation correlates with lower unemployment)', 'Direct positive relationship', 'Zero correlation in all horizons', 'Unemployment causes runaway deflation'],
          correct_answer: 'Inverse relationship (higher inflation correlates with lower unemployment)',
          explanation: 'The short-run Phillips curve posits an inverse empirical tradeoff: as aggregate demand increases and lowers unemployment, wage and price pressures push inflation upward.',
          pedagogy_note: 'Assesses foundational macroeconomic tradeoff intuition.',
          gamified_feedback: {
            success_quote: 'Exceptional macroeconomic theory synthesis.',
            hint: 'Think about the inverse trade-off.'
          }
        }
      ]
    }
  }
];
