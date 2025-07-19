import {
  pgTable,
  text,
  varchar,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { timestamps } from ".";

export const users = pgTable("users", {
  id: varchar("id", { length: 30 }).primaryKey(),
  email: text("email").notNull().unique(),
  imageUrl: text("image_url"),
  ...timestamps,
});

export const usersEmailIdx = uniqueIndex("users_email_idx").on(users.email);
export const usersCreatedAtIdx = index("users_created_at_idx").on(
  users.createdAt
);
