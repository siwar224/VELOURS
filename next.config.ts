import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Frames never change once published: cache them for a year.
  async headers() {
    return [
      {
        source: "/frames/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
