// Enums (exported first to avoid conflicts)
export * from "./schema/enums";

// Core tables
export * from "./schema/users";

// ────────────────────────────────────────────────────────────────
// DRIZZLE SCHEMA OBJECT — Used by `drizzle.config.ts` and migration tooling
// ────────────────────────────────────────────────────────────────

import { users } from "./schema/users";

// schema object for Drizzle CLI and queryClient usage
export const schema = {
  users,
};
