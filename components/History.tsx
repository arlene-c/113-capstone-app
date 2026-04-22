'use client';

import styles from '@/styles/History.module.css';

interface HistoryProps {
  letters: string[];
  onClear: () => void;
}

export function History({ letters, onClear }: HistoryProps) {
  if (letters.length === 0) {
    return (
      <div className={styles.container}>
        <h3>Detection History</h3>
        <p className={styles.empty}>No detections yet. Start by uploading an image!</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Detection History</h3>
        <button type="button" onClick={onClear} className={styles.clearButton}>
          Clear
        </button>
      </div>
      <div className={styles.letters}>
        {letters.map((letter, index) => (
          <span key={index} className={styles.letter}>
            {letter}
          </span>
        ))}
      </div>
      <p className={styles.count}>Total: {letters.length}</p>
    </div>
  );
}
