# Migration Guide: Mobile App to Web App

## Summary of Changes

This project has been migrated from an Expo/React Native mobile app to a modern Next.js web application. This guide explains the key changes and how to work with the new structure.

## What Changed

### Framework & Technology

| Aspect | Before (Mobile) | After (Web) |
|--------|-----------------|------------|
| **Framework** | Expo + React Native | Next.js + React |
| **Language** | TypeScript | TypeScript |
| **Camera** | `expo-camera` | HTML5 `<input type="file">` |
| **Storage** | AsyncStorage | Browser localStorage |
| **Hand Detection** | MediaPipe + FastAPI Backend | MediaPipe Hand Landmarker (client-side) |
| **ML Framework** | Python scikit-learn | TensorFlow.js |
| **Backend API** | FastAPI (Python) | None (all client-side) |
| **Styling** | React Native StyleSheet | CSS Modules |
| **Navigation** | Expo Router | Next.js App Router |

### Architecture

**Before (Mobile):**
```
App (React Native)
  ↓
Camera/AsyncStorage
  ↓
FastAPI Backend
  ↓
Python Classifier
```

**After (Web):**
```
Next.js App (React)
  ↓
HTML5 File Upload / localStorage
  ↓
MediaPipe Hand Landmarker (Browser)
  ↓
TensorFlow.js Classifier (Browser)
```

## File Structure Changes

### Old Structure (Removed)
```
app/
├── _layout.tsx (Expo router)
├── asl-translation.tsx (mobile screen)
├── modal.tsx
└── (tabs)/ (tab navigation)

components/
├── camera-capture.tsx (Expo camera)
├── detection-result.tsx (React Native)
├── themed-text.tsx (React Native)
└── ui/ (React Native UI)

services/
└── fingerspellingDetection.ts (API client)

hooks/
├── use-color-scheme.ts
└── use-theme-color.ts

constants/
└── theme.ts (React Native colors)

backend/ (Python - optional)
├── main.py
├── classifier.py
└── models/

assets/
└── images/

Expo config files:
├── app.json
├── eas.json
├── expo-env.d.ts
└── expo-router.config.js
```

### New Structure

```
app/
├── layout.tsx (Next.js root)
├── page.tsx (home page)
└── asl-translation/
    └── page.tsx (detection page)

components/
├── FileUpload.tsx (web component)
├── DetectionResult.tsx (web component)
└── History.tsx (web component)

lib/
├── handDetection.ts (MediaPipe + TensorFlow.js)
└── storage.ts (localStorage utilities)

styles/
├── globals.css (global styles)
└── *.module.css (component styles)

public/
└── models/ (TensorFlow.js models)

New config files:
├── next.config.js
├── tsconfig.json
├── .eslintrc.json
└── .gitignore
```

## API & Backend Changes

### Removed
- ❌ FastAPI backend server
- ❌ `@mediapipe/hands` (older API)
- ❌ Async API calls to `/predict/fingerspelling`
- ❌ Environment variables for API URL

### Added
- ✅ MediaPipe Hand Landmarker (modern, more accurate)
- ✅ TensorFlow.js for client-side inference
- ✅ Local model loading (no API latency)
- ✅ Browser localStorage for history

### Backend Files (Optional)

The Python backend files remain for reference:
```
backend/
├── main.py
├── classifier.py
├── train_classifier.py
└── models/
```

These are **not used** by the web app but can be used to:
- Train and convert classifiers to TensorFlow.js
- Reference the original Python implementation
- Run benchmarks

## Code Migration Examples

### Detecting Fingerspelling

**Before (Mobile):**
```typescript
import { detectFingerspellingFromImage } from '@/services/fingerspellingDetection';

const result = await detectFingerspellingFromImage(imageUri);
// Made API call to backend
```

**After (Web):**
```typescript
import { detectFingerspellingFromImage } from '@/lib/handDetection';

const result = await detectFingerspellingFromImage(imageUrl);
// Runs MediaPipe + classifier in browser
```

### Saving History

**Before (Mobile):**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.setItem('key', JSON.stringify(data));
```

**After (Web):**
```typescript
import { saveToHistory } from '@/lib/storage';

saveToHistory(letter, confidence);
```

### Camera Input

**Before (Mobile):**
```typescript
import { CameraView } from 'expo-camera';

<CameraView ref={cameraRef} />
await cameraRef.current.takePictureAsync();
```

**After (Web):**
```typescript
<input type="file" accept="image/*" onChange={handleFileSelect} />
```

### Styling

**Before (Mobile):**
```typescript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 }
});
```

**After (Web):**
```css
/* FileUpload.module.css */
.container {
  display: flex;
  padding: var(--spacing-md);
}
```

## Dependency Changes

### Removed Dependencies

```json
{
  "expo": "~54.0.0",
  "expo-camera": "~17.0.0",
  "expo-router": "~6.0.0",
  "react-native": "0.81.5",
  "react-native-web": "~0.21.0",
  "@react-navigation/*": "^7.x",
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@mediapipe/hands": "^0.4.x",
  "@mediapipe/camera_utils": "^0.3.x"
}
```

### Added Dependencies

```json
{
  "next": "^15.0.0",
  "@mediapipe/tasks-vision": "^0.10.8",
  "tensorflow": "^4.20.0",
  "tensorflow.js": "^4.20.0"
}
```

## Running the Web App

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser
# http://localhost:3000
```

### Production Build

```bash
# Build
npm run build

# Start server
npm start

# Deploy (see DEPLOYMENT.md)
```

## Key Improvements

### ✅ Advantages

1. **Better Performance**
   - No server latency
   - All processing in browser
   - Faster inference

2. **Better Privacy**
   - Images never leave device
   - No API logs
   - Full user control

3. **Easier Deployment**
   - Deploy to any static host
   - No backend server needed
   - Simpler DevOps

4. **Better Accuracy**
   - Modern MediaPipe Hand Landmarker
   - Can use better trained classifiers
   - Customizable confidence thresholds

5. **Better UX**
   - Works offline
   - Faster feedback
   - Better error handling

### ⚠️ Trade-offs

1. **Browser Compatibility**
   - Requires modern browser
   - WebAssembly support needed
   - Not compatible with IE11

2. **Model Size**
   - Initial load ~10-15MB (models)
   - Cached after first load
   - May be slower on 3G networks

3. **Memory Usage**
   - Higher RAM on client
   - Large models consume memory
   - Mobile devices may struggle with large models

## Troubleshooting Migration Issues

### Issue: Old files still present

```bash
# Clean old files
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Issue: ESLint errors

```bash
# Use Next.js linter
npm run lint
```

### Issue: Type errors

```bash
# Rebuild TypeScript
npm run build
```

## Next Steps

1. **Train your classifier** using the backend code as reference
2. **Convert to TensorFlow.js** (see ML_INTEGRATION.md)
3. **Integrate custom model** into the web app
4. **Test thoroughly** with diverse hand images
5. **Deploy** to your hosting platform

## Questions?

- See README.md for overview
- See ML_INTEGRATION.md for model integration
- See DEPLOYMENT.md for deployment options
- See SPEC.md for project requirements

## Rollback

To revert to the mobile version:
- Restore from git history
- Original Expo app structure in git commit history
- All original files are preserved there

---

**Status**: Web app migration complete ✅
**Date**: April 21, 2026
**Framework**: Next.js 15 with React 19
