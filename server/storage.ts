import { openHouses, users, type OpenHouse, type InsertOpenHouse, type UpdateOpenHouse, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers?(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: any;
  
  // Open house methods (now user-specific)
  getOpenHouse(id: number, userId: number): Promise<OpenHouse | undefined>;
  getAllOpenHouses(userId: number): Promise<OpenHouse[]>;
  createOpenHouse(openHouse: InsertOpenHouse, userId: number): Promise<OpenHouse>;
  updateOpenHouse(id: number, updates: UpdateOpenHouse, userId: number): Promise<OpenHouse | undefined>;
  deleteOpenHouse(id: number, userId: number): Promise<boolean>;
  getStats(userId: number): Promise<{ total: number; thisWeek: number; nextWeek: number; visited: number; notVisited: number; liked: number; disliked: number }>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Open house methods (now user-specific)
  async getOpenHouse(id: number, userId: number): Promise<OpenHouse | undefined> {
    const [openHouse] = await db
      .select()
      .from(openHouses)
      .where(eq(openHouses.id, id).and(eq(openHouses.userId, userId)));
    return openHouse || undefined;
  }

  async getAllOpenHouses(userId: number): Promise<OpenHouse[]> {
    const houses = await db
      .select()
      .from(openHouses)
      .where(eq(openHouses.userId, userId));
    return houses.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async createOpenHouse(insertOpenHouse: InsertOpenHouse, userId: number): Promise<OpenHouse> {
    const [openHouse] = await db
      .insert(openHouses)
      .values({
        ...insertOpenHouse,
        userId,
        visited: insertOpenHouse.visited || false,
        favorited: insertOpenHouse.favorited || false,
      })
      .returning();
    return openHouse;
  }

  async updateOpenHouse(id: number, updates: UpdateOpenHouse, userId: number): Promise<OpenHouse | undefined> {
    const [updated] = await db
      .update(openHouses)
      .set(updates)
      .where(eq(openHouses.id, id).and(eq(openHouses.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async deleteOpenHouse(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(openHouses)
      .where(eq(openHouses.id, id).and(eq(openHouses.userId, userId)));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getStats(userId: number): Promise<{ total: number; thisWeek: number; nextWeek: number; visited: number; notVisited: number; liked: number; disliked: number }> {
    const houses = await db
      .select()
      .from(openHouses)
      .where(eq(openHouses.userId, userId));
    const total = houses.length;
    const visited = houses.filter(h => h.visited).length;
    const notVisited = houses.filter(h => !h.visited).length;
    const liked = houses.filter(h => h.favorited).length;
    const disliked = houses.filter(h => h.disliked).length;
    
    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
    const startOfNextWeek = new Date();
    startOfNextWeek.setHours(0, 0, 0, 0);
    startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);
    const endOfNextWeek = new Date(startOfNextWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const thisWeek = houses.filter(h => {
      // Parse date without timezone issues
      const dateParts = h.date.split('-').map(Number);
      const houseDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      return houseDate >= startOfToday && houseDate < endOfWeek;
    }).length;
    
    const nextWeek = houses.filter(h => {
      // Parse date without timezone issues
      const dateParts = h.date.split('-').map(Number);
      const houseDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      return houseDate >= startOfNextWeek && houseDate < endOfNextWeek;
    }).length;

    return { total, thisWeek, nextWeek, visited, notVisited, liked, disliked };
  }
}

export const storage = new DatabaseStorage();
