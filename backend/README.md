# ASL Fingerspelling Backend

This backend is the Expo Go-compatible part of the stack. The phone captures a photo with `expo-camera`, uploads it to this API, and the API runs MediaPipe hand landmark detection plus a trained landmark classifier.

## What It Supports

- One-hand, single-photo fingerspelling
- Static letters only
- The classifier will return `A-Z`, but `J` and `Z` are still less semantically reliable from a single image because real ASL uses motion for those letters

If the trained classifier artifact is missing, the backend falls back to a heuristic landmark classifier so the API still works.

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

## Train The Letter Classifier

This project can train its own letter classifier from public MediaPipe landmark samples.

Dataset used:
- [sid220/asl-now-fingerspelling](https://huggingface.co/datasets/sid220/asl-now-fingerspelling)

Example flow:

```bash
git clone --depth 1 https://huggingface.co/datasets/sid220/asl-now-fingerspelling /tmp/asl-now-fingerspelling
source venv/bin/activate
python train_classifier.py --dataset-root /tmp/asl-now-fingerspelling
```

That writes:
- `backend/models/asl_landmark_classifier.joblib`
- `backend/models/asl_landmark_classifier.json`

## Connect Expo Go

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_ASL_API_URL` to your computer's LAN IP, for example `http://192.168.1.25:8000`.
3. Restart `npx expo start`.
4. Open the app in Expo Go on the same Wi-Fi network.

Do not use `localhost` when the app runs on your phone. `localhost` points to the phone itself, not your Mac.

## Next Upgrade

The current version already uses a trained classifier. The next upgrade from here would be collecting more real phone-captured data from your app and fine-tuning on those landmarks or cropped hand images.
