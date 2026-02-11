import { notFound } from "next/navigation";
import { getInspectionWithDetails, getShareByToken, getCompanySettings } from "@/lib/data";
import { getUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateQRDataUrl } from "@/lib/qr";
import { ReportCover } from "@/components/report/report-cover";
import { ReportHeader } from "@/components/report/report-header";
import { ReportLegalSummary } from "@/components/report/report-legal-summary";
import { ReportDamageMap } from "@/components/report/report-damage-map";
import { ReportChecklist } from "@/components/report/report-checklist";
import { ReportDisclaimer } from "@/components/report/report-disclaimer";
import { ReportWatermark } from "@/components/report/report-watermark";
import { ReportActionBar } from "@/components/report/report-action-bar";
import type { ShareProfile, BodyType } from "@/lib/types";

export default async function UnifiedReportPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { token?: string; profile?: string };
}) {
  await getUser();
  const token = searchParams?.token;
  const profile = (searchParams?.profile as ShareProfile) || "full";

  let inspection = await getInspectionWithDetails(params.id, false);

  if (!inspection && token) {
    const share = await getShareByToken(token, true);
    if (share && share.inspection_id === params.id) {
      inspection = await getInspectionWithDetails(params.id, true);
    }
  }

  if (!inspection) {
    notFound();
  }

  // Fetch company settings
  const companySettings = await getCompanySettings(true);
  const companyName = companySettings?.company_name ?? "Highline Cars";

  // Get logo URL
  const storageClient = createAdminClient() ?? createClient();
  let logoUrl: string | null = null;
  if (companySettings?.logo_path) {
    const { data: urlData } = storageClient.storage
      .from("inspection-media")
      .getPublicUrl(companySettings.logo_path);
    logoUrl = urlData.publicUrl;
  }

  // Inspector info
  const profileClient = createAdminClient() ?? createClient();
  const inspectorProfile = inspection.created_by
    ? await profileClient.from("profiles").select("full_name").eq("id", inspection.created_by).single()
    : null;
  const inspectorName = inspectorProfile?.data?.full_name || "—";

  const legal = inspection.inspection_legal?.[0] ?? null;
  const items = inspection.inspection_items ?? [];

  // Build media URL map + generate QR for video files
  const mediaUrlMap: Record<string, string> = {};
  const videoQrMap: Record<string, string> = {};
  for (const item of items) {
    for (const media of item.inspection_media ?? []) {
      const { data: pubData } = storageClient.storage
        .from("inspection-media")
        .getPublicUrl(media.storage_path);
      mediaUrlMap[media.storage_path] = pubData.publicUrl;
      if (media.media_type === "video") {
        try {
          videoQrMap[media.storage_path] = await generateQRDataUrl(pubData.publicUrl);
        } catch {
          // QR generation failed, skip
        }
      }
    }
  }

  // Generate QR code
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.REPORT_BASE_URL ?? "";
  let qrDataUrl: string | null = null;
  if (token && baseUrl) {
    qrDataUrl = await generateQRDataUrl(`${baseUrl}/r/${token}`);
  }

  // Get stock photo URL
  let stockPhotoUrl: string | null = null;
  if ((inspection as any).stock_photo_path) {
    const { data: stockData } = storageClient.storage
      .from("inspection-media")
      .getPublicUrl((inspection as any).stock_photo_path);
    stockPhotoUrl = stockData.publicUrl;
  }

  const inspectionCode = inspection.inspection_code ?? inspection.id.slice(0, 8);
  const inspectionDate = formatDate(inspection.created_at);

  const isCustomer = profile === "customer";
  const isSummary = profile === "summary";

  const pdfUrl = `/api/reports/${params.id}/pdf?profile=${profile}${token ? `&token=${token}` : ""}`;

  return (
    <div style={{ backgroundColor: "#fff", color: "#111827", fontFamily: "sans-serif", position: "relative" }}>
      <ReportActionBar pdfUrl={pdfUrl} />
      <ReportWatermark logoUrl={logoUrl} />

      {/* Cover Page */}
      <ReportCover
        companyName={companyName}
        logoUrl={logoUrl}
        inspectionCode={inspectionCode}
        healthScore={inspection.health_score}
        recommendation={inspection.recommendation}
        make={inspection.make}
        model={inspection.model}
        variant={inspection.variant}
        year={inspection.year_of_manufacture}
        mileageKm={inspection.mileage_km}
        ownersCount={inspection.owners_count}
        fuelType={inspection.fuel_type}
        transmission={(inspection as any).transmission ?? null}
        stockPhotoUrl={stockPhotoUrl}
        inspectorName={inspectorName}
        inspectionDate={inspectionDate}
        qrDataUrl={qrDataUrl}
      />

      {/* Summary-only stops here */}
      {isSummary ? (
        <div style={{ padding: "24px", position: "relative", zIndex: 1 }}>
          <ReportDisclaimer />
        </div>
      ) : (
        <div style={{ padding: "24px 24px 16px", position: "relative", zIndex: 1 }}>
          <ReportHeader
            companyName={companyName}
            logoUrl={logoUrl}
            inspectionCode={inspectionCode}
          />

          {/* Vehicle Legal Summary */}
          <ReportLegalSummary legal={legal} vehicle={inspection} />

          {/* Damage Map */}
          <ReportDamageMap items={items} bodyType={((inspection as any).body_type as BodyType) || "sedan"} />

          {/* Checklist */}
          <ReportChecklist
            items={items}
            mediaUrlMap={mediaUrlMap}
            videoQrMap={videoQrMap}
            hideNotes={isCustomer}
            hideCosts={isCustomer}
          />

          {/* Disclaimer */}
          <ReportDisclaimer />
        </div>
      )}
    </div>
  );
}
