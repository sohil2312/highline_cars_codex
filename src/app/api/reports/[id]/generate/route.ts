import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Admin client not configured" }, { status: 500 });
  }

  // Ensure a share token exists for QR code on cover page
  const { data: existingShare } = await adminClient
    .from("report_shares")
    .select("token")
    .eq("inspection_id", params.id)
    .limit(1)
    .single();

  let shareToken = existingShare?.token;
  if (!shareToken) {
    shareToken = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    await adminClient.from("report_shares").insert({
      inspection_id: params.id,
      token: shareToken,
      allow_pdf: true,
      profile: "full",
    });
  }

  // Trigger the PDF endpoint to generate and cache
  const baseUrl = process.env.REPORT_BASE_URL ?? request.nextUrl.origin;
  const pdfUrl = `${baseUrl}/api/reports/${params.id}/pdf?profile=full&token=${shareToken}`;

  try {
    const pdfRes = await fetch(pdfUrl, {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });

    if (!pdfRes.ok) {
      return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
    }

    // Cache the PDF in Supabase Storage
    const pdfBuffer = await pdfRes.arrayBuffer();
    const pdfPath = `pdfs/${params.id}/${Date.now()}.pdf`;

    await adminClient.storage
      .from("inspection-media")
      .upload(pdfPath, Buffer.from(pdfBuffer), {
        contentType: "application/pdf",
        upsert: true,
      });

    await adminClient
      .from("inspections")
      .update({ cached_pdf_path: pdfPath })
      .eq("id", params.id);

    return NextResponse.json({ success: true, path: pdfPath });
  } catch (error) {
    console.error("PDF pre-generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
