'use client'

import { useState } from 'react'
import { useStudentStore } from '@/app/store/useStudentStore'
import { useUIStore } from '@/app/store/useUIStore'
import Modal from '../ui/Modal'
import QuickAddSong from '../songs/QuickAddSong'
import { Song } from '@/lib/types'

export default function AddNoteModal() {
  const isOpen = useUIStore(state => state.isAddNoteModalOpen)
  const setIsOpen = useUIStore(state => state.closeAddNoteModal)
  
  const { addNote, currentStudentId, students } = useStudentStore()
  
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [addedSongs, setAddedSongs] = useState<Song[]>([])
  
  const currentStudent = students.find(s => s.id === currentStudentId)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('Note content is required')
      return
    }
    
    if (!currentStudentId) return
    
    // Include any added songs in the note content
    let noteContent = content.trim()
    
    if (addedSongs.length > 0) {
      const songsList = addedSongs.map(song => 
        `- ${song.title}${song.artist ? ` by ${song.artist}` : ''}`
      ).join('\n')
      
      noteContent += `\n\nSongs added:\n${songsList}`
    }
    
    addNote({ 
      studentId: currentStudentId, 
      note: {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        content: noteContent
      }
    })
    
    handleClose()
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    if (error) setError('')
  }
  
  const handleClose = () => {
    setIsOpen()
    setContent('')
    setError('')
    setAddedSongs([])
  }
  
  const handleSongAdded = (song: Song) => {
    setAddedSongs(prev => [...prev, song])
  }
  
  if (!currentStudent) return null
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Add Note for ${currentStudent.name}`} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Note Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={content}
            onChange={handleChange}
            rows={8}
            className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              error ? 'border-red-500' : ''
            }`}
            placeholder="Enter lesson notes, progress updates, or reminders..."
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        
        {/* Display added songs */}
        {addedSongs.length > 0 && (
          <div className="mt-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Added Songs:
            </h4>
            <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {addedSongs.map(song => (
                <li key={song.id} className="flex items-center">
                  <span>• {song.title}</span>
                  {song.artist && <span className="ml-1 text-gray-500">by {song.artist}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Quick Add Song Component */}
        <QuickAddSong 
          studentId={currentStudentId!} 
          onSongAdded={handleSongAdded} 
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Note
          </button>
        </div>
      </form>
    </Modal>
  )
} 
