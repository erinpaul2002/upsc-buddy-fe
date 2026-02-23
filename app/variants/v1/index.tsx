/*
 * ═══════════════════════════════════════════════════════════
 * VARIANT 1: ZEN GARDEN — Calm Sequential Flow
 * ═══════════════════════════════════════════════════════════
 *
 * DESIGN THESIS:
 *   Reduces test anxiety through meditative pacing. Shows one
 *   action at a time with generous breathing room. Optimizes
 *   for emotional safety — never overwhelms, never rushes.
 *
 * PRIMARY USER STORY:
 *   User enters a calm space → uploads OMR at their own pace →
 *   uploads answer key → confirms evaluation → absorbs results
 *   quietly. Each step feels like turning a page, not clicking a button.
 *
 * KEY LAYOUT DECISIONS:
 *   Single centered column (max 480px) — reduces decision paralysis.
 *   Step progress shown as subtle dots, not numbered bars.
 *   Content transitions vertically with soft easing.
 *
 * INTERACTION STYLE:
 *   Step-based, one action per screen, gentle auto-advance.
 *
 * ACCESSIBILITY:
 *   Large drop zones (minimum 200px tall), high contrast text on
 *   warm cream background, clear focus rings, descriptive labels.
 */
'use client';

import { useAppState, type AppStep } from '../../context/AppStateContext';
import FileDropZone from '../../components/shared/FileDropZone';
import { motion, AnimatePresence } from 'framer-motion';

const steps = ['Student Sheet', 'Answer Key', 'Evaluate', 'Results'];

function getActiveStep(step: AppStep): number {
  if (step === 'idle' || step === 'omr-uploading') return 0;
  if (step === 'omr-done' || step === 'key-uploading') return 1;
  if (step === 'key-done' || step === 'evaluating') return 2;
  return 3;
}

const fade = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

export default function V1ZenGarden() {
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

  const active = getActiveStep(step);
  const busy = ['omr-uploading', 'key-uploading', 'evaluating'].includes(step);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#f5f0e8] flex flex-col items-center px-4 py-8 sm:py-16">
      {/* Step dots */}
      <div className="flex items-center gap-2 sm:gap-3 mb-10 sm:mb-20" role="navigation" aria-label="Progress">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2 sm:gap-3">
            <div
              aria-current={i === active ? 'step' : undefined}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-500 ${
                i < active
                  ? 'bg-[#6b7c5e] text-white'
                  : i === active
                    ? 'bg-[#6b7c5e]/15 text-[#6b7c5e] ring-2 ring-[#6b7c5e]/50'
                    : 'bg-[#ddd7ca] text-[#a9a295]'
              }`}
              title={label}
            >
              {i < active ? (
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-6 sm:w-10 h-0.5 rounded-full transition-all duration-500 ${
                  i < active ? 'bg-[#6b7c5e]' : 'bg-[#ddd7ca]'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* STEP 0: Upload OMR */}
          {active === 0 && (
            <motion.div key="omr" {...fade}>
              <h2 className="text-2xl text-[#3d3a33] text-center mb-2 font-light tracking-tight">
                Upload Student Sheet
              </h2>
              <p className="text-sm text-[#8a8478] text-center mb-10 leading-relaxed">
                A photograph or scan of the filled OMR bubble sheet
              </p>
              <FileDropZone
                onFile={uploadOmr}
                disabled={busy}
                className="border-2 border-dashed border-[#c4bfb2] rounded-2xl p-8 sm:p-14 bg-white/50 hover:bg-white/75 hover:border-[#6b7c5e]/60 transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#6b7c5e]/8 flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#6b7c5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-[#6b7c5e] font-medium text-sm">
                    Drop your OMR sheet here
                  </p>
                  <p className="text-xs text-[#a09a8e]">
                    Supports JPG, PNG, or PDF
                  </p>
                </div>
              </FileDropZone>
              {busy && (
                <p className="mt-8 text-center text-sm text-[#6b7c5e] animate-pulse">
                  Reading your answer sheet…
                </p>
              )}
            </motion.div>
          )}

          {/* STEP 1: Upload Answer Key */}
          {active === 1 && (
            <motion.div key="key" {...fade}>
              <h2 className="text-2xl text-[#3d3a33] text-center mb-2 font-light tracking-tight">
                Upload Answer Key
              </h2>
              <p className="text-sm text-[#8a8478] text-center mb-2 leading-relaxed">
                Image of the official answer table
              </p>
              {omrResult && (
                <p className="text-xs text-[#6b7c5e] text-center mb-10">
                  {omrResult.answers.filter((a) => a !== 'EMPTY').length} student
                  answers detected
                </p>
              )}
              <FileDropZone
                onFile={uploadKey}
                disabled={busy}
                className="border-2 border-dashed border-[#c4bfb2] rounded-2xl p-8 sm:p-14 bg-white/50 hover:bg-white/75 hover:border-[#6b7c5e]/60 transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#6b7c5e]/8 flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#6b7c5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <p className="text-[#6b7c5e] font-medium text-sm">
                    Drop answer key here
                  </p>
                  <p className="text-xs text-[#a09a8e]">
                    Supports JPG, PNG, or PDF
                  </p>
                </div>
              </FileDropZone>
              {busy && (
                <p className="mt-8 text-center text-sm text-[#6b7c5e] animate-pulse">
                  Extracting correct answers…
                </p>
              )}
            </motion.div>
          )}

          {/* STEP 2: Confirm Evaluation */}
          {active === 2 && (
            <motion.div key="eval" {...fade} className="text-center">
              <h2 className="text-2xl text-[#3d3a33] mb-2 font-light tracking-tight">
                Ready to Evaluate
              </h2>
              <p className="text-sm text-[#8a8478] mb-12 leading-relaxed">
                Both documents have been processed
              </p>
              <div className="flex justify-center gap-8 sm:gap-12 mb-10 sm:mb-14">
                <div>
                  <div className="text-4xl font-extralight text-[#6b7c5e]">
                    {omrResult?.answers.filter((a) => a !== 'EMPTY').length}
                  </div>
                  <div className="text-xs text-[#a09a8e] mt-2">
                    Student answers
                  </div>
                </div>
                <div className="w-px bg-[#ddd7ca]" />
                <div>
                  <div className="text-4xl font-extralight text-[#6b7c5e]">
                    {keyResult?.answers.filter((a) => a !== 'EMPTY').length}
                  </div>
                  <div className="text-xs text-[#a09a8e] mt-2">Key answers</div>
                </div>
              </div>
              <button
                onClick={evaluate}
                disabled={busy}
                className="px-12 py-3.5 bg-[#6b7c5e] text-white rounded-full text-sm font-medium hover:bg-[#5a6b4f] focus-visible:ring-2 focus-visible:ring-[#6b7c5e] focus-visible:ring-offset-2 transition-colors disabled:opacity-50"
              >
                {busy ? 'Evaluating…' : 'Compare & Score'}
              </button>
            </motion.div>
          )}

          {/* STEP 3: Results */}
          {active === 3 && evaluation && (
            <motion.div key="results" {...fade}>
              <h2 className="text-2xl text-[#3d3a33] text-center mb-10 font-light tracking-tight">
                Your Results
              </h2>

              {/* Big Score */}
              <div className="bg-white/60 rounded-3xl p-6 sm:p-10 mb-6 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
                  className="text-5xl sm:text-7xl font-extralight text-[#3d3a33]"
                >
                  {evaluation.evaluation.score}
                </motion.div>
                <div className="text-sm text-[#a09a8e] mt-2">
                  out of {evaluation.evaluation.total_questions}
                </div>
                <div className="h-2 bg-[#e8e3d8] rounded-full mt-8 overflow-hidden">
                  <motion.div
                    className="h-full bg-[#6b7c5e] rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(evaluation.evaluation.score / evaluation.evaluation.total_questions) * 100}%`,
                    }}
                    transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Correct', val: evaluation.evaluation.stats.correct, c: '#6b7c5e' },
                  { label: 'Wrong', val: evaluation.evaluation.stats.wrong, c: '#c46b5e' },
                  { label: 'Not Marked', val: evaluation.evaluation.stats.not_marked, c: '#b8a88a' },
                  { label: 'Missing Key', val: evaluation.evaluation.stats.missing_key, c: '#9c9688' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white/60 rounded-2xl p-5 text-center"
                  >
                    <div
                      className="text-3xl font-extralight"
                      style={{ color: s.c }}
                    >
                      {s.val}
                    </div>
                    <div className="text-xs text-[#a09a8e] mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Per-question Grid */}
              <div className="bg-white/60 rounded-3xl p-5 max-h-[420px] overflow-y-auto scrollbar-thin">
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {evaluation.evaluation.results.map((r) => (
                    <div
                      key={r.question}
                      className={`text-center py-2.5 rounded-xl text-xs transition-colors ${
                        r.status === 'CORRECT'
                          ? 'bg-[#6b7c5e]/10 text-[#6b7c5e]'
                          : r.status === 'WRONG'
                            ? 'bg-[#c46b5e]/10 text-[#c46b5e]'
                            : 'bg-[#ddd7ca]/40 text-[#9c9688]'
                      }`}
                      title={`Q${r.question}: You answered ${r.selected}, correct is ${r.correct}`}
                    >
                      <div className="font-medium">{r.question}</div>
                      <div className="opacity-70">{r.selected}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={reset}
                className="mt-8 w-full py-3 text-sm text-[#6b7c5e] hover:text-[#5a6b4f] transition-colors"
              >
                Start Over
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-[#c46b5e]/10 text-[#c46b5e] rounded-2xl text-sm text-center"
          >
            {error}
          </motion.div>
        )}
      </div>
    </div>
  );
}
