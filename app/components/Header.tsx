'use client'

import { useState } from 'react'
import { useUIStore } from '@/store/useUIStore'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const openAddStudentModal = useUIStore(state => state.openAddStudentModal)
  const openSettingsModal = useUIStore(state => state.openSettingsModal)
  
  return (
    <header className="bg-blue-800 dark:bg-blue-900 text-white shadow-md transition-colors duration-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Student Progress Tracker</h1>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          <button
            onClick={openAddStudentModal}
            className="inline-flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-900 dark:bg-blue-800 dark:hover:bg-blue-950 rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Student
          </button>
          
          <button
            onClick={openSettingsModal}
            className="p-2 text-white hover:text-blue-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
} 
