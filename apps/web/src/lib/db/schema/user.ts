import {
  pgTable,
  text,
  varchar,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { timestamps } from ".";

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 30 }).primaryKey(),
    email: text("email").notNull().unique(),
    imageUrl: text("image_url"),
    ...timestamps,
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
    createdAtIdx: index("users_created_at_idx").on(table.createdAt),
  })
);
