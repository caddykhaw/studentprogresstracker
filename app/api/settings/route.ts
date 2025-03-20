import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';

// Zod schema for settings validation
const SettingsSchema = z.object({
  instruments: z.array(z.string())
});

// No-cache headers configuration
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store'
} as const;

// GET settings
export async function GET() {
  console.log('📥 GET /api/settings - Starting request...');
  
  try {
    const { db } = await connectToDatabase();
    const settings = await db.collection('settings').findOne({});
    
    if (!settings) {
      // Initialize default settings if none exist
      const defaultSettings = {
        instruments: []
      };
      
      await db.collection('settings').insertOne(defaultSettings);
      return NextResponse.json(defaultSettings, { headers: NO_CACHE_HEADERS });
    }
    
    return NextResponse.json(settings, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('❌ Error in GET /api/settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error instanceof Error ? error.message : 'Database error' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// PUT settings
export async function PUT(request: NextRequest) {
  console.log('📤 PUT /api/settings - Starting request...');
  
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = SettingsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Update or create settings
    const result = await db.collection('settings').updateOne(
      {}, // Update first document
      { $set: validationResult.data },
      { upsert: true }
    );
    
    if (!result.acknowledged) {
      throw new Error('Failed to update settings');
    }
    
    return NextResponse.json({
      message: 'Settings updated successfully'
    }, {
      status: 200,
      headers: NO_CACHE_HEADERS
    });
    
  } catch (error) {
    console.error('❌ Error in PUT /api/settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings', details: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
} 