/**
 * Media upload queue — queues files locally and processes them in batch.
 * Prevents form blocking during uploads.
 */

type QueueItem = {
  id: string;
  file: File;
  itemId: string;
  inspectionId: string;
  categoryId: string;
  itemLabel: string;
  itemType: string;
  status: "pending" | "uploading" | "done" | "error";
  thumbnailUrl?: string;
  resultUrl?: string;
  resultPath?: string;
  resultMediaId?: string;
  mediaType: "photo" | "video";
  error?: string;
};

type QueueListener = (queue: QueueItem[]) => void;

let queue: QueueItem[] = [];
let processing = false;
const listeners = new Set<QueueListener>();

function notify() {
  const snapshot = [...queue];
  listeners.forEach((fn) => fn(snapshot));
}

export function subscribeToQueue(listener: QueueListener): () => void {
  listeners.add(listener);
  listener([...queue]);
  return () => listeners.delete(listener);
}

export function getQueueSnapshot(): QueueItem[] {
  return [...queue];
}

export function getPendingCount(): number {
  return queue.filter((q) => q.status === "pending" || q.status === "uploading").length;
}

export function addToQueue(item: Omit<QueueItem, "id" | "status">): void {
  queue.push({
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: "pending",
  });
  notify();
  processQueue();
}

export function clearCompleted(): void {
  queue = queue.filter((q) => q.status !== "done");
  notify();
}

async function processQueue() {
  if (processing) return;
  processing = true;

  while (true) {
    const next = queue.find((q) => q.status === "pending");
    if (!next) break;

    next.status = "uploading";
    notify();

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const { compressImage, isVideo } = await import("@/lib/media");
      const supabase = createClient();

      const isVid = isVideo(next.file);
      const processed = isVid ? next.file : await compressImage(next.file);

      // Ensure inspection_item row exists
      const { data: itemRow } = await supabase
        .from("inspection_items")
        .upsert(
          {
            inspection_id: next.inspectionId,
            category_id: next.categoryId,
            item_id: next.itemId,
            item_label: next.itemLabel,
            item_type: next.itemType,
            status: "OK",
          },
          { onConflict: "inspection_id,item_id" }
        )
        .select("id")
        .single();

      if (!itemRow) throw new Error("Failed to upsert inspection item");

      const path = `${next.inspectionId}/${next.itemId}/${Date.now()}-${processed.name}`;
      const { error: uploadError } = await supabase.storage
        .from("inspection-media")
        .upload(path, processed, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("inspection-media")
        .getPublicUrl(path);

      const { data: mediaRow } = await supabase
        .from("inspection_media")
        .insert({
          inspection_item_id: itemRow.id,
          media_type: isVid ? "video" : "photo",
          storage_path: path,
        })
        .select("id")
        .single();

      next.status = "done";
      next.resultUrl = publicData.publicUrl;
      next.resultPath = path;
      next.resultMediaId = mediaRow?.id;
    } catch (err) {
      next.status = "error";
      next.error = err instanceof Error ? err.message : "Upload failed";
    }

    notify();
  }

  processing = false;
}

export type { QueueItem };
