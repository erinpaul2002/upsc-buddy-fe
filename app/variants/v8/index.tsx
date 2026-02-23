/*
 * ═══════════════════════════════════════════════════════════
 * VARIANT 8: SPLIT VIEW — Side-by-Side Comparison
 * ═══════════════════════════════════════════════════════════
 *
 * DESIGN THESIS:
 *   Visual comparison is the primary paradigm. Student answers
 *   and correct answers are always visible side by side.
 *   Optimizes for learning — users can see exactly where they
 *   went wrong without switching views.
 *
 * PRIMARY USER STORY:
 *   User uploads OMR on the left panel → uploads answer key on
 *   the right panel → both columns fill with answers → a center
 *   divider shows match/mismatch indicators. Results are
 *   inline, not on a separate screen.
 *
 * KEY LAYOUT DECISIONS:
 *   Persistent left/right split with a center gutter.
 *   Each side shows upload zone initially, then answer list.
 *   Summary bar at top spans full width.
 *
 * INTERACTION STYLE:
 *   Parallel interaction — both panels are always available.
 *   Synchronized scrolling between answer lists.
 *   No separate results view — comparison IS the result.
 *
 * ACCESSIBILITY:
 *   Panel regions clearly labeled. Tab order goes left→right.
 *   Synchronized scroll can be toggled off for keyboard users.
 */
'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import FileDropZone from '../../components/shared/FileDropZone';
import { motion } from 'framer-motion';

export default function V8SplitView() {
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

  // Sync scroll
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [syncScroll, setSyncScroll] = useState(true);
  const scrolling = useRef(false);

  const handleScroll = useCallback(
    (source: 'left' | 'right') => {
      if (!syncScroll || scrolling.current) return;
      scrolling.current = true;
      const src = source === 'left' ? leftRef.current : rightRef.current;
      const tgt = source === 'left' ? rightRef.current : leftRef.current;
      if (src && tgt) {
        tgt.scrollTop = src.scrollTop;
      }
      requestAnimationFrame(() => {
        scrolling.current = false;
      });
    },
    [syncScroll],
  );

  // Auto-evaluate when both are ready
  useEffect(() => {
    if (omrResult && keyResult && step === 'key-done') {
      evaluate();
    }
  }, [omrResult, keyResult, step, evaluate]);

  const AnswerList = ({
    answers,
    type,
  }: {
    answers: string[];
    type: 'student' | 'key';
  }) => (
    <div className="space-y-0">
      {answers.map((ans, i) => {
        const result = e?.results[i];
        const isCorrect = result?.status === 'CORRECT';
        const isWrong = result?.status === 'WRONG';

        return (
          <div
            key={i}
            className={`flex items-center px-4 py-1.5 border-b border-[#f0f0f0] text-sm ${
              isCorrect
                ? 'bg-[#e8f5e9]'
                : isWrong
                  ? type === 'student'
                    ? 'bg-[#ffeee8]'
                    : 'bg-[#e8f5e9]'
                  : ''
            }`}
          >
            <span className="w-8 text-right text-xs text-[#9a9a9a] tabular-nums mr-3">
              {i + 1}
            </span>
            <span
              className={`font-medium ${
                ans === 'EMPTY'
                  ? 'text-[#ccc] italic text-xs'
                  : isWrong && type === 'student'
                    ? 'text-[#c4555e]'
                    : isCorrect
                      ? 'text-[#4a8a5e]'
                      : 'text-[#333]'
              }`}
            >
              {ans === 'EMPTY' ? '—' : ans}
            </span>
            {result && type === 'student' && (
              <span className="ml-auto">
                {isCorrect ? (
                  <span className="text-[#4a8a5e] text-xs">✓</span>
                ) : isWrong ? (
                  <span className="text-[#c4555e] text-xs">✗</span>
                ) : null}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-[#fafafa] flex flex-col">
      {/* Summary Bar */}
      {e && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-white border-b border-[#eee] px-6 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-light text-[#333] tabular-nums">
                {e.score}
              </span>
              <span className="text-sm text-[#999]">
                / {e.total_questions}
              </span>
            </div>
            <div className="flex gap-2 sm:gap-4 text-xs flex-wrap">
              <span className="text-[#4a8a5e]">
                ✓ {e.stats.correct} correct
              </span>
              <span className="text-[#c4555e]">
                ✗ {e.stats.wrong} wrong
              </span>
              <span className="text-[#999]">
                — {e.stats.not_marked} blank
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-[10px] text-[#999] cursor-pointer">
              <input
                type="checkbox"
                checked={syncScroll}
                onChange={(ev) => setSyncScroll(ev.target.checked)}
                className="rounded"
              />
              Sync scroll
            </label>
            <button
              onClick={reset}
              className="text-xs text-[#3b6b8a] hover:underline"
            >
              New
            </button>
          </div>
        </motion.div>
      )}

      {/* Split Panels */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* LEFT: Student Answers */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-[#eee] min-h-0" aria-label="Student answers">
          <div className="px-4 py-3 bg-white border-b border-[#eee] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${omrResult ? 'bg-[#4a8a5e]' : 'bg-[#ddd]'}`}
              />
              <span className="text-xs font-semibold text-[#555] uppercase tracking-wider">
                Your Answers
              </span>
            </div>
            {omrResult && (
              <span className="text-[10px] text-[#999]">
                {omrResult.answers.filter((a) => a !== 'EMPTY').length} detected
              </span>
            )}
          </div>

          {omrFile ? (
            <div
              ref={leftRef}
              onScroll={() => handleScroll('left')}
              className="flex-1 overflow-y-auto scrollbar-thin"
            >
              {omrResult ? (
                <AnswerList answers={omrResult.answers} type="student" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="w-6 h-6 border-2 border-[#eee] border-t-[#3b6b8a] rounded-full"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <FileDropZone
                onFile={uploadOmr}
                disabled={busy}
                className="w-full max-w-sm border-2 border-dashed border-[#e0e0e0] rounded-2xl p-12 hover:border-[#3b6b8a]/30 hover:bg-white transition-all"
              >
                <div className="flex flex-col items-center gap-4">
                  <svg className="w-10 h-10 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-[#999]">
                    Upload your OMR sheet
                  </p>
                  <p className="text-xs text-[#ccc]">JPG, PNG, or PDF</p>
                </div>
              </FileDropZone>
            </div>
          )}
        </div>

        {/* CENTER DIVIDER - match indicators */}
        {e && (
          <div className="hidden md:flex w-10 bg-[#f5f5f5] border-x border-[#eee] overflow-y-auto scrollbar-none flex-col">
            <div className="py-[11px]" /> {/* Header offset */}
            {e.results.map((r) => (
              <div
                key={r.question}
                className={`h-[33px] flex items-center justify-center text-[9px] shrink-0 ${
                  r.status === 'CORRECT'
                    ? 'text-[#4a8a5e]'
                    : r.status === 'WRONG'
                      ? 'text-[#c4555e]'
                      : 'text-[#ddd]'
                }`}
              >
                {r.status === 'CORRECT'
                  ? '='
                  : r.status === 'WRONG'
                    ? '≠'
                    : '·'}
              </div>
            ))}
          </div>
        )}

        {/* RIGHT: Answer Key */}
        <div className="flex-1 flex flex-col min-h-0" aria-label="Answer key">
          <div className="px-4 py-3 bg-white border-b border-[#eee] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${keyResult ? 'bg-[#4a8a5e]' : 'bg-[#ddd]'}`}
              />
              <span className="text-xs font-semibold text-[#555] uppercase tracking-wider">
                Answer Key
              </span>
            </div>
            {keyResult && (
              <span className="text-[10px] text-[#999]">
                {keyResult.answers.filter((a) => a !== 'EMPTY').length}{' '}
                extracted
              </span>
            )}
          </div>

          {keyFile ? (
            <div
              ref={rightRef}
              onScroll={() => handleScroll('right')}
              className="flex-1 overflow-y-auto scrollbar-thin"
            >
              {keyResult ? (
                <AnswerList answers={keyResult.answers} type="key" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="w-6 h-6 border-2 border-[#eee] border-t-[#6b5e8a] rounded-full"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <FileDropZone
                onFile={uploadKey}
                disabled={busy || !omrResult}
                className={`w-full max-w-sm border-2 border-dashed rounded-2xl p-12 transition-all ${
                  !omrResult
                    ? 'border-[#f0f0f0] opacity-35'
                    : 'border-[#e0e0e0] hover:border-[#6b5e8a]/30 hover:bg-white'
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <svg className="w-10 h-10 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-sm text-[#999]">
                    {!omrResult
                      ? 'Upload OMR first'
                      : 'Upload answer key'}
                  </p>
                  <p className="text-xs text-[#ccc]">JPG, PNG, or PDF</p>
                </div>
              </FileDropZone>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2.5 bg-[#c4555e] text-white text-xs text-center">
          {error}
        </div>
      )}
    </div>
  );
}
