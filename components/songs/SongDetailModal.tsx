'use client';

import { useState, useEffect } from 'react';
import { Song, SongTeaching, SongUpdate, SongCreate } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import SongForm from './SongForm';

interface SongDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song;
  onUpdate: (updatedSong: SongUpdate) => Promise<void>;
  onDelete: (songId: string) => Promise<void>;
}

export default function SongDetailModal({
  isOpen,
  onClose,
  song,
  onUpdate,
  onDelete,
}: SongDetailModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [teachingHistory, setTeachingHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault(); // Prevent default browser behavior
        e.stopPropagation(); // Stop event from bubbling to other handlers
        onClose();
      }
    };
    
    // Add event listener with capture=true to ensure it runs before other handlers
    document.addEventListener('keydown', handleKeyDown, true);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onClose]);
  
  // Fetch song teaching history when modal opens
  useEffect(() => {
    const fetchTeachingHistory = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/songs/${song.id}`);
        const data = await response.json();
        
        if (data.data?.teachingHistory) {
          setTeachingHistory(data.data.teachingHistory);
        }
      } catch (error) {
        console.error('Error fetching teaching history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeachingHistory();
  }, [isOpen, song.id]);
  
  // Format YouTube URL for embedding
  const getEmbedUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    
    try {
      // Convert URL to embedded format
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1` : undefined;
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1` : undefined;
      }
    } catch (error) {
      console.error('Error parsing YouTube URL:', error);
    }
    
    return undefined;
  };
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Handle deleting the song
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this song? This cannot be undone.')) {
      await onDelete(song.id);
    }
  };
  
  // Handle updating the song - wrapper for onUpdate to convert types
  const handleUpdateSong = async (data: SongCreate) => {
    const updateData: SongUpdate = {
      ...data,
      id: song.id,
    };
    
    await onUpdate(updateData);
  };
  
  // If in edit mode, show the edit form
  if (isEditMode) {
    return (
      <SongForm
        isOpen={isOpen}
        onClose={() => setIsEditMode(false)}
        onSubmit={handleUpdateSong}
        song={song}
        priority={10}
      />
    );
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Song: ${song.title}`}
      size="2xl"
    >
      {/* Main content area - Song details and video side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Song details and teaching history */}
        <div className="space-y-6">
          {/* Song details */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Artist</h3>
                <p className="mt-1 text-base text-gray-900 dark:text-white">{song.artist || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Key</h3>
                <p className="mt-1 text-base text-gray-900 dark:text-white">
                  {song.keyLetter ? `${song.keyLetter}${song.keyModifier || ''}${song.keyMode === 'minor' ? 'm' : ''}` : '-'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">BPM</h3>
                <p className="mt-1 text-base text-gray-900 dark:text-white">{song.bpm || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Taught</h3>
                <p className="mt-1 text-base text-gray-900 dark:text-white">{formatDate(song.lastTaught)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Times Taught</h3>
                <p className="mt-1 text-base text-gray-900 dark:text-white">{song.frequency || 0}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date Added</h3>
                <p className="mt-1 text-base text-gray-900 dark:text-white">{formatDate(song.createdAt)}</p>
              </div>
            </div>
          </div>
          
          {/* Teaching history */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Teaching History</h3>
            
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading history...</p>
            ) : teachingHistory.length === 0 ? (
              <p className="text-sm text-gray-500">This song has not been taught yet.</p>
            ) : (
              <div className="border border-gray-200 dark:border-gray-700 rounded-md max-h-80 overflow-y-auto">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {teachingHistory.map((record) => (
                    <li key={record.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.student?.name || 'Unknown Student'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(record.taughtDate)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - YouTube embed */}
        <div>
          {song.youtubeUrl && getEmbedUrl(song.youtubeUrl) ? (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Reference Video</h3>
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                <iframe 
                  src={getEmbedUrl(song.youtubeUrl)} 
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full rounded-md"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.stopPropagation();
                      onClose();
                    }
                  }}
                ></iframe>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">No video available</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={handleDelete}
          className="px-4 py-2 border border-red-300 dark:border-red-700 rounded-md shadow-sm text-sm font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={() => setIsEditMode(true)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
