# Machine Learning Model Integration Guide

## Overview

This guide explains how to integrate a trained ASL classifier model with the hand detection pipeline.

## Current Architecture

The app uses a two-stage pipeline:

1. **Hand Detection**: MediaPipe Hand Landmarker
   - Detects hand positions
   - Extracts 21 hand landmarks (3D coordinates: x, y, z)
   - Outputs 63 values per hand (21 landmarks × 3 coordinates)

2. **Fingerspelling Classification**: Your custom model
   - Takes 63 landmark values as input
   - Predicts one of 26 letters (A-Z)
   - Returns confidence scores (0-1)

## Converting Your Model to TensorFlow.js

### From Python Keras Model

1. **Export as SavedModel:**
```python
import tensorflow as tf

# Load your trained model
model = tf.keras.models.load_model('asl_classifier.h5')

# Save as SavedModel format
model.save('asl_classifier_saved_model', save_format='tf')
```

2. **Install TensorFlow.js converter:**
```bash
pip install tensorflowjs
```

3. **Convert to TensorFlow.js:**
```bash
tensorflowjs_converter \
  --input_format=tf_saved_model \
  asl_classifier_saved_model \
  ./public/models/asl_classifier
```

This creates:
- `model.json` - Model architecture
- `group*.bin` - Model weights (split into chunks)

### From Keras HDF5 Model

```bash
tensorflowjs_converter \
  --input_format=keras \
  asl_classifier.h5 \
  ./public/models/asl_classifier
```

### From PyTorch Model

```bash
# Install PyTorch converters
pip install tf2onnx onnx2tf

# Convert PyTorch → ONNX → TensorFlow.js
# (More steps, see ONNX conversion guides)
```

## Model Requirements

Your trained model must meet these specifications:

### Input Specification
- **Shape**: `(batch_size, 63)`
- **Type**: Float32
- **Values**: Normalized landmarks from MediaPipe (typically 0-1 range)
  - 21 landmarks × 3 coordinates (x, y, z)
  - Coordinates should be relative to hand bounding box

### Output Specification
- **Shape**: `(batch_size, 26)`
- **Type**: Float32
- **Activation**: Softmax
- **Classes**: 26 (A-Z in order)
  - Index 0 = 'A'
  - Index 1 = 'B'
  - ...
  - Index 25 = 'Z'

### Model Size
- Recommended: < 5MB (for fast loading)
- Maximum: < 50MB (to fit in memory)

## Integration Steps

### Step 1: Place Model Files

Copy your converted model files to the public directory:

```bash
# Your files should be at:
# /public/models/asl_classifier/model.json
# /public/models/asl_classifier/group*.bin
```

Or use a CDN:
```bash
# Upload to your server and update paths
```

### Step 2: Update Hand Detection Service

Modify `lib/handDetection.ts`:

#### Option A: Load from Local Files

```typescript
export async function loadCustomClassifier(modelPath: string): Promise<void> {
  try {
    const model = await tf.loadLayersModel(
      `file://${modelPath}/model.json`
    );
    classifierModel.model = model;
    classifierModel.ready = true;
    console.log('Custom classifier loaded successfully');
  } catch (error) {
    console.error('Failed to load custom classifier:', error);
    throw new Error('Failed to load custom classifier model');
  }
}
```

#### Option B: Load from CDN/Server

```typescript
export async function loadCustomClassifier(modelUrl: string): Promise<void> {
  try {
    const model = await tf.loadLayersModel(modelUrl);
    classifierModel.model = model;
    classifierModel.ready = true;
    console.log('Custom classifier loaded successfully');
  } catch (error) {
    console.error('Failed to load custom classifier:', error);
    throw new Error('Failed to load custom classifier model');
  }
}
```

#### Option C: Auto-load on Initialization

Replace the classifier initialization in `initializeClassifier()`:

```typescript
export async function initializeClassifier(): Promise<void> {
  if (classifierModel.ready) return;

  try {
    // Load your custom model
    const model = await tf.loadLayersModel(
      '/models/asl_classifier/model.json'
    );
    classifierModel.model = model;
    classifierModel.ready = true;
    console.log('ASL Classifier loaded successfully');
  } catch (error) {
    console.warn('Could not load classifier model:', error);
    console.warn('Using fallback letter detection based on hand landmarks');
    classifierModel.ready = true; // Fallback mode
  }
}
```

### Step 3: Update ASL Translation Page

In `app/asl-translation/page.tsx`, ensure the classifier is initialized:

```typescript
useEffect(() => {
  // Initialize hand detection and classifier on page load
  const initializeModels = async () => {
    try {
      await Promise.all([
        initializeHandLandmarker(),
        initializeClassifier(),
      ]);
    } catch (error) {
      console.error('Failed to initialize models:', error);
      setError('Failed to load detection models');
    }
  };

  initializeModels();
}, []);
```

## Model Training Recommendations

### Data Preparation

1. **Hand Landmarks**: Extract using MediaPipe
```python
import mediapipe as mp

mp_hands = mp.solutions.hands.Hands()
landmarks = mp_hands.process(frame).hand_landmarks
# Convert to your format
```

2. **Normalization**: Important for consistency
```python
# Normalize by hand size
hand_size = max(
    max(l.x for l in landmarks) - min(l.x for l in landmarks),
    max(l.y for l in landmarks) - min(l.y for l in landmarks)
)
normalized = [[l.x/hand_size, l.y/hand_size, l.z/hand_size] 
              for l in landmarks]
```

### Model Architecture

Recommended architecture:

```python
import tensorflow as tf

model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, activation='relu', input_shape=(63,)),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(26, activation='softmax'),
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)
```

### Training

```python
# Train with your data
model.fit(X_train, y_train, epochs=100, batch_size=32, 
          validation_split=0.2)

# Evaluate
model.evaluate(X_test, y_test)
```

### Testing with Different Hand Orientations

Your training data should include:
- Different lighting conditions
- Various hand sizes
- Different orientations (rotated hands)
- Different backgrounds
- Left and right hands

## Fallback Behavior

The app includes a fallback classifier when no trained model is available:

- Uses hand landmark heuristics
- Provides basic letter detection
- Has lower accuracy than trained models
- Useful for testing without a trained model

The fallback can be improved by:
1. Training your model
2. Following integration steps above
3. Testing on diverse data

## Confidence Threshold Tuning

Adjust confidence threshold in `app/asl-translation/page.tsx`:

```typescript
const CONFIDENCE_THRESHOLD = 0.6; // Adjust: 0.5 (more lenient) to 0.8 (strict)

// Only save if confident enough
if (result.confidence >= CONFIDENCE_THRESHOLD) {
  saveToHistory(result.detectedLetter, result.confidence);
}
```

Lower threshold = More detections but less accurate
Higher threshold = Fewer detections but more accurate

## Debugging Model Performance

### Enable Logging

```typescript
// In lib/handDetection.ts
export async function detectFingerspellingFromImage(...) {
  // ... detection code ...
  
  // Log all predictions
  const output = classifierModel.model.predict(input) as any;
  const predictions = await output.data();
  console.log('Raw predictions:', predictions);
  console.log('Top 3:', 
    Array.from(predictions)
      .map((v, i) => ({ letter: ASL_LETTERS[i], score: v }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  );
}
```

### Test with Sample Data

```typescript
// Test with known landmarks
const testLandmarks = [...]; // Your test data
const input = tf.tensor2d([testLandmarks.flatMap(l => [l.x, l.y, l.z])]);
const output = classifierModel.model.predict(input) as any;
output.data().then(predictions => console.log(predictions));
```

## Performance Optimization

### Model Quantization

Reduce model size and improve inference speed:

```python
# During conversion
tensorflowjs_converter \
  --quantize_uint8 \
  model_saved/ \
  ./public/models/asl_classifier
```

### Using Lighter Models

Consider:
- MobileNetV2 as feature extractor
- Smaller dense layers (32 neurons instead of 128)
- Pruning less important weights

## Monitoring in Production

Track model performance:

```typescript
// Track prediction confidence
if (result.confidence < 0.5) {
  console.warn('Low confidence prediction:', result);
  // Send to analytics
}
```

## Model Updates

To update your model:

1. Train and validate new model
2. Convert to TensorFlow.js
3. Place in `/public/models/`
4. Clear browser cache
5. Test thoroughly before deployment

## Resources

- **MediaPipe Hand Docs**: https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
- **TensorFlow.js Converter**: https://github.com/tensorflow/tfjs/tree/master/tfjs-converter
- **TensorFlow.js Docs**: https://www.tensorflow.org/js/guide
- **Model Format Specs**: https://www.tensorflow.org/js/guide/save_load

## Support

For ML integration issues:
1. Check TensorFlow.js console for errors
2. Verify model.json and .bin files are accessible
3. Ensure input shapes match (63 values)
4. Test model with TensorFlow.js test examples
