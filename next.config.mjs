/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude pdf/compression packages from the server bundle.
  // jsPDF uses fflate which internally calls `new Worker()` — a browser-only API.
  // Without this, Turbopack tries to bundle them for SSR and throws:
  // "Module not found: Can't resolve <dynamic>"
  serverExternalPackages: ['jspdf', 'jspdf-autotable', 'fflate'],
};

export default nextConfig;
