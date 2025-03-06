import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enables static export
  images: { unoptimized: true }, // Fixes image issues
  basePath: "/myStrava", // Set this to your GitHub repo name
};

module.exports = nextConfig;
