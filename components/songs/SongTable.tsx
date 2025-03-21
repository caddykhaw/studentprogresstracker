'use client';

import { Song } from '@/lib/types';
import { useState, useMemo } from 'react';
import Link from 'next/link';

interface SongTableProps {
  songs: Song[];
  onViewDetails: (song: Song) => void;
}

export default function SongTable({ songs, onViewDetails }: SongTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<keyof Song>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Filter songs based on search query
  const filteredSongs = useMemo(() => {
    return songs.filter(song => 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (song.artist && song.artist.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [songs, searchQuery]);
  
  // Sort songs based on sort criteria
  const sortedSongs = useMemo(() => {
    return [...filteredSongs].sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];
      
      if (valueA === valueB) return 0;
      
      // Handle undefined values
      if (valueA === undefined) return sortDirection === 'asc' ? -1 : 1;
      if (valueB === undefined) return sortDirection === 'asc' ? 1 : -1;
      
      // Sort strings
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      // Sort numbers
      return sortDirection === 'asc'
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });
  }, [filteredSongs, sortBy, sortDirection]);
  
  // Handle sorting
  const handleSort = (column: keyof Song) => {
    if (column === sortBy) {
      // Toggle direction if already sorting by this column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column and default to ascending
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  // Helper for formatting note key
  const formatKey = (keyLetter?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G', keyModifier?: '♯' | '♭', keyMode?: 'major' | 'minor') => {
    if (!keyLetter) return '-';
    const modeSuffix = keyMode === 'minor' ? 'm' : '';
    return `${keyLetter}${keyModifier || ''}${modeSuffix}`;
  };
  
  return (
    <div>
      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search songs by title or artist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
      
      {/* Song table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('title')}
              >
                Title {sortBy === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('artist')}
              >
                Artist {sortBy === 'artist' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('keyLetter')}
              >
                Key {sortBy === 'keyLetter' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('bpm')}
              >
                BPM {sortBy === 'bpm' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('frequency')}
              >
                Frequency {sortBy === 'frequency' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('lastTaught')}
              >
                Last Taught {sortBy === 'lastTaught' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedSongs.map(song => (
              <tr 
                key={song.id} 
                className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => onViewDetails(song)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {song.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {song.artist || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatKey(song.keyLetter, song.keyModifier, song.keyMode)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {song.bpm || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {song.frequency || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {song.lastTaught ? new Date(song.lastTaught).toLocaleDateString() : 'Never'}
                </td>
              </tr>
            ))}
            {sortedSongs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No songs match your search' : 'No songs available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 