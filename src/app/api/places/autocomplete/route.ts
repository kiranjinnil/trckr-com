import { NextRequest, NextResponse } from "next/server";

const WORKER_URL =
  process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8787";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("query") || "";

    const workerResp = await fetch(
      `${WORKER_URL}/api/places/autocomplete?query=${encodeURIComponent(query)}`
    );

    const data = await workerResp.text();

    return new NextResponse(data, {
      status: workerResp.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Places autocomplete proxy failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PROXY_ERROR",
          message: "Failed to connect to places service.",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 502 }
    );
  }
}
