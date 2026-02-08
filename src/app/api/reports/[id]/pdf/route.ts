import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const type = request.nextUrl.searchParams.get("type") ?? "a";
  const token = request.nextUrl.searchParams.get("token");
  const baseUrl = process.env.REPORT_BASE_URL ?? request.nextUrl.origin;
  const reportPath = type === "b" ? `/report-b/${params.id}` : `/report-a/${params.id}`;
  const reportUrl = token ? `${baseUrl}${reportPath}?token=${token}` : `${baseUrl}${reportPath}`;

  const isVercel = Boolean(process.env.VERCEL);

  const { chromium: playwrightChromium } = await import("playwright-core");
  const chromium = (await import("@sparticuz/chromium")).default as any;

  const executablePath = isVercel ? await chromium.executablePath() : undefined;

  const browser = await playwrightChromium.launch({
    args: isVercel ? chromium.args : [],
    executablePath,
    headless: true
  });

  const page = await browser.newPage();
  await page.goto(reportUrl, { waitUntil: "networkidle" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: `<div style="font-size:10px;width:100%;text-align:center;">Highline Cars Inspection</div>`,
    margin: { top: "24px", bottom: "36px", left: "16px", right: "16px" }
  });

  await browser.close();

  const body = new Uint8Array(pdf);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=inspection-${params.id}.pdf`
    }
  });
}
