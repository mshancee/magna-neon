// ────────────────────────────────────────────────────────────────
// CENTRALIZED ENUMS FOR BETTER MAINTAINABILITY
// All PostgreSQL enums in one place for consistency and reusability
// ────────────────────────────────────────────────────────────────

import { pgEnum } from "drizzle-orm/pg-core";

// ─── USER ENUMS ─────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const userStatusEnum = pgEnum("user_status", [
  "inactive",
  "active",
  "banned",
]);

// ─── TYPE EXPORTS ───────────────────────────────────────────────
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type UserStatus = (typeof userStatusEnum.enumValues)[number];
