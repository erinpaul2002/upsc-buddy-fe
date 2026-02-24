'use client';
/*
 * OSCILLOSCOPE — V7: Scientific Instrument
 * CRT phosphor screen: three waveform traces sweep across measuring
 * different "signals" from the OCR analysis. Pure analog instrument logic.
 */
import { useEffect, useRef, useState } from 'react';

const W = 260, H = 180;
const GRID_X = 10, GRID_Y = 6;
const GW = W - 20, GH = H - 20; // grid drawable area
const LEFT = 10, TOP = 10;

/* Build a sine-wave SVG path across the grid */
function buildWave(
  phase: number,
  freq: number,
  amp: number,
  yOffset: number,
  points = 120,
): string {
  const pts = Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    const x = LEFT + t * GW;
    const y = TOP + yOffset + GH / 2 + Math.sin(t * Math.PI * 2 * freq + phase) * amp;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  return pts.join(' ');
}

type TraceConfig = {
  freq: number; amp: number; yOff: number; color: string; label: string;
};

const TRACES: TraceConfig[] = [
  { freq: 3,   amp: 22, yOff: -44, color: '#39ff14', label: 'FILL' },
  { freq: 5.5, amp: 14, yOff: 0,   color: '#00bfff', label: 'CONF' },
  { freq: 2,   amp: 10, yOff: 44,  color: '#ff9f0a', label: 'CORR' },
];

export default function Oscilloscope({ trigger }: { trigger: number }) {
  const [phase, setPhase] = useState(0);
  const rafRef = useRef<number>(0);
  const running = useRef(false);

  useEffect(() => {
    if (trigger === 0) {
      running.current = false;
      cancelAnimationFrame(rafRef.current);
      setPhase(0);
      return;
    }

    running.current = true;
    let lastTime = 0;
    function tick(ts: number) {
      if (!running.current) return;
      const dt = lastTime ? ts - lastTime : 0;
      lastTime = ts;
      setPhase(prev => prev + dt * 0.003);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    // Runs indefinitely until trigger resets or component unmounts
    return () => {
      running.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [trigger]);

  // Sweep line x position — sweeps from left to right over 3s repeatedly
  const sweepX = LEFT + ((phase * 0.3) % 1) * GW;

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        background: '#050f05',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* CRT screen curve overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 65%, rgba(0,0,0,0.55) 100%)',
        pointerEvents: 'none', zIndex: 2,
      }} />

      {/* Screen border */}
      <div style={{
        position: 'absolute', inset: 4,
        border: '1.5px solid #1a3a1a',
        borderRadius: 8,
        boxShadow: 'inset 0 0 30px rgba(0,80,0,0.15)',
        pointerEvents: 'none', zIndex: 3,
      }} />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ position: 'absolute' }}
      >
        {/* Grid lines */}
        {Array.from({ length: GRID_X + 1 }, (_, i) => (
          <line
            key={`gv-${i}`}
            x1={LEFT + (i / GRID_X) * GW}
            y1={TOP}
            x2={LEFT + (i / GRID_X) * GW}
            y2={TOP + GH}
            stroke="#0a2a0a"
            strokeWidth={i === 0 || i === GRID_X ? 0.8 : 0.4}
          />
        ))}
        {Array.from({ length: GRID_Y + 1 }, (_, i) => (
          <line
            key={`gh-${i}`}
            x1={LEFT}
            y1={TOP + (i / GRID_Y) * GH}
            x2={LEFT + GW}
            y2={TOP + (i / GRID_Y) * GH}
            stroke="#0a2a0a"
            strokeWidth={i === 0 || i === GRID_Y ? 0.8 : 0.4}
          />
        ))}

        {/* Center cross */}
        <line x1={LEFT + GW / 2} y1={TOP} x2={LEFT + GW / 2} y2={TOP + GH}
          stroke="#0f3a0f" strokeWidth={0.6} />
        <line x1={LEFT} y1={TOP + GH / 2} x2={LEFT + GW} y2={TOP + GH / 2}
          stroke="#0f3a0f" strokeWidth={0.6} />

        {/* Waveform traces */}
        {TRACES.map((tr, i) => (
          <path
            key={i}
            d={trigger > 0 ? buildWave(phase + i * 1.1, tr.freq, tr.amp, tr.yOff) : ''}
            stroke={tr.color}
            strokeWidth={1.5}
            fill="none"
            opacity={0.9}
            style={{ filter: `drop-shadow(0 0 3px ${tr.color})` }}
          />
        ))}

        {/* Sweep line */}
        {trigger > 0 && (
          <line
            x1={sweepX} y1={TOP}
            x2={sweepX} y2={TOP + GH}
            stroke="#39ff14"
            strokeWidth={0.5}
            opacity={0.3}
          />
        )}

        {/* Trace labels */}
        {TRACES.map((tr, i) => (
          <text
            key={i}
            x={LEFT + 4}
            y={TOP + GH / 2 + tr.yOff + tr.amp + 10}
            fontSize={6}
            fill={tr.color}
            fontFamily="monospace"
            opacity={trigger > 0 ? 0.8 : 0}
          >
            {tr.label}
          </text>
        ))}

        {/* Status label */}
        <text
          x={LEFT + GW - 4}
          y={TOP + 10}
          fontSize={6}
          fill="#39ff14"
          fontFamily="monospace"
          textAnchor="end"
          opacity={trigger > 0 ? 0.7 : 0}
          style={{ animation: trigger > 0 ? 'crt-blink 1s step-start infinite' : 'none' }}
        >
          ● REC
        </text>

        {/* Voltage scale */}
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <text
            key={i}
            x={LEFT - 2}
            y={TOP + (i / GRID_Y) * GH + 2}
            fontSize={4.5}
            fill="#1a4a1a"
            fontFamily="monospace"
            textAnchor="end"
          >
            {(3 - i).toString()}V
          </text>
        ))}
      </svg>

      <style>{`
        @keyframes crt-blink {
          0%, 49% { opacity: 0.7; }
          50%, 100% { opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}
