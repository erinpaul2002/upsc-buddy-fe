'use client';
/*
 * BINARY MATCH — V8: Split View / Side-by-Side Comparison
 * Two columns of answer letters scroll upward simultaneously.
 * A center judgment lane marks each pair: green match, red mismatch.
 * Tally bar updates in real-time.
 */
import { useEffect, useRef, useState } from 'react';

const OPTIONS = ['A', 'B', 'C', 'D'];
const SHOW = 7;

function buildAnswers(n: number) {
  return Array.from({ length: n }, () => ({
    student: OPTIONS[(Math.random() * 4) | 0],
    correct: OPTIONS[(Math.random() * 4) | 0],
  }));
}

export default function BinaryMatch({ trigger }: { trigger: number }) {
  const answersRef = useRef<{ student: string; correct: string }[]>([]);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [judged, setJudged] = useState<boolean[]>([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    if (trigger === 0) return;
    let cancelled = false;

    function runCycle() {
      if (cancelled) return;
      setScrollIndex(0);
      setJudged([]);
      setScore({ correct: 0, total: 0 });

      let idx = 0;
      // Generate a fresh random batch each cycle
      answersRef.current = buildAnswers(28);

      const interval = setInterval(() => {
        if (cancelled) { clearInterval(interval); return; }
        if (idx >= answersRef.current.length) {
          clearInterval(interval);
          // Hold 2s then restart
          setTimeout(runCycle, 2000);
          return;
        }
        const match = answersRef.current[idx].student === answersRef.current[idx].correct;
        setJudged(prev => [...prev, match]);
        setScore(prev => ({ correct: prev.correct + (match ? 1 : 0), total: prev.total + 1 }));
        setScrollIndex(prev => Math.min(prev + 1, answersRef.current.length - SHOW));
        idx++;
      }, 200);
    }

    runCycle();
    return () => { cancelled = true; };
  }, [trigger]);

  const visibleStart = Math.max(0, scrollIndex - 1);
  const visible = answersRef.current.slice(visibleStart, visibleStart + SHOW);

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ background: '#0f172a', fontFamily: 'monospace' }}
    >
      {/* Score bar */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        padding: '7px 14px', borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 9, color: '#64748b', letterSpacing: '0.1em' }}>MATCH RATE</div>
        <div style={{ flex: 1, height: 4, background: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: score.total > 0 ? `${(score.correct / score.total) * 100}%` : '0%',
            background: '#22c55e',
            transition: 'width 0.15s ease-out',
          }} />
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700,
          color: score.total > 0 && (score.correct / score.total) > 0.6 ? '#22c55e' : '#f59e0b',
        }}>
          {score.total > 0 ? `${score.correct}/${score.total}` : '—'}
        </div>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 18px 1fr',
        padding: '4px 14px', borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: 8, color: '#334155', letterSpacing: '0.15em', textAlign: 'center' }}>
          STUDENT
        </div>
        <div />
        <div style={{ fontSize: 8, color: '#334155', letterSpacing: '0.15em', textAlign: 'center' }}>
          CORRECT
        </div>
      </div>

      {/* Answer rows */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {visible.map((row, vi) => {
          const absIdx = visibleStart + vi;
          const verdict = absIdx < judged.length ? judged[absIdx] : null;
          return (
            <div
              key={absIdx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 18px 1fr',
                padding: '5px 14px',
                borderBottom: '1px solid #1e293b11',
                animation: vi === 0 ? 'row-slide 0.15s ease-out' : 'none',
                background: verdict === true ? 'rgba(34,197,94,0.04)' :
                  verdict === false ? 'rgba(239,68,68,0.04)' : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              {/* Question number */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <span style={{ fontSize: 8, color: '#334155' }}>Q{absIdx + 1}</span>
                <span style={{
                  fontSize: 14, fontWeight: 700,
                  color: verdict === false ? '#ef4444' : '#e2e8f0',
                }}>{row.student}</span>
              </div>

              {/* Verdict indicator */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {verdict === true && (
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 6px #22c55e',
                    display: 'block',
                    animation: 'pop 0.2s ease-out',
                  }} />
                )}
                {verdict === false && (
                  <span style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: '#ef4444',
                    boxShadow: '0 0 6px #ef4444',
                    display: 'block',
                    animation: 'pop 0.2s ease-out',
                  }} />
                )}
                {verdict === null && (
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#1e293b', display: 'block' }} />
                )}
              </div>

              {/* Correct answer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <span style={{
                  fontSize: 14, fontWeight: 700,
                  color: verdict === true ? '#22c55e' : '#64748b',
                }}>{row.correct}</span>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes row-slide {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop {
          0% { transform: scale(0); }
          70% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
