'use client'

import { useState } from 'react'
import { useStudentStore } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'
import Modal from './Modal'
import StudentNotes from '../StudentNotes'

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
    setIsOpen(false)
  }
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={
        <div className="flex justify-between items-center w-full">
          <span>{currentStudent.name}</span>
          <button
            onClick={handleEdit}
            className="px-3 py-1 text-sm rounded-md bg-primary hover:bg-primary-dark text-white transition-colors"
          >
            Edit Student
          </button>
        </div>
      }
      size="lg"
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
        <div className="space-y-4">
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
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Lesson Day</h3>
            <p className="mt-1 dark:text-white">{currentStudent.day}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Lesson Time</h3>
            <p className="mt-1 dark:text-white">{currentStudent.time}</p>
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
    </Modal>
  )
} 