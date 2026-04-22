'use client';

import Link from 'next/link';
import styles from '@/styles/Home.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>ASL Fingerspelling Translator</h1>
          
          <p className={styles.subtitle}>
            Translate between ASL fingerspelling and English with private, browser-based tools
          </p>

          <div className={styles.description}>
            <p>
              This app supports both directions of fingerspelling translation. You can upload an ASL hand image to
              detect the English letter, or enter an English letter to view the matching ASL handshape.
            </p>
            <p>
              <strong>Current Features:</strong> ASL -&gt; English detection and English -&gt; ASL letter display
            </p>
          </div>

          <div className={styles.translationOptions}>
            <Link href="/asl-translation" className={styles.primaryButton}>
              ASL -&gt; English
            </Link>
            <Link href="/english-to-asl" className={styles.secondaryButton}>
              English -&gt; ASL
            </Link>
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <h3>🎯 ASL -&gt; English</h3>
              <p>Upload one hand image and detect the fingerspelled letter with a trained browser model</p>
            </div>
            <div className={styles.feature}>
              <h3>🖐 English -&gt; ASL</h3>
              <p>Type one English letter and instantly view the matching ASL fingerspelled handshape</p>
            </div>
            <div className={styles.feature}>
              <h3>🔒 Private</h3>
              <p>Detection stays in your browser, and reverse-translation images are bundled locally in the app</p>
            </div>
          </div>

          <div className={styles.instructions}>
            <h2>How to Use</h2>
            <ol>
              <li>Choose either ASL -&gt; English or English -&gt; ASL from the home screen</li>
              <li>For ASL -&gt; English, upload a clear photo of one fingerspelled letter</li>
              <li>For English -&gt; ASL, type one English letter from A-Z</li>
              <li>If you enter something outside the current scope, the app will tell you it is not supported yet</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
