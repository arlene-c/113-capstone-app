'use client';

import { type FormEvent, useState } from 'react';
import Image from 'next/image';
import { lookupEnglishToAsl, type EnglishToAslLookup } from '@/lib/aslLetterAssets';
import styles from '@/styles/EnglishToASLTranslator.module.css';

const INITIAL_STATE: EnglishToAslLookup = { status: 'empty' };

export function EnglishToASLTranslator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<EnglishToAslLookup>(INITIAL_STATE);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(lookupEnglishToAsl(input));
  };

  const handleClear = () => {
    setInput('');
    setResult(INITIAL_STATE);
  };

  return (
    <div className={styles.wrapper}>
      <section className={styles.panel}>
        <h2>Type an English Letter</h2>
        <p className={styles.description}>
          Enter a single letter from A-Z and the app will show the matching ASL fingerspelled handshape.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="english-letter" className={styles.label}>
            English input
          </label>
          <input
            id="english-letter"
            name="english-letter"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            maxLength={12}
            placeholder="Example: A"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className={styles.input}
          />

          <div className={styles.actions}>
            <button type="submit" className={styles.primaryButton}>
              Show ASL Letter
            </button>
            <button type="button" onClick={handleClear} className={styles.secondaryButton}>
              Clear
            </button>
          </div>
        </form>

        <div className={styles.helperBox}>
          <p>
            Supported now: single letters <strong>A-Z</strong>
          </p>
          <p>Not supported yet: words, phrases, numbers, punctuation, and full sentence translation</p>
        </div>
      </section>

      <section className={styles.previewPanel} aria-live="polite">
        <h2>ASL Output</h2>

        {result.status === 'empty' && (
          <div className={styles.placeholderCard}>
            <p>Enter one English letter to see its ASL fingerspelled form.</p>
          </div>
        )}

        {result.status === 'supported' && (
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <p className={styles.resultLabel}>English Letter</p>
              <span className={styles.resultLetter}>{result.asset.letter}</span>
            </div>

            <div className={styles.imageFrame}>
              <Image
                src={result.asset.src}
                alt={result.asset.alt}
                width={420}
                height={420}
                priority={false}
                className={styles.signImage}
              />
            </div>

            <p className={styles.caption}>
              ASL fingerspelled handshape for <strong>{result.asset.letter}</strong>
            </p>

            {result.asset.note && <p className={styles.note}>{result.asset.note}</p>}
          </div>
        )}

        {result.status === 'unsupported' && (
          <div className={styles.unsupportedCard}>
            <p className={styles.unsupportedTitle}>Not supported yet</p>
            <p className={styles.unsupportedText}>{result.message}</p>
            {result.normalizedInput && (
              <p className={styles.unsupportedExample}>
                You entered: <strong>{result.normalizedInput}</strong>
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
