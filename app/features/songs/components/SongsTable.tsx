'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Music4, ArrowUpDown } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useSongStore } from '@/store/useSongStore'
import { useUIStore } from '@/store/useUIStore'
import { Song } from '@/lib/types'

export default function SongsTable() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<keyof Song>('title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const mounted = useRef(false)
  
  // Use separate selectors to prevent unnecessary re-renders
  const songs = useSongStore(state => state.songs)
  const isLoading = useSongStore(state => state.isLoading)
  const error = useSongStore(state => state.error)
  const fetchSongs = useSongStore(state => state.fetchSongs)
  const setCurrentSongId = useSongStore(state => state.setCurrentSongId)
  const openSongModal = useUIStore(state => state.openSongModal)

  // Only fetch songs on initial mount
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      console.log('Table: Initial songs fetch starting...')
      fetchSongs().catch(err => {
        console.error('Table: Error fetching songs:', err)
      })
    }
  }, []) // Empty dependency array ensures this runs once on mount
  
  // Debug log when songs change
  useEffect(() => {
    console.log('Table: Songs data changed:', {
      songsLength: songs?.length || 0,
      isLoading,
      error,
      hasFetched: mounted.current
    })
  }, [songs, isLoading, error])

  const handleSort = (field: keyof Song) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleEdit = (songId: string) => {
    setCurrentSongId(songId)
    openSongModal()
  }

  const sortedAndFilteredSongs = Array.isArray(songs) ? songs
    .filter((song: Song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      const direction = sortDirection === 'asc' ? 1 : -1
      
      if (aValue === undefined) return 1
      if (bValue === undefined) return -1
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * direction
      }
      
      if (aValue < bValue) return -1 * direction
      if (aValue > bValue) return 1 * direction
      return 0
    })
    : []

  return (
    <>
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search songs or artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark">
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('artist')}
                    className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Artist
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('keyLetter')}
                    className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Key
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('bpm')}
                    className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    BPM
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('updatedAt')}
                    className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    Last Updated
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Loading songs...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-red-500">
                    Error loading songs: {error}
                  </td>
                </tr>
              ) : !sortedAndFilteredSongs || !sortedAndFilteredSongs[0] ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No songs found. {searchQuery ? 'Try a different search term.' : 'Add some songs to get started!'}
                  </td>
                </tr>
              ) : (
                sortedAndFilteredSongs.map((song) => (
                  <tr
                    key={song.id}
                    className="border-b border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {song.youtubeUrl ? (
                          <a
                            href={song.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-dark mr-2"
                          >
                            <Music4 className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="w-6" />
                        )}
                        <span className="dark:text-white">{song.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 dark:text-white">{song.artist}</td>
                    <td className="px-6 py-4 dark:text-white">
                      {song.keyLetter}
                      {song.keyModifier || ''}
                      {song.keyMode === 'minor' ? 'm' : ''}
                    </td>
                    <td className="px-6 py-4 dark:text-white">{song.bpm || '-'}</td>
                    <td className="px-6 py-4 dark:text-white">{song.updatedAt ? formatDate(song.updatedAt) : '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(song.id)}
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
} 