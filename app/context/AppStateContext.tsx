'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  extractOmr,
  extractAnswerKey,
  evaluateAnswers,
  type OmrExtractResponse,
  type AnswerKeyExtractResponse,
  type EvaluationResponse,
} from '../services/api';

export type AppStep =
  | 'idle'
  | 'omr-uploading'
  | 'omr-done'
  | 'key-uploading'
  | 'key-done'
  | 'evaluating'
  | 'results';

interface AppState {
  step: AppStep;
  omrFile: File | null;
  keyFile: File | null;
  omrResult: OmrExtractResponse | null;
  keyResult: AnswerKeyExtractResponse | null;
  evaluation: EvaluationResponse | null;
  error: string | null;
  totalQuestions: number;
  uploadOmr: (file: File) => Promise<void>;
  uploadKey: (file: File) => Promise<void>;
  evaluate: () => Promise<void>;
  reset: () => void;
  setTotalQuestions: (n: number) => void;
}

const AppStateContext = createContext<AppState | null>(null);

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<AppStep>('idle');
  const [omrFile, setOmrFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [omrResult, setOmrResult] = useState<OmrExtractResponse | null>(null);
  const [keyResult, setKeyResult] =
    useState<AnswerKeyExtractResponse | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(100);

  const uploadOmr = useCallback(
    async (file: File) => {
      setOmrFile(file);
      setStep('omr-uploading');
      setError(null);
      try {
        const result = await extractOmr(file, totalQuestions);
        setOmrResult(result);
        setStep('omr-done');
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'OMR extraction failed');
        setStep('idle');
      }
    },
    [totalQuestions],
  );

  const uploadKey = useCallback(
    async (file: File) => {
      setKeyFile(file);
      setStep('key-uploading');
      setError(null);
      try {
        const result = await extractAnswerKey(file, totalQuestions);
        setKeyResult(result);
        setStep('key-done');
      } catch (e: unknown) {
        setError(
          e instanceof Error ? e.message : 'Answer key extraction failed',
        );
        setStep(omrResult ? 'omr-done' : 'idle');
      }
    },
    [totalQuestions, omrResult],
  );

  const doEvaluate = useCallback(async () => {
    if (!omrResult || !keyResult) return;
    setStep('evaluating');
    setError(null);
    try {
      const result = await evaluateAnswers(
        omrResult.answers,
        keyResult.answers,
        totalQuestions,
      );
      setEvaluation(result);
      setStep('results');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Evaluation failed');
      setStep('key-done');
    }
  }, [omrResult, keyResult, totalQuestions]);

  const reset = useCallback(() => {
    setStep('idle');
    setOmrFile(null);
    setKeyFile(null);
    setOmrResult(null);
    setKeyResult(null);
    setEvaluation(null);
    setError(null);
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        step,
        omrFile,
        keyFile,
        omrResult,
        keyResult,
        evaluation,
        error,
        totalQuestions,
        uploadOmr,
        uploadKey,
        evaluate: doEvaluate,
        reset,
        setTotalQuestions,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}
