const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
export const apiBaseUrl = envApiBaseUrl ? envApiBaseUrl.replace(/\/$/, "") : "/api";