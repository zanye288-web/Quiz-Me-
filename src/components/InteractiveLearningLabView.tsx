import React, { useState, useEffect, useRef } from 'react';
import {
  FlaskConical,
  Sigma,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  BookOpen,
  Info,
  CheckCircle2,
  Atom,
  Flame,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

type LabDiscipline = 'physics' | 'chemistry' | 'biology' | 'mathematics';

export const InteractiveLearningLabView: React.FC = () => {
  const [activeDiscipline, setActiveDiscipline] = useState<LabDiscipline>('physics');

  // Physics: Projectile Motion States
  const [angle, setAngle] = useState<number>(45); // degrees
  const [velocity, setVelocity] = useState<number>(20); // m/s
  const [gravity, setGravity] = useState<number>(9.81); // m/s^2
  const [isPlayingPhysics, setIsPlayingPhysics] = useState<boolean>(false);
  const physicsCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Chemistry: Acid-Base Titration States
  const [titrantVolume, setTitrantVolume] = useState<number>(0); // mL NaOH added
  const [analyteConcentration, setAnalyteConcentration] = useState<number>(0.1); // M HCl (25 mL)

  // Biology: Osmosis States
  const [tonicity, setTonicity] = useState<'hypotonic' | 'isotonic' | 'hypertonic'>('isotonic');

  // Math: Quadratic Grapher
  const [paramA, setParamA] = useState<number>(1);
  const [paramB, setParamB] = useState<number>(0);
  const [paramC, setParamC] = useState<number>(-4);
  const mathCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Physics Animation Loop
  useEffect(() => {
    if (activeDiscipline !== 'physics') return;
    const canvas = physicsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;
    const rad = (angle * Math.PI) / 180;
    const vx = velocity * Math.cos(rad);
    const vy = velocity * Math.sin(rad);
    const totalTime = (2 * vy) / gravity;
    const maxRange = vx * totalTime;
    const maxHeight = (vy * vy) / (2 * gravity);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(30, canvas.height - 30);
      ctx.lineTo(canvas.width - 30, canvas.height - 30);
      ctx.stroke();

      // Draw trajectory path
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();

      const scaleX = (canvas.width - 80) / Math.max(40, maxRange);
      const scaleY = (canvas.height - 80) / Math.max(15, maxHeight * 1.3);

      for (let stepT = 0; stepT <= totalTime; stepT += totalTime / 60) {
        const px = 30 + vx * stepT * scaleX;
        const py = canvas.height - 30 - (vy * stepT - 0.5 * gravity * stepT * stepT) * scaleY;
        if (stepT === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw projectile at current time t
      const curT = Math.min(t, totalTime);
      const curX = 30 + vx * curT * scaleX;
      const curY = canvas.height - 30 - (vy * curT - 0.5 * gravity * curT * curT) * scaleY;

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(curX, curY, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (isPlayingPhysics) {
        t += 0.03;
        if (t > totalTime) {
          t = 0; // Loop or stop
        }
        animId = requestAnimationFrame(render);
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeDiscipline, angle, velocity, gravity, isPlayingPhysics]);

  // Math Animation & Canvas Rendering
  useEffect(() => {
    if (activeDiscipline !== 'mathematics') return;
    const canvas = mathCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const originX = canvas.width / 2;
    const originY = canvas.height / 2;
    const scale = 20; // 20px per unit

    // Draw grid axes
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(canvas.width, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, canvas.height);
    ctx.stroke();

    // Plot parabola y = a*x^2 + b*x + c
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.beginPath();

    let started = false;
    for (let px = 0; px <= canvas.width; px++) {
      const x = (px - originX) / scale;
      const y = paramA * x * x + paramB * x + paramC;
      const py = originY - y * scale;

      if (py >= 0 && py <= canvas.height) {
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
    }
    ctx.stroke();
  }, [activeDiscipline, paramA, paramB, paramC]);

  // Chemistry calculated pH
  const calculatedPH = (() => {
    const vAcid = 25; // mL
    const cAcid = analyteConcentration;
    const cBase = 0.1; // M NaOH
    const vBase = titrantVolume; // mL

    const molesAcid = (cAcid * vAcid) / 1000;
    const molesBase = (cBase * vBase) / 1000;
    const totalVolumeL = (vAcid + vBase) / 1000;

    if (molesBase < molesAcid) {
      const excessH = (molesAcid - molesBase) / totalVolumeL;
      return Math.max(1, Math.min(6.9, -Math.log10(excessH))).toFixed(2);
    } else if (Math.abs(molesBase - molesAcid) < 0.00005) {
      return '7.00';
    } else {
      const excessOH = (molesBase - molesAcid) / totalVolumeL;
      const pOH = -Math.log10(excessOH);
      return Math.max(7.1, Math.min(13.8, 14 - pOH)).toFixed(2);
    }
  })();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Banner */}
      <div className="comic-panel rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-teal-500/10 via-indigo-500/5 to-cyan-500/10 border-2 border-slate-900 dark:border-slate-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-2 rounded-2xl bg-teal-600 text-white border-2 border-slate-950 shadow-xs">
                <FlaskConical className="w-5 h-5" />
              </span>
              <span className="comic-badge px-2.5 py-1 rounded bg-teal-400 text-slate-950 border border-slate-950 text-xs font-black uppercase tracking-wider">
                INTERACTIVE LEARNING LAB
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Physics • Chemistry • Biology • Mathematics
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Interactive STEM &amp; Mathematics Sandbox
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Explore scientific equations and mathematical curves with real-time reactive simulations. Manipulate physical parameters and observe causal outcomes directly.
            </p>
          </div>

          {/* Discipline Selector */}
          <div className="flex items-center gap-2 flex-wrap bg-white dark:bg-slate-800 p-1.5 rounded-2xl border-2 border-slate-900/15 dark:border-slate-700">
            {(['physics', 'chemistry', 'biology', 'mathematics'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setActiveDiscipline(d);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                  activeDiscipline === d
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Physics Simulation: Projectile Motion */}
      {activeDiscipline === 'physics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="comic-panel rounded-3xl p-6 bg-white dark:bg-slate-900 border-2 border-slate-900/20 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-500" />
                <span>Kinematic Controls</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Launch Angle (&theta;):</span>
                    <span className="font-mono text-teal-600">{angle}&deg;</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={85}
                    value={angle}
                    onChange={(e) => setAngle(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Initial Velocity (v₀):</span>
                    <span className="font-mono text-teal-600">{velocity} m/s</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={40}
                    value={velocity}
                    onChange={(e) => setVelocity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Gravity (g):</span>
                    <span className="font-mono text-teal-600">{gravity} m/s²</span>
                  </div>
                  <input
                    type="range"
                    min={1.62} // Moon
                    max={24.79} // Jupiter
                    step={0.1}
                    value={gravity}
                    onChange={(e) => setGravity(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Moon (1.6)</span>
                    <span>Earth (9.8)</span>
                    <span>Jupiter (24.8)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setIsPlayingPhysics(!isPlayingPhysics);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {isPlayingPhysics ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlayingPhysics ? 'Pause' : 'Fire Projectile'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="comic-panel rounded-3xl p-6 bg-white dark:bg-slate-900 border-2 border-slate-900/20 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Trajectory Simulation Canvas
                </h3>
                <span className="text-xs font-mono font-bold text-slate-500">
                  Range: {(((velocity * velocity * Math.sin((2 * angle * Math.PI) / 180)) / gravity)).toFixed(1)} m
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-950/5 dark:bg-slate-950/40 p-2">
                <canvas
                  ref={physicsCanvasRef}
                  width={640}
                  height={320}
                  className="w-full h-auto block"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-300 dark:border-teal-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong>Core Physical Law:</strong> Horizontal displacement x = (v₀ cos &theta;)t; Vertical displacement y = (v₀ sin &theta;)t - ½gt². Maximum range occurs at &theta; = 45&deg; on level ground.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chemistry: Acid-Base Titration Simulator */}
      {activeDiscipline === 'chemistry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="comic-panel rounded-3xl p-6 bg-white dark:bg-slate-900 border-2 border-slate-900/20 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Burette &amp; Titration Setup
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>0.1 M NaOH Titrant Added:</span>
                    <span className="font-mono text-teal-600">{titrantVolume} mL</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={0.5}
                    value={titrantVolume}
                    onChange={(e) => setTitrantVolume(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-center">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Calculated pH:</div>
                  <div
                    className={`text-4xl font-black font-mono transition-colors ${
                      Number(calculatedPH) > 8
                        ? 'text-pink-500'
                        : Number(calculatedPH) === 7
                        ? 'text-emerald-500'
                        : 'text-rose-500'
                    }`}
                  >
                    {calculatedPH}
                  </div>
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {Number(calculatedPH) > 8.2
                      ? '🌸 Phenolphthalein: Pink (Basic endpoint reached)'
                      : Number(calculatedPH) === 7
                      ? '⚖️ Exact Neutral Equivalence Point (pH 7.00)'
                      : '💧 Phenolphthalein: Colorless (Acidic excess)'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTitrantVolume(25)}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Jump to Equivalence Point (25.0 mL)
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="comic-panel rounded-3xl p-6 bg-white dark:bg-slate-900 border-2 border-slate-900/20 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Titration Curve Analysis (Strong Acid vs Strong Base)
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs leading-relaxed">
                <p>
                  <strong>Reaction:</strong> HCl + NaOH &rarr; NaCl + H₂O.
                </p>
                <p>
                  At 0 mL NaOH added, the strong acid HCl dissociates fully producing pH &asymp; 1.00. Near 25 mL, a steep vertical jump occurs where a single drop changes pH from 4 to 10.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Biology: Osmosis & Tonicity */}
      {activeDiscipline === 'biology' && (
        <div className="comic-panel rounded-3xl p-6 bg-white dark:bg-slate-900 border-2 border-slate-900/20 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Cell Osmosis &amp; Water Flux Simulator
            </h3>
            <div className="flex items-center gap-2">
              {(['hypotonic', 'isotonic', 'hypertonic'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setTonicity(t);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                    tonicity === t
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div
              className={`p-6 rounded-2xl border-2 transition-all ${
                tonicity === 'hypotonic'
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="w-20 h-20 rounded-full bg-teal-400 border-4 border-slate-950 mx-auto mb-3 flex items-center justify-center font-black text-xs">
                Turgid / Lysis
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Hypotonic Solution</h4>
              <p className="text-xs text-slate-500 mt-1">
                Net water enters the cell. Animal cells burst (lysis); plant cells become firm/turgid.
              </p>
            </div>

            <div
              className={`p-6 rounded-2xl border-2 transition-all ${
                tonicity === 'isotonic'
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-amber-400 border-4 border-slate-950 mx-auto mb-3 flex items-center justify-center font-black text-xs">
                Normal
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Isotonic Solution</h4>
              <p className="text-xs text-slate-500 mt-1">
                Equilibrium: rate of water entering equals water leaving. Cell volume is stable.
              </p>
            </div>

            <div
              className={`p-6 rounded-2xl border-2 transition-all ${
                tonicity === 'hypertonic'
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-rose-400 border-4 border-slate-950 mx-auto mb-3 flex items-center justify-center font-black text-xs">
                Shriveled
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Hypertonic Solution</h4>
              <p className="text-xs text-slate-500 mt-1">
                Net water leaves the cell. Animal cells shrivel (crenation); plant cells plasmolyze.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mathematics: Quadratic Grapher */}
      {activeDiscipline === 'mathematics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="comic-panel rounded-3xl p-6 bg-white dark:bg-slate-900 border-2 border-slate-900/20 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Quadratic Coefficients: y = ax&sup2; + bx + c
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Coefficient a:</span>
                    <span className="font-mono text-teal-600">{paramA}</span>
                  </div>
                  <input
                    type="range"
                    min={-5}
                    max={5}
                    step={0.5}
                    value={paramA}
                    onChange={(e) => setParamA(Number(e.target.value) || 1)}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Coefficient b:</span>
                    <span className="font-mono text-teal-600">{paramB}</span>
                  </div>
                  <input
                    type="range"
                    min={-10}
                    max={10}
                    value={paramB}
                    onChange={(e) => setParamB(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-1">
                    <span>Constant c:</span>
                    <span className="font-mono text-teal-600">{paramC}</span>
                  </div>
                  <input
                    type="range"
                    min={-10}
                    max={10}
                    value={paramC}
                    onChange={(e) => setParamC(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-slate-700 dark:text-slate-300">
                    Discriminant &Delta; = b&sup2; - 4ac:
                  </div>
                  <div className="font-mono font-bold text-teal-600">
                    {paramB * paramB - 4 * paramA * paramC}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {paramB * paramB - 4 * paramA * paramC > 0
                      ? 'Two distinct real roots'
                      : paramB * paramB - 4 * paramA * paramC === 0
                      ? 'One repeated real root (tangent to x-axis)'
                      : 'No real roots (parabola does not cross x-axis)'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="comic-panel rounded-3xl p-6 bg-white dark:bg-slate-900 border-2 border-slate-900/20 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Interactive Cartesian Graph
              </h3>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-950/60 p-2">
                <canvas
                  ref={mathCanvasRef}
                  width={600}
                  height={320}
                  className="w-full h-auto block"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
