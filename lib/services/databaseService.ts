import { MongoClient, Db } from 'mongodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Database service interface
export interface DatabaseService {
  connect(): Promise<{ client: MongoClient; db: Db }>;
}

// MongoDB implementation
export class MongoDBService implements DatabaseService {
  private uri: string;
  private dbName: string;
  private client: MongoClient | null = null;
  private clientPromise: Promise<MongoClient> | null = null;

  constructor(dbName = 'student-progress-tracker') {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('Please add your Mongo URI to .env.local');
    }
    
    this.uri = uri;
    this.dbName = dbName;
    
    console.log('MongoDB: Initializing connection with URI:', uri);
    
    // Initialize client based on environment
    this.initializeClient();
  }

  private initializeClient(): void {
    const options = {};
    
    if (process.env.NODE_ENV === 'development') {
      // In development mode, use a global variable so that the value
      // is preserved across module reloads caused by HMR (Hot Module Replacement).
      let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
      };

      if (!globalWithMongo._mongoClientPromise) {
        console.log('MongoDB: Creating new client in development mode');
        this.client = new MongoClient(this.uri, options);
        globalWithMongo._mongoClientPromise = this.client.connect();
      }
      
      this.clientPromise = globalWithMongo._mongoClientPromise;
    } else {
      // In production mode, it's best to not use a global variable.
      console.log('MongoDB: Creating new client in production mode');
      this.client = new MongoClient(this.uri, options);
      this.clientPromise = this.client.connect();
    }
  }

  async connect(): Promise<{ client: MongoClient; db: Db }> {
    try {
      console.log('MongoDB: Attempting to connect...');
      
      if (!this.clientPromise) {
        throw new Error('MongoDB client promise is not initialized');
      }
      
      const client = await this.clientPromise;
      console.log('MongoDB: Connected successfully');
      
      const db = client.db(this.dbName);
      
      // Test the connection
      const collections = await db.listCollections().toArray();
      console.log('MongoDB: Available collections:', collections.map(c => c.name));
      
      return { client, db };
    } catch (error) {
      console.error('MongoDB: Failed to connect:', error);
      throw error;
    }
  }
}

// Database factory
export class DatabaseFactory {
  private static instance: DatabaseService | null = null;

  static getDatabase(): DatabaseService {
    if (!this.instance) {
      this.instance = new MongoDBService();
    }
    return this.instance;
  }
} 