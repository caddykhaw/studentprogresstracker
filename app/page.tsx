'use client'

import { Suspense, useEffect, useState } from 'react'
import { useStudentStore, useStudentSelectors } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'
import { 
  Header,
  StudentList,
  TodaySchedule,
  AddStudentModal,
  EditStudentModal,
  StudentProfileModal,
  SettingsModal,
  StatsSection
} from '@/lib/AppComponents'

function LoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Loading...</p>
      </div>
    </div>
  )
}

export default function Home() {
  const [isClient, setIsClient] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  const students = useStudentStore(state => state.students)
  const isLoading = useStudentStore(state => state.isLoading)
  const fetchStudents = useStudentStore(state => state.fetchStudents)
  
  const todaysLessons = useStudentSelectors.getTodaysLessons()
  const studentsToday = todaysLessons.length
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    
    return () => clearInterval(timer)
  }, [])
  
  useEffect(() => {
    setIsClient(true)
    
    const initializeApp = async () => {
      try {
        await fetchStudents()
      } catch (error) {
        console.error('Error fetching initial data:', error)
      } finally {
        setIsInitialLoad(false)
      }
    }
    
    initializeApp()
  }, [])
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const today = days[currentTime.getDay()]
  const timeString = currentTime.toLocaleTimeString('en-MY', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kuala_Lumpur'
  })
  
  if (!isClient || isInitialLoad || isLoading) {
    return <LoadingSpinner />
  }
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            {today} - {timeString}
          </h2>
        </div>

        <Suspense fallback={<div className="animate-pulse h-24 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6" />}>
          <div className="mb-6">
            <StatsSection totalStudents={students.length} studentsToday={studentsToday} />
          </div>
        </Suspense>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Suspense fallback={<div className="animate-pulse h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />}>
              <TodaySchedule />
            </Suspense>
          </div>
          
          <div className="md:col-span-2">
            <Suspense fallback={<div className="animate-pulse h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />}>
              <StudentList />
            </Suspense>
          </div>
        </div>
      </main>
      
      <AddStudentModal />
      <EditStudentModal />
      <StudentProfileModal />
      <SettingsModal />
    </>
  )
} 
