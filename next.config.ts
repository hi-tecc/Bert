import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep heavy Node-only libraries out of the bundler.
  serverExternalPackages: ["@react-pdf/renderer", "exceljs", "bcryptjs"],
};

export default nextConfig;
