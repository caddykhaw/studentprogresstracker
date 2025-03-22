'use client'

import { useState } from 'react'
import { useStudentStore } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'
import Modal from '@/app/components/modals/Modal'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function AddNoteModal() {
  const isOpen = useUIStore(state => state.addNoteModalOpen)
  const setIsOpen = useUIStore(state => state.setAddNoteModalOpen)
  
  const { addNote, currentStudentId, students } = useStudentStore()
  
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const currentStudent = students.find(s => s.id === currentStudentId)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('Note content is required')
      return
    }
    
    if (!currentStudentId) return
    
    setIsLoading(true)
    setError('')
    
    try {
      await addNote({ 
        studentId: currentStudentId, 
        note: {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          content: content.trim()
        }
      })
      
      toast.success('Note added successfully')
      handleClose()
    } catch (error) {
      console.error('Failed to add note:', error)
      setError('Failed to add note. Please try again.')
      toast.error('Failed to add note')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    if (error) setError('')
  }
  
  const handleClose = () => {
    setIsOpen(false)
    setContent('')
    setError('')
  }
  
  if (!currentStudent) return null
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Add Note for ${currentStudent.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Note Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={content}
            onChange={handleChange}
            disabled={isLoading}
            rows={6}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              error ? 'border-red-500' : ''
            }`}
            placeholder="Enter lesson notes, progress updates, or reminders..."
          />
          {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Note'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
} 