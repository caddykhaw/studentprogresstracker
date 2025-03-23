import { NextRequest, NextResponse } from 'next/server';
import { SongRepositoryFactory } from '@/lib/services/songRepository';
import { Song, ApiResponse } from '@/lib/types';
import { z } from 'zod';
import { MongoClient } from 'mongodb';

// Helper function to check MongoDB connection
async function checkMongoConnection() {
  console.log('Attempting MongoDB connection...');
  try {
    const uri = process.env.MONGODB_URI;
    console.log('MongoDB URI exists:', !!uri);
    
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    const client = new MongoClient(uri);
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB successfully');
    await client.db('admin').command({ ping: 1 });
    console.log('MongoDB ping successful');
    await client.close();
    return true;
  } catch (error) {
    console.error('MongoDB Connection Test Failed:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return false;
  }
}

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
export async function GET(request: NextRequest) {
  console.log('GET /api/songs - Starting request handling');
  try {
    // Check MongoDB connection first
    const isConnected = await checkMongoConnection();
    console.log('MongoDB connection check result:', isConnected);

    if (!isConnected) {
      throw new Error('Failed to connect to MongoDB');
    }

    const songRepository = SongRepositoryFactory.getRepository();
    console.log('Song repository created successfully');

    const songs = await songRepository.findAll();
    console.log('Songs retrieved successfully, count:', songs.length);

    return NextResponse.json({
      success: true,
      data: songs
    });
  } catch (error) {
    console.error('GET /api/songs - Error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
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