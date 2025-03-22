import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate import data
    if (!data.settings || !data.students || !data.songs) {
      return NextResponse.json(
        { error: 'Invalid import data format' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Replace all data with imported data
    await Promise.all([
      db.collection('settings').replaceOne({}, data.settings, { upsert: true }),
      db.collection('students').deleteMany({}),
      db.collection('students').insertMany(data.students),
      db.collection('songs').deleteMany({}),
      db.collection('songs').insertMany(data.songs)
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error importing data:', error)
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    )
  }
} 