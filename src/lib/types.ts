// ─── Travel Styles ───
export const TRAVEL_STYLES = [
  { value: "luxury", label: "Luxury" },
  { value: "backpacking", label: "Backpacking" },
  { value: "family", label: "Family" },
  { value: "romantic", label: "Romantic" },
  { value: "adventure", label: "Adventure" },
  { value: "spiritual", label: "Spiritual" },
] as const;

export type TravelStyle = (typeof TRAVEL_STYLES)[number]["value"];

// ─── Form Input ───
export interface TripFormInput {
  origin: string;
  originPlaceId: string;
  destination: string;
  destinationPlaceId: string;
  startDate: string; // ISO date string
  endDate: string;
  budget: number;
  travelStyle: TravelStyle;
  numberOfTravelers: number;
}

// ─── Place Suggestion (Google Places Autocomplete) ───
export interface PlaceSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

// ─── Time Slot ───
export interface TimeSlot {
  time: string; // e.g. "09:00 AM"
  placeName: string;
  description: string;
  estimatedDuration: string; // e.g. "2 hours"
  estimatedCost: number;
  latitude: number;
  longitude: number;
  googleMapsLink: string;
  travelTimeFromPrevious: string; // e.g. "15 min by car"
  category: "attraction" | "restaurant" | "transport" | "hotel" | "activity";
}

// ─── Day Itinerary ───
export interface DayItinerary {
  dayNumber: number;
  date: string;
  theme: string; // e.g. "Historical Exploration"
  timeSlots: TimeSlot[];
  dailyCostEstimate: number;
}

// ─── Budget Breakdown ───
export interface BudgetBreakdown {
  flights: number;
  accommodation: number;
  food: number;
  localTransport: number;
  entryTickets: number;
  miscellaneous: number;
  total: number;
}

// ─── Route Optimization Info ───
export interface RouteOptimization {
  clusteringStrategy: string;
  distanceMatrixUsage: string;
  visitOrderOptimization: string;
  totalOptimizedDistance: string;
}

// ─── Full Trip Response ───
export interface TripPlan {
  id: string;
  userId: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  travelStyle: TravelStyle;
  numberOfTravelers: number;
  estimatedTotalBudget: number;
  itinerary: DayItinerary[];
  budgetBreakdown: BudgetBreakdown;
  routeOptimization: RouteOptimization;
  createdAt: string;
}

// ─── API Response Wrapper ───
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

// ─── API Loading States ───
export type LoadingStep =
  | "validating"
  | "analyzing_destination"
  | "generating_itinerary"
  | "optimizing_routes"
  | "calculating_budget"
  | "finalizing";

export interface LoadingState {
  isLoading: boolean;
  currentStep: LoadingStep | null;
  progress: number; // 0-100
}

export const LOADING_STEPS: Record<LoadingStep, { label: string; progress: number }> = {
  validating: { label: "Validating your inputs...", progress: 10 },
  analyzing_destination: { label: "Analyzing destination...", progress: 25 },
  generating_itinerary: { label: "Crafting your perfect itinerary...", progress: 50 },
  optimizing_routes: { label: "Optimizing routes & distances...", progress: 70 },
  calculating_budget: { label: "Calculating budget breakdown...", progress: 85 },
  finalizing: { label: "Finalizing your trip plan...", progress: 95 },
};
