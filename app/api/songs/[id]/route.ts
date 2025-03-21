import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Song, ApiResponse, SongUpdate } from '@/lib/types';

// GET - Fetch a specific song and its teaching history
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const songId = params.id;
    const { db } = await connectToDatabase();
    
    // Find the song
    const song = await db.collection('songs').findOne({ id: songId });
    
    if (!song) {
      return NextResponse.json<ApiResponse<Song>>(
        { error: 'Song not found' },
        { status: 404 }
      );
    }
    
    // Get teaching history
    const teachingHistory = await db
      .collection('songTeachings')
      .find({ songId })
      .toArray();
    
    // Enrich with student information if needed
    const studentIdsSet = new Set(teachingHistory.map(record => record.studentId));
    const studentIds = Array.from(studentIdsSet);
    const students = studentIds.length > 0 
      ? await db.collection('students')
        .find({ id: { $in: studentIds } })
        .toArray()
      : [];
    
    const studentMap = new Map(students.map(student => [student.id, student]));
    
    // Add student info to teaching records
    const enrichedHistory = teachingHistory.map(record => ({
      ...record,
      student: studentMap.get(record.studentId) || null
    }));
    
    return NextResponse.json<ApiResponse<any>>({
      data: {
        song: song as unknown as Song,
        teachingHistory: enrichedHistory
      }
    });
  } catch (error) {
    console.error('Failed to fetch song:', error);
    return NextResponse.json<ApiResponse<Song>>(
      { error: 'Failed to fetch song' },
      { status: 500 }
    );
  }
}

// PUT - Update a song
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const songId = params.id;
    const data = await req.json() as SongUpdate;
    
    const { db } = await connectToDatabase();
    
    // Check if song exists
    const existingSong = await db.collection('songs').findOne({ id: songId });
    
    if (!existingSong) {
      return NextResponse.json<ApiResponse<Song>>(
        { error: 'Song not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    const updateData: Partial<Song> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.artist !== undefined) updateData.artist = data.artist;
    if (data.keyLetter !== undefined) updateData.keyLetter = data.keyLetter;
    if (data.keyModifier !== undefined) updateData.keyModifier = data.keyModifier;
    if (data.keyMode !== undefined) updateData.keyMode = data.keyMode;
    if (data.bpm !== undefined) updateData.bpm = data.bpm;
    if (data.youtubeUrl !== undefined) updateData.youtubeUrl = data.youtubeUrl;
    
    const result = await db.collection('songs').updateOne(
      { id: songId },
      { $set: updateData }
    );
    
    // Get updated song
    const updatedSong = await db.collection('songs').findOne({ id: songId });
    
    return NextResponse.json<ApiResponse<Song>>({
      data: updatedSong as unknown as Song
    });
  } catch (error) {
    console.error('Failed to update song:', error);
    return NextResponse.json<ApiResponse<Song>>(
      { error: 'Failed to update song' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a song
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const songId = params.id;
    const { db } = await connectToDatabase();
    
    // Check if song exists
    const existingSong = await db.collection('songs').findOne({ id: songId });
    
    if (!existingSong) {
      return NextResponse.json<ApiResponse<boolean>>(
        { error: 'Song not found' },
        { status: 404 }
      );
    }
    
    // Delete song and its teaching records
    await db.collection('songs').deleteOne({ id: songId });
    await db.collection('songTeachings').deleteMany({ songId });
    
    return NextResponse.json<ApiResponse<boolean>>({
      data: true
    });
  } catch (error) {
    console.error('Failed to delete song:', error);
    return NextResponse.json<ApiResponse<boolean>>(
      { error: 'Failed to delete song' },
      { status: 500 }
    );
  }
} 