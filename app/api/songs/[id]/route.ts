import { NextRequest, NextResponse } from 'next/server';
import { SongRepositoryFactory } from '@/lib/services/songRepository';
import { Song, ApiResponse, SongUpdate } from '@/lib/types';

// GET - Fetch a specific song
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const songId = params.id;
    const songRepository = SongRepositoryFactory.getRepository();
    
    // Find the song
    const song = await songRepository.findById(songId);
    
    if (!song) {
      return NextResponse.json<ApiResponse<Song>>(
        { error: 'Song not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json<ApiResponse<Song>>({
      data: song
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
    const songRepository = SongRepositoryFactory.getRepository();
    
    // Update the song
    const updatedSong = await songRepository.update(songId, data);
    
    if (!updatedSong) {
      return NextResponse.json<ApiResponse<Song>>(
        { error: 'Song not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json<ApiResponse<Song>>({
      data: updatedSong
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
    const songRepository = SongRepositoryFactory.getRepository();
    
    // Delete the song
    const success = await songRepository.delete(songId);
    
    if (!success) {
      return NextResponse.json<ApiResponse<boolean>>(
        { error: 'Song not found' },
        { status: 404 }
      );
    }
    
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