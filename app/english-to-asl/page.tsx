import { EnglishToASLTranslator } from '@/components/EnglishToASLTranslator';
import styles from '@/styles/EnglishToASL.module.css';
import Link from 'next/link';

export default function EnglishToAslPage() {
  return (
    <main className={`${styles.main} page-shell`}>
      <div className={styles.pageWrapper}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div>
              <p className={styles.cardText}>SignBridge — ASL translator</p>
              <h1 className={styles.pageTitle}>English → ASL</h1>
            </div>
            <p className={styles.pageSubtitle}>
              Type a single English letter to preview the matching fingerspelled ASL shape.
            </p>
          </div>

          <div className={styles.tabList}>
            <Link href="/asl-translation" className={styles.tabButton}>
              ASL → English
            </Link>
            <Link href="/english-to-asl" className={`${styles.tabButton} ${styles.active}`}>
              English → ASL
            </Link>
          </div>

          <div className="search-bar">
            <span>🔍</span>
            <input className="search-input" placeholder="Search signs..." aria-label="Search signs" />
          </div>
        </header>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.cardText}>English input</p>
              <h2 className={styles.cardHeading}>Translate letters to ASL</h2>
            </div>
            <span className={styles.pill}>Beginner</span>
          </div>
          <EnglishToASLTranslator />
        </section>
      </div>
    </main>
  );
}
