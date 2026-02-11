"use client";

import { useEffect, useState } from "react";
import { subscribeToQueue, clearCompleted, type QueueItem } from "@/lib/upload-queue";

export function UploadQueueIndicator() {
  const [queue, setQueue] = useState<QueueItem[]>([]);

  useEffect(() => {
    return subscribeToQueue(setQueue);
  }, []);

  const pending = queue.filter((q) => q.status === "pending").length;
  const uploading = queue.filter((q) => q.status === "uploading").length;
  const done = queue.filter((q) => q.status === "done").length;
  const errors = queue.filter((q) => q.status === "error").length;
  const total = pending + uploading;

  if (queue.length === 0) return null;

  return (
    <div className="brutal-border bg-white p-2 text-xs flex items-center gap-3">
      {total > 0 && (
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          {uploading > 0 ? `Uploading... (${total} remaining)` : `${pending} queued`}
        </span>
      )}
      {done > 0 && (
        <span className="text-green-600">{done} uploaded</span>
      )}
      {errors > 0 && (
        <span className="text-red-600">{errors} failed</span>
      )}
      {total === 0 && (done > 0 || errors > 0) && (
        <button
          className="underline text-neutral-500"
          onClick={clearCompleted}
        >
          Clear
        </button>
      )}
    </div>
  );
}
