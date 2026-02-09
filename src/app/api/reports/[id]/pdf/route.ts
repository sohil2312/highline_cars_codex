import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer, { type Browser } from "puppeteer-core";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const type = request.nextUrl.searchParams.get("type") ?? "a";
  const token = request.nextUrl.searchParams.get("token");
  const baseUrl = process.env.REPORT_BASE_URL ?? request.nextUrl.origin;
  const reportPath = type === "b" ? `/report-b/${params.id}` : `/report-a/${params.id}`;
  const reportUrl = token ? `${baseUrl}${reportPath}?token=${token}` : `${baseUrl}${reportPath}`;

  const isVercel = Boolean(process.env.VERCEL);
  chromium.setGraphicsMode = false;
  const executablePath = isVercel ? await chromium.executablePath() : process.env.CHROME_EXECUTABLE_PATH;

  let browser: Browser | null = null;
  try {
    const headlessMode = "shell" as const;
    browser = await puppeteer.launch({
      args: puppeteer.defaultArgs({ args: chromium.args, headless: headlessMode }),
      executablePath,
      headless: headlessMode
    });

    const page = await browser.newPage();
    const cookie = request.headers.get("cookie");
    if (cookie) {
      await page.setExtraHTTPHeaders({ cookie });
    }
    await page.goto(reportUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    await new Promise((resolve) => setTimeout(resolve, 750));

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
        "Content-Disposition": `inline; filename=inspection-${params.id}.pdf`
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
