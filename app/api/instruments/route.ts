import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';

// No-cache headers
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// GET all instruments
export async function GET() {
  try {
    console.log('🎸 Fetching all instruments');
    const { db } = await connectToDatabase();
    
    // Check if instruments setting exists
    const instrumentsSetting = await db.collection('settings').findOne({ name: 'instruments' });
    
    let instruments = [];
    
    if (instrumentsSetting) {
      // Parse the value as JSON if it exists
      try {
        instruments = JSON.parse(instrumentsSetting.value);
      } catch (error) {
        console.error('❌ Error parsing instruments JSON:', error);
      }
    } else {
      // If no settings found, create with default instruments
      const defaultInstruments = ['Guitar', 'Drums', 'Piano', 'Violin', 'Bass'];
      
      await db.collection('settings').insertOne({
        id: crypto.randomUUID(),
        name: 'instruments',
        value: JSON.stringify(defaultInstruments),
        type: 'array'
      });
      
      instruments = defaultInstruments;
    }
    
    return NextResponse.json(instruments, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('❌ Error fetching instruments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instruments' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// POST new instrument
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const instrument = body.instrument;
    
    if (!instrument || typeof instrument !== 'string' || instrument.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid instrument name' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Check if instruments setting exists
    const instrumentsSetting = await db.collection('settings').findOne({ name: 'instruments' });
    
    let instruments = [];
    
    if (instrumentsSetting) {
      // Parse the existing instruments
      try {
        instruments = JSON.parse(instrumentsSetting.value);
      } catch (error) {
        console.error('❌ Error parsing instruments JSON:', error);
        instruments = [];
      }
      
      // Check if instrument already exists
      if (instruments.includes(instrument)) {
        return NextResponse.json(
          { error: 'Instrument already exists' },
          { status: 409, headers: NO_CACHE_HEADERS }
        );
      }
      
      // Add new instrument
      instruments.push(instrument);
      
      // Update instruments in database
      await db.collection('settings').updateOne(
        { name: 'instruments' },
        { $set: { value: JSON.stringify(instruments) } }
      );
    } else {
      // Create new instruments setting
      instruments = [instrument];
      
      await db.collection('settings').insertOne({
        id: crypto.randomUUID(),
        name: 'instruments',
        value: JSON.stringify(instruments),
        type: 'array'
      });
    }
    
    return NextResponse.json(
      { message: 'Instrument added successfully', instruments },
      { status: 201, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('❌ Error adding instrument:', error);
    return NextResponse.json(
      { error: 'Failed to add instrument' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// DELETE instrument
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const instrument = url.searchParams.get('instrument');
    
    if (!instrument) {
      return NextResponse.json(
        { error: 'Instrument parameter is required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Check if instruments setting exists
    const instrumentsSetting = await db.collection('settings').findOne({ name: 'instruments' });
    
    if (!instrumentsSetting) {
      return NextResponse.json(
        { error: 'Instruments setting not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    // Parse the existing instruments
    let instruments = [];
    try {
      instruments = JSON.parse(instrumentsSetting.value);
    } catch (error) {
      console.error('❌ Error parsing instruments JSON:', error);
      return NextResponse.json(
        { error: 'Failed to parse instruments data' },
        { status: 500, headers: NO_CACHE_HEADERS }
      );
    }
    
    // Check if instrument exists
    if (!instruments.includes(instrument)) {
      return NextResponse.json(
        { error: 'Instrument not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    // Remove instrument
    const updatedInstruments = instruments.filter((i: string) => i !== instrument);
    
    // Update instruments in database
    await db.collection('settings').updateOne(
      { name: 'instruments' },
      { $set: { value: JSON.stringify(updatedInstruments) } }
    );
    
    return NextResponse.json(
      { message: 'Instrument deleted successfully', instruments: updatedInstruments },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('❌ Error deleting instrument:', error);
    return NextResponse.json(
      { error: 'Failed to delete instrument' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
} 