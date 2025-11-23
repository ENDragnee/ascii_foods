import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  transpilePackages: ["ably"],
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
