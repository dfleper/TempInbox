const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const normalizeApiBaseUrl = (value) => {
  if (!value) {
    return "/api";
  }

  const sanitizedValue = value.replace(/\/+$/, "");

  if (sanitizedValue.startsWith("/")) {
    return sanitizedValue;
  }

  const candidate = /^https?:\/\//i.test(sanitizedValue)
    ? sanitizedValue
    : `https://${sanitizedValue}`;

  try {
    const parsedUrl = new URL(candidate);

    if (parsedUrl.hostname.endsWith(".railway.internal")) {
      return "/api";
    }

    if (parsedUrl.pathname === "") {
      return `${parsedUrl.origin}/api`;
    }

    if (parsedUrl.pathname === "/") {
      return `${parsedUrl.origin}/api`;
    }

    return candidate;
  } catch {
    return "/api";
  }
};

export const apiBaseUrl = normalizeApiBaseUrl(rawApiBaseUrl);