"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { DayItinerary as DayItineraryType, TimeSlot } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  MapPin,
  Clock,
  Navigation,
  Camera,
  UtensilsCrossed,
  Bus,
  Hotel,
  Compass,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryIcons: Record<TimeSlot["category"], React.ReactNode> = {
  attraction: <Camera className="h-4 w-4" />,
  restaurant: <UtensilsCrossed className="h-4 w-4" />,
  transport: <Bus className="h-4 w-4" />,
  hotel: <Hotel className="h-4 w-4" />,
  activity: <Compass className="h-4 w-4" />,
};

const categoryColors: Record<TimeSlot["category"], string> = {
  attraction: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  restaurant:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  transport:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  hotel:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  activity: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100",
};

interface DayItineraryProps {
  days: DayItineraryType[];
}

export function DayItinerary({ days }: DayItineraryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        Day-wise Itinerary
      </h3>

      <Accordion type="multiple" defaultValue={["day-1"]} className="space-y-3">
        {days.map((day) => (
          <AccordionItem
            key={day.dayNumber}
            value={`day-${day.dayNumber}`}
            className="border rounded-xl overflow-hidden bg-card"
          >
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-4 text-left">
                {/* Day number circle */}
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    D{day.dayNumber}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">
                    Day {day.dayNumber} — {day.theme}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{formatDate(day.date)}</span>
                    <span>•</span>
                    <span>{day.timeSlots.length} activities</span>
                    <span>•</span>
                    <span>{formatCurrency(day.dailyCostEstimate)}</span>
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-4">
              <div className="relative ml-5 space-y-0">
                {day.timeSlots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="relative pb-6 last:pb-0">
                    {/* Timeline connector */}
                    {slotIndex < day.timeSlots.length - 1 && (
                      <div className="absolute left-[7px] top-8 bottom-0 w-[2px] bg-border" />
                    )}

                    <div className="flex gap-4">
                      {/* Timeline dot */}
                      <div className="relative z-10 mt-1">
                        <div className="h-4 w-4 rounded-full bg-primary border-2 border-background" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <Card className="border shadow-sm">
                          <CardContent className="p-4">
                            {/* Header row */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge
                                    className={cn(
                                      "text-[10px] px-1.5 py-0 border-0",
                                      categoryColors[slot.category]
                                    )}
                                  >
                                    <span className="mr-1">
                                      {categoryIcons[slot.category]}
                                    </span>
                                    {slot.category}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground font-medium">
                                    {slot.time}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-sm">
                                  {slot.placeName}
                                </h4>
                              </div>

                              {/* Google Maps link */}
                              {slot.googleMapsLink && (
                                <a
                                  href={slot.googleMapsLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="shrink-0 text-primary hover:text-primary/80 transition-colors"
                                  title="Open in Google Maps"
                                >
                                  <Navigation className="h-4 w-4" />
                                </a>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-xs text-muted-foreground mb-3">
                              {slot.description}
                            </p>

                            {/* Meta info */}
                            <div className="flex flex-wrap items-center gap-3 text-xs">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {slot.estimatedDuration}
                              </span>
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <span className="h-3 w-3 text-[10px] font-bold leading-3">₹</span>
                                {formatCurrency(slot.estimatedCost)}
                              </span>
                              {slot.travelTimeFromPrevious &&
                                slotIndex > 0 && (
                                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                    <Navigation className="h-3 w-3" />
                                    {slot.travelTimeFromPrevious} from previous
                                  </span>
                                )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
