'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useStudentStore } from '@/store/useStudentStore'
import { useSongStore } from '@/app/store/useSongStore'
import { Note, Song } from '@/lib/types'

// Component to render note content with proper line breaks
const NoteContent = ({ content }: { content: string }) => {
  // If content is empty, we don't render anything
  if (!content) {
    return <div className="text-gray-400">(No content)</div>;
  }
  
  return (
    <div className="whitespace-pre-line break-words text-sm text-gray-800 dark:text-gray-200">
      {content}
    </div>
  );
};

interface StudentNotesProps {
  studentId: string
}

// YouTube video ID extractor helper
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

// Component for embedded YouTube video thumbnails
const YouTubeThumbnail = ({ url, onClick }: { url: string, onClick: () => void }) => {
  const videoId = getYouTubeVideoId(url);
  
  if (!videoId) return null;
  
  return (
    <div 
      className="relative cursor-pointer group rounded-md overflow-hidden"
      onClick={onClick}
    >
      <img 
        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
        alt="YouTube thumbnail" 
        className="w-full h-auto rounded-md transition-transform group-hover:scale-105"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Video popup component
const VideoPopup = ({ 
  url, 
  isOpen, 
  onClose, 
  onNext,
  onPrevious, 
  hasNext,
  hasPrevious
}: { 
  url: string, 
  isOpen: boolean, 
  onClose: () => void,
  onNext?: () => void,
  onPrevious?: () => void,
  hasNext?: boolean,
  hasPrevious?: boolean 
}) => {
  const videoId = getYouTubeVideoId(url);
  
  // Add ESC key handler for the video popup
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };
    
    // Add with capture=true to ensure it runs before other handlers
    document.addEventListener('keydown', handleEscapeKey, true);
    
    // Clean up
    return () => {
      document.removeEventListener('keydown', handleEscapeKey, true);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen || !videoId) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative w-full max-w-4xl p-2" onClick={e => e.stopPropagation()}>
        <div className="flex justify-end absolute -top-10 right-0 space-x-4">
          {hasPrevious && onPrevious && (
            <button 
              className="text-white hover:text-gray-300"
              onClick={onPrevious}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {hasNext && onNext && (
            <button 
              className="text-white hover:text-gray-300"
              onClick={onNext}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          
          <button 
            className="text-white hover:text-gray-300"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
          <iframe 
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default function StudentNotes({ studentId }: StudentNotesProps) {
  const [newNote, setNewNote] = useState('')
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null)
  const [editNoteContent, setEditNoteContent] = useState('')
  const [songInputs, setSongInputs] = useState<{title: string, youtubeUrl: string}[]>([{ title: '', youtubeUrl: '' }])
  const [titleInputFocused, setTitleInputFocused] = useState<number | null>(null)
  const [suggestions, setSuggestions] = useState<{ index: number, songs: Song[] }>({ index: -1, songs: [] })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [currentVideoUrls, setCurrentVideoUrls] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  
  // Get required functions from stores
  const { songs, fetchSongs, quickAddSongWithTeaching } = useSongStore();
  
  // Fetch songs when component mounts
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);
  
  // Handle song title input
  const handleTitleChange = (index: number, value: string) => {
    const newInputs = [...songInputs];
    newInputs[index].title = value;
    
    // If the title looks like a YouTube URL, try to extract and place in URL field
    if (value.includes('youtube.com/watch') || value.includes('youtu.be/')) {
      const videoId = getYouTubeVideoId(value);
      if (videoId) {
        // Keep the original URL in the title field for now
        // But also put it in the URL field
        newInputs[index].youtubeUrl = value;
      }
    }
    
    setSongInputs(newInputs);
    
    // Search for matching songs when input has at least 2 characters
    if (value.length >= 2) {
      const matches = songs.filter(song => 
        song.title.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions({ index, songs: matches.slice(0, 5) }); // Limit to 5 suggestions
    } else {
      setSuggestions({ index: -1, songs: [] });
    }
  };
  
  // Handle URL input
  const handleUrlChange = (index: number, value: string) => {
    const newInputs = [...songInputs];
    newInputs[index].youtubeUrl = value;
    setSongInputs(newInputs);
  };
  
  // Add a new song input field
  const addSongInput = () => {
    setSongInputs([...songInputs, { title: '', youtubeUrl: '' }]);
  };
  
  // Remove a song input field
  const removeSongInput = (index: number) => {
    if (songInputs.length > 1) {
      const newInputs = songInputs.filter((_, i) => i !== index);
      setSongInputs(newInputs);
    } else {
      // If it's the last input, just clear it
      setSongInputs([{ title: '', youtubeUrl: '' }]);
    }
  };
  
  // Select a song from suggestions
  const handleSelectSong = (index: number, song: Song) => {
    const newInputs = [...songInputs];
    newInputs[index] = {
      title: song.title,
      youtubeUrl: song.youtubeUrl || ''
    };
    setSongInputs(newInputs);
    setSuggestions({ index: -1, songs: [] });
  };
  
  // Add ESC key handler to cancel editing
  useEffect(() => {
    // Only add the listener when actually editing a note
    if (editingNoteIndex === null) return;
    
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Cancel the edit operation, just like the Cancel button
        setEditingNoteIndex(null);
        setEditNoteContent('');
        event.stopPropagation(); // Prevent ESC from bubbling to parent modals
      }
    };
    
    // Add event listener
    document.addEventListener('keydown', handleEscapeKey);
    
    // Clean up
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [editingNoteIndex]);
  
  // Get student and note management functions from store
  const student = useStudentStore(state => 
    state.students.find(s => s.id === studentId)
  )
  const addNote = useStudentStore(state => state.addNote)
  const updateNote = useStudentStore(state => state.updateNote)
  const deleteNote = useStudentStore(state => state.deleteNote)
  
  // Check for invalid date formats and normalize them
  useEffect(() => {
    if (!student || !student.notes || student.notes.length === 0) return;
    
    // Log the notes for debugging
    console.log('Notes before normalization:', student.notes);
    
    let hasUpdates = false;
    
    // Clone the notes array to avoid direct mutation
    const updatedNotes = [...student.notes].map(note => {
      let noteHasUpdates = false;
      const updatedNote = { ...note };
      
      // Check if we need to convert from old note format with 'text' to 'content'
      if ((note as any).text && !note.content) {
        updatedNote.content = (note as any).text;
        noteHasUpdates = true;
        hasUpdates = true;
      }
      
      // Skip notes that already have the correct date format
      if (note.date && note.date.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        return noteHasUpdates ? updatedNote : note;
      }
      
      hasUpdates = true;
      noteHasUpdates = true;
      
      try {
        // Try to parse and reformat the date
        const date = new Date(note.date);
        if (!isNaN(date.getTime())) {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          updatedNote.date = `${day}/${month}/${year}`;
          return updatedNote;
        }
      } catch (e) {
        console.error('Error normalizing date format:', e);
      }
      
      // If we couldn't parse the date, use today's date
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      
      updatedNote.date = `${day}/${month}/${year}`;
      return updatedNote;
    });
    
    // Only update if we actually changed something
    if (hasUpdates) {
      // For each note that needs updating, call updateNote
      updatedNotes.forEach((note, index) => {
        // Only update notes that have changed
        if (
          note.date !== student.notes[index].date || 
          note.content !== student.notes[index].content
        ) {
          // We need to update the note
          const noteWithUpdates = {
            ...student.notes[index],
            date: note.date,
            content: note.content
          };
          
          // Replace the note in the store
          updateNote({
            studentId,
            noteIndex: index,
            text: noteWithUpdates.content
          });
          
          // Note: The date is normalized but not explicitly stored separately.
          // The note display uses our formatDate function to show dates in DD/MM/YYYY format.
          // If the store structure changes to support separate date updates, this code should be revised.
        }
      });
    }
  }, [student, studentId, updateNote]);
  
  // If no student found, don't render anything
  if (!student) return null

  // Initialize notes array if it doesn't exist
  if (!student.notes) {
    const updatedStudent = {
      ...student,
      notes: []
    };
    useStudentStore.getState().updateStudent(updatedStudent);
    return null;
  }

  // Helper to extract YouTube URLs from note content
  const extractYouTubeUrls = (content: string): string[] => {
    if (!content) return [];
    
    const urlRegex = /(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
    const matches = content.match(urlRegex);
    
    return matches || [];
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSubmitting(true)
    
    try {
      // Format date as DD/MM/YYYY to match existing data format
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      
      // Create note content, optionally including info about added songs
      let finalNoteContent = newNote.trim();
      
      // Add any songs with titles
      const addedSongs: Song[] = [];
      
      for (const songInput of songInputs) {
        // Skip empty song inputs
        if (!songInput.title.trim()) continue;
        
        try {
          const song = await quickAddSongWithTeaching(
            { 
              title: songInput.title.trim(), 
              youtubeUrl: songInput.youtubeUrl.trim() || undefined 
            },
            studentId
          );
          
          if (song) {
            addedSongs.push(song);
          }
        } catch (err) {
          console.error('Error adding song:', err);
          // Continue with other songs even if one fails
        }
      }
      
      // Add song information to the note if any songs were added
      if (addedSongs.length > 0) {
        const songsList = addedSongs.map(song => 
          `- ${song.title}${song.artist ? ` by ${song.artist}` : ''}${song.youtubeUrl ? ` (${song.youtubeUrl})` : ''}`
        ).join('\n');
        
        const songAddition = `\n\nAdded songs:\n${songsList}`;
        
        if (finalNoteContent) {
          finalNoteContent += songAddition;
        } else {
          finalNoteContent = `Added new songs: ${addedSongs.length}${songAddition}`;
        }
      }
      
      // Only add a note if there's content or songs were added
      if (finalNoteContent) {
        const note: Note = {
          id: crypto.randomUUID(),
          content: finalNoteContent,
          date: formattedDate
        }
        
        await addNote({ studentId, note })
        console.log('Note added successfully with API call')
      }
      
      // Reset state
      setNewNote('')
      setSongInputs([{ title: '', youtubeUrl: '' }])
    } catch (err) {
      console.error('Error handling note and songs:', err);
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingNoteIndex === null || !editNoteContent.trim()) return
    
    try {
      await updateNote({
        studentId,
        noteIndex: editingNoteIndex,
        text: editNoteContent.trim()
      })
      console.log('Note updated successfully with API call')
      
      setEditingNoteIndex(null)
      setEditNoteContent('')
    } catch (err) {
      console.error('Error updating note:', err)
    }
  }
  
  const handleDeleteNote = async (noteIndex: number) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote({ studentId, noteIndex })
        console.log('Note deleted successfully with API call')
      } catch (err) {
        console.error('Error deleting note:', err)
      }
    }
  }
  
  const startEditingNote = (noteIndex: number) => {
    if (student.notes[noteIndex]) {
      setEditingNoteIndex(noteIndex)
      setEditNoteContent(student.notes[noteIndex].content)
    }
  }
  
  // Updated parseDate function to handle DD/MM/YYYY format
  const parseDate = (dateString: string): Date => {
    try {
      // Check if date is in DD/MM/YYYY format
      if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const [day, month, year] = dateString.split('/').map(Number);
        return new Date(year, month - 1, day);
      }
      
      // Otherwise try standard parsing (ISO format)
      return new Date(dateString);
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date(0); // Return epoch date as fallback
    }
  }
  
  const formatDate = (dateString: string) => {
    try {
      // If the date is already in DD/MM/YYYY format, return it as is
      if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        return dateString;
      }
      
      // Make sure we have a valid date string
      if (!dateString) return 'No date';
      
      // For other formats, parse and format to match DD/MM/YYYY
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return 'Invalid date format';
      }
      
      // Format the date as DD/MM/YYYY
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  }
  
  // Function to open video popup with navigation context
  const openVideoPopup = (url: string, allUrls: string[]) => {
    setSelectedVideo(url);
    setCurrentVideoUrls(allUrls);
    setCurrentVideoIndex(allUrls.indexOf(url));
  };
  
  // Navigate to next video
  const handleNextVideo = () => {
    if (currentVideoIndex < currentVideoUrls.length - 1) {
      const nextIndex = currentVideoIndex + 1;
      setCurrentVideoIndex(nextIndex);
      setSelectedVideo(currentVideoUrls[nextIndex]);
    }
  };
  
  // Navigate to previous video
  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      const prevIndex = currentVideoIndex - 1;
      setCurrentVideoIndex(prevIndex);
      setSelectedVideo(currentVideoUrls[prevIndex]);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Add note form with integrated song inputs */}
      <form onSubmit={handleAddNote} className="space-y-4">
        <div>
          <label htmlFor="newNote" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Add Note
          </label>
          <textarea 
            id="newNote"
            value={newNote} 
            onChange={(e) => setNewNote(e.target.value)} 
            placeholder="Add a new note... (optional)"
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg resize-y min-h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Add Songs (optional)
            </h3>
            <button 
              type="button" 
              onClick={addSongInput}
              className="h-6 w-6 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <span className="text-lg">+</span>
            </button>
          </div>
          
          {songInputs.map((input, index) => (
            <div key={index} className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input.title}
                    onChange={(e) => handleTitleChange(index, e.target.value)}
                    onFocus={() => setTitleInputFocused(index)}
                    onBlur={() => {
                      // Delay hiding suggestions to allow clicking
                      setTimeout(() => setTitleInputFocused(null), 150);
                    }}
                    placeholder="Song title"
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  
                  {/* Song suggestions */}
                  {titleInputFocused === index && suggestions.index === index && suggestions.songs.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                      {suggestions.songs.map(song => (
                        <li 
                          key={song.id}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                          onClick={() => handleSelectSong(index, song)}
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
                
                <div className="flex-1">
                  <input
                    type="url"
                    value={input.youtubeUrl}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    placeholder="YouTube URL (optional)"
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <button 
                  type="button" 
                  onClick={() => removeSongInput(index)}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white self-center"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Note & Songs'}
          </button>
        </div>
      </form>
      
      {/* Video popup */}
      <VideoPopup 
        url={selectedVideo || ''} 
        isOpen={!!selectedVideo} 
        onClose={() => {
          setSelectedVideo(null);
          setCurrentVideoUrls([]);
          setCurrentVideoIndex(0);
        }}
        onNext={handleNextVideo}
        onPrevious={handlePreviousVideo}
        hasNext={currentVideoIndex < currentVideoUrls.length - 1}
        hasPrevious={currentVideoIndex > 0}
      />
      
      {/* Notes table */}
      {student?.notes && student.notes.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-md">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Content
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">
                  Video
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                  Edit
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[...student.notes]
                .sort((a, b) => {
                  // Sort by date descending (newest first)
                  try {
                    const dateA = parseDate(a.date || ''); // Use our custom parseDate
                    const dateB = parseDate(b.date || ''); // Use our custom parseDate
                    return dateB.getTime() - dateA.getTime();
                  } catch (e) {
                    return 0; // Keep order unchanged if dates are invalid
                  }
                })
                .map((note, index) => {
                  const actualIndex = student.notes.findIndex(n => n.id === note.id);
                  const youtubeUrls = extractYouTubeUrls(note.content || '');
                  
                  return editingNoteIndex === actualIndex ? (
                    <tr key={note.id} className="bg-blue-50 dark:bg-blue-900">
                      <td colSpan={5} className="px-4 py-4">
                        <form onSubmit={handleUpdateNote} className="space-y-2">
                          <textarea
                            value={editNoteContent}
                            onChange={(e) => setEditNoteContent(e.target.value)}
                            className="w-full p-3 border rounded-lg resize-y min-h-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <div className="flex space-x-2">
                            <button
                              type="submit"
                              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingNoteIndex(null)}
                              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={note.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4 text-sm font-medium text-gray-500 dark:text-gray-300 align-top">
                        {formatDate(note.date)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-200">
                        <NoteContent content={note.content || (note as any).text} />
                      </td>
                      <td className="px-4 py-4 text-center">
                        {youtubeUrls.length > 0 ? (
                          <div className="flex flex-col space-y-2">
                            {youtubeUrls.length === 1 ? (
                              <YouTubeThumbnail 
                                key={0} 
                                url={youtubeUrls[0]} 
                                onClick={() => openVideoPopup(youtubeUrls[0], youtubeUrls)}
                              />
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                {youtubeUrls.slice(0, 4).map((url, i) => (
                                  <YouTubeThumbnail 
                                    key={i} 
                                    url={url} 
                                    onClick={() => openVideoPopup(url, youtubeUrls)}
                                  />
                                ))}
                              </div>
                            )}
                            {youtubeUrls.length > 4 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{youtubeUrls.length - 4} more videos
                              </div>
                            )}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => startEditingNote(actualIndex)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
                          aria-label="Edit note"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleDeleteNote(actualIndex)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
                          aria-label="Delete note"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
          No notes found for this student. Add your first note above.
        </div>
      )}
    </div>
  )
} 
