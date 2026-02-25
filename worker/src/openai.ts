import type { Env, TripFormInput, TripPlan } from "./types";

/**
 * Build the OpenAI prompt for generating a structured travel itinerary.
 */
function buildPrompt(input: TripFormInput): string {
  const totalDays = Math.ceil(
    (new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  ) + 1;

  return `You are an expert travel planner AI. Generate a detailed, day-by-day travel itinerary for the following trip:

**Origin (Traveling From):** ${input.origin}
**Destination:** ${input.destination}
**Start Date:** ${input.startDate}  
**End Date:** ${input.endDate}
**Total Days:** ${totalDays}
**Budget:** ₹${input.budget} INR (total for all travelers)
**Travel Style:** ${input.travelStyle}
**Number of Travelers:** ${input.numberOfTravelers}

Generate a structured JSON response with the following requirements:

1. **Flight/Travel Details**: Include realistic flight or travel options from ${input.origin} to ${input.destination}:
   - Suggested airlines/transport modes (flight, train, bus)
   - Approximate travel duration
   - Estimated cost per person in INR (Indian Rupees)
   - Include both outbound and return journeys in the itinerary

2. **Accommodation/Stay Details**: Recommend places to stay matching the "${input.travelStyle}" style:
   - Hotel/hostel/resort name (real places)
   - Nightly rate estimate
   - Location and proximity to attractions

3. **Day-wise Itinerary**: For each day, provide 4-6 time slots with:
   - Specific time (e.g. "09:00 AM")
   - Real place name (actual attractions, restaurants, etc.)
   - Short description (1-2 sentences)
   - Estimated visit duration
   - Estimated cost per person in INR (Indian Rupees)
   - Latitude and longitude coordinates
   - Category: attraction, restaurant, transport, hotel, or activity
   - Travel time from previous location

4. **Adventures & Activities**: Include unique experiences:
   - Local tours, adventure sports, cultural workshops
   - Food/market tours, nightlife, hidden gems
   - Nature excursions, water sports, hiking (if applicable)

5. **Budget Breakdown**: Provide realistic estimates for:
   - Flights/travel to & from destination (total for all travelers)
   - Accommodation (total for all days)
   - Food & dining (total)
   - Local transport (total)
   - Entry tickets (total)
   - Miscellaneous buffer (~10% of total)

6. **Route Optimization**: Explain:
   - How places are clustered by geographic proximity
   - How Distance Matrix API would optimize travel routes
   - How visit order is determined (nearest-neighbor heuristic)
   - Total optimized distance estimate

7. **Theme** each day (e.g., "Arrival & City Welcome", "Historical Old Town", "Adventure Day", "Beach & Relaxation", "Departure")

IMPORTANT:
- Day 1 should start with arrival from ${input.origin} to ${input.destination}
- Last day should include departure/return journey
- All costs must be in INR (Indian Rupees ₹) and realistic for the ${input.travelStyle} travel style
- Total budget breakdown should be close to ₹${input.budget} INR
- Places must be real and exist at the destination
- Coordinates must be accurate
- Order places to minimize travel time within each day
- Consider opening hours and practicality

Respond ONLY with valid JSON matching this exact schema:
{
  "origin": "string",
  "destination": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD", 
  "totalDays": number,
  "travelStyle": "string",
  "numberOfTravelers": number,
  "estimatedTotalBudget": number,
  "itinerary": [
    {
      "dayNumber": number,
      "date": "YYYY-MM-DD",
      "theme": "string",
      "timeSlots": [
        {
          "time": "HH:MM AM/PM",
          "placeName": "string",
          "description": "string",
          "estimatedDuration": "string",
          "estimatedCost": number,
          "latitude": number,
          "longitude": number,
          "googleMapsLink": "",
          "travelTimeFromPrevious": "string",
          "category": "attraction|restaurant|transport|hotel|activity"
        }
      ],
      "dailyCostEstimate": number
    }
  ],
  "budgetBreakdown": {
    "flights": number,
    "accommodation": number,
    "food": number,
    "localTransport": number,
    "entryTickets": number,
    "miscellaneous": number,
    "total": number
  },
  "routeOptimization": {
    "clusteringStrategy": "string (2-3 sentences explaining how places are clustered by area/neighborhood)",
    "distanceMatrixUsage": "string (2-3 sentences on how Distance Matrix API calculates travel times between all point pairs)",
    "visitOrderOptimization": "string (2-3 sentences on nearest-neighbor algorithm for optimal visit sequence)",
    "totalOptimizedDistance": "string (e.g., '45 km across all days')"
  }
}`;
}

/**
 * Call OpenAI API to generate a trip itinerary.
 */
export async function generateItinerary(
  input: TripFormInput,
  env: Env
): Promise<TripPlan> {
  const prompt = buildPrompt(input);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a precise travel planning AI that outputs only valid JSON. Never include markdown formatting, code blocks, or explanations outside the JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4, // Low temp for stable, consistent output
      max_tokens: 8000,
      response_format: { type: "json_object" }, // Force JSON output
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
  }

  const result = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  const content = result.choices[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned empty response");
  }

  // Parse the JSON response
  const parsed = JSON.parse(content);

  // Generate Google Maps direction links for each time slot
  enrichWithMapsLinks(parsed);

  return parsed;
}

/**
 * Add Google Maps direction links between consecutive time slots.
 */
function enrichWithMapsLinks(plan: any): void {
  for (const day of plan.itinerary) {
    for (let i = 0; i < day.timeSlots.length; i++) {
      const slot = day.timeSlots[i];
      if (i === 0) {
        // First slot: just a pin link
        slot.googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${slot.latitude},${slot.longitude}`;
      } else {
        // Direction from previous slot
        const prev = day.timeSlots[i - 1];
        slot.googleMapsLink = `https://www.google.com/maps/dir/?api=1&origin=${prev.latitude},${prev.longitude}&destination=${slot.latitude},${slot.longitude}&travelmode=driving`;
      }
    }
  }
}
