import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { RevisionHistory } from "@/components/inspection/revision-history";

export default async function InspectionDetailPage({
  params
}: {
  params: { id: string };
}) {
  const { supabase, user } = await requireUser();
  const { data: inspection } = await supabase
    .from("inspections")
    .select("*, inspection_legal(*)")
    .eq("id", params.id)
    .single();

  if (!inspection) {
    return (
      <AppShell userEmail={user.email}>
        <Card className="p-4">Inspection not found.</Card>
      </AppShell>
    );
  }

  return (
    <AppShell userEmail={user.email}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-neutral-600">Inspection</p>
          <h2 className="text-xl font-semibold">{inspection.inspection_code ?? params.id}</h2>
          <p className="text-sm text-neutral-600">{formatDate(inspection.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/inspections/new?id=${inspection.id}`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Link href={`/inspections/new?id=${inspection.id}&finalize=1`}>
            <Button>Finalize</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Vehicle</p>
          <p className="text-lg font-semibold">{[inspection.make, inspection.model].filter(Boolean).join(" ")}</p>
          <p className="text-sm">{inspection.vehicle_reg_no ?? "—"}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Health Score</p>
          <p className="text-2xl font-semibold">{inspection.health_score ?? "—"}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Status</p>
          <p className="text-2xl font-semibold">{inspection.status}</p>
          <p className="text-sm text-neutral-600">Updated</p>
          <p className="text-sm">{formatDate(inspection.updated_at)}</p>
        </Card>
      </div>

      <Card className="p-4">
        <p className="text-sm text-neutral-600">Legal Snapshot</p>
        <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
          <div>Insurance: {inspection.inspection_legal?.[0]?.insurance_type ?? "—"}</div>
          <div>RC: {inspection.inspection_legal?.[0]?.rc_availability ?? "—"}</div>
          <div>Hypothecation: {inspection.inspection_legal?.[0]?.hypothecation ? "Yes" : "No"}</div>
          <div>Fitness: {inspection.inspection_legal?.[0]?.fitness_valid_till ?? "—"}</div>
        </div>
      </Card>

      <Card className="p-4">
        <RevisionHistory inspectionId={params.id} />
      </Card>

      <Card className="p-4">
        <p className="text-sm text-neutral-600">Reports & Sharing</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={`/report/${inspection.id}?profile=full`}>
            <Button>Full Report</Button>
          </Link>
          <Link href={`/report/${inspection.id}?profile=customer`}>
            <Button variant="outline">Customer View</Button>
          </Link>
          <Link href={`/report/${inspection.id}?profile=summary`}>
            <Button variant="outline">Summary Only</Button>
          </Link>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={`/api/reports/${inspection.id}/pdf?profile=full`} target="_blank">
            <Button variant="outline">Download PDF</Button>
          </Link>
        </div>
      </Card>
    </AppShell>
  );
}
