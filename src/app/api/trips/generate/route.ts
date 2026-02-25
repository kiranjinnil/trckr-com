import { NextRequest, NextResponse } from "next/server";

const WORKER_URL =
  process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8787";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const workerResp = await fetch(`${WORKER_URL}/api/trips/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const data = await workerResp.text();

    return new NextResponse(data, {
      status: workerResp.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Proxy to worker failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PROXY_ERROR",
          message: "Failed to connect to the trip generation service.",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 502 }
    );
  }
}
