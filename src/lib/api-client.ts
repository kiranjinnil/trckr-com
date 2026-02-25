import { API_ENDPOINTS } from "./constants";
import type {
  ApiResponse,
  PlaceSuggestion,
  TripFormInput,
  TripPlan,
} from "./types";

class ApiClient {
  private baseUrl: string;
  private getToken: (() => Promise<string | null>) | null = null;

  constructor() {
    this.baseUrl = API_ENDPOINTS.WORKER_BASE_URL;
  }

  setTokenGetter(getter: () => Promise<string | null>) {
    this.getToken = getter;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {}),
        },
      });

      // Ensure we got JSON back (proxy may return HTML on errors)
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: response.ok
              ? "Received unexpected response from server."
              : `Request failed with status ${response.status}`,
            details: text.substring(0, 200),
          },
        };
      }

      const json = await response.json() as { success?: boolean; data?: T; error?: { code?: string; message?: string; details?: string } };

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: json.error?.code || `HTTP_${response.status}`,
            message:
              json.error?.message || `Request failed with status ${response.status}`,
            details: json.error?.details,
          },
        };
      }

      // Worker returns { success, data } — unwrap to avoid double-wrapping
      return { success: true, data: (json.data !== undefined ? json.data : json) as T };
    } catch (error) {
      // Network errors, timeouts, etc.
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          error: {
            code: "NETWORK_ERROR",
            message:
              "Unable to connect to the server. Please check your internet connection.",
          },
        };
      }

      return {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred. Please try again.",
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  // ─── Trip Generation ───
  async generateTrip(
    input: TripFormInput,
    onStepChange?: (step: string) => void
  ): Promise<ApiResponse<TripPlan>> {
    // We use a POST with the form data
    // The step changes are simulated client-side since the worker
    // returns the full result at once
    onStepChange?.("validating");

    const result = await this.request<TripPlan>(API_ENDPOINTS.GENERATE_TRIP, {
      method: "POST",
      body: JSON.stringify(input),
    });

    return result;
  }

  // ─── Get Existing Trip ───
  async getTrip(tripId: string): Promise<ApiResponse<TripPlan>> {
    return this.request<TripPlan>(`${API_ENDPOINTS.GET_TRIP}/${tripId}`);
  }

  // ─── Places Autocomplete ───
  async getPlaceSuggestions(
    query: string
  ): Promise<ApiResponse<PlaceSuggestion[]>> {
    if (query.length < 2) {
      return { success: true, data: [] };
    }

    return this.request<PlaceSuggestion[]>(
      `${API_ENDPOINTS.PLACES_AUTOCOMPLETE}?query=${encodeURIComponent(query)}`
    );
  }
}

// Singleton instance
export const apiClient = new ApiClient();
