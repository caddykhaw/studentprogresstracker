'use client';

import { useState, useEffect, useCallback } from 'react';
import { Song } from '@/lib/types';
import SongTable from './SongTable';
import SongDetailModal from './SongDetailModal';
import SongForm from './SongForm';
import { useRouter } from 'next/navigation';

// Tailwind utility class for buttons
const buttonClass = "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";

interface SongLibraryProps {
  initialSongs: Song[];
}

export default function SongLibrary({ initialSongs }: SongLibraryProps) {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch songs (can be used for refresh)
  const fetchSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/songs');
      const data = await response.json();
      
      if (data.data) {
        setSongs(data.data);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle song creation
  const handleAddSong = async (songData: Omit<Song, 'id' | 'frequency' | 'createdAt' | 'lastTaught'>) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(songData),
      });

      const result = await response.json();
      
      if (result.data) {
        // Add new song to the list
        setSongs(prevSongs => [...prevSongs, result.data]);
        setIsAddModalOpen(false);
        router.refresh(); // Refresh the page to update server data
      }
    } catch (error) {
      console.error('Error adding song:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle song update
  const handleUpdateSong = async (updatedSong: Partial<Song> & { id: string }) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/songs/${updatedSong.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSong),
      });

      const result = await response.json();
      
      if (result.data) {
        // Update song in the list
        setSongs(prevSongs => 
          prevSongs.map(song => 
            song.id === updatedSong.id ? { ...song, ...updatedSong } : song
          )
        );
        setIsDetailModalOpen(false);
        router.refresh(); // Refresh the page to update server data
      }
    } catch (error) {
      console.error('Error updating song:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle song deletion
  const handleDeleteSong = async (songId: string) => {
    if (!confirm('Are you sure you want to delete this song?')) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/songs/${songId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.data) {
        // Remove song from the list
        setSongs(prevSongs => prevSongs.filter(song => song.id !== songId));
        setIsDetailModalOpen(false);
        router.refresh(); // Refresh the page to update server data
      }
    } catch (error) {
      console.error('Error deleting song:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle viewing song details
  const handleViewSongDetails = (song: Song) => {
    setSelectedSong(song);
    setIsDetailModalOpen(true);
  };

  return (
    <div>
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Songs ({songs.length})</h2>
          {isLoading && <span className="text-sm text-gray-500">Loading...</span>}
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className={buttonClass}
        >
          Add New Song
        </button>
      </div>

      {/* Song table */}
      <SongTable
        songs={songs}
        onViewDetails={handleViewSongDetails}
      />

      {/* Add song modal */}
      {isAddModalOpen && (
        <SongForm
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddSong}
          priority={5}
        />
      )}

      {/* Song detail modal */}
      {selectedSong && isDetailModalOpen && (
        <SongDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          song={selectedSong}
          onUpdate={handleUpdateSong}
          onDelete={handleDeleteSong}
        />
      )}
    </div>
  );
} 