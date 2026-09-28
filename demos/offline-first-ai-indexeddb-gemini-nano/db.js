/**
 * IndexedDB layer: two object stores.
 *  - `history`  — conversation turns, restored into LanguageModel's
 *    `initialPrompts` on every reload so the session survives a refresh.
 *  - `cache`    — response by prompt hash, so repeated/identical field
 *    notes don't re-run inference (and don't burn battery on-device).
 */

const DB_NAME = 'offline-first-ai-demo';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('history')) {
        db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'promptHash' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function hashPrompt(text) {
  const bytes = new TextEncoder().encode(text.trim().toLowerCase());
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getCachedResponse(hash) {
  const db = await openDB();
  return new Promise((resolve) => {
    const store = db.transaction('cache', 'readonly').objectStore('cache');
    const req = store.get(hash);
    req.onsuccess = () => resolve(req.result?.response ?? null);
    req.onerror = () => resolve(null);
  });
}

export async function setCachedResponse(hash, response) {
  const db = await openDB();
  const store = db.transaction('cache', 'readwrite').objectStore('cache');
  store.put({ promptHash: hash, response, timestamp: Date.now() });
}

export async function getHistory() {
  const db = await openDB();
  return new Promise((resolve) => {
    const store = db.transaction('history', 'readonly').objectStore('history');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result.map(({ role, content }) => ({ role, content })));
    req.onerror = () => resolve([]);
  });
}

export async function appendHistory(role, content) {
  const db = await openDB();
  const store = db.transaction('history', 'readwrite').objectStore('history');
  store.add({ role, content });
}

export async function clearAll() {
  const db = await openDB();
  const tx = db.transaction(['history', 'cache'], 'readwrite');
  tx.objectStore('history').clear();
  tx.objectStore('cache').clear();
}
