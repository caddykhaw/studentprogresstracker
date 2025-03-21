'use client'

import { useEffect, useState } from 'react'
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
} from './lib/AppComponents'

export default function Home() {
  // Client-side only rendering
  const [isClient, setIsClient] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Get students data and fetch function
  const students = useStudentStore(state => state.students)
  const isLoading = useStudentStore(state => state.isLoading)
  const fetchStudents = useStudentStore(state => state.fetchStudents)
  const fetchInstruments = useStudentStore(state => state.fetchInstruments)
  
  // Calculate students today based on your data model
  const todaysLessons = useStudentSelectors().getTodaysLessons()
  const studentsToday = todaysLessons.length
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute
    
    return () => clearInterval(timer)
  }, [])
  
  useEffect(() => {
    console.log('🔄 Initializing application...')
    setIsClient(true)
    
    const initializeApp = async () => {
      try {
        // Fetch initial data
        console.log('📚 Fetching initial student data...')
        await fetchStudents()
        
        // Fetch instruments data from API
        console.log('🎸 Fetching instruments data...')
        await fetchInstruments()
        
        console.log('✅ Initial data fetch complete')
      } catch (error) {
        console.error('❌ Error fetching initial data:', error)
      } finally {
        setIsInitialLoad(false)
      }
    }
    
    initializeApp()
  }, []) // Remove fetchStudents from dependencies
  
  // Display current day and time
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const today = days[currentTime.getDay()]
  const timeString = currentTime.toLocaleTimeString('en-MY', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kuala_Lumpur'
  })
  
  if (!isClient || isInitialLoad) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading application...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading students...</p>
        </div>
      </div>
    )
  }
  
  return (
    <>
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Current Day Display */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            {today} - {timeString}
          </h2>
        </div>

        {/* Stats Section above everything else */}
        <div className="mb-6">
          <StatsSection totalStudents={students.length} studentsToday={studentsToday} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: Today's Lessons */}
          <div className="md:col-span-1">
            <TodaySchedule />
          </div>
          
          {/* Right column: Student List */}
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