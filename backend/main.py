from __future__ import annotations

import os
from pathlib import Path
from typing import Annotated

import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from classifier import classify_static_letter


app = FastAPI(title='ASL Fingerspelling API')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

_hands = None
_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task'


def _default_model_path() -> Path:
    return Path(__file__).resolve().parent / 'models' / 'hand_landmarker.task'


def _build_missing_model_error(model_path: Path) -> str:
    return (
        f'Hand Landmarker model file not found at {model_path}. '
        f'Download the official MediaPipe model bundle from {_MODEL_URL} '
        'and save it to that path, or set MEDIAPIPE_HAND_MODEL_PATH to the file location.'
    )


def _create_hands_detector():
    if hasattr(mp, 'solutions'):
        return mp.solutions.hands.Hands(
            static_image_mode=True,
            max_num_hands=1,
            model_complexity=1,
            min_detection_confidence=0.55,
        )

    model_path = Path(
        os.environ.get('MEDIAPIPE_HAND_MODEL_PATH', str(_default_model_path()))
    ).expanduser()
    if not model_path.exists():
        raise RuntimeError(_build_missing_model_error(model_path))

    base_options = mp.tasks.BaseOptions(model_asset_path=str(model_path))
    options = mp.tasks.vision.HandLandmarkerOptions(
        base_options=base_options,
        running_mode=mp.tasks.vision.RunningMode.IMAGE,
        num_hands=1,
        min_hand_detection_confidence=0.55,
        min_hand_presence_confidence=0.55,
        min_tracking_confidence=0.55,
    )
    return mp.tasks.vision.HandLandmarker.create_from_options(options)


def _get_hands_detector():
    global _hands

    if _hands is None:
        _hands = _create_hands_detector()

    return _hands


def _extract_landmarks(rgb_image: np.ndarray):
    detector = _get_hands_detector()

    if hasattr(mp, 'solutions'):
        result = detector.process(rgb_image)
        return result.multi_hand_landmarks[0].landmark if result.multi_hand_landmarks else None

    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)
    result = detector.detect(mp_image)
    return result.hand_landmarks[0] if result.hand_landmarks else None


def _resize_for_detection(rgb_image: np.ndarray, max_dimension: int = 1280) -> np.ndarray:
    height, width = rgb_image.shape[:2]
    longest_edge = max(height, width)
    if longest_edge <= max_dimension:
        return rgb_image

    scale = max_dimension / longest_edge
    return cv2.resize(
        rgb_image,
        (max(1, int(width * scale)), max(1, int(height * scale))),
        interpolation=cv2.INTER_AREA,
    )


def _image_variants(rgb_image: np.ndarray) -> list[np.ndarray]:
    resized = _resize_for_detection(rgb_image)
    brighter = cv2.convertScaleAbs(resized, alpha=1.08, beta=10)
    higher_contrast = cv2.convertScaleAbs(resized, alpha=1.18, beta=-8)
    softened = cv2.GaussianBlur(resized, (3, 3), 0)

    return [
        resized,
        brighter,
        higher_contrast,
        softened,
    ]


def _extract_best_landmarks(rgb_image: np.ndarray):
    for variant in _image_variants(rgb_image):
        landmarks = _extract_landmarks(variant)
        if landmarks:
            return landmarks

    return None


@app.get('/health')
async def healthcheck() -> dict[str, str]:
    return {'status': 'ok'}


@app.post('/predict/fingerspelling')
async def predict_fingerspelling(
    image: Annotated[UploadFile, File(...)]
) -> dict[str, float | str]:
    raw_bytes = await image.read()
    if not raw_bytes:
        return {
            'detectedLetter': '?',
            'confidence': 0.0,
            'error': 'Uploaded image was empty.',
        }

    np_buffer = np.frombuffer(raw_bytes, dtype=np.uint8)
    bgr_image = cv2.imdecode(np_buffer, cv2.IMREAD_COLOR)
    if bgr_image is None:
        return {
            'detectedLetter': '?',
            'confidence': 0.0,
            'error': 'Image could not be decoded.',
        }

    rgb_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)
    try:
        landmarks = _extract_best_landmarks(rgb_image)
    except RuntimeError as error:
        return {
            'detectedLetter': '?',
            'confidence': 0.0,
            'error': str(error),
        }

    if not landmarks:
        return {
            'detectedLetter': '?',
            'confidence': 0.0,
            'error': 'No hand detected. Use a plain background and keep one hand fully inside the frame.',
        }

    prediction = classify_static_letter(landmarks)
    if prediction.error:
        return {
            'detectedLetter': '?',
            'confidence': prediction.confidence,
            'error': prediction.error,
        }

    return {
        'detectedLetter': prediction.letter,
        'confidence': prediction.confidence,
    }
