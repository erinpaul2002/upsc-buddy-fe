'use client';
/*
 * ORIGAMI FOLD — V6: Origami / Expanding Card System
 * Triangular facets that rotate on their shared edges like paper folds.
 * Each facet unfolds then refolds, then unfolds again as processing advances.
 */
import { useEffect, useState } from 'react';

/* 8 triangular facets arranged around a center point */
const CX = 130, CY = 90;
const R_OUTER = 65, R_INNER = 28;
const N = 8;

function polarPt(cx: number, cy: number, r: number, angle: number) {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

const FACET_COLORS = [
  '#c9a14a', '#b87d3f', '#8b5e3c',
  '#5a4035', '#4a6b5a', '#3d6b7c',
  '#3a4f8c', '#6b3a8c',
];

const LABELS = [
  'UNFOLD', 'SCAN', 'READ', 'MAP',
  'CROSS', 'CHECK', 'SCORE', 'DONE',
];

type FacetPhase = 'closed' | 'open' | 'done';

export default function OrigamiFold({ trigger }: { trigger: number }) {
  const [phases, setPhases] = useState<FacetPhase[]>(Array(N).fill('closed'));
  const [activeLabel, setActiveLabel] = useState('');
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (trigger === 0) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    function runCycle() {
      if (cancelled) return;
      setPhases(Array(N).fill('closed'));
      setActiveLabel('');
      setRotation(0);

      for (let i = 0; i < N; i++) {
        timer = setTimeout(() => {
          if (cancelled) return;
          setPhases(prev => { const n = [...prev]; n[i] = 'open'; return n; });
          setActiveLabel(LABELS[i]);
          setRotation(prev => prev + 45);
        }, 300 + i * 500);

        timer = setTimeout(() => {
          if (cancelled) return;
          setPhases(prev => { const n = [...prev]; n[i] = 'done'; return n; });
        }, 650 + i * 500);
      }

      // All done after 300 + 7*500 + 350 ≈ 4150ms. Hold 2s then loop.
      timer = setTimeout(() => {
        if (cancelled) return;
        runCycle();
      }, 300 + N * 500 + 2500);
    }

    runCycle();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [trigger]);

  const facets = Array.from({ length: N }, (_, i) => {
    const a0 = (i / N) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / N) * Math.PI * 2 - Math.PI / 2;
    const aMid = (a0 + a1) / 2;

    const [ox, oy] = polarPt(CX, CY, R_OUTER, aMid);
    const phase = phases[i];

    // Transform: when 'open', push outward then pull back to 'done'
    const scale = phase === 'open' ? 1.18 : 1;
    const opacity = phase === 'closed' ? 0.15 : phase === 'open' ? 0.95 : 0.72;

    const [p0x, p0y] = polarPt(CX, CY, R_INNER, a0);
    const [p1x, p1y] = polarPt(CX, CY, R_INNER, a1);
    const [p2x, p2y] = polarPt(CX, CY, R_OUTER, a1);
    const [p3x, p3y] = polarPt(CX, CY, R_OUTER, a0);

    const pts = `${p0x},${p0y} ${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`;

    return { pts, ox, oy, scale, opacity, phase, aMid, color: FACET_COLORS[i] };
  });

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: '#1a1614', position: 'relative' }}
    >
      <svg
        key={trigger}
        viewBox="0 0 260 180"
        width="260"
        height="180"
      >
        {/* Center hub */}
        <circle
          cx={CX}
          cy={CY}
          r={R_INNER}
          fill="#2a2420"
          stroke="#c9a14a"
          strokeWidth={0.8}
          opacity={0.6}
        />
        <circle
          cx={CX}
          cy={CY}
          r={4}
          fill="#c9a14a"
          opacity={trigger > 0 ? 1 : 0.2}
          style={{ transition: 'opacity 0.3s' }}
        />

        {/* Fold lines from center */}
        {facets.map((f, i) => {
          const a = (i / N) * Math.PI * 2 - Math.PI / 2;
          const [ex, ey] = polarPt(CX, CY, R_OUTER, a);
          return (
            <line
              key={i}
              x1={CX} y1={CY}
              x2={ex} y2={ey}
              stroke="#c9a14a"
              strokeWidth={0.4}
              opacity={0.3}
            />
          );
        })}

        {/* Facets */}
        <g
          transform={`rotate(${rotation} ${CX} ${CY})`}
          style={{ transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          {facets.map((f, i) => (
            <polygon
              key={i}
              points={f.pts}
              fill={f.color}
              opacity={f.opacity}
              stroke="#1a1614"
              strokeWidth={0.8}
              style={{
                transformOrigin: `${CX}px ${CY}px`,
                transform: f.phase === 'open' ? `scale(${f.scale})` : 'scale(1)',
                transition: 'opacity 0.25s, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            />
          ))}
        </g>

        {/* Active step label in center */}
        <text
          x={CX}
          y={CY + 4}
          textAnchor="middle"
          fontSize={5.5}
          fill="#c9a14a"
          fontFamily="monospace"
          letterSpacing="0.15em"
        >
          {activeLabel}
        </text>

        {/* Outer ring tick marks */}
        {Array.from({ length: N }, (_, i) => {
          const a = (i / N) * Math.PI * 2 - Math.PI / 2;
          const [x1, y1] = polarPt(CX, CY, R_OUTER + 4, a);
          const [x2, y2] = polarPt(CX, CY, R_OUTER + 10, a);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={phases[i] === 'done' ? '#c9a14a' : '#3a3028'}
              strokeWidth={1.2}
              style={{ transition: 'stroke 0.3s' }}
            />
          );
        })}
      </svg>

      {/* label */}
      <div style={{
        position: 'absolute', bottom: 8, left: 0, right: 0,
        textAlign: 'center', fontSize: 9,
        fontFamily: 'monospace',
        color: '#c9a14a',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
      }}>
        {trigger === 0 ? '—' : phases.every(p => p === 'done') ? 'Complete' : 'Processing…'}
      </div>
    </div>
  );
}
