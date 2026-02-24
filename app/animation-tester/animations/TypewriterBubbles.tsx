'use client';
/*
 * TYPEWRITER BUBBLES — V3: Conversation
 * System messages appear one by one with typing indicator,
 * as if the backend is narrating what it's doing.
 */
import { useEffect, useState } from 'react';

const MESSAGES = [
  'Receiving answer key document…',
  'Locating question bubble grid…',
  'Extracting 100 fill marks…',
  'Cross-referencing answer positions…',
  'Validating fill density thresholds…',
  'Compiling evaluation report ✓',
];

function TypingIndicator() {
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center', padding: '0 2px' }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#64748b',
            display: 'inline-block',
            animation: `typing-dot 1.1s ${i * 0.18}s ease-in-out infinite`,
          }}
        />
      ))}
    </span>
  );
}

export default function TypewriterBubbles({ trigger }: { trigger: number }) {
  const [visible, setVisible] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (trigger === 0) return;
    let cancelled = false;

    async function runCycle() {
      while (!cancelled) {
        setVisible([]);
        setTyping(false);
        for (let i = 0; i < MESSAGES.length; i++) {
          if (cancelled) return;
          setTyping(true);
          await new Promise(r => setTimeout(r, 700 + i * 80));
          if (cancelled) return;
          setTyping(false);
          setVisible(prev => [...prev, MESSAGES[i]]);
          await new Promise(r => setTimeout(r, 320));
        }
        // Hold on final message, then fade and restart
        await new Promise(r => setTimeout(r, 3000));
        if (cancelled) return;
        // Clear and loop
        setVisible([]);
        await new Promise(r => setTimeout(r, 600));
      }
    }

    runCycle();
    return () => { cancelled = true; };
  }, [trigger]);

  return (
    <div
      className="w-full h-full flex flex-col justify-end overflow-hidden"
      style={{ background: '#f8f7f4', padding: '14px 16px', gap: 6 }}
    >
      {/* System indicator */}
      <div style={{
        position: 'absolute', top: 12, left: 16,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#3b82f6',
          boxShadow: '0 0 6px #3b82f6',
        }} />
        <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
          UPSC BUDDY SYSTEM
        </span>
      </div>

      {/* Messages */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 7,
        overflowY: 'auto', paddingTop: 28,
      }}>
        {visible.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex', gap: 8, alignItems: 'flex-end',
              animation: 'bubble-in 0.25s ease-out',
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: '#e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, color: '#475569',
            }}>
              AI
            </div>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px 12px 12px 2px',
              padding: '7px 11px',
              fontSize: 11,
              color: '#1e293b',
              fontFamily: 'system-ui, sans-serif',
              lineHeight: 1.4,
              letterSpacing: '0.01em',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              maxWidth: '85%',
            }}>
              {i === MESSAGES.length - 1
                ? <span style={{ color: '#059669', fontWeight: 600 }}>{msg}</span>
                : msg}
            </div>
          </div>
        ))}

        {typing && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', animation: 'bubble-in 0.2s ease-out' }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: '#e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, color: '#475569',
            }}>
              AI
            </div>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px 12px 12px 2px',
              padding: '7px 12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes typing-dot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes bubble-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
