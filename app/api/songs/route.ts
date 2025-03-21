import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { randomUUID } from 'crypto';
import { Song, ApiResponse, SongCreate } from '@/lib/types';

// GET - Fetch all songs
export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const songsData = await db.collection('songs').find().toArray();
    
    // Map MongoDB documents to Song type
    const songs = songsData.map(doc => doc as unknown as Song);
    
    return NextResponse.json<ApiResponse<Song[]>>({ data: songs });
  } catch (error) {
    console.error('Failed to fetch songs:', error);
    return NextResponse.json<ApiResponse<Song[]>>(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    );
  }
}

// POST - Create a new song
export async function POST(req: NextRequest) {
  try {
    const data = await req.json() as SongCreate;
    
    if (!data.title) {
      return NextResponse.json<ApiResponse<Song>>(
        { error: 'Song title is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Create new song document
    const newSong: Song = {
      id: randomUUID(),
      title: data.title,
      artist: data.artist || '',
      keyLetter: data.keyLetter,
      keyModifier: data.keyModifier,
      keyMode: data.keyMode || 'major',
      bpm: data.bpm,
      youtubeUrl: data.youtubeUrl,
      frequency: 0,
      lastTaught: undefined,
      createdAt: new Date().toISOString(),
    };
    
    await db.collection('songs').insertOne(newSong);
    
    return NextResponse.json<ApiResponse<Song>>(
      { data: newSong },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create song:', error);
    return NextResponse.json<ApiResponse<Song>>(
      { error: 'Failed to create song' },
      { status: 500 }
    );
  }
} 