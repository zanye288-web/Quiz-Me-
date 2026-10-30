import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Sparkles,
  BookOpen,
  Headphones,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface AudioRevisionPodcastPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

interface PodcastEpisode {
  id: string;
  title: string;
  subject: string;
  durationLabel: string;
  transcript: string;
  keyTakeaways: string[];
}

const PREBUILT_EPISODES: PodcastEpisode[] = [
  {
    id: 'ep-math-waec',
    title: 'WAEC General Mathematics: Circle Theorems & Logarithm Mastery',
    subject: 'Mathematics',
    durationLabel: '3 mins · High Yield',
    transcript: `Welcome to the Quiz Me! 3-minute exam revision audio briefing for Senior Secondary General Mathematics.
Today we distill two guaranteed examination areas: Logarithm equations and Circle Theorems.
First, whenever you encounter log equations with mixed bases or coefficients, always recall the power rule: k times log x equals log of x to the power k. When subtracting logarithms with equal bases, apply the quotient law: log a minus log b equals log of a divided by b. Do not forget to check that extraneous roots never produce a logarithm of a non-positive number.
Second, Circle Theorems: Remember that the angle subtended by an arc at the center of a circle is exactly double the angle subtended at any point on the remaining circumference. In cyclic quadrilaterals, opposite angles always sum to 180 degrees. And in the alternate segment theorem, the angle between a tangent and a chord equals the angle in the alternate segment.
Draw a clear sketch, write your method steps [M1] clearly, and you will secure maximum marks in Section B. Good luck!`,
    keyTakeaways: [
      'log_b(x) - log_b(y) = log_b(x/y)',
      'Angle at center = 2 × angle at circumference',
      'Opposite angles of cyclic quadrilateral sum to 180°',
      'Always state theorem name for method marks (M1)',
    ],
  },
  {
    id: 'ep-phy-projectiles',
    title: 'Physics Kinematics: 2D Projectiles & Vector Resolution',
    subject: 'Physics',
    durationLabel: '3 mins · Mechanics',
    transcript: `Welcome to this Physics Audio Briefing covering Projectile Dynamics and Newtonian Mechanics.
When an object is projected at an angle theta with initial speed u, we immediately separate the motion into two independent orthogonal components.
Horizontally, assuming negligible air resistance, acceleration is zero. The horizontal velocity u cos theta remains completely constant throughout the flight.
Vertically, the object experiences a constant downward acceleration due to gravity, g. The vertical component of initial velocity is u sin theta.
At maximum height, vertical velocity momentarily becomes zero, which gives us the height formula: H equals u squared sin squared theta divided by 2g.
Total time of flight is twice the time to reach maximum height: T equals 2u sin theta divided by g.
Horizontal range is given by R equals u squared sin 2 theta divided by g, reaching maximum distance when the launch angle is exactly 45 degrees.
Always verify units: velocities in meters per second, angles in degrees or radians, and g equals 9.8 or 10 meters per second squared per exam board guidelines.`,
    keyTakeaways: [
      'Horizontal velocity u_x = u cos(θ) is constant',
      'At maximum height, v_y = 0',
      'Maximum range occurs at θ = 45°',
      'Total flight time T = (2u sin θ) / g',
    ],
  },
  {
    id: 'ep-chm-stoichiometry',
    title: 'Chemistry: Volumetric Titration & Mole Ratios Decoded',
    subject: 'Chemistry',
    durationLabel: '2.5 mins · Stoichiometry',
    transcript: `This is your rapid revision briefing on Quantitative Chemistry and Acid-Base Titration calculations.
In stoichiometric analysis, the fundamental bridge between mass and particle quantity is the mole. Number of moles equals mass in grams divided by molar mass in grams per mole.
For aqueous solutions, concentration or molarity is defined as moles of solute divided by volume of solution in cubic decimeters. Remember that one cubic decimeter equals 1000 cubic centimeters.
In volumetric neutralizations, apply the standard titration formula: C_a times V_a divided by C_b times V_b equals n_a divided by n_b.
Here, n_a and n_b are the stoichiometric coefficients taken directly from the balanced chemical equation.
Chief examiners note that candidates frequently lose accuracy marks by writing molarity without units or by rounding intermediate values prematurely. Keep three significant figures until the final answer.`,
    keyTakeaways: [
      'Moles n = mass / MolarMass',
      'Always convert cm³ to dm³ by dividing by 1000',
      '(Ca × Va) / (Cb × Vb) = na / nb from balanced equation',
      'Maintain 3 significant figures in final evaluation',
    ],
  },
];

export const AudioRevisionPodcastPlayer: React.FC<AudioRevisionPodcastPlayerProps> = ({
  isOpen,
  onClose,
  initialTopic,
}) => {
  const [selectedEpisode, setSelectedEpisode] = useState<PodcastEpisode>(PREBUILT_EPISODES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [synthVoice, setSynthVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Custom Topic Generator
  const [customTopicInput, setCustomTopicInput] = useState(initialTopic || '');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferred =
          voices.find((v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.lang.startsWith('en')) ||
          voices[0];
        setSynthVoice(preferred || null);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlaying) {
      handleStopSpeech();
      return;
    }

    soundFx.playClick();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(selectedEpisode.transcript);
    if (synthVoice) utterance.voice = synthVoice;
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
      soundFx.playComplete();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleSpeedChange = (spd: number) => {
    soundFx.playClick();
    setPlaybackSpeed(spd);
    if (isPlaying) {
      handleStopSpeech();
      setTimeout(handleTogglePlay, 100);
    }
  };

  const handleGenerateCustomPodcast = async () => {
    if (!customTopicInput.trim()) return;
    setIsGeneratingCustom(true);
    soundFx.playClick();

    try {
      const resp = await fetch('/api/ask-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Generate a high-yield, engaging, 2-minute examination audio podcast briefing for the topic: "${customTopicInput}". Include core formulas, step-by-step logic, and common examiner traps.`,
          persona: 'Teacher',
        }),
      });

      let text = '';
      if (resp.ok) {
        const json = await resp.json();
        text = json.reply || json.explanation || '';
      }

      if (!text) {
        text = `Welcome to this audio revision session on ${customTopicInput}. Focus on defining key variables, understanding the governing mechanism, and showing explicit method steps for full mark allocation.`;
      }

      const newEp: PodcastEpisode = {
        id: `custom-pod-${Date.now()}`,
        title: `${customTopicInput} (AI Audio Briefing)`,
        subject: 'Custom Subject',
        durationLabel: '2 mins · Synthesized',
        transcript: text,
        keyTakeaways: [
          `Master core definitions in ${customTopicInput}`,
          'Apply step-by-step method marks (M1)',
          'Review boundary conditions and units',
        ],
      };

      setSelectedEpisode(newEp);
      handleStopSpeech();
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Audio Revision Podcasts &amp; Voice Study Engine
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Listen to high-yield 3-minute exam revision audio briefings on the go.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              handleStopSpeech();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Episode Switcher */}
          <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            {PREBUILT_EPISODES.map((ep) => {
              const isSelected = selectedEpisode.id === ep.id;
              return (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => {
                    handleStopSpeech();
                    setSelectedEpisode(ep);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {ep.subject}: {ep.title.slice(0, 28)}...
                </button>
              );
            })}
          </div>

          {/* Active Episode Audio Card */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-lg border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  {selectedEpisode.subject} · {selectedEpisode.durationLabel}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {selectedEpisode.title}
                </h4>
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs">
                {[0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => handleSpeedChange(spd)}
                    className={`px-2 py-0.5 rounded-lg font-semibold cursor-pointer ${
                      playbackSpeed === spd ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Play Button & Controls */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-md"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
              </button>

              <div className="flex-1">
                <div className="text-xs text-slate-400">
                  {isPlaying ? 'Playing Audio Podcast with Synthesized Natural Voice...' : 'Click to start voice revision'}
                </div>
                <div className="h-2 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div className={`h-full bg-indigo-500 rounded-full transition-all ${isPlaying ? 'w-full animate-pulse' : 'w-0'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              High-Yield Revision Takeaways
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {selectedEpisode.keyTakeaways.map((t, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transcript Box */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Audio Script &amp; Verbatim Transcript
            </span>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-serif max-h-48 overflow-y-auto whitespace-pre-wrap select-text">
              {selectedEpisode.transcript}
            </div>
          </div>

          {/* Custom Topic Generator */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Generate Audio Podcast on Any Custom Syllabus Topic:</span>
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
                placeholder="e.g., Photosynthesis light reactions, Electromagnetism Lenz Law, Calculus derivatives..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <button
                type="button"
                disabled={isGeneratingCustom}
                onClick={handleGenerateCustomPodcast}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer shrink-0"
              >
                {isGeneratingCustom ? 'Synthesizing...' : 'Build Audio'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
