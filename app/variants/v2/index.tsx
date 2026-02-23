/*
 * ═══════════════════════════════════════════════════════════
 * VARIANT 2: WORKSHOP BENCH — Spatial Tool Layout
 * ═══════════════════════════════════════════════════════════
 *
 * DESIGN THESIS:
 *   Treats scanning as craftsmanship. Materials go on the left,
 *   the processing bench is in the center, and finished output
 *   emerges on the right. Optimizes for spatial mental models —
 *   users always know where their data is and what stage it's in.
 *
 * PRIMARY USER STORY:
 *   User slots materials (uploads) into labeled bays → watches
 *   processing happen on the bench → collects results from the
 *   output tray. Everything is visible simultaneously.
 *
 * KEY LAYOUT DECISIONS:
 *   3-column horizontal flow (input → process → output).
 *   Fixed side panels with scrollable center.
 *   Dark warm palette — workbench aesthetic.
 *
 * INTERACTION STYLE:
 *   Direct manipulation, slot-and-go, no wizard steps.
 *
 * ACCESSIBILITY:
 *   Logical left-to-right tab order, labeled regions with
 *   aria-landmarks, sufficient contrast on dark background.
 */
'use client';

import { useAppState } from '../../context/AppStateContext';
import FileDropZone from '../../components/shared/FileDropZone';
import { motion } from 'framer-motion';

export default function V2Workshop() {
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

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-[#2c2825] text-[#e8dfd0] flex flex-col md:flex-row overflow-hidden">
      {/* ===== LEFT: Input Materials ===== */}
      <aside className="w-full md:w-72 md:min-w-72 border-b md:border-b-0 md:border-r border-[#3d3833] p-4 md:p-5 flex flex-col gap-4 md:gap-5 bg-[#28241f] shrink-0 overflow-y-auto" aria-label="Input materials">
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#7a6f62] font-medium">
          Materials
        </h3>

        {/* OMR Slot */}
        <div>
          <label className="text-[11px] text-[#9a8e7e] mb-2 block">
            Student OMR Sheet
          </label>
          {omrFile ? (
            <div className="border border-[#4a433a] bg-[#332f2a] rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#6b7c5e]/20 flex items-center justify-center text-[10px] text-[#a0b890] font-bold">
                  OMR
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate">{omrFile.name}</div>
                  <div className="text-[11px] text-[#7a6f62] mt-0.5">
                    {step === 'omr-uploading'
                      ? 'Processing…'
                      : `${omrResult?.answers.filter((a) => a !== 'EMPTY').length ?? 0} answers found`}
                  </div>
                </div>
                {omrResult && (
                  <div className="w-2 h-2 rounded-full bg-[#6b7c5e]" />
                )}
              </div>
            </div>
          ) : (
            <FileDropZone
              onFile={uploadOmr}
              disabled={busy}
              className="border border-dashed border-[#4a433a] rounded-lg p-8 bg-[#332f2a]/40 hover:border-[#9a8e7e] hover:bg-[#332f2a] transition-all"
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-5 h-5 text-[#7a6f62]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-[11px] text-[#7a6f62]">Drop OMR sheet</p>
              </div>
            </FileDropZone>
          )}
        </div>

        {/* Key Slot */}
        <div>
          <label className="text-[11px] text-[#9a8e7e] mb-2 block">
            Answer Key Image
          </label>
          {keyFile ? (
            <div className="border border-[#4a433a] bg-[#332f2a] rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#8a7c5e]/20 flex items-center justify-center text-[10px] text-[#c4b890] font-bold">
                  KEY
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate">{keyFile.name}</div>
                  <div className="text-[11px] text-[#7a6f62] mt-0.5">
                    {step === 'key-uploading'
                      ? 'Extracting…'
                      : `${keyResult?.answers.filter((a) => a !== 'EMPTY').length ?? 0} answers extracted`}
                  </div>
                </div>
                {keyResult && (
                  <div className="w-2 h-2 rounded-full bg-[#8a7c5e]" />
                )}
              </div>
            </div>
          ) : (
            <FileDropZone
              onFile={uploadKey}
              disabled={busy || !omrResult}
              className={`border border-dashed rounded-lg p-8 transition-all ${
                !omrResult
                  ? 'border-[#332f2a] bg-[#2c2825] opacity-30'
                  : 'border-[#4a433a] bg-[#332f2a]/40 hover:border-[#9a8e7e] hover:bg-[#332f2a]'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-5 h-5 text-[#7a6f62]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-[11px] text-[#7a6f62]">
                  {!omrResult ? 'Upload OMR first' : 'Drop answer key'}
                </p>
              </div>
            </FileDropZone>
          )}
        </div>

        {/* Action Bar */}
        <div className="mt-2 md:mt-auto space-y-2">
          {omrResult && keyResult && !evaluation && (
            <button
              onClick={evaluate}
              disabled={busy}
              className="w-full py-3 bg-[#a09480] text-[#2c2825] rounded-lg text-sm font-semibold hover:bg-[#b8a88a] transition-colors disabled:opacity-50"
            >
              {busy ? 'Evaluating…' : 'Run Evaluation'}
            </button>
          )}
          {evaluation && (
            <button
              onClick={reset}
              className="w-full py-3 border border-[#4a433a] text-[#9a8e7e] rounded-lg text-sm hover:bg-[#332f2a] transition-colors"
            >
              New Evaluation
            </button>
          )}
        </div>
      </aside>

      {/* ===== CENTER: Processing Bench ===== */}
      <section className="flex-1 flex flex-col min-w-0 min-h-0" aria-label="Processing bench">
        <header className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#3d3833] flex items-center justify-between">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#7a6f62] font-medium">
            Processing Bench
          </h3>
          {busy && (
            <div className="flex items-center gap-2 text-[11px] text-[#9a8e7e]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-3 h-3 border border-[#7a6f62] border-t-[#a09480] rounded-full"
              />
              Processing
            </div>
          )}
        </header>

        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          {step === 'idle' && !evaluation && (
            <div className="text-center">
              <p className="text-[#4a433a] text-lg mb-2">←</p>
              <p className="text-[#5a5248] text-sm">
                Slot your materials to start
              </p>
            </div>
          )}

          {(step === 'omr-done' || step === 'key-done') &&
            !busy &&
            !evaluation && (
              <div className="text-center">
                <div className="flex gap-4 items-center mb-8">
                  {omrResult && (
                    <div className="px-4 py-3 bg-[#332f2a] border border-[#4a433a] rounded-lg">
                      <div className="text-2xl font-light text-[#a0b890]">
                        {omrResult.answers.filter((a) => a !== 'EMPTY').length}
                      </div>
                      <div className="text-[10px] text-[#7a6f62] mt-1">
                        OMR answers
                      </div>
                    </div>
                  )}
                  {omrResult && keyResult && (
                    <svg className="w-5 h-5 text-[#4a433a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  )}
                  {keyResult && (
                    <div className="px-4 py-3 bg-[#332f2a] border border-[#4a433a] rounded-lg">
                      <div className="text-2xl font-light text-[#c4b890]">
                        {keyResult.answers.filter((a) => a !== 'EMPTY').length}
                      </div>
                      <div className="text-[10px] text-[#7a6f62] mt-1">
                        Key answers
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-[#7a6f62]">
                  {keyResult
                    ? 'Hit "Run Evaluation" on the left'
                    : 'Upload answer key to continue'}
                </p>
              </div>
            )}

          {evaluation && (
            <div className="w-full max-w-lg px-2">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center mb-6 sm:mb-10"
              >
                <div className="text-5xl sm:text-8xl font-extralight text-[#e8dfd0] leading-none">
                  {evaluation.evaluation.score}
                </div>
                <div className="text-lg text-[#5a5248] mt-2">
                  / {evaluation.evaluation.total_questions}
                </div>
              </motion.div>

              <div className="space-y-3">
                {[
                  { label: 'Correct', val: evaluation.evaluation.stats.correct, color: '#6b7c5e' },
                  { label: 'Wrong', val: evaluation.evaluation.stats.wrong, color: '#c46b5e' },
                  { label: 'Not Marked', val: evaluation.evaluation.stats.not_marked, color: '#a09480' },
                  { label: 'No Key', val: evaluation.evaluation.stats.missing_key, color: '#4a433a' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="text-[11px] text-[#7a6f62] w-20 text-right">
                      {s.label}
                    </span>
                    <div className="flex-1 h-7 bg-[#332f2a] rounded-md overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(s.val / evaluation.evaluation.total_questions) * 100}%`,
                        }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full rounded-md"
                        style={{ backgroundColor: s.color }}
                      />
                    </div>
                    <span className="text-xs text-[#9a8e7e] w-8 tabular-nums">
                      {s.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== RIGHT: Output Tray ===== */}
      {evaluation && (
        <aside className="w-full md:w-72 md:min-w-72 border-t md:border-t-0 md:border-l border-[#3d3833] flex flex-col bg-[#28241f] max-h-[40vh] md:max-h-none" aria-label="Results detail">
          <header className="px-5 py-4 border-b border-[#3d3833]">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#7a6f62] font-medium">
              Question Detail
            </h3>
          </header>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
            <div className="space-y-0.5">
              {evaluation.evaluation.results.map((r) => (
                <div
                  key={r.question}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] ${
                    r.status === 'CORRECT'
                      ? 'bg-[#6b7c5e]/10 text-[#a0b890]'
                      : r.status === 'WRONG'
                        ? 'bg-[#c46b5e]/10 text-[#d89080]'
                        : 'bg-[#332f2a] text-[#5a5248]'
                  }`}
                >
                  <span className="w-7 text-right text-[#7a6f62] tabular-nums">
                    {r.question}.
                  </span>
                  <span className="w-5 text-center font-semibold">
                    {r.selected}
                  </span>
                  <span className="text-[#4a433a]">→</span>
                  <span className="w-5 text-center">{r.correct}</span>
                  <span className="ml-auto text-[9px] uppercase tracking-wider opacity-60">
                    {r.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* Error Toast */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-[#c46b5e] text-white rounded-lg text-sm shadow-2xl z-50"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
