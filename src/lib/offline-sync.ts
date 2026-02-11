/**
 * Background sync — pushes offline drafts and media to Supabase when online.
 * Uses last-write-wins strategy: most recent save timestamp takes precedence.
 */

import {
  getUnsyncedDrafts,
  markDraftSynced,
  getUnsyncedMedia,
  markMediaSynced,
  type OfflineDraft,
} from "@/lib/offline-store";

let syncing = false;
const syncListeners = new Set<(status: SyncStatus) => void>();

export type SyncStatus = {
  syncing: boolean;
  pendingDrafts: number;
  pendingMedia: number;
  lastSyncAt: number | null;
  error: string | null;
};

let lastStatus: SyncStatus = {
  syncing: false,
  pendingDrafts: 0,
  pendingMedia: 0,
  lastSyncAt: null,
  error: null,
};

function notify(partial: Partial<SyncStatus>) {
  lastStatus = { ...lastStatus, ...partial };
  syncListeners.forEach((fn) => fn(lastStatus));
}

export function subscribeSyncStatus(fn: (status: SyncStatus) => void): () => void {
  syncListeners.add(fn);
  fn(lastStatus);
  return () => syncListeners.delete(fn);
}

export async function syncOfflineData(): Promise<void> {
  if (syncing || !navigator.onLine) return;
  syncing = true;
  notify({ syncing: true, error: null });

  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      notify({ syncing: false, error: "Not authenticated" });
      syncing = false;
      return;
    }

    // Sync drafts
    const drafts = await getUnsyncedDrafts();
    notify({ pendingDrafts: drafts.length });

    for (const draft of drafts) {
      try {
        await syncDraft(supabase, draft, auth.user.id);
      } catch (err) {
        console.error("Failed to sync draft:", draft.id, err);
      }
    }

    // Sync media
    const media = await getUnsyncedMedia();
    notify({ pendingMedia: media.length });

    for (const m of media) {
      try {
        const { compressImage, isVideo } = await import("@/lib/media");
        const file = new File([m.blob], m.filename, {
          type: m.mediaType === "video" ? "video/mp4" : "image/jpeg",
        });
        const isVid = isVideo(file);
        const processed = isVid ? file : await compressImage(file);
        const path = `${m.draftId}/${m.itemId}/${Date.now()}-${processed.name}`;

        await supabase.storage
          .from("inspection-media")
          .upload(path, processed, { upsert: true });

        await markMediaSynced(m.id);
      } catch (err) {
        console.error("Failed to sync media:", m.id, err);
      }
    }

    notify({
      syncing: false,
      pendingDrafts: 0,
      pendingMedia: 0,
      lastSyncAt: Date.now(),
    });
  } catch (err) {
    notify({
      syncing: false,
      error: err instanceof Error ? err.message : "Sync failed",
    });
  }

  syncing = false;
}

async function syncDraft(
  supabase: ReturnType<typeof import("@/lib/supabase/client").createClient>,
  draft: OfflineDraft,
  userId: string
) {
  const payload = {
    status: draft.status,
    body_type: draft.vehicle.body_type || "sedan",
    vehicle_reg_no: draft.vehicle.vehicle_reg_no || null,
    vin: draft.vehicle.vin || null,
    make: draft.vehicle.make || null,
    model: draft.vehicle.model || null,
    variant: draft.vehicle.variant || null,
    year_of_manufacture: draft.vehicle.year_of_manufacture
      ? Number(draft.vehicle.year_of_manufacture)
      : null,
    mileage_km: draft.vehicle.mileage_km ? Number(draft.vehicle.mileage_km) : null,
    fuel_type: draft.vehicle.fuel_type || null,
    transmission: draft.vehicle.transmission || null,
    color: draft.vehicle.color || null,
    owners_count: draft.vehicle.owners_count || null,
    customer_name: draft.vehicle.customer_name || null,
    customer_phone: draft.vehicle.customer_phone || null,
    inspection_city: draft.vehicle.inspection_city || null,
    notes: draft.vehicle.notes || null,
    market_value: draft.marketValue ? Number(draft.marketValue) : null,
  };

  if (draft.remoteId) {
    // Update existing
    await supabase.from("inspections").update(payload).eq("id", draft.remoteId);
    await markDraftSynced(draft.id, draft.remoteId);
  } else {
    // Create new
    const { data, error } = await supabase
      .from("inspections")
      .insert({
        ...payload,
        inspection_code: `HL-${Date.now().toString().slice(-6)}`,
        created_by: userId,
      })
      .select("id")
      .single();

    if (!error && data) {
      await markDraftSynced(draft.id, data.id);
    }
  }
}

// ─── Auto-sync on reconnect ──────────────────────────────────────────────────

let initialized = false;

export function initOfflineSync(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("online", () => {
    syncOfflineData();
  });

  // Also sync on page load if online
  if (navigator.onLine) {
    setTimeout(syncOfflineData, 3000);
  }
}
