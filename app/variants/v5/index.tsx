/*
 * ═══════════════════════════════════════════════════════════
 * VARIANT 5: STORY SCROLL — Narrative Vertical Journey
 * ═══════════════════════════════════════════════════════════
 *
 * DESIGN THESIS:
 *   Treats evaluation as a story with beginning, middle, and end.
 *   Each scroll section is a "chapter" with its own mood.
 *   Optimizes for engagement and narrative comprehension.
 *
 * PRIMARY USER STORY:
 *   User scrolls through chapters: Hero intro → Upload OMR →
 *   Upload Key → Results Reveal. Sections pin and unpin as
 *   the user progresses through the vertical narrative.
 *
 * KEY LAYOUT DECISIONS:
 *   Full-width sections, each 100vh. Distinct background per
 *   section creates visual chapters. Content is centered within
 *   each section with generous vertical space.
 *
 * INTERACTION STYLE:
 *   Scroll-driven with section snapping. Content animates in
 *   on scroll. Parallax depth cues between sections.
 *
 * ACCESSIBILITY:
 *   Section landmarks, skip-to-content links, keyboard scroll
 *   support. High contrast maintained across all section palettes.
 */
'use client';

import { useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import FileDropZone from '../../components/shared/FileDropZone';
import { motion, useInView } from 'framer-motion';

function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.3 });

  return (
    <section
      ref={ref}
      id={id}
      className={`min-h-[calc(100vh-3.5rem)] snap-section flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16 ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        className="w-full max-w-xl"
      >
        {children}
      </motion.div>
    </section>
  );
}

export default function V5StoryScroll() {
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

  return (
    <div className="overflow-y-auto snap-y-mandatory h-[calc(100vh-3.5rem)]">
      {/* ===== CHAPTER 1: Arrival ===== */}
      <Section className="bg-gradient-to-b from-[#1a1c2e] to-[#262842] text-white" id="intro">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-3xl sm:text-5xl font-extralight tracking-tight mb-4">
              UPSC Buddy
            </h1>
            <p className="text-lg text-[#8a8eb0] font-light max-w-md mx-auto leading-relaxed">
              Upload your answer sheet and answer key. We&apos;ll compare them
              and give you a clear, honest breakdown.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16"
          >
            <svg
              className="w-6 h-6 mx-auto text-[#5a5e80] animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            <p className="text-[11px] text-[#5a5e80] mt-2">
              Scroll to begin
            </p>
          </motion.div>
        </div>
      </Section>

      {/* ===== CHAPTER 2: Student Sheet ===== */}
      <Section className="bg-[#fcfaf5]" id="omr">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#b8a88a] font-medium">
              Chapter One
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl text-[#3a3530] font-light mb-3">
            Your Answer Sheet
          </h2>
          <p className="text-sm text-[#8a8075] mb-10 leading-relaxed">
            Start by uploading the filled OMR bubble sheet — a photo or
            scanned PDF works best.
          </p>

          {omrResult ? (
            <div className="bg-white rounded-2xl p-8 border border-[#e8e3d8] text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#6b7c5e]/10 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-[#6b7c5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg text-[#3a3530] font-light">
                {omrResult.answers.filter((a) => a !== 'EMPTY').length} answers
                detected
              </p>
              <p className="text-xs text-[#b8a88a] mt-1">
                Scroll down for the next step
              </p>
            </div>
          ) : (
            <FileDropZone
              onFile={uploadOmr}
              disabled={busy}
              className="bg-white rounded-2xl p-8 sm:p-14 border-2 border-dashed border-[#ddd7ca] hover:border-[#6b7c5e]/40 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#f5f0e8] flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#b8a88a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-[#8a8075] text-sm font-medium">
                  Drop your OMR sheet here
                </p>
                <p className="text-xs text-[#b8a88a]">JPG, PNG, or PDF</p>
              </div>
            </FileDropZone>
          )}

          {step === 'omr-uploading' && (
            <p className="mt-6 text-center text-sm text-[#6b7c5e] animate-pulse">
              Processing your answer sheet…
            </p>
          )}
        </div>
      </Section>

      {/* ===== CHAPTER 3: Answer Key ===== */}
      <Section className="bg-[#f0eef5]" id="key">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#9a8eb0] font-medium">
              Chapter Two
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl text-[#2e2a3a] font-light mb-3">
            The Answer Key
          </h2>
          <p className="text-sm text-[#6a6580] mb-10 leading-relaxed">
            Now upload the official answer key table image so we can compare.
          </p>

          {keyResult ? (
            <div className="bg-white rounded-2xl p-8 border border-[#d8d4e0] text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#6b5e8a]/10 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-[#6b5e8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg text-[#2e2a3a] font-light">
                {keyResult.answers.filter((a) => a !== 'EMPTY').length} answers
                extracted
              </p>
              <p className="text-xs text-[#9a8eb0] mt-1">
                Scroll down to see your results
              </p>
            </div>
          ) : (
            <FileDropZone
              onFile={uploadKey}
              disabled={busy || !omrResult}
              className={`bg-white rounded-2xl p-8 sm:p-14 border-2 border-dashed transition-all duration-300 ${
                !omrResult
                  ? 'border-[#e8e5f0] opacity-40'
                  : 'border-[#d8d4e0] hover:border-[#6b5e8a]/40 hover:shadow-lg'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#f0eef5] flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#9a8eb0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-[#6a6580] text-sm font-medium">
                  {!omrResult
                    ? 'Upload OMR sheet first'
                    : 'Drop answer key here'}
                </p>
                <p className="text-xs text-[#9a8eb0]">JPG, PNG, or PDF</p>
              </div>
            </FileDropZone>
          )}

          {step === 'key-uploading' && (
            <p className="mt-6 text-center text-sm text-[#6b5e8a] animate-pulse">
              Extracting correct answers…
            </p>
          )}
        </div>
      </Section>

      {/* ===== CHAPTER 4: Results ===== */}
      <Section className="bg-gradient-to-b from-[#f8f5f0] to-[#eee8de]" id="results">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#a09480] font-medium">
              Chapter Three
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl text-[#3a3530] font-light mb-8">
            The Verdict
          </h2>

          {evaluation ? (
            <div>
              {/* Score */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 text-center mb-6 shadow-sm">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}
                  className="text-5xl sm:text-7xl font-extralight text-[#3a3530]"
                >
                  {evaluation.evaluation.score}
                </motion.div>
                <div className="text-sm text-[#a09480] mt-2">
                  out of {evaluation.evaluation.total_questions}
                </div>
                <div className="h-2 bg-[#e8e3d8] rounded-full mt-6 max-w-xs mx-auto overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(evaluation.evaluation.score / evaluation.evaluation.total_questions) * 100}%`,
                    }}
                    transition={{ duration: 1.2, delay: 0.5 }}
                    className="h-full bg-[#6b7c5e] rounded-full"
                  />
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                {[
                  { label: 'Correct', val: evaluation.evaluation.stats.correct, c: '#6b7c5e' },
                  { label: 'Wrong', val: evaluation.evaluation.stats.wrong, c: '#c46b5e' },
                  { label: 'Blank', val: evaluation.evaluation.stats.not_marked, c: '#a09480' },
                  { label: 'No Key', val: evaluation.evaluation.stats.missing_key, c: '#b8a88a' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white rounded-xl p-3 text-center shadow-sm"
                  >
                    <div className="text-xl font-light" style={{ color: s.c }}>
                      {s.val}
                    </div>
                    <div className="text-[10px] text-[#a09480] mt-0.5">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Question Grid */}
              <div className="bg-white rounded-2xl p-4 shadow-sm max-h-80 overflow-y-auto scrollbar-thin">
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {evaluation.evaluation.results.map((r) => (
                    <div
                      key={r.question}
                      className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium ${
                        r.status === 'CORRECT'
                          ? 'bg-[#6b7c5e]/12 text-[#6b7c5e]'
                          : r.status === 'WRONG'
                            ? 'bg-[#c46b5e]/12 text-[#c46b5e]'
                            : 'bg-[#eee8de] text-[#b8a88a]'
                      }`}
                      title={`Q${r.question}: ${r.selected} → ${r.correct}`}
                    >
                      {r.question}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={reset}
                className="mt-6 w-full py-3 text-sm text-[#a09480] hover:text-[#8a8075] transition-colors"
              >
                Start a new evaluation
              </button>
            </div>
          ) : omrResult && keyResult ? (
            <div className="text-center">
              <button
                onClick={evaluate}
                disabled={busy}
                className="px-12 py-4 bg-[#3a3530] text-white rounded-2xl text-sm font-medium hover:bg-[#2a2520] transition-colors disabled:opacity-50"
              >
                {busy ? 'Evaluating…' : 'Reveal My Score'}
              </button>
            </div>
          ) : (
            <div className="text-center text-sm text-[#b8a88a]">
              <p>Complete the uploads above to see your results</p>
            </div>
          )}
        </div>
      </Section>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-[#c46b5e] text-white rounded-lg text-sm shadow-xl z-50"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
