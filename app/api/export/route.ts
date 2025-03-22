import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    
    // Get all data needed for export
    const [settings, students, songs] = await Promise.all([
      db.collection('settings').findOne({}),
      db.collection('students').find({}).toArray(),
      db.collection('songs').find({}).toArray()
    ])
    
    return NextResponse.json({
      settings,
      students,
      songs,
      exportDate: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
} 