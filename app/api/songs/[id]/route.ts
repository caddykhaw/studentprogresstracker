import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Song, ApiResponse, SongUpdate } from '@/lib/types';

// GET - Fetch a specific song
export async function GET(
  request: Request,
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
    
    return NextResponse.json<ApiResponse<Song>>({
      data: song as unknown as Song
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const songId = params.id;
    const data = await request.json() as SongUpdate;
    
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
    
    updateData.updatedAt = new Date();
    
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
  request: Request,
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
    
    // Delete song
    await db.collection('songs').deleteOne({ id: songId });
    
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