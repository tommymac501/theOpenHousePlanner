import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const openHouses = pgTable("open_houses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
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
});

export const usersRelations = relations(users, ({ many }) => ({
  openHouses: many(openHouses),
}));

export const openHousesRelations = relations(openHouses, ({ one }) => ({
  user: one(users, {
    fields: [openHouses.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertOpenHouseSchema = createInsertSchema(openHouses).omit({
  id: true,
  userId: true,
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
  userId: true,
  createdAt: true,
}).partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertOpenHouse = z.infer<typeof insertOpenHouseSchema>;
export type UpdateOpenHouse = z.infer<typeof updateOpenHouseSchema>;
export type OpenHouse = typeof openHouses.$inferSelect;
