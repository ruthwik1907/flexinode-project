const configuredApiUrl = (process.env.REACT_APP_API_URL || "")
  .trim()
  .replace(/\/$/, "");

// Change this to ensure the /api prefix is always present
const isLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

// 1. If we have a configured URL, use it. 
// 2. If localhost, use the local port + /api. 
// 3. Otherwise, use the production /api fallback.
export const API_BASE =
  configuredApiUrl ||
  (isLocalhost ? "http://localhost:5000/api" : "/api");

export const buildApiUrl = (path = "") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};