'use client'

import { useState } from 'react'
import { useStudentStore } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'
import Modal from '../ui/Modal'
import StudentNotes from '../students/StudentNotes'

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
  
  const [activeTab, setActiveTab] = useState('details')
  
  const currentStudent = students.find(s => s.id === selectedStudentId)
  
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
      title={currentStudent.name}
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
      
      {/* Actions buttons at the bottom similar to SongForm */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Close
        </button>
        <button
          type="button"
          onClick={handleEdit}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Edit Student
        </button>
      </div>
    </Modal>
  )
} 
