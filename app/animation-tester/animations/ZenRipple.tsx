'use client';
/*
 * ZEN RIPPLE — V1: Zen Garden
 * Sand-mandala wave: pressing a finger into still sand.
 * A grid of dots ripples outward from center when triggered.
 */
import { useEffect, useState } from 'react';

const COLS = 13;
const ROWS = 9;
const TOTAL = COLS * ROWS;

function dist(i: number) {
  const x = (i % COLS) - Math.floor(COLS / 2);
  const y = Math.floor(i / COLS) - Math.floor(ROWS / 2);
  return Math.sqrt(x * x + y * y);
}

const MAX_DIST = dist(0);

export default function ZenRipple({ trigger }: { trigger: number }) {
  const [wave, setWave] = useState<number[]>(Array(TOTAL).fill(0));

  useEffect(() => {
    if (trigger === 0) {
      setWave(Array(TOTAL).fill(0));
      return;
    }

    const distances = Array.from({ length: TOTAL }, (_, i) => dist(i));
    const maxD = Math.max(...distances);
    const PHASES = 24;
    const PHASE_MS = 60;
    const PAUSE_MS = 1600;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    function runRipple() {
      let phase = 0;
      function step() {
        if (cancelled) return;
        setWave(distances.map(d => {
          const normalized = d / maxD;
          const waveFront = phase / PHASES;
          const distance = Math.abs(normalized - waveFront);
          if (distance < 0.18) return 1 - distance / 0.18;
          return 0;
        }));
        if (phase < PHASES + 6) {
          phase++;
          timer = setTimeout(step, PHASE_MS);
        } else {
          setWave(Array(TOTAL).fill(0));
          // Loop: fire another ripple after a pause
          timer = setTimeout(runRipple, PAUSE_MS);
        }
      }
      step();
    }

    runRipple();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [trigger]);

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: '#f7eed8' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: '7px',
          padding: '12px',
        }}
      >
        {wave.map((intensity, i) => {
          const baseSize = 6;
          const size = baseSize + intensity * 6;
          const lightness = 70 - intensity * 26;
          return (
            <div
              key={i}
              style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: `hsl(33, 45%, ${lightness}%)`,
                boxShadow: intensity > 0.2
                  ? `0 0 ${intensity * 6}px hsl(33,55%,55%)`
                  : 'none',
                transition: 'all 55ms ease-out',
                transform: `translateY(${-intensity * 5}px)`,
              }}
            />
          );
        })}
      </div>
      {trigger > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            fontSize: 11,
            letterSpacing: '0.15em',
            color: '#8b6b4a',
            textTransform: 'uppercase',
            fontFamily: 'serif',
          }}
        >
          Reading answer key…
        </div>
      )}
    </div>
  );
}
