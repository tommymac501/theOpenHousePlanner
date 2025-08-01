import {
  openHouses,
  users,
  type OpenHouse,
  type InsertOpenHouse,
  type UpdateOpenHouse,
  type User,
  type UpsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Open House operations
  getOpenHouse(id: number): Promise<OpenHouse | undefined>;
  getAllOpenHouses(): Promise<OpenHouse[]>;
  createOpenHouse(openHouse: InsertOpenHouse): Promise<OpenHouse>;
  updateOpenHouse(id: number, updates: UpdateOpenHouse): Promise<OpenHouse | undefined>;
  deleteOpenHouse(id: number): Promise<boolean>;
  getStats(): Promise<{ total: number; thisWeek: number; nextWeek: number; visited: number; notVisited: number; liked: number; disliked: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error: any) {
      // If there's a unique constraint error on email, try to get the existing user
      if (error.code === '23505' && error.constraint === 'users_email_unique') {
        const existingUser = await db.select().from(users).where(eq(users.email, userData.email!)).limit(1);
        if (existingUser.length > 0) {
          return existingUser[0];
        }
      }
      throw error;
    }
  }
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
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getStats(): Promise<{ total: number; thisWeek: number; nextWeek: number; visited: number; notVisited: number; liked: number; disliked: number }> {
    const houses = await db.select().from(openHouses);
    const total = houses.length;
    const visited = houses.filter(h => h.visited).length;
    const notVisited = houses.filter(h => !h.visited).length;
    const liked = houses.filter(h => h.favorited).length;
    const disliked = houses.filter(h => h.disliked).length;
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
    const startOfNextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    const endOfNextWeek = new Date(startOfNextWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const thisWeek = houses.filter(h => {
      const houseDate = new Date(h.date);
      return houseDate >= startOfToday && houseDate < endOfWeek;
    }).length;
    
    const nextWeek = houses.filter(h => {
      const houseDate = new Date(h.date);
      return houseDate >= startOfNextWeek && houseDate < endOfNextWeek;
    }).length;

    return { total, thisWeek, nextWeek, visited, notVisited, liked, disliked };
  }
}

export const storage = new DatabaseStorage();
