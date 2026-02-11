"use client";

import { useEffect, useState } from "react";
import { initOfflineSync, subscribeSyncStatus, syncOfflineData, type SyncStatus } from "@/lib/offline-sync";

export function OfflineIndicator() {
  const [online, setOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    setOnline(navigator.onLine);

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    initOfflineSync();
    const unsub = subscribeSyncStatus(setSyncStatus);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsub();
    };
  }, []);

  if (online && !syncStatus?.syncing && (syncStatus?.pendingDrafts ?? 0) === 0) {
    return null;
  }

  return (
    <div
      className="brutal-border text-xs px-3 py-2 flex items-center gap-2"
      style={{
        backgroundColor: online ? "#fefce8" : "#fef2f2",
        borderColor: online ? "#ca8a04" : "#dc2626",
      }}
    >
      {!online && (
        <>
          <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
          <span>Offline — changes saved locally</span>
        </>
      )}
      {online && syncStatus?.syncing && (
        <>
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          <span>Syncing offline changes...</span>
        </>
      )}
      {online && !syncStatus?.syncing && (syncStatus?.pendingDrafts ?? 0) > 0 && (
        <>
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-500" />
          <span>{syncStatus!.pendingDrafts} drafts pending sync</span>
          <button className="underline ml-2" onClick={() => syncOfflineData()}>
            Sync now
          </button>
        </>
      )}
      {syncStatus?.error && (
        <span className="text-red-600 ml-2">Error: {syncStatus.error}</span>
      )}
    </div>
  );
}
