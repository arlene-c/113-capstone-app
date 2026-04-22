import * as tf from '@tensorflow/tfjs';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const FEATURE_COUNT = 105;
const HAND_MODEL_PATH = '/models/hand_landmarker.task';
const MEDIAPIPE_WASM_ROOT =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm';
const DEFAULT_CLASSIFIER_PATH = '/models/asl_landmark_classifier.web.json';

type Landmark = {
  x: number;
  y: number;
  z: number;
};

type BrowserClassifierDefinition = {
  schemaVersion: number;
  featureCount: number;
  classLabels: string[];
  scaler: {
    mean: number[];
    scale: number[];
  };
  network: {
    activation: 'relu';
    outputActivation: 'softmax';
    layers: Array<{
      kernel: number[][];
      bias: number[];
    }>;
  };
};

type ClassifierModel = {
  definition: BrowserClassifierDefinition | null;
  model: tf.Sequential | null;
  ready: boolean;
  error?: string;
};

type HandDetectionResult = {
  landmarks?: Landmark[][];
};

export type DetectionResult = {
  detectedLetter: string;
  confidence: number;
  landmarks?: Landmark[];
  error?: string;
};

let handLandmarker: HandLandmarker | null = null;
let handLandmarkerPromise: Promise<void> | null = null;
let classifierModel: ClassifierModel = { definition: null, model: null, ready: false };
let classifierPromise: Promise<void> | null = null;

function assertBrowserEnvironment(): void {
  if (typeof window === 'undefined') {
    throw new Error('Hand detection is only available in the browser.');
  }
}

function distance3d(pointA: number[], pointB: number[]): number {
  const dx = pointA[0] - pointB[0];
  const dy = pointA[1] - pointB[1];
  const dz = pointA[2] - pointB[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function normalizeLandmarks(landmarks: Landmark[]): number[][] {
  if (landmarks.length !== 21) {
    throw new Error('Expected exactly 21 hand landmarks from MediaPipe.');
  }

  const wrist = landmarks[0];
  const translated = landmarks.map((landmark) => [
    landmark.x - wrist.x,
    landmark.y - wrist.y,
    landmark.z - wrist.z,
  ]);

  const palmSize = Math.max(
    distance3d(translated[0], translated[5]),
    distance3d(translated[0], translated[17]),
    distance3d(translated[5], translated[17]),
    1e-6
  );

  return translated.map((landmark) => landmark.map((value) => value / palmSize));
}

function extractLandmarkFeatures(landmarks: Landmark[]): number[] {
  const normalized = normalizeLandmarks(landmarks);
  const flattened = normalized.flat();
  const fingertips = [4, 8, 12, 16, 20].flatMap((index) => normalized[index]);
  const wristDistances = normalized.map((landmark) => distance3d(landmark, normalized[0]));
  const fingertipDistances = [
    distance3d(normalized[4], normalized[8]),
    distance3d(normalized[4], normalized[12]),
    distance3d(normalized[8], normalized[12]),
    distance3d(normalized[8], normalized[16]),
    distance3d(normalized[12], normalized[16]),
    distance3d(normalized[16], normalized[20]),
  ];

  return [...flattened, ...fingertips, ...wristDistances, ...fingertipDistances];
}

function standardizeFeatures(
  features: number[],
  definition: BrowserClassifierDefinition
): number[] {
  return features.map((value, index) => {
    const scale = definition.scaler.scale[index] || 1;
    return (value - definition.scaler.mean[index]) / scale;
  });
}

function buildClassifierModel(definition: BrowserClassifierDefinition): tf.Sequential {
  if (definition.featureCount !== FEATURE_COUNT) {
    throw new Error(
      `Unexpected classifier feature count: expected ${FEATURE_COUNT}, received ${definition.featureCount}.`
    );
  }

  const [firstLayer, secondLayer, outputLayer] = definition.network.layers;

  if (!firstLayer || !secondLayer || !outputLayer) {
    throw new Error('Classifier definition is missing one or more dense layers.');
  }

  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      inputShape: [definition.featureCount],
      units: firstLayer.bias.length,
      activation: definition.network.activation,
      useBias: true,
    })
  );
  model.add(
    tf.layers.dense({
      units: secondLayer.bias.length,
      activation: definition.network.activation,
      useBias: true,
    })
  );
  model.add(
    tf.layers.dense({
      units: outputLayer.bias.length,
      activation: definition.network.outputActivation,
      useBias: true,
    })
  );

  const weightTensors = definition.network.layers.flatMap((layer) => [
    tf.tensor2d(layer.kernel, undefined, 'float32'),
    tf.tensor1d(layer.bias, 'float32'),
  ]);

  try {
    model.setWeights(weightTensors);
  } finally {
    weightTensors.forEach((tensor) => tensor.dispose());
  }

  return model;
}

async function loadClassifierDefinition(
  modelUrl: string
): Promise<BrowserClassifierDefinition> {
  const response = await fetch(modelUrl, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error(`Failed to load the ASL classifier model from ${modelUrl}.`);
  }

  return (await response.json()) as BrowserClassifierDefinition;
}

function createResizedCanvas(
  image: HTMLImageElement,
  maxDimension = 1280
): HTMLCanvasElement {
  const longestEdge = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = longestEdge > maxDimension ? maxDimension / longestEdge : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not create an image processing canvas.');
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

function createFilteredCanvas(
  source: HTMLCanvasElement,
  filter: string
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Could not create an image filter canvas.');
  }

  canvas.width = source.width;
  canvas.height = source.height;
  context.filter = filter;
  context.drawImage(source, 0, 0);
  return canvas;
}

function buildDetectionVariants(image: HTMLImageElement): HTMLCanvasElement[] {
  const resized = createResizedCanvas(image);

  return [
    resized,
    createFilteredCanvas(resized, 'brightness(1.08)'),
    createFilteredCanvas(resized, 'contrast(1.18) brightness(0.98)'),
    createFilteredCanvas(resized, 'blur(1px)'),
  ];
}

async function loadImageElement(
  imageSource: string | HTMLImageElement | Blob
): Promise<{ image: HTMLImageElement; cleanup: () => void }> {
  if (imageSource instanceof HTMLImageElement) {
    return { image: imageSource, cleanup: () => undefined };
  }

  const image = new Image();
  image.crossOrigin = 'anonymous';
  let objectUrl: string | null = null;

  if (typeof imageSource === 'string') {
    image.src = imageSource;
  } else {
    objectUrl = URL.createObjectURL(imageSource);
    image.src = objectUrl;
  }

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Image could not be loaded for ASL detection.'));
  });

  return {
    image,
    cleanup: () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    },
  };
}

async function extractBestHandLandmarks(
  image: HTMLImageElement
): Promise<Landmark[] | null> {
  const variants = buildDetectionVariants(image);

  for (const variant of variants) {
    const result = await detectHandLandmarks(variant);
    if (result.landmarks?.length) {
      return result.landmarks[0];
    }
  }

  return null;
}

async function classifyLandmarks(landmarks: Landmark[]): Promise<{
  letter: string;
  confidence: number;
}> {
  if (!classifierModel.model || !classifierModel.definition) {
    throw new Error('ASL classifier model is not initialized.');
  }

  const features = extractLandmarkFeatures(landmarks);
  const standardizedFeatures = standardizeFeatures(features, classifierModel.definition);
  const output = tf.tidy(() => {
    const input = tf.tensor2d(
      [standardizedFeatures],
      [1, classifierModel.definition!.featureCount],
      'float32'
    );

    return classifierModel.model!.predict(input) as tf.Tensor;
  });

  try {
    const probabilities = Array.from(await output.data());
    let bestIndex = 0;

    for (let index = 1; index < probabilities.length; index += 1) {
      if (probabilities[index] > probabilities[bestIndex]) {
        bestIndex = index;
      }
    }

    return {
      letter: classifierModel.definition.classLabels[bestIndex] ?? '?',
      confidence: probabilities[bestIndex] ?? 0,
    };
  } finally {
    output.dispose();
  }
}

export async function initializeHandLandmarker(): Promise<void> {
  assertBrowserEnvironment();

  if (handLandmarker) {
    return;
  }

  if (!handLandmarkerPromise) {
    handLandmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_ROOT);

      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: HAND_MODEL_PATH,
        },
        runningMode: 'IMAGE',
        numHands: 1,
        minHandDetectionConfidence: 0.55,
        minHandPresenceConfidence: 0.55,
        minTrackingConfidence: 0.55,
      });
    })().catch((error) => {
      handLandmarkerPromise = null;
      console.error('Failed to initialize hand landmarker:', error);
      throw new Error('Failed to initialize the MediaPipe hand detector.');
    });
  }

  await handLandmarkerPromise;
}

export async function initializeClassifier(modelUrl = DEFAULT_CLASSIFIER_PATH): Promise<void> {
  assertBrowserEnvironment();

  if (classifierModel.ready) {
    return;
  }

  if (!classifierPromise) {
    classifierPromise = (async () => {
      const definition = await loadClassifierDefinition(modelUrl);
      const model = buildClassifierModel(definition);

      classifierModel = {
        definition,
        model,
        ready: true,
      };
    })().catch((error) => {
      classifierPromise = null;
      classifierModel = {
        definition: null,
        model: null,
        ready: false,
        error: error instanceof Error ? error.message : 'Classifier initialization failed.',
      };
      console.error('Failed to initialize classifier:', error);
      throw new Error('Failed to initialize the trained ASL classifier.');
    });
  }

  await classifierPromise;
}

export async function detectHandLandmarks(
  image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): Promise<HandDetectionResult> {
  if (!handLandmarker) {
    throw new Error('Hand landmarker not initialized.');
  }

  try {
    return handLandmarker.detect(image) as HandDetectionResult;
  } catch (error) {
    console.error('Hand detection error:', error);
    throw new Error('Failed to detect hand landmarks.');
  }
}

export async function detectFingerspellingFromImage(
  imageSource: string | HTMLImageElement | Blob
): Promise<DetectionResult> {
  try {
    await Promise.all([initializeHandLandmarker(), initializeClassifier()]);
    const { image, cleanup } = await loadImageElement(imageSource);

    try {
      const landmarks = await extractBestHandLandmarks(image);

      if (!landmarks) {
        return {
          detectedLetter: '?',
          confidence: 0,
          error:
            'No hand was detected. Use one visible hand, clear lighting, and keep the entire hand inside the frame.',
        };
      }

      const result = await classifyLandmarks(landmarks);

      return {
        detectedLetter: result.letter,
        confidence: Math.max(0, Math.min(1, result.confidence)),
        landmarks,
      };
    } finally {
      cleanup();
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown fingerspelling detection error.';
    console.error('Detection error:', errorMessage);

    return {
      detectedLetter: '?',
      confidence: 0,
      error: errorMessage,
    };
  }
}

export async function loadCustomClassifier(modelUrl: string): Promise<void> {
  classifierModel.model?.dispose();
  classifierModel = { definition: null, model: null, ready: false };
  classifierPromise = null;
  await initializeClassifier(modelUrl);
}

export function isHandDetectionReady(): boolean {
  return handLandmarker !== null;
}

export function isClassifierReady(): boolean {
  return classifierModel.ready;
}
