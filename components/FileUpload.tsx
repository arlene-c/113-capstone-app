'use client';

import { type ChangeEvent, useRef } from 'react';
import styles from '@/styles/FileUpload.module.css';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        disabled={isLoading}
        className={styles.fileInput}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className={styles.uploadButton}
      >
        {isLoading ? 'Processing...' : 'Upload or Take Photo'}
      </button>
      <p className={styles.hint}>
        Select a clear photo of a hand showing one fingerspelled letter for best accuracy
      </p>
    </div>
  );
}
