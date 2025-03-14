'use client'

import { useState, useEffect } from 'react'
import { useStudentStore } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'
import Modal from './Modal'

export default function EditNoteModal() {
  const isOpen = useUIStore(state => state.editNoteModalOpen)
  const setIsOpen = useUIStore(state => state.setEditNoteModalOpen)
  
  const { updateNote, currentStudentId, currentNoteIndex, students } = useStudentStore()
  
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  
  const currentStudent = students.find(s => s.id === currentStudentId)
  const currentNote = currentStudent?.notes[currentNoteIndex || 0]
  
  // Load current note data when modal opens
  useEffect(() => {
    if (isOpen && currentNote) {
      setContent(currentNote.content)
    }
  }, [isOpen, currentNote])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('Note content is required')
      return
    }
    
    if (!currentStudentId || currentNoteIndex === null) return
    
    updateNote({ 
      studentId: currentStudentId, 
      noteIndex: currentNoteIndex,
      text: content.trim() 
    })
    
    handleClose()
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    if (error) setError('')
  }
  
  const handleClose = () => {
    setIsOpen(false)
    setError('')
  }
  
  if (!currentStudent || !currentNote) return null
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Edit Note for ${currentStudent.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Note Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={content}
            onChange={handleChange}
            rows={6}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              error ? 'border-red-500' : ''
            }`}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        
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
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  )
} 