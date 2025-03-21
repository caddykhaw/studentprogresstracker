'use client'

import { useEffect } from 'react'
import { useSettingsStore } from '@/store/useSettingsStore'

export default function Providers({ children }: { children: React.ReactNode }) {
  const initializeSettings = useSettingsStore(state => state.initializeSettings)
  
  useEffect(() => {
    // Initialize settings without blocking rendering
    const init = async () => {
      try {
        await initializeSettings()
      } catch (error) {
        console.error('Failed to initialize settings:', error)
      }
    }
    
    init()
  }, [initializeSettings])
  
  // Return children directly without conditional rendering
  return <>{children}</>
} 
