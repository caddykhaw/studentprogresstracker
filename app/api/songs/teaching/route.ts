import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { randomUUID } from 'crypto';
import { SongTeaching, ApiResponse, SongTeachingCreate } from '@/lib/types';

// POST - Record a song being taught to a student
export async function POST(req: NextRequest) {
  try {
    const data = await req.json() as SongTeachingCreate;
    
    // Validate required fields
    if (!data.songId || !data.studentId || !data.taughtDate) {
      return NextResponse.json<ApiResponse<SongTeaching>>(
        { error: 'Song ID, student ID, and taught date are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Verify song and student exist
    const song = await db.collection('songs').findOne({ id: data.songId });
    const student = await db.collection('students').findOne({ id: data.studentId });
    
    if (!song) {
      return NextResponse.json<ApiResponse<SongTeaching>>(
        { error: 'Song not found' },
        { status: 404 }
      );
    }
    
    if (!student) {
      return NextResponse.json<ApiResponse<SongTeaching>>(
        { error: 'Student not found' },
        { status: 404 }
      );
    }
    
    // Create teaching record
    const teachingRecord: SongTeaching = {
      id: randomUUID(),
      songId: data.songId,
      studentId: data.studentId,
      taughtDate: data.taughtDate,
      lessonId: data.lessonId,
    };
    
    await db.collection('songTeachings').insertOne(teachingRecord);
    
    // Update song's last taught date and frequency
    await db.collection('songs').updateOne(
      { id: data.songId },
      { 
        $set: { lastTaught: data.taughtDate },
        $inc: { frequency: 1 }
      }
    );
    
    return NextResponse.json<ApiResponse<SongTeaching>>(
      { data: teachingRecord },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to record song teaching:', error);
    return NextResponse.json<ApiResponse<SongTeaching>>(
      { error: 'Failed to record song teaching' },
      { status: 500 }
    );
  }
}

// GET - Get teaching history for a specific student
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json<ApiResponse<SongTeaching[]>>(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Find teaching records for the student
    const teachingRecords = await db
      .collection('songTeachings')
      .find({ studentId })
      .sort({ taughtDate: -1 })
      .toArray();
    
    // Get song details for each record
    const songIds = teachingRecords.map(record => record.songId);
    const uniqueSongIds = Array.from(new Set(songIds));
    
    const songs = uniqueSongIds.length > 0
      ? await db.collection('songs')
          .find({ id: { $in: uniqueSongIds } })
          .toArray()
      : [];
    
    const songMap = new Map(songs.map(song => [song.id, song]));
    
    // Enrich teaching records with song details
    const enrichedRecords = teachingRecords.map(record => ({
      ...record,
      song: songMap.get(record.songId) || null
    }));
    
    return NextResponse.json<ApiResponse<any[]>>({
      data: enrichedRecords
    });
  } catch (error) {
    console.error('Failed to fetch teaching history:', error);
    return NextResponse.json<ApiResponse<SongTeaching[]>>(
      { error: 'Failed to fetch teaching history' },
      { status: 500 }
    );
  }
} 