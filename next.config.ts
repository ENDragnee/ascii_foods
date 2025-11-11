import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Wildcard: matches any hostname
        port: "",
        pathname: "**", // Optional: allow any path
      },
    ],
  },
};

export default nextConfig;
