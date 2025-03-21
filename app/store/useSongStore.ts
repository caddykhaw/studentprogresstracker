import { create } from 'zustand'
import { Song, SongCreate, SongTeachingCreate } from '@/lib/types'

interface SongState {
  songs: Song[]
  isLoading: boolean
  error: string | null
  
  // Song fetching
  fetchSongs: () => Promise<void>
  
  // Song management
  addSong: (song: SongCreate) => Promise<Song | null>
  
  // Quick add song with teaching record
  quickAddSongWithTeaching: (
    songData: { title: string; youtubeUrl?: string },
    studentId: string
  ) => Promise<Song | null>
  
  // Teaching association
  recordTeaching: (teaching: SongTeachingCreate) => Promise<boolean>
}

export const useSongStore = create<SongState>((set, get) => ({
  songs: [],
  isLoading: false,
  error: null,
  
  fetchSongs: async () => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch('/api/songs')
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      set({ songs: data.data || [], isLoading: false })
    } catch (error) {
      console.error('Failed to fetch songs:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch songs', 
        isLoading: false 
      })
    }
  },
  
  addSong: async (songData: SongCreate) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(songData)
      })
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      // Update the song list with the new song
      const newSong = data.data
      set(state => ({
        songs: [...state.songs, newSong],
        isLoading: false
      }))
      
      return newSong
    } catch (error) {
      console.error('Failed to add song:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add song', 
        isLoading: false 
      })
      return null
    }
  },
  
  quickAddSongWithTeaching: async (
    songData: { title: string; youtubeUrl?: string },
    studentId: string
  ) => {
    // First, check if song with this title already exists
    const { songs } = get()
    const existingSong = songs.find(
      song => song.title.toLowerCase() === songData.title.toLowerCase()
    )
    
    // If song exists, just record the teaching
    if (existingSong) {
      const success = await get().recordTeaching({
        songId: existingSong.id,
        studentId,
        taughtDate: new Date().toISOString()
      })
      
      return success ? existingSong : null
    }
    
    // If song doesn't exist, create it and then record teaching
    const newSong = await get().addSong({
      title: songData.title,
      youtubeUrl: songData.youtubeUrl
    })
    
    if (newSong) {
      const success = await get().recordTeaching({
        songId: newSong.id,
        studentId,
        taughtDate: new Date().toISOString()
      })
      
      return success ? newSong : null
    }
    
    return null
  },
  
  recordTeaching: async (teachingData: SongTeachingCreate) => {
    try {
      const response = await fetch('/api/songs/teaching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(teachingData)
      })
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      // Update the last taught date and frequency for the song
      set(state => {
        const updatedSongs = state.songs.map(song => {
          if (song.id === teachingData.songId) {
            return {
              ...song,
              lastTaught: teachingData.taughtDate,
              frequency: (song.frequency || 0) + 1
            }
          }
          return song
        })
        
        return { songs: updatedSongs }
      })
      
      return true
    } catch (error) {
      console.error('Failed to record teaching:', error)
      set({ 
        error: error instanceof Error ? error.message : 'Failed to record teaching session'
      })
      return false
    }
  }
})) 