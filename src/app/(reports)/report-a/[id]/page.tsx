import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getInspectionWithDetails, getShareByToken } from "@/lib/data";
import { getUser } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";
import { defaultChecklist } from "@/lib/templates";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function ReportAPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { token?: string };
}) {
  await getUser();
  const token = searchParams?.token;

  let inspection = await getInspectionWithDetails(params.id, false);
  let allowPdf = true;

  if (!inspection && token) {
    const share = await getShareByToken(token, true);
    if (share && share.inspection_id === params.id) {
      inspection = await getInspectionWithDetails(params.id, true);
      allowPdf = share.allow_pdf ?? true;
    }
  }

  if (!inspection) {
    notFound();
  }

  const storageClient = createAdminClient() ?? createClient();
  const profileClient = createAdminClient() ?? createClient();

  const legal = inspection.inspection_legal?.[0];
  const items = inspection.inspection_items ?? [];
  const inspectorProfile = inspection.created_by
    ? await profileClient.from("profiles").select("full_name").eq("id", inspection.created_by).single()
    : null;
  const inspectorName = inspectorProfile?.data?.full_name || inspection.created_by || "—";

  const categoryOrder = defaultChecklist.map((category) => category.id);

  const grouped = categoryOrder.flatMap((categoryId) => {
    return items
      .filter((item: any) => item.category_id === categoryId)
      .map((item: any) => ({
        categoryId,
        ...item
      }));
  });

  const mediaItems = items.flatMap((item: any) =>
    (item.inspection_media ?? []).map((media: any) => {
      const { data: publicData } = storageClient.storage
        .from("inspection-media")
        .getPublicUrl(media.storage_path);

      return {
        label: item.item_label,
        status: item.status,
        notes: item.notes,
        url: publicData.publicUrl,
        media
      };
    })
  );

  const engineSound = items.find((item: any) => item.item_id === "engine-sound");
  const engineVideo = engineSound?.inspection_media?.find((media: any) => media.media_type === "video");

  const statusCounts = items.reduce(
    (acc: Record<string, number>, item: any) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    },
    { OK: 0, MINOR: 0, MAJOR: 0, NA: 0 }
  );

  const backUrl = token ? `/r/${token}` : `/inspections/${inspection.id}`;
  const pdfUrl = `/api/reports/${inspection.id}/pdf?type=a${token ? `&token=${token}` : ""}`;

  const damageMapPositions: Record<string, { x: number; y: number }> = {
    "front-bumper": { x: 50, y: 10 },
    bonnet: { x: 50, y: 20 },
    roof: { x: 50, y: 45 },
    "rear-bumper": { x: 50, y: 85 },
    "door-lf": { x: 25, y: 40 },
    "door-rf": { x: 75, y: 40 },
    "door-lr": { x: 25, y: 60 },
    "door-rr": { x: 75, y: 60 },
    "lhs-quarter": { x: 20, y: 75 },
    "rhs-quarter": { x: 80, y: 75 }
  };

  const damageMarkers = items
    .filter((item: any) => item.status === "MINOR" || item.status === "MAJOR")
    .map((item: any) => {
      const position = damageMapPositions[item.item_id];
      if (!position) return null;
      return {
        id: item.item_id,
        status: item.status,
        ...position
      };
    })
    .filter(Boolean) as { id: string; status: string; x: number; y: number }[];

  return (
    <div className="report-page p-6 space-y-6">
      <div className="flex items-center justify-between text-sm">
        <Link href={backUrl} className="underline">Back</Link>
        {allowPdf ? (
          <Link href={pdfUrl} className="underline">Download PDF</Link>
        ) : (
          <span className="text-neutral-500">PDF disabled</span>
        )}
      </div>
      <section className="report-section">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Highline Cars Inspection Report (Dealer/Bank)</h1>
            <p className="text-sm">Inspection ID: {inspection.inspection_code ?? inspection.id}</p>
            <p className="text-sm">Inspector: {inspectorName} • {formatDateTime(inspection.created_at)}</p>
          </div>
          <div className="text-right text-sm">
            <p>Highline Cars Pvt Ltd</p>
            <p>Mumbai, India</p>
            <p>support@highlinecars.in</p>
          </div>
        </div>
      </section>

      <section className="report-section space-y-2">
        <h2 className="text-lg font-semibold">Vehicle & Legal Summary</h2>
        <div className="grid gap-2 text-sm md:grid-cols-2">
          <div>Reg No: {inspection.vehicle_reg_no ?? "—"}</div>
          <div>Make/Model: {[inspection.make, inspection.model].filter(Boolean).join(" ") || "—"}</div>
          <div>Insurance: {legal?.insurance_type ?? "—"} ({legal?.insurance_expiry ? `exp ${formatDate(legal.insurance_expiry)}` : "no expiry"})</div>
          <div>RC Availability: {legal?.rc_availability ?? "—"}</div>
          <div>Hypothecation: {legal?.hypothecation ? "Yes" : "No"}</div>
          <div>Fitness Valid: {formatDate(legal?.fitness_valid_till ?? null)}</div>
          <div>Road Tax: {legal?.road_tax_paid ? "Paid" : "Unpaid"}</div>
          <div>VIN Embossing: {legal?.vin_embossing ?? "—"}</div>
        </div>
      </section>

      <section className="report-section space-y-2">
        <h2 className="text-lg font-semibold">Inspection Summary</h2>
        <div className="grid gap-2 md:grid-cols-3">
          <div className="brutal-border p-3">
            <p className="text-sm text-neutral-600">Health Score</p>
            <p className="text-2xl font-semibold">{inspection.health_score ?? "—"}</p>
          </div>
          <div className="brutal-border p-3">
            <p className="text-sm text-neutral-600">Checklist Counts</p>
            <p className="text-sm">OK {statusCounts.OK} • Minor {statusCounts.MINOR} • Major {statusCounts.MAJOR} • NA {statusCounts.NA}</p>
          </div>
          <div className="brutal-border p-3">
            <p className="text-sm text-neutral-600">Inspection Status</p>
            <p className="text-lg font-semibold">{inspection.status}</p>
          </div>
        </div>
      </section>

      <section className="report-section">
        <h2 className="text-lg font-semibold">Visual Damage Map</h2>
        <div className="relative mt-3 h-48 brutal-border bg-neutral-100">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
            <rect x="20" y="10" width="60" height="80" fill="none" stroke="black" strokeWidth="2" />
            <rect x="30" y="18" width="40" height="12" fill="none" stroke="black" strokeWidth="1" />
            <rect x="30" y="70" width="40" height="12" fill="none" stroke="black" strokeWidth="1" />
          </svg>
          {damageMarkers.map((marker) => (
            <span
              key={marker.id}
              className={marker.status === "MAJOR" ? "status-major" : "status-minor"}
              style={{
                position: "absolute",
                left: `${marker.x}%`,
                top: `${marker.y}%`,
                width: "10px",
                height: "10px",
                borderRadius: "999px",
                transform: "translate(-50%, -50%)",
                border: "2px solid #000"
              }}
            />
          ))}
        </div>
      </section>

      <section className="report-section">
        <h2 className="text-lg font-semibold">Checklist Summary</h2>
        <Table className="report-table">
          <TableHeader>
            <TableRow>
              <TableHead>Part</TableHead>
              <TableHead>Subpart</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Work Done / Condition</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grouped.length > 0 ? (
              grouped.map((row: any) => (
                <TableRow key={`${row.category_id}-${row.item_id}`}>
                  <TableCell>{row.category_id}</TableCell>
                  <TableCell>{row.item_label}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{[row.work_done, row.tread_depth ? `Tread: ${row.tread_depth}` : null].filter(Boolean).join(" • ") || "—"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-neutral-600">
                  No checklist data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <section className="report-section">
        <h2 className="text-lg font-semibold">Engine Sound</h2>
        {engineVideo ? (
          <p className="text-sm">Video: {engineVideo.storage_path}</p>
        ) : (
          <p className="text-sm text-neutral-600">No engine video uploaded.</p>
        )}
      </section>

      <section className="report-section">
        <h2 className="text-lg font-semibold">Photo Evidence</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {mediaItems.length > 0 ? (
            mediaItems.map((photo: any, idx: number) => (
              <div key={`${photo.media.id}-${idx}`} className="brutal-border p-2">
                {photo.media.media_type === "photo" ? (
                  <img src={photo.url} alt={photo.label} className="h-40 w-full object-cover brutal-border" />
                ) : (
                  <video src={photo.url} controls className="h-40 w-full brutal-border" />
                )}
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span>{photo.label}</span>
                  <Badge variant={photo.status === "OK" ? "ok" : photo.status === "MAJOR" ? "major" : "minor"}>
                    {photo.status}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-600">{photo.notes ?? ""}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-600">No media uploaded.</p>
          )}
        </div>
      </section>

      <footer className="text-xs text-neutral-600">
        PDF hash: {inspection.id}
        {!allowPdf ? " • PDF download disabled" : ""}
      </footer>
    </div>
  );
}
