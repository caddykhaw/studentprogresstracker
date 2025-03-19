import 'dotenv/config'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import data from '../data.json'

// Transform notes to match our schema
const transformNotes = (notes: any[]) => {
  return notes.map(note => ({
    id: Math.random().toString(36).substring(2, 15),
    content: note.text,
    date: note.date
  }))
}

async function migrateData() {
  try {
    console.log('🔄 Starting data migration...')
    
    const { db } = await connectToDatabase()
    console.log('✅ Connected to MongoDB')
    
    // Clear existing data
    await db.collection('students').deleteMany({})
    console.log('🧹 Cleared existing students')
    
    // Transform and insert students
    const students = data.students.map(student => ({
      ...student,
      notes: transformNotes(student.notes)
    }))
    
    const result = await db.collection('students').insertMany(students)
    console.log(`✨ Inserted ${result.insertedCount} students`)
    
    // Update settings
    await db.collection('settings').updateOne(
      { _id: new ObjectId() },
      { 
        $set: { 
          instruments: data.settings.instruments 
        }
      },
      { upsert: true }
    )
    console.log('⚙️ Updated settings')
    
    console.log('✅ Migration completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error during migration:', error)
    process.exit(1)
  }
}

migrateData() 