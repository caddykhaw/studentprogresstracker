import { useState, useEffect, useCallback } from 'react';
import { ClientSongServiceFactory } from '@/lib/services/clientSongService';
import { Song, SongUpdate } from '@/lib/types';

// Song hook interface
interface UseSongsReturn {
  songs: Song[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getSong: (id: string) => Promise<Song | null>;
  createSong: (song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Song>;
  updateSong: (id: string, update: SongUpdate) => Promise<Song | null>;
  deleteSong: (id: string) => Promise<boolean>;
}

/**
 * React hook for song data and operations
 */
export function useSongs(): UseSongsReturn {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const songService = ClientSongServiceFactory.getService();
  
  // Fetch all songs
  const fetchSongs = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await songService.getSongs();
      setSongs(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch songs'));
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch a specific song by ID
  const getSong = useCallback(async (id: string): Promise<Song | null> => {
    try {
      return await songService.getSong(id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch song ${id}`));
      return null;
    }
  }, []);
  
  // Create a new song
  const createSong = useCallback(async (songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<Song> => {
    try {
      const newSong = await songService.createSong(songData);
      
      // Update local state
      setSongs(prev => [...prev, newSong]);
      
      return newSong;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create song'));
      throw err;
    }
  }, []);
  
  // Update a song
  const updateSong = useCallback(async (id: string, update: SongUpdate): Promise<Song | null> => {
    try {
      const updatedSong = await songService.updateSong(id, update);
      
      if (updatedSong) {
        // Update local state
        setSongs(prev => prev.map(song => 
          song.id === id ? updatedSong : song
        ));
      }
      
      return updatedSong;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update song ${id}`));
      throw err;
    }
  }, []);
  
  // Delete a song
  const deleteSong = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await songService.deleteSong(id);
      
      if (success) {
        // Update local state
        setSongs(prev => prev.filter(song => song.id !== id));
      }
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete song ${id}`));
      throw err;
    }
  }, []);
  
  // Initial load
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);
  
  return {
    songs,
    loading,
    error,
    refetch: fetchSongs,
    getSong,
    createSong,
    updateSong,
    deleteSong
  };
} 