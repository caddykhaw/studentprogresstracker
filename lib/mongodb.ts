/**
 * @deprecated This file is deprecated and will be removed in the future.
 * Please use the new services:
 * - DatabaseService from @/lib/services/databaseService
 * - CacheService from @/lib/services/cacheService
 */
import { MongoClient } from 'mongodb'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local and .env
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local')
}

console.info('📡 MongoDB: Connecting...')

const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Add in-memory cache
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const cache: Record<string, CacheItem<any>> = {};

// Cache duration in milliseconds (default 30 seconds)
const DEFAULT_CACHE_DURATION = 30 * 1000;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    console.log('MongoDB: Creating new client in development mode')
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  console.log('MongoDB: Creating new client in production mode')
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function connectToDatabase() {
  try {
    console.info('📡 MongoDB: Connecting...')
    if (!clientPromise) {
      throw new Error('MongoDB client promise is not initialized')
    }
    
    const client = await clientPromise
    console.info('✅ MongoDB: Connected')
    const db = client.db('student-progress-tracker')
    
    // Test the connection
    const collections = await db.listCollections().toArray()
    console.log('MongoDB: Available collections:', collections.map(c => c.name))
    
    return { client, db }
  } catch (error) {
    console.error('❌ MongoDB: Connection failed:', error)
    throw error
  }
}

// Cache utility functions
export function getCachedData<T>(key: string): T | null {
  const item = cache[key];
  
  if (!item) return null;
  
  // Check if cache expired
  if (Date.now() > item.expiresAt) {
    console.log(`Cache expired for ${key}`);
    delete cache[key];
    return null;
  }
  
  console.log(`Cache hit for ${key}`);
  return item.data;
}

export function setCachedData<T>(key: string, data: T, duration = DEFAULT_CACHE_DURATION): void {
  const now = Date.now();
  cache[key] = {
    data,
    timestamp: now,
    expiresAt: now + duration
  };
  console.log(`Cache set for ${key}, expires in ${duration/1000}s`);
}

export function invalidateCache(keyPattern?: string): void {
  if (keyPattern) {
    const pattern = new RegExp(keyPattern);
    Object.keys(cache).forEach(key => {
      if (pattern.test(key)) {
        delete cache[key];
        console.log(`Cache invalidated for ${key}`);
      }
    });
  } else {
    Object.keys(cache).forEach(key => delete cache[key]);
    console.log('All cache invalidated');
  }
} 