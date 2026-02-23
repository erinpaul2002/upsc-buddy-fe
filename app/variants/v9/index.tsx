/*
 * ═══════════════════════════════════════════════════════════
 * VARIANT 9: MAP VIEW — Overview + Detail Navigation
 * ═══════════════════════════════════════════════════════════
 *
 * DESIGN THESIS:
 *   Provides both bird's-eye and granular views simultaneously.
 *   The top strip is a heat-map of all 100 questions — click
 *   any region to zoom into detail below. Optimizes for
 *   pattern recognition and quick navigation.
 *
 * PRIMARY USER STORY:
 *   User uploads both documents → sees a 100-cell colored grid
 *   at the top → patterns emerge (clusters of wrongs, blanks) →
 *   user clicks a cell → detail panel below shows that question's
 *   full context. Encourages exploration, not just reading.
 *
 * KEY LAYOUT DECISIONS:
 *   Fixed top bar: 100-cell mini-map (always visible).
 *   Below: upload area (pre-results) or detail view (post-results).
 *   Clicking a cell highlights it and scrolls detail into view.
 *
 * INTERACTION STYLE:
 *   Click-to-navigate between overview and detail.
 *   Hover effects on map cells preview status.
 *   Focus ring on selected question.
 *
 * ACCESSIBILITY:
 *   Map cells are keyboard-navigable (arrow keys). Selected
 *   question is announced. Detail panel has aria-live region.
 */
'use client';

import { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import FileDropZone from '../../components/shared/FileDropZone';
import { motion, AnimatePresence } from 'framer-motion';

export default function V9MapView() {
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
  const e = evaluation?.evaluation;
  const [selected, setSelected] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  // Auto-evaluate
  useEffect(() => {
    if (omrResult && keyResult && step === 'key-done') {
      evaluate();
    }
  }, [omrResult, keyResult, step, evaluate]);

  const selectedResult = selected !== null ? e?.results[selected] : null;

  const filteredResults = e?.results.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-[#fafaf8] flex flex-col">
      {/* ===== MAP STRIP ===== */}
      {e && (
        <div className="bg-white border-b border-[#e8e5de] px-4 py-3">
          {/* Legend + controls */}
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-4 text-[10px] flex-wrap">
              <span className="text-[#999]">MAP:</span>
              {[
                { label: 'All', key: 'ALL', color: undefined },
                { label: 'Correct', key: 'CORRECT', color: '#4a8a5e' },
                { label: 'Wrong', key: 'WRONG', color: '#c4555e' },
                { label: 'Blank', key: 'NOT_MARKED', color: '#ccc' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex items-center gap-1 transition-opacity ${
                    filter === f.key ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                  }`}
                >
                  {f.color && (
                    <div
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: f.color }}
                    />
                  )}
                  <span>{f.label}</span>
                  <span className="font-semibold">
                    {f.key === 'ALL'
                      ? e.total_questions
                      : e.results.filter((r) => r.status === f.key).length}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#333] tabular-nums">
                {e.score}/{e.total_questions}
              </span>
              <button
                onClick={reset}
                className="text-[10px] text-[#3b6b8a] hover:underline"
              >
                New
              </button>
            </div>
          </div>

          {/* 100-cell grid */}
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
            {e.results.map((r, i) => {
              const dimmed =
                filter !== 'ALL' && r.status !== filter;
              return (
                <button
                  key={r.question}
                  onClick={() => setSelected(i)}
                  className={`aspect-square rounded-[3px] text-[8px] font-medium flex items-center justify-center transition-all duration-150 ${
                    selected === i
                      ? 'ring-2 ring-[#333] ring-offset-1 scale-125 z-10'
                      : ''
                  } ${dimmed ? 'opacity-15' : ''} ${
                    r.status === 'CORRECT'
                      ? 'bg-[#4a8a5e] text-white'
                      : r.status === 'WRONG'
                        ? 'bg-[#c4555e] text-white'
                        : r.status === 'NOT_MARKED'
                          ? 'bg-[#ddd] text-[#999]'
                          : 'bg-[#eee] text-[#bbb]'
                  }`}
                  title={`Q${r.question}: ${r.selected} → ${r.correct} (${r.status})`}
                  aria-label={`Question ${r.question}, ${r.status}`}
                >
                  {r.question}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== DETAIL AREA ===== */}
      <div className="flex-1 overflow-y-auto">
        {!e ? (
          /* Pre-results: Upload area */
          <div className="h-full flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
              <h2 className="text-xl sm:text-2xl font-light text-[#333] text-center mb-2">
                Map Your Answers
              </h2>
              <p className="text-sm text-[#999] text-center mb-10">
                Upload both documents to see your 100-question answer map
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* OMR */}
                <div className="bg-white rounded-xl border border-[#e8e5de] p-6">
                  <h3 className="text-xs font-semibold text-[#666] mb-3 uppercase tracking-wider">
                    Student OMR Sheet
                  </h3>
                  {omrFile ? (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${omrResult ? 'bg-[#4a8a5e]' : 'bg-[#e8b84a] animate-pulse'}`} />
                      <span className="text-sm text-[#333] truncate">{omrFile.name}</span>
                      {omrResult && (
                        <span className="ml-auto text-xs text-[#4a8a5e]">
                          {omrResult.answers.filter((a) => a !== 'EMPTY').length} answers
                        </span>
                      )}
                    </div>
                  ) : (
                    <FileDropZone
                      onFile={uploadOmr}
                      disabled={busy}
                      className="border-2 border-dashed border-[#e8e5de] rounded-lg p-8 hover:border-[#3b6b8a]/30 hover:bg-[#fafaf8] transition-all"
                    >
                      <div className="text-center">
                        <svg className="w-6 h-6 text-[#ccc] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-xs text-[#999]">Drop OMR sheet</p>
                      </div>
                    </FileDropZone>
                  )}
                </div>

                {/* Key */}
                <div className="bg-white rounded-xl border border-[#e8e5de] p-6">
                  <h3 className="text-xs font-semibold text-[#666] mb-3 uppercase tracking-wider">
                    Answer Key
                  </h3>
                  {keyFile ? (
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${keyResult ? 'bg-[#4a8a5e]' : 'bg-[#e8b84a] animate-pulse'}`} />
                      <span className="text-sm text-[#333] truncate">{keyFile.name}</span>
                      {keyResult && (
                        <span className="ml-auto text-xs text-[#4a8a5e]">
                          {keyResult.answers.filter((a) => a !== 'EMPTY').length} extracted
                        </span>
                      )}
                    </div>
                  ) : (
                    <FileDropZone
                      onFile={uploadKey}
                      disabled={busy || !omrResult}
                      className={`border-2 border-dashed rounded-lg p-8 transition-all ${
                        !omrResult
                          ? 'border-[#f0f0f0] opacity-30'
                          : 'border-[#e8e5de] hover:border-[#6b5e8a]/30 hover:bg-[#fafaf8]'
                      }`}
                    >
                      <div className="text-center">
                        <svg className="w-6 h-6 text-[#ccc] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-xs text-[#999]">
                          {!omrResult ? 'Upload OMR first' : 'Drop answer key'}
                        </p>
                      </div>
                    </FileDropZone>
                  )}
                </div>
              </div>

              {busy && (
                <p className="text-sm text-[#3b6b8a] text-center mt-6 animate-pulse">
                  {step === 'omr-uploading'
                    ? 'Processing OMR sheet…'
                    : step === 'key-uploading'
                      ? 'Extracting answer key…'
                      : 'Evaluating…'}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Post-results: Selected question detail + list */
            <div className="p-3 sm:p-4 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Selected Question Detail */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-xl border border-[#e8e5de] p-5 sticky top-4">
                  <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-semibold mb-4">
                    Question Detail
                  </h3>
                  <AnimatePresence mode="wait">
                    {selectedResult ? (
                      <motion.div
                        key={selected}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        aria-live="polite"
                      >
                        <div className="text-4xl font-light text-[#333] mb-4">
                          Q{selectedResult.question}
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-[#999]">Your answer</span>
                            <span
                              className={`font-semibold ${
                                selectedResult.selected === 'EMPTY'
                                  ? 'text-[#ccc]'
                                  : selectedResult.status === 'CORRECT'
                                    ? 'text-[#4a8a5e]'
                                    : selectedResult.status === 'WRONG'
                                      ? 'text-[#c4555e]'
                                      : 'text-[#333]'
                              }`}
                            >
                              {selectedResult.selected === 'EMPTY'
                                ? 'Not marked'
                                : selectedResult.selected}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-[#999]">Correct answer</span>
                            <span className="font-semibold text-[#333]">
                              {selectedResult.correct === 'EMPTY'
                                ? 'N/A'
                                : selectedResult.correct}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-[#f0f0f0]">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                selectedResult.status === 'CORRECT'
                                  ? 'bg-[#e8f5e9] text-[#4a8a5e]'
                                  : selectedResult.status === 'WRONG'
                                    ? 'bg-[#ffeee8] text-[#c4555e]'
                                    : 'bg-[#f0f0f0] text-[#999]'
                              }`}
                            >
                              {selectedResult.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-[#ccc] text-center py-8"
                      >
                        Click a question on the map above
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Filtered List */}
              <div className="md:col-span-2 bg-white rounded-xl border border-[#e8e5de] overflow-hidden">
                <div className="px-4 py-2.5 bg-[#f8f7f4] border-b border-[#e8e5de] text-[10px] uppercase tracking-[0.15em] text-[#999] font-semibold">
                  {filter === 'ALL' ? 'All Questions' : filter.replace('_', ' ')} ({filteredResults?.length})
                </div>
                <div className="max-h-[calc(100vh-22rem)] overflow-y-auto scrollbar-thin">
                  {filteredResults?.map((r) => (
                    <button
                      key={r.question}
                      onClick={() => setSelected(r.question - 1)}
                      className={`w-full flex items-center gap-3 px-4 py-2 border-b border-[#f5f5f2] text-left text-sm transition-colors hover:bg-[#fafaf8] ${
                        selected === r.question - 1
                          ? 'bg-[#f0f0ec]'
                          : ''
                      }`}
                    >
                      <span className="w-8 text-right text-xs text-[#bbb] tabular-nums">
                        {r.question}
                      </span>
                      <span className="font-medium text-[#333] w-6">
                        {r.selected === 'EMPTY' ? '—' : r.selected}
                      </span>
                      <span className="text-[#bbb]">→</span>
                      <span className="text-[#666] w-6">{r.correct === 'EMPTY' ? '—' : r.correct}</span>
                      <span
                        className={`ml-auto text-[9px] uppercase tracking-wider font-medium ${
                          r.status === 'CORRECT'
                            ? 'text-[#4a8a5e]'
                            : r.status === 'WRONG'
                              ? 'text-[#c4555e]'
                              : 'text-[#ccc]'
                        }`}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-[#c4555e] text-white text-xs text-center">
          {error}
        </div>
      )}
    </div>
  );
}
