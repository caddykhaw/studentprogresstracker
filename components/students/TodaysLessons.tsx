'use client'

import { useStudentSelectors } from '@/store/useStudentStore'
import { useStudentStore } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'

export default function TodaysLessons() {
  // Get today's lessons directly from selectors object
  const todaysLessons = useStudentSelectors.getTodaysLessons()
  
  const openStudentProfileModal = useUIStore(state => state.openStudentProfileModal)
  
  const handleOpenStudentProfile = (studentId: string) => {
    openStudentProfileModal(studentId)
  }
  
  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Today's Lessons</h2>
      
      {todaysLessons.length === 0 ? (
        <div className="text-center py-8 text-gray-700 dark:text-gray-300">
          No lessons scheduled for today.
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {todaysLessons.map(student => (
            <li 
              key={student.id} 
              className="py-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-900 px-2 rounded cursor-pointer transition-colors"
              onClick={() => handleOpenStudentProfile(student.id)}
            >
              <div>
                <h3 className="text-lg font-medium text-black dark:text-white">{student.name}</h3>
                <div className="text-sm text-gray-800 dark:text-gray-300">
                  {student.time} | {student.instrument}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 
