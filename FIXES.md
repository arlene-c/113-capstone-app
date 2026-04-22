# Fixes Applied

## Package.json Corrections

### Issue: `tensorflow` and `tensorflow.js` packages don't exist on npm

**Fix**: Updated package.json to use correct TensorFlow.js npm package:

**Before (Incorrect)**:
```json
"dependencies": {
  "tensorflow": "^4.20.0",
  "tensorflow.js": "^4.20.0"
}
```

**After (Correct)**:
```json
"dependencies": {
  "@tensorflow/tfjs": "^4.20.0"
}
```

**Why**: 
- `tensorflow` is a Python package, not available on npm
- `tensorflow.js` is not the correct npm package name
- The correct npm package is `@tensorflow/tfjs` (scoped package)

## TensorFlow.js Converter Setup

### Issue: `tensorflowjs_converter` command not found

**Fix**: The converter is a Python tool that must be installed via pip:

```bash
pip install tensorflowjs
```

**Why**: 
- `tensorflowjs_converter` is a Python CLI tool
- It converts models from various formats (Keras, SavedModel, PyTorch, etc.) to TensorFlow.js format
- It's used during development to prepare your trained models for the web app
- It does NOT need to be run frequently - only when you train a new model

## Next Steps

1. **Clear npm cache and reinstall**:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Verify installation**:
```bash
npm list @tensorflow/tfjs
```

3. **When ready to integrate your trained model**:
```bash
# Train your ASL classifier (Python)
# Export it as SavedModel or HDF5

# Convert to TensorFlow.js (Python tool)
tensorflowjs_converter \
  --input_format=tf_saved_model \
  your_model_folder \
  ./public/models/asl_classifier
```

---

These are one-time setup issues and should be resolved now!
