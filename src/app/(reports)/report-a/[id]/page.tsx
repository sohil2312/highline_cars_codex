import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getInspectionWithDetails, getShareByToken } from "@/lib/data";
import { getUser } from "@/lib/auth";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
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

  const legal = inspection.inspection_legal?.[0];
  const items = inspection.inspection_items ?? [];

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

  return (
    <div className="report-page p-6 space-y-6">
      <section className="report-section">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Highline Cars Inspection Report (Dealer/Bank)</h1>
            <p className="text-sm">Inspection ID: {inspection.inspection_code ?? inspection.id}</p>
            <p className="text-sm">Inspector: {inspection.created_by ?? "—"} • {formatDateTime(inspection.created_at)}</p>
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
        <h2 className="text-lg font-semibold">Health Score & Repair Estimate</h2>
        <div className="grid gap-2 md:grid-cols-3">
          <div className="brutal-border p-3">
            <p className="text-sm text-neutral-600">Health Score</p>
            <p className="text-2xl font-semibold">{inspection.health_score ?? "—"}</p>
          </div>
          <div className="brutal-border p-3">
            <p className="text-sm text-neutral-600">Repair Range</p>
            <p className="text-xl font-semibold">{formatCurrency(inspection.total_repair_min)} – {formatCurrency(inspection.total_repair_max)}</p>
          </div>
          <div className="brutal-border p-3">
            <p className="text-sm text-neutral-600">Exposure</p>
            <p className="text-xl font-semibold">{inspection.exposure_percent ?? "—"}%</p>
          </div>
        </div>
        <Badge variant={inspection.recommendation === "YES" ? "ok" : inspection.recommendation === "NO" ? "major" : "minor"}>
          Recommendation: {inspection.recommendation ?? "—"}
        </Badge>
        <p className="text-xs text-neutral-600">Estimates are indicative ranges based on visible inspection; actual costs may vary.</p>
      </section>

      <section className="report-section">
        <h2 className="text-lg font-semibold">Visual Damage Map</h2>
        <div className="mt-3 h-40 brutal-border bg-neutral-100 flex items-center justify-center text-sm">
          Damage map placeholder
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
              <TableHead>Severity</TableHead>
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
                  <TableCell>{row.cost_severity ?? "—"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-neutral-600">
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
