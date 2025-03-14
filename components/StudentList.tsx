'use client'

import { useStudentStore } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'

export default function StudentList() {
  const students = useStudentStore(state => state.students)
  const setCurrentStudentId = useStudentStore(state => state.setCurrentStudentId)
  const deleteStudent = useStudentStore(state => state.deleteStudent)
  
  const setAddStudentModalOpen = useUIStore(state => state.setAddStudentModalOpen)
  const setEditStudentModalOpen = useUIStore(state => state.setEditStudentModalOpen)
  const setStudentProfileModalOpen = useUIStore(state => state.setStudentProfileModalOpen)
  
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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Students</h2>
        <button 
          onClick={openAddStudentModal} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Student
        </button>
      </div>
      
      {students.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No students added yet. Click "Add Student" to get started.
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {students.map(student => (
            <li 
              key={student.id} 
              className="py-4 flex justify-between items-center hover:bg-gray-50 px-2 rounded cursor-pointer"
              onClick={() => openStudentProfile(student.id)}
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                <div className="text-sm text-gray-500">
                  {student.instrument} | {student.grade} | {student.day} {student.time}
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={(e) => openEditStudentModal(student.id, e)} 
                  className="text-blue-600 hover:text-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button 
                  onClick={(e) => confirmDeleteStudent(student.id, e)} 
                  className="text-red-600 hover:text-red-800"
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