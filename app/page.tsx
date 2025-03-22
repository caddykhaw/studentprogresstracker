'use client'

import { useEffect, useRef } from 'react'
import { useStudentStore, studentSelectors } from '@/app/store/useStudentStore'
import { useUIStore } from '@/app/store/useUIStore'
import { 
  StudentList, 
  TodaySchedule, 
  AddStudentModal, 
  EditStudentModal, 
  StudentProfileModal, 
  SettingsModal,
  StatsSection 
} from './lib/AppComponents'

export default function Home() {
  const initializationAttempted = useRef(false)
  
  // Get store state and actions
  const initialize = useStudentStore(state => state.initialize)
  const initialized = useStudentStore(state => state.initialized)
  const loading = useStudentStore(state => state.loading)
  const error = useStudentStore(state => state.error)
  
  // Get data from selectors
  const students = studentSelectors.useStudents()
  const todaysLessons = studentSelectors.useTodaysLessons()
  
  // Initialize data on mount
  useEffect(() => {
    if (!initializationAttempted.current) {
      initializationAttempted.current = true
      initialize().catch(console.error)
    }
  }, [initialize])
  
  if (!initialized && (loading.students || loading.instruments)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-error">
          <p className="text-lg">Error loading data: {error}</p>
          <button 
            onClick={() => initialize()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-2">
        <section className="md:col-span-2">
          <StatsSection />
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">
            Today's Schedule ({todaysLessons.length} students)
          </h2>
          <TodaySchedule />
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">Students</h2>
          <StudentList />
        </section>
      </div>
      
      <AddStudentModal />
      <EditStudentModal />
      <StudentProfileModal />
      <SettingsModal />
    </main>
  )
} 