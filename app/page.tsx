'use client';

import { loadHistory } from '@/lib/storage';
import styles from '@/styles/Home.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [signsToday, setSignsToday] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const history = loadHistory();
    
    // Calculate signs translated today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    const tomorrowTimestamp = todayTimestamp + 24 * 60 * 60 * 1000;
    
    const todaySigns = history.filter(entry => 
      entry.timestamp >= todayTimestamp && entry.timestamp < tomorrowTimestamp
    ).length;
    setSignsToday(todaySigns);
    
    // Calculate current streak
    const dates = history.map(entry => {
      const date = new Date(entry.timestamp);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });
    
    const uniqueDates = [...new Set(dates)].sort((a, b) => b - a); // Most recent first
    
    let currentStreak = 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let checkDate = now.getTime();
    
    for (const date of uniqueDates) {
      if (date === checkDate) {
        currentStreak++;
        checkDate -= 24 * 60 * 60 * 1000; // Previous day
      } else if (date < checkDate) {
        break; // Gap in streak
      }
    }
    
    setStreak(currentStreak);
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.brandGroup}>
            <div className={styles.brandLogo}>S</div>
            <div className={styles.brandText}>
              <h1 className={styles.title}>SignBridge</h1>
              <p className={styles.subtitle}>ASL fingerspelling translation built for quick, polished learning.</p>
            </div>
          </div>

          <div className={styles.navTabs}>
            <Link href="/asl-translation" className={`${styles.tabButton} ${styles.active}`}>
              ASL → English
            </Link>
            <Link href="/english-to-asl" className={styles.tabButton}>
              English → ASL
            </Link>
          </div>

          <div className={styles.searchBar}>
            <span>🔍</span>
            <input className={styles.searchInput} placeholder="Search signs..." aria-label="Search signs" />
          </div>
        </div>

        <div className={styles.hero}>
          <div className={styles.heroCard}>
            <h2 className={styles.title}>A smarter ASL translator for fingerspelling</h2>
            <p className={styles.heroDescription}>
              Upload a hand image to detect ASL fingerspelling, or type a letter to see the matching ASL handshape.
            </p>

            <div className={styles.buttonGrid}>
              <Link href="/asl-translation" className={styles.primaryButton}>
                ASL → English
              </Link>
              <Link href="/english-to-asl" className={styles.secondaryButton}>
                English → ASL
              </Link>
            </div>

            <div className={styles.features}>
              <div className={styles.feature}>
                <h3>Fast detection</h3>
                <p>Upload one clear hand image and get a confident English letter result.</p>
              </div>
              <div className={styles.feature}>
                <h3>Instant playback</h3>
                <p>Enter a single letter and preview the matching ASL fingerspelled shape.</p>
              </div>
              <div className={styles.feature}>
                <h3>Private by design</h3>
                <p>All detection runs locally in your browser with no external upload required.</p>
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div>
              <p className={styles.statLabel}>Signs translated today</p>
              <p className={styles.statValue}>{signsToday.toLocaleString()}</p>
            </div>
            <div>
              <p className={styles.statLabel}>Current streak</p>
              <p className={styles.statValue}>{streak} {streak === 1 ? 'day' : 'days'}</p>
            </div>
            <div>
              <p className={styles.statLabel}>Beginner mode</p>
              <p className={styles.statValue}>Active</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
