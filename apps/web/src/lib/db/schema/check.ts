import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { nanoid, timestamps } from ".";
import { users } from "./user";

export const checks = pgTable(
  "checks",
  {
    id: varchar("id", { length: 30 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    userId: varchar("user_id", { length: 30 })
      .notNull()
      .references(() => users.id),
    textId: varchar("text_id", { length: 30 })
      .notNull()
      .references(() => texts.id),
    result: jsonb("result"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    ...timestamps,
  },
  (table) => [
    index("checks_user_id_idx").on(table.userId),
    index("checks_slug_idx").on(table.slug),
    index("checks_text_id_idx").on(table.textId),
    index("checks_status_idx")
      .on(table.status)
      .where(sql`status = 'pending'`),
    index("checks_created_at_idx").on(table.createdAt),
  ]
);

export const texts = pgTable(
  "texts",
  {
    id: varchar("id", { length: 30 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    hash: varchar("hash", { length: 64 }).notNull().unique(),
    content: text("content").notNull(),
    wordCount: varchar("word_count", { length: 10 }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("texts_hash_idx").on(table.hash),
    index("texts_word_count_idx").on(table.wordCount),
    index("texts_created_at_idx").on(table.createdAt),
  ]
);
