import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

// GET all instruments
export async function GET() {
  try {
    console.log('🎸 Fetching all instruments')
    const { db } = await connectToDatabase()
    
    const settings = await db.collection('settings').findOne({})
    const instruments = settings?.instruments || []
    
    return NextResponse.json(instruments)
  } catch (error) {
    console.error('❌ Error fetching instruments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch instruments' },
      { status: 500 }
    )
  }
}

// POST new instrument
export async function POST(request: NextRequest) {
  try {
    const { instrument } = await request.json()
    if (!instrument) {
      return NextResponse.json(
        { error: 'Instrument name is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Check if instrument already exists
    const settings = await db.collection('settings').findOne({})
    if (settings?.instruments?.includes(instrument)) {
      return NextResponse.json(
        { error: 'Instrument already exists' },
        { status: 400 }
      )
    }

    // Add new instrument
    await db.collection('settings').updateOne(
      { },
      { $addToSet: { instruments: instrument } },
      { upsert: true }
    )

    return NextResponse.json({ message: 'Instrument added successfully' })
  } catch (error) {
    console.error('❌ Error adding instrument:', error)
    return NextResponse.json(
      { error: 'Failed to add instrument' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get instrument name from URL
    const url = new URL(request.url)
    const instrument = decodeURIComponent(url.pathname.split('/').pop() || '')
    
    if (!instrument) {
      return NextResponse.json(
        { error: 'Instrument name is required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase()

    // Remove instrument
    await db.collection('settings').updateOne(
      { },
      { $pull: { instruments: instrument } } as any
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting instrument:', error)
    return NextResponse.json(
      { error: 'Failed to delete instrument' },
      { status: 500 }
    )
  }
} 