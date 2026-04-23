# ASL Fingerspelling Detector - Web App

A modern web application for detecting American Sign Language (ASL) fingerspelling with high accuracy using computer vision and machine learning.
Features I'm most proud of is the ASL -> English translation, as I was able to use computer vision and machine learning models to conduct image analysis. I like the two-way translation as well and hope to continue improving the project to implement new features. 


## Overview

This web app enables clear communication between Deaf and hearing individuals by recognizing fingerspelled letters in real-time. It uses:

- **MediaPipe Hand Landmarker** for precise hand landmark detection
- **TensorFlow.js** for running trained classifier models client-side
- **Next.js** for a modern, responsive web interface
- **CSS Modules** for component-scoped styling

## Key Features

- ✅ **Accurate Hand Detection**: Uses Google's MediaPipe Hand Landmarker for reliable hand tracking
- ✅ **Client-Side Processing**: All detection happens in your browser - no server uploads
- ✅ **Privacy-First**: Your images never leave your device
- ✅ **Fast**: Real-time processing with no API latency
- ✅ **Detection History**: Automatically saves detected letters
- ✅ **Responsive Design**: Works on desktop and mobile browsers

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Computer Vision**: MediaPipe Hand Landmarker
- **ML Framework**: TensorFlow.js
- **Styling**: CSS Modules with custom theme
- **Storage**: Browser localStorage

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Home Page**: Click "Start Detection" to navigate to the detection interface
2. **Upload Image**: Select or capture a photo of a hand showing a fingerspelled letter
3. **View Results**: The app displays:
   - Detected letter (A-Z)
   - Confidence level (0-100%)
   - Detection history
4. **Build History**: Keep uploading to build a sequence of letters

## Project Structure

```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Home page
└── asl-translation/
    └── page.tsx            # Detection page

components/
├── FileUpload.tsx          # Image upload component
├── DetectionResult.tsx     # Result display component
└── History.tsx             # Detection history display

lib/
├── handDetection.ts        # MediaPipe + TensorFlow.js integration
└── storage.ts              # localStorage utilities

styles/
├── globals.css             # Global styles
└── *.module.css            # Component-scoped styles
```

## Using a Custom Classifier Model

The app currently uses MediaPipe hand landmarks with a fallback classifier. To use a trained ASL classifier model:

1. **Export your trained model** to TensorFlow.js format:
   ```python
   # From your Python training script
   import tensorflow as tf
   model = tf.keras.models.load_model('your_model.h5')
   # Then use tf-to-js converter
   tensorflowjs_converter --input_format keras your_model.h5 ./web_model/
   ```

2. **Update the model loading** in `lib/handDetection.ts`:
   ```typescript
   const model = await tf.loadLayersModel(
     'file://./path/to/web_model/model.json'
   );
   ```

3. Ensure your model:
   - Takes 63 inputs (21 hand landmarks × 3 coordinates: x, y, z)
   - Outputs 26 classes (A-Z)
   - Uses softmax activation for output layer

## Building for Production

```bash
npm run build
npm start
```

The optimized build will be in `.next/`.

## Deployment

### Render
Deployed as web service on Render

### Other Platforms
The app is a static Next.js app that can be deployed anywhere:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any HTTP server

## Accuracy Notes

- Hand detection works best with:
  - Clear lighting
  - Hand positioned centrally
  - Clean background
  - Hand close to camera
  
- The classifier accuracy depends on:
  - Quality of training data
  - Consistency of hand position/scale
  - Confidence threshold settings

## Current Limitations

- Detects one letter per image
- Optimized for static poses (fingerspelling)
- Requires clear hand visibility
- English-focused (A-Z letters)

## Future Enhancements

- [ ] Real-time video detection
- [ ] Multi-handed detection
- [ ] Full word/sentence recognition
- [ ] English to ASL translation
- [ ] Performance optimizations
- [ ] Mobile app version
- [ ] Practice Features like flashcards, practice quizzes, sign of the day, etc.

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## Acknowledgments

- MediaPipe for hand landmark detection
- TensorFlow.js community
- Next.js team for the excellent framework
- Deaf community for inspiration and guidance

---

**Note**: This is a prototype for fingerspelling detection. For production use with full ASL recognition, additional training data, model refinement, and user testing with the Deaf community is recommended.
