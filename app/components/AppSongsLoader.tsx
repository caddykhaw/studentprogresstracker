'use client'

import React, { useEffect } from 'react'
import { useSongStore } from '@/app/store/useSongStore'

export default function AppSongsLoader() {
  const { fetchSongs } = useSongStore()
  
  // Load songs on mount
  useEffect(() => {
    fetchSongs()
  }, [fetchSongs])
  
  return null
} 