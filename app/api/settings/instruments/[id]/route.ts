import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

interface RouteParams {
  id: string;
}

interface Settings {
  _id: string;
  instruments: string[];
}

export async function DELETE(
  request: NextRequest,
  context: { params: RouteParams }
) {
  try {
    const instrumentToDelete = decodeURIComponent(context.params.id);
    console.log(`🗑️ Deleting instrument: ${instrumentToDelete}`);
    
    const { db } = await connectToDatabase();
    
    // First find the settings document
    const settings = await db.collection<Settings>('settings').findOne({});
    if (!settings) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 404 }
      );
    }
    
    // Check if instrument exists
    if (!settings.instruments?.includes(instrumentToDelete)) {
      return NextResponse.json(
        { error: 'Instrument not found' },
        { status: 404 }
      );
    }
    
    // Remove the instrument
    const result = await db.collection<Settings>('settings').updateOne(
      { _id: settings._id },
      { $set: { instruments: settings.instruments.filter((i: string) => i !== instrumentToDelete) } }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to delete instrument' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Instrument deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error deleting instrument:', error);
    return NextResponse.json(
      { error: 'Failed to delete instrument' },
      { status: 500 }
    );
  }
} 