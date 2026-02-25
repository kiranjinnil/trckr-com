"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripFormSchema, type TripFormValues } from "@/lib/validation";
import { TRAVEL_STYLES, LOADING_STEPS, type LoadingStep } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlacesAutocomplete } from "@/components/places-autocomplete";
import { LoadingStateDisplay } from "@/components/loading-state";
import { ErrorDisplay } from "@/components/error-display";
import {
  CalendarDays,
  Users,
  Sparkles,
  Compass,
  PlaneTakeoff,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function TripForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>("validating");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [submitError, setSubmitError] = useState<{
    code?: string;
    message: string;
    details?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      origin: "",
      originPlaceId: "",
      destination: "",
      destinationPlaceId: "",
      startDate: "",
      endDate: "",
      budget: undefined,
      travelStyle: undefined,
      numberOfTravelers: 1,
    },
  });

  const destination = watch("destination");

  const simulateLoadingProgress = useCallback(() => {
    const steps: LoadingStep[] = [
      "validating",
      "analyzing_destination",
      "generating_itinerary",
      "optimizing_routes",
      "calculating_budget",
      "finalizing",
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        setLoadingStep(step);
        setLoadingProgress(LOADING_STEPS[step].progress);
        stepIndex++;
      } else {
        clearInterval(interval);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: TripFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    const cleanupLoading = simulateLoadingProgress();

    try {
      const response = await apiClient.generateTrip({
        origin: data.origin,
        originPlaceId: data.originPlaceId,
        destination: data.destination,
        destinationPlaceId: data.destinationPlaceId,
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget,
        travelStyle: data.travelStyle,
        numberOfTravelers: data.numberOfTravelers,
      });

      if (response.success && response.data) {
        setLoadingProgress(100);
        // Save trip to MongoDB via Next.js API route
        try {
          await fetch("/api/db/trips", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response.data),
          });
        } catch {
          // Save to localStorage as fallback
          try { localStorage.setItem(`trip_${response.data.id}`, JSON.stringify(response.data)); } catch {}
        }
        // Navigate to the itinerary page
        router.push(`/itinerary/${response.data.id}`);
      } else {
        setSubmitError({
          code: response.error?.code,
          message:
            response.error?.message || "Failed to generate trip. Please try again.",
          details: response.error?.details,
        });
      }
    } catch {
      setSubmitError({
        code: "UNKNOWN_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      cleanupLoading();
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isSubmitting && (
        <LoadingStateDisplay
          currentStep={loadingStep}
          progress={loadingProgress}
        />
      )}

      <Card className="w-full max-w-2xl mx-auto shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Compass className="h-7 w-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Plan Your Trip
          </CardTitle>
          <CardDescription className="text-base">
            Tell us about your dream journey and our AI will craft the perfect
            itinerary
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submitError && (
            <div className="mb-6">
              <ErrorDisplay
                code={submitError.code}
                message={submitError.message}
                details={submitError.details}
                onRetry={() => setSubmitError(null)}
              />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin" className="text-sm font-medium">
                  <PlaneTakeoff className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                  From
                </Label>
                <Controller
                  name="origin"
                  control={control}
                  render={({ field }) => (
                    <PlacesAutocomplete
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        setValue("originPlaceId", "");
                      }}
                      onPlaceSelect={(placeId, description) => {
                        setValue("originPlaceId", placeId);
                        field.onChange(description);
                      }}
                      placeholder="Where are you traveling from?"
                      error={
                        errors.origin?.message ||
                        errors.originPlaceId?.message
                      }
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination" className="text-sm font-medium">
                  Destination
                </Label>
                <Controller
                  name="destination"
                  control={control}
                  render={({ field }) => (
                    <PlacesAutocomplete
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        setValue("destinationPlaceId", "");
                      }}
                      onPlaceSelect={(placeId, description) => {
                        setValue("destinationPlaceId", placeId);
                        field.onChange(description);
                      }}
                      placeholder="Where do you want to go?"
                      error={
                        errors.destination?.message ||
                        errors.destinationPlaceId?.message
                      }
                    />
                  )}
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium">
                  <CalendarDays className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  min={new Date().toISOString().split("T")[0]}
                  className={cn(errors.startDate && "border-destructive")}
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium">
                  <CalendarDays className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  min={watch("startDate") || new Date().toISOString().split("T")[0]}
                  className={cn(errors.endDate && "border-destructive")}
                />
                {errors.endDate && (
                  <p className="text-xs text-destructive">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Budget & Travel Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm font-medium">
                  <span className="inline-block h-4 w-4 mr-1.5 -mt-0.5 text-center font-bold text-sm leading-4">₹</span>
                  Budget (INR)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="e.g. 2000"
                  {...register("budget", { valueAsNumber: true })}
                  className={cn(errors.budget && "border-destructive")}
                />
                {errors.budget && (
                  <p className="text-xs text-destructive">
                    {errors.budget.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  <Sparkles className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                  Travel Style
                </Label>
                <Controller
                  name="travelStyle"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        className={cn(
                          errors.travelStyle && "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRAVEL_STYLES.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.travelStyle && (
                  <p className="text-xs text-destructive">
                    {errors.travelStyle.message}
                  </p>
                )}
              </div>
            </div>

            {/* Number of Travelers */}
            <div className="space-y-2">
              <Label htmlFor="numberOfTravelers" className="text-sm font-medium">
                <Users className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                Number of Travelers
              </Label>
              <Input
                id="numberOfTravelers"
                type="number"
                min={1}
                max={20}
                {...register("numberOfTravelers", { valueAsNumber: true })}
                className={cn(
                  "max-w-32",
                  errors.numberOfTravelers && "border-destructive"
                )}
              />
              {errors.numberOfTravelers && (
                <p className="text-xs text-destructive">
                  {errors.numberOfTravelers.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Generate My Trip Plan
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
