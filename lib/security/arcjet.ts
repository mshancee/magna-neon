import arcjet, {
  createMiddleware,
  shield,
  detectBot,
  fixedWindow,
} from "@arcjet/next";

const isDevelopment = process.env.NODE_ENV === "development";

// main arcjet instance.
export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      characteristics: ["ip.src"],
      window: "1m",
      max: 60,
      ...(isDevelopment && { max: 120 }),
    }),
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW", "CATEGORY:MONITOR"],
    }),
  ],
});

// auth routes protection
export const authProtection = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      characteristics: ["ip.src"],
      window: "1m",
      max: 10,
      ...(isDevelopment && { max: 30 }),
    }),
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  ],
});

// public routes protection
export const publicProtection = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      characteristics: ["ip.src"],
      window: "1m",
      max: 100,
      ...(isDevelopment && { max: 200 }),
    }),
    shield({
      mode: "LIVE",
    }),
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

// general API protection
export const apiProtection = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    fixedWindow({
      mode: "LIVE",
      characteristics: ["ip.src"],
      window: "1m",
      max: 40,
      ...(isDevelopment && { max: 80 }),
    }),
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:MONITOR"],
    }),
  ],
});

// middleware helper
export const createArcjetMiddleware = createMiddleware;

interface ServerActionRequest {
  headers: Headers;
  ip: string;
}

export async function protectServerAction(
  protection: ReturnType<typeof arcjet>,
  headers: Headers,
  errorMessage = "Too many requests. Please try again later."
) {
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

// helper to get headers in server actions
export async function getServerActionHeaders() {
  const { headers } = await import("next/headers");
  return headers();
}

// types
export type { ArcjetDecision } from "@arcjet/next";
