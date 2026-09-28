import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // `images.domains` is deprecated in Next 16 — remotePatterns supersedes it
    // and is required for a wildcard Supabase project host.
    remotePatterns: [
      // Supabase Storage public URLs
      { protocol: "https", hostname: "**.supabase.co" },
      // Remote images already used by seeded projects
      { protocol: "https", hostname: "play-lh.googleusercontent.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
