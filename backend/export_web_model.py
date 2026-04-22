from __future__ import annotations

import argparse
import json
from pathlib import Path

import joblib

from classifier import MODEL_METADATA_PATH, MODEL_PATH


DEFAULT_OUTPUT_PATH = (
    Path(__file__).resolve().parent.parent
    / 'public'
    / 'models'
    / 'asl_landmark_classifier.web.json'
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description='Export the trained ASL landmark classifier to a browser-friendly JSON format.'
    )
    parser.add_argument(
        '--model',
        type=Path,
        default=MODEL_PATH,
        help='Path to the joblib pipeline produced by train_classifier.py.',
    )
    parser.add_argument(
        '--metadata',
        type=Path,
        default=MODEL_METADATA_PATH,
        help='Path to the classifier metadata JSON file.',
    )
    parser.add_argument(
        '--output',
        type=Path,
        default=DEFAULT_OUTPUT_PATH,
        help='Where to write the exported browser model JSON.',
    )
    return parser.parse_args()


def _load_metadata(path: Path) -> dict:
    if not path.exists():
        return {}

    return json.loads(path.read_text())


def main() -> None:
    args = parse_args()
    pipeline = joblib.load(args.model)
    scaler = pipeline.named_steps['scaler']
    classifier = pipeline.named_steps['clf']
    metadata = _load_metadata(args.metadata)
    metrics = metadata.get('metrics', {})

    export_payload = {
        'schemaVersion': 1,
        'modelType': 'StandardScaler + MLPClassifier',
        'trainedAt': metadata.get('trained_at'),
        'datasetUrl': metadata.get('dataset_url'),
        'datasetLicense': metadata.get('dataset_license'),
        'featureCount': int(len(scaler.mean_)),
        'classLabels': [str(label) for label in classifier.classes_.tolist()],
        'scaler': {
            'mean': scaler.mean_.astype(float).tolist(),
            'scale': scaler.scale_.astype(float).tolist(),
        },
        'network': {
            'activation': classifier.activation,
            'outputActivation': classifier.out_activation_,
            'hiddenLayerSizes': list(classifier.hidden_layer_sizes),
            'layers': [
                {
                    'kernel': weights.astype(float).tolist(),
                    'bias': bias.astype(float).tolist(),
                }
                for weights, bias in zip(classifier.coefs_, classifier.intercepts_, strict=True)
            ],
        },
        'metrics': {
            'accuracy': metrics.get('accuracy'),
            'trainSamples': metrics.get('train_samples'),
            'testSamples': metrics.get('test_samples'),
        },
        'notes': metadata.get('notes', []),
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(export_payload))

    print(f'Exported browser model to {args.output}')


if __name__ == '__main__':
    main()
