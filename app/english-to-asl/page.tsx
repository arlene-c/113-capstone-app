import Link from 'next/link';
import { EnglishToASLTranslator } from '@/components/EnglishToASLTranslator';
import styles from '@/styles/EnglishToASL.module.css';

export default function EnglishToAslPage() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <Link href="/" className={styles.backButton}>
          ← Back
        </Link>
        <div className={styles.heading}>
          <h1>English -&gt; ASL</h1>
          <p>Translate one English letter into its fingerspelled ASL handshape.</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.directionLinks}>
            <Link href="/asl-translation" className={styles.directionLink}>
              Open ASL -&gt; English
            </Link>
            <span className={styles.directionCurrent}>English -&gt; ASL</span>
          </div>

          <EnglishToASLTranslator />
        </div>
      </div>
    </main>
  );
}
