/**
 * Offline storage for inspection drafts using IndexedDB.
 * Stores form state locally so inspectors can work without internet.
 * Syncs back to Supabase when connectivity is restored.
 */

const DB_NAME = "highline-inspections";
const DB_VERSION = 1;
const DRAFTS_STORE = "drafts";
const MEDIA_STORE = "offline_media";

interface OfflineDraft {
  /** Local key — inspectionId or temp ID */
  id: string;
  /** Supabase inspection ID (null if not yet created remotely) */
  remoteId: string | null;
  vehicle: Record<string, string>;
  legal: Record<string, string>;
  items: Record<string, unknown>;
  marketValue: string;
  status: "Draft" | "Final";
  updatedAt: number;
  /** 0 = not synced, 1 = synced (stored as number for IndexedDB index compatibility) */
  synced: number;
}

interface OfflineMedia {
  id: string;
  draftId: string;
  itemId: string;
  blob: Blob;
  filename: string;
  mediaType: "photo" | "video";
  /** 0 = not synced, 1 = synced */
  synced: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
        const store = db.createObjectStore(DRAFTS_STORE, { keyPath: "id" });
        store.createIndex("synced", "synced", { unique: false });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        const mediaStore = db.createObjectStore(MEDIA_STORE, { keyPath: "id" });
        mediaStore.createIndex("draftId", "draftId", { unique: false });
        mediaStore.createIndex("synced", "synced", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ─── Drafts ───────────────────────────────────────────────────────────────────

export async function saveDraftOffline(draft: OfflineDraft): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(DRAFTS_STORE, "readwrite");
  tx.objectStore(DRAFTS_STORE).put(draft);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getDraftOffline(id: string): Promise<OfflineDraft | undefined> {
  const db = await openDB();
  return txPromise(
    db.transaction(DRAFTS_STORE, "readonly").objectStore(DRAFTS_STORE).get(id)
  );
}

export async function getAllDraftsOffline(): Promise<OfflineDraft[]> {
  const db = await openDB();
  return txPromise(
    db.transaction(DRAFTS_STORE, "readonly").objectStore(DRAFTS_STORE).getAll()
  );
}

export async function getUnsyncedDrafts(): Promise<OfflineDraft[]> {
  const db = await openDB();
  const tx = db.transaction(DRAFTS_STORE, "readonly");
  const index = tx.objectStore(DRAFTS_STORE).index("synced");
  return txPromise(index.getAll(0 as unknown as IDBValidKey));
}

export async function markDraftSynced(id: string, remoteId: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(DRAFTS_STORE, "readwrite");
  const store = tx.objectStore(DRAFTS_STORE);
  const draft = await txPromise(store.get(id)) as OfflineDraft | undefined;
  if (draft) {
    draft.synced = 1;
    draft.remoteId = remoteId;
    store.put(draft);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteDraftOffline(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(DRAFTS_STORE, "readwrite");
  tx.objectStore(DRAFTS_STORE).delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Media ────────────────────────────────────────────────────────────────────

export async function saveMediaOffline(media: OfflineMedia): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(MEDIA_STORE, "readwrite");
  tx.objectStore(MEDIA_STORE).put(media);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getMediaForDraft(draftId: string): Promise<OfflineMedia[]> {
  const db = await openDB();
  const tx = db.transaction(MEDIA_STORE, "readonly");
  const index = tx.objectStore(MEDIA_STORE).index("draftId");
  return txPromise(index.getAll(draftId));
}

export async function getUnsyncedMedia(): Promise<OfflineMedia[]> {
  const db = await openDB();
  const tx = db.transaction(MEDIA_STORE, "readonly");
  const index = tx.objectStore(MEDIA_STORE).index("synced");
  return txPromise(index.getAll(0 as unknown as IDBValidKey));
}

export async function markMediaSynced(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(MEDIA_STORE, "readwrite");
  const store = tx.objectStore(MEDIA_STORE);
  const media = await txPromise(store.get(id)) as OfflineMedia | undefined;
  if (media) {
    media.synced = 1;
    store.put(media);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export type { OfflineDraft, OfflineMedia };
