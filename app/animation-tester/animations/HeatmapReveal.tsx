'use client';
/*
 * HEATMAP REVEAL — V9: Map View
 * A 10×10 answer grid. A scan line sweeps across, revealing
 * each cell in its "final color": green (correct), red (wrong), amber (blank).
 * Mimics the heat-map overview from the Map View theme.
 */
import { useEffect, useState } from 'react';

const COLS = 10, ROWS = 10;
const TOTAL = COLS * ROWS;

// Pre-determined answer correctness pattern: 67% correct ratio
const CELL_STATES: ('correct' | 'wrong' | 'blank')[] = Array.from({ length: TOTAL }, (_, i) => {
  const h = ((i * 73 + 19) % 100);
  if (i % 17 === 0) return 'blank';
  return h < 67 ? 'correct' : 'wrong';
});

const COLOR = {
  correct: { bg: '#166534', border: '#22c55e', glow: '#22c55e' },
  wrong:   { bg: '#7f1d1d', border: '#ef4444', glow: '#ef4444' },
  blank:   { bg: '#1e293b', border: '#64748b', glow: '#64748b' },
  hidden:  { bg: '#0f172a', border: '#1e293b', glow: 'transparent' },
};

export default function HeatmapReveal({ trigger }: { trigger: number }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [scanLine, setScanLine] = useState(-1);
  const [summary, setSummary] = useState({ c: 0, w: 0, b: 0 });
  // Live cell state per cycle (fresh random pattern each run)
  const [cellStates, setCellStates] = useState(CELL_STATES);

  useEffect(() => {
    if (trigger === 0) {
      setRevealed(new Set()); setScanLine(-1); setSummary({ c: 0, w: 0, b: 0 });
      return;
    }
    let cancelled = false;

    function runCycle() {
      if (cancelled) return;
      // Generate fresh pattern each cycle
      const newStates: typeof CELL_STATES = Array.from({ length: TOTAL }, (_, i) => {
        const h = ((i * ((Date.now() % 97) + 31) + 19) % 100);
        if (i % 17 === 0) return 'blank';
        return h < 67 ? 'correct' : 'wrong';
      });
      setCellStates(newStates);
      setRevealed(new Set());
      setScanLine(-1);
      setSummary({ c: 0, w: 0, b: 0 });

      let col = 0;
      let sumC = 0, sumW = 0, sumB = 0;

      const interval = setInterval(() => {
        if (cancelled) { clearInterval(interval); return; }
        if (col >= COLS) {
          clearInterval(interval);
          setScanLine(COLS);
          // Hold 2s then restart
          setTimeout(runCycle, 2200);
          return;
        }
        setScanLine(col);
        setRevealed(prev => {
          const next = new Set(prev);
          for (let row = 0; row < ROWS; row++) {
            const idx = row * COLS + col;
            next.add(idx);
            const st = newStates[idx];
            if (st === 'correct') sumC++;
            else if (st === 'wrong') sumW++;
            else sumB++;
          }
          return next;
        });
        setSummary({ c: sumC, w: sumW, b: sumB });
        col++;
      }, 260);
    }

    runCycle();
    return () => { cancelled = true; };
  }, [trigger]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3"
      style={{ background: '#040d12', padding: 12 }}
    >
      {/* Grid */}
      <div style={{ position: 'relative' }}>
        {/* Scan line */}
        {scanLine >= 0 && scanLine < COLS && (
          <div style={{
            position: 'absolute',
            top: -2,
            left: scanLine * 22,
            width: 22,
            bottom: -2,
            background: 'rgba(255,255,255,0.06)',
            borderLeft: '1px solid rgba(255,255,255,0.15)',
            borderRight: '1px solid rgba(255,255,255,0.15)',
            transition: 'left 0.18s ease-out',
            zIndex: 10,
            pointerEvents: 'none',
          }} />
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 20px)`,
          gap: 2,
        }}>
          {Array.from({ length: TOTAL }, (_, i) => {
            const isRevealed = revealed.has(i);
            const state = isRevealed ? cellStates[i] : 'hidden';
            const c = COLOR[state];
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            return (
              <div
                key={i}
                style={{
                  width: 20,
                  height: 16,
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  borderRadius: 2,
                  boxShadow: isRevealed ? `0 0 4px ${c.glow}40` : 'none',
                  transition: isRevealed ? 'background 0.15s, border-color 0.15s, box-shadow 0.15s' : 'none',
                  position: 'relative',
                }}
                title={`Q${i + 1}: ${state}`}
              >
                {isRevealed && (
                  <span style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 6, color: c.border, fontFamily: 'monospace',
                    fontWeight: 700,
                    opacity: 0.8,
                  }}>
                    {state === 'correct' ? '✓' : state === 'wrong' ? '✗' : '○'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary bar */}
      <div style={{
        display: 'flex', gap: 12, fontSize: 10,
        fontFamily: 'monospace',
      }}>
        <span style={{ color: '#22c55e' }}>✓ {summary.c}</span>
        <span style={{ color: '#ef4444' }}>✗ {summary.w}</span>
        <span style={{ color: '#64748b' }}>○ {summary.b}</span>
        <span style={{ color: '#475569' }}>
          {summary.c + summary.w + summary.b > 0
            ? `${Math.round((summary.c / (summary.c + summary.w + summary.b)) * 100)}%`
            : '—'}
        </span>
      </div>
    </div>
  );
}
