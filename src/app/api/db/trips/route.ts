import { NextRequest, NextResponse } from "next/server";
import { getTripsCollection } from "@/lib/mongodb";

/**
 * POST /api/db/trips — Save a trip to MongoDB
 */
export async function POST(request: NextRequest) {
  try {
    const trip = await request.json();

    if (!trip || !trip.id) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid trip data" } },
        { status: 400 }
      );
    }

    const collection = await getTripsCollection();

    // Upsert — insert or update if already exists
    await collection.updateOne(
      { id: trip.id },
      { $set: { ...trip, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, data: { id: trip.id } }, { status: 201 });
  } catch (error) {
    console.error("Failed to save trip:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DB_ERROR",
          message: "Failed to save trip to database.",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}
