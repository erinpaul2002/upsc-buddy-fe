/*
 * ═══════════════════════════════════════════════════════════
 * VARIANT 6: ORIGAMI — Expanding Card System
 * ═══════════════════════════════════════════════════════════
 *
 * DESIGN THESIS:
 *   Information unfolds progressively. The interface starts as
 *   a single compact card and physically expands as the user
 *   completes each step. Optimizes for delight and spatial
 *   memory — each new card appears adjacent to the last.
 *
 * PRIMARY USER STORY:
 *   User sees one card (upload OMR) → completes it → a second
 *   card unfolds beside it → upload key → a third card appears
 *   below → evaluate → the final card expands to fill the space
 *   with results.
 *
 * KEY LAYOUT DECISIONS:
 *   Cards arranged in a dynamic masonry-like layout that grows.
 *   Each card is a self-contained unit with clear boundaries.
 *   Background is warm neutral, cards are white with colored
 *   top borders designating their role.
 *
 * INTERACTION STYLE:
 *   Click-to-unfold. Cards animate in from zero height/width.
 *   Spatial expansion creates a sense of building something.
 *
 * ACCESSIBILITY:
 *   Focus management moves to newly appeared cards.
 *   Each card has a heading and aria-label.
 */
'use client';

import { useEffect, useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import FileDropZone from '../../components/shared/FileDropZone';
import { motion, AnimatePresence } from 'framer-motion';

const cardSpring = {
  initial: { opacity: 0, scale: 0.92, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { type: 'spring' as const, stiffness: 200, damping: 25 },
};

export default function V6Origami() {
  const {
    step,
    uploadOmr,
    uploadKey,
    evaluate,
    evaluation,
    error,
    reset,
    omrFile,
    keyFile,
    omrResult,
    keyResult,
  } = useAppState();

  const busy = ['omr-uploading', 'key-uploading', 'evaluating'].includes(step);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-focus new cards
  useEffect(() => {
    if (evaluation && resultsRef.current) {
      resultsRef.current.focus();
    }
  }, [evaluation]);

  const showOmr = true;
  const showKey = !!omrResult || !!keyFile;
  const showEval = !!keyResult;
  const showResults = !!evaluation;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#ebe7df] p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Top row: OMR + Key side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Card 1: OMR Upload */}
          <AnimatePresence>
            {showOmr && (
              <motion.div {...cardSpring} layout>
                <div
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#ddd7ca]"
                  aria-label="Upload OMR sheet"
                >
                  <div className="h-1 bg-[#6b7c5e]" />
                  <div className="p-6">
                    <h3 className="text-xs uppercase tracking-[0.15em] text-[#6b7c5e] font-semibold mb-1">
                      Step 1
                    </h3>
                    <h2 className="text-lg text-[#3a3530] font-medium mb-4">
                      Student Answer Sheet
                    </h2>

                    {omrFile ? (
                      <div className="flex items-center gap-3 p-4 bg-[#6b7c5e]/5 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-[#6b7c5e]/15 flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#6b7c5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-[#3a3530] font-medium truncate max-w-[180px]">
                            {omrFile.name}
                          </p>
                          <p className="text-xs text-[#6b7c5e]">
                            {step === 'omr-uploading'
                              ? 'Processing…'
                              : `${omrResult?.answers.filter((a) => a !== 'EMPTY').length ?? 0} answers detected`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <FileDropZone
                        onFile={uploadOmr}
                        disabled={busy}
                        className="border-2 border-dashed border-[#ddd7ca] rounded-xl p-10 hover:border-[#6b7c5e]/40 hover:bg-[#faf8f4] transition-all"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <svg className="w-8 h-8 text-[#b8a88a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm text-[#8a8075]">
                            Drop OMR sheet here
                          </p>
                        </div>
                      </FileDropZone>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card 2: Answer Key */}
          <AnimatePresence>
            {showKey && (
              <motion.div {...cardSpring} layout>
                <div
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#d8d4e0]"
                  aria-label="Upload answer key"
                >
                  <div className="h-1 bg-[#6b5e8a]" />
                  <div className="p-6">
                    <h3 className="text-xs uppercase tracking-[0.15em] text-[#6b5e8a] font-semibold mb-1">
                      Step 2
                    </h3>
                    <h2 className="text-lg text-[#2e2a3a] font-medium mb-4">
                      Answer Key
                    </h2>

                    {keyFile ? (
                      <div className="flex items-center gap-3 p-4 bg-[#6b5e8a]/5 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-[#6b5e8a]/15 flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#6b5e8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-[#2e2a3a] font-medium truncate max-w-[180px]">
                            {keyFile.name}
                          </p>
                          <p className="text-xs text-[#6b5e8a]">
                            {step === 'key-uploading'
                              ? 'Extracting…'
                              : `${keyResult?.answers.filter((a) => a !== 'EMPTY').length ?? 0} answers extracted`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <FileDropZone
                        onFile={uploadKey}
                        disabled={busy || !omrResult}
                        className={`border-2 border-dashed rounded-xl p-10 transition-all ${
                          !omrResult
                            ? 'border-[#e8e5f0] opacity-40'
                            : 'border-[#d8d4e0] hover:border-[#6b5e8a]/40 hover:bg-[#f8f6fc]'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <svg className="w-8 h-8 text-[#9a8eb0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="text-sm text-[#6a6580]">
                            {!omrResult ? 'Complete step 1 first' : 'Drop answer key here'}
                          </p>
                        </div>
                      </FileDropZone>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Compare Card */}
        <AnimatePresence>
          {showEval && !showResults && (
            <motion.div {...cardSpring} layout className="mb-4">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#d6dbe3]">
                <div className="h-1 bg-[#3b6b8a]" />
                <div className="p-6 text-center">
                  <h3 className="text-xs uppercase tracking-[0.15em] text-[#3b6b8a] font-semibold mb-1">
                    Step 3
                  </h3>
                  <h2 className="text-lg text-[#2a3545] font-medium mb-4">
                    Compare & Evaluate
                  </h2>
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-light text-[#6b7c5e]">
                        {omrResult?.answers.filter((a) => a !== 'EMPTY').length}
                      </div>
                      <div className="text-[10px] text-[#8a8075]">student</div>
                    </div>
                    <div className="text-2xl text-[#d6dbe3]">⇄</div>
                    <div className="text-center">
                      <div className="text-2xl font-light text-[#6b5e8a]">
                        {keyResult?.answers.filter((a) => a !== 'EMPTY').length}
                      </div>
                      <div className="text-[10px] text-[#6a6580]">key</div>
                    </div>
                  </div>
                  <button
                    onClick={evaluate}
                    disabled={busy}
                    className="px-10 py-3 bg-[#3b6b8a] text-white rounded-xl text-sm font-medium hover:bg-[#2d5a78] transition-colors disabled:opacity-50"
                  >
                    {busy ? 'Evaluating…' : 'Run Comparison'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Card — expands to fill */}
        <AnimatePresence>
          {showResults && evaluation && (
            <motion.div
              ref={resultsRef}
              tabIndex={-1}
              {...cardSpring}
              layout
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-[#ddd7ca]">
                <div className="h-1.5 bg-gradient-to-r from-[#6b7c5e] via-[#3b6b8a] to-[#6b5e8a]" />
                <div className="p-8">
                  <h2 className="text-lg sm:text-xl text-[#3a3530] font-medium mb-6 sm:mb-8 text-center">
                    Evaluation Results
                  </h2>

                  {/* Score */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="text-4xl sm:text-6xl font-extralight text-[#3a3530]"
                    >
                      {evaluation.evaluation.score}
                      <span className="text-lg text-[#b8a88a] ml-1">
                        / {evaluation.evaluation.total_questions}
                      </span>
                    </motion.div>
                    <div className="h-2 bg-[#ebe7df] rounded-full mt-4 max-w-sm mx-auto overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(evaluation.evaluation.score / evaluation.evaluation.total_questions) * 100}%`,
                        }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="h-full bg-gradient-to-r from-[#6b7c5e] to-[#3b6b8a] rounded-full"
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    {[
                      { label: 'Correct', val: evaluation.evaluation.stats.correct, c: '#6b7c5e', bg: '#6b7c5e' },
                      { label: 'Wrong', val: evaluation.evaluation.stats.wrong, c: '#c46b5e', bg: '#c46b5e' },
                      { label: 'Blank', val: evaluation.evaluation.stats.not_marked, c: '#a09480', bg: '#a09480' },
                      { label: 'No Key', val: evaluation.evaluation.stats.missing_key, c: '#b8a88a', bg: '#b8a88a' },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="text-center p-4 rounded-xl"
                        style={{
                          backgroundColor: `${s.bg}10`,
                        }}
                      >
                        <div
                          className="text-2xl font-light"
                          style={{ color: s.c }}
                        >
                          {s.val}
                        </div>
                        <div className="text-[10px] text-[#8a8075] mt-1">
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Grid */}
                  <div className="max-h-72 overflow-y-auto scrollbar-thin bg-[#faf8f4] rounded-xl p-4">
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                      {evaluation.evaluation.results.map((r) => (
                        <div
                          key={r.question}
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[9px] ${
                            r.status === 'CORRECT'
                              ? 'bg-[#6b7c5e]/15 text-[#6b7c5e]'
                              : r.status === 'WRONG'
                                ? 'bg-[#c46b5e]/15 text-[#c46b5e]'
                                : 'bg-[#ebe7df] text-[#b8a88a]'
                          }`}
                          title={`Q${r.question}: ${r.selected} → ${r.correct}`}
                        >
                          <span className="font-semibold">{r.question}</span>
                          <span className="opacity-60">{r.selected}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={reset}
                    className="mt-6 w-full py-3 text-sm text-[#a09480] hover:text-[#8a8075] transition-colors"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
