/**
 * ZiroPlans - Cloudflare Worker API
 * 
 * Handles:
 * - Trip generation (OpenAI + Google Maps)
 * - Places autocomplete
 * - Clerk JWT authentication
 */

import type { Env, ApiResponse, TripFormInput, TripPlan } from "./types";
import { authenticateRequest } from "./auth";
import { generateItinerary } from "./openai";
import { getPlaceAutocomplete } from "./google-maps";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ─── Public Routes ───
      if (path === "/api/places/autocomplete" && request.method === "GET") {
        return handlePlacesAutocomplete(url, env, corsHeaders);
      }

      if (path === "/api/health") {
        return jsonResponse({ success: true, data: { status: "ok" } }, corsHeaders);
      }

      // ─── Protected Routes (require Clerk JWT) ───
      // Auth disabled for local development - using anonymous user
      let userId = await authenticateRequest(request, env).catch(() => null);
      if (!userId) {
        userId = "dev-user";
      }

      // POST /api/trips/generate - Generate a new trip
      if (path === "/api/trips/generate" && request.method === "POST") {
        return handleGenerateTrip(request, userId, env, corsHeaders);
      }

      // 404
      return jsonResponse(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Endpoint not found" },
        },
        corsHeaders,
        404
      );
    } catch (error) {
      console.error("Worker error:", error);
      return jsonResponse(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "An internal error occurred. Please try again.",
            details:
              env.ENVIRONMENT === "development"
                ? String(error)
                : undefined,
          },
        },
        corsHeaders,
        500
      );
    }
  },
};

// ─── Route Handlers ───

async function handlePlacesAutocomplete(
  url: URL,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const query = url.searchParams.get("query");

  if (!query || query.length < 2) {
    return jsonResponse({ success: true, data: [] }, corsHeaders);
  }

  const suggestions = await getPlaceAutocomplete(query, env);
  return jsonResponse({ success: true, data: suggestions }, corsHeaders);
}

async function handleGenerateTrip(
  request: Request,
  userId: string,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  // Parse and validate input
  const body = (await request.json()) as TripFormInput;

  const validationError = validateTripInput(body);
  if (validationError) {
    return jsonResponse(
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: validationError },
      },
      corsHeaders,
      400
    );
  }

  // Generate itinerary using OpenAI
  const itinerary = await generateItinerary(body, env);

  // Assign ID and userId
  const tripId = generateId();
  const trip: TripPlan = {
    ...itinerary,
    id: tripId,
    userId,
    createdAt: new Date().toISOString(),
  };

  return jsonResponse({ success: true, data: trip }, corsHeaders, 201);
}

// ─── Helpers ───

function jsonResponse(
  data: ApiResponse,
  corsHeaders: Record<string, string>,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

function validateTripInput(input: TripFormInput): string | null {
  if (!input.origin || input.origin.length < 2) {
    return "Origin city is required";
  }
  if (!input.destination || input.destination.length < 2) {
    return "Destination is required";
  }
  if (!input.startDate) return "Start date is required";
  if (!input.endDate) return "End date is required";
  if (new Date(input.endDate) < new Date(input.startDate)) {
    return "End date must be after start date";
  }
  if (!input.budget || input.budget < 100) {
    return "Budget must be at least ₹100";
  }
  if (!input.numberOfTravelers || input.numberOfTravelers < 1) {
    return "At least 1 traveler required";
  }
  const validStyles = [
    "luxury",
    "backpacking",
    "family",
    "romantic",
    "adventure",
    "spiritual",
  ];
  if (!validStyles.includes(input.travelStyle)) {
    return "Invalid travel style";
  }
  return null;
}

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const segments = [8, 4, 4];
  return segments
    .map((len) =>
      Array.from({ length: len }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("")
    )
    .join("-");
}
