import arcjet, {
  createMiddleware,
  shield,
  detectBot,
  fixedWindow,
} from "@arcjet/next";

// Environment configuration
const isDevelopment = process.env.NODE_ENV === "development";

// ─── MAIN ARCJET INSTANCE ──────────────────────────────────────────────────────
export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Basic rate limiting
    fixedWindow({
      mode: "LIVE",
      characteristics: ["ip.src"],
      window: "1m",
      max: 60,
      // More permissive in development
      ...(isDevelopment && { max: 120 }),
    }),
    // Shield protection
    shield({
      mode: "LIVE",
    }),
    // Bot detection - allow legitimate bots
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW", "CATEGORY:MONITOR"],
    }),
  ],
});

// ─── AUTHENTICATION ROUTES PROTECTION ──────────────────────────────────────────
export const authProtection = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Stricter rate limiting for auth routes
    fixedWindow({
      mode: "LIVE",
      characteristics: ["ip.src"],
      window: "1m",
      max: 10, // Lower limit for auth attempts
      ...(isDevelopment && { max: 30 }),
    }),
    // Enhanced shield protection
    shield({
      mode: "LIVE",
    }),
    // Block all bots on auth routes
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  ],
});

// ─── PUBLIC ROUTES PROTECTION ──────────────────────────────────────────────────
export const publicProtection = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Relaxed rate limiting for public access
    fixedWindow({
      mode: "LIVE",
      characteristics: ["ip.src"],
      window: "1m",
      max: 100,
      ...(isDevelopment && { max: 200 }),
    }),
    // Basic shield protection
    shield({
      mode: "LIVE",
    }),
    // Allow search engines and legitimate bots
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:PREVIEW",
        "CATEGORY:MONITOR",
        "CATEGORY:AI",
      ],
    }),
  ],
});

// ─── ADMIN ROUTES PROTECTION ────────────────────────────────────────────────────
export const deskProtection = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Moderate rate limiting for admin users
    fixedWindow({
      mode: "LIVE",
      characteristics: ["ip.src"],
      window: "1m",
      max: 30,
      ...(isDevelopment && { max: 60 }),
    }),
    // Enhanced shield protection
    shield({
      mode: "LIVE",
    }),
    // Block all bots on desk routes
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  ],
});

// ─── FINANCIAL API PROTECTION ──────────────────────────────────────────────────
export const financialProtection = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Strict rate limiting for financial operations
    fixedWindow({
      mode: "LIVE",
      characteristics: ["ip.src"],
      window: "1m",
      max: 5, // Very low limit for financial operations
      ...(isDevelopment && { max: 15 }),
    }),
    // Maximum shield protection
    shield({
      mode: "LIVE",
    }),
    // Block all bots
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  ],
});

// ─── GENERAL API PROTECTION ─────────────────────────────────────────────────────
export const apiProtection = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Standard API rate limiting
    fixedWindow({
      mode: "LIVE",
      characteristics: ["ip.src"],
      window: "1m",
      max: 40,
      ...(isDevelopment && { max: 80 }),
    }),
    // Shield protection
    shield({
      mode: "LIVE",
    }),
    // Allow legitimate service bots
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:MONITOR"],
    }),
  ],
});

// ─── VOUCHER SYSTEM PROTECTION ──────────────────────────────────────────────────
export const voucherProtection = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Moderate rate limiting for voucher operations
    fixedWindow({
      mode: "LIVE",
      characteristics: ["ip.src"],
      window: "1m",
      max: 20,
      ...(isDevelopment && { max: 40 }),
    }),
    // Shield protection
    shield({
      mode: "LIVE",
    }),
    // Block all bots
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  ],
});

// ─── MIDDLEWARE HELPER ──────────────────────────────────────────────────────────
export const createArcjetMiddleware = createMiddleware;

// ─── SERVER ACTION HELPERS ──────────────────────────────────────────────────────

// ─── REQUEST TYPE FOR SERVER ACTIONS ────────────────────────────────────────────
interface ServerActionRequest {
  headers: Headers;
  ip: string;
}

/**
 * Protect server actions with rate limiting
 * Use this for server actions that need rate limiting protection
 */
export async function protectServerAction(
  protection: ReturnType<typeof arcjet>,
  headers: Headers,
  errorMessage = "Too many requests. Please try again later."
) {
  // Create a simplified request object for server actions
  const fakeRequest: ServerActionRequest = {
    headers,
    ip:
      headers.get("x-forwarded-for") ||
      headers.get("x-real-ip") ||
      headers.get("cf-connecting-ip") ||
      "127.0.0.1",
  };

  const decision = await protection.protect(fakeRequest);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      const retryAfter = Math.ceil(
        (Number(decision.reason.resetTime || Date.now()) - Date.now()) / 1000
      );

      throw new Error(
        `${errorMessage} Please wait ${retryAfter} seconds before trying again.`
      );
    }

    if (decision.reason.isBot()) {
      throw new Error("Automated requests are not allowed.");
    }

    throw new Error("Request blocked for security reasons.");
  }

  return decision;
}

/**
 * Helper to get headers in server actions (from Next.js 15+)
 */
export async function getServerActionHeaders() {
  const { headers } = await import("next/headers");
  return headers();
}

// ─── TYPE EXPORTS ───────────────────────────────────────────────────────────────
export type { ArcjetDecision } from "@arcjet/next";
