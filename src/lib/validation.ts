import { z } from "zod";

export const tripFormSchema = z
  .object({
    origin: z
      .string()
      .min(2, "Origin must be at least 2 characters")
      .max(200, "Origin is too long"),
    originPlaceId: z
      .string()
      .min(1, "Please select an origin from the suggestions"),
    destination: z
      .string()
      .min(2, "Destination must be at least 2 characters")
      .max(200, "Destination is too long"),
    destinationPlaceId: z
      .string()
      .min(1, "Please select a destination from the suggestions"),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine(
        (date) => new Date(date) >= new Date(new Date().toDateString()),
        "Start date cannot be in the past"
      ),
    endDate: z.string().min(1, "End date is required"),
    budget: z
      .number({ error: "Budget must be a number" })
      .min(100, "Budget must be at least ₹100")
      .max(10000000, "Budget seems unrealistic"),
    travelStyle: z.enum(
      ["luxury", "backpacking", "family", "romantic", "adventure", "spiritual"],
      { error: "Please select a travel style" }
    ),
    numberOfTravelers: z
      .number({ error: "Number of travelers must be a number" })
      .min(1, "At least 1 traveler required")
      .max(20, "Maximum 20 travelers supported"),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays <= 30;
    },
    {
      message: "Trip duration cannot exceed 30 days",
      path: ["endDate"],
    }
  );

export type TripFormValues = z.infer<typeof tripFormSchema>;
