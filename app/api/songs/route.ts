import { NextRequest, NextResponse } from 'next/server';
import { SongRepositoryFactory } from '@/lib/services/songRepository';
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
    const songRepository = SongRepositoryFactory.getRepository();
    console.log('API: Fetching all songs...');
    
    const songs = await songRepository.findAll();
    
    return NextResponse.json(
      {
        data: songs,
        count: songs.length,
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          // Add Cache-Control header to help browsers/CDNs cache the response
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        }
      }
    );
  } catch (error) {
    console.error('API: Failed to fetch songs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch songs', details: error instanceof Error ? error.message : 'Unknown error' },
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
    
    const songRepository = SongRepositoryFactory.getRepository();
    
    // Create new song
    const newSong = await songRepository.create(validationResult.data);
    
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