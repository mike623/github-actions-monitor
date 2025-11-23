import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // References auth.users.id
  name: text("name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const monitoredRepos = pgTable("monitored_repo", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  owner: text("owner").notNull(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(), // owner/name
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastCheckedAt: timestamp("last_checked_at"),
  etag: text("etag"),
  workflowRunsCache: text("workflow_runs_cache"), // Storing JSON as text for simplicity in SQLite/Postgres compatibility
});
