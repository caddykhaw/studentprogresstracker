import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Song, ApiResponse } from '@/lib/types';
import { z } from 'zod';

// Song validation schema
const songSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  keyLetter: z.string().min(1, 'Key letter is required'),
  keyModifier: z.string().optional(),
  keyMode: z.string().optional(),
  bpm: z.number().optional(),
  youtubeUrl: z.string().url().optional(),
});

// GET all songs
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    const songs = await db.collection<Song>('songs').find({}).toArray();
    
    return NextResponse.json<ApiResponse<Song[]>>({
      data: songs
    });
  } catch (error) {
    console.error('Failed to fetch songs:', error);
    return NextResponse.json<ApiResponse<Song[]>>(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    );
  }
}

// POST new song
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = songSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json<ApiResponse<Song>>(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Create new song object
    const newSong: Song = {
      id: crypto.randomUUID(),
      ...validationResult.data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection<Song>('songs').insertOne(newSong);
    
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