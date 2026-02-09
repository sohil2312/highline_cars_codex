import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const reg = request.nextUrl.searchParams.get("reg");

  return NextResponse.json(
    {
      message: "RTO integration not configured. Provide API credentials to enable auto-fill.",
      reg
    },
    { status: 501 }
  );
}
