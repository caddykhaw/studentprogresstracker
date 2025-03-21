import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Student, Note } from '@/lib/types'

interface StudentState {
  students: Student[]
  currentStudentId: string | null
  currentNoteIndex: number | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchStudents: () => Promise<void>
  setStudents: (students: Student[]) => void
  setCurrentStudentId: (id: string | null) => void
  setCurrentNoteIndex: (index: number | null) => void
  addStudent: (student: Student) => Promise<any>
  updateStudent: (updatedStudent: Student) => Promise<any>
  deleteStudent: (studentId: string) => Promise<any>
  addNote: (params: { studentId: string, note: Note }) => void
  updateNote: (params: { studentId: string, noteIndex: number, text: string }) => void
  deleteNote: (params: { studentId: string, noteIndex: number }) => void
  generateStudentId: () => string
  createStudent: (params: { name: string, instrument: string, grade: string, day: string, time: string, contact?: string, currentMaterial?: string }) => Student
  exportData: () => void
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set, get) => ({
      students: [],
      currentStudentId: null,
      currentNoteIndex: null,
      isLoading: false,
      error: null,
      
      fetchStudents: async () => {
        console.log('🔄 Fetching students from API...')
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch('/api/students', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store'
          })
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => null)
            throw new Error(
              errorData?.details || 
              `Failed to fetch students: ${response.status} ${response.statusText}`
            )
          }
          
          const students = await response.json()
          
          if (!Array.isArray(students)) {
            throw new Error('Invalid response format: expected an array of students')
          }
          
          console.log('✅ Successfully fetched students:', students.length)
          set({ students, isLoading: false })
        } catch (error) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Network error while fetching students'
          console.error('❌ Error fetching students:', errorMessage)
          set({
            error: errorMessage,
            isLoading: false
          })
        }
      },
      
      setStudents: (students) => {
        console.log('📚 Setting students in store:', students.length)
        set({ students })
      },
      
      setCurrentStudentId: (id) => set({ currentStudentId: id }),
      
      setCurrentNoteIndex: (index) => set({ currentNoteIndex: index }),
      
      addStudent: (student) => {
        console.log('➕ Adding student to store:', student.name)
        
        // Update local state immediately for responsiveness
        set((state) => ({
          students: [...state.students, student]
        }))
        
        // Persist to database
        return fetch('/api/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(student),
        })
        .then(response => {
          if (!response.ok) {
            console.error(`❌ Failed to add student to database: ${response.status} ${response.statusText}`)
            // Throw error to be caught by the component
            throw new Error(`Failed to add student to database: ${response.statusText}`)
          } else {
            console.log('✅ Student added to database')
            return response.json()
          }
        })
        .catch(err => {
          console.error('❌ Error adding student to database:', err)
          throw err // Re-throw to be caught by the component
        })
      },
      
      updateStudent: (updatedStudent) => {
        console.log('✏️ Updating student in store:', updatedStudent.name)
        
        // Update local state immediately for responsiveness
        set((state) => ({
          students: state.students.map((student) =>
            student.id === updatedStudent.id ? updatedStudent : student
          )
        }))
        
        // Persist to database
        return fetch(`/api/students/${updatedStudent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedStudent),
        })
        .then(response => {
          if (!response.ok) {
            console.error(`❌ Failed to update student in database: ${response.status} ${response.statusText}`)
            throw new Error(`Failed to update student: ${response.statusText}`)
          } else {
            console.log('✅ Student updated in database')
            return response.json()
          }
        })
        .catch(err => {
          console.error('❌ Error updating student in database:', err)
          throw err
        })
      },
      
      deleteStudent: (studentId) => {
        console.log('🗑️ Deleting student from store:', studentId)
        
        // Update local state immediately for responsiveness
        set((state) => ({
          students: state.students.filter((student) => student.id !== studentId)
        }))
        
        // Persist deletion to database
        return fetch(`/api/students/${studentId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        .then(response => {
          if (!response.ok) {
            console.error(`❌ Failed to delete student from database: ${response.status} ${response.statusText}`)
            throw new Error(`Failed to delete student: ${response.statusText}`)
          } else {
            console.log('✅ Student deleted from database')
            return response.json()
          }
        })
        .catch(err => {
          console.error('❌ Error deleting student from database:', err)
          throw err
        })
      },
      
      addNote: ({ studentId, note }) => set((state) => {
        const index = state.students.findIndex(s => s.id === studentId);
        if (index === -1) return state;
        
        const newStudents = [...state.students];
        newStudents[index] = {
          ...newStudents[index],
          notes: [...(newStudents[index].notes || []), note]
        };
        
        return { students: newStudents };
      }),
      
      updateNote: ({ studentId, noteIndex, text }) => set((state) => {
        const studentIndex = state.students.findIndex(s => s.id === studentId);
        if (studentIndex === -1) return state;
        
        const student = state.students[studentIndex];
        if (!student.notes || !student.notes[noteIndex]) return state;
        
        const newNotes = [...student.notes];
        newNotes[noteIndex] = { ...newNotes[noteIndex], content: text };
        
        const newStudents = [...state.students];
        newStudents[studentIndex] = {
          ...student,
          notes: newNotes
        };
        
        return { students: newStudents };
      }),
      
      deleteNote: ({ studentId, noteIndex }) => set((state) => {
        const studentIndex = state.students.findIndex(s => s.id === studentId);
        if (studentIndex === -1) return state;
        
        const student = state.students[studentIndex];
        if (!student.notes || !student.notes[noteIndex]) return state;
        
        const newNotes = student.notes.filter((_, i) => i !== noteIndex);
        
        const newStudents = [...state.students];
        newStudents[studentIndex] = {
          ...student,
          notes: newNotes
        };
        
        return { students: newStudents };
      }),
      
      generateStudentId: () => {
        const state = get();
        
        // Use a combination of timestamp, random string, and counter for uniqueness
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 10);
        const counter = state.students.length.toString(36);
        
        // Combine all parts to create a unique ID
        return `${timestamp}-${randomStr}-${counter}`;
      },
      
      createStudent: ({ name, instrument, grade, day, time, contact, currentMaterial }) => {
        return {
          id: get().generateStudentId(),
          name,
          instrument,
          grade,
          day,
          time,
          notes: [],
          contact,
          currentMaterial,
          attendance: 'Present', // Default value
          lastActive: 'Today',   // Default value
          createdAt: new Date(),
          updatedAt: new Date()
        };
      },
      
      exportData: () => {
        const state = get();
        const dataStr = JSON.stringify(state.students, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        
        const exportFileDefaultName = `student-progress-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      }
    }),
    {
      name: 'student-storage',
    }
  )
)

// Selectors
export const useStudentSelectors = {
  getTodaysLessons: () => {
    const students = useStudentStore.getState().students;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return students.filter(student => student.day === today);
  }
} 