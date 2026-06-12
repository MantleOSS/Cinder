import { NextRequest, NextResponse } from "next/server";

/**
 * Local-only protection middleware.
 *
 * Cinder is licensed under AGPL-3.0 and intended solely for personal,
 * local use. This middleware blocks access from non-local origins to
 * prevent unauthorized public hosting.
 *
 * Allowed hosts:
 *  - localhost / 127.0.0.1 / [::1]
 *  - Private IPv4 ranges: 10.x.x.x, 172.16–31.x.x, 192.168.x.x
 *  - Host header absent (internal requests)
 */

function isLocalHost(host: string): boolean {
  if (!host) return true; // No host header = internal request

  const h = host.split(":")[0].toLowerCase(); // Strip port

  if (h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "[::1]") {
    return true;
  }

  // Private IPv4 ranges
  const parts = h.split(".");
  if (parts.length === 4) {
    const octets = parts.map(Number);
    if (octets.every((n) => !isNaN(n) && n >= 0 && n <= 255)) {
      // 10.0.0.0/8
      if (octets[0] === 10) return true;
      // 172.16.0.0/12
      if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
      // 192.168.0.0/16
      if (octets[0] === 192 && octets[1] === 168) return true;
    }
  }

  return false;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const xForwardedHost = request.headers.get("x-forwarded-host");

  // Check both direct host and forwarded host (reverse proxy scenarios)
  if (!isLocalHost(host) || (xForwardedHost && !isLocalHost(xForwardedHost))) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cinder — Local Only</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0f;
      color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
    }
    .container {
      max-width: 480px;
      text-align: center;
    }
    h1 {
      font-family: monospace;
      font-size: 2.5rem;
      letter-spacing: 0.2em;
      color: #E8890C;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      font-size: 0.75rem;
      color: #666;
      letter-spacing: 0.1em;
      margin-bottom: 2rem;
    }
    .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    p {
      color: #999;
      line-height: 1.6;
      font-size: 0.95rem;
    }
    code {
      background: #1a1a2e;
      padding: 0.15em 0.4em;
      border-radius: 4px;
      font-size: 0.85rem;
      color: #E8890C;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>CINDER</h1>
    <div class="subtitle">by Mantle</div>
    <div class="icon">🔒</div>
    <h2 style="color:#E8890C; margin-bottom:0.75rem;">Local Access Only</h2>
    <p>
      Cinder is designed for personal, local use only.
      Access from <code>${host || "unknown host"}</code> was denied.
    </p>
    <p style="margin-top:1rem;">
      Run Cinder on your local machine and access it via
      <code>localhost:3000</code>
    </p>
  </div>
</body>
</html>`,
      {
        status: 403,
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|fonts|robots\\.txt).*)",
  ],
};
