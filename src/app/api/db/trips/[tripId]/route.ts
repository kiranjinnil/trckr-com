import { NextRequest, NextResponse } from "next/server";
import { getTripsCollection } from "@/lib/mongodb";

/**
 * GET /api/db/trips/:tripId — Fetch a trip from MongoDB
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;

    const collection = await getTripsCollection();
    const trip = await collection.findOne({ id: tripId });

    if (!trip) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Trip not found" } },
        { status: 404 }
      );
    }

    // Remove MongoDB's internal _id field
    const { _id, ...tripData } = trip;

    return NextResponse.json({ success: true, data: tripData });
  } catch (error) {
    console.error("Failed to fetch trip:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DB_ERROR",
          message: "Failed to fetch trip from database.",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}
