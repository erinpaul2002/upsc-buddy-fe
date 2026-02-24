'use client';
/*
 * PARTICLE HOURGLASS — V10: Ritual / Ceremonial Full-Screen Reveal
 * Canvas-based physics simulation — avoids React setState-inside-updater bugs.
 * Gold particles fall through a neck, funnel, and stack at the bottom.
 */
import { useEffect, useRef, useState } from 'react';

const W = 260, H = 180;
const CX = W / 2;
const TOP_Y = 18, BOT_Y = H - 20;
const NECK_Y_TOP = H / 2 - 9, NECK_Y_BOT = H / 2 + 9;
const HALF_W = 54, NECK_W = 3;
const MAX_P = 50;

type PPhase = 'top' | 'neck' | 'bot' | 'settled';
type P = {
  id: number; x: number; y: number;
  vx: number; vy: number;
  size: number; phase: PPhase;
  sx: number; sy: number; // settle target
};
let _uid = 0;

function spawn(settledCount: number): P {
  const col = settledCount % 14;
  const row = Math.floor(settledCount / 14);
  return {
    id: _uid++,
    x: CX - HALF_W * 0.5 + Math.random() * HALF_W,
    y: TOP_Y + 4 + Math.random() * (NECK_Y_TOP - TOP_Y - 20),
    vx: (Math.random() - 0.5) * 0.3,
    vy: 1.1 + Math.random() * 0.7,
    size: 2 + Math.random() * 1.5,
    phase: 'top',
    sx: CX - HALF_W * 0.52 + col * (HALF_W * 1.04 / 13),
    sy: BOT_Y - 5 - row * 5,
  };
}

function drawHG(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(CX - HALF_W, TOP_Y);
  ctx.lineTo(CX + HALF_W, TOP_Y);
  ctx.lineTo(CX + NECK_W, NECK_Y_TOP);
  ctx.lineTo(CX + NECK_W, NECK_Y_BOT);
  ctx.lineTo(CX + HALF_W, BOT_Y);
  ctx.lineTo(CX - HALF_W, BOT_Y);
  ctx.lineTo(CX - NECK_W, NECK_Y_BOT);
  ctx.lineTo(CX - NECK_W, NECK_Y_TOP);
  ctx.closePath();
  ctx.strokeStyle = 'rgba(201,161,74,0.3)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

export default function ParticleHourglass({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // All mutable state lives in a ref — zero React setState in the rAF loop
  const sim = useRef({
    particles: [] as P[],
    settled: 0,
    lastSpawn: 0,
    active: false,
    raf: 0,
  });
  const [label, setLabel] = useState('');

  useEffect(() => {
    const s = sim.current;
    s.active = false;
    cancelAnimationFrame(s.raf);
    s.particles = [];
    s.settled = 0;
    s.lastSpawn = 0;
    setLabel('');

    if (trigger === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    s.active = true;
    s.lastSpawn = performance.now();
    let flipCount = 0;

    function startPhase(flipped: boolean) {
      s.particles = [];
      s.settled = 0;
      s.lastSpawn = performance.now();
      setLabel(`ANALYSING  0 / ${MAX_P}`);
    }

    startPhase(false);

    function tick(now: number) {
      if (!s.active) return;

      // Spawn
      if (s.particles.length < MAX_P && s.settled < MAX_P && now - s.lastSpawn > 140) {
        s.particles.push(spawn(s.settled));
        s.lastSpawn = now;
      }

      // Physics update
      let justSettled = 0;
      for (const p of s.particles) {
        if (p.phase === 'settled') continue;
        p.x += p.vx;
        p.y += p.vy;

        if (p.phase === 'top') {
          const t = Math.max(0, (p.y - TOP_Y) / (NECK_Y_TOP - TOP_Y));
          const hw = HALF_W * (1 - t) + NECK_W * t;
          p.x = Math.max(CX - hw + p.size, Math.min(CX + hw - p.size, p.x));
          if (p.y >= NECK_Y_TOP) { p.phase = 'neck'; p.vy = 1.8; p.vx = (Math.random() - 0.5) * 0.2; }
        } else if (p.phase === 'neck') {
          p.x = CX + (Math.random() - 0.5) * NECK_W * 1.2;
          if (p.y >= NECK_Y_BOT) { p.phase = 'bot'; p.vy = 1.5; p.vx = (Math.random() - 0.5) * 0.8; }
        } else if (p.phase === 'bot') {
          const t = Math.max(0, (p.y - NECK_Y_BOT) / (BOT_Y - NECK_Y_BOT));
          const hw = NECK_W * (1 - t) + HALF_W * t;
          p.x = Math.max(CX - hw + p.size, Math.min(CX + hw - p.size, p.x));
          if (p.y >= p.sy) {
            p.y = p.sy; p.x = p.sx;
            p.vx = 0; p.vy = 0;
            p.phase = 'settled';
            s.settled++;
            justSettled++;
          }
        }
      }

      // Update label once per settle batch (avoids spamming setState)
      if (justSettled > 0) {
        setLabel(s.settled >= MAX_P ? 'COMPLETE' : `ANALYSING  ${s.settled} / ${MAX_P}`);
      }

      // Draw
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      // Neck glow
      const grd = ctx.createRadialGradient(CX, H / 2, 0, CX, H / 2, 38);
      grd.addColorStop(0, 'rgba(201,161,74,0.06)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      drawHG(ctx);

      for (const p of s.particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        if (p.phase !== 'settled') {
          ctx.shadowColor = '#c9a14a';
          ctx.shadowBlur = 5;
          ctx.fillStyle = 'rgba(201,161,74,0.92)';
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(201,161,74,0.62)';
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      ctx.textAlign = 'center';
      ctx.font = '7px monospace';
      ctx.fillStyle = 'rgba(107,74,30,0.7)';
      ctx.fillText('ANSWER KEY', CX, TOP_Y - 5);

      if (s.settled < MAX_P || s.particles.some(p => p.phase !== 'settled')) {
        s.raf = requestAnimationFrame(tick);
      } else {
        // All settled: hold 1.8s then restart
        setTimeout(() => {
          if (!s.active) return;
          s.particles = [];
          s.settled = 0;
          s.lastSpawn = performance.now();
          setLabel(`ANALYSING  0 / ${MAX_P}`);
          s.raf = requestAnimationFrame(tick);
        }, 1800);
      }
    }

    s.raf = requestAnimationFrame(tick);
    return () => { s.active = false; cancelAnimationFrame(s.raf); };
  }, [trigger]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center"
      style={{ background: '#000', position: 'relative' }}>
      <canvas ref={canvasRef} width={W} height={H} style={{ display: 'block' }} />
      <div style={{
        position: 'absolute', bottom: 8, fontSize: 9,
        fontFamily: 'monospace', letterSpacing: '0.15em',
        color: label === 'COMPLETE' ? 'rgba(201,161,74,0.9)' : 'rgba(201,161,74,0.65)',
      }}>
        {label || (trigger > 0 ? `ANALYSING  0 / ${MAX_P}` : '')}
      </div>
    </div>
  );
}
