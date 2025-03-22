import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Format time from 24h to 12h format
 */
export function formatTime(time: string): string {
  if (!time) return '';
  
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    return time;
  }
}

// Client-side cache for API responses
interface ClientCacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const clientCache: Record<string, ClientCacheItem<any>> = {};

// Default cache duration in milliseconds (5 seconds)
const DEFAULT_CLIENT_CACHE_DURATION = 5000;

/**
 * Fetches data from the API with client-side caching to avoid duplicate calls
 * @param url The API endpoint URL
 * @param options Fetch options
 * @param cacheDuration Duration to cache the response (in milliseconds)
 * @returns The parsed response data
 */
export async function fetchWithCache<T>(
  url: string, 
  options: RequestInit = {}, 
  cacheDuration = DEFAULT_CLIENT_CACHE_DURATION
): Promise<T> {
  // Check cache first
  const cachedData = getClientCache<T>(url);
  if (cachedData) {
    console.log(`Client cache hit for ${url}`);
    return cachedData;
  }

  // If not cached, make the API call
  console.log(`Client cache miss for ${url}, fetching data...`);
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Cache the response
  setClientCache(url, data, cacheDuration);
  
  return data;
}

/**
 * Gets data from the client cache
 * @param key The cache key (usually the API URL)
 * @returns The cached data or null if not found/expired
 */
function getClientCache<T>(key: string): T | null {
  const item = clientCache[key];
  
  if (!item) return null;
  
  // Check if cache expired
  if (Date.now() > item.expiresAt) {
    console.log(`Client cache expired for ${key}`);
    delete clientCache[key];
    return null;
  }
  
  return item.data;
}

/**
 * Sets data in the client cache
 * @param key The cache key (usually the API URL)
 * @param data The data to cache
 * @param duration Cache duration in milliseconds
 */
function setClientCache<T>(key: string, data: T, duration: number): void {
  const now = Date.now();
  clientCache[key] = {
    data,
    timestamp: now,
    expiresAt: now + duration
  };
}

/**
 * Invalidates specific or all client cache entries
 * @param keyPattern Optional regex pattern to match keys to invalidate
 */
export function invalidateClientCache(keyPattern?: string): void {
  if (keyPattern) {
    const pattern = new RegExp(keyPattern);
    Object.keys(clientCache).forEach(key => {
      if (pattern.test(key)) {
        delete clientCache[key];
        console.log(`Client cache invalidated for ${key}`);
      }
    });
  } else {
    Object.keys(clientCache).forEach(key => delete clientCache[key]);
    console.log('All client cache invalidated');
  }
}

// Helper to generate reusable API endpoints
export const API_ENDPOINTS = {
  SONGS: {
    ALL: '/api/songs',
    BY_ID: (id: string) => `/api/songs/${id}`
  },
  STUDENTS: {
    ALL: '/api/students',
    BY_ID: (id: string) => `/api/students/${id}`
  }
}; 