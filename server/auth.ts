import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { SafeUser } from '@shared/schema';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    user?: SafeUser;
  }
}

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized - please log in' });
  }
  next();
};

export const getCurrentUser = async (req: Request): Promise<SafeUser | null> => {
  if (!req.session.userId) {
    return null;
  }

  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, req.session.userId));

    return user || null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

export const attachUser = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    const user = await getCurrentUser(req);
    req.session.user = user || undefined;
  }
  next();
};