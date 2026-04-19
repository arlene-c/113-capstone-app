const REQUEST_TIMEOUT_MS = 15000;
const PREDICT_ROUTE = '/predict/fingerspelling';

export const FINGERSPELLING_API_ENV_KEY = 'EXPO_PUBLIC_ASL_API_URL';

export type DetectionResult = {
  detectedLetter: string;
  confidence: number;
  error?: string;
};

type DetectionBackendResponse = {
  detectedLetter?: unknown;
  letter?: unknown;
  prediction?: unknown;
  confidence?: unknown;
  score?: unknown;
  error?: unknown;
};

function getApiBaseUrl(): string | null {
  const value = process.env.EXPO_PUBLIC_ASL_API_URL?.trim();
  if (!value) {
    return null;
  }

  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export function isFingerspellingApiConfigured(): boolean {
  return Boolean(getApiBaseUrl());
}

export function getFingerspellingSetupInstructions(): string {
  return `Set ${FINGERSPELLING_API_ENV_KEY} to your backend URL. When using Expo Go on a physical phone, use your computer's LAN IP (for example http://192.168.1.25:8000), not localhost.`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidConfidence(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function normalizeConfidence(value: number): number {
  if (value > 1) {
    return Math.max(0, Math.min(1, value / 100));
  }

  return Math.max(0, Math.min(1, value));
}

function normalizeLetter(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return isValidASLLetter(normalized) ? normalized : null;
}

function getMimeType(imageUri: string): string {
  const normalizedUri = imageUri.toLowerCase();
  if (normalizedUri.endsWith('.png')) {
    return 'image/png';
  }

  if (normalizedUri.endsWith('.heic')) {
    return 'image/heic';
  }

  return 'image/jpeg';
}

function buildImageFormData(imageUri: string): FormData {
  const formData = new FormData();
  const fileName = imageUri.split('/').pop() || `capture-${Date.now()}.jpg`;

  formData.append('image', {
    uri: imageUri,
    name: fileName,
    type: getMimeType(imageUri),
  } as any);

  return formData;
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getBackendErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as DetectionBackendResponse;
    if (typeof payload.error === 'string' && payload.error.trim()) {
      return payload.error.trim();
    }
  } catch {
    // Ignore JSON parsing failures and fall back to a generic message.
  }

  return `Detection backend returned ${response.status}.`;
}

function parseDetectionResponse(payload: unknown): DetectionResult {
  if (!isRecord(payload)) {
    throw new Error('Detection backend returned an invalid response.');
  }

  const response = payload as DetectionBackendResponse;
  const backendError = typeof response.error === 'string' ? response.error.trim() : '';
  if (backendError) {
    return {
      detectedLetter: '?',
      confidence: 0,
      error: backendError,
    };
  }

  const detectedLetter =
    normalizeLetter(response.detectedLetter) ??
    normalizeLetter(response.letter) ??
    normalizeLetter(response.prediction);
  const confidenceValue = isValidConfidence(response.confidence)
    ? response.confidence
    : isValidConfidence(response.score)
      ? response.score
      : 0;

  if (!detectedLetter) {
    throw new Error('Detection backend did not return a valid ASL letter.');
  }

  return {
    detectedLetter,
    confidence: normalizeConfidence(confidenceValue),
  };
}

export async function prepareFingerspellingModel(): Promise<void> {
  return Promise.resolve();
}

export async function detectFingerspellingFromImage(
  imageUri: string
): Promise<DetectionResult> {
  try {
    if (!imageUri || typeof imageUri !== 'string' || !imageUri.startsWith('file://')) {
      return {
        detectedLetter: '?',
        confidence: 0,
        error: 'Invalid image URI.',
      };
    }

    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) {
      return {
        detectedLetter: '?',
        confidence: 0,
        error: getFingerspellingSetupInstructions(),
      };
    }

    const response = await fetchWithTimeout(`${apiBaseUrl}${PREDICT_ROUTE}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: buildImageFormData(imageUri),
    });

    if (!response.ok) {
      return {
        detectedLetter: '?',
        confidence: 0,
        error: await getBackendErrorMessage(response),
      };
    }

    const payload = await response.json();
    return parseDetectionResponse(payload);
  } catch (error) {
    const apiBaseUrl = getApiBaseUrl();

    if (error instanceof Error && error.name === 'AbortError') {
      return {
        detectedLetter: '?',
        confidence: 0,
        error: 'Detection request timed out. Check that your backend is running and reachable from Expo Go.',
      };
    }

    if (error instanceof TypeError && error.message === 'Network request failed') {
      return {
        detectedLetter: '?',
        confidence: 0,
        error: `Could not reach the detection backend at ${apiBaseUrl ?? 'the configured API URL'}. Make sure Uvicorn is still running, your phone and Mac are on the same network, and test ${apiBaseUrl ?? 'that URL'}/health from your phone browser.`,
      };
    }

    return {
      detectedLetter: '?',
      confidence: 0,
      error: error instanceof Error ? error.message : 'Detection failed.',
    };
  }
}

export function isValidASLLetter(letter: string): boolean {
  return /^[A-Z]$/.test(letter);
}

export function getConfidenceLevel(confidence: number): string {
  if (confidence >= 0.9) return 'Very High';
  if (confidence >= 0.75) return 'High';
  if (confidence >= 0.6) return 'Medium';
  if (confidence >= 0.4) return 'Low';
  return 'Very Low';
}

export async function detectFromMultipleFrames(
  imageUris: string[]
): Promise<DetectionResult[]> {
  return Promise.all(imageUris.map((imageUri) => detectFingerspellingFromImage(imageUri)));
}
