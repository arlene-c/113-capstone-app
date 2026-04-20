from __future__ import annotations

import argparse
import json
import warnings
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from classifier import MODEL_METADATA_PATH, MODEL_PATH, extract_landmark_features


DATASET_URL = 'https://huggingface.co/datasets/sid220/asl-now-fingerspelling'
DATASET_LICENSE = 'MIT'


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='Train the ASL landmark classifier.')
    parser.add_argument(
        '--dataset-root',
        type=Path,
        default=Path('/tmp/asl-now-fingerspelling'),
        help='Directory containing A-Z folders of MediaPipe landmark JSON files.',
    )
    parser.add_argument(
        '--output-model',
        type=Path,
        default=MODEL_PATH,
        help='Where to save the trained classifier.',
    )
    parser.add_argument(
        '--output-metadata',
        type=Path,
        default=MODEL_METADATA_PATH,
        help='Where to save model metadata and evaluation metrics.',
    )
    return parser.parse_args()


def load_dataset(dataset_root: Path) -> tuple[np.ndarray, np.ndarray]:
    rows: list[np.ndarray] = []
    labels: list[str] = []

    label_dirs = sorted(
        path for path in dataset_root.iterdir() if path.is_dir() and len(path.name) == 1 and path.name.isalpha()
    )
    if not label_dirs:
        raise FileNotFoundError(f'No A-Z label folders found under {dataset_root}.')

    for letter_dir in label_dirs:
        for file_path in sorted(letter_dir.glob('*.json')):
            landmarks = json.loads(file_path.read_text())
            rows.append(extract_landmark_features(landmarks))
            labels.append(letter_dir.name.upper())

    return np.stack(rows), np.array(labels)


def build_pipeline() -> Pipeline:
    return Pipeline(
        [
            ('scaler', StandardScaler()),
            ('clf', MLPClassifier(hidden_layer_sizes=(256, 128), max_iter=500, random_state=42)),
        ]
    )


def train_and_evaluate(features: np.ndarray, labels: np.ndarray) -> tuple[Pipeline, dict]:
    train_x, test_x, train_y, test_y = train_test_split(
        features,
        labels,
        test_size=0.2,
        stratify=labels,
        random_state=42,
    )

    pipeline = build_pipeline()
    with warnings.catch_warnings():
        warnings.simplefilter('ignore', RuntimeWarning)
        pipeline.fit(train_x, train_y)
        predictions = pipeline.predict(test_x)
    metrics = {
        'accuracy': float(accuracy_score(test_y, predictions)),
        'classification_report': classification_report(test_y, predictions, output_dict=True, digits=3),
        'test_samples': int(len(test_y)),
        'train_samples': int(len(train_y)),
    }

    final_pipeline = build_pipeline()
    with warnings.catch_warnings():
        warnings.simplefilter('ignore', RuntimeWarning)
        final_pipeline.fit(features, labels)

    return final_pipeline, metrics


def main() -> None:
    args = parse_args()
    features, labels = load_dataset(args.dataset_root)
    label_counts = Counter(labels.tolist())
    model, metrics = train_and_evaluate(features, labels)

    args.output_model.parent.mkdir(parents=True, exist_ok=True)
    args.output_metadata.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, args.output_model)

    metadata = {
        'model_type': 'StandardScaler + MLPClassifier',
        'trained_at': datetime.now(timezone.utc).isoformat(),
        'dataset_root': str(args.dataset_root),
        'dataset_url': DATASET_URL,
        'dataset_license': DATASET_LICENSE,
        'sample_count': int(len(labels)),
        'class_count': int(len(label_counts)),
        'feature_count': int(features.shape[1]),
        'labels': sorted(label_counts),
        'label_counts': dict(sorted(label_counts.items())),
        'metrics': metrics,
        'notes': [
            'This is a static-image fingerspelling classifier trained on MediaPipe landmark JSON files.',
            'J and Z are still less semantically reliable from a single image because real ASL uses motion for those letters.',
        ],
    }
    args.output_metadata.write_text(json.dumps(metadata, indent=2))

    print(f'Saved model to {args.output_model}')
    print(f'Saved metadata to {args.output_metadata}')
    print(f"Held-out accuracy: {metrics['accuracy']:.4f}")


if __name__ == '__main__':
    main()
