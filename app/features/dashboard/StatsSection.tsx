'use client'

import { studentSelectors } from '@/app/store/useStudentStore'

export default function StatsSection() {
  const students = studentSelectors.useStudents()
  const todaysLessons = studentSelectors.useTodaysLessons()
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          Total Students
        </h3>
        <p className="text-3xl font-bold text-primary">{students.length}</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          Today's Students
        </h3>
        <p className="text-3xl font-bold text-primary">{todaysLessons.length}</p>
      </div>
    </div>
  )
} 