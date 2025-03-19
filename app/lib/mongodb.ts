import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    try {
      console.log('🔌 Initializing MongoDB connection...');
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect().then(client => {
        console.log('✅ MongoDB connection established successfully');
        return client;
      }).catch(error => {
        console.error('❌ MongoDB connection error:', error);
        throw error;
      });
    } catch (error) {
      console.error('❌ Failed to initialize MongoDB client:', error);
      throw error;
    }
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  try {
    console.log('🔌 Initializing MongoDB connection...');
    client = new MongoClient(uri, options);
    clientPromise = client.connect().then(client => {
      console.log('✅ MongoDB connection established successfully');
      return client;
    }).catch(error => {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    });
  } catch (error) {
    console.error('❌ Failed to initialize MongoDB client:', error);
    throw error;
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise; 