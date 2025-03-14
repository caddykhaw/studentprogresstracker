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

export default function Home() {
  // Client-side only rendering
  const [isClient, setIsClient] = useState(false)
  
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: Student List */}
          <div className="md:col-span-2">
            <StudentList />
          </div>
          
          {/* Right column: Today's Lessons */}
          <div>
            <TodaysLessons />
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