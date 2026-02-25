// ─── Worker Environment Bindings ───
export interface Env {
  OPENAI_API_KEY: string;
  MONGODB_URI: string;
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  GOOGLE_MAPS_API_KEY: string;
  ENVIRONMENT: string;
  // TRIP_CACHE?: KVNamespace; // Optional KV cache
}

// ─── Trip Form Input ───
export interface TripFormInput {
  origin: string;
  originPlaceId: string;
  destination: string;
  destinationPlaceId: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelStyle: "luxury" | "backpacking" | "family" | "romantic" | "adventure" | "spiritual";
  numberOfTravelers: number;
}

// ─── Time Slot ───
export interface TimeSlot {
  time: string;
  placeName: string;
  description: string;
  estimatedDuration: string;
  estimatedCost: number;
  latitude: number;
  longitude: number;
  googleMapsLink: string;
  travelTimeFromPrevious: string;
  category: "attraction" | "restaurant" | "transport" | "hotel" | "activity";
}

// ─── Day Itinerary ───
export interface DayItinerary {
  dayNumber: number;
  date: string;
  theme: string;
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

// ─── Route Optimization ───
export interface RouteOptimization {
  clusteringStrategy: string;
  distanceMatrixUsage: string;
  visitOrderOptimization: string;
  totalOptimizedDistance: string;
}

// ─── Full Trip ───
export interface TripPlan {
  id: string;
  userId: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  travelStyle: string;
  numberOfTravelers: number;
  estimatedTotalBudget: number;
  itinerary: DayItinerary[];
  budgetBreakdown: BudgetBreakdown;
  routeOptimization: RouteOptimization;
  createdAt: string;
}

// ─── API Response Wrapper ───
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

// ─── Clerk JWT Claims ───
export interface ClerkJWTClaims {
  sub: string;      // userId
  iss: string;
  iat: number;
  exp: number;
  azp?: string;
}
