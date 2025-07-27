import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  // Handle YYYY-MM-DD format properly to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

export function formatPrice(price: string): string {
  if (!price || price.trim() === '') {
    return 'Price TBD';
  }
  
  const numericPrice = price.replace(/[^0-9]/g, '');
  
  if (!numericPrice || numericPrice === '0') {
    return 'Price TBD';
  }
  
  const parsedPrice = parseInt(numericPrice);
  if (isNaN(parsedPrice)) {
    return 'Price TBD';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(parsedPrice);
}

export function isUpcoming(dateString: string): boolean {
  // Handle YYYY-MM-DD format properly to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return date >= today;
}

export function getMapUrl(address: string): string {
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}

export async function parseClipboard(): Promise<string | null> {
  try {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      return null;
    }
    
    const text = await navigator.clipboard.readText();
    return text;
  } catch (error) {
    console.error('Failed to read clipboard:', error);
    return null;
  }
}
