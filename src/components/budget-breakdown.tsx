"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BudgetBreakdown as BudgetBreakdownType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Plane,
  Hotel,
  UtensilsCrossed,
  Bus,
  Ticket,
  ShieldQuestion,
  PieChart,
} from "lucide-react";

interface BudgetBreakdownProps {
  breakdown: BudgetBreakdownType;
}

const budgetItems = [
  {
    key: "flights" as const,
    label: "Flights / Travel",
    icon: Plane,
    color: "bg-sky-500",
    bgLight: "bg-sky-50 dark:bg-sky-950",
    textColor: "text-sky-600 dark:text-sky-400",
  },
  {
    key: "accommodation" as const,
    label: "Accommodation",
    icon: Hotel,
    color: "bg-blue-500",
    bgLight: "bg-blue-50 dark:bg-blue-950",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "food" as const,
    label: "Food & Dining",
    icon: UtensilsCrossed,
    color: "bg-orange-500",
    bgLight: "bg-orange-50 dark:bg-orange-950",
    textColor: "text-orange-600 dark:text-orange-400",
  },
  {
    key: "localTransport" as const,
    label: "Local Transport",
    icon: Bus,
    color: "bg-green-500",
    bgLight: "bg-green-50 dark:bg-green-950",
    textColor: "text-green-600 dark:text-green-400",
  },
  {
    key: "entryTickets" as const,
    label: "Entry Tickets",
    icon: Ticket,
    color: "bg-purple-500",
    bgLight: "bg-purple-50 dark:bg-purple-950",
    textColor: "text-purple-600 dark:text-purple-400",
  },
  {
    key: "miscellaneous" as const,
    label: "Miscellaneous Buffer",
    icon: ShieldQuestion,
    color: "bg-gray-500",
    bgLight: "bg-gray-50 dark:bg-gray-900",
    textColor: "text-gray-600 dark:text-gray-400",
  },
];

export function BudgetBreakdown({ breakdown }: BudgetBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <PieChart className="h-5 w-5 text-primary" />
          Budget Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Visual bar chart */}
        <div className="mb-6">
          <div className="flex rounded-full overflow-hidden h-4">
            {budgetItems.map((item) => {
              const value = breakdown[item.key];
              const percentage = (value / breakdown.total) * 100;
              return percentage > 0 ? (
                <div
                  key={item.key}
                  className={`${item.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                  title={`${item.label}: ${formatCurrency(value)} (${percentage.toFixed(1)}%)`}
                />
              ) : null;
            })}
          </div>
        </div>

        {/* Itemized list */}
        <div className="space-y-3">
          {budgetItems.map((item) => {
            const value = breakdown[item.key];
            const percentage = (value / breakdown.total) * 100;
            const Icon = item.icon;

            return (
              <div
                key={item.key}
                className={`flex items-center justify-between p-3 rounded-lg ${item.bgLight}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${item.bgLight}`}
                  >
                    <Icon className={`h-4 w-4 ${item.textColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}% of total
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrency(value)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <span className="text-base font-semibold">Estimated Total</span>
          <span className="text-xl font-bold text-primary">
            {formatCurrency(breakdown.total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
