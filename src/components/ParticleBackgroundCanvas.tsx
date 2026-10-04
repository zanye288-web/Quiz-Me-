import React, { useEffect, useRef } from 'react';
import { useTheme, ParticlePresetType } from '../context/ThemeContext';

interface ParticleNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  hueOffset: number;
  symbol?: string;
  rotation: number;
  vRot: number;
  isBurst?: boolean;
  life?: number;
}

const SCHOLAR_GLYPHS = ['?', '★', '⚡', '✦', 'π', '∑', '💡', '🎯', '∞', '∆'];

export const ParticleBackgroundCanvas: React.FC = () => {
  const {
    particlesEnabled,
    particlePreset,
    particleDensity,
    particleSpeed,
    particleInteractive,
    reducedMotion,
    resolvedTheme,
    currentAccentConfig,
    eyeComfortWarmth,
  } = useTheme();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!particlesEnabled || reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const countMap = {
      low: 14,
      medium: 24,
      high: 38,
    };
    const speedMap = {
      slow: 0.4,
      normal: 0.75,
      fast: 1.25,
    };

    const baseCount = countMap[particleDensity] || 52;
    const speedMult = speedMap[particleSpeed] || 0.95;
    const isDark = resolvedTheme === 'dark';
    const primaryHex = currentAccentConfig.primaryHex || '#6366f1';

    const createParticle = (preset: ParticlePresetType, xOverride?: number, yOverride?: number, isBurst = false): ParticleNode => {
      const x = xOverride !== undefined ? xOverride : Math.random() * width;
      const y = yOverride !== undefined ? yOverride : Math.random() * height;
      const angle = Math.random() * Math.PI * 2;
      const baseVel = (0.25 + Math.random() * 0.65) * speedMult * (isBurst ? 3.4 : 1);

      let vx = Math.cos(angle) * baseVel;
      let vy = Math.sin(angle) * baseVel;
      let size = 2 + Math.random() * 3;

      if (preset === 'bubbles' && !isBurst) {
        vx = (Math.random() - 0.5) * 0.4 * speedMult;
        vy = -(0.35 + Math.random() * 0.65) * speedMult;
        size = 5 + Math.random() * 11;
      } else if (preset === 'sakura' && !isBurst) {
        vx = (0.25 + Math.random() * 0.5) * speedMult;
        vy = (0.35 + Math.random() * 0.65) * speedMult;
        size = 5 + Math.random() * 5;
      } else if (preset === 'snowfall' && !isBurst) {
        vx = (Math.random() - 0.5) * 0.35 * speedMult;
        vy = (0.4 + Math.random() * 0.75) * speedMult;
        size = 2 + Math.random() * 3.5;
      } else if (preset === 'fireflies' && !isBurst) {
        size = 2.5 + Math.random() * 3.5;
      } else if (preset === 'scholar_sparks') {
        size = 11 + Math.random() * 6;
      }

      return {
        x,
        y,
        vx,
        vy,
        size,
        alpha: 0.25 + Math.random() * 0.55,
        pulseSpeed: 0.015 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
        hueOffset: (Math.random() - 0.5) * 40,
        symbol: SCHOLAR_GLYPHS[Math.floor(Math.random() * SCHOLAR_GLYPHS.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.02 * speedMult,
        isBurst,
        life: isBurst ? 1.0 : undefined,
      };
    };

    const particles: ParticleNode[] = Array.from({ length: baseCount }, () =>
      createParticle(particlePreset)
    );

    const mouse = { x: -9999, y: -9999, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      if (!particleInteractive) return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      if (!particleInteractive) return;
      // Spawn a subtle 8-particle burst on click
      for (let i = 0; i < 8; i++) {
        if (particles.length < baseCount + 40) {
          particles.push(createParticle(particlePreset, e.clientX, e.clientY, true));
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick, { passive: true });

    let lastFrameTime = 0;
    const frameInterval = 1000 / 30; // Cap background particles at 30 FPS for zero UI lag

    const render = (now: number = performance.now()) => {
      animationFrameId = requestAnimationFrame(render);
      if (document.hidden) return;
      if (now - lastFrameTime < frameInterval) return;
      lastFrameTime = now;

      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulsePhase += p.pulseSpeed;
        p.rotation += p.vRot;

        if (p.isBurst && p.life !== undefined) {
          p.life -= 0.024;
          p.vx *= 0.97;
          p.vy *= 0.97;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
        } else {
          // Wrap around screen edges
          if (p.x < -30) p.x = width + 30;
          if (p.x > width + 30) p.x = -30;
          if (p.y < -30) p.y = height + 30;
          if (p.y > height + 30) p.y = -30;
        }

        // Interactive cursor physics
        if (particleInteractive && mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          const maxDist = 135;
          if (distSq < maxDist * maxDist && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const force = (maxDist - dist) / maxDist;
            p.x += (dx / dist) * force * 1.6;
            p.y += (dy / dist) * force * 1.6;
          }
        }

        const currentAlpha =
          (p.isBurst && p.life !== undefined ? p.life * 0.85 : p.alpha * (0.65 + 0.35 * Math.sin(p.pulsePhase))) *
          (isDark ? 0.85 : 0.65);

        ctx.save();
        ctx.globalAlpha = Math.max(0.05, Math.min(0.95, currentAlpha));

        if (particlePreset === 'fireflies') {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.2);
          grad.addColorStop(0, isDark ? '#fde047' : '#f59e0b');
          grad.addColorStop(0.5, isDark ? 'rgba(250, 204, 21, 0.35)' : 'rgba(245, 158, 11, 0.25)');
          grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (particlePreset === 'bubbles') {
          ctx.strokeStyle = primaryHex;
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.06)';
          ctx.fill();
          // Tiny highlight reflection
          ctx.fillStyle = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.8)';
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, Math.max(1, p.size * 0.18), 0, Math.PI * 2);
          ctx.fill();
        } else if (particlePreset === 'scholar_sparks') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation * 0.35);
          ctx.font = `700 ${Math.round(p.size)}px sans-serif`;
          ctx.fillStyle = primaryHex;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.symbol || '✦', 0, 0);
        } else if (particlePreset === 'sakura') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = isDark ? '#f472b6' : '#fb7185';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (particlePreset === 'snowfall') {
          ctx.fillStyle = isDark ? '#e0f2fe' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Constellation default
          ctx.fillStyle = primaryHex;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // Draw constellation connecting lines in a single batched path
      if (particlePreset === 'constellation') {
        const linkDist = 115;
        const linkDistSq = linkDist * linkDist;
        ctx.save();
        ctx.strokeStyle = primaryHex;
        ctx.globalAlpha = isDark ? 0.16 : 0.1;
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            if (dx * dx + dy * dy < linkDistSq) {
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
            }
          }
        }
        ctx.stroke();
        ctx.restore();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
    };
  }, [
    particlesEnabled,
    particlePreset,
    particleDensity,
    particleSpeed,
    particleInteractive,
    reducedMotion,
    resolvedTheme,
    currentAccentConfig.primaryHex,
  ]);

  return (
    <>
      {particlesEnabled && !reducedMotion && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-[1]"
          aria-hidden="true"
        />
      )}
      {eyeComfortWarmth > 0 && (
        <div
          className="fixed inset-0 pointer-events-none z-[60] transition-opacity duration-300"
          style={{
            backgroundColor: `rgba(245, 158, 11, ${(eyeComfortWarmth / 100) * 0.28})`,
            mixBlendMode: 'multiply',
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
};
