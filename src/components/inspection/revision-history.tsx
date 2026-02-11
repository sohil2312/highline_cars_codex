"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Revision {
  id: string;
  revision_number: number;
  data: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  creator_name?: string;
}

export function RevisionHistory({ inspectionId }: { inspectionId: string }) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("inspection_revisions")
        .select("*")
        .eq("inspection_id", inspectionId)
        .order("revision_number", { ascending: false });

      if (data && data.length > 0) {
        // Fetch creator names
        const userIds = [...new Set(data.map((r) => r.created_by).filter(Boolean))];
        const names: Record<string, string> = {};
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds);
          profiles?.forEach((p) => {
            names[p.id] = p.full_name ?? "Unknown";
          });
        }

        setRevisions(
          data.map((r) => ({
            ...r,
            creator_name: r.created_by ? names[r.created_by] ?? "Unknown" : "System",
          }))
        );
      }
      setLoading(false);
    };
    load();
  }, [inspectionId]);

  if (loading) return <p className="text-xs text-neutral-500">Loading history...</p>;
  if (revisions.length === 0) return <p className="text-xs text-neutral-500">No revision history.</p>;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Revision History</p>
      {revisions.map((rev) => (
        <Card key={rev.id} className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold">v{rev.revision_number}</span>
              <span className="text-xs text-neutral-500 ml-2">
                by {rev.creator_name}
              </span>
              <span className="text-xs text-neutral-400 ml-2">
                {new Date(rev.created_at).toLocaleString("en-IN")}
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpanded(expanded === rev.id ? null : rev.id)}
            >
              {expanded === rev.id ? "Hide" : "View"}
            </Button>
          </div>
          {expanded === rev.id && (
            <div className="mt-3 text-xs space-y-2">
              <RevisionSummary data={rev.data} />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function RevisionSummary({ data }: { data: Record<string, unknown> }) {
  const vehicle = data.vehicle as Record<string, string> | undefined;
  const items = data.items as Record<string, { status: string; notes: string }> | undefined;

  if (!vehicle && !items) {
    return <p className="text-neutral-400">Snapshot data unavailable.</p>;
  }

  // Count statuses
  const counts = { OK: 0, MINOR: 0, MAJOR: 0, NA: 0 };
  if (items) {
    Object.values(items).forEach((item) => {
      const s = item.status as keyof typeof counts;
      if (s in counts) counts[s]++;
    });
  }

  return (
    <div className="grid gap-2 md:grid-cols-2">
      {vehicle && (
        <div className="brutal-border p-2">
          <p className="font-semibold mb-1">Vehicle</p>
          <p>Make: {vehicle.make || "—"}</p>
          <p>Model: {vehicle.model || "—"}</p>
          <p>Reg: {vehicle.vehicle_reg_no || "—"}</p>
          <p>Mileage: {vehicle.mileage_km || "—"} km</p>
        </div>
      )}
      {items && (
        <div className="brutal-border p-2">
          <p className="font-semibold mb-1">Checklist Summary</p>
          <p>OK: {counts.OK} | Minor: {counts.MINOR} | Major: {counts.MAJOR} | NA: {counts.NA}</p>
        </div>
      )}
    </div>
  );
}
