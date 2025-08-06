import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const openHouses = pgTable("open_houses", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  price: text("price").notNull(),
  zestimate: text("zestimate"),
  monthlyPayment: text("monthly_payment"), // Estimated monthly payment
  date: text("date").notNull(),
  time: text("time").notNull(),
  imageUrl: text("image_url"),
  imageData: text("image_data"), // Base64 encoded image data
  listingUrl: text("listing_url"), // URL to the original listing
  notes: text("notes"),
  visited: boolean("visited").default(false),
  favorited: boolean("favorited").default(false),
  disliked: boolean("disliked").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: integer("user_id"), // Optional user association
});

export const insertOpenHouseSchema = createInsertSchema(openHouses).omit({
  id: true,
  createdAt: true,
}).extend({
  zestimate: z.string().nullish().transform(val => val || ""),
  monthlyPayment: z.string().nullish().transform(val => val || ""),
  imageUrl: z.string().nullish().transform(val => val || ""),
  imageData: z.string().nullish().transform(val => val || ""),
  listingUrl: z.string().nullish().transform(val => val || ""),
  notes: z.string().nullish().transform(val => val || ""),
});

export const updateOpenHouseSchema = createInsertSchema(openHouses).omit({
  id: true,
  createdAt: true,
}).partial();

export type InsertOpenHouse = z.infer<typeof insertOpenHouseSchema>;
export type UpdateOpenHouse = z.infer<typeof updateOpenHouseSchema>;
export type OpenHouse = typeof openHouses.$inferSelect;

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sessions table for express-session
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User auth schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type User = typeof users.$inferSelect;
export type SafeUser = Omit<User, 'password'>;
