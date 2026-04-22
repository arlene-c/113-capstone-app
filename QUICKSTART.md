# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Using the App

1. **Home Page**: Read about the app and features
2. **Click "Start Detection"**: Go to the detection page
3. **Upload Image**: Select a photo of a hand showing fingerspelling
4. **View Result**: See the detected letter and confidence
5. **Build History**: Upload more images to build a sequence

## 🎯 Features

✅ Detects ASL fingerspelling letters (A-Z)
✅ Shows confidence levels
✅ Saves detection history
✅ Works completely offline
✅ Private (no data sent to server)

## 📊 What's Inside

- **Frontend**: Next.js + React + TypeScript
- **Detection**: MediaPipe Hand Landmarker
- **Classification**: TensorFlow.js (placeholder, ready for custom model)
- **Storage**: Browser localStorage
- **Styling**: CSS Modules

## 🔧 Project Structure

```
app/                          # Next.js pages
├── page.tsx                  # Home page
└── asl-translation/page.tsx # Detection page

components/                   # React components
├── FileUpload.tsx
├── DetectionResult.tsx
└── History.tsx

lib/                          # Core logic
├── handDetection.ts          # MediaPipe + TensorFlow.js
└── storage.ts                # localStorage management

styles/                       # CSS modules
└── *.module.css
```

## 📚 Next Steps

1. **Read the full README**: See [README.md](README.md)
2. **Integrate custom model**: See [ML_INTEGRATION.md](ML_INTEGRATION.md)
3. **Deploy to production**: See [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Understand changes**: See [MIGRATION.md](MIGRATION.md)

## 🆘 Common Issues

### Issue: Blank page
- Open browser console (F12)
- Check for errors
- Try clearing cache: Ctrl+Shift+R

### Issue: Camera/permissions not working
- This web app uses file upload, not camera
- Upload image files directly

### Issue: Models not loading
- Check Network tab in DevTools
- Verify internet connection
- MediaPipe models load from CDN

## 🚢 Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

## 🎓 Learning Resources

- **Next.js**: https://nextjs.org/docs
- **MediaPipe**: https://developers.google.com/mediapipe
- **TensorFlow.js**: https://www.tensorflow.org/js
- **React**: https://react.dev

## ✨ Tips

- Use clear, well-lit photos for best results
- Position hand in center of image
- Try different letter angles if detection fails
- Check detection history to track progress

## 📞 Support

- For bugs: Check console (F12) for error messages
- For questions: See README.md and documentation
- For ML integration: See ML_INTEGRATION.md

---

**Happy detecting! 🤟**
