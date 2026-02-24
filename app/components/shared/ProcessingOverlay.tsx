'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppState } from '../../context/AppStateContext';
import { useVariant } from '../../context/VariantContext';
import ZenRipple from '../../animation-tester/animations/ZenRipple';
import ConveyorBench from '../../animation-tester/animations/ConveyorBench';
import TypewriterBubbles from '../../animation-tester/animations/TypewriterBubbles';
import BlueprintDraw from '../../animation-tester/animations/BlueprintDraw';
import InkSpread from '../../animation-tester/animations/InkSpread';
import OrigamiFold from '../../animation-tester/animations/OrigamiFold';
import Oscilloscope from '../../animation-tester/animations/Oscilloscope';
import BinaryMatch from '../../animation-tester/animations/BinaryMatch';
import HeatmapReveal from '../../animation-tester/animations/HeatmapReveal';
import ParticleHourglass from '../../animation-tester/animations/ParticleHourglass';

const BUSY_STEPS = ['omr-uploading', 'key-uploading', 'evaluating'] as const;

const statusText: Record<(typeof BUSY_STEPS)[number], string> = {
  'omr-uploading': 'Reading OMR image…',
  'key-uploading': 'Extracting answer key…',
  evaluating: 'Comparing answers…',
};

const estimatedDurationMs: Record<(typeof BUSY_STEPS)[number], number> = {
  'omr-uploading': 5000,
  'key-uploading': 50000,
  evaluating: 6000,
};

const animations: Record<number, (props: { trigger: number }) => React.ReactElement> = {
  1: ZenRipple,
  2: ConveyorBench,
  3: TypewriterBubbles,
  4: BlueprintDraw,
  5: InkSpread,
  6: OrigamiFold,
  7: Oscilloscope,
  8: BinaryMatch,
  9: HeatmapReveal,
  10: ParticleHourglass,
};

export default function ProcessingOverlay() {
  const { step } = useAppState();
  const { variant } = useVariant();

  const isBusy = BUSY_STEPS.includes(step as (typeof BUSY_STEPS)[number]);
  const [visible, setVisible] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trigger, setTrigger] = useState(0);
  const prevBusyRef = useRef(false);
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    const wasBusy = prevBusyRef.current;

    if (isBusy && !wasBusy) {
      const startTimer = setTimeout(() => {
        setVisible(true);
        setIsCompleting(false);
        setProgress(8);
        startedAtRef.current = Date.now();
        setTrigger(t => t + 1);
      }, 0);
      prevBusyRef.current = isBusy;
      return () => clearTimeout(startTimer);
    }

    if (!isBusy && wasBusy) {
      const completeTimer = setTimeout(() => {
        setProgress(100);
        setIsCompleting(true);
      }, 0);
      const doneTimer = setTimeout(() => {
        setVisible(false);
        setIsCompleting(false);
        setProgress(0);
      }, 550);
      prevBusyRef.current = isBusy;
      return () => {
        clearTimeout(completeTimer);
        clearTimeout(doneTimer);
      };
    }

    prevBusyRef.current = isBusy;
    return;
  }, [isBusy]);

  useEffect(() => {
    if (!visible || isCompleting || !isBusy) return;

    const activeStep = step as (typeof BUSY_STEPS)[number];
    const duration = estimatedDurationMs[activeStep];

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      const ratio = Math.min(elapsed / duration, 1);
      const next = 8 + ratio * 84;
      setProgress(prev => (next > prev ? Math.min(92, next) : prev));
    }, 140);

    return () => clearInterval(progressTimer);
  }, [visible, isCompleting, isBusy, step]);

  const Animation = useMemo(() => animations[variant] || ZenRipple, [variant]);

  const label = isCompleting
    ? 'Done'
    : isBusy
      ? statusText[step as (typeof BUSY_STEPS)[number]]
      : '';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm flex items-center justify-center px-4"
          role="status"
          aria-live="polite"
          aria-busy={isBusy}
        >
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="w-full max-w-sm rounded-2xl bg-white shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="h-44 relative bg-gray-50">
              <Animation trigger={trigger} />
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
              </div>

              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gray-900"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: isCompleting ? 0.2 : 0.14, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
