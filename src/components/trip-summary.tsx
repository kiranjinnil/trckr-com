"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { TripPlan } from "@/lib/types";
import { formatCurrency, formatDate, getDaysBetween } from "@/lib/utils";
import {
  MapPin,
  CalendarDays,
  Users,
  Sparkles,
  Clock,
} from "lucide-react";

interface TripSummaryProps {
  trip: TripPlan;
}

export function TripSummary({ trip }: TripSummaryProps) {
  const totalDays = getDaysBetween(trip.startDate, trip.endDate);

  return (
    <Card className="overflow-hidden">
      {/* Gradient header banner */}
      <div className="h-32 bg-gradient-to-r from-primary via-blue-500 to-indigo-600 relative">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-4 left-6 right-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
            {trip.origin} → {trip.destination}
          </h2>
        </div>
      </div>

      <CardContent className="pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Dates */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dates</p>
              <p className="text-sm font-medium">
                {formatDate(trip.startDate)}
              </p>
              <p className="text-xs text-muted-foreground">
                to {formatDate(trip.endDate)}
              </p>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium">
                {totalDays} {totalDays === 1 ? "Day" : "Days"}
              </p>
            </div>
          </div>

          {/* Budget */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <span className="h-5 w-5 text-amber-600 text-center font-bold text-lg leading-5">₹</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Est. Budget</p>
              <p className="text-sm font-medium">
                {formatCurrency(trip.estimatedTotalBudget)}
              </p>
            </div>
          </div>

          {/* Travelers */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Travelers</p>
              <p className="text-sm font-medium">{trip.numberOfTravelers}</p>
            </div>
          </div>

          {/* Style */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Style</p>
              <Badge variant="secondary" className="capitalize mt-0.5">
                {trip.travelStyle}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
