# ASL Fingerspelling Backend

This backend is the Expo Go-compatible part of the stack. The phone captures a photo with `expo-camera`, uploads it to this API, and the API runs MediaPipe hand landmark detection plus a starter static-letter classifier.

## What It Supports

- One-hand, single-photo fingerspelling
- Static letters only
- Best starter coverage: `A`, `B`, `C`, `D`, `F`, `I`, `L`, `O`, `S`, `U`, `V`, `W`, `Y`

`J` and `Z` are intentionally out of scope here because they require motion and should be handled in the future video pipeline.

## Run It Locally

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
mkdir -p models
# Download the model bundle from:
# https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task
# and save it as backend/models/hand_landmarker.task
uvicorn main:app --host 0.0.0.0 --port 8000
```

Verify the server:

```bash
curl http://127.0.0.1:8000/health
```

If you keep the model somewhere else, set `MEDIAPIPE_HAND_MODEL_PATH` before starting Uvicorn.

## Connect Expo Go

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_ASL_API_URL` to your computer's LAN IP, for example `http://192.168.1.25:8000`.
3. Restart `npx expo start`.
4. Open the app in Expo Go on the same Wi-Fi network.

Do not use `localhost` when the app runs on your phone. `localhost` points to the phone itself, not your Mac.

## Next Upgrade

This starter already analyzes the actual hand image, but it is still a rule-based classifier on top of MediaPipe landmarks. When you are ready for higher accuracy, replace `classify_static_letter()` in `classifier.py` with a trained classifier that consumes the landmarks or the cropped hand image.
