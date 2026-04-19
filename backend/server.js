import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const loadEnvFile = (filePath) => {
  if (!existsSync(filePath)) {
    return;
  }

  const fileContent = readFileSync(filePath, "utf8");

  for (const rawLine of fileContent.split("\n")) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalIndex = line.indexOf("=");
    if (equalIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalIndex).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    const rawValue = line.slice(equalIndex + 1).trim();
    const unquotedValue = rawValue.replace(/^(['"])(.*)\1$/, "$2");
    process.env[key] = unquotedValue;
  }
};

loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), "backend/.env"));

const normalizeEnvValue = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim().replace(/^(['"])(.*)\1$/, "$2");
};

const PORT = Number(normalizeEnvValue(process.env.PORT)) || 3000;
const FRONTEND_ORIGIN = (normalizeEnvValue(process.env.FRONTEND_ORIGIN) || "http://localhost:5173").replace(/\/+$/, "");
const API_KEY = normalizeEnvValue(process.env.API_KEY);
const EMAIL = normalizeEnvValue(process.env.EMAIL);


if (!EMAIL) {
  throw new Error("EMAIL no está definido en el .env");
}

if (!API_KEY) {
  console.error(
    "Missing API_KEY environment variable. Create a .env file in the project root (or backend/.env) based on .env.example."
  );
  process.exit(1);
}

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

const proxyRequest = async (endpoint, res, options = {}) => {
  const { method = "GET", copyHeaders = [] } = options;

  try {
    const upstreamResponse = await fetch(`https://api2.freecustom.email${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    for (const headerName of copyHeaders) {
      const value = upstreamResponse.headers.get(headerName);
      if (value) {
        res.setHeader(headerName, value);
      }
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
      writeJson(res, upstreamResponse.status, {
        error: result?.error || result?.message || "Upstream API error",
      });
      return;
    }

    writeJson(res, upstreamResponse.status, result ?? { success: true });
  } catch (error) {
    writeJson(res, 502, {
      error: "Cannot reach upstream API",
      detail: error instanceof Error ? error.message : "Unknown error",
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
    });
    return;
  }

  if (req.url === "/api/inboxes/messages" && req.method === "GET") {
    await proxyRequest(`/v1/inboxes/${EMAIL}/messages`, res);
    return;
  }

  if (req.url.startsWith("/api/inboxes/messages/")) {
    const id = req.url.split("/").pop();

    if (!id) {
      writeJson(res, 400, { error: "Missing message id" });
      return;
    }

    if (req.method === "GET") {
      await proxyRequest(`/v1/inboxes/${EMAIL}/messages/${id}`, res, {
        method: "GET",
      });
      return;
    }

    if (req.method === "DELETE") {
      await proxyRequest(`/v1/inboxes/${EMAIL}/messages/${id}`, res, {
        method: "DELETE",
      });
      return;
    }

    writeJson(res, 405, { error: "Method not allowed" });
    return;
  }

  writeJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});