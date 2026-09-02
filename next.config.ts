import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Page-block image/video uploads go through a Server Action. Default cap is
      // 1MB; the editors guard client-side at 5MB (see `MAX_UPLOAD_LABEL`), and
      // this leaves headroom for multipart boundary/header overhead.
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
