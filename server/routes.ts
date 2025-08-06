import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOpenHouseSchema, updateOpenHouseSchema, registerSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import { scrapePropertyDetails } from "./scraper";
import { extractTextFromImage } from "./ocr";
import { requireAuth, attachUser, hashPassword, comparePassword, getCurrentUser } from "./auth";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Attach user to all requests
  app.use(attachUser);

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = registerSchema.parse(req.body);
      
      // Check if user already exists
      const [existingUser] = await db.select().from(users).where(eq(users.email, email));
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const [newUser] = await db.insert(users).values({
        name,
        email,
        password: hashedPassword,
      }).returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      });

      // Set session
      req.session.userId = newUser.id;
      req.session.user = newUser;

      res.status(201).json({ user: newUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Check password
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      };

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    res.json({ user });
  });

  // Protected routes - add requireAuth middleware to routes that need authentication
  // Get all open houses
  app.get("/api/open-houses", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.session.userId);
      console.log("API: Fetching all open houses for user:", userId);
      const openHouses = await storage.getAllOpenHouses(userId);
      console.log("API: Successfully fetched", openHouses.length, "open houses");
      res.json(openHouses);
    } catch (error) {
      console.error("API: Error fetching open houses:", error);
      res.status(500).json({ message: "Failed to fetch open houses", error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  // Get single open house
  app.get("/api/open-houses/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.session.userId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const openHouse = await storage.getOpenHouse(id, userId);
      if (!openHouse) {
        return res.status(404).json({ message: "Open house not found" });
      }

      res.json(openHouse);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch open house" });
    }
  });

  // Create open house
  app.post("/api/open-houses", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.session.userId);
      const validatedData = insertOpenHouseSchema.parse({
        ...req.body,
        userId: userId
      });
      const openHouse = await storage.createOpenHouse(validatedData);
      res.status(201).json(openHouse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create open house" });
    }
  });

  // Update open house
  app.patch("/api/open-houses/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.session.userId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const validatedData = updateOpenHouseSchema.parse(req.body);
      const openHouse = await storage.updateOpenHouse(id, userId, validatedData);
      
      if (!openHouse) {
        return res.status(404).json({ message: "Open house not found" });
      }

      res.json(openHouse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update open house" });
    }
  });

  // Delete open house
  app.delete("/api/open-houses/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const userId = parseInt(req.session.userId);
      const deleted = await storage.deleteOpenHouse(id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Open house not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete open house" });
    }
  });

  // Get stats
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.session.userId);
      console.log("API: Fetching stats for user:", userId);
      const stats = await storage.getStats(userId);
      console.log("API: Successfully fetched stats:", stats);
      res.json(stats);
    } catch (error) {
      console.error("API: Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats", error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  // Parse listing data
  app.post("/api/parse-listing", requireAuth, async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ message: "Text is required" });
      }

      console.log("Parsing text (first 300 chars):", text.substring(0, 300));
      
      // Parse listing text for property details
      const parsed = parseListingText(text);
      
      console.log("Parsed result:", parsed);
      
      // Check for URLs that might contain property images
      const urlPattern = /https?:\/\/[^\s\n\r]+/gi;
      const urls = text.match(urlPattern);
      
      if (urls && urls.length > 0) {
        // First check for direct image URLs
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        for (const url of urls) {
          if (imageExtensions.some(ext => url.toLowerCase().includes(ext))) {
            parsed.imageUrl = url;
            break;
          }
        }
      }
      
      // Check if we found at least an address or price
      if (!parsed.address && !parsed.price) {
        console.log("No address or price found in text");
        return res.status(400).json({ 
          message: "Could not extract property details from the provided text. Please ensure you're copying from a property listing page." 
        });
      }

      res.json(parsed);
    } catch (error) {
      console.error("Parse listing error:", error);
      res.status(500).json({ message: "Failed to parse clipboard data" });
    }
  });

  // OCR endpoint for image text extraction
  app.post("/api/ocr-parse", requireAuth, async (req, res) => {
    try {
      const { imageData } = req.body;
      if (!imageData || typeof imageData !== 'string') {
        return res.status(400).json({ message: "Image data is required" });
      }

      console.log("Extracting text from image using OCR...");
      
      // Extract text from image using Anthropic
      const extractedText = await extractTextFromImage(imageData);
      
      console.log("Extracted text (first 300 chars):", extractedText.substring(0, 300));
      
      // Use the same parsing logic as the text parser
      const parsed = parseListingText(extractedText);
      
      console.log("Parsed result from OCR:", parsed);
      
      // Check if we found at least an address or price
      if (!parsed.address && !parsed.price) {
        console.log("No address or price found in OCR text");
        return res.status(400).json({ 
          message: "Could not extract property details from the image. Please ensure the image contains a clear property listing." 
        });
      }

      res.json(parsed);
    } catch (error) {
      console.error("OCR parsing error:", error);
      res.status(500).json({ message: "Failed to extract text from image" });
    }
  });

  // Scrape URL
  app.post("/api/scrape-url", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ message: "URL is required" });
      }

      // Validate URL
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ message: "Invalid URL format" });
      }

      console.log("Scraping URL:", url);
      const scraped = await scrapePropertyDetails(url);
      
      // Convert to format compatible with form
      const result: any = {};
      if (scraped.price) result.price = scraped.price;
      if (scraped.address) result.address = scraped.address;
      if (scraped.date) {
        // Try to parse the date into YYYY-MM-DD format
        const dateStr = scraped.date;
        const currentYear = new Date().getFullYear();
        
        // Handle formats like "Saturday, June 21" or "Sat, Jun 21"
        const dateMatch = dateStr.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[^,]*,\s*(\w+)\s+(\d+)/i);
        if (dateMatch) {
          const month = dateMatch[2];
          const day = parseInt(dateMatch[3]);
          
          // Convert month name to number
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthIndex = monthNames.findIndex(m => month.toLowerCase().startsWith(m.toLowerCase()));
          
          if (monthIndex !== -1) {
            const parsedDate = new Date(currentYear, monthIndex, day);
            // Use local date formatting to avoid timezone conversion issues
            const year = parsedDate.getFullYear();
            const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
            const dayPadded = String(parsedDate.getDate()).padStart(2, '0');
            result.date = `${year}-${month}-${dayPadded}`;
          } else {
            result.notes = `Open house: ${dateStr}`;
          }
        } else {
          result.notes = `Open house: ${dateStr}`;
        }
      }
      if (scraped.time) result.time = scraped.time;
      if (scraped.imageUrl) result.imageUrl = scraped.imageUrl;
      
      // Add original URL as notes
      if (!result.notes) result.notes = '';
      if (result.notes) result.notes += '\n\n';
      result.notes += `Source: ${url}`;
      if (scraped.notes) result.notes += `\n\n${scraped.notes}`;

      console.log("Scraped result:", result);
      res.json(result);
    } catch (error) {
      console.error("Scraping error:", error);
      res.status(500).json({ message: "Failed to scrape property details" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function parseListingText(text: string) {
  const result: Partial<{
    address: string;
    price: string;
    zestimate: string;
    monthlyPayment: string;
    date: string;
    time: string;
    notes: string;
    imageUrl: string;
  }> = {
    zestimate: "Not available" // Default when no Zestimate found
  };
  
  // Extract address - universal patterns for all real estate sites
  const addressPatterns = [
    // Full format with ZIP: 123 Main Street, City, ST 12345 (case insensitive)
    /\d+\s+[A-Za-z0-9\s\-'\.]+(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Drive|Dr\.?|Lane|Ln\.?|Boulevard|Blvd\.?|Way|Circle|Cir\.?|Court|Ct\.?|Place|Pl\.?|Parkway|Pkwy\.?|Trail|Tr\.?)\s*,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5}/i,
    // With apartment/unit: 123 Main St Unit 4A, City, ST 12345
    /\d+\s+[A-Za-z0-9\s\-'\.]+(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Drive|Dr\.?|Lane|Ln\.?|Boulevard|Blvd\.?|Way|Circle|Cir\.?|Court|Ct\.?|Place|Pl\.?|Parkway|Pkwy\.?|Trail|Tr\.?)(?:\s+(?:Unit|Apt|#)\s*[A-Za-z0-9]+)?\s*,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5}/i,
    // Without ZIP: 123 Main Street, City, ST
    /\d+\s+[A-Za-z0-9\s\-'\.]+(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Drive|Dr\.?|Lane|Ln\.?|Boulevard|Blvd\.?|Way|Circle|Cir\.?|Court|Ct\.?|Place|Pl\.?|Parkway|Pkwy\.?|Trail|Tr\.?)\s*,\s*[A-Za-z\s]+,\s*[A-Z]{2}/i,
    // Basic street address: 123 Main Street (but not if preceded by property details)
    /(?<!(?:beds|baths?|sqft|sq\s*ft)\s*)\d+\s+[A-Za-z0-9\s\-'\.]+\s+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Circle|Cir|Court|Ct|Place|Pl|Parkway|Pkwy|Trail|Tr)\b/i
  ];
  
  for (const pattern of addressPatterns) {
    const addressMatch = text.match(pattern);
    if (addressMatch) {
      let address = addressMatch[0].trim();
      
      // Remove any leading price pattern like "$310,000\n" or partial prices
      address = address.replace(/^\$[\d,]+\s*\n?\s*/, '');
      address = address.replace(/^\d{3}\s*\n?\s*/, ''); // Remove partial price fragments
      
      // Remove common OCR artifacts that get prepended to addresses
      address = address.replace(/^(?:sqft|sq ft|beds|baths|bath)\s*/gi, '');
      address = address.replace(/^\d+\s*(?:sqft|sq ft|beds|baths|bath)\s*/gi, '');
      
      // Format address properly - capitalize each word except state abbreviations and ZIP codes
      address = address.replace(/\b\w+/g, (word) => {
        // Keep state abbreviations (2 letters) and ZIP codes (5 digits) as-is
        if (/^[A-Z]{2}$/.test(word) || /^\d{5}$/.test(word)) return word;
        
        // Capitalize first letter, lowercase the rest for all other words
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      });
      
      result.address = address;
      break;
    }
  }
  
  // Parse from top down and stop at "Facts & features" to avoid nearby listings
  const stopKeywords = ['Facts & features', 'Nearby homes', 'Local experts', 'Schools provided by'];
  let relevantText = text;
  
  for (const keyword of stopKeywords) {
    const stopIndex = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (stopIndex !== -1) {
      relevantText = text.substring(0, stopIndex);
      break;
    }
  }

  // Extract listing price - universal approach for all real estate sites
  // Look in the first 1000 characters where main price typically appears
  const topSection = text.substring(0, 1000);
  
  // Universal price patterns (excluding estimates like Zestimate, RentBerry, etc.)
  const pricePatterns = [
    /\$[\d,]+(?!\s*(?:Zestimate|RentBerry|Estimate|AVG|Per Month|\/mo))/gi, // Standard: $310,000
    /\$\d{3,}[kK](?!\s*(?:Zestimate|RentBerry|Estimate))/gi, // Abbreviated: $850k
    /\$\d+(?:\.\d)?[mM](?!\s*(?:Zestimate|RentBerry|Estimate))/gi, // Millions: $1.2M
  ];
  
  for (const pattern of pricePatterns) {
    const matches = topSection.match(pattern);
    if (matches && matches.length > 0) {
      // Get the first match that looks like a full price (not a partial)
      for (const priceMatch of matches) {
        if (priceMatch.replace(/[$,]/g, '').length >= 5) { // At least 5 digits for realistic price
          let cleanPrice = priceMatch.replace(/[$,]/g, '');
          
          // Handle k/K and m/M suffixes
          if (cleanPrice.toLowerCase().includes('k')) {
            cleanPrice = (parseFloat(cleanPrice.replace(/k/gi, '')) * 1000).toString();
          } else if (cleanPrice.toLowerCase().includes('m')) {
            cleanPrice = (parseFloat(cleanPrice.replace(/m/gi, '')) * 1000000).toString();
          }
          
          const numPrice = parseInt(cleanPrice);
          if (numPrice >= 50000 && numPrice <= 50000000) {
            result.price = cleanPrice;
            break;
          }
        }
      }
      if (result.price) break;
    }
  }
  
  // Extract estimates (Zestimate, RentBerry, automated valuations, etc.)
  const estimatePatterns = [
    /\$[\d,]+\s*Zestimate/i,
    /\$[\d,]+\s*RentBerry/i,
    /\$[\d,]+\s*(?:Automated\s*)?(?:Valuation|Estimate)/i,
    /\$[\d,]+\s*(?:AVM|AVG)/i
  ];
  
  for (const pattern of estimatePatterns) {
    const estimateMatch = relevantText.match(pattern);
    if (estimateMatch) {
      const estimate = estimateMatch[0].replace(/\s*(?:Zestimate|RentBerry|Automated\s*Valuation|Estimate|AVM|AVG)/i, '');
      let cleanEstimate = estimate.replace(/[$,]/g, '');
      const numEstimate = parseInt(cleanEstimate);
      if (numEstimate >= 50000 && numEstimate <= 50000000) {
        result.zestimate = cleanEstimate;
        break;
      }
    }
  }
  
  // Fallback: if no listing price found, use general price patterns
  if (!result.price) {
    const pricePatterns = [
      /\$[\d,]{3,}(?:\.\d{2})?(?!\d)/g, // $850,000 or $1,200,000
      /\$\d{3,}[kK](?!\d)/g, // $850k
      /\$\d+(?:\.\d)?[mM](?!\d)/g, // $1.2M
      /\$\d{6,}(?!\d)/g, // $850000 (6+ digits)
      /\$\d{5}(?!\d)/g, // $50000 (5 digits)
    ];
    
    for (const pattern of pricePatterns) {
      const matches = relevantText.match(pattern);
      if (matches && matches.length > 0) {
        // Get the first match that's not a Zestimate
        for (const match of matches) {
          if (!relevantText.includes(match + ' Zestimate')) {
            let cleanPrice = match.replace(/[$,]/g, '');
            
            if (cleanPrice.toLowerCase().includes('k')) {
              cleanPrice = (parseFloat(cleanPrice.replace(/k/gi, '')) * 1000).toString();
            } else if (cleanPrice.toLowerCase().includes('m')) {
              cleanPrice = (parseFloat(cleanPrice.replace(/m/gi, '')) * 1000000).toString();
            }
            
            const numPrice = parseInt(cleanPrice);
            if (numPrice >= 50000 && numPrice <= 50000000) {
              result.price = cleanPrice;
              break;
            }
          }
        }
        if (result.price) break;
      }
    }
  }

  // Extract monthly payment estimates
  const paymentPatterns = [
    /Est\.\s*\$[\d,]+\/mo/gi, // Est. $2,602/mo (Zillow format)
    /\$[\d,]+\/mo(?:nth)?\s*(?:Get pre-qualified|Est\.?)?/gi, // $2,500/mo Get pre-qualified
    /\$[\d,]+\s*per month/gi, // $2,500 per month
    /\$[\d,]+\s*\/\s*mo/gi, // $2,500 / mo
    /\$[\d,]+\s*monthly/gi, // $2,500 monthly
    /Estimated.*?\$[\d,]+\/mo/gi, // Estimated payment $2,500/mo
  ];
  
  for (const pattern of paymentPatterns) {
    const paymentMatch = text.match(pattern);
    if (paymentMatch) {
      // Get the first reasonable payment amount
      for (const match of paymentMatch) {
        // Extract just the dollar amount
        const dollarMatch = match.match(/\$[\d,]+/);
        if (dollarMatch) {
          let cleanPayment = dollarMatch[0].replace(/[$,]/g, '');
          const numPayment = parseInt(cleanPayment);
          
          // Reasonable monthly payment range: $500 - $15,000
          if (numPayment >= 500 && numPayment <= 15000) {
            result.monthlyPayment = cleanPayment;
            break;
          }
        }
      }
      if (result.monthlyPayment) break;
    }
  }

  // Validate monthly payment against property price if both are available
  if (result.monthlyPayment && result.price) {
    console.log(`Validating payment: ${result.monthlyPayment} for price: ${result.price}`);
    const propertyPrice = parseInt(result.price.toString().replace(/[$,]/g, ''));
    const monthlyPayment = parseInt(result.monthlyPayment.toString().replace(/[$,]/g, ''));
    
    // Typical monthly payment is 0.4-0.8% of property price per month
    const expectedMin = Math.floor(propertyPrice * 0.004); // 0.4%
    const expectedMax = Math.ceil(propertyPrice * 0.008); // 0.8%
    const expectedMid = Math.floor(propertyPrice * 0.006); // 0.6% (typical)
    
    console.log(`Expected payment range: $${expectedMin} - $${expectedMax}, typical: $${expectedMid}`);
    console.log(`Actual payment: $${monthlyPayment}`);
    
    // Check for OCR error where 2 is read as 1 (common issue)
    const paymentStr = result.monthlyPayment;
    if (paymentStr.startsWith('1')) {
      const correctedPayment = '2' + paymentStr.substring(1);
      const correctedNum = parseInt(correctedPayment);
      
      // If the corrected payment (2xxx) is closer to expected mid-range than original (1xxx)
      const originalDistance = Math.abs(monthlyPayment - expectedMid);
      const correctedDistance = Math.abs(correctedNum - expectedMid);
      
      console.log(`OCR check: Original $${monthlyPayment} (distance: ${originalDistance}) vs Corrected $${correctedNum} (distance: ${correctedDistance})`);
      
      if (correctedDistance < originalDistance && correctedNum <= expectedMax) {
        console.log(`OCR correction applied: ${result.monthlyPayment} -> ${correctedPayment} (closer to expected $${expectedMid} for $${propertyPrice} property)`);
        result.monthlyPayment = correctedPayment;
      } else {
        console.log(`OCR correction not applied: corrected payment not better match`);
      }
    }
  } else {
    console.log(`Validation skipped - monthlyPayment: ${result.monthlyPayment}, price: ${result.price}`);
  }

  // Split text into lines for processing
  const lines = relevantText.split('\n').map(line => line.trim());

  // Extract date and time - universal patterns for all real estate sites
  // Pattern 1: "Open house" followed by date and time (Zillow style)
  const openHouseMatch1 = text.match(/Open house\s*\n?\s*([A-Za-z]+,\s*[A-Za-z]+\s*\d+)\s*\n?\s*(\d{1,2}:\d{2}\s*[AP]M\s*-\s*\d{1,2}:\d{2}\s*[AP]M)/i);
  
  // Pattern 2: "Open House:" followed by date and time (Realtor.com style)
  const openHouseMatch2 = text.match(/Open House:\s*([A-Za-z]+,\s*[A-Za-z]+\s*\d+(?:,?\s*\d{4})?)\s*(\d{1,2}:\d{2}\s*[AP]M\s*-\s*\d{1,2}:\d{2}\s*[AP]M)/i);
  
  // Pattern 3: Generic date with time
  const dateTimeMatch = text.match(/([A-Za-z]+,\s*[A-Za-z]+\s*\d+(?:,?\s*\d{4})?)\s*(\d{1,2}:\d{2}\s*[AP]M\s*-\s*\d{1,2}:\d{2}\s*[AP]M)/i);
  
  const matches = [openHouseMatch1, openHouseMatch2, dateTimeMatch].filter(Boolean);
  
  if (matches.length > 0) {
    const match = matches[0];
    if (match && match[1] && match[2]) {
      const dateStr = match[1]; // "Sat, Jun 21" or "Saturday, January 15th"
      const timeStr = match[2]; // "12:00 PM - 2:00 PM"
    
    result.time = timeStr;
    
    // Try to parse the date
    try {
      const currentYear = new Date().getFullYear();
      let dateToParseString = dateStr;
      
      // Add current year if not present
      if (!dateStr.includes(currentYear.toString())) {
        dateToParseString = `${dateStr} ${currentYear}`;
      }
      
      const parsedDate = new Date(dateToParseString);
      if (!isNaN(parsedDate.getTime())) {
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        result.date = `${year}-${month}-${day}`;
      }
    } catch (e) {
      // If date parsing fails, just use the time
    }
    }
  }
  
  // Fallback time patterns if the above doesn't work
  if (!result.time) {
    const timePatterns = [
      // Open house time ranges
      /(?:open\s*house[:\s]*)?(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)\s*[-–to\s]+\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/gi,
      // Simple time ranges
      /\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?\s*[-–to\s]+\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?/gi,
      // Single times (less preferred)
      /\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/gi
    ];
    
    for (const pattern of timePatterns) {
      const match = relevantText.match(pattern);
      if (match) {
        result.time = match[0].trim().replace(/^open\s*house[:\s]*/i, '');
        break;
      }
    }
  }

  // Extract property details for notes
  let propertyDetails = [];
  
  // Look for patterns like "$468,000 3 2 2,086" or "3 2 2,086" - beds baths sqft without labels
  const propertyLinePattern = /(?:\$[\d,]+\s+)?(\d+)\s+(\d+(?:\.\d+)?)\s+([\d,]+)/;
  const propertyMatch = relevantText.match(propertyLinePattern);
  
  if (propertyMatch) {
    const [, beds, baths, sqft] = propertyMatch;
    
    // Validate these are reasonable property values
    const bedsNum = parseInt(beds);
    const bathsNum = parseFloat(baths);
    const sqftNum = parseInt(sqft.replace(/,/g, ''));
    
    // Make sure we're not matching a price or ZIP code
    if (bedsNum >= 1 && bedsNum <= 20 && bathsNum >= 1 && bathsNum <= 20 && sqftNum >= 200 && sqftNum <= 50000) {
      propertyDetails.push(`${beds} beds`);
      propertyDetails.push(`${baths} baths`);
      propertyDetails.push(`${sqft} sqft`);
    }
  }
  
  // OCR-specific: Handle fragmented text where numbers and labels are separated
  // Pattern for: "3\n2\n2,086\nbeds\nbaths\nsqft" or similar OCR output
  if (propertyDetails.length === 0) {
    const lines = relevantText.split(/[\n\r]+/).map(l => l.trim()).filter(l => l);
    // Look for sequence of numbers followed by property labels
    let bedsValue = null, bathsValue = null, sqftValue = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line contains standalone numbers
      if (/^\d+(?:\.\d+)?$/.test(line) || /^\d{1,2}[\s,]*\d{3,4}$/.test(line)) {
        const nextLines = lines.slice(i + 1, i + 4).join(' ').toLowerCase();
        
        // If followed by bed-related words
        if (!bedsValue && /bed/i.test(nextLines)) {
          const num = parseInt(line.replace(/,/g, ''));
          if (num >= 1 && num <= 20) {
            bedsValue = num;
          }
        }
        // If followed by bath-related words
        else if (!bathsValue && /bath/i.test(nextLines)) {
          const num = parseFloat(line);
          if (num >= 1 && num <= 20) {
            bathsValue = num;
          }
        }
        // If followed by sqft-related words
        else if (!sqftValue && /sqft|sq\s*ft/i.test(nextLines)) {
          const num = parseInt(line.replace(/,/g, ''));
          if (num >= 200 && num <= 50000) {
            sqftValue = num;
          }
        }
      }
    }
    
    // Build property details from OCR-extracted values
    if (bedsValue) propertyDetails.push(`${bedsValue} beds`);
    if (bathsValue) propertyDetails.push(`${bathsValue} baths`);
    if (sqftValue) propertyDetails.push(`${sqftValue.toLocaleString()} sqft`);
  }
  
  // If compact pattern didn't work, try individual pattern matching with validation
  if (propertyDetails.length === 0) {
    // Look for beds - exclude any number that's part of a ZIP code followed by "beds"
    const bedsMatches = relevantText.match(/(\d+)\s+(?:bed|bd|bedroom)s?/gi);
    if (bedsMatches) {
      for (const match of bedsMatches) {
        const fullMatch = match;
        const bedsMatch = match.match(/(\d+)/);
        if (!bedsMatch) continue;
        const beds = parseInt(bedsMatch[1]);
        
        // Find the position of this match in the text
        const matchIndex = relevantText.indexOf(fullMatch);
        const textBefore = relevantText.substring(Math.max(0, matchIndex - 10), matchIndex);
        
        // Skip if this appears to be a ZIP code (5 digits preceded by state)
        const isZipCode = beds > 10000 && textBefore.match(/\b[A-Z]{2}\s*$/);
        
        if (!isZipCode && beds >= 1 && beds <= 20) {
          propertyDetails.push(`${beds} beds`);
          break;
        }
      }
    }
    
    // Look for baths - avoid ZIP codes like the beds logic
    const bathsMatches = relevantText.match(/(\d+(?:\.\d+)?)\s+(?:bath|ba|bathroom)s?/gi);
    if (bathsMatches) {
      for (const match of bathsMatches) {
        const fullMatch = match;
        const bathsMatch = match.match(/(\d+(?:\.\d+)?)/);
        if (!bathsMatch) continue;
        const baths = parseFloat(bathsMatch[1]);
        
        // Find the position of this match in the text
        const matchIndex = relevantText.indexOf(fullMatch);
        const textBefore = relevantText.substring(Math.max(0, matchIndex - 10), matchIndex);
        
        // Skip if this appears to be a ZIP code (5 digits preceded by state)
        const isZipCode = baths > 10000 && textBefore.match(/\b[A-Z]{2}\s*$/);
        
        if (!isZipCode && baths >= 1 && baths <= 20) {
          propertyDetails.push(`${baths} baths`);
          break;
        }
      }
    }
    
    // Look for square footage
    const sqftMatches = relevantText.match(/([\d,]+)\s+(?:sqft|sq\s*ft)/gi);
    if (sqftMatches) {
      for (const match of sqftMatches) {
        const sqftMatch = match.match(/([\d,]+)/);
        if (!sqftMatch || !sqftMatch[1]) continue;
        const sqft = parseInt(sqftMatch[1].replace(/,/g, ''));
        if (sqft >= 200 && sqft <= 50000) {
          propertyDetails.push(`${sqftMatch[1]} sqft`);
          break;
        }
      }
    }
  }
  
  // Extract garage information
  const garageMatch = relevantText.match(/(\d+)[-\s]*(?:car\s+)?garage/i);
  if (garageMatch) {
    propertyDetails.push(`${garageMatch[1]}-car garage`);
  }
  
  // Extract "Days on Zillow" information - handle multiple formats
  const daysOnZillowMatch = relevantText.match(/(\d+)\s+days?\s+on\s+zillow/i);
  if (daysOnZillowMatch) {
    const daysNum = parseInt(daysOnZillowMatch[1]);
    const dayLabel = daysNum === 1 ? 'day' : 'days';
    propertyDetails.push(`${daysNum} ${dayLabel} on market`);
  }
  
  // Check for pool in the description with specific types
  if (/community\s+pool/i.test(relevantText)) {
    propertyDetails.push('Community Pool');
  } else if ((/private\s+oasis/i.test(relevantText) && /pool/i.test(relevantText)) || /private\s+oasis.*?pool/i.test(relevantText)) {
    // Special case for "PRIVATE OASIS" + pool mentions
    if (/above\s+ground\s+pool/i.test(relevantText)) {
      propertyDetails.push('Private Above Ground Pool');
    } else {
      propertyDetails.push('Private Pool');
    }
  } else if (/private\s+.*pool|private\s+backyard\s+pool/i.test(relevantText)) {
    // Check if it's specified as inground or above ground
    if (/private\s+inground\s+pool/i.test(relevantText)) {
      propertyDetails.push('Private Inground Pool');
    } else if (/private\s+above\s+ground\s+pool/i.test(relevantText)) {
      propertyDetails.push('Private Above Ground Pool');
    } else {
      propertyDetails.push('Private Pool');
    }
  } else if (/inground\s+pool/i.test(relevantText)) {
    propertyDetails.push('Inground Pool');
  } else if (/above\s+ground\s+pool/i.test(relevantText)) {
    propertyDetails.push('Above Ground Pool');
  } else if (/above\s+pool/i.test(relevantText)) {
    propertyDetails.push('Above Ground Pool');
  } else if (/pool/i.test(relevantText)) {
    propertyDetails.push('Pool');
  }

  // Extract estimated monthly payment
  const monthlyPaymentPatterns = [
    /Est\.?\s*:?\s*\$[\d,]+\/mo/i,
    /Estimated\s+payment\s*:?\s*\$[\d,]+\/mo/i,
    /\$[\d,]+\/month/i,
    /Monthly\s+payment\s*:?\s*\$[\d,]+/i
  ];
  
  for (const pattern of monthlyPaymentPatterns) {
    const paymentMatch = relevantText.match(pattern);
    if (paymentMatch) {
      const payment = paymentMatch[0].replace(/Est\.?\s*:?\s*|Estimated\s+payment\s*:?\s*|Monthly\s+payment\s*:?\s*/i, '');
      propertyDetails.push(`Est. Payment: ${payment}`);
      break;
    }
  }

  // Extract HOA information (skip if it shows $-- or $0)
  const hoaPatterns = [
    /\$[\d,]+\s+HOA/i,
    /HOA\s*:?\s*\$[\d,]+/i,
    /HOA\s+fee\s*:?\s*\$[\d,]+/i
  ];
  
  for (const pattern of hoaPatterns) {
    const hoaMatch = relevantText.match(pattern);
    if (hoaMatch) {
      // Skip if it's a placeholder like "$-- HOA" or "$0 HOA"
      if (!/\$(?:--|0+)\s+HOA/i.test(hoaMatch[0]) && !/HOA\s*:?\s*\$(?:--|0+)/i.test(hoaMatch[0])) {
        const hoa = hoaMatch[0].replace(/HOA\s+fee\s*:?\s*/i, 'HOA: ').replace(/\s+HOA/i, ' HOA');
        propertyDetails.push(hoa);
        break;
      }
    }
  }

  // Extract CDD information
  const cddPatterns = [
    /\$[\d,]+\s+CDD/i,
    /CDD\s*:?\s*\$[\d,]+/i,
    /CDD\s+fee\s*:?\s*\$[\d,]+/i
  ];
  
  for (const pattern of cddPatterns) {
    const cddMatch = relevantText.match(pattern);
    if (cddMatch) {
      const cdd = cddMatch[0].replace(/CDD\s+fee\s*:?\s*/i, 'CDD: ').replace(/\s+CDD/i, ' CDD');
      propertyDetails.push(cdd);
      break;
    }
  }
  
  // Combine all property details into notes
  if (propertyDetails.length > 0) {
    result.notes = propertyDetails.join(' • ');
  }

  // Extract date patterns - look for open house dates specifically
  // First check if we can extract date from lines that contain day names
  const dayNamePattern = /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s*(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{1,2}(?:st|nd|rd|th)?/gi;
  
  for (const line of lines) {
    const dayMatch = line.match(dayNamePattern);
    if (dayMatch) {
      try {
        let dateStr = dayMatch[0];
        console.log("Found day match:", dateStr);
        
        // Handle "Sun, Jun 15" format by adding current year
        if (!/\d{4}/.test(dateStr)) {
          const currentYear = new Date().getFullYear();
          dateStr += `, ${currentYear}`;
        }
        
        const date = new Date(dateStr);
        console.log("Parsed date object:", date);
        
        // Only accept dates that are reasonable for open houses (future dates within next 2 years)
        const today = new Date();
        const twoYearsFromNow = new Date();
        twoYearsFromNow.setFullYear(today.getFullYear() + 2);
        
        if (!isNaN(date.getTime()) && date >= today && date <= twoYearsFromNow) {
          // Use local date formatting to avoid timezone conversion issues
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          result.date = `${year}-${month}-${day}`;
          console.log("Final result date:", result.date);
          break;
        }
      } catch (e) {
        console.log("Date parsing error:", e);
      }
    }
  }
  
  // Fallback: check other date patterns if no day name match found
  if (!result.date) {
    for (const line of lines) {
      // Skip lines with just prices
      if (line.includes('$') && !/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i.test(line)) continue;
      
      const datePatterns = [
        // Month day year
        /(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{1,2}(?:st|nd|rd|th)?,?\s*\d{4}/gi,
        // Numeric formats
        /\d{1,2}\/\d{1,2}\/\d{2,4}/g,
        /\d{4}-\d{2}-\d{2}/g
      ];
      
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          try {
            let dateStr = match[0].replace(/^open\s*house[:\s]*/i, '');
            console.log("Processing date string:", dateStr);
            
            // Handle "Sat, Jun 21" format by adding current year
            if (!/\d{4}/.test(dateStr)) {
              const currentYear = new Date().getFullYear();
              dateStr += `, ${currentYear}`;
            }
            
            const date = new Date(dateStr);
            console.log("Parsed date object:", date);
            if (!isNaN(date.getTime()) && date.getFullYear() >= 2020 && date.getFullYear() <= 2030) {
              // Use local date formatting to avoid timezone conversion issues
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              result.date = `${year}-${month}-${day}`;
              console.log("Final result date:", result.date);
              break;
            }
          } catch (e) {
            // Continue to next pattern
          }
        }
      }
      
      if (result.date) break;
    }
  }

  // Don't override notes if property details were already extracted
  // Only store raw text for very specific cases like URLs
  if (!result.notes && (text.includes('zillow.com') || text.includes('realtor.com') || text.includes('redfin.com'))) {
    result.notes = text;
  }

  // Set default Zestimate if empty
  if (!result.zestimate) {
    result.zestimate = "Not available";
  }

  return result;
}
