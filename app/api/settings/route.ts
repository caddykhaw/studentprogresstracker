import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Setting } from '@/lib/types';
import { z } from 'zod';

// Setting validation schema
const settingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  value: z.string().min(1, 'Value is required'),
  type: z.string().min(1, 'Type is required'),
});

// No-cache headers
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// GET all settings
export async function GET() {
  try {
    console.log('🔧 Fetching all settings');
    const { db } = await connectToDatabase();
    
    const settings = await db.collection<Setting>('settings').find({}).toArray();
    
    return NextResponse.json(settings, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// POST new setting
export async function POST(request: NextRequest) {
  try {
    console.log('➕ Creating new setting');
    const body = await request.json();
    
    // Validate request body
    const validationResult = settingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Check if setting with the same name already exists
    const existingSetting = await db.collection<Setting>('settings').findOne({
      name: validationResult.data.name
    });
    
    if (existingSetting) {
      return NextResponse.json(
        { error: 'Setting with this name already exists' },
        { status: 409, headers: NO_CACHE_HEADERS }
      );
    }
    
    // Create new setting object
    const newSetting: Setting = {
      id: crypto.randomUUID(),
      ...validationResult.data
    };
    
    await db.collection<Setting>('settings').insertOne(newSetting);
    
    return NextResponse.json(
      { message: 'Setting created successfully', setting: newSetting },
      { status: 201, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('❌ Error creating setting:', error);
    return NextResponse.json(
      { error: 'Failed to create setting' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// PUT update setting
export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ Updating setting');
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Setting ID is required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    
    // Validate request body
    const validationResult = settingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const result = await db.collection<Setting>('settings').updateOne(
      { id: body.id },
      { $set: validationResult.data }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    return NextResponse.json(
      { message: 'Setting updated successfully' },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('❌ Error updating setting:', error);
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
} 