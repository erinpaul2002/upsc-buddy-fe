/*
 * ═══════════════════════════════════════════════════════════
 * VARIANT 4: BLUEPRINT — Data-Dense Precision Grid
 * ═══════════════════════════════════════════════════════════
 *
 * DESIGN THESIS:
 *   For power users who want maximum information density.
 *   Every panel is always visible — no hidden tabs, no wizards,
 *   no progressive disclosure. Optimizes for overview and control.
 *
 * PRIMARY USER STORY:
 *   User sees all four zones simultaneously → uploads OMR into
 *   top-left → uploads key into top-right → stats auto-populate
 *   bottom-left → detail grid fills bottom-right. All at once.
 *
 * KEY LAYOUT DECISIONS:
 *   2×2 grid occupying full viewport. Each panel has a header
 *   and its own scroll context. Compact type, dense spacing.
 *   Cool blue-gray palette — technical/architectural feeling.
 *
 * INTERACTION STYLE:
 *   Direct manipulation within panels. No navigation.
 *   Everything responds immediately.
 *
 * ACCESSIBILITY:
 *   Panel regions with aria-labels. Logical tab order flows
 *   top-left → top-right → bottom-left → bottom-right.
 */
'use client';

import { useAppState } from '../../context/AppStateContext';
import FileDropZone from '../../components/shared/FileDropZone';
import { motion } from 'framer-motion';

export default function V4Blueprint() {
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

  const PanelHeader = ({
    title,
    status,
  }: {
    title: string;
    status?: string;
  }) => (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#d6dbe3] bg-[#edf0f5]">
      <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#6a7385] font-semibold">
        {title}
      </h3>
      {status && (
        <span className="text-[10px] text-[#8a93a5] bg-[#d6dbe3] px-2 py-0.5 rounded">
          {status}
        </span>
      )}
    </div>
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-[#e8ecf2] p-2 grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto sm:overflow-hidden sm:grid-rows-2">
      {/* ===== TOP-LEFT: OMR Input ===== */}
      <section
        className="bg-white rounded-lg border border-[#d6dbe3] flex flex-col overflow-hidden min-h-[200px] sm:min-h-0"
        aria-label="OMR upload"
      >
        <PanelHeader
          title="Student OMR Sheet"
          status={
            omrResult
              ? `${omrResult.answers.filter((a) => a !== 'EMPTY').length} detected`
              : step === 'omr-uploading'
                ? 'Processing…'
                : undefined
          }
        />
        <div className="flex-1 p-4 flex items-center justify-center">
          {omrFile ? (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-lg bg-[#3b6b8a]/10 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[#3b6b8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-[#3a4355] font-medium truncate max-w-[200px] mx-auto">
                {omrFile.name}
              </p>
              {omrResult && (
                <div className="mt-3 grid grid-cols-4 gap-1 max-w-[200px] mx-auto">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div key={opt} className="text-center py-1 bg-[#edf0f5] rounded text-[10px]">
                      <div className="font-semibold text-[#3a4355]">
                        {omrResult.answers.filter((a) => a === opt).length}
                      </div>
                      <div className="text-[#8a93a5]">{opt}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <FileDropZone
              onFile={uploadOmr}
              disabled={busy}
              className="w-full h-full border-2 border-dashed border-[#d6dbe3] rounded-lg flex items-center justify-center hover:border-[#3b6b8a]/40 hover:bg-[#f5f7fc] transition-all"
            >
              <div className="text-center">
                <svg className="w-8 h-8 text-[#b0b8c8] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-xs text-[#8a93a5]">Upload OMR Sheet</p>
              </div>
            </FileDropZone>
          )}
        </div>
      </section>

      {/* ===== TOP-RIGHT: Answer Key Input ===== */}
      <section
        className="bg-white rounded-lg border border-[#d6dbe3] flex flex-col overflow-hidden min-h-[200px] sm:min-h-0"
        aria-label="Answer key upload"
      >
        <PanelHeader
          title="Answer Key"
          status={
            keyResult
              ? `${keyResult.answers.filter((a) => a !== 'EMPTY').length} extracted`
              : step === 'key-uploading'
                ? 'Extracting…'
                : undefined
          }
        />
        <div className="flex-1 p-4 flex items-center justify-center">
          {keyFile ? (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-lg bg-[#6b5e8a]/10 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[#6b5e8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-[#3a4355] font-medium truncate max-w-[200px] mx-auto">
                {keyFile.name}
              </p>
              {keyResult && (
                <div className="mt-3 grid grid-cols-4 gap-1 max-w-[200px] mx-auto">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <div key={opt} className="text-center py-1 bg-[#edf0f5] rounded text-[10px]">
                      <div className="font-semibold text-[#3a4355]">
                        {keyResult.answers.filter((a) => a === opt).length}
                      </div>
                      <div className="text-[#8a93a5]">{opt}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <FileDropZone
              onFile={uploadKey}
              disabled={busy || !omrResult}
              className={`w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center transition-all ${
                !omrResult
                  ? 'border-[#edf0f5] bg-[#fafbfd] opacity-40'
                  : 'border-[#d6dbe3] hover:border-[#6b5e8a]/40 hover:bg-[#f8f6fc]'
              }`}
            >
              <div className="text-center">
                <svg className="w-8 h-8 text-[#b0b8c8] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <p className="text-xs text-[#8a93a5]">
                  {!omrResult ? 'Upload OMR first' : 'Upload Answer Key'}
                </p>
              </div>
            </FileDropZone>
          )}
        </div>
      </section>

      {/* ===== BOTTOM-LEFT: Statistics ===== */}
      <section
        className="bg-white rounded-lg border border-[#d6dbe3] flex flex-col overflow-hidden min-h-[200px] sm:min-h-0"
        aria-label="Statistics"
      >
        <PanelHeader title="Statistics" />
        <div className="flex-1 p-4 flex items-center justify-center">
          {evaluation ? (
            <div className="w-full">
              {/* Score header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-light text-[#3a4355] tabular-nums"
                >
                  {evaluation.evaluation.score}
                  <span className="text-lg text-[#8a93a5] font-normal">
                    /{evaluation.evaluation.total_questions}
                  </span>
                </motion.div>
                <div className="text-xs text-[#8a93a5] mt-1">
                  {Math.round(
                    (evaluation.evaluation.score /
                      evaluation.evaluation.total_questions) *
                      100,
                  )}
                  % accuracy
                </div>
              </div>

              {/* Stat rows */}
              <div className="space-y-2">
                {[
                  { label: 'Correct', val: evaluation.evaluation.stats.correct, color: '#4a8a5e' },
                  { label: 'Wrong', val: evaluation.evaluation.stats.wrong, color: '#c4555e' },
                  { label: 'Unanswered', val: evaluation.evaluation.stats.not_marked, color: '#8a93a5' },
                  { label: 'Missing Key', val: evaluation.evaluation.stats.missing_key, color: '#b0b8c8' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-[#6a7385] w-20">{s.label}</span>
                    <div className="flex-1 h-4 bg-[#edf0f5] rounded overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(s.val / evaluation.evaluation.total_questions) * 100}%`,
                        }}
                        transition={{ duration: 0.6 }}
                        className="h-full rounded"
                        style={{ backgroundColor: s.color }}
                      />
                    </div>
                    <span className="text-[#3a4355] font-semibold tabular-nums w-6 text-right">
                      {s.val}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={reset}
                className="mt-4 w-full py-2 text-xs text-[#6a7385] hover:bg-[#edf0f5] rounded transition-colors"
              >
                Reset All
              </button>
            </div>
          ) : omrResult && keyResult ? (
            <div className="text-center">
              <button
                onClick={evaluate}
                disabled={busy}
                className="px-8 py-3 bg-[#3b6b8a] text-white rounded-lg text-sm font-medium hover:bg-[#2d5a78] transition-colors disabled:opacity-50"
              >
                {busy ? 'Evaluating…' : 'Evaluate Now'}
              </button>
              <p className="text-[10px] text-[#8a93a5] mt-2">
                Both documents ready
              </p>
            </div>
          ) : (
            <div className="text-center text-xs text-[#b0b8c8]">
              <p>Upload both documents</p>
              <p className="text-[10px] mt-1">to see statistics</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== BOTTOM-RIGHT: Question Detail ===== */}
      <section
        className="bg-white rounded-lg border border-[#d6dbe3] flex flex-col overflow-hidden min-h-[250px] sm:min-h-0"
        aria-label="Question detail"
      >
        <PanelHeader
          title="Question Detail"
          status={
            evaluation
              ? `${evaluation.evaluation.total_questions} questions`
              : undefined
          }
        />
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {evaluation ? (
            <table className="w-full text-[11px]">
              <thead className="sticky top-0 bg-white">
                <tr className="text-[#8a93a5] text-left">
                  <th className="py-1.5 px-2 font-medium">#</th>
                  <th className="py-1.5 px-2 font-medium">Yours</th>
                  <th className="py-1.5 px-2 font-medium">Key</th>
                  <th className="py-1.5 px-2 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {evaluation.evaluation.results.map((r) => (
                  <tr
                    key={r.question}
                    className={`border-t border-[#edf0f5] ${
                      r.status === 'CORRECT'
                        ? 'bg-[#4a8a5e]/5'
                        : r.status === 'WRONG'
                          ? 'bg-[#c4555e]/5'
                          : ''
                    }`}
                  >
                    <td className="py-1 px-2 text-[#6a7385] tabular-nums">
                      {r.question}
                    </td>
                    <td className="py-1 px-2 font-semibold text-[#3a4355]">
                      {r.selected}
                    </td>
                    <td className="py-1 px-2 text-[#6a7385]">{r.correct}</td>
                    <td className="py-1 px-2 text-right">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-medium ${
                          r.status === 'CORRECT'
                            ? 'bg-[#4a8a5e]/15 text-[#4a8a5e]'
                            : r.status === 'WRONG'
                              ? 'bg-[#c4555e]/15 text-[#c4555e]'
                              : 'bg-[#edf0f5] text-[#8a93a5]'
                        }`}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[#b0b8c8]">
              <p>Results will appear here</p>
            </div>
          )}
        </div>
      </section>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#c4555e] text-white rounded-lg text-xs shadow-lg z-50"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
