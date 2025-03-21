'use client'

import React, { useState, useEffect } from 'react'
import { useStudentStore } from '@/store/useStudentStore'
import { Note } from '@/lib/types'

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

export default function StudentNotes({ studentId }: StudentNotesProps) {
  const [newNote, setNewNote] = useState('')
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null)
  const [editNoteContent, setEditNoteContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
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
  const fetchNotes = useStudentStore(state => state.fetchNotes)
  
  // Manually fetch notes when component mounts
  useEffect(() => {
    const loadNotes = async () => {
      if (!studentId) return;
      
      setIsLoading(true);
      try {
        await fetchNotes(studentId);
        console.log('Notes fetched for student:', studentId);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNotes();
  }, [studentId, fetchNotes]);
  
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

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return
    
    // Format date as DD/MM/YYYY to match existing data format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    
    const note: Note = {
      id: crypto.randomUUID(),
      content: newNote.trim(),
      date: formattedDate
    }
    
    addNote({ studentId, note })
    setNewNote('')
  }
  
  const handleUpdateNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingNoteIndex === null || !editNoteContent.trim()) return
    
    updateNote({
      studentId,
      noteIndex: editingNoteIndex,
      text: editNoteContent.trim()
    })
    
    setEditingNoteIndex(null)
    setEditNoteContent('')
  }
  
  const handleDeleteNote = (noteIndex: number) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote({ studentId, noteIndex })
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
  
  return (
    <div className="space-y-4">
      {/* Add form */}
      <form onSubmit={handleAddNote} className="space-y-2">
        <textarea 
          value={newNote} 
          onChange={(e) => setNewNote(e.target.value)} 
          placeholder="Add a new note..."
          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg resize-y min-h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          required
        />
        <div className="flex justify-end">
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Add Note
          </button>
        </div>
      </form>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <svg className="animate-spin h-5 w-5 mr-3 inline" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading notes...
        </div>
      )}
      
      {/* Notes table */}
      {!isLoading && student?.notes && student.notes.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-md">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Content
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
                  return editingNoteIndex === actualIndex ? (
                    <tr key={note.id} className="bg-blue-50 dark:bg-blue-900">
                      <td colSpan={4} className="px-4 py-4">
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
        !isLoading && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
            No notes found for this student. Add your first note above.
          </div>
        )
      )}
    </div>
  )
} 
