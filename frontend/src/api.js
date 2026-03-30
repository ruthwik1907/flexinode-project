const configuredApiUrl = (process.env.REACT_APP_API_URL || "")
  .trim()
  .replace(/\/$/, "");

const productionFallbackApi = "/api";

const isLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const API_BASE =
  configuredApiUrl ||
  (isLocalhost ? "http://localhost:5000" : productionFallbackApi);

export const buildApiUrl = (path = "") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};