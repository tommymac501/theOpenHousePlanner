import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function ensureDemoUser() {
  try {
    // Try to get demo user, create if doesn't exist
    const existingUser = await storage.getUser("demo-user");
    if (!existingUser) {
      console.log("Creating demo user...");
      await storage.upsertUser({
        id: "demo-user",
        email: "demo@openhouseplanner.com",
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: null,
      });
      console.log("Demo user created successfully");
    } else {
      console.log("Demo user already exists");
    }
  } catch (error) {
    console.error("Failed to ensure demo user exists:", error);
    // Don't crash the app, just log the error
  }
}

(async () => {
  // Ensure demo user exists before starting server
  await ensureDemoUser();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use Render's PORT environment variable or default to 5000 for local development
  const port = parseInt(process.env.PORT || "5000", 10);
  
  // Add timeout configurations for production deployment
  server.keepAliveTimeout = 120000; // 120 seconds
  server.headersTimeout = 120000; // 120 seconds
  
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
