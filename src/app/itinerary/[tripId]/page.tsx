"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { TripPlan } from "@/lib/types";
import { TripSummary } from "@/components/trip-summary";
import { DayItinerary } from "@/components/day-itinerary";
import { BudgetBreakdown } from "@/components/budget-breakdown";
import { RouteOptimization } from "@/components/route-optimization";
import { ErrorDisplay } from "@/components/error-display";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plane,
  ArrowLeft,
  Download,
  Share2,
  MapPin,
  DollarSign,
  Route,
} from "lucide-react";

export default function ItineraryPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{
    code?: string;
    message: string;
    details?: string;
  } | null>(null);

  useEffect(() => {
    const fetchTrip = async () => {
      setIsLoading(true);
      setError(null);

      // Fetch trip from Next.js MongoDB API route
      try {
        const res = await fetch(`/api/db/trips/${tripId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setTrip(json.data);
          setIsLoading(false);
          return;
        }
      } catch {}

      // Fallback: load from localStorage
      try {
        const cached = localStorage.getItem(`trip_${tripId}`);
        if (cached) {
          setTrip(JSON.parse(cached));
          setIsLoading(false);
          return;
        }
      } catch {}

      setError({
        code: "NOT_FOUND",
        message: "Trip not found. It may have expired or been deleted.",
      });

      setIsLoading(false);
    };

    if (tripId) {
      fetchTrip();
    }
  }, [tripId]);

  if (isLoading) {
    return <ItinerarySkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-radial bg-grid-pattern">
        <Header />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <ErrorDisplay
            code={error.code}
            message={error.message}
            details={error.details}
            onRetry={() => window.location.reload()}
          />
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Plan a New Trip
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-gradient-radial bg-grid-pattern">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {/* Back button & actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Plan Another Trip
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Trip Summary Card */}
        <TripSummary trip={trip} />

        {/* Tabbed Content */}
        <Tabs defaultValue="itinerary" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="itinerary" className="gap-1.5">
              <MapPin className="h-4 w-4" />
              Itinerary
            </TabsTrigger>
            <TabsTrigger value="budget" className="gap-1.5">
              <DollarSign className="h-4 w-4" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="routes" className="gap-1.5">
              <Route className="h-4 w-4" />
              Routes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="itinerary">
            <DayItinerary days={trip.itinerary} />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetBreakdown breakdown={trip.budgetBreakdown} />
          </TabsContent>

          <TabsContent value="routes">
            <RouteOptimization optimization={trip.routeOptimization} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t bg-background/80 backdrop-blur-sm py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ZiroPlans. Powered by AI.</p>
        </div>
      </footer>
    </div>
  );
}

function Header() {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plane className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">ZiroPlans</span>
        </div>
      </div>
    </header>
  );
}

function ItinerarySkeleton() {
  return (
    <div className="min-h-screen bg-gradient-radial bg-grid-pattern">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {/* Summary skeleton */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <Skeleton className="h-32 w-full" />
          <div className="p-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Tabs skeleton */}
        <Skeleton className="h-10 w-80" />

        {/* Day cards skeleton */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="space-y-3 ml-14">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
