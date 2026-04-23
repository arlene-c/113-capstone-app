'use client';

import { DetectionResult } from '@/components/DetectionResult';
import { FileUpload } from '@/components/FileUpload';
import {
  detectFingerspellingFromImage,
  type DetectionResult as DetectionOutcome,
} from '@/lib/handDetection';
import {
  clearHistory,
  loadHistory,
  saveToHistory,
  type HistoryEntry,
} from '@/lib/storage';
import styles from '@/styles/ASLTranslation.module.css';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

const CONFIDENCE_THRESHOLD = 0.6;

export default function ASLTranslationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<DetectionOutcome | null>(null);
  const [historyLetters, setHistoryLetters] = useState<string[]>([]);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshHistory = () => {
    const history = loadHistory();
    setHistoryEntries(history);
    setHistoryLetters(history.map((entry) => entry.letter));
  };

  useEffect(() => {
    refreshHistory();
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

      if (result.detectedLetter !== '?' && result.confidence >= CONFIDENCE_THRESHOLD) {
        saveToHistory(result.detectedLetter, result.confidence);
        refreshHistory();
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
    setHistoryEntries([]);
    setHistoryLetters([]);
  };

  const filteredHistory = historyEntries.filter((entry) =>
    entry.letter.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentEntries = searchQuery ? filteredHistory : filteredHistory.slice(0, 3);
  const averageConfidence = historyEntries.length
    ? Math.round(
        (historyEntries.reduce((total, entry) => total + entry.confidence, 0) /
          historyEntries.length) * 100
      )
    : null;

  return (
    <main className={`${styles.main} page-shell`}>
      <div className={styles.pageWrapper}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div>
              <p className={styles.cardText}>SignBridge — ASL translator</p>
              <h1 className={styles.pageTitle}>ASL → English</h1>
            </div>
            <p className={styles.pageSubtitle}>
              Upload a fingerspelled hand image and let the app detect the English letter.
            </p>
          </div>

          <div className={styles.tabList}>
            <Link
              href="/asl-translation"
              className={`${styles.tabButton} ${styles.active}`}
            >
              ASL → English
            </Link>
            <Link href="/english-to-asl" className={styles.tabButton}>
              English → ASL
            </Link>
          </div>

          <div className="search-bar">
            <span>🔍</span>
            <input
              className="search-input"
              placeholder="Search signs..."
              aria-label="Search signs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className={styles.layoutGrid}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.cardText}>Camera input</p>
                <h2 className={styles.cardHeading}>American Sign Language</h2>
              </div>
              <span className={styles.pill}>Position hands in frame</span>
            </div>

            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />

            <div className={styles.statusRow}>
              <div className={styles.statusCard}>
                <p className={styles.statusLabel}>Confidence</p>
                <p className={styles.statusValue}>
                  {currentResult ? `${Math.round(currentResult.confidence * 100)}%` : '--'}
                </p>
              </div>
              <div className={styles.statusCard}>
                <p className={styles.statusLabel}>Status</p>
                <p className={styles.statusValue}>{isLoading ? 'Processing' : 'Ready'}</p>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <p className={styles.cardText}>Translation output</p>
                <h2 className={styles.cardHeading}>English</h2>
              </div>
              <span className={styles.badge}>Live</span>
            </div>

            {currentResult ? (
              <DetectionResult
                letter={currentResult.detectedLetter}
                confidence={currentResult.confidence}
                error={currentResult.error}
                onRetry={handleRetry}
                onClear={handleClear}
              />
            ) : (
              <div className={styles.outputPlaceholder}>
                <p>Upload a hand photo to see English translation results here.</p>
                <p>After a successful detection, confidence and history details will appear.</p>
              </div>
            )}
          </section>
        </div>

        <div className={styles.bottomGrid}>
          <section className={styles.summaryCard}>
            <h3>Usage summary</h3>
            <div className={styles.statusRow}>
              <div className={styles.statusCard}>
                <p className={styles.statusLabel}>Signs translated</p>
                <p className={styles.statusValue}>{historyEntries.length}</p>
              </div>
              <div className={styles.statusCard}>
                <p className={styles.statusLabel}>Avg confidence</p>
                <p className={styles.statusValue}>
                  {averageConfidence ? `${averageConfidence}%` : '—'}
                </p>
              </div>
              <div className={styles.statusCard}>
                <p className={styles.statusLabel}>Saved history</p>
                <p className={styles.statusValue}>{historyLetters.length}</p>
              </div>
            </div>
          </section>

          <section className={styles.recentCard}>
            <div className={styles.cardHeader}>
              <div>
                <h3>Recent translations</h3>
                <p className={styles.cardText}>Latest confirmed letters</p>
              </div>
              <button type="button" className={styles.clearHistoryButton} onClick={handleClearHistory}>
                Clear
              </button>
            </div>

            {historyEntries.length === 0 ? (
              <p className={styles.cardText}>No translations yet. Upload a photo to start tracking results.</p>
            ) : searchQuery && recentEntries.length === 0 ? (
              <p className={styles.cardText}>No signs found matching your search.</p>
            ) : (
              <ul className={styles.recentList}>
                {recentEntries.map((entry, index) => (
                  <li key={index} className={styles.recentItem}>
                    <div>
                      <p className={styles.recentLabel}>Letter</p>
                      <p className={styles.recentValue}>{entry.letter}</p>
                    </div>
                    <div>
                      <p className={styles.recentLabel}>Confidence</p>
                      <p className={styles.recentValue}>{Math.round(entry.confidence * 100)}%</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
