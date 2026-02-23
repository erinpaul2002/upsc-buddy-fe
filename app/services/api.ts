function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function getApiBase(): string {
  const envBase = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (envBase) return trimTrailingSlash(envBase);
  return '';
}

const API_BASE = getApiBase();

function normalizeFetchError(
  error: unknown,
  fallbackMessage: string,
): Error {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes('load failed') ||
      msg.includes('failed to fetch') ||
      msg.includes('networkerror')
    ) {
      return new Error('Cannot reach API server. If using mobile, restart frontend and backend, and verify NEXT_PUBLIC_API_URL/BACKEND_URL configuration.');
    }
    return error;
  }
  return new Error(fallbackMessage);
}

export interface OmrExtractResponse {
  answers: string[];
  total_questions: number;
  detected_bubbles: number;
  source_filename: string;
}

export interface AnswerKeyExtractResponse {
  answers: string[];
  total_questions: number;
  source_filename: string;
  ocr_analysis: Record<string, unknown>;
  request_analysis: Record<string, unknown>;
  analysis_log: string;
}

export interface EvaluationResult {
  question: number;
  selected: string;
  correct: string;
  status: 'CORRECT' | 'WRONG' | 'NOT_MARKED' | 'MISSING_KEY';
}

export interface EvaluationStats {
  correct: number;
  wrong: number;
  not_marked: number;
  missing_key: number;
}

export interface Evaluation {
  score: number;
  total_questions: number;
  stats: EvaluationStats;
  results: EvaluationResult[];
}

export interface EvaluationResponse {
  evaluation: Evaluation;
}

export async function extractOmr(
  file: File,
  totalQuestions = 100,
): Promise<OmrExtractResponse> {
  try {
    const fd = new FormData();
    fd.append('omr_file', file);
    fd.append('total_questions', totalQuestions.toString());

    const res = await fetch(`${API_BASE}/api/v1/omr/extract`, {
      method: 'POST',
      body: fd,
    });

    if (!res.ok) {
      const err = await res
        .json()
        .catch(() => ({ detail: 'OMR extraction failed' }));
      throw new Error(err.detail || 'OMR extraction failed');
    }
    return res.json();
  } catch (error: unknown) {
    throw normalizeFetchError(error, 'OMR extraction failed');
  }
}

export async function extractAnswerKey(
  file: File,
  totalQuestions = 100,
): Promise<AnswerKeyExtractResponse> {
  try {
    const fd = new FormData();
    fd.append('key_file', file);
    fd.append('total_questions', totalQuestions.toString());

    const res = await fetch(`${API_BASE}/api/v1/answer-key/extract`, {
      method: 'POST',
      body: fd,
    });

    if (!res.ok) {
      const err = await res
        .json()
        .catch(() => ({ detail: 'Answer key extraction failed' }));
      throw new Error(err.detail || 'Answer key extraction failed');
    }
    return res.json();
  } catch (error: unknown) {
    throw normalizeFetchError(error, 'Answer key extraction failed');
  }
}

export async function evaluateAnswers(
  studentAnswers: string[],
  correctAnswers: string[],
  totalQuestions = 100,
): Promise<EvaluationResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_answers: studentAnswers,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
      }),
    });

    if (!res.ok) {
      const err = await res
        .json()
        .catch(() => ({ detail: 'Evaluation failed' }));
      throw new Error(err.detail || 'Evaluation failed');
    }
    return res.json();
  } catch (error: unknown) {
    throw normalizeFetchError(error, 'Evaluation failed');
  }
}
