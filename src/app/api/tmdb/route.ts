import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";

// Whitelist of allowed TMDB API path prefixes to prevent SSRF
const ALLOWED_PATHS = [
  "/trending/",
  "/movie/popular",
  "/movie/top_rated",
  "/movie/now_playing",
  "/movie/upcoming",
  "/movie/",       // movie detail + append_to_response
  "/tv/popular",
  "/tv/top_rated",
  "/tv/airing_today",
  "/tv/on_the_air",
  "/tv/",           // TV detail + season detail + append_to_response
  "/search/multi",
  "/genre/movie/list",
  "/genre/tv/list",
  "/discover/movie",
  "/discover/tv",
];

// Simple in-memory rate limiter: max 60 requests per IP per 60-second window
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

// Periodically clean up old rate limit entries (every 5 minutes)
let _rateLimitCleanupStarted = false;
if (!_rateLimitCleanupStarted) {
  _rateLimitCleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60_000);
}

function isPathAllowed(path: string): boolean {
  // Decode and normalize the path
  const normalized = decodeURIComponent(path).toLowerCase();

  // Block path traversal attempts
  if (normalized.includes("..") || normalized.includes("//") || normalized.includes("\\")) {
    return false;
  }

  // Must start with /
  if (!normalized.startsWith("/")) {
    return false;
  }

  // Check against whitelist
  return ALLOWED_PATHS.some((allowed) => normalized.startsWith(allowed));
}

export async function GET(request: NextRequest) {
  // Rate limiting
  // Prefer the rightmost x-forwarded-for entry set by a trusted reverse proxy.
  // Using the leftmost value allows clients to spoof their IP and bypass rate limiting.
  // In production, configure TRUSTED_PROXY_COUNT to match your infrastructure.
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",").pop()?.trim() ?? "unknown"
    : request.headers.get("x-real-ip") ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const accessToken = process.env.TMDB_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;

  if (!accessToken && (!apiKey || apiKey === "your_tmdb_api_key_here")) {
    return NextResponse.json(
      { error: "API not configured." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Path parameter is required" }, { status: 400 });
  }

  // Reject unreasonably long paths (max 200 chars)
  if (path.length > 200) {
    return NextResponse.json({ error: "Path too long" }, { status: 400 });
  }

  // SSRF protection: validate the path against whitelist
  if (!isPathAllowed(path)) {
    return NextResponse.json({ error: "Invalid API path" }, { status: 400 });
  }

  // Build the TMDB URL
  const url = new URL(`${TMDB_BASE}${path}`);

  // Forward only safe query params (whitelist approach)
  // NOTE: "api_key" intentionally excluded — the server adds its own credential
  //       so the client must never be allowed to override or inject one.
  const ALLOWED_PARAMS = new Set([
    "page", "query", "with_genres", "sort_by",
    "primary_release_year", "vote_count.gte",
    "append_to_response",
  ]);

  searchParams.forEach((value, key) => {
    if (key !== "path" && ALLOWED_PARAMS.has(key)) {
      // Sanitize param values - strip control characters
      const sanitized = value.replace(/[\x00-\x1f\x7f]/g, "");
      // Validate append_to_response: only allow known safe sub-endpoints
      if (key === "append_to_response") {
        const allowedAppends = new Set(["credits", "videos", "similar", "recommendations"]);
        const requested = sanitized.split(",").map((s) => s.trim());
        const valid = requested.every((r) => allowedAppends.has(r));
        if (!valid) return; // skip invalid append_to_response values
        url.searchParams.set(key, requested.join(","));
        return;
      }
      // Limit individual param value length to prevent abuse
      if (sanitized.length > 500) return;
      url.searchParams.set(key, sanitized);
    }
  });

  // Build headers - prefer Bearer token (more secure, key not in URL/logs)
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  } else if (apiKey && apiKey !== "your_tmdb_api_key_here") {
    url.searchParams.set("api_key", apiKey);
  }

  try {
    const response = await fetch(url.toString(), {
      headers,
      next: { revalidate: 120 }, // Cache for 2 minutes - keeps content fresh
    });

    if (!response.ok) {
      // Don't leak TMDB error details to the client
      const status = response.status;
      let message = "Failed to fetch data";

      if (status === 401) message = "API authentication failed";
      else if (status === 404) message = "Content not found";
      else if (status === 429) message = "API rate limit exceeded, try again later";
      else if (status >= 500) message = "Upstream service error";

      return NextResponse.json(
        { error: message },
        { status: status >= 500 ? 502 : status } // Don't expose 5xx as our own 5xx
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    // Don't expose internal error details
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 503 }
    );
  }
}
