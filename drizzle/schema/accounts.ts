import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  integer,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// ─── ACCOUNTS TABLE ────────────────────────────────────────────────────────
// This table stores OAuth provider information (GitHub, Google, etc.)
// Following NextAuth.js adapter schema conventions
export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(), // "oauth", "email", etc.
    provider: varchar("provider", { length: 255 }).notNull(), // "github", "google", etc.
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(), // GitHub user ID
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    index("accounts_user_id_idx").on(table.userId),
    index("accounts_provider_idx").on(table.provider),
  ]
);

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
