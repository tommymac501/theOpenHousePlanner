import { openHouses, type OpenHouse, type InsertOpenHouse, type UpdateOpenHouse } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getOpenHouse(id: number): Promise<OpenHouse | undefined>;
  getAllOpenHouses(): Promise<OpenHouse[]>;
  createOpenHouse(openHouse: InsertOpenHouse): Promise<OpenHouse>;
  updateOpenHouse(id: number, updates: UpdateOpenHouse): Promise<OpenHouse | undefined>;
  deleteOpenHouse(id: number): Promise<boolean>;
  getStats(): Promise<{ total: number; thisWeek: number; visited: number }>;
}

export class DatabaseStorage implements IStorage {
  async getOpenHouse(id: number): Promise<OpenHouse | undefined> {
    const [openHouse] = await db.select().from(openHouses).where(eq(openHouses.id, id));
    return openHouse || undefined;
  }

  async getAllOpenHouses(): Promise<OpenHouse[]> {
    const houses = await db.select().from(openHouses);
    return houses.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async createOpenHouse(insertOpenHouse: InsertOpenHouse): Promise<OpenHouse> {
    const [openHouse] = await db
      .insert(openHouses)
      .values({
        ...insertOpenHouse,
        visited: insertOpenHouse.visited || false,
        favorited: insertOpenHouse.favorited || false,
      })
      .returning();
    return openHouse;
  }

  async updateOpenHouse(id: number, updates: UpdateOpenHouse): Promise<OpenHouse | undefined> {
    const [updated] = await db
      .update(openHouses)
      .set(updates)
      .where(eq(openHouses.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteOpenHouse(id: number): Promise<boolean> {
    const result = await db.delete(openHouses).where(eq(openHouses.id, id));
    return result.rowCount > 0;
  }

  async getStats(): Promise<{ total: number; thisWeek: number; visited: number }> {
    const houses = await db.select().from(openHouses);
    const total = houses.length;
    const visited = houses.filter(h => h.visited).length;
    
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thisWeek = houses.filter(h => {
      const houseDate = new Date(h.date);
      return houseDate >= now && houseDate <= oneWeekFromNow;
    }).length;

    return { total, thisWeek, visited };
  }
}

export const storage = new DatabaseStorage();
