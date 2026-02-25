import type { Env, TripPlan } from "./types";

/**
 * MongoDB Data Access Layer using the MongoDB Atlas Data API.
 * 
 * Cloudflare Workers don't support native MongoDB drivers due to TCP socket
 * limitations. We use the Atlas Data API (HTTPS) instead.
 * 
 * If you need full Mongoose support, consider using a proxy service
 * or Cloudflare's `connect()` API for TCP (in beta).
 * 
 * Atlas Data API endpoint format:
 * https://data.mongodb-api.com/app/<APP_ID>/endpoint/data/v1
 */

// For Workers, we use Atlas Data API or a REST proxy.
// This module provides a clean abstraction.

const COLLECTION = "trips";
const DATABASE = "ziroplans";

interface MongoDBConfig {
  dataApiUrl: string;
  apiKey: string;
}

function getConfig(env: Env): MongoDBConfig {
  // MONGODB_URI should be the Atlas Data API URL
  // e.g., https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1
  return {
    dataApiUrl: env.MONGODB_URI,
    apiKey: env.MONGODB_URI, // Or use a separate Data API key
  };
}

async function dataApiRequest(
  env: Env,
  action: string,
  body: Record<string, unknown>
): Promise<any> {
  const config = getConfig(env);

  const response = await fetch(`${config.dataApiUrl}/action/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": config.apiKey,
    },
    body: JSON.stringify({
      dataSource: "Cluster0", // Your Atlas cluster name
      database: DATABASE,
      collection: COLLECTION,
      ...body,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MongoDB Data API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Save a generated trip to MongoDB.
 */
export async function saveTrip(trip: TripPlan, env: Env): Promise<string> {
  const document = {
    ...trip,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await dataApiRequest(env, "insertOne", {
    document,
  });

  return result.insertedId || trip.id;
}

/**
 * Get a trip by ID.
 */
export async function getTripById(
  tripId: string,
  env: Env
): Promise<TripPlan | null> {
  const result = await dataApiRequest(env, "findOne", {
    filter: { id: tripId },
  });

  return result.document || null;
}

/**
 * Get all trips for a user.
 */
export async function getTripsByUserId(
  userId: string,
  env: Env
): Promise<TripPlan[]> {
  const result = await dataApiRequest(env, "find", {
    filter: { userId },
    sort: { createdAt: -1 },
    limit: 50,
  });

  return result.documents || [];
}

/**
 * Delete a trip.
 */
export async function deleteTrip(
  tripId: string,
  userId: string,
  env: Env
): Promise<boolean> {
  const result = await dataApiRequest(env, "deleteOne", {
    filter: { id: tripId, userId },
  });

  return result.deletedCount > 0;
}
