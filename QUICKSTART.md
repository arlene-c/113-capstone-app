# Quick Start Guide - ASL Translation App

## Running the App

The development server is currently running. To test the app:

### Option 1: iOS Simulator
```bash
# Press 'i' in the terminal running npm start
# Or run:
npm run ios
```

### Option 2: Expo Go (Physical Device)
1. Install Expo Go from App Store
2. Open Expo Go app
3. Scan the QR code from the terminal output
4. App will load on your device

### Option 3: Web Browser (Limited Features)
```bash
# Press 'w' in the terminal
# Or run:
npm run web
```

## First Test Run

1. **Home Screen**: You'll see "ASL Translator" title with two feature cards
2. **ASL to English Button**: Click the pastel green button to enter translation mode
3. **Camera Screen**: You can tap "Take Picture" to test the camera
4. **Result Display**: After taking a photo, you'll see a detected letter with confidence

## File Overview

### Key Components
- **Home Screen** (`app/(tabs)/index.tsx`) - Main app entry point with feature buttons
- **ASL Translation** (`app/asl-translation.tsx`) - Translation screen with camera integration
- **Camera Component** (`components/camera-capture.tsx`) - Camera interface
- **Detection Display** (`components/detection-result.tsx`) - Shows detected letters

### Services
- **Detection Service** (`services/fingerspellingDetection.ts`) - ML detection logic (currently mock)
- **Theme** (`constants/theme.ts`) - Colors and fonts (pastel green palette)

## Current Status

✅ **App Structure**: Fully implemented
✅ **Navigation**: Working between screens
✅ **UI Design**: Matches specification (pastel green, clean, minimal)
✅ **Camera**: Integrated with permission handling
✅ **Data Persistence**: AsyncStorage for history
✅ **Error Handling**: Comprehensive error messages

⏳ **Future Work**: Real ML model integration

## Customization

### Change Colors
Edit `constants/theme.ts`:
```typescript
const pastelGreen = '#A8D5BA';
const darkGreen = '#6B9E7A';
```

### Adjust Text
- Home screen: `app/(tabs)/index.tsx` (search for `ThemedText`)
- Translation screen: `app/asl-translation.tsx` (search for `ThemedText`)

### Camera Settings
In `components/camera-capture.tsx`:
```typescript
const photo = await cameraRef.current.takePictureAsync({
  quality: 0.8,  // Adjust image quality
  base64: false, // Enable for processing
});
```

## Common Issues & Solutions

### "Camera permission denied"
- Go to Settings > Privacy > Camera
- Allow app access to camera

### App not updating after code changes
- Press 'r' in the terminal to reload
- Or press 'Ctrl+C' and run `npm start` again

### "Module not found" error
- Run `npm install`
- Check that file paths are correct
- Restart the dev server

### Performance issues
- Close other apps on the device
- Clear Expo cache: `npm start -- --clear`
- Restart device if needed

## Development Tips

1. **Use DevTools**: Press 'j' in terminal to open debugger
2. **View Logs**: All console.log output appears in terminal
3. **Reload App**: Press 'r' for hot reload
4. **Toggle Menu**: Press 'm' for additional options
5. **Clear Cache**: Run `npm start -- --clear`

## Testing Checklist

- [ ] App launches without errors
- [ ] Home screen displays correctly
- [ ] "ASL → English" button navigates properly
- [ ] Camera opens when requested
- [ ] Back button returns to home
- [ ] Detection history shows detected letters
- [ ] History clears when "Clear" is tapped
- [ ] App works in both light and dark mode
- [ ] All text is readable and properly styled

## Next Steps

1. **Real ML Integration**: See `ML_INTEGRATION_GUIDE.md`
2. **Training Data**: Collect images for letter recognition
3. **Model Selection**: Choose between TensorFlow.js or MediaPipe
4. **Testing**: Validate accuracy on diverse hand poses
5. **Optimization**: Improve performance and user experience

## Useful Commands

```bash
# Start development server
npm start

# Run linter
npm run lint

# Run iOS simulator
npm run ios

# Run Android
npm run android

# Run web
npm run web

# Clean cache and rebuild
npm start -- --clear
```

## Get Help

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **App Error**: Check terminal output for detailed error messages
- **Type Errors**: Run `npm run lint` to check TypeScript

## Need to Stop the Server?

Press `Ctrl+C` in the terminal window

---

**Ready to test?** Follow the instructions above to launch the app!
