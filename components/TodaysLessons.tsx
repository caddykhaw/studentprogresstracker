'use client'

import { useStudentSelectors } from '@/store/useStudentStore'
import { useStudentStore } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'

export default function TodaysLessons() {
  const { getTodaysLessons } = useStudentSelectors()
  const todaysLessons = getTodaysLessons()
  
  const setCurrentStudentId = useStudentStore(state => state.setCurrentStudentId)
  const setStudentProfileModalOpen = useUIStore(state => state.setStudentProfileModalOpen)
  
  const openStudentProfile = (studentId: string) => {
    setCurrentStudentId(studentId)
    setStudentProfileModalOpen(true)
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Today's Lessons</h2>
      
      {todaysLessons.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No lessons scheduled for today.
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {todaysLessons.map(student => (
            <li 
              key={student.id} 
              className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded cursor-pointer"
              onClick={() => openStudentProfile(student.id)}
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                <div className="text-sm text-gray-500">
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