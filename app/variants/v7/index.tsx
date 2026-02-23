/*
 * ═══════════════════════════════════════════════════════════
 * VARIANT 7: SCIENTIFIC INSTRUMENT — Measurement-Focused
 * ═══════════════════════════════════════════════════════════
 *
 * DESIGN THESIS:
 *   Treats scanning as a measurement/calibration process.
 *   Every data point is displayed with scientific precision.
 *   Optimizes for trustworthiness — gauges and meters convey
 *   the system is doing rigorous work, not guessing.
 *
 * PRIMARY USER STORY:
 *   User loads a "sample" (OMR) into the instrument → loads a
 *   "reference" (answer key) → instrument calibrates → readout
 *   shows measurements with precision indicators. Clinical, exact.
 *
 * KEY LAYOUT DECISIONS:
 *   Top: instrument panel with gauges and indicators.
 *   Center: control panel with upload slots.
 *   Bottom: readout table with full data.
 *   Cool white/blue/slate palette — clinical lab aesthetic.
 *
 * INTERACTION STYLE:
 *   Panel-based with immediate feedback. Circular progress
 *   indicators and animated gauges for processing states.
 *
 * ACCESSIBILITY:
 *   ARIA labels on all gauges. Percentage values available
 *   as text alternatives. High contrast on light background.
 */
'use client';

import { useAppState } from '../../context/AppStateContext';
import FileDropZone from '../../components/shared/FileDropZone';
import { motion } from 'framer-motion';

function CircularGauge({
  value,
  max,
  label,
  color,
  size = 100,
}: {
  value: number;
  max: number;
  label: string;
  color: string;
  size?: number;
}) {
  const pct = max > 0 ? value / max : 0;
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div
      className="flex flex-col items-center gap-2"
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e8ecf2"
          strokeWidth={6}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="text-center -mt-[calc(50%+12px)] mb-6">
        <div className="text-xl font-light tabular-nums" style={{ color }}>
          {value}
        </div>
        <div className="text-[9px] text-[#8a93a5] uppercase tracking-wider">
          {label}
        </div>
      </div>
    </div>
  );
}

function Readout({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="flex items-baseline justify-between py-2 border-b border-[#edf0f5]">
      <span className="text-[11px] text-[#6a7385]">{label}</span>
      <span className="text-sm font-medium text-[#2a3040] tabular-nums">
        {value}
        {unit && (
          <span className="text-[10px] text-[#8a93a5] ml-1">{unit}</span>
        )}
      </span>
    </div>
  );
}

export default function V7Instrument() {
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

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#f5f7fa]">
      {/* Instrument Header */}
      <div className="border-b border-[#d6dbe3] bg-white px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-2 h-2 rounded-full bg-[#4a8a5e] animate-pulse" />
          <span className="text-[11px] uppercase tracking-[0.15em] text-[#6a7385] font-medium">
            OMR Analysis Instrument
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-[#8a93a5]">
            STATUS:{' '}
            <span className="text-[#2a3040] font-semibold">
              {step === 'idle'
                ? 'STANDBY'
                : busy
                  ? 'PROCESSING'
                  : step === 'results'
                    ? 'COMPLETE'
                    : 'READY'}
            </span>
          </span>
          {evaluation && (
            <button
              onClick={reset}
              className="text-[10px] text-[#3b6b8a] hover:underline"
            >
              RESET INSTRUMENT
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* Gauge Panel - only when results exist */}
        {e && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-[#d6dbe3] p-6 mb-4"
          >
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#8a93a5] font-medium mb-4">
              Measurement Gauges
            </h3>
            <div className="flex items-center justify-around flex-wrap gap-4">
              <CircularGauge
                value={e.score}
                max={e.total_questions}
                label="Score"
                color="#3b6b8a"
                size={90}
              />
              <CircularGauge
                value={e.stats.correct}
                max={e.total_questions}
                label="Correct"
                color="#4a8a5e"
                size={75}
              />
              <CircularGauge
                value={e.stats.wrong}
                max={e.total_questions}
                label="Wrong"
                color="#c4555e"
                size={75}
              />
              <CircularGauge
                value={e.stats.not_marked}
                max={e.total_questions}
                label="Blank"
                color="#8a93a5"
                size={75}
              />
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Control Panel: Input Slots */}
          <div className="md:col-span-1 space-y-4">
            {/* Sample Loading */}
            <div className="bg-white rounded-xl border border-[#d6dbe3] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#edf0f5] border-b border-[#d6dbe3]">
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#6a7385] font-semibold">
                  Sample Input
                </span>
              </div>
              <div className="p-4">
                {omrFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${omrResult ? 'bg-[#4a8a5e]' : 'bg-[#e8b84a] animate-pulse'}`}
                      />
                      <span className="text-xs text-[#2a3040] truncate">
                        {omrFile.name}
                      </span>
                    </div>
                    {omrResult && (
                      <div className="space-y-0">
                        <Readout
                          label="Detected answers"
                          value={
                            omrResult.answers.filter((a) => a !== 'EMPTY')
                              .length
                          }
                        />
                        <Readout
                          label="Bubbles found"
                          value={omrResult.detected_bubbles}
                        />
                        <Readout
                          label="Total questions"
                          value={omrResult.total_questions}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <FileDropZone
                    onFile={uploadOmr}
                    disabled={busy}
                    className="border border-dashed border-[#d6dbe3] rounded-lg p-6 hover:border-[#3b6b8a]/40 hover:bg-[#f5f7fa] transition-all"
                  >
                    <div className="text-center">
                      <p className="text-xs text-[#6a7385]">
                        Load OMR sample
                      </p>
                    </div>
                  </FileDropZone>
                )}
              </div>
            </div>

            {/* Reference Loading */}
            <div className="bg-white rounded-xl border border-[#d6dbe3] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#edf0f5] border-b border-[#d6dbe3]">
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#6a7385] font-semibold">
                  Reference Input
                </span>
              </div>
              <div className="p-4">
                {keyFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${keyResult ? 'bg-[#4a8a5e]' : 'bg-[#e8b84a] animate-pulse'}`}
                      />
                      <span className="text-xs text-[#2a3040] truncate">
                        {keyFile.name}
                      </span>
                    </div>
                    {keyResult && (
                      <div className="space-y-0">
                        <Readout
                          label="Extracted answers"
                          value={
                            keyResult.answers.filter((a) => a !== 'EMPTY')
                              .length
                          }
                        />
                        <Readout
                          label="Total questions"
                          value={keyResult.total_questions}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <FileDropZone
                    onFile={uploadKey}
                    disabled={busy || !omrResult}
                    className={`border border-dashed rounded-lg p-6 transition-all ${
                      !omrResult
                        ? 'border-[#edf0f5] opacity-30'
                        : 'border-[#d6dbe3] hover:border-[#3b6b8a]/40 hover:bg-[#f5f7fa]'
                    }`}
                  >
                    <div className="text-center">
                      <p className="text-xs text-[#6a7385]">
                        {!omrResult
                          ? 'Awaiting sample'
                          : 'Load reference key'}
                      </p>
                    </div>
                  </FileDropZone>
                )}
              </div>
            </div>

            {/* Run Control */}
            {omrResult && keyResult && !evaluation && (
              <button
                onClick={evaluate}
                disabled={busy}
                className="w-full py-3 bg-[#3b6b8a] text-white rounded-xl text-sm font-medium hover:bg-[#2d5a78] transition-colors disabled:opacity-50"
              >
                {busy ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Analyzing…
                  </span>
                ) : (
                  'RUN ANALYSIS'
                )}
              </button>
            )}
          </div>

          {/* Readout Panel */}
          <div className="md:col-span-2 bg-white rounded-xl border border-[#d6dbe3] overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 bg-[#edf0f5] border-b border-[#d6dbe3] flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.15em] text-[#6a7385] font-semibold">
                Analysis Readout
              </span>
              {e && (
                <span className="text-[10px] text-[#3b6b8a] font-semibold tabular-nums">
                  ACCURACY: {Math.round((e.score / e.total_questions) * 100)}%
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-1 scrollbar-thin max-h-[calc(100vh-20rem)]">
              {e ? (
                <table className="w-full text-[11px]">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="text-[#8a93a5] text-left border-b border-[#edf0f5]">
                      <th className="py-2 px-3 font-medium w-12">Q#</th>
                      <th className="py-2 px-3 font-medium">Sample</th>
                      <th className="py-2 px-3 font-medium">Reference</th>
                      <th className="py-2 px-3 font-medium">Match</th>
                      <th className="py-2 px-3 font-medium text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {e.results.map((r) => (
                      <tr
                        key={r.question}
                        className={`border-b border-[#f5f7fa] ${
                          r.status === 'CORRECT'
                            ? 'bg-[#4a8a5e]/3'
                            : r.status === 'WRONG'
                              ? 'bg-[#c4555e]/3'
                              : ''
                        }`}
                      >
                        <td className="py-1.5 px-3 text-[#6a7385] tabular-nums font-mono">
                          {String(r.question).padStart(3, '0')}
                        </td>
                        <td className="py-1.5 px-3 font-semibold text-[#2a3040]">
                          {r.selected}
                        </td>
                        <td className="py-1.5 px-3 text-[#6a7385]">
                          {r.correct}
                        </td>
                        <td className="py-1.5 px-3">
                          <span
                            className={`inline-block w-4 h-4 rounded-full text-center text-[9px] leading-4 font-bold ${
                              r.status === 'CORRECT'
                                ? 'bg-[#4a8a5e]/15 text-[#4a8a5e]'
                                : r.status === 'WRONG'
                                  ? 'bg-[#c4555e]/15 text-[#c4555e]'
                                  : 'bg-[#edf0f5] text-[#8a93a5]'
                            }`}
                          >
                            {r.status === 'CORRECT'
                              ? '='
                              : r.status === 'WRONG'
                                ? '≠'
                                : '—'}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 text-right text-[9px] uppercase tracking-wider text-[#8a93a5]">
                          {r.status.replace('_', ' ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-[#b0b8c8]">
                  <div className="text-center">
                    <div className="text-2xl mb-2 text-[#d6dbe3]">⊘</div>
                    <p>Awaiting analysis data</p>
                    <p className="text-[10px] mt-1">
                      Load both inputs and run analysis
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
