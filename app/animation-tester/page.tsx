'use client';
/*
 * ANIMATION TESTER — Processing State Animations
 * 10 unique loading animations, one per variant theme.
 * Each tied to its theme's aesthetic, zero generic AI slop.
 */
import { useState } from 'react';
import ZenRipple from './animations/ZenRipple';
import ConveyorBench from './animations/ConveyorBench';
import TypewriterBubbles from './animations/TypewriterBubbles';
import BlueprintDraw from './animations/BlueprintDraw';
import CineReel from './animations/InkSpread';
import OrigamiFold from './animations/OrigamiFold';
import Oscilloscope from './animations/Oscilloscope';
import BinaryMatch from './animations/BinaryMatch';
import HeatmapReveal from './animations/HeatmapReveal';
import ParticleHourglass from './animations/ParticleHourglass';

type AnimCard = {
  id: number;
  label: string;
  variant: string;
  tagline: string;
  component: (props: { trigger: number }) => React.ReactElement;
};

const ANIMATIONS: AnimCard[] = [
  {
    id: 1,
    label: 'Zen Ripple',
    variant: 'V1 — Zen Garden',
    tagline: 'Sand-mandala disturbance wave',
    component: ZenRipple,
  },
  {
    id: 2,
    label: 'Conveyor Bench',
    variant: 'V2 — Workshop Bench',
    tagline: 'Mechanical document stamping',
    component: ConveyorBench,
  },
  {
    id: 3,
    label: 'Typewriter Bubbles',
    variant: 'V3 — Conversation',
    tagline: 'System narrates its own actions',
    component: TypewriterBubbles,
  },
  {
    id: 4,
    label: 'Blueprint Draw',
    variant: 'V4 — Blueprint',
    tagline: 'Technical schematic self-drafting',
    component: BlueprintDraw,
  },
  {
    id: 5,
    label: 'Cine Reel',
    variant: 'V5 — Story Scroll',
    tagline: 'Film strip advances frame-by-frame through a projector gate',
    component: CineReel,
  },
  {
    id: 6,
    label: 'Origami Fold',
    variant: 'V6 — Origami',
    tagline: 'Paper facets unfolding stepwise',
    component: OrigamiFold,
  },
  {
    id: 7,
    label: 'Oscilloscope',
    variant: 'V7 — Scientific Instrument',
    tagline: 'Live CRT waveform traces',
    component: Oscilloscope,
  },
  {
    id: 8,
    label: 'Binary Match',
    variant: 'V8 — Split View',
    tagline: 'Dual columns comparing answers',
    component: BinaryMatch,
  },
  {
    id: 9,
    label: 'Heatmap Reveal',
    variant: 'V9 — Map View',
    tagline: 'Column-scan lighting up the grid',
    component: HeatmapReveal,
  },
  {
    id: 10,
    label: 'Particle Hourglass',
    variant: 'V10 — Ritual',
    tagline: 'Gold particles falling through time',
    component: ParticleHourglass,
  },
];

export default function AnimationTesterPage() {
  // Each card's trigger counter — increment to restart
  const [triggers, setTriggers] = useState<number[]>(ANIMATIONS.map(() => 0));

  function fire(idx: number) {
    setTriggers(prev => {
      const n = [...prev];
      n[idx] = n[idx] + 1;
      return n;
    });
  }

  function fireAll() {
    setTriggers(prev => prev.map(t => t + 1));
  }

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: '#e4e4e7', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #18181b',
        padding: '20px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#52525b', textTransform: 'uppercase', marginBottom: 4 }}>
            UPSC Buddy · Internal Dev Tool
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#f4f4f5', letterSpacing: '-0.02em' }}>
            Processing Animation Tester
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#71717a' }}>
            10 unique loading states — one per variant theme. Click Simulate on any card to preview.
          </p>
        </div>
        <button
          onClick={fireAll}
          style={{
            padding: '9px 20px',
            background: '#27272a',
            border: '1px solid #3f3f46',
            borderRadius: 6,
            color: '#e4e4e7',
            fontSize: 13,
            cursor: 'pointer',
            letterSpacing: '0.02em',
            flexShrink: 0,
          }}
          onMouseEnter={e => ((e.target as HTMLButtonElement).style.background = '#3f3f46')}
          onMouseLeave={e => ((e.target as HTMLButtonElement).style.background = '#27272a')}
        >
          ▶ Simulate All
        </button>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
        gap: 20,
        padding: '28px 32px',
        maxWidth: 1400,
        margin: '0 auto',
      }}>
        {ANIMATIONS.map((anim, idx) => {
          const Comp = anim.component;
          return (
            <div
              key={anim.id}
              style={{
                background: '#0f0f11',
                border: '1px solid #18181b',
                borderRadius: 10,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Preview area */}
              <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                <Comp trigger={triggers[idx]} />
              </div>

              {/* Card footer */}
              <div style={{
                padding: '12px 14px',
                borderTop: '1px solid #18181b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 13, fontWeight: 600, color: '#f4f4f5',
                      whiteSpace: 'nowrap',
                    }}>
                      {anim.label}
                    </span>
                    <span style={{
                      fontSize: 9, padding: '2px 6px',
                      background: '#18181b', border: '1px solid #27272a',
                      borderRadius: 4, color: '#71717a',
                      fontFamily: 'monospace', letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}>
                      {anim.variant}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#52525b', marginTop: 3, lineHeight: 1.3 }}>
                    {anim.tagline}
                  </div>
                </div>
                <button
                  onClick={() => fire(idx)}
                  style={{
                    padding: '6px 14px',
                    background: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: 6,
                    color: '#a1a1aa',
                    fontSize: 12,
                    cursor: 'pointer',
                    flexShrink: 0,
                    letterSpacing: '0.03em',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => {
                    const b = e.target as HTMLButtonElement;
                    b.style.background = '#27272a';
                    b.style.color = '#f4f4f5';
                    b.style.borderColor = '#71717a';
                  }}
                  onMouseLeave={e => {
                    const b = e.target as HTMLButtonElement;
                    b.style.background = '#18181b';
                    b.style.color = '#a1a1aa';
                    b.style.borderColor = '#3f3f46';
                  }}
                >
                  Simulate
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div style={{
        textAlign: 'center', padding: '16px 32px 28px',
        fontSize: 11, color: '#27272a', letterSpacing: '0.05em',
      }}>
        ANIMATION TESTER · NOT FOR PRODUCTION · LOCAL DEV ONLY
      </div>
    </div>
  );
}
