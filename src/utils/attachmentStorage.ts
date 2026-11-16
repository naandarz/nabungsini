import { AttachmentMeta } from '../types/finance';
import { generateEntityId } from './formatters';

const DB_NAME = 'finora_attachments_db';
const DB_VERSION = 1;
const STORE_NAME = 'attachments';

export interface StoredAttachment extends AttachmentMeta {
  dataUrl: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB raw upload limit

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB tidak didukung di browser ini.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('transactionId', 'transactionId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Gagal membuka penyimpanan bukti transaksi.'));
  });
}

function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file lampiran.'));
    reader.readAsDataURL(file);
  });
}

async function compressImageIfNeeded(file: File): Promise<{ dataUrl: string; mimeType: string; size: number }> {
  const rawUrl = await readFileAsDataUrl(file);
  if (file.type === 'application/pdf' || file.size <= 450 * 1024) {
    return { dataUrl: rawUrl, mimeType: file.type, size: file.size };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 1600;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ dataUrl: rawUrl, mimeType: file.type, size: file.size });
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const compressedUrl = canvas.toDataURL(outputMime, 0.82);
      const approxBytes = Math.round((compressedUrl.length * 3) / 4);
      resolve({ dataUrl: compressedUrl, mimeType: outputMime, size: approxBytes });
    };
    img.onerror = () => resolve({ dataUrl: rawUrl, mimeType: file.type, size: file.size });
    img.src = rawUrl;
  });
}

export async function prepareAndSaveAttachment(
  file: File,
  transactionId: string,
): Promise<StoredAttachment> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Format file harus JPG, PNG, WEBP, atau PDF.');
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Ukuran file maksimal 5 MB.');
  }

  const processed = await compressImageIfNeeded(file);
  const record: StoredAttachment = {
    id: generateEntityId('att'),
    transactionId,
    fileName: file.name,
    mimeType: processed.mimeType,
    size: processed.size,
    dataUrl: processed.dataUrl,
    uploadedAt: new Date().toISOString(),
  };

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Gagal menyimpan bukti transaksi.'));
  });
  db.close();

  return record;
}

export async function getAttachmentsByIds(ids: string[]): Promise<StoredAttachment[]> {
  if (!ids.length) return [];
  try {
    const db = await openDb();
    const results: StoredAttachment[] = [];
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      let remaining = ids.length;
      for (const id of ids) {
        const req = store.get(id);
        req.onsuccess = () => {
          if (req.result) results.push(req.result as StoredAttachment);
          remaining -= 1;
          if (remaining === 0) resolve();
        };
        req.onerror = () => {
          remaining -= 1;
          if (remaining === 0) resolve();
        };
      }
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    return results;
  } catch {
    return [];
  }
}

export async function deleteAttachmentById(id: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Ignore storage cleanup errors
  }
}

export async function clearAllAttachments(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Ignore cleanup errors
  }
}
