'use client'

import { useUIStore } from '@/store/useUIStore'

export default function Header() {
  const setSettingsModalOpen = useUIStore(state => state.setSettingsModalOpen)
  
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Progress Tracker</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setSettingsModalOpen(true)} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Settings
          </button>
        </div>
      </div>
    </header>
  )
} 