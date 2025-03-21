'use client';

import { useState, useEffect, useRef } from 'react';
import { useStudentStore } from '@/app/store/useStudentStore';
import { useSongStore } from '@/app/store/useSongStore';
import { Song } from '@/lib/types';

interface QuickAddSongProps {
  studentId: string;
  onSongAdded?: (song: Song) => void;
}

export default function QuickAddSong({ studentId, onSongAdded }: QuickAddSongProps) {
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [titleInputFocused, setTitleInputFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<Song[]>([]);
  
  const { songs, fetchSongs, quickAddSongWithTeaching } = useSongStore();
  const { currentStudentId } = useStudentStore();
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch songs when component mounts
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);
  
  // Handle song title input
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    setError('');
    
    // Search for matching songs when input has at least 2 characters
    if (value.length >= 2) {
      const matches = songs.filter(song => 
        song.title.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(matches.slice(0, 5)); // Limit to 5 suggestions
    } else {
      setSuggestions([]);
    }
  };
  
  // Handle URL input
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value);
    setError('');
  };
  
  // Select a song from suggestions
  const handleSelectSong = (song: Song) => {
    setTitle(song.title);
    setYoutubeUrl(song.youtubeUrl || '');
    setSuggestions([]);
    setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.blur();
      }
    }, 100);
  };
  
  // Submit song addition
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Song title is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const targetStudentId = studentId || currentStudentId;
      
      if (!targetStudentId) {
        throw new Error('No student selected');
      }
      
      const song = await quickAddSongWithTeaching(
        { 
          title: title.trim(), 
          youtubeUrl: youtubeUrl.trim() || undefined 
        },
        targetStudentId
      );
      
      if (song) {
        setTitle('');
        setYoutubeUrl('');
        setSuggestions([]);
        if (onSongAdded) {
          onSongAdded(song);
        }
      } else {
        throw new Error('Failed to add song');
      }
    } catch (err) {
      console.error('Error adding song:', err);
      setError(err instanceof Error ? err.message : 'Failed to add song');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Quick Add Song
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <label htmlFor="songTitle" className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Song Title <span className="text-red-500">*</span>
          </label>
          <input
            ref={titleInputRef}
            type="text"
            id="songTitle"
            value={title}
            onChange={handleTitleChange}
            onFocus={() => setTitleInputFocused(true)}
            onBlur={() => {
              // Delay hiding suggestions to allow clicking
              setTimeout(() => setTitleInputFocused(false), 150);
            }}
            placeholder="Enter song title"
            className="mt-1 block w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            required
          />
          
          {/* Song suggestions */}
          {titleInputFocused && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              {suggestions.map(song => (
                <li 
                  key={song.id}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                  onClick={() => handleSelectSong(song)}
                >
                  <div className="font-medium">{song.title}</div>
                  {song.artist && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      by {song.artist}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div>
          <label htmlFor="youtubeUrl" className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            YouTube URL (optional)
          </label>
          <input
            type="url"
            id="youtubeUrl"
            value={youtubeUrl}
            onChange={handleUrlChange}
            placeholder="https://www.youtube.com/watch?v=..."
            className="mt-1 block w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Song'}
          </button>
        </div>
      </form>
    </div>
  );
} 