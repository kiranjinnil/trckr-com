export const APP_CONFIG = {
  name: "ZiroPlans",
  description: "AI-Powered Travel Planner",
  tagline: "Plan your perfect trip with AI-powered itineraries",
} as const;

export const API_ENDPOINTS = {
  // Use same-origin proxy (Next.js rewrites /api/* to the worker)
  WORKER_BASE_URL: "",
  GENERATE_TRIP: "/api/trips/generate",
  GET_TRIP: "/api/trips",
  PLACES_AUTOCOMPLETE: "/api/places/autocomplete",
} as const;

export const GOOGLE_MAPS = {
  SCRIPT_URL: `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`,
} as const;
