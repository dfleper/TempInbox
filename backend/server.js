import { createServer } from "node:http";

const PORT = Number(process.env.PORT) || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Missing API_KEY environment variable.");
  process.exit(1);
}

const setCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
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

    if (options.copyHeaders) {
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

  writeJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});