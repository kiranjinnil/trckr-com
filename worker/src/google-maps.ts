import type { Env } from "./types";

interface PlaceSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

/**
 * Get place autocomplete suggestions from Google Places API.
 */
export async function getPlaceAutocomplete(
  query: string,
  env: Env
): Promise<PlaceSuggestion[]> {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json"
  );
  url.searchParams.set("input", query);
  url.searchParams.set("types", "(cities)"); // Focus on cities/regions
  url.searchParams.set("key", env.GOOGLE_MAPS_API_KEY);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Google Places API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    predictions: Array<{
      place_id: string;
      description: string;
      structured_formatting: {
        main_text: string;
        secondary_text: string;
      };
    }>;
    status: string;
  };

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places API status: ${data.status}`);
  }

  return (data.predictions || []).map((p) => ({
    placeId: p.place_id,
    description: p.description,
    mainText: p.structured_formatting.main_text,
    secondaryText: p.structured_formatting.secondary_text || "",
  }));
}

/**
 * Get distance matrix between multiple points.
 * Used for route optimization.
 */
export async function getDistanceMatrix(
  origins: { lat: number; lng: number }[],
  destinations: { lat: number; lng: number }[],
  env: Env
): Promise<{
  rows: Array<{
    elements: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      status: string;
    }>;
  }>;
}> {
  const originsStr = origins.map((o) => `${o.lat},${o.lng}`).join("|");
  const destsStr = destinations.map((d) => `${d.lat},${d.lng}`).join("|");

  const url = new URL(
    "https://maps.googleapis.com/maps/api/distancematrix/json"
  );
  url.searchParams.set("origins", originsStr);
  url.searchParams.set("destinations", destsStr);
  url.searchParams.set("mode", "driving");
  url.searchParams.set("key", env.GOOGLE_MAPS_API_KEY);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Google Distance Matrix API error: ${response.status}`);
  }

  return response.json() as any;
}

/**
 * Generate a Google Maps directions URL between two points.
 */
export function getDirectionsUrl(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  mode: "driving" | "walking" | "transit" = "driving"
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=${mode}`;
}
