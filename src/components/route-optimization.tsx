"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RouteOptimization as RouteOptimizationType } from "@/lib/types";
import { Route, Layers, GitBranch, Gauge } from "lucide-react";

interface RouteOptimizationProps {
  optimization: RouteOptimizationType;
}

export function RouteOptimization({ optimization }: RouteOptimizationProps) {
  const items = [
    {
      icon: Layers,
      title: "Place Clustering",
      description: optimization.clusteringStrategy,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      icon: GitBranch,
      title: "Distance Matrix API",
      description: optimization.distanceMatrixUsage,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950",
    },
    {
      icon: Gauge,
      title: "Visit Order Optimization",
      description: optimization.visitOrderOptimization,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Route className="h-5 w-5 text-primary" />
          Route Optimization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`p-4 rounded-lg ${item.bg}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-5 w-5 ${item.color}`} />
                  <h4 className="font-semibold text-sm">{item.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}

          {/* Total distance saved */}
          {optimization.totalOptimizedDistance && (
            <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <Route className="h-5 w-5" />
                <span className="font-semibold text-sm">
                  Total Optimized Distance:
                </span>
                <span className="font-bold">
                  {optimization.totalOptimizedDistance}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
