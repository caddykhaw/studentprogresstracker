'use client'

import { useState, useEffect, useRef } from 'react'
import { useStudentStore } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'

export default function StudentList() {
  const students = useStudentStore(state => state.students)
  const setCurrentStudentId = useStudentStore(state => state.setCurrentStudentId)
  const deleteStudent = useStudentStore(state => state.deleteStudent)
  
  const setAddStudentModalOpen = useUIStore(state => state.setAddStudentModalOpen)
  const setEditStudentModalOpen = useUIStore(state => state.setEditStudentModalOpen)
  const setStudentProfileModalOpen = useUIStore(state => state.setStudentProfileModalOpen)
  
  // Search state
  const [searchVisible, setSearchVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // Focus input when search becomes visible
  useEffect(() => {
    if (searchVisible && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchVisible])

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchVisible && 
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node) &&
        searchQuery === ''
      ) {
        setSearchVisible(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [searchVisible, searchQuery])
  
  // Filter and sort students
  const filteredAndSortedStudents = [...students]
    .filter(student => {
      if (!searchQuery) return true
      
      const query = searchQuery.toLowerCase()
      return (
        student.name.toLowerCase().includes(query) ||
        student.instrument.toLowerCase().includes(query) ||
        student.grade.toLowerCase().includes(query) ||
        student.day.toLowerCase().includes(query) ||
        (student.contact && student.contact.toLowerCase().includes(query))
      )
    })
    .sort((a, b) => a.name.localeCompare(b.name))
  
  const toggleSearch = () => {
    setSearchVisible(!searchVisible)
    if (!searchVisible) {
      // Reset search when opening
      setSearchQuery('')
    }
  }
  
  const openAddStudentModal = () => {
    setAddStudentModalOpen(true)
  }
  
  const openEditStudentModal = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentStudentId(studentId)
    setEditStudentModalOpen(true)
  }
  
  const openStudentProfile = (studentId: string) => {
    setCurrentStudentId(studentId)
    setStudentProfileModalOpen(true)
  }
  
  const confirmDeleteStudent = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      deleteStudent(studentId)
    }
  }
  
  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 mb-6 transition-colors duration-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-black dark:text-white">Students</h2>
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative flex items-center">
            {searchVisible && (
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8 pl-3 py-2 border rounded-lg dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-700 transition-all duration-200 w-full"
              />
            )}
            
            <button 
              onClick={toggleSearch}
              className={`p-2 text-gray-800 hover:text-black dark:text-gray-200 dark:hover:text-white rounded-lg focus:outline-none ${searchVisible ? 'absolute right-1' : ''}`}
              aria-label="Search students"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          {/* Add Student Button */}
          <button 
            onClick={openAddStudentModal} 
            className="bg-blue-700 hover:bg-blue-900 dark:bg-blue-800 dark:hover:bg-blue-950 text-white font-bold py-2 px-4 rounded flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Student
          </button>
        </div>
      </div>
      
      {students.length === 0 ? (
        <div className="text-center py-8 text-gray-700 dark:text-gray-300">
          No students added yet. Click "Add Student" to get started.
        </div>
      ) : filteredAndSortedStudents.length === 0 ? (
        <div className="text-center py-8 text-gray-700 dark:text-gray-300">
          No students match your search. Try a different term or clear the search.
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {filteredAndSortedStudents.map(student => (
            <li 
              key={student.id} 
              className="py-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-900 px-2 rounded cursor-pointer transition-colors"
              onClick={() => openStudentProfile(student.id)}
            >
              <div>
                <h3 className="text-lg font-medium text-black dark:text-white">{student.name}</h3>
                <div className="text-sm text-gray-800 dark:text-gray-300">
                  {student.instrument} | {student.grade} | {student.day} {student.time}
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={(e) => openEditStudentModal(student.id, e)} 
                  className="text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button 
                  onClick={(e) => confirmDeleteStudent(student.id, e)} 
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 