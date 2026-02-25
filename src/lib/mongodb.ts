import { MongoClient, type Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = "ziroplans";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Get a cached MongoDB connection.
 * Reuses the connection across hot reloads in development.
 */
export async function getDatabase(): Promise<Db> {
  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return db;
}

/**
 * Get the trips collection.
 */
export async function getTripsCollection() {
  const db = await getDatabase();
  return db.collection("trips");
}
