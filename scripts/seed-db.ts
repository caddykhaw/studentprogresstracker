import 'dotenv/config'
import { connectToDatabase } from '@/lib/mongodb'

const seedData = [
  {
    id: '1',
    name: 'Jordan Lim',
    instrument: 'Piano',
    grade: 'Grade 3',
    day: 'Wednesday',
    time: '15:00',
    notes: [],
  },
  {
    id: '2',
    name: 'Tang Yu Shan',
    instrument: 'Violin',
    grade: 'Grade 2',
    day: 'Thursday',
    time: '14:00',
    notes: [],
  },
  {
    id: '3',
    name: 'Arrithran',
    instrument: 'Guitar',
    grade: 'Grade 1',
    day: 'Thursday',
    time: '16:00',
    notes: [],
  },
  {
    id: '4',
    name: 'Tommy Do',
    instrument: 'Drums',
    grade: 'Grade 2',
    day: 'Thursday',
    time: '17:00',
    notes: [],
  }
]

async function seed() {
  try {
    console.log('🌱 Starting database seeding...')
    console.log('🔑 Using MongoDB URI:', process.env.MONGODB_URI)
    
    const { db } = await connectToDatabase()
    console.log('✅ Connected to MongoDB')
    
    // Clear existing data
    await db.collection('students').deleteMany({})
    console.log('🧹 Cleared existing students')
    
    // Insert seed data
    const result = await db.collection('students').insertMany(seedData)
    console.log(`✨ Inserted ${result.insertedCount} students`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

seed() 