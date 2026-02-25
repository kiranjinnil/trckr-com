import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy to worker is handled by Next.js API routes under
  //   /api/trips/generate  and  /api/places/autocomplete
  // so rewrites are no longer needed.
};

export default nextConfig;
