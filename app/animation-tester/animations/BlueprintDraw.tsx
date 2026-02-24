'use client';
/*
 * BLUEPRINT DRAW — V4: Blueprint / Data-Dense Precision Grid
 * SVG lines draw themselves like technical drafting — outer frame first,
 * then grid, then crosshair, then measurement annotations.
 */
import { useEffect, useRef, useState } from 'react';

const GRID_LINES = 5;

function AnimatedPath({
  d,
  delay,
  color = '#ffffff',
  strokeWidth = 1,
  length,
  dashArray,
}: {
  d: string;
  delay: number;
  color?: string;
  strokeWidth?: number;
  length: number;
  dashArray?: string;
}) {
  const ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.strokeDasharray = String(length);
    el.style.strokeDashoffset = String(length);
    el.style.transition = 'none';
    const t = setTimeout(() => {
      el.style.transition = `stroke-dashoffset ${length < 100 ? 0.4 : 0.8}s cubic-bezier(0.4,0,0.2,1) ${delay}s`;
      el.style.strokeDashoffset = '0';
    }, 20);
    return () => clearTimeout(t);
  }, [delay, length]);

  return (
    <path
      ref={ref}
      d={d}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeDasharray={dashArray}
      style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
    />
  );
}

export default function BlueprintDraw({ trigger }: { trigger: number }) {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (trigger === 0) { setCycle(0); return; }
    // Full draw takes ~4s, then hold 2s, then replay
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    function loop() {
      if (cancelled) return;
      setCycle(c => c + 1);
      // Hold then re-trigger: draw (~4s) + hold (2s) = 6s per cycle
      timer = setTimeout(loop, 6200);
    }
    setCycle(1);
    timer = setTimeout(loop, 6200);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [trigger]);

  const key = cycle;

  return (
    <div
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{ background: '#0a1628' }}
    >
      <svg
        key={key}
        viewBox="0 0 260 180"
        width="260"
        height="180"
        style={{ display: 'block' }}
      >
        {/* Grid dots */}
        {Array.from({ length: 10 }, (_, iy) =>
          Array.from({ length: 14 }, (_, ix) => (
            <circle
              key={`${ix}-${iy}`}
              cx={10 + ix * 18}
              cy={10 + iy * 18}
              r={0.8}
              fill="#1a3a5c"
            />
          ))
        )}

        {/* Outer border — draws first */}
        <AnimatedPath
          key={`border-${key}`}
          d="M 20 16 L 240 16 L 240 164 L 20 164 Z"
          delay={0}
          color="#4a7ca8"
          strokeWidth={1}
          length={488}
        />

        {/* Horizontal grid lines */}
        {[50, 84, 118, 152].map((y, i) => (
          <AnimatedPath
            key={`hgrid-${i}-${key}`}
            d={`M 20 ${y} L 240 ${y}`}
            delay={0.5 + i * 0.12}
            color="#1f4068"
            strokeWidth={0.5}
            length={220}
          />
        ))}

        {/* Vertical grid lines */}
        {[70, 130, 190].map((x, i) => (
          <AnimatedPath
            key={`vgrid-${i}-${key}`}
            d={`M ${x} 16 L ${x} 164`}
            delay={0.65 + i * 0.1}
            color="#1f4068"
            strokeWidth={0.5}
            length={148}
          />
        ))}

        {/* Central crosshair target */}
        <AnimatedPath
          key={`cross-h-${key}`}
          d="M 100 90 L 160 90"
          delay={1.2}
          color="#f0a500"
          strokeWidth={1}
          length={60}
        />
        <AnimatedPath
          key={`cross-v-${key}`}
          d="M 130 60 L 130 120"
          delay={1.4}
          color="#f0a500"
          strokeWidth={1}
          length={60}
        />
        {/* Crosshair circle */}
        <circle
          key={`circle-${key}`}
          cx={130}
          cy={90}
          r={18}
          stroke="#f0a500"
          strokeWidth={1}
          fill="none"
          style={{
            strokeDasharray: 113,
            strokeDashoffset: trigger > 0 ? 0 : 113,
            transition: trigger > 0 ? `stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1) 1.6s` : 'none',
          }}
        />
        {/* inner dot */}
        <circle
          cx={130}
          cy={90}
          r={2.5}
          fill="#f0a500"
          opacity={trigger > 0 ? 1 : 0}
          style={{ transition: trigger > 0 ? 'opacity 0.3s 2.3s' : 'none' }}
        />

        {/* Dimension lines */}
        <AnimatedPath
          key={`dim-top-${key}`}
          d="M 20 8 L 240 8"
          delay={2.2}
          color="#2a6ca8"
          strokeWidth={0.7}
          length={220}
        />
        <AnimatedPath
          key={`dim-left-${key}`}
          d="M 12 16 L 12 164"
          delay={2.4}
          color="#2a6ca8"
          strokeWidth={0.7}
          length={148}
        />

        {/* Tick marks on dimension line */}
        {[20, 70, 130, 190, 240].map((x, i) => (
          <line
            key={`tick-${i}`}
            x1={x} y1={4} x2={x} y2={12}
            stroke="#2a6ca8"
            strokeWidth={0.7}
            opacity={trigger > 0 ? 1 : 0}
            style={{ transition: trigger > 0 ? `opacity 0.2s ${2.5 + i * 0.06}s` : 'none' }}
          />
        ))}

        {/* Labels */}
        {[
          { x: 124, y: 6, text: '220mm', anchor: 'middle' },
          { x: 6, y: 94, text: '148', anchor: 'middle', rotate: -90 },
          { x: 128, y: 102, text: 'REF', anchor: 'middle' },
        ].map(({ x, y, text, anchor, rotate }, i) => (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor={anchor as 'middle'}
            fontSize={6}
            fill="#4a7ca8"
            fontFamily="monospace"
            transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
            opacity={trigger > 0 ? 1 : 0}
            style={{ transition: trigger > 0 ? `opacity 0.4s ${2.8 + i * 0.15}s` : 'none' }}
          >
            {text}
          </text>
        ))}

        {/* Title block */}
        <AnimatedPath
          key={`title-box-${key}`}
          d="M 168 140 L 238 140 L 238 162 L 168 162 Z"
          delay={3.0}
          color="#4a7ca8"
          strokeWidth={0.8}
          length={192}
        />
        <text
          x={203}
          y={150}
          textAnchor="middle"
          fontSize={5.5}
          fill="#4a7ca8"
          fontFamily="monospace"
          opacity={trigger > 0 ? 1 : 0}
          style={{ transition: trigger > 0 ? 'opacity 0.3s 3.5s' : 'none' }}
        >
          ANSWER KEY ANALYSIS
        </text>
        <text
          x={203}
          y={158}
          textAnchor="middle"
          fontSize={4}
          fill="#2a6ca8"
          fontFamily="monospace"
          opacity={trigger > 0 ? 1 : 0}
          style={{ transition: trigger > 0 ? 'opacity 0.3s 3.7s' : 'none' }}
        >
          REV 01 — PROCESSING
        </text>
      </svg>
    </div>
  );
}
