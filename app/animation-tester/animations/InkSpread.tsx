'use client';
/*
 * CINE REEL — V5: Story Scroll (replaced)
 * A film strip advances frame-by-frame through a projector gate.
 * Each frame shows a processing step. Sprocket holes, grain, gate flicker.
 * Story-driven, tactile, completely non-generic.
 */
import { useEffect, useRef, useState } from 'react';

const FRAMES = [
  { step: '01', title: 'RECEIPT',  sub: 'Document ingested' },
  { step: '02', title: 'EXPOSURE', sub: 'Grid located' },
  { step: '03', title: 'DEVELOP',  sub: 'Marks extracted' },
  { step: '04', title: 'REGISTER', sub: '100 answers mapped' },
  { step: '05', title: 'CUT',      sub: 'Key cross-referenced' },
  { step: '06', title: 'PROJECT',  sub: 'Report rendered' },
];

const FRAME_W = 74;
const STRIP_H = 136;

function FilmFrame({
  frame, isActive, isNext, grain,
}: {
  frame: typeof FRAMES[0] | null;
  isActive: boolean;
  isNext: boolean;
  grain: number;
}) {
  return (
    <div style={{
      width: FRAME_W,
      height: STRIP_H,
      flexShrink: 0,
      background: '#080600',
      borderRight: '1px solid #1e1a08',
      position: 'relative',
    }}>
      {/* Top sprockets */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
        {[0, 1, 2].map(k => (
          <div key={k} style={{ width: 9, height: 6, borderRadius: 2,
            background: '#000', border: '1px solid #2a2208' }} />
        ))}
      </div>

      {/* Frame window */}
      <div style={{
        position: 'absolute', top: 16, bottom: 16, left: 5, right: 5,
        background: isActive ? '#1c1408' : '#0e0c06',
        border: `1px solid ${isActive ? '#c9a14a55' : '#1a1608'}`,
        borderRadius: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {frame ? (
          <>
            <div style={{ position: 'absolute', top: 3, left: 4,
              fontSize: 5.5, color: '#3a2e08', fontFamily: 'monospace' }}>
              {frame.step}
            </div>
            <div style={{
              width: 20, height: 20,
              border: `1.5px solid ${isActive ? '#c9a14a' : '#2a2208'}`,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 5,
              boxShadow: isActive ? '0 0 10px #c9a14a44' : 'none',
              transition: 'all 0.3s',
            }}>
              <div style={{
                width: isActive ? 6 : 3, height: isActive ? 6 : 3,
                borderRadius: '50%',
                background: isActive ? '#c9a14a' : '#2a2208',
                transition: 'all 0.3s',
              }} />
            </div>
            <div style={{
              fontSize: isActive ? 8 : 6.5, fontFamily: 'monospace',
              color: isActive ? '#c9a14a' : '#4a3a14',
              letterSpacing: '0.1em', fontWeight: 700,
              transition: 'all 0.3s',
            }}>{frame.title}</div>
            <div style={{
              fontSize: 5, color: isActive ? '#7a5a22' : '#1e1a08',
              fontFamily: 'monospace', marginTop: 3,
              textAlign: 'center', padding: '0 4px',
              transition: 'color 0.3s',
            }}>{frame.sub}</div>
          </>
        ) : (
          <div style={{ width: 14, height: 14, background: '#080600' }} />
        )}
        {/* Gate flicker */}
        {isActive && grain > 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            background: `rgba(255,255,255,${grain * 0.05})`,
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* Bottom sprockets */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
        {[0, 1, 2].map(k => (
          <div key={k} style={{ width: 9, height: 6, borderRadius: 2,
            background: '#000', border: '1px solid #2a2208' }} />
        ))}
      </div>
    </div>
  );
}

export default function CineReel({ trigger }: { trigger: number }) {
  const [activeFrame, setActiveFrame] = useState(0);
  const [sliding, setSliding] = useState(false);
  const [grain, setGrain] = useState(0);

  useEffect(() => {
    if (trigger === 0) { setActiveFrame(0); setSliding(false); setGrain(0); return; }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    function advance(frame: number) {
      if (cancelled) return;
      if (frame === 0) {
        setActiveFrame(0); setSliding(false); setGrain(0);
      }
      if (frame < FRAMES.length - 1) {
        timer = setTimeout(() => {
          if (cancelled) return;
          setSliding(true);
          setTimeout(() => {
            if (cancelled) return;
            setActiveFrame(frame + 1);
            setSliding(false);
            setGrain(1);
            setTimeout(() => { if (!cancelled) setGrain(0.5); }, 55);
            setTimeout(() => { if (!cancelled) setGrain(0.9); }, 95);
            setTimeout(() => { if (!cancelled) setGrain(0); }, 150);
            advance(frame + 1);
          }, 260);
        }, frame === 0 ? 400 : 1100);
      } else {
        // Hold on last frame 2s then loop
        timer = setTimeout(() => advance(0), 2800);
      }
    }

    advance(0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [trigger]);

  // Show prev, active, next
  const prev = FRAMES[activeFrame - 1] ?? null;
  const curr = FRAMES[activeFrame];
  const next = FRAMES[activeFrame + 1] ?? null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3"
      style={{ background: '#060400' }}>

      {/* Reel spinners */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 1 }}>
        {['left', 'right'].map(side => (
          <div key={side} style={{
            width: 16, height: 16, borderRadius: '50%',
            border: '1.5px solid #3a2e08', position: 'relative',
            animation: trigger > 0 ? 'reel-spin 0.7s linear infinite' : 'none',
          }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 4, height: 4, borderRadius: '50%', background: '#3a2e08',
            }} />
          </div>
        ))}
      </div>

      {/* Film strip viewport */}
      <div style={{ overflow: 'hidden', width: FRAME_W * 3, position: 'relative' }}>
        <div style={{
          display: 'flex',
          transform: sliding ? `translateX(-${FRAME_W}px)` : 'translateX(0)',
          transition: sliding ? 'transform 0.26s cubic-bezier(0.55,0,1,1)' : 'none',
        }}>
          <FilmFrame frame={prev} isActive={false} isNext={false} grain={0} />
          <FilmFrame frame={curr} isActive={!sliding} isNext={false} grain={grain} />
          <FilmFrame frame={next} isActive={false} isNext={true} grain={0} />
        </div>
        {/* Gate edge masks */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to right, #060400 0px, transparent 36px, transparent calc(100% - 36px), #060400 100%)',
        }} />
        {/* Active frame border */}
        <div style={{
          position: 'absolute', top: 16, left: FRAME_W + 5,
          width: FRAME_W - 10, bottom: 16,
          border: '1px solid #c9a14a44',
          boxShadow: '0 0 14px #c9a14a18',
          borderRadius: 1, pointerEvents: 'none',
        }} />
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: 5 }}>
        {FRAMES.map((_, i) => (
          <div key={i} style={{
            height: 3, borderRadius: 2,
            width: i === activeFrame ? 14 : 5,
            background: i < activeFrame ? '#5a4a1a' : i === activeFrame ? '#c9a14a' : '#1a1608',
            transition: 'width 0.3s, background 0.3s',
          }} />
        ))}
      </div>

      <style>{`
        @keyframes reel-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
