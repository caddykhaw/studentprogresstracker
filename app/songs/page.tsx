'use client';

import { useRef } from 'react';
import { useSongStore } from '@/store/useSongStore';
import { useUIStore } from '@/store/useUIStore';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import SongModal from '@/app/features/songs/modals/SongModal';
import SongDetailModal from '@/app/features/songs/modals/SongDetailModal';
import SongsTable from '@/app/features/songs/components/SongsTable';
import { SettingsModal } from '@/app/lib/AppComponents';

export default function SongsPage() {
  // Only reference store state, don't cause fetches here
  const { isLoading, error, songs } = useSongStore(state => ({
    isLoading: state.isLoading,
    error: state.error,
    songs: state.songs
  }));
  const { openSongModal } = useUIStore();

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Songs</h1>
        <Button onClick={openSongModal} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Song
        </Button>
      </div>

      {isLoading && songs.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      ) : (
        <SongsTable />
      )}

      <SongModal />
      <SongDetailModal />
      <SettingsModal />
    </div>
  );
} 