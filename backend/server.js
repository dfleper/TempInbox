import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { setDefaultResultOrder } from "node:dns";

setDefaultResultOrder("ipv4first");

const loadEnvFile = (filePath) => {
  if (!existsSync(filePath)) return;

  const fileContent = readFileSync(filePath, "utf8");

  for (const rawLine of fileContent.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const equalIndex = line.indexOf("=");
    if (equalIndex === -1) continue;

    const key = line.slice(0, equalIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    const rawValue = line.slice(equalIndex + 1).trim();
    const unquotedValue = rawValue.replace(/^(['"])(.*)\1$/, "$2");
    process.env[key] = unquotedValue;
  }
};

loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), "backend/.env"));

const normalizeEnvValue = (value) => {
  if (typeof value !== "string") return value;
  return value.trim().replace(/^(['"])(.*)\1$/, "$2");
};

const normalizeBaseUrl = (value) => {
  const normalized = normalizeEnvValue(value);
  if (!normalized) return null;

  try {
    const url = new URL(normalized);
    if (url.protocol !== "https:") {
      throw new Error("UPSTREAM_BASE_URL must use HTTPS");
    }
    return url.toString().replace(/\/+$/, "");
  } catch (error) {
    throw new Error(
      `Invalid UPSTREAM_BASE_URL: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
};

const PORT = Number(normalizeEnvValue(process.env.PORT)) || 3000;
const FRONTEND_ORIGIN = (
  normalizeEnvValue(process.env.FRONTEND_ORIGIN) || "http://localhost:5173"
).replace(/\/+$/, "");
const API_KEY = normalizeEnvValue(process.env.API_KEY);
const EMAIL = normalizeEnvValue(process.env.EMAIL);
const UPSTREAM_BASE_URL =
  normalizeBaseUrl(process.env.UPSTREAM_BASE_URL) || "https://api2.freecustom.email";

if (!EMAIL) throw new Error("EMAIL no está definido en el .env");

if (!API_KEY) {
  console.error("Missing API_KEY environment variable.");
  process.exit(1);
}

const ENCODED_EMAIL = encodeURIComponent(EMAIL);

const setCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Expose-Headers", "x-ratelimit-remaining-month");
};

const writeJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

const safeNetworkCause = (error) => {
  const cause = error && typeof error === "object" ? error.cause : null;

  return {
    detail: error instanceof Error ? error.message : "Unknown error",
    cause_code:
      cause && typeof cause === "object" && "code" in cause ? String(cause.code) : null,
    cause_message:
      cause && typeof cause === "object" && "message" in cause ? String(cause.message) : null,
    cause_errno:
      cause && typeof cause === "object" && "errno" in cause ? String(cause.errno) : null,
    cause_syscall:
      cause && typeof cause === "object" && "syscall" in cause ? String(cause.syscall) : null,
    cause_address:
      cause && typeof cause === "object" && "address" in cause ? String(cause.address) : null,
    cause_port:
      cause && typeof cause === "object" && "port" in cause ? String(cause.port) : null,
  };
};

const normalizeInboxList = (data) => {
  const source = Array.isArray(data) ? data : data?.inboxes;
  if (!Array.isArray(source)) return [];

  return source
    .map((entry) => (typeof entry === "string" ? entry : entry?.inbox))
    .filter((entry) => typeof entry === "string" && entry.length > 0);
};

const normalizeMessageList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.messages)) return data.messages;
  return [];
};

const proxyRequest = async (endpoint, res, options = {}) => {
  const { method = "GET", copyHeaders = [], transform } = options;

  try {
    const upstreamResponse = await fetch(`${UPSTREAM_BASE_URL}${endpoint}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      signal: AbortSignal.timeout(15000),
    });

    for (const headerName of copyHeaders) {
      const value = upstreamResponse.headers.get(headerName);
      if (value) res.setHeader(headerName, value);
    }

    if (upstreamResponse.status === 204) {
      res.statusCode = 204;
      res.end();
      return;
    }

    const contentType = upstreamResponse.headers.get("content-type") || "";
    let result = null;

    if (contentType.includes("application/json")) {
      result = await upstreamResponse.json();
    } else {
      const text = await upstreamResponse.text();
      result = text ? { message: text } : null;
    }

    if (!upstreamResponse.ok) {
      if (result && typeof result === "object" && !Array.isArray(result)) {
        writeJson(res, upstreamResponse.status, result);
      } else {
        writeJson(res, upstreamResponse.status, {
          success: false,
          error: "upstream_error",
          message: "FreeCustom.Email devolvió un error sin cuerpo JSON.",
        });
      }
      return;
    }

    const payload = typeof transform === "function" ? transform(result) : result;
    writeJson(res, upstreamResponse.status, payload ?? { success: true });
  } catch (error) {
    const networkError = safeNetworkCause(error);
    const tlsExpired = networkError.cause_code === "CERT_HAS_EXPIRED";

    writeJson(res, tlsExpired ? 503 : 502, {
      success: false,
      error: tlsExpired ? "upstream_tls_certificate_expired" : "upstream_unreachable",
      message: tlsExpired
        ? "FreeCustom.Email is presenting an expired TLS certificate. The provider must renew it or publish another HTTPS API endpoint."
        : "Cannot reach FreeCustom.Email API",
      upstream: UPSTREAM_BASE_URL,
      ...networkError,
    });
  }
};

const server = createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.url === "/api/me" && req.method === "GET") {
    await proxyRequest("/v1/me", res);
    return;
  }

  if (req.url === "/api/inboxes" && req.method === "GET") {
    await proxyRequest("/v1/inboxes", res, {
      copyHeaders: ["x-ratelimit-remaining-month"],
      transform: (result) => {
        const inboxes = normalizeInboxList(result?.data);
        const configuredInboxes = inboxes.includes(EMAIL) ? [EMAIL] : [];

        return {
          ...result,
          data: {
            inboxes: configuredInboxes,
            count: configuredInboxes.length,
          },
        };
      },
    });
    return;
  }

  if (req.url === "/api/inboxes/messages" && req.method === "GET") {
    await proxyRequest(`/v1/inboxes/${ENCODED_EMAIL}/messages`, res, {
      transform: (result) => {
        const messages = normalizeMessageList(result?.data);
        const metadata =
          result?.data && !Array.isArray(result.data) && typeof result.data === "object"
            ? result.data
            : {};

        return {
          ...result,
          data: {
            ...metadata,
            inbox: metadata.inbox ?? EMAIL,
            messages,
            count: metadata.count ?? messages.length,
          },
        };
      },
    });
    return;
  }

  if (req.url.startsWith("/api/inboxes/messages/")) {
    const rawId = req.url.split("/").pop();

    if (!rawId) {
      writeJson(res, 400, { success: false, error: "missing_message_id" });
      return;
    }

    let id;
    try {
      id = decodeURIComponent(rawId);
    } catch {
      writeJson(res, 400, { success: false, error: "invalid_message_id" });
      return;
    }

    const encodedId = encodeURIComponent(id);

    if (req.method === "GET") {
      await proxyRequest(
        `/v1/inboxes/${ENCODED_EMAIL}/messages/${encodedId}`,
        res,
        { method: "GET" }
      );
      return;
    }

    if (req.method === "DELETE") {
      await proxyRequest(
        `/v1/inboxes/${ENCODED_EMAIL}/messages/${encodedId}`,
        res,
        { method: "DELETE" }
      );
      return;
    }

    writeJson(res, 405, { success: false, error: "method_not_allowed" });
    return;
  }

  writeJson(res, 404, { success: false, error: "not_found" });
});

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
