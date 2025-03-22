'use client'

import { useState } from 'react'
import { useStudentStore } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'
import Modal from '@/app/components/modals/Modal'
import StudentNotes from '../StudentNotes'
import { Button } from '@/components/ui/button'

// Use the Note interface from the store
interface Note {
  id: string
  date: string
  content: string
}

export default function StudentProfileModal() {
  const isOpen = useUIStore(state => state.studentProfileModalOpen)
  const setIsOpen = useUIStore(state => state.setStudentProfileModalOpen)
  const setAddNoteModalOpen = useUIStore(state => state.setAddNoteModalOpen)
  const setEditNoteModalOpen = useUIStore(state => state.setEditNoteModalOpen)
  const setEditStudentModalOpen = useUIStore(state => state.setEditStudentModalOpen)
  
  const currentStudentId = useStudentStore(state => state.currentStudentId)
  const students = useStudentStore(state => state.students)
  const setCurrentNoteIndex = useStudentStore(state => state.setCurrentNoteIndex)
  
  const [activeTab, setActiveTab] = useState('details')
  
  const currentStudent = students.find(s => s.id === currentStudentId)
  
  if (!currentStudent) return null
  
  const handleClose = () => {
    setIsOpen(false)
    setActiveTab('details')
  }

  const handleEdit = () => {
    setEditStudentModalOpen(true)
    handleClose()
  }
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={currentStudent.name}
      size="lg"
      showCloseButton={false}
    >
      <div className="mb-4">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'notes' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setActiveTab('notes')}
          >
            Notes ({currentStudent.notes.length})
          </button>
        </div>
      </div>
      
      {activeTab === 'details' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Instrument</h3>
              <p className="mt-1 dark:text-white">{currentStudent.instrument}</p>
            </div>
            
            {currentStudent.grade && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Grade/Level</h3>
                <p className="mt-1 dark:text-white">{currentStudent.grade}</p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Lesson Day</h3>
              <p className="mt-1 dark:text-white">{currentStudent.day}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Lesson Time</h3>
              <p className="mt-1 dark:text-white">{currentStudent.time}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact</h3>
            <p className="mt-1 dark:text-white">{currentStudent.contact || 'Not provided'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Material</h3>
            <p className="mt-1 whitespace-pre-line dark:text-white">{currentStudent.currentMaterial || 'Not provided'}</p>
          </div>
        </div>
      )}
      
      {activeTab === 'notes' && (
        <div>
          <StudentNotes studentId={currentStudentId!} />
        </div>
      )}

      <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
        <Button 
          variant="secondary" 
          onClick={handleEdit}
          className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Edit
        </Button>
        <Button 
          variant="outline" 
          onClick={handleClose}
          className="border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-dark dark:text-text-light hover:bg-accent/50 dark:hover:bg-accent/50"
        >
          Close
        </Button>
      </div>
    </Modal>
  )
} 