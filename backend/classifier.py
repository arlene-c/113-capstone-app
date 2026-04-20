from __future__ import annotations

from dataclasses import dataclass
from math import sqrt
from pathlib import Path
from typing import Sequence
import warnings

import joblib
import numpy as np


MODEL_PATH = Path(__file__).resolve().parent / 'models' / 'asl_landmark_classifier.joblib'
MODEL_METADATA_PATH = Path(__file__).resolve().parent / 'models' / 'asl_landmark_classifier.json'


@dataclass
class Prediction:
    letter: str
    confidence: float
    error: str | None = None


@dataclass
class _Point:
    x: float
    y: float
    z: float = 0.0


_trained_model = None
_load_attempted = False


def _distance(point_a, point_b) -> float:
    dx = point_a.x - point_b.x
    dy = point_a.y - point_b.y
    dz = getattr(point_a, 'z', 0.0) - getattr(point_b, 'z', 0.0)
    return sqrt(dx * dx + dy * dy + dz * dz)


def _point_to_array(point) -> np.ndarray:
    if isinstance(point, dict):
        return np.array(
            [float(point['x']), float(point['y']), float(point.get('z', 0.0))],
            dtype=np.float64,
        )

    return np.array(
        [float(point.x), float(point.y), float(getattr(point, 'z', 0.0))],
        dtype=np.float64,
    )


def landmarks_to_array(landmarks: Sequence) -> np.ndarray:
    if len(landmarks) != 21:
        raise ValueError('Expected 21 hand landmarks.')

    return np.stack([_point_to_array(point) for point in landmarks])


def _palm_size_from_array(landmarks: np.ndarray) -> float:
    def distance(index_a: int, index_b: int) -> float:
        return float(np.linalg.norm(landmarks[index_a] - landmarks[index_b]))

    return max(distance(0, 5), distance(0, 17), distance(5, 17), 1e-6)


def normalized_landmarks(landmarks: Sequence) -> np.ndarray:
    array = landmarks_to_array(landmarks)
    array = array - array[0]
    return array / _palm_size_from_array(array)


def extract_landmark_features(landmarks: Sequence) -> np.ndarray:
    array = normalized_landmarks(landmarks)

    flattened = array.flatten()
    fingertips = array[[4, 8, 12, 16, 20]].flatten()
    wrist_distances = np.linalg.norm(array - array[0], axis=1)
    fingertip_distances = np.array(
        [
            np.linalg.norm(array[4] - array[8]),
            np.linalg.norm(array[4] - array[12]),
            np.linalg.norm(array[8] - array[12]),
            np.linalg.norm(array[8] - array[16]),
            np.linalg.norm(array[12] - array[16]),
            np.linalg.norm(array[16] - array[20]),
        ],
        dtype=np.float64,
    )

    return np.concatenate([flattened, fingertips, wrist_distances, fingertip_distances])


def _load_trained_model():
    global _trained_model, _load_attempted

    if _load_attempted:
        return _trained_model

    _load_attempted = True
    if not MODEL_PATH.exists():
        _trained_model = None
        return None

    _trained_model = joblib.load(MODEL_PATH)
    return _trained_model


def get_trained_model_status() -> tuple[bool, str]:
    if MODEL_PATH.exists():
        return True, f'Trained classifier found at {MODEL_PATH}.'

    return (
        False,
        f'Trained classifier not found at {MODEL_PATH}. Run train_classifier.py to create it.',
    )


def classify_with_trained_model(landmarks: Sequence) -> Prediction | None:
    model = _load_trained_model()
    if model is None:
        return None

    features = extract_landmark_features(landmarks).reshape(1, -1)
    with warnings.catch_warnings():
        warnings.simplefilter('ignore', RuntimeWarning)
        probabilities = model.predict_proba(features)[0]
    classes = getattr(model, 'classes_', None)
    if classes is None:
        classes = model.named_steps['clf'].classes_

    best_index = int(np.argmax(probabilities))
    return Prediction(
        letter=str(classes[best_index]),
        confidence=float(probabilities[best_index]),
    )


def _palm_size(landmarks: Sequence) -> float:
    return max(
        _distance(landmarks[0], landmarks[5]),
        _distance(landmarks[0], landmarks[17]),
        _distance(landmarks[5], landmarks[17]),
        1e-6,
    )


def _palm_center(landmarks: Sequence) -> _Point:
    anchor_indices = (0, 5, 9, 13, 17)
    return _Point(
        x=sum(landmarks[index].x for index in anchor_indices) / len(anchor_indices),
        y=sum(landmarks[index].y for index in anchor_indices) / len(anchor_indices),
        z=sum(getattr(landmarks[index], 'z', 0.0) for index in anchor_indices) / len(anchor_indices),
    )


def _chain_length(landmarks: Sequence, indices: tuple[int, int, int, int]) -> float:
    a, b, c, d = indices
    return (
        _distance(landmarks[a], landmarks[b])
        + _distance(landmarks[b], landmarks[c])
        + _distance(landmarks[c], landmarks[d])
        + 1e-6
    )


def _straightness_ratio(landmarks: Sequence, indices: tuple[int, int, int, int]) -> float:
    start, _, _, tip = indices
    return _distance(landmarks[start], landmarks[tip]) / _chain_length(landmarks, indices)


def _normalized_distance(point_a, point_b, scale: float) -> float:
    return _distance(point_a, point_b) / max(scale, 1e-6)


def _avg(values: Sequence[float]) -> float:
    return sum(values) / len(values)


def heuristic_classify_static_letter(landmarks: Sequence) -> Prediction:
    if len(landmarks) != 21:
        return Prediction(letter='?', confidence=0.0, error='Invalid hand landmark data.')

    palm_size = _palm_size(landmarks)
    palm_center = _palm_center(landmarks)

    thumb_ratio = _straightness_ratio(landmarks, (1, 2, 3, 4))
    index_ratio = _straightness_ratio(landmarks, (5, 6, 7, 8))
    middle_ratio = _straightness_ratio(landmarks, (9, 10, 11, 12))
    ring_ratio = _straightness_ratio(landmarks, (13, 14, 15, 16))
    pinky_ratio = _straightness_ratio(landmarks, (17, 18, 19, 20))

    index_up = index_ratio > 0.76
    middle_up = middle_ratio > 0.76
    ring_up = ring_ratio > 0.76
    pinky_up = pinky_ratio > 0.76
    curled_fingers = sum(ratio < 0.7 for ratio in (index_ratio, middle_ratio, ring_ratio, pinky_ratio))

    thumb_index_gap = _normalized_distance(landmarks[4], landmarks[8], palm_size)
    thumb_middle_gap = _normalized_distance(landmarks[4], landmarks[12], palm_size)
    thumb_to_palm = _normalized_distance(landmarks[4], palm_center, palm_size)
    thumb_to_index_base = _normalized_distance(landmarks[4], landmarks[5], palm_size)
    index_middle_gap = _normalized_distance(landmarks[8], landmarks[12], palm_size)
    avg_finger_ratio = _avg((index_ratio, middle_ratio, ring_ratio, pinky_ratio))

    thumb_out = thumb_to_index_base > 0.5 or thumb_to_palm > 0.62 or thumb_ratio > 0.72

    if middle_up and ring_up and pinky_up and index_ratio < 0.74 and thumb_index_gap < 0.42:
        return Prediction(letter='F', confidence=0.82)

    if index_up and middle_up and ring_up and pinky_up and not thumb_out:
        return Prediction(letter='B', confidence=0.84)

    if 0.58 <= avg_finger_ratio <= 0.83:
        if thumb_index_gap < 0.38 and thumb_middle_gap < 0.52:
            return Prediction(letter='O', confidence=0.78)
        if thumb_index_gap > 0.52:
            return Prediction(letter='C', confidence=0.72)

    if index_up and not middle_up and not ring_up and not pinky_up:
        if thumb_out and thumb_index_gap > 0.72:
            return Prediction(letter='L', confidence=0.88)
        return Prediction(letter='D', confidence=0.76)

    if index_up and middle_up and not ring_up and not pinky_up:
        if index_middle_gap > 0.46:
            return Prediction(letter='V', confidence=0.84)
        return Prediction(letter='U', confidence=0.76)

    if index_up and middle_up and ring_up and not pinky_up:
        return Prediction(letter='W', confidence=0.79)

    if pinky_up and not index_up and not middle_up and not ring_up:
        if thumb_out:
            return Prediction(letter='Y', confidence=0.85)
        return Prediction(letter='I', confidence=0.8)

    if curled_fingers >= 3 and not index_up and not middle_up and not ring_up and not pinky_up:
        if thumb_out and thumb_to_index_base > 0.55:
            return Prediction(letter='A', confidence=0.72)
        if thumb_index_gap < 0.32 and thumb_middle_gap < 0.4:
            return Prediction(letter='E', confidence=0.64)
        return Prediction(letter='S', confidence=0.68)

    if index_up and middle_up and not ring_up and not pinky_up and thumb_out and thumb_middle_gap > 0.75:
        return Prediction(letter='K', confidence=0.62)

    if index_up and not middle_up and not ring_up and not pinky_up and thumb_out and thumb_index_gap < 0.52:
        return Prediction(letter='G', confidence=0.58)

    if index_up and middle_up and ring_up and pinky_up:
        return Prediction(letter='B' if not thumb_out else 'C', confidence=0.55)

    if index_up and middle_up:
        return Prediction(letter='V' if index_middle_gap > 0.4 else 'U', confidence=0.53)

    if index_up:
        return Prediction(letter='L' if thumb_out else 'D', confidence=0.52)

    if pinky_up:
        return Prediction(letter='Y' if thumb_out else 'I', confidence=0.52)

    if curled_fingers >= 3:
        return Prediction(letter='A' if thumb_out else 'S', confidence=0.5)

    return Prediction(
        letter='?',
        confidence=0.0,
        error='A hand was detected, but the pose does not yet match a supported static fingerspelling letter confidently.',
    )


def classify_static_letter(landmarks: Sequence) -> Prediction:
    model_prediction = classify_with_trained_model(landmarks)
    if model_prediction is not None:
        return model_prediction

    return heuristic_classify_static_letter(landmarks)
