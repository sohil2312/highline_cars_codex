import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getInspectionWithDetails, getShareByToken } from "@/lib/data";
import { getUser } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { defaultChecklist } from "@/lib/templates";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function ReportBPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { token?: string };
}) {
  const token = searchParams?.token;
  await getUser();

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
  const items = inspection.inspection_items ?? [];

  const majorItems = items.filter((item: any) => item.status === "MAJOR");
  const minorItems = items.filter((item: any) => item.status === "MINOR");

  const topMajor = majorItems.slice(0, 3).map((item: any) => item.item_label);
  const topMinor = minorItems.slice(0, 3).map((item: any) => item.item_label);

  const categoryCounts = defaultChecklist.map((category) => {
    const categoryItems = items.filter((item: any) => item.category_id === category.id);
    const ok = categoryItems.filter((item: any) => item.status === "OK").length;
    const minor = categoryItems.filter((item: any) => item.status === "MINOR").length;
    const major = categoryItems.filter((item: any) => item.status === "MAJOR").length;
    const na = categoryItems.filter((item: any) => item.status === "NA").length;
    return { name: category.title, ok, minor, major, na };
  });

  const mediaItems = items.flatMap((item: any) =>
    (item.inspection_media ?? []).map((media: any) => {
      const { data: publicData } = storageClient.storage
        .from("inspection-media")
        .getPublicUrl(media.storage_path);

      return {
        label: item.item_label,
        status: item.status,
        url: publicData.publicUrl,
        media
      };
    })
  );

  return (
    <div className="report-page p-6 space-y-6">
      <header className="report-section">
        <h1 className="text-2xl font-semibold">Highline Cars Customer Report</h1>
        <p className="text-sm">Inspection ID: {inspection.inspection_code ?? inspection.id}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Health Score</p>
          <p className="text-3xl font-semibold">{inspection.health_score ?? "—"}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Recommendation</p>
          <Badge variant={inspection.recommendation === "YES" ? "ok" : inspection.recommendation === "NO" ? "major" : "minor"} className="mt-2">
            {inspection.recommendation ?? "—"}
          </Badge>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-neutral-600">Repair Estimate</p>
          <p className="text-xl font-semibold">{formatCurrency(inspection.total_repair_min)} – {formatCurrency(inspection.total_repair_max)}</p>
        </Card>
      </section>

      <section className="report-section">
        <h2 className="text-lg font-semibold">Key Highlights</h2>
        <div className="mt-2 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-neutral-600">Top Major Issues</p>
            <ul className="list-disc pl-4 text-sm">
              {topMajor.length > 0 ? topMajor.map((item: string) => <li key={item}>{item}</li>) : <li>None</li>}
            </ul>
          </div>
          <div>
            <p className="text-sm text-neutral-600">Top Minor Issues</p>
            <ul className="list-disc pl-4 text-sm">
              {topMinor.length > 0 ? topMinor.map((item: string) => <li key={item}>{item}</li>) : <li>None</li>}
            </ul>
          </div>
        </div>
      </section>

      <section className="report-section">
        <h2 className="text-lg font-semibold">Category Snapshot</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {categoryCounts.map((category) => (
            <Card key={category.name} className="p-3">
              <p className="text-sm text-neutral-600">{category.name}</p>
              <p className="text-sm">OK {category.ok} • Minor {category.minor} • Major {category.major} • NA {category.na}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="report-section">
        <h2 className="text-lg font-semibold">Photo Grid</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {mediaItems.length > 0 ? (
            mediaItems.map((photo: any, idx: number) => (
              <div key={`${photo.media.id}-${idx}`} className="brutal-border p-2">
                {photo.media.media_type === "photo" ? (
                  <img src={photo.url} alt={photo.label} className="h-32 w-full object-cover brutal-border" />
                ) : (
                  <video src={photo.url} controls className="h-32 w-full brutal-border" />
                )}
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span>{photo.label}</span>
                  <Badge variant={photo.status === "OK" ? "ok" : photo.status === "MINOR" ? "minor" : "major"}>
                    {photo.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-600">No media uploaded.</p>
          )}
        </div>
      </section>

      <footer className="text-xs text-neutral-600">
        {!allowPdf ? "PDF download disabled" : ""}
      </footer>
    </div>
  );
}
