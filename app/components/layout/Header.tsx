'use client';

import { useUIStore } from '@/store/useUIStore'
import { ThemeToggle } from '@/app/components/ui/ThemeToggle'
import Link from 'next/link'
import { Music2, LayoutDashboard } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { openSettingsModal } = useUIStore()
  const pathname = usePathname()
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Student Progress Tracker</h1>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`flex items-center space-x-2 transition-colors ${
                pathname === '/' 
                  ? 'text-primary font-medium' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/songs" 
              className={`flex items-center space-x-2 transition-colors ${
                pathname === '/songs'
                  ? 'text-primary font-medium'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              <Music2 className="w-5 h-5" />
              <span>Song Library</span>
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          <button
            onClick={openSettingsModal}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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