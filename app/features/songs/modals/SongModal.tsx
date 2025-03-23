'use client'

import { useState, useEffect } from 'react'
import { useSongStore } from '@/store/useSongStore'
import { useUIStore } from '@/store/useUIStore'
import Modal from '@/app/components/modals/Modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Song } from '@/lib/types'

interface SongFormData {
  title: string
  artist: string
  keyLetter: string
  keyModifier?: string
  keyMode?: string
  bpm?: number
  youtubeUrl?: string
}

const initialFormData: SongFormData = {
  title: '',
  artist: '',
  keyLetter: '',
  keyModifier: '',
  keyMode: 'major',
  bpm: undefined,
  youtubeUrl: ''
}

export default function SongModal() {
  const [formData, setFormData] = useState<SongFormData>(initialFormData)
  const [error, setError] = useState<string>('')
  
  const { addSong, updateSong, currentSongId, songs } = useSongStore()
  const { isSongModalOpen, closeSongModal } = useUIStore()
  
  // If editing, populate form with current song data
  useEffect(() => {
    if (currentSongId) {
      const song = songs.find(s => s.id === currentSongId)
      if (song) {
        setFormData({
          title: song.title,
          artist: song.artist,
          keyLetter: song.keyLetter,
          keyModifier: song.keyModifier,
          keyMode: song.keyMode,
          bpm: song.bpm,
          youtubeUrl: song.youtubeUrl
        })
      }
    } else {
      setFormData(initialFormData)
    }
  }, [currentSongId, songs])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      // Validate required fields
      if (!formData.title.trim()) throw new Error('Title is required')
      if (!formData.artist.trim()) throw new Error('Artist is required')
      if (!formData.keyLetter.trim()) throw new Error('Key is required')

      // Validate YouTube URL if provided
      if (formData.youtubeUrl && !formData.youtubeUrl.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
        throw new Error('Invalid YouTube URL')
      }

      if (currentSongId) {
        await updateSong(currentSongId, formData)
      } else {
        await addSong(formData)
      }

      closeSongModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save song')
    }
  }

  const handleClose = () => {
    setFormData(initialFormData)
    setError('')
    closeSongModal()
  }

  return (
    <Modal 
      isOpen={isSongModalOpen} 
      onClose={handleClose}
      title={currentSongId ? 'Edit Song' : 'Add New Song'}
      isStacked={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter song title"
            className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-dark dark:text-text-light shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="artist" className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
            Artist <span className="text-red-500">*</span>
          </label>
          <Input
            id="artist"
            value={formData.artist}
            onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
            placeholder="Enter artist name"
            className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-dark dark:text-text-light shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="keyLetter" className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
              Key <span className="text-red-500">*</span>
            </label>
            <Input
              id="keyLetter"
              value={formData.keyLetter}
              onChange={(e) => setFormData(prev => ({ ...prev, keyLetter: e.target.value }))}
              placeholder="e.g., C"
              maxLength={1}
              className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-dark dark:text-text-light shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="keyModifier" className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
              Modifier
            </label>
            <select
              id="keyModifier"
              value={formData.keyModifier || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, keyModifier: e.target.value }))}
              className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-dark dark:text-text-light shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="">None</option>
              <option value="♯">Sharp (♯)</option>
              <option value="♭">Flat (♭)</option>
            </select>
          </div>

          <div>
            <label htmlFor="keyMode" className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
              Mode
            </label>
            <select
              id="keyMode"
              value={formData.keyMode || 'major'}
              onChange={(e) => setFormData(prev => ({ ...prev, keyMode: e.target.value }))}
              className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-dark dark:text-text-light shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="major">Major</option>
              <option value="minor">Minor</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="bpm" className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
            BPM
          </label>
          <Input
            id="bpm"
            type="number"
            value={formData.bpm || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, bpm: parseInt(e.target.value) || undefined }))}
            placeholder="Enter BPM"
            min="1"
            max="300"
            className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-dark dark:text-text-light shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="youtubeUrl" className="block text-sm font-medium text-text-dark dark:text-text-light mb-1">
            YouTube URL
          </label>
          <Input
            id="youtubeUrl"
            value={formData.youtubeUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
            placeholder="Enter YouTube URL"
            className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-dark dark:text-text-light shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="rounded-md border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-4 py-2 text-sm font-medium text-text-dark dark:text-text-light shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="rounded-md border border-transparent bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700 px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark"
          >
            {currentSongId ? 'Update' : 'Add'} Song
          </Button>
        </div>
      </form>
    </Modal>
  )
} 