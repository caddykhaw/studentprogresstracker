'use client'

import { useUIStore } from '@/store/useUIStore'
import ThemeToggle from '@/app/components/ThemeToggle'

export default function Header() {
  const setSettingsModalOpen = useUIStore(state => state.setSettingsModalOpen)
  
  return (
    <header className="bg-blue-800 dark:bg-blue-900 text-white shadow-md transition-colors duration-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Student Progress Tracker</h1>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button 
            onClick={() => setSettingsModalOpen(true)} 
            className="bg-blue-700 hover:bg-blue-900 dark:bg-blue-800 dark:hover:bg-blue-950 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Settings
          </button>
        </div>
      </div>
    </header>
  )
} 