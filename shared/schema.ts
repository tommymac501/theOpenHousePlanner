import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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
