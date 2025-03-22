'use client'

import { useUIStore } from '@/store/useUIStore'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const { openSettingsModal } = useUIStore()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="hidden font-bold sm:inline-block">
              Student Progress Tracker
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={openSettingsModal}
              className="w-9 px-0"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
} 