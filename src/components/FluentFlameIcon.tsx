import React, { useEffect, useRef } from 'react';

interface FluentFlameIconProps {
  size?: number;
  active?: boolean;
  intensity?: 'normal' | 'high' | 'inferno';
  className?: string;
}

/**
 * Fluent 24 FPS Multi-Layer Procedural Vector Fire Animation
 * Updates SVG paths & ember particles directly via DOM refs at exactly 24 frames per second (41.67ms/frame)
 * for an authentic, buttery-smooth hand-animated fire look with zero React re-render overhead.
 */
export const FluentFlameIcon: React.FC<FluentFlameIconProps> = ({
  size = 28,
  active = true,
  intensity = 'normal',
  className = '',
}) => {
  const outerPathRef = useRef<SVGPathElement | null>(null);
  const midPathRef = useRef<SVGPathElement | null>(null);
  const corePathRef = useRef<SVGPathElement | null>(null);
  const ember1Ref = useRef<SVGCircleElement | null>(null);
  const ember2Ref = useRef<SVGCircleElement | null>(null);
  const ember3Ref = useRef<SVGCircleElement | null>(null);
  const glowRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    if (!active) return;

    let animationFrameId: number;
    let lastFrameTime = 0;
    let frameIndex = 0;
    const FPS_INTERVAL = 1000 / 24; // Exact 24 FPS step (41.67ms)

    const amp = intensity === 'inferno' ? 1.35 : intensity === 'high' ? 1.15 : 1.0;

    const renderFrame = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(renderFrame);

      const elapsed = timestamp - lastFrameTime;
      if (elapsed < FPS_INTERVAL) return;
      lastFrameTime = timestamp - (elapsed % FPS_INTERVAL);
      frameIndex += 1;

      // Time phase stepped at 24fps
      const t = frameIndex * 0.28;

      // Organic multi-harmonic wave offsets for tip & side tongues
      const tipX = 32 + Math.sin(t * 1.3) * 3.8 * amp + Math.cos(t * 2.1) * 1.6 * amp;
      const tipY = 6.5 + Math.sin(t * 1.9) * 2.4 * amp;

      const leftBulgeX = 12.5 + Math.sin(t * 1.5 + 1.2) * 2.2 * amp;
      const leftBulgeY = 34 + Math.cos(t * 1.4) * 2.0 * amp;

      const rightBulgeX = 51.5 + Math.cos(t * 1.6 + 0.7) * 2.2 * amp;
      const rightBulgeY = 33 + Math.sin(t * 1.7) * 2.0 * amp;

      const leftShoulderX = 18 + Math.cos(t * 2.2) * 2.5 * amp;
      const leftShoulderY = 18 + Math.sin(t * 1.8) * 2.2 * amp;

      const rightShoulderX = 46 + Math.sin(t * 2.0) * 2.5 * amp;
      const rightShoulderY = 19 + Math.cos(t * 1.9) * 2.2 * amp;

      // 1. Outer Flame Path (Deep Orange-Red to Vibrant Orange)
      if (outerPathRef.current) {
        const dOuter = [
          `M 32 58`,
          `C 17 58, ${leftBulgeX.toFixed(2)} 47, ${leftBulgeX.toFixed(2)} ${leftBulgeY.toFixed(2)}`,
          `C ${leftBulgeX.toFixed(2)} 25, ${leftShoulderX.toFixed(2)} ${leftShoulderY.toFixed(2)}, ${tipX.toFixed(2)} ${tipY.toFixed(2)}`,
          `C ${rightShoulderX.toFixed(2)} ${rightShoulderY.toFixed(2)}, ${rightBulgeX.toFixed(2)} 24, ${rightBulgeX.toFixed(2)} ${rightBulgeY.toFixed(2)}`,
          `C ${rightBulgeX.toFixed(2)} 47, 47 58, 32 58 Z`,
        ].join(' ');
        outerPathRef.current.setAttribute('d', dOuter);
      }

      // 2. Middle Flame Path (Warm Amber-Gold)
      if (midPathRef.current) {
        const midTipX = 32 + Math.cos(t * 1.6) * 2.8 * amp;
        const midTipY = 16.5 + Math.sin(t * 2.3) * 2.2 * amp;
        const midLX = 18.5 + Math.sin(t * 1.8 + 0.8) * 1.8 * amp;
        const midRX = 45.5 + Math.cos(t * 1.7 + 0.4) * 1.8 * amp;

        const dMid = [
          `M 32 56.5`,
          `C 21 56.5, ${midLX.toFixed(2)} 47.5, ${midLX.toFixed(2)} 37.5`,
          `C ${midLX.toFixed(2)} 28.5, 24.5 23.5, ${midTipX.toFixed(2)} ${midTipY.toFixed(2)}`,
          `C 39.5 23.5, ${midRX.toFixed(2)} 28.5, ${midRX.toFixed(2)} 37.5`,
          `C ${midRX.toFixed(2)} 47.5, 43 56.5, 32 56.5 Z`,
        ].join(' ');
        midPathRef.current.setAttribute('d', dMid);
      }

      // 3. Inner Hot Core Path (Sunny Yellow-White)
      if (corePathRef.current) {
        const coreTipX = 32 + Math.sin(t * 2.4) * 1.9 * amp;
        const coreTipY = 28.5 + Math.cos(t * 2.6) * 1.8 * amp;

        const dCore = [
          `M 32 55`,
          `C 25 55, 23.5 49, 23.5 42.5`,
          `C 23.5 36.5, 27.5 33, ${coreTipX.toFixed(2)} ${coreTipY.toFixed(2)}`,
          `C 36.5 33, 40.5 36.5, 40.5 42.5`,
          `C 40.5 49, 39 55, 32 55 Z`,
        ].join(' ');
        corePathRef.current.setAttribute('d', dCore);
      }

      // 4. Rising Ember Sparks (24fps cyclic particles)
      const updateEmber = (
        el: SVGCircleElement | null,
        phaseOffset: number,
        baseX: number,
        swayAmp: number
      ) => {
        if (!el) return;
        const cycle = ((frameIndex + phaseOffset) % 24) / 24; // 1-second 24-frame loop
        const y = 26 - cycle * 21;
        const x = baseX + Math.sin(cycle * Math.PI * 2 + phaseOffset) * swayAmp;
        const r = (1 - cycle) * 2.3;
        const opacity = cycle < 0.2 ? cycle * 5 : 1 - (cycle - 0.2) / 0.8;
        el.setAttribute('cx', x.toFixed(2));
        el.setAttribute('cy', y.toFixed(2));
        el.setAttribute('r', Math.max(0.2, r).toFixed(2));
        el.setAttribute('opacity', Math.max(0, opacity * 0.9).toFixed(2));
      };

      updateEmber(ember1Ref.current, 0, 27, 3.2);
      updateEmber(ember2Ref.current, 8, 37, -3.0);
      updateEmber(ember3Ref.current, 16, 32, 2.2);

      // 5. Subtle Pulsing Ambient Glow
      if (glowRef.current) {
        const glowRadius = 25 + Math.sin(t * 1.5) * 2.5;
        glowRef.current.setAttribute('r', glowRadius.toFixed(2));
      }
    };

    animationFrameId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [active, intensity]);

  const uniqueId = React.useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 select-none overflow-visible ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Outer Fire Gradient */}
        <linearGradient id={`flame-outer-${uniqueId}`} x1="32" y1="6" x2="32" y2="58" gradientUnits="userSpaceOnUse">
          {active ? (
            <>
              <stop offset="0%" stopColor="#FF9E00" />
              <stop offset="45%" stopColor="#FF5400" />
              <stop offset="100%" stopColor="#E01E37" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0.28" />
            </>
          )}
        </linearGradient>

        {/* Middle Flame Gradient */}
        <linearGradient id={`flame-mid-${uniqueId}`} x1="32" y1="16" x2="32" y2="56" gradientUnits="userSpaceOnUse">
          {active ? (
            <>
              <stop offset="0%" stopColor="#FFE66D" />
              <stop offset="60%" stopColor="#FF9F1C" />
              <stop offset="100%" stopColor="#FF6B35" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FDBA74" stopOpacity="0.3" />
            </>
          )}
        </linearGradient>

        {/* Inner Core Gradient */}
        <linearGradient id={`flame-core-${uniqueId}`} x1="32" y1="28" x2="32" y2="55" gradientUnits="userSpaceOnUse">
          {active ? (
            <>
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor="#FFF3B0" />
              <stop offset="100%" stopColor="#FFD166" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#FDE047" stopOpacity="0.3" />
            </>
          )}
        </linearGradient>

        {/* Soft Radial Fire Glow */}
        <radialGradient id={`flame-glow-${uniqueId}`} cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#FF7B00" stopOpacity={active ? '0.38' : '0.08'} />
          <stop offset="100%" stopColor="#FF5400" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Backlight Glow */}
      <circle
        ref={glowRef}
        cx="32"
        cy="36"
        r="25"
        fill={`url(#flame-glow-${uniqueId})`}
      />

      {/* Rising 24fps Ember Particles (Active state) */}
      {active && (
        <>
          <circle ref={ember1Ref} cx="27" cy="18" r="1.8" fill="#FFD166" />
          <circle ref={ember2Ref} cx="37" cy="14" r="1.5" fill="#FF9F1C" />
          <circle ref={ember3Ref} cx="32" cy="10" r="1.2" fill="#FFF3B0" />
        </>
      )}

      {/* Outer Flame Tongue */}
      <path
        ref={outerPathRef}
        d="M 32 58 C 17 58, 12.5 47, 12.5 34 C 12.5 25, 18 18, 32 6.5 C 46 19, 51.5 24, 51.5 33 C 51.5 47, 47 58, 32 58 Z"
        fill={`url(#flame-outer-${uniqueId})`}
      />

      {/* Middle Golden Flame */}
      <path
        ref={midPathRef}
        d="M 32 56.5 C 21 56.5, 18.5 47.5, 18.5 37.5 C 18.5 28.5, 24.5 23.5, 32 16.5 C 39.5 23.5, 45.5 28.5, 45.5 37.5 C 45.5 47.5, 43 56.5, 32 56.5 Z"
        fill={`url(#flame-mid-${uniqueId})`}
      />

      {/* Inner Bright Core */}
      <path
        ref={corePathRef}
        d="M 32 55 C 25 55, 23.5 49, 23.5 42.5 C 23.5 36.5, 27.5 33, 32 28.5 C 36.5 33, 40.5 36.5, 40.5 42.5 C 40.5 49, 39 55, 32 55 Z"
        fill={`url(#flame-core-${uniqueId})`}
      />
    </svg>
  );
};
