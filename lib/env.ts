export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
}

export const API_URLS = {
  ipinfo: {
    base: process.env.IPINFO_BASE_URL || "https://ipinfo.io",
  },

  schema: {
    org: process.env.SCHEMA_ORG_URL || "https://schema.org",
  },
} as const;

export const CONFIG_URLS = {
  shadcn: process.env.SHADCN_SCHEMA_URL || "https://ui.shadcn.com/schema.json",
} as const;

export function getIPInfoUrl(ip: string, token?: string): string {
  const baseUrl = `${API_URLS.ipinfo.base}/${ip}`;
  return token ? `${baseUrl}?token=${token}` : baseUrl;
}

export function getSchemaOrgUrl(path?: string): string {
  return path ? `${API_URLS.schema.org}/${path}` : API_URLS.schema.org;
}
