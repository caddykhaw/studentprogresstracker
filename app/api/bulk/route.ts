import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student, Setting, Song } from '@/lib/types';
import { z } from 'zod';

// Bulk data validation schema
const bulkDataSchema = z.object({
  students: z.array(z.any()).optional(),
  settings: z.array(z.any()).optional(),
  songs: z.array(z.any()).optional(),
});

// No-cache headers
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// GET all data for export
export async function GET() {
  try {
    console.log('📦 Exporting all data');
    const { db } = await connectToDatabase();
    
    // Fetch all collections in parallel
    const [students, settings, songs] = await Promise.all([
      db.collection<Student>('students').find({}).toArray(),
      db.collection<Setting>('settings').find({}).toArray(),
      db.collection<Song>('songs').find({}).toArray()
    ]);
    
    const exportData = {
      students,
      settings,
      songs,
      exportDate: new Date().toISOString()
    };
    
    return NextResponse.json(exportData, { 
      headers: {
        ...NO_CACHE_HEADERS,
        'Content-Disposition': 'attachment; filename="student-progress-tracker-export.json"'
      } 
    });
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// POST for importing data
export async function POST(request: NextRequest) {
  try {
    console.log('📥 Importing data');
    const body = await request.json();
    
    // Validate request body
    const validationResult = bulkDataSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Add timestamp to imported data
    const importDate = new Date();
    
    // Process students if they exist
    if (body.students && Array.isArray(body.students) && body.students.length > 0) {
      // Delete existing students if importing
      if (body.students.length > 0) {
        await db.collection('students').deleteMany({});
      }
      
      // Add timestamps to each student
      const studentsWithTimestamps = body.students.map((student: Student) => ({
        ...student,
        importedAt: importDate,
        updatedAt: importDate
      }));
      
      // Insert students
      if (studentsWithTimestamps.length > 0) {
        await db.collection('students').insertMany(studentsWithTimestamps);
      }
    }
    
    // Process settings if they exist
    if (body.settings && Array.isArray(body.settings) && body.settings.length > 0) {
      // Handle settings - for each setting, update if exists, otherwise insert
      for (const setting of body.settings) {
        if (setting.name) {
          await db.collection('settings').updateOne(
            { name: setting.name },
            { $set: setting },
            { upsert: true }
          );
        }
      }
    }
    
    // Process songs if they exist
    if (body.songs && Array.isArray(body.songs) && body.songs.length > 0) {
      // Delete existing songs if importing
      if (body.songs.length > 0) {
        await db.collection('songs').deleteMany({});
      }
      
      // Add timestamps to each song
      const songsWithTimestamps = body.songs.map((song: Song) => ({
        ...song,
        importedAt: importDate,
        updatedAt: importDate
      }));
      
      // Insert songs
      if (songsWithTimestamps.length > 0) {
        await db.collection('songs').insertMany(songsWithTimestamps);
      }
    }
    
    return NextResponse.json(
      { 
        message: 'Data imported successfully', 
        summary: {
          students: body.students?.length || 0,
          settings: body.settings?.length || 0,
          songs: body.songs?.length || 0,
        }
      },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('❌ Error importing data:', error);
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
} 