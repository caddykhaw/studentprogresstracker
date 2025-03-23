import { create } from 'zustand'
import { Song } from '@/lib/types'

interface SongState {
  songs: Song[]
  currentSongId: string | null
  isLoading: boolean
  error: string | null
  fetchSongs: () => Promise<void>
  addSong: (song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateSong: (id: string, song: Partial<Song>) => Promise<void>
  deleteSong: (id: string) => Promise<void>
  setCurrentSongId: (id: string | null) => void
}

export const useSongStore = create<SongState>((set, get) => ({
  songs: [],
  currentSongId: null,
  isLoading: false,
  error: null,

  setCurrentSongId: (id) => set({ currentSongId: id }),

  fetchSongs: async () => {
    console.log('Store: Starting to fetch songs...');
    set({ isLoading: true, error: null })
    
    try {
      console.log('Store: Making API request to /api/songs');
      const response = await fetch('/api/songs')
      console.log('Store: Received response with status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Store: API returned error status:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.error || 'Failed to fetch songs');
      }
      
      const responseData = await response.json()
      console.log('Store: Parsed response data:', {
        success: responseData.success,
        dataExists: !!responseData.data,
        isArray: Array.isArray(responseData.data),
        length: responseData.data?.length
      });
      
      if (!responseData.data || !Array.isArray(responseData.data)) {
        console.error('Store: Invalid response format:', responseData)
        throw new Error('Invalid response format: expected data array')
      }
      
      set({ 
        songs: responseData.data, 
        isLoading: false,
        error: null
      })
      console.log('Store: Updated songs in state:', responseData.data.length, 'songs')
    } catch (error) {
      console.error('Store: Error fetching songs:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch songs', 
        isLoading: false,
        songs: [] // Reset songs on error
      })
    }
  },

  addSong: async (song) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(song),
      })
      if (!response.ok) throw new Error('Failed to add song')
      const { data, error } = await response.json()
      if (error) throw new Error(error)
      set(state => ({ songs: [...state.songs, data], isLoading: false }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add song', isLoading: false })
    }
  },

  updateSong: async (id, song) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/songs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(song),
      })
      if (!response.ok) throw new Error('Failed to update song')
      const { data, error } = await response.json()
      if (error) throw new Error(error)
      set(state => ({
        songs: state.songs.map(s => s.id === id ? data : s),
        isLoading: false,
        currentSongId: null
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update song', isLoading: false })
    }
  },

  deleteSong: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`/api/songs/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete song')
      const { error } = await response.json()
      if (error) throw new Error(error)
      set(state => ({
        songs: state.songs.filter(s => s.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete song', isLoading: false })
    }
  }
})) 