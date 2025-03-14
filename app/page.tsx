'use client'

import { useEffect, useState } from 'react'
import { useStudentStore, useStudentSelectors } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'
import Header from '@/components/Header'
import StudentList from '@/components/StudentList'
import TodaysLessons from '@/components/TodaysLessons'
import AddStudentModal from '@/components/modals/AddStudentModal'
import EditStudentModal from '@/components/modals/EditStudentModal'
import StudentProfileModal from '@/components/modals/StudentProfileModal'
import SettingsModal from '@/components/modals/SettingsModal'
import { StatsSection } from './lib/AppComponents'

export default function Home() {
  // Client-side only rendering
  const [isClient, setIsClient] = useState(false)
  
  // Get students data
  const students = useStudentStore(state => state.students) || []
  
  // Calculate students today based on your data model
  const todaysLessons = useStudentSelectors().getTodaysLessons()
  const studentsToday = todaysLessons.length
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-500">Please wait while we load your data.</p>
        </div>
      </div>
    )
  }
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Stats Section above everything else */}
        <div className="mb-6">
          <StatsSection totalStudents={students.length} studentsToday={studentsToday} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: Today's Lessons (switched from right) */}
          <div>
            <TodaysLessons />
          </div>
          
          {/* Right column: Student List (switched from left) */}
          <div className="md:col-span-2">
            <StudentList />
          </div>
        </div>
      </main>
      
      {/* Modals */}
      <AddStudentModal />
      <EditStudentModal />
      <StudentProfileModal />
      <SettingsModal />
    </>
  )
} 