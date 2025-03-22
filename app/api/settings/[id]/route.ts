import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Setting } from '@/lib/types';
import { z } from 'zod';

// Setting validation schema
const settingUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  value: z.string().min(1, 'Value is required').optional(),
  type: z.string().min(1, 'Type is required').optional(),
});

// No-cache headers
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

interface RouteParams {
  id: string;
}

// GET a specific setting by ID
export async function GET(
  request: NextRequest,
  context: { params: RouteParams }
) {
  try {
    console.log(`🔍 Fetching setting with ID: ${context.params.id}`);
    const { db } = await connectToDatabase();
    
    const setting = await db.collection<Setting>('settings').findOne({ id: context.params.id });
    
    if (!setting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    return NextResponse.json(setting, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('❌ Error fetching setting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch setting' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// PUT (update) a specific setting by ID
export async function PUT(
  request: NextRequest,
  context: { params: RouteParams }
) {
  try {
    console.log(`✏️ Updating setting with ID: ${context.params.id}`);
    const body = await request.json();
    
    // Validate request body
    const validationResult = settingUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Check if setting exists
    const existingSetting = await db.collection<Setting>('settings').findOne({ id: context.params.id });
    
    if (!existingSetting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    // If name is being changed, check for duplicates
    if (body.name && body.name !== existingSetting.name) {
      const duplicateSetting = await db.collection<Setting>('settings').findOne({ name: body.name });
      
      if (duplicateSetting) {
        return NextResponse.json(
          { error: 'Setting with this name already exists' },
          { status: 409, headers: NO_CACHE_HEADERS }
        );
      }
    }
    
    const result = await db.collection<Setting>('settings').updateOne(
      { id: context.params.id },
      { $set: validationResult.data }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    // Get the updated setting
    const updatedSetting = await db.collection<Setting>('settings').findOne({ id: context.params.id });
    
    return NextResponse.json(
      { message: 'Setting updated successfully', setting: updatedSetting },
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

// DELETE a specific setting by ID
export async function DELETE(
  request: NextRequest,
  context: { params: RouteParams }
) {
  try {
    console.log(`🗑️ Deleting setting with ID: ${context.params.id}`);
    const { db } = await connectToDatabase();
    
    const result = await db.collection<Setting>('settings').deleteOne({ id: context.params.id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    return NextResponse.json(
      { message: 'Setting deleted successfully' },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('❌ Error deleting setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete setting' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
} 