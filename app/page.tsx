'use client';

import Link from 'next/link';
import styles from '@/styles/Home.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>ASL Fingerspelling Detector</h1>
          
          <p className={styles.subtitle}>
            Communicate clearly with Deaf individuals using sign language recognition
          </p>

          <div className={styles.description}>
            <p>
              This app uses advanced computer vision technology to recognize American Sign 
              Language fingerspelling and translate it to English text.
            </p>
            <p>
              <strong>Current Features:</strong> Fingerspelling detection (A-Z)
            </p>
          </div>

          <Link href="/asl-translation" className={styles.primaryButton}>
            Start Detection
          </Link>

          <div className={styles.features}>
            <div className={styles.feature}>
              <h3>🎯 Accurate Detection</h3>
              <p>High-precision hand detection with MediaPipe</p>
            </div>
            <div className={styles.feature}>
              <h3>🚀 Fast Processing</h3>
              <p>All processing happens in your browser</p>
            </div>
            <div className={styles.feature}>
              <h3>🔒 Private</h3>
              <p>Your images never leave your device</p>
            </div>
          </div>

          <div className={styles.instructions}>
            <h2>How to Use</h2>
            <ol>
              <li>Click &quot;Start Detection&quot; to go to the detection page</li>
              <li>Upload a clear photo of a hand showing a fingerspelled letter</li>
              <li>The app will detect the letter and show the confidence level</li>
              <li>Your detections are saved in history</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
