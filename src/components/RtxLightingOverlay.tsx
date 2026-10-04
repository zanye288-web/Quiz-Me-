import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Cpu } from 'lucide-react';

export const RtxLightingOverlay: React.FC = () => {
  const {
    graphicsMode,
    rtxEnabled,
    rtxGlobalIllumination,
    rtxReflections,
    rtxVolumetricBloom,
    fpsCounterEnabled,
    resolvedTheme,
    currentAccentConfig,
  } = useTheme();

  const lightRef = useRef<HTMLDivElement | null>(null);
  const causticRef = useRef<HTMLDivElement | null>(null);
  const [fps, setFps] = useState<number>(60);
  const [frameMs, setFrameMs] = useState<string>('16.6');

  // Smooth cursor-tracking ray-traced illumination (on-demand RAF to eliminate idle CPU/GPU lag)
  useEffect(() => {
    if (graphicsMode === 'simple' || !rtxEnabled || !rtxGlobalIllumination) return;

    let targetX = typeof window !== 'undefined' ? window.innerWidth * 0.5 : 500;
    let targetY = typeof window !== 'undefined' ? window.innerHeight * 0.35 : 300;
    let currentX = targetX;
    let currentY = targetY;
    let rafId = 0;
    let isAnimating = false;

    const animateLight = () => {
      if (document.hidden) {
        isAnimating = false;
        return;
      }
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      currentX += dx * 0.18;
      currentY += dy * 0.18;

      if (lightRef.current) {
        lightRef.current.style.transform = `translate3d(${Math.round(currentX - 320)}px, ${Math.round(currentY - 320)}px, 0)`;
      }
      if (causticRef.current) {
        causticRef.current.style.transform = `translate3d(${Math.round(currentX - 140)}px, ${Math.round(currentY - 140)}px, 0)`;
      }

      if (Math.abs(dx) > 0.75 || Math.abs(dy) > 0.75) {
        rafId = requestAnimationFrame(animateLight);
      } else {
        isAnimating = false;
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isAnimating) {
        isAnimating = true;
        rafId = requestAnimationFrame(animateLight);
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    isAnimating = true;
    rafId = requestAnimationFrame(animateLight);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [graphicsMode, rtxEnabled, rtxGlobalIllumination]);

  // Real-time FPS & frame-time counter when enabled
  useEffect(() => {
    if (!fpsCounterEnabled) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let rafId = 0;

    const measure = (now: number) => {
      frameCount++;
      const elapsed = now - lastTime;
      if (elapsed >= 500) {
        const currentFps = Math.min(240, Math.round((frameCount * 1000) / elapsed));
        const ms = (elapsed / Math.max(1, frameCount)).toFixed(1);
        setFps(currentFps);
        setFrameMs(ms);
        frameCount = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(measure);
    };

    rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, [fpsCounterEnabled]);

  const isDark = resolvedTheme === 'dark';
  const hex = currentAccentConfig.primaryHex || '#6366f1';

  return (
    <>
      {/* RTX Volumetric God-Rays & Atmospheric Bloom */}
      {graphicsMode !== 'simple' && rtxEnabled && rtxVolumetricBloom && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
          {/* Top-left Volumetric God-Ray */}
          <div
            className="absolute -top-36 left-1/6 w-[650px] h-[420px] rounded-full blur-3xl transition-opacity duration-500"
            style={{
              background: `radial-gradient(ellipse at center, ${hex}${isDark ? '26' : '1c'} 0%, rgba(168,85,247,${isDark ? '0.12' : '0.08'}) 45%, transparent 75%)`,
              transform: 'rotate(-18deg)',
            }}
          />
          {/* Top-right Prismatic Caustic Rim */}
          <div
            className="absolute -top-24 right-12 w-[520px] h-[360px] rounded-full blur-3xl transition-opacity duration-500"
            style={{
              background: `radial-gradient(ellipse at center, rgba(56,189,248,${isDark ? '0.16' : '0.11'}) 0%, ${hex}${isDark ? '18' : '10'} 50%, transparent 75%)`,
              transform: 'rotate(15deg)',
            }}
          />
          {/* Subtle top specular horizon line */}
          {rtxReflections && (
            <div
              className="absolute top-0 inset-x-0 h-[1.5px] opacity-70"
              style={{
                background: `linear-gradient(90deg, transparent 5%, ${hex}66 30%, rgba(255,255,255,0.85) 50%, ${hex}66 70%, transparent 95%)`,
              }}
            />
          )}
        </div>
      )}

      {/* RTX Ray-Traced Cursor Global Illumination */}
      {graphicsMode !== 'simple' && rtxEnabled && rtxGlobalIllumination && (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none">
          <div
            ref={lightRef}
            className="w-[640px] h-[640px] rounded-full will-change-transform"
            style={{
              background: `radial-gradient(circle, ${hex}${isDark ? '1f' : '16'} 0%, rgba(168,85,247,${isDark ? '0.08' : '0.05'}) 38%, transparent 70%)`,
              mixBlendMode: isDark ? 'screen' : 'multiply',
            }}
          />
          {rtxReflections && (
            <div
              ref={causticRef}
              className="w-[280px] h-[280px] rounded-full will-change-transform"
              style={{
                background: `radial-gradient(circle, rgba(255,255,255,${isDark ? '0.07' : '0.22'}) 0%, transparent 65%)`,
              }}
            />
          )}
        </div>
      )}

      {/* Live FPS & RTX Telemetry HUD */}
      {fpsCounterEnabled && (
        <div className="fixed bottom-4 left-4 z-50 pointer-events-none select-none flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 text-white border border-emerald-500/40 shadow-xl backdrop-blur-md text-[11px] font-mono">
          <Cpu className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-black text-emerald-400">{fps} FPS</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">{frameMs} ms</span>
          <span className="text-slate-500">|</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black uppercase text-[9px] tracking-wider flex items-center gap-1">
            {rtxEnabled && graphicsMode !== 'simple' && <Sparkles className="w-2.5 h-2.5" />}
            {graphicsMode.toUpperCase()} {rtxEnabled && graphicsMode !== 'simple' ? 'RTX ON' : ''}
          </span>
        </div>
      )}
    </>
  );
};
