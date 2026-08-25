import type { NextConfig } from "next";

const getRemotePatterns = () => {
  const patterns: any[] = [
    {
      protocol: "http",
      hostname: "localhost",
      port: "5001",
      pathname: "/**",
    },
    {
      protocol: "http",
      hostname: "127.0.0.1",
      port: "5001",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "images.unsplash.com",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "media.alpineacetreks.com",
      pathname: "/**",
    },
    {
      protocol: "http",
      hostname: "media.alpineacetreks.com",
      pathname: "/**",
    },
    {
      protocol: "https",
      hostname: "alpineacetreks.com",
      pathname: "/**",
    },
  ];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      patterns.push({
        protocol: url.protocol.replace(":", ""),
        hostname: url.hostname,
        port: url.port || "",
        pathname: "/**",
      });
    } catch (e) {
      console.warn("Invalid NEXT_PUBLIC_API_URL for images configuration:", apiUrl);
    }
  }

  return patterns;
};

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getRemotePatterns(),
  },
};

export default nextConfig;
