import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer, { type Browser } from "puppeteer-core";
import { chromium as playwrightChromium } from "playwright";
import { existsSync } from "node:fs";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

function resolveLocalChromePath() {
  const candidates = [
    process.env.CHROME_EXECUTABLE_PATH,
    playwrightChromium.executablePath(),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium"
  ].filter(Boolean) as string[];

  return candidates.find((path) => existsSync(path));
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const token = request.nextUrl.searchParams.get("token");
  const profile = request.nextUrl.searchParams.get("profile") ?? "full";
  const baseUrl = process.env.REPORT_BASE_URL ?? request.nextUrl.origin;
  const reportPath = `/report/${params.id}`;
  const queryParts = [`profile=${profile}`];
  if (token) queryParts.push(`token=${token}`);
  const reportUrl = `${baseUrl}${reportPath}?${queryParts.join("&")}`;

  // Fetch inspection data for filename
  const adminClient = createAdminClient();
  let filename = `inspection-${params.id}.pdf`;
  if (adminClient) {
    const { data: insp } = await adminClient
      .from("inspections")
      .select("make, model, created_at")
      .eq("id", params.id)
      .single();
    if (insp) {
      const brand = (insp.make || "UNKNOWN").toUpperCase().replace(/\s+/g, "");
      const model = (insp.model || "UNKNOWN").toUpperCase().replace(/\s+/g, "");
      const date = new Date(insp.created_at);
      const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const { count } = await adminClient
        .from("inspections")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", date.toISOString());
      const seq = String(count ?? 1).padStart(3, "0");
      filename = `HIGHLINECARS_${brand}_${model}_${dateStr}_${seq}.pdf`;
    }
  }

  const isVercel = Boolean(process.env.VERCEL);
  chromium.setGraphicsMode = false;
  const executablePath = isVercel ? await chromium.executablePath() : resolveLocalChromePath();

  let browser: Browser | null = null;
  try {
    const headlessMode = "shell" as const;
    browser = await puppeteer.launch({
      args: isVercel
        ? puppeteer.defaultArgs({ args: chromium.args, headless: headlessMode })
        : puppeteer.defaultArgs({ headless: true }),
      executablePath,
      channel: isVercel || executablePath ? undefined : "chrome",
      headless: isVercel ? headlessMode : true
    });

    const page = await browser.newPage();
    const cookie = request.headers.get("cookie");
    if (cookie) {
      await page.setExtraHTTPHeaders({ cookie });
    }
    await page.goto(reportUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    await new Promise((resolve) => setTimeout(resolve, 750));
    await page.addStyleTag({ content: ".no-print { display: none !important; }" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `<div style="font-size:10px;width:100%;text-align:center;">Highline Cars Inspection</div>`,
      margin: { top: "24px", bottom: "36px", left: "16px", right: "16px" }
    });

    return new NextResponse(pdf as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=${filename}`
      }
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      {
        error: "PDF_GENERATION_FAILED",
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
