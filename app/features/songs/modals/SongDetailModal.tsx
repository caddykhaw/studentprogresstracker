'use client'

import { useSongStore } from '@/store/useSongStore'
import { useUIStore } from '@/store/useUIStore'
import Modal from '@/app/components/modals/Modal'
import { Button } from '@/components/ui/button'
import { Music4, Edit2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

function getYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1)
    }
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      const searchParams = new URLSearchParams(urlObj.search)
      return searchParams.get('v')
    }
  } catch (e) {
    console.error('Error parsing YouTube URL:', e)
  }
  return null
}

export default function SongDetailModal() {
  const { songs, currentSongId } = useSongStore()
  const { 
    isSongDetailModalOpen, 
    closeSongDetailModal, 
    setSongModalOpen,
    setSongDetailModalOpen
  } = useUIStore()

  const currentSong = songs.find(s => s.id === currentSongId)

  const handleEdit = () => {
    console.log('🔵 Edit button clicked')
    setSongModalOpen(true)
    handleClose()
  }

  const handleClose = () => {
    console.log('🔴 handleClose called')
    closeSongDetailModal()
  }

  if (!currentSong) return null

  const videoId = currentSong.youtubeUrl ? getYouTubeVideoId(currentSong.youtubeUrl) : null

  return (
    <Modal
      isOpen={isSongDetailModalOpen}
      onClose={handleClose}
      title="Song Details"
      size="xl"
      isStacked={true}
    >
      <div className="flex gap-6">
        {/* Left Column - Song Details and Teaching History */}
        <div className="flex-1 space-y-6">
          {/* Title and Artist Section */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold dark:text-white flex items-center gap-2">
              <Music4 className="h-6 w-6 text-primary" />
              {currentSong.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">{currentSong.artist}</p>
          </div>

          {/* Key and BPM Section */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Key</p>
              <p className="text-lg font-medium dark:text-white">
                {currentSong.keyLetter}
                {currentSong.keyModifier || ''}
                {currentSong.keyMode === 'minor' ? 'm' : ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">BPM</p>
              <p className="text-lg font-medium dark:text-white">
                {currentSong.bpm || '-'}
              </p>
            </div>
          </div>

          {/* Teaching History Section */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 dark:text-white">Teaching History</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Coming soon: This section will show the history of when this song was taught to students.
              </p>
            </div>
          </div>

          {/* Timestamps Section */}
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>Created: {currentSong.createdAt ? formatDate(currentSong.createdAt) : '-'}</p>
            <p>Last Updated: {currentSong.updatedAt ? formatDate(currentSong.updatedAt) : '-'}</p>
          </div>
        </div>

        {/* Right Column - YouTube Video */}
        <div className="flex-1">
          {videoId ? (
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={`${currentSong.title} by ${currentSong.artist}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="aspect-video rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">No video available</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex justify-end space-x-3 pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={handleEdit}
          className="inline-flex items-center gap-2 rounded-md border border-transparent bg-primary hover:bg-primary-dark text-white px-4 py-2 text-sm font-medium shadow-sm"
        >
          <Edit2 className="h-4 w-4" />
          Edit Song
        </Button>
        <Button
          variant="outline"
          onClick={handleClose}
          className="rounded-md border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-4 py-2 text-sm font-medium text-text-dark dark:text-text-light shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Close
        </Button>
      </div>
    </Modal>
  )
} 