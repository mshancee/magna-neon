import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  unique,
  text,
  index,
} from "drizzle-orm/pg-core";
import { userRoleEnum, userStatusEnum } from "./enums";

// ─── USERS TABLE ────────────────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    image: text("image"), // Profile image URL (GitHub avatar or uploaded image)
    countryCode: varchar("country_code", { length: 2 }).default("KE").notNull(), // ISO alpha-2
    country: varchar("country", { length: 100 }), // full country name from i18n-iso-countries
    role: userRoleEnum("role").default("user").notNull(),
    status: userStatusEnum("status").default("inactive").notNull(),
    passwordHash: text("password_hash"), // Optional for OAuth users
    referralCode: varchar("referral_code", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("users_email_unique").on(table.email),
    unique("users_referral_code_unique").on(table.referralCode),
    index("users_status_idx").on(table.status),
    index("users_created_at_idx").on(table.createdAt),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
