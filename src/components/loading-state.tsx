"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { LOADING_STEPS, type LoadingStep } from "@/lib/types";
import {
  Plane,
  MapPin,
  Route,
  Calculator,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const stepIcons: Record<LoadingStep, React.ReactNode> = {
  validating: <Shield className="h-5 w-5" />,
  analyzing_destination: <MapPin className="h-5 w-5" />,
  generating_itinerary: <Plane className="h-5 w-5" />,
  optimizing_routes: <Route className="h-5 w-5" />,
  calculating_budget: <Calculator className="h-5 w-5" />,
  finalizing: <CheckCircle2 className="h-5 w-5" />,
};

interface LoadingStateDisplayProps {
  currentStep: LoadingStep;
  progress: number;
}

export function LoadingStateDisplay({
  currentStep,
  progress,
}: LoadingStateDisplayProps) {
  const steps = Object.entries(LOADING_STEPS) as [
    LoadingStep,
    { label: string; progress: number },
  ][];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardContent className="pt-8 pb-8">
          {/* Animated plane icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Plane className="h-8 w-8 text-primary animate-bounce" />
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-center mb-2">
            Crafting Your Perfect Trip
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Our AI is planning an amazing journey for you
          </p>

          {/* Progress bar */}
          <Progress value={progress} className="mb-6" />

          {/* Step indicators */}
          <div className="space-y-3">
            {steps.map(([stepKey, stepInfo]) => {
              const isActive = stepKey === currentStep;
              const isCompleted = stepInfo.progress < LOADING_STEPS[currentStep].progress;

              return (
                <div
                  key={stepKey}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300",
                    isActive && "bg-primary/5 text-primary",
                    isCompleted && "text-muted-foreground",
                    !isActive && !isCompleted && "text-muted-foreground/50"
                  )}
                >
                  <div
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive && "text-primary",
                      isCompleted && "text-emerald-500"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      stepIcons[stepKey]
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm",
                      isActive && "font-medium",
                      isCompleted && "line-through"
                    )}
                  >
                    {stepInfo.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
