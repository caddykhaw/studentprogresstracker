import { useState } from 'react'
import { useUIStore } from '../../store/useUIStore'
import { useStudentStore } from '../../store/useStudentStore'
import { Dialog } from '@headlessui/react'
import { Student } from '../../../lib/types'

export default function AddStudentModal() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { isAddStudentModalOpen, closeAddStudentModal } = useUIStore()
  const addStudent = useStudentStore(state => state.addStudent)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    console.group('🎓 Adding New Student')
    console.log('📝 Starting form submission process...')
    
    const formData = new FormData(e.currentTarget)
    const studentData: Partial<Student> = {
      name: formData.get('name') as string,
      grade: formData.get('grade') as string,
      attendance: '100%',
      lastActive: 'Today',
    }
    
    console.log('📋 Collected form data:', {
      name: studentData.name,
      grade: studentData.grade,
      attendance: studentData.attendance,
      lastActive: studentData.lastActive
    })
    
    try {
      console.log('🚀 Sending request to create student...')
      console.time('createStudent')
      
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      })
      
      const data = await response.json()
      console.timeEnd('createStudent')
      
      if (!response.ok) {
        console.error('❌ Server returned error:', data.error)
        throw new Error(data.error || 'Failed to create student')
      }
      
      console.log('✅ Student created successfully:', {
        _id: data._id,
        name: data.name,
        grade: data.grade
      })
      
      // Update local state with the complete student data from MongoDB
      addStudent(data)
      console.log('📊 Local state updated with new student')
      
      // Close modal and reset form
      e.currentTarget.reset()
      closeAddStudentModal()
      console.log('🔒 Add student modal closed')
      console.groupEnd()
      
    } catch (err) {
      console.group('❌ Error Details')
      console.error('Error creating student:', err)
      console.error('Stack trace:', err instanceof Error ? err.stack : 'No stack trace available')
      console.groupEnd()
      
      setError(err instanceof Error ? err.message : 'Failed to create student')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog
      open={isAddStudentModalOpen}
      onClose={closeAddStudentModal}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800">
          <Dialog.Title className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Student</h3>
          </Dialog.Title>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Student Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Grade
              </label>
              <select
                name="grade"
                id="grade"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="A+">A+</option>
                <option value="A">A</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B">B</option>
                <option value="B-">B-</option>
                <option value="C+">C+</option>
                <option value="C">C</option>
                <option value="C-">C-</option>
                <option value="D">D</option>
                <option value="F">F</option>
              </select>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeAddStudentModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Student'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 