import puppeteer from 'puppeteer';

export interface ScrapedProperty {
  address?: string;
  price?: string;
  date?: string;
  time?: string;
  imageUrl?: string;
  notes?: string;
}

export async function scrapePropertyDetails(url: string): Promise<ScrapedProperty> {
  console.log('Attempting to scrape property details from:', url);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Set realistic user agent and headers to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait a bit for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Add debugging - log page title and some content
    const pageInfo = await page.evaluate(() => ({
      title: document.title,
      url: window.location.href,
      bodyLength: document.body?.textContent?.length || 0,
      hostname: window.location.hostname
    }));
    console.log('Page info:', pageInfo);

    // Check if page access was denied (common with anti-bot protection)
    if (pageInfo.title.toLowerCase().includes('access') && pageInfo.title.toLowerCase().includes('denied')) {
      console.log('Page access was denied - likely anti-bot protection');
      return { notes: 'Access denied by website' };
    }

    const result = await page.evaluate(() => {
      const data: ScrapedProperty = {};

      // Zillow selectors
      if (window.location.hostname.includes('zillow.com')) {
        // Get all text content to find patterns
        const bodyText = document.body.textContent || '';
        
        // Look for price in text content
        const priceMatch = bodyText.match(/\$[\d,]+(?:,\d{3})*(?:\.\d{2})?/g);
        if (priceMatch) {
          // Get the largest price (likely the listing price)
          const prices = priceMatch.map(p => parseInt(p.replace(/[$,]/g, '')));
          const maxPrice = Math.max(...prices);
          if (maxPrice > 50000) { // Reasonable minimum for a house
            data.price = maxPrice.toString();
          }
        }

        // Look for address in page title or h1 elements
        const title = document.title;
        const addressFromTitle = title.split(' | ')[0] || title.split(' - ')[0];
        if (addressFromTitle && addressFromTitle.length > 10) {
          data.address = addressFromTitle.trim();
        }

        // Fallback to h1 elements
        if (!data.address) {
          const h1Elements = Array.from(document.querySelectorAll('h1'));
          for (const h1 of h1Elements) {
            const text = h1.textContent?.trim();
            if (text && text.length > 10 && /\d/.test(text)) {
              data.address = text;
              break;
            }
          }
        }

        // Look for date/time patterns in the entire page
        const dateTimeMatch = bodyText.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[^,]*,\s*\w+\s+\d+.*?(\d{1,2}:\d{2}\s*(?:AM|PM).*?\d{1,2}:\d{2}\s*(?:AM|PM))/i);
        if (dateTimeMatch) {
          data.date = dateTimeMatch[1];
          data.time = dateTimeMatch[2];
        }

        // Try to find main property image, excluding logos and UI elements
        const images = Array.from(document.querySelectorAll('img'));
        for (const img of images) {
          const src = (img as HTMLImageElement).src;
          // Skip logos, icons, and UI elements - be more restrictive
          if (src && 
              !src.includes('z-logo') && 
              !src.includes('logo') && 
              !src.includes('icon') && 
              !src.includes('.svg') &&
              !src.includes('/static/') &&
              !src.includes('brand') &&
              !src.includes('header') &&
              src.includes('photos.zillowstatic.com') && 
              img.width > 300 && 
              img.height > 200) {
            data.imageUrl = src;
            break;
          }
        }
        
        // If no good image found, don't return any image URL
        if (!data.imageUrl) {
          console.log('No suitable property images found, skipping image extraction');
        }
      }

      // Realtor.com selectors
      else if (window.location.hostname.includes('realtor.com')) {
        // Price
        const priceEl = document.querySelector('[data-testid="price-display"]') ||
                       document.querySelector('.price-display') ||
                       document.querySelector('span[data-testid="price"]');
        if (priceEl) {
          data.price = priceEl.textContent?.replace(/[^0-9]/g, '') || '';
        }

        // Address
        const addressEl = document.querySelector('[data-testid="address-display"]') ||
                         document.querySelector('h1[data-testid="property-street"]') ||
                         document.querySelector('.address-display');
        if (addressEl) {
          data.address = addressEl.textContent?.trim() || '';
        }

        // Open house
        const openHouseEl = document.querySelector('[data-testid="open-house"]') ||
                           document.querySelector('.open-house-card') ||
                           document.querySelector('*[class*="open-house"]');
        if (openHouseEl) {
          const text = openHouseEl.textContent || '';
          const dateMatch = text.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[^,]*,\s*\w+\s+\d+/i);
          const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM).*?\d{1,2}:\d{2}\s*(?:AM|PM))/i);
          
          if (dateMatch) data.date = dateMatch[0];
          if (timeMatch) data.time = timeMatch[0];
        }

        // Main image
        const imageEl = document.querySelector('img[data-testid="hero-image"]') ||
                       document.querySelector('.hero-image img') ||
                       document.querySelector('img[src*="rdcpix.com"]');
        if (imageEl) {
          data.imageUrl = (imageEl as HTMLImageElement).src;
        }
      }

      // Generic fallbacks for other sites
      else {
        // Try to find price
        const priceSelectors = ['[data-price]', '.price', '[class*="price"]', '[id*="price"]'];
        for (const selector of priceSelectors) {
          const el = document.querySelector(selector);
          if (el && el.textContent) {
            const price = el.textContent.match(/\$[\d,]+/);
            if (price) {
              data.price = price[0].replace(/[^0-9]/g, '');
              break;
            }
          }
        }

        // Try to find address
        const addressSelectors = ['[data-address]', '.address', 'h1', '[class*="address"]'];
        for (const selector of addressSelectors) {
          const el = document.querySelector(selector);
          if (el && el.textContent && el.textContent.length > 10) {
            data.address = el.textContent.trim();
            break;
          }
        }

        // Skip generic image extraction to avoid logos and non-property images
        console.log('Skipping image extraction for generic site to avoid logos');
      }

      // Debug logging
      console.log('Extracted data:', JSON.stringify(data));
      return data;
    });

    // Add URL as source if we got some data
    if (Object.keys(result).length > 0 || true) { // Always add source
      result.notes = `Source: ${url}`;
    }

    console.log('Final scraped result:', result);
    return result;

  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error('Failed to scrape property details');
  } finally {
    await browser.close();
  }
}