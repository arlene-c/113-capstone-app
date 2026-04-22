/**
 * Local Storage Utilities for Detection History
 */

const HISTORY_KEY = 'asl_detection_history';
const MAX_HISTORY_ITEMS = 20;

export interface HistoryEntry {
  letter: string;
  timestamp: number;
  confidence: number;
}

/**
 * Save detection result to local history
 */
export function saveToHistory(letter: string, confidence: number): void {
  if (typeof window === 'undefined') return;
  
  try {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    const history: HistoryEntry[] = savedHistory ? JSON.parse(savedHistory) : [];
    
    history.unshift({
      letter,
      timestamp: Date.now(),
      confidence,
    });
    
    // Keep only the latest items
    const trimmed = history.slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
}

/**
 * Load detection history from local storage
 */
export function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
}

/**
 * Clear all detection history
 */
export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

/**
 * Get formatted letters from history
 */
export function getHistoryLetters(): string[] {
  return loadHistory().map(entry => entry.letter);
}
