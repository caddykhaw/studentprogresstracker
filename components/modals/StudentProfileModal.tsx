'use client'

import { useState } from 'react'
import { useStudentStore } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'
import Modal from './Modal'

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
  
  const currentStudentId = useStudentStore(state => state.currentStudentId)
  const students = useStudentStore(state => state.students)
  const setCurrentNoteIndex = useStudentStore(state => state.setCurrentNoteIndex)
  const deleteNote = useStudentStore(state => state.deleteNote)
  
  const [activeTab, setActiveTab] = useState('details')
  
  const currentStudent = students.find(s => s.id === currentStudentId)
  
  if (!currentStudent) return null
  
  const handleClose = () => {
    setIsOpen(false)
    setActiveTab('details')
  }
  
  const openAddNoteModal = () => {
    setAddNoteModalOpen(true)
  }
  
  const openEditNoteModal = (noteId: string) => {
    const noteIndex = currentStudent.notes.findIndex(n => n.id === noteId)
    if (noteIndex !== -1) {
      setCurrentNoteIndex(noteIndex)
      setEditNoteModalOpen(true)
    }
  }
  
  const confirmDeleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const noteIndex = currentStudent.notes.findIndex(n => n.id === noteId)
      if (noteIndex !== -1) {
        deleteNote({ studentId: currentStudentId!, noteIndex })
      }
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={currentStudent.name}>
      <div className="mb-4">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'notes' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('notes')}
          >
            Notes ({currentStudent.notes.length})
          </button>
        </div>
      </div>
      
      {activeTab === 'details' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Instrument</h3>
            <p className="mt-1">{currentStudent.instrument}</p>
          </div>
          
          {currentStudent.grade && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Grade/Level</h3>
              <p className="mt-1">{currentStudent.grade}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Lesson Day</h3>
            <p className="mt-1">{currentStudent.day}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Lesson Time</h3>
            <p className="mt-1">{currentStudent.time}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact</h3>
            <p className="mt-1">{currentStudent.contact || 'Not provided'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Current Material</h3>
            <p className="mt-1 whitespace-pre-line">{currentStudent.currentMaterial || 'Not provided'}</p>
          </div>
        </div>
      )}
      
      {activeTab === 'notes' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={openAddNoteModal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add Note
            </button>
          </div>
          
          {currentStudent.notes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No notes yet. Add your first note!
            </div>
          ) : (
            <div className="space-y-4">
              {[...currentStudent.notes]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((note: Note) => (
                  <div key={note.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{formatDate(note.date)}</div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditNoteModal(note.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDeleteNote(note.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 whitespace-pre-line">{note.content}</div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
} 