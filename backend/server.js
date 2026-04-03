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

const PORT = Number(process.env.PORT) || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const API_KEY = process.env.API_KEY;
const EMAIL = process.env.EMAIL;

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
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Expose-Headers", "x-ratelimit-remaining-month");
};

const writeJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

const proxyRequest = async (endpoint, res, options = {}) => {
  try {
    const upstreamResponse = await fetch(`https://api2.freecustom.email${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (Array.isArray(options.copyHeaders)) {
      for (const headerName of options.copyHeaders) {
        const value = upstreamResponse.headers.get(headerName);
        if (value) {
          res.setHeader(headerName, value);
        }
      }
    }

    const result = await upstreamResponse.json();

    if (!upstreamResponse.ok) {
      writeJson(res, upstreamResponse.status, {
        error: result?.error || "Upstream API error",
      });
      return;
    }

    writeJson(res, 200, result);
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

  if (req.method !== "GET") {
    writeJson(res, 405, { error: "Method not allowed" });
    return;
  }

  if (req.url === "/api/me") {
    await proxyRequest("/v1/me", res);
    return;
  }

  if (req.url === "/api/inboxes") {
    await proxyRequest("/v1/inboxes", res, {
      copyHeaders: ["x-ratelimit-remaining-month"],
    });
    return;
  }

  if (req.url === "/api/inboxes/messages") {
    await proxyRequest(`/v1/inboxes/${EMAIL}/messages`, res);
    return;
  }

  if (req.url.startsWith("/api/inboxes/messages/")) {
    const id = req.url.split("/").pop();

    await proxyRequest(`/v1/inboxes/${EMAIL}/messages/${id}`, res);
    return;
  }

  writeJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});