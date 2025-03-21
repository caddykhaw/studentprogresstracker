'use client'

import { useState, useEffect } from 'react'
import { useStudentStore } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'

export default function TodaySchedule() {
  const students = useStudentStore(state => state.students)
  const openStudentProfileModal = useUIStore(state => state.openStudentProfileModal)

  // Get today's day name
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const [currentTime, setCurrentTime] = useState(new Date())

  // Filter students for today and sort by time
  const todaysRemainingStudents = students
    .filter(student => {
      // Only include students with lessons today
      if (student.day !== today) return false

      // Parse the lesson time
      const [hours, minutes] = student.time.split(':').map(Number)
      const lessonTime = new Date()
      lessonTime.setHours(hours, minutes, 0)
      
      // Add 45 minutes to lesson time for the cutoff
      const cutoffTime = new Date(lessonTime.getTime() + 45 * 60 * 1000)

      // Keep students in list until 45 minutes after their lesson time
      return cutoffTime > currentTime
    })
    .sort((a, b) => {
      // Sort by lesson time
      const [aHours, aMinutes] = a.time.split(':').map(Number)
      const [bHours, bMinutes] = b.time.split(':').map(Number)
      return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes)
    })

  // Update the list every minute
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update the list
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const handleOpenStudentProfile = (studentId: string) => {
    openStudentProfileModal(studentId)
  }

  if (todaysRemainingStudents.length === 0) {
    return (
      <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 mb-6 transition-colors duration-200">
        <h2 className="text-xl font-semibold text-black dark:text-white mb-4">Today's Remaining Lessons</h2>
        <p className="text-center py-4 text-gray-700 dark:text-gray-300">
          No more lessons scheduled for today.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 mb-6 transition-colors duration-200">
      <h2 className="text-xl font-semibold text-black dark:text-white mb-4">Today's Remaining Lessons</h2>
      <ul className="divide-y divide-gray-200 dark:divide-gray-800">
        {todaysRemainingStudents.map(student => {
          const [hours, minutes] = student.time.split(':').map(Number)
          const lessonTime = new Date()
          lessonTime.setHours(hours, minutes, 0)
          const timeUntil = lessonTime.getTime() - currentTime.getTime()
          const minutesUntil = Math.floor(timeUntil / (1000 * 60))
          
          // Calculate time remaining or time elapsed
          let timeDisplay
          if (timeUntil > 0) {
            const hoursUntil = Math.floor(minutesUntil / 60)
            if (hoursUntil > 0) {
              timeDisplay = `in ${hoursUntil}h ${minutesUntil % 60}m`
            } else {
              timeDisplay = `in ${minutesUntil}m`
            }
          } else {
            // Show how long ago the lesson started
            const minutesElapsed = Math.abs(minutesUntil)
            timeDisplay = `${minutesElapsed}m ago`
          }
          
          return (
            <li
              key={student.id}
              onClick={() => handleOpenStudentProfile(student.id)}
              className="py-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-900 px-2 rounded cursor-pointer transition-colors"
            >
              <div>
                <h3 className="text-lg font-medium text-black dark:text-white">{student.name}</h3>
                <div className="text-sm text-gray-800 dark:text-gray-300">
                  {student.instrument} | {student.time}
                </div>
              </div>
              <div className={`text-sm font-medium ${
                timeUntil > 0 
                  ? 'text-gray-600 dark:text-gray-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                {timeDisplay}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
} 
