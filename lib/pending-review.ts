const DB = "lamaranku-pending-review";
export type PendingReview = { file: File; jobDescription: string; createdAt: number };
async function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("drafts");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Penyimpanan sementara tidak tersedia. Izinkan penyimpanan browser lalu coba lagi."));
  });
}
export async function savePendingReview(id: string, draft: PendingReview) {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("drafts", "readwrite");
      const store = tx.objectStore("drafts");
      const cursor = store.openCursor();
      cursor.onsuccess = () => {
        const item = cursor.result;
        if (!item) return;
        if (Date.now() - item.value.createdAt >= 60 * 60 * 1000) item.delete();
        item.continue();
      };
      store.put(draft, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error("Dokumen tidak dapat disimpan sementara. Coba berkas yang lebih kecil."));
      tx.onabort = () => reject(new Error("Penyimpanan dokumen dibatalkan."));
    });
  } finally { db.close(); }
}
export async function readPendingReview(id: string): Promise<PendingReview | null> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction("drafts", "readwrite").objectStore("drafts").get(id);
      request.onsuccess = () => {
        const draft = request.result as PendingReview | undefined;
        const expired = draft && Date.now() - draft.createdAt >= 60 * 60 * 1000;
        if (expired) request.source && (request.source as IDBObjectStore).delete(id);
        resolve(draft && !expired ? draft : null);
      };
      request.onerror = () => reject(new Error("Dokumen sementara tidak dapat dibaca."));
    });
  } finally { db.close(); }
}
export async function deletePendingReview(id: string) {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("drafts", "readwrite");
      tx.objectStore("drafts").delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally { db.close(); }
}
