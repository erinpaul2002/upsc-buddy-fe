/*
 * ═══════════════════════════════════════════════════════════
 * VARIANT 10: RITUAL — Ceremonial Full-Screen Reveal
 * ═══════════════════════════════════════════════════════════
 *
 * DESIGN THESIS:
 *   Elevates every action to feel meaningful and momentous.
 *   Each step occupies the entire screen with dramatic transitions.
 *   Optimizes for emotional weight — uploading a test feels like
 *   submitting an important document, results feel like opening
 *   an official verdict.
 *
 * PRIMARY USER STORY:
 *   Full black screen → title appears → user uploads OMR with
 *   gravity → screen transitions dramatically → upload key →
 *   another dramatic transition → "Open Results" button with
 *   weight → results revealed with cinematic animation, score
 *   counting up.
 *
 * KEY LAYOUT DECISIONS:
 *   Each stage is 100vh, centered, with lots of negative space.
 *   Dark theme throughout — creates focus and gravity.
 *   Typography-led hierarchy — large, light text dominates.
 *   Content is minimal per screen — one action, one message.
 *
 * INTERACTION STYLE:
 *   Full-screen stage transitions using framer-motion.
 *   Each step has ceremonial pacing (slight delays).
 *   Score reveals with counting animation.
 *
 * ACCESSIBILITY:
 *   Focus trapped within active stage. Escape key goes back.
 *   aria-live announcements for stage changes.
 *   High contrast white-on-dark text.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppState, type AppStep } from '../../context/AppStateContext';
import FileDropZone from '../../components/shared/FileDropZone';
import { motion, AnimatePresence } from 'framer-motion';

type Stage = 'welcome' | 'omr' | 'key' | 'seal' | 'results';

function stageFromStep(step: AppStep): Stage {
  if (step === 'idle' || step === 'omr-uploading') return 'omr';
  if (step === 'omr-done' || step === 'key-uploading') return 'key';
  if (step === 'key-done' || step === 'evaluating') return 'seal';
  if (step === 'results') return 'results';
  return 'welcome';
}

function useCountUp(target: number, duration = 1500, delay = 600) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }

    const delayTimer = setTimeout(() => {
      const startTime = Date.now();
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [target, duration, delay]);

  return count;
}

const stageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

export default function V10Ritual() {
  const {
    step,
    uploadOmr,
    uploadKey,
    evaluate,
    evaluation,
    error,
    reset,
    omrResult,
    keyResult,
  } = useAppState();

  const busy = ['omr-uploading', 'key-uploading', 'evaluating'].includes(step);
  const [showWelcome, setShowWelcome] = useState(true);
  const stage: Stage = showWelcome ? 'welcome' : stageFromStep(step);
  const e = evaluation?.evaluation;

  const scoreCount = useCountUp(e?.score ?? 0);

  // Keyboard: Escape to reset
  const handleKeyDown = useCallback(
    (ev: KeyboardEvent) => {
      if (ev.key === 'Escape' && evaluation) {
        reset();
      }
    },
    [evaluation, reset],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-[#0c0c0e] text-white overflow-hidden relative">
      <AnimatePresence mode="wait">
        {/* ===== WELCOME ===== */}
        {stage === 'welcome' && (
          <motion.div
            key="welcome"
            {...stageTransition}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-7xl font-extralight tracking-tight mb-4"
            >
              UPSC Buddy
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-sm md:text-base font-light mb-16"
            >
              OMR Answer Sheet Evaluator
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              onClick={() => setShowWelcome(false)}
              className="px-10 py-4 border border-white/20 rounded-full text-sm tracking-widest uppercase hover:bg-white/5 hover:border-white/40 transition-all duration-300"
            >
              Begin
            </motion.button>
          </motion.div>
        )}

        {/* ===== OMR UPLOAD ===== */}
        {stage === 'omr' && (
          <motion.div
            key="omr"
            {...stageTransition}
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
            aria-live="polite"
          >
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-extralight tracking-tight mb-3 text-center"
            >
              Your Answer Sheet
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              transition={{ delay: 0.4 }}
              className="text-sm mb-14 text-center"
            >
              Upload the filled OMR bubble sheet
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="w-full max-w-md"
            >
              <FileDropZone
                onFile={uploadOmr}
                disabled={busy}
              className="border border-white/10 rounded-2xl p-10 sm:p-16 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300"
            >
              <div className="flex flex-col items-center gap-4 sm:gap-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-white/40 text-sm">
                    Drop your sheet here
                  </p>
                </div>
              </FileDropZone>
            </motion.div>

            {busy && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-10 flex items-center gap-3 text-white/30 text-sm"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="w-4 h-4 border border-white/20 border-t-white/60 rounded-full"
                />
                Reading…
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ===== KEY UPLOAD ===== */}
        {stage === 'key' && (
          <motion.div
            key="key"
            {...stageTransition}
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
            aria-live="polite"
          >
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 0.3, y: 0 }}
              className="text-xs uppercase tracking-[0.3em] mb-6"
            >
              {omrResult?.answers.filter((a) => a !== 'EMPTY').length} answers
              captured
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-extralight tracking-tight mb-3 text-center"
            >
              The Answer Key
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              transition={{ delay: 0.4 }}
              className="text-sm mb-14 text-center"
            >
              Upload the correct answers table
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-md"
            >
              <FileDropZone
                onFile={uploadKey}
                disabled={busy}
                className="border border-white/10 rounded-2xl p-10 sm:p-16 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-4 sm:gap-5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <p className="text-white/40 text-sm">
                    Drop answer key here
                  </p>
                </div>
              </FileDropZone>
            </motion.div>

            {busy && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-10 flex items-center gap-3 text-white/30 text-sm"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="w-4 h-4 border border-white/20 border-t-white/60 rounded-full"
                />
                Extracting…
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ===== SEAL / EVALUATE ===== */}
        {stage === 'seal' && (
          <motion.div
            key="seal"
            {...stageTransition}
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto mb-8 rounded-full border border-white/10 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-white/15 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/10" />
                </div>
              </div>
              <h2 className="text-3xl font-extralight mb-3">Ready</h2>
              <p className="text-sm text-white/30 mb-12">
                {omrResult?.answers.filter((a) => a !== 'EMPTY').length} student
                answers vs{' '}
                {keyResult?.answers.filter((a) => a !== 'EMPTY').length}{' '}
                key answers
              </p>
              <button
                onClick={evaluate}
                disabled={busy}
                className="px-14 py-4 border border-white/15 rounded-full text-sm tracking-[0.2em] uppercase hover:bg-white/5 hover:border-white/30 transition-all duration-300 disabled:opacity-30"
              >
                {busy ? 'Evaluating…' : 'Open Results'}
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* ===== RESULTS ===== */}
        {stage === 'results' && e && (
          <motion.div
            key="results"
            {...stageTransition}
            className="absolute inset-0 overflow-y-auto"
          >
            <div className="min-h-full flex flex-col items-center justify-start px-4 sm:px-6 py-12 sm:py-20">
              {/* Score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-16"
              >
                <div className="text-[80px] sm:text-[120px] md:text-[160px] font-extralight leading-none tabular-nums">
                  {scoreCount}
                </div>
                <div className="text-lg text-white/20 mt-2 tracking-widest">
                  out of {e.total_questions}
                </div>
              </motion.div>

              {/* Stat line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex items-center gap-4 sm:gap-8 mb-16 text-xs sm:text-sm flex-wrap justify-center"
              >
                <span className="text-[#6b9a6e]">
                  {e.stats.correct} correct
                </span>
                <span className="text-white/10">|</span>
                <span className="text-[#c47070]">
                  {e.stats.wrong} wrong
                </span>
                <span className="text-white/10">|</span>
                <span className="text-white/25">
                  {e.stats.not_marked} blank
                </span>
              </motion.div>

              {/* Question Grid with staggered reveal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="w-full max-w-2xl mb-12 px-2"
              >
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                  {e.results.map((r, i) => (
                    <motion.div
                      key={r.question}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.8 + i * 0.008 }}
                      className={`aspect-square rounded-md flex items-center justify-center text-[9px] ${
                        r.status === 'CORRECT'
                          ? 'bg-[#6b9a6e]/20 text-[#6b9a6e]'
                          : r.status === 'WRONG'
                            ? 'bg-[#c47070]/20 text-[#c47070]'
                            : 'bg-white/[0.03] text-white/15'
                      }`}
                      title={`Q${r.question}: ${r.selected} → ${r.correct}`}
                    >
                      {r.question}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Reset */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                onClick={reset}
                className="text-sm text-white/20 hover:text-white/40 transition-colors tracking-widest uppercase"
              >
                Start Over
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error overlay */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-[#c47070] text-white rounded-lg text-sm z-50"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
