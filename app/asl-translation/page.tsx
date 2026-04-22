'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FileUpload } from '@/components/FileUpload';
import { DetectionResult } from '@/components/DetectionResult';
import { History } from '@/components/History';
import {
  detectFingerspellingFromImage,
  type DetectionResult as DetectionOutcome,
} from '@/lib/handDetection';
import { clearHistory, getHistoryLetters, saveToHistory } from '@/lib/storage';
import styles from '@/styles/ASLTranslation.module.css';

const CONFIDENCE_THRESHOLD = 0.6;

export default function ASLTranslationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<DetectionOutcome | null>(null);
  const [historyLetters, setHistoryLetters] = useState<string[]>([]);

  useEffect(() => {
    setHistoryLetters(getHistoryLetters());
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) {
      return;
    }

    setIsLoading(true);
    setCurrentResult(null);

    try {
      const result = await detectFingerspellingFromImage(file);
      setCurrentResult(result);

      if (
        result.detectedLetter !== '?' &&
        result.confidence >= CONFIDENCE_THRESHOLD
      ) {
        saveToHistory(result.detectedLetter, result.confidence);
        setHistoryLetters(getHistoryLetters());
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Detection failed';
      setCurrentResult({
        detectedLetter: '?',
        confidence: 0,
        error: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRetry = () => {
    setCurrentResult(null);
  };

  const handleClear = () => {
    setCurrentResult(null);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistoryLetters([]);
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← Back
        </Link>
        <div className={styles.heading}>
          <h1>ASL -&gt; English</h1>
          <p>Upload one fingerspelled hand image to detect the matching English letter.</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.directionLinks}>
            <span className={styles.directionCurrent}>ASL -&gt; English</span>
            <Link href="/english-to-asl" className={styles.directionLink}>
              Open English -&gt; ASL
            </Link>
          </div>

          <section className={styles.uploadSection}>
            <h2>Upload Image</h2>
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
          </section>

          {currentResult && (
            <section className={styles.resultSection}>
              <h2>Detection Result</h2>
              <DetectionResult
                letter={currentResult.detectedLetter}
                confidence={currentResult.confidence}
                error={currentResult.error}
                onRetry={handleRetry}
                onClear={handleClear}
              />
            </section>
          )}

          <section className={styles.historySection}>
            <History letters={historyLetters} onClear={handleClearHistory} />
          </section>

          <section className={styles.infoSection}>
            <h2>Tips for Best Results</h2>
            <ul>
              <li>Ensure good lighting and clear visibility of your hand</li>
              <li>Position your hand clearly in the center of the photo</li>
              <li>The detector works best with a clean background</li>
              <li>Each photo should show only one letter at a time</li>
              <li>The app works best with photos taken at a close distance</li>
              <li>J and Z are motion-based in ASL, so a single photo is less reliable for those letters</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
