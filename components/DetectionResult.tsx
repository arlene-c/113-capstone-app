'use client';

import styles from '@/styles/DetectionResult.module.css';

interface DetectionResultProps {
  letter: string;
  confidence: number;
  error?: string;
  onRetry: () => void;
  onClear: () => void;
}

export function DetectionResult({
  letter,
  confidence,
  error,
  onRetry,
  onClear,
}: DetectionResultProps) {
  const confidencePercentage = Math.round(confidence * 100);
  const isConfident = confidence >= 0.6;
  const isError = letter === '?' || Boolean(error);

  return (
    <div className={styles.container}>
      <div className={`${styles.resultBox} ${isError ? styles.error : ''}`}>
        <div className={styles.letterDisplay}>
          <span className={styles.letter}>{letter}</span>
        </div>

        {!isError && (
          <div className={styles.details}>
            <div className={styles.confidenceSection}>
              <p className={styles.label}>Confidence</p>
              <div className={styles.confidenceBar}>
                <div
                  className={styles.confidenceFill}
                  style={{ width: `${confidencePercentage}%` }}
                />
              </div>
              <p className={styles.percentage}>{confidencePercentage}%</p>
              {!isConfident && (
                <p className={styles.warning}>Low confidence - try a clearer image</p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
          </div>
        )}

        {isError && !error && (
          <div className={styles.errorMessage}>
            <p>No hand detected. Please try with a different image.</p>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onRetry} className={styles.retryButton}>
          Try Another
        </button>
        <button type="button" onClick={onClear} className={styles.clearButton}>
          Clear
        </button>
      </div>
    </div>
  );
}
