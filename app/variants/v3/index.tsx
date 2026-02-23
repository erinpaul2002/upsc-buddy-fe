/*
 * ═══════════════════════════════════════════════════════════
 * VARIANT 3: CONVERSATION — Chat-Guided Interface
 * ═══════════════════════════════════════════════════════════
 *
 * DESIGN THESIS:
 *   Reduces cognitive load by turning a multi-step tool into
 *   a guided conversation. The system asks, the user responds.
 *   Optimizes for first-time users who don't know the workflow.
 *
 * PRIMARY USER STORY:
 *   System greets user → asks for OMR sheet → user uploads →
 *   system acknowledges → asks for answer key → user uploads →
 *   system offers to evaluate → user confirms → results appear
 *   as a conversation message.
 *
 * KEY LAYOUT DECISIONS:
 *   Centered message thread (max 640px), messages alternate
 *   left (system) and right (user). Upload zones are inline
 *   within the conversation thread.
 *
 * INTERACTION STYLE:
 *   Scroll-driven conversation with inline prompts.
 *   Each message appears with a subtle typing-indicator delay.
 *
 * ACCESSIBILITY:
 *   Sequential content is naturally screen-reader friendly.
 *   All interactive elements have visible focus states.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppState, type AppStep } from '../../context/AppStateContext';
import FileDropZone from '../../components/shared/FileDropZone';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  from: 'system' | 'user';
  content: React.ReactNode;
}

function stepToMessages(
  step: AppStep,
  omrFile: File | null,
  keyFile: File | null,
  omrResult: ReturnType<typeof useAppState>['omrResult'],
  keyResult: ReturnType<typeof useAppState>['keyResult'],
  evaluation: ReturnType<typeof useAppState>['evaluation'],
): string[] {
  const ids: string[] = ['welcome'];

  if (step === 'idle' && !omrFile) {
    ids.push('ask-omr');
    return ids;
  }

  if (omrFile) ids.push('user-omr');

  if (step === 'omr-uploading') {
    ids.push('processing-omr');
    return ids;
  }

  if (omrResult) {
    ids.push('omr-done');
    ids.push('ask-key');
  }

  if (keyFile) ids.push('user-key');

  if (step === 'key-uploading') {
    ids.push('processing-key');
    return ids;
  }

  if (keyResult) {
    ids.push('key-done');
    ids.push('ask-evaluate');
  }

  if (step === 'evaluating') {
    ids.push('processing-eval');
    return ids;
  }

  if (evaluation) {
    ids.push('results');
  }

  return ids;
}

const msgEnter = {
  initial: { opacity: 0, y: 12, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.3 },
};

export default function V3Conversation() {
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTyping, setShowTyping] = useState(false);

  const messageIds = stepToMessages(
    step,
    omrFile,
    keyFile,
    omrResult,
    keyResult,
    evaluation,
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messageIds.length, showTyping]);

  useEffect(() => {
    if (busy) {
      setShowTyping(true);
    } else {
      const t = setTimeout(() => setShowTyping(false), 200);
      return () => clearTimeout(t);
    }
  }, [busy]);

  const SystemMsg = ({ children }: { children: React.ReactNode }) => (
    <div className="flex gap-2 sm:gap-3 items-start max-w-[95%] sm:max-w-[85%]">
      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#e8e4f0] flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[10px] sm:text-[11px] font-bold text-[#6b5e8a]">U</span>
      </div>
      <div className="bg-white rounded-2xl rounded-tl-md px-4 sm:px-5 py-3 sm:py-3.5 text-sm text-[#3a3545] shadow-[0_1px_3px_rgba(0,0,0,0.06)] leading-relaxed">
        {children}
      </div>
    </div>
  );

  const UserMsg = ({ children }: { children: React.ReactNode }) => (
    <div className="flex justify-end">
      <div className="bg-[#6b5e8a] text-white rounded-2xl rounded-tr-md px-4 sm:px-5 py-3 sm:py-3.5 text-sm max-w-[85%] sm:max-w-[75%] shadow-sm">
        {children}
      </div>
    </div>
  );

  const renderMessage = (id: string) => {
    switch (id) {
      case 'welcome':
        return (
          <SystemMsg>
            <p className="font-medium mb-1">Welcome to UPSC Buddy</p>
            <p className="text-[#6a6575]">
              I&apos;ll help you evaluate your OMR answer sheet. Let&apos;s go through
              it step by step.
            </p>
          </SystemMsg>
        );

      case 'ask-omr':
        return (
          <SystemMsg>
            <p className="mb-3">
              First, upload your <strong>filled OMR bubble sheet</strong>. You
              can drop an image or PDF below.
            </p>
            <FileDropZone
              onFile={uploadOmr}
              disabled={busy}
              className="border-2 border-dashed border-[#d8d4e0] rounded-xl p-6 bg-[#f8f6fc] hover:border-[#6b5e8a]/40 hover:bg-[#f0edf8] transition-all"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#6b5e8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-[#6b5e8a] text-sm">
                  Drop OMR sheet or click to browse
                </span>
              </div>
            </FileDropZone>
          </SystemMsg>
        );

      case 'user-omr':
        return (
          <UserMsg>
            📄 Uploaded: {omrFile?.name}
          </UserMsg>
        );

      case 'processing-omr':
        return (
          <SystemMsg>
            <span className="text-[#6a6575]">Reading your answer sheet…</span>
          </SystemMsg>
        );

      case 'omr-done':
        return (
          <SystemMsg>
            <p>
              Found{' '}
              <strong className="text-[#6b5e8a]">
                {omrResult?.answers.filter((a) => a !== 'EMPTY').length}
              </strong>{' '}
              student answers from your OMR sheet. ✓
            </p>
          </SystemMsg>
        );

      case 'ask-key':
        return (
          <SystemMsg>
            <p className="mb-3">
              Now upload the <strong>answer key image</strong> — the table
              showing correct answers.
            </p>
            <FileDropZone
              onFile={uploadKey}
              disabled={busy}
              className="border-2 border-dashed border-[#d8d4e0] rounded-xl p-6 bg-[#f8f6fc] hover:border-[#6b5e8a]/40 hover:bg-[#f0edf8] transition-all"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#6b5e8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="text-[#6b5e8a] text-sm">
                  Drop answer key or click to browse
                </span>
              </div>
            </FileDropZone>
          </SystemMsg>
        );

      case 'user-key':
        return (
          <UserMsg>
            📋 Uploaded: {keyFile?.name}
          </UserMsg>
        );

      case 'processing-key':
        return (
          <SystemMsg>
            <span className="text-[#6a6575]">Extracting correct answers…</span>
          </SystemMsg>
        );

      case 'key-done':
        return (
          <SystemMsg>
            <p>
              Extracted{' '}
              <strong className="text-[#6b5e8a]">
                {keyResult?.answers.filter((a) => a !== 'EMPTY').length}
              </strong>{' '}
              correct answers from the key. ✓
            </p>
          </SystemMsg>
        );

      case 'ask-evaluate':
        return (
          <SystemMsg>
            <p className="mb-3">
              Both documents are ready. Shall I compare them and generate your
              score?
            </p>
            <button
              onClick={evaluate}
              disabled={busy}
              className="px-6 py-2.5 bg-[#6b5e8a] text-white rounded-xl text-sm font-medium hover:bg-[#5a4f76] transition-colors disabled:opacity-50"
            >
              Yes, evaluate now
            </button>
          </SystemMsg>
        );

      case 'processing-eval':
        return (
          <SystemMsg>
            <span className="text-[#6a6575]">
              Comparing answers and calculating score…
            </span>
          </SystemMsg>
        );

      case 'results':
        if (!evaluation) return null;
        const e = evaluation.evaluation;
        const pct = Math.round((e.score / e.total_questions) * 100);
        return (
          <SystemMsg>
            <p className="font-medium text-base mb-4">
              Your Score: {e.score} / {e.total_questions} ({pct}%)
            </p>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-[#6b7c5e]/15 text-[#6b7c5e] rounded-full text-xs font-medium">
                ✓ {e.stats.correct} correct
              </span>
              <span className="px-3 py-1 bg-[#c46b5e]/15 text-[#c46b5e] rounded-full text-xs font-medium">
                ✗ {e.stats.wrong} wrong
              </span>
              <span className="px-3 py-1 bg-[#a09480]/15 text-[#a09480] rounded-full text-xs font-medium">
                — {e.stats.not_marked} blank
              </span>
              {e.stats.missing_key > 0 && (
                <span className="px-3 py-1 bg-[#9c9688]/15 text-[#9c9688] rounded-full text-xs font-medium">
                  ? {e.stats.missing_key} no key
                </span>
              )}
            </div>

            {/* Mini question grid */}
            <div className="bg-[#f8f6fc] rounded-xl p-3 max-h-60 overflow-y-auto scrollbar-thin">
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                {e.results.map((r) => (
                  <div
                    key={r.question}
                    className={`w-full aspect-square rounded flex items-center justify-center text-[9px] font-medium ${
                      r.status === 'CORRECT'
                        ? 'bg-[#6b7c5e]/20 text-[#6b7c5e]'
                        : r.status === 'WRONG'
                          ? 'bg-[#c46b5e]/20 text-[#c46b5e]'
                          : 'bg-[#e8e4f0] text-[#9c9688]'
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
              className="mt-4 text-sm text-[#6b5e8a] hover:underline"
            >
              Start a new evaluation
            </button>
          </SystemMsg>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] bg-[#f4f2f8] flex flex-col">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 scrollbar-thin"
      >
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence mode="sync">
            {messageIds.map((id) => (
              <motion.div key={id} {...msgEnter} layout>
                {renderMessage(id)}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {showTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 items-start"
            >
              <div className="w-7 h-7 rounded-full bg-[#e8e4f0] flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-[#6b5e8a]">U</span>
              </div>
              <div className="bg-white rounded-2xl rounded-tl-md px-5 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[#b8b0c8]"
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Error bar */}
      {error && (
        <div className="px-4 py-3 bg-[#c46b5e]/10 text-[#c46b5e] text-sm text-center border-t border-[#c46b5e]/20">
          {error}
        </div>
      )}
    </div>
  );
}
