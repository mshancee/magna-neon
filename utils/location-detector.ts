import { NextRequest } from "next/server";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import { getIPInfoUrl, API_URLS } from "@/lib/env";

// Register English locale for country names
countries.registerLocale(en);

const IPINFO_TOKEN = process.env.IPINFO_TOKEN;

// Default fallback values matching your schema defaults
const DEFAULT_VALUES = {
  countryCode: "KE", // Default to Kenya as per your schema
  country: "Kenya",
};

// Types matching your database schema
export interface IPLocationData {
  countryCode: string;
  country: string | null;
}

/**
 * Extract the real client IP from the request headers
 * @param req NextRequest
 * @returns client IP as string
 */
function getClientIp(req: NextRequest): string {
  const forwardedFor =
    req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim();
  return ip || "8.8.8.8"; // Fallback IP for testing
}

/**
 * Get comprehensive location data from client IP via IPInfo API
 * Returns all data needed for your user schema with fallbacks
 *
 * IPinfo API Response Mapping:
 * - data.country → countryCode (2-letter ISO code like "GB", "US")
 * - Uses i18n-iso-countries package to convert country code to full name
 *
 * @param req NextRequest
 * @returns IPLocationData with all fields populated
 */
export async function getLocationDataFromRequest(
  req: NextRequest
): Promise<IPLocationData> {
  const ip = getClientIp(req);

  // If no token provided, return defaults immediately
  if (!IPINFO_TOKEN) {
    console.warn("IPInfo token not configured, using default values");
    return DEFAULT_VALUES;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const url = getIPInfoUrl(ip, IPINFO_TOKEN);
    const res = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(
        `IPInfo API error: ${res.status} ${res.statusText} for IP ${ip}`
      );
      return DEFAULT_VALUES;
    }

    const data = await res.json();

    // Get country code from API response
    const countryCode =
      data.country?.toUpperCase() || DEFAULT_VALUES.countryCode;

    // Get country name using i18n-iso-countries package
    const countryName =
      countries.getName(countryCode, "en") || DEFAULT_VALUES.country;

    // Extract and validate data with fallbacks
    // IPinfo API field mapping:
    // - data.country = 2-letter country code (e.g., "GB", "US")
    // - Use i18n-iso-countries for country name conversion
    return {
      countryCode,
      country: countryName,
    };
  } catch (error) {
    console.error(`Failed to fetch location data for IP ${ip}:`, error);
    return DEFAULT_VALUES;
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getLocationDataFromRequest instead
 */
export async function getCountryFromRequest(req: NextRequest): Promise<string> {
  const locationData = await getLocationDataFromRequest(req);
  return locationData.countryCode;
}
