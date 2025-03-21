import { MongoClient, MongoClientOptions } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

const options: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 15000,
  retryWrites: true,
  retryReads: true,
  w: 1,
}

let client
let clientPromise: Promise<MongoClient>
let connectionRetries = 0
const MAX_RETRIES = 3

// Function to create new client with connection retry logic
const createClient = async (): Promise<MongoClient> => {
  try {
    console.log('🔌 Initializing MongoDB connection...')
    const newClient = new MongoClient(uri, options)
    return await newClient.connect().then(client => {
      console.log('✅ MongoDB connection established successfully')
      connectionRetries = 0 // Reset retry counter on success
      return client
    })
  } catch (error) {
    connectionRetries++
    console.error(`❌ MongoDB connection error (attempt ${connectionRetries}/${MAX_RETRIES}):`, error)
    
    if (connectionRetries < MAX_RETRIES) {
      console.log(`🔄 Retrying connection in 1 second...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return createClient()
    }
    
    console.error('❌ Maximum connection retries reached')
    throw error
  }
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = createClient()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = createClient()
}

export async function connectToDatabase() {
  try {
    const client = await clientPromise
    const db = client.db()
    return { client, db }
  } catch (error) {
    console.error('❌ Failed to connect to database:', error)
    throw new Error('Database connection failed: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise 