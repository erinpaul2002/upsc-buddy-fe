'use client';
/*
 * CONVEYOR BENCH — V2: Workshop Bench
 * A document slides in, gets stamped by three scanning arms, slides out.
 * Industrial. Mechanical. Direct.
 */
import { useEffect, useState } from 'react';

type Stage = 'idle' | 'enter' | 'scan1' | 'scan2' | 'scan3' | 'exit' | 'done';

const STAGES: Stage[] = ['enter', 'scan1', 'scan2', 'scan3', 'exit', 'done'];
const STAGE_LABELS: Record<string, string> = {
  scan1: 'RECEIVE',
  scan2: 'PARSE',
  scan3: 'VALIDATE',
};
const STAGE_DELAYS: Record<Stage, number> = {
  idle: 0,
  enter: 700,
  scan1: 900,
  scan2: 900,
  scan3: 900,
  exit: 800,
  done: 0,
};

export default function ConveyorBench({ trigger }: { trigger: number }) {
  const [stage, setStage] = useState<Stage>('idle');
  const [stamps, setStamps] = useState<string[]>([]);
  const [armY, setArmY] = useState(0);

  useEffect(() => {
    if (trigger === 0) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    function runCycle() {
      if (cancelled) return;
      setStage('idle');
      setStamps([]);
      setArmY(0);

      function advance(s: Stage, idx: number) {
        if (cancelled) return;
        setStage(s);
        if (s === 'scan1' || s === 'scan2' || s === 'scan3') {
          setArmY(40);
          setTimeout(() => { if (!cancelled) setArmY(0); }, 350);
          setTimeout(() => { if (!cancelled) setStamps(prev => [...prev, STAGE_LABELS[s]]); }, 380);
        }
        if (idx < STAGES.length - 1) {
          timer = setTimeout(() => advance(STAGES[idx + 1], idx + 1), STAGE_DELAYS[s]);
        } else {
          // Loop after a brief pause
          timer = setTimeout(runCycle, 1500);
        }
      }

      timer = setTimeout(() => advance(STAGES[0], 0), 200);
    }

    runCycle();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [trigger]);

  const docX =
    stage === 'idle' ? -90 :
    stage === 'enter' ? 90 :
    stage === 'scan1' || stage === 'scan2' || stage === 'scan3' ? 90 :
    stage === 'exit' ? 280 : 280;

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#1a0f06' }}
    >
      {/* Conveyor track */}
      <div style={{ position: 'relative', width: 260, height: 140 }}>
        {/* Track bed */}
        <div style={{
          position: 'absolute', bottom: 16, left: 0, right: 0, height: 8,
          background: '#3d2b1a', borderRadius: 4, border: '1px solid #6b4e2e',
        }} />
        {/* Track rollers */}
        {[0, 52, 104, 156, 208].map(x => (
          <div key={x} style={{
            position: 'absolute', bottom: 12, left: x + 20,
            width: 10, height: 16, borderRadius: '50%',
            background: '#5a3e28', border: '1px solid #8b6b4a',
          }} />
        ))}

        {/* Overhead arms */}
        {[55, 130, 205].map((x, i) => {
          const label = ['RECEIVE', 'PARSE', 'VALIDATE'][i];
          const isActive =
            (i === 0 && stage === 'scan1') ||
            (i === 1 && stage === 'scan2') ||
            (i === 2 && stage === 'scan3');
          const done = stamps.includes(label);
          return (
            <div key={x} style={{ position: 'absolute', left: x - 1, top: 0 }}>
              {/* vertical rail */}
              <div style={{
                width: 3, height: 30 + (isActive ? armY : 0),
                background: isActive ? '#d4a843' : done ? '#4a7c59' : '#6b4e2e',
                transition: 'height 0.2s ease, background 0.3s',
              }} />
              {/* head */}
              <div style={{
                width: 18, height: 8, marginLeft: -7.5,
                background: isActive ? '#d4a843' : done ? '#4a7c59' : '#5a3e28',
                borderRadius: 2,
                transition: 'background 0.3s',
              }} />
            </div>
          );
        })}

        {/* Document */}
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: docX,
          transition: stage === 'enter' ? 'left 0.5s ease-out' :
            stage === 'exit' ? 'left 0.6s ease-in' : 'left 0.1s',
          width: 44,
          height: 58,
          background: '#f4e8c1',
          border: '1px solid #c4a882',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          padding: 4,
          boxShadow: '2px 2px 6px rgba(0,0,0,0.4)',
        }}>
          {[0, 1, 2, 3, 4].map(r => (
            <div key={r} style={{
              height: 2,
              background: r === 0 ? '#8b6b4a' : '#c4a882',
              borderRadius: 1,
              width: r === 0 ? '60%' : '85%',
            }} />
          ))}
        </div>

        {/* Stamps */}
        <div style={{
          position: 'absolute', bottom: 86, left: 0, right: 0,
          display: 'flex', gap: 8, justifyContent: 'center',
        }}>
          {stamps.map(s => (
            <div key={s} style={{
              fontSize: 8,
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              color: '#4a7c59',
              border: '1.5px solid #4a7c59',
              padding: '2px 4px',
              borderRadius: 2,
              animation: 'stamp-in 0.2s ease-out',
            }}>
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div style={{
        marginTop: 8, fontSize: 11, fontFamily: 'monospace',
        color: stage === 'done' ? '#4a7c59' : '#8b6b4a',
        letterSpacing: '0.1em',
      }}>
        {stage === 'idle' ? '———' :
          stage === 'enter' ? 'LOADING DOCUMENT' :
          stage === 'scan1' ? 'RECEIVING' :
          stage === 'scan2' ? 'PARSING' :
          stage === 'scan3' ? 'VALIDATING' :
          stage === 'exit' ? 'DISPATCHING' :
          '✓ PROCESSED'}
      </div>

      <style>{`
        @keyframes stamp-in {
          from { transform: scale(1.6) rotate(-8deg); opacity: 0; }
          to { transform: scale(1) rotate(-3deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
