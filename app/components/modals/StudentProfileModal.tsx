'use client'

import { useState, useEffect } from 'react'
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
  const isOpen = useUIStore(state => state.isStudentProfileModalOpen)
  const closeStudentProfileModal = useUIStore(state => state.closeStudentProfileModal)
  const openEditStudentModal = useUIStore(state => state.openEditStudentModal)
  const openEditStudentFromProfile = useUIStore(state => state.openEditStudentFromProfile)
  
  const selectedStudentId = useUIStore(state => state.selectedStudentId)
  const students = useStudentStore(state => state.students)
  const fetchNotes = useStudentStore(state => state.fetchNotes)
  
  const [activeTab, setActiveTab] = useState('details')
  
  const currentStudent = students.find(s => s.id === selectedStudentId)
  
  // Fetch student notes when profile is opened or when switching to notes tab
  useEffect(() => {
    if (isOpen && selectedStudentId) {
      fetchNotes(selectedStudentId)
    }
  }, [isOpen, selectedStudentId, fetchNotes])
  
  // Fetch notes again when switching to notes tab
  useEffect(() => {
    if (isOpen && selectedStudentId && activeTab === 'notes') {
      fetchNotes(selectedStudentId)
    }
  }, [activeTab, isOpen, selectedStudentId, fetchNotes])
  
  if (!currentStudent) return null
  
  const handleClose = () => {
    closeStudentProfileModal()
    setActiveTab('details')
  }

  const handleEdit = () => {
    openEditStudentFromProfile(currentStudent.id)
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
      size={activeTab === 'notes' ? 'xl' : 'lg'}
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
            Notes
          </button>
        </div>
      </div>
      
      {activeTab === 'details' && (
        <div className="space-y-4">
          {/* Instrument and Grade side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Instrument</h3>
              <p className="mt-1 dark:text-white">{currentStudent.instrument}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Grade/Level</h3>
              <p className="mt-1 dark:text-white">{currentStudent.grade || 'Not provided'}</p>
            </div>
          </div>
          
          {/* Day and Time side by side */}
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
          <StudentNotes studentId={selectedStudentId!} />
        </div>
      )}
    </Modal>
  )
} 
