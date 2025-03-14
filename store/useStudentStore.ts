import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface Student {
  id: string
  name: string
  instrument: string
  grade: string
  day: string
  time: string
  notes: Note[]
  contact?: string
  currentMaterial?: string
}

export interface Note {
  id: string
  content: string
  date: string
}

export interface Settings {
  instruments: string[]
}

interface StudentState {
  students: Student[]
  settings: Settings
  currentStudentId: string | null
  currentNoteIndex: number | null
  
  // Actions
  setStudents: (students: Student[]) => void
  setSettings: (settings: Settings) => void
  setCurrentStudentId: (id: string | null) => void
  setCurrentNoteIndex: (index: number | null) => void
  addStudent: (student: Student) => void
  updateStudent: (updatedStudent: Student) => void
  deleteStudent: (studentId: string) => void
  addNote: (params: { studentId: string, note: Note }) => void
  updateNote: (params: { studentId: string, noteIndex: number, text: string }) => void
  deleteNote: (params: { studentId: string, noteIndex: number }) => void
  addInstrument: (instrument: string) => void
  deleteInstrument: (instrument: string) => void
  generateStudentId: () => string
  createStudent: (params: { name: string, instrument: string, grade: string, day: string, time: string, contact?: string, currentMaterial?: string }) => Student
  exportData: () => void
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set, get) => ({
      students: [],
      settings: {
        instruments: ['Guitar', 'Drums', 'Piano', 'Violin', 'Bass']
      },
      currentStudentId: null,
      currentNoteIndex: null,
      
      setStudents: (students) => set({ students }),
      
      setSettings: (settings) => set({ settings }),
      
      setCurrentStudentId: (id) => set({ currentStudentId: id }),
      
      setCurrentNoteIndex: (index) => set({ currentNoteIndex: index }),
      
      addStudent: (student) => set((state) => ({ 
        students: [...state.students, student] 
      })),
      
      updateStudent: (updatedStudent) => set((state) => {
        const index = state.students.findIndex(s => s.id === updatedStudent.id);
        if (index === -1) return state;
        
        const newStudents = [...state.students];
        newStudents[index] = updatedStudent;
        
        return { students: newStudents };
      }),
      
      deleteStudent: (studentId) => set((state) => ({
        students: state.students.filter(s => s.id !== studentId)
      })),
      
      addNote: ({ studentId, note }) => set((state) => {
        const index = state.students.findIndex(s => s.id === studentId);
        if (index === -1) return state;
        
        const newStudents = [...state.students];
        newStudents[index] = {
          ...newStudents[index],
          notes: [...newStudents[index].notes, note]
        };
        
        return { students: newStudents };
      }),
      
      updateNote: ({ studentId, noteIndex, text }) => set((state) => {
        const studentIndex = state.students.findIndex(s => s.id === studentId);
        if (studentIndex === -1) return state;
        
        const student = state.students[studentIndex];
        if (!student.notes[noteIndex]) return state;
        
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
        if (!student.notes[noteIndex]) return state;
        
        const newNotes = student.notes.filter((_, i) => i !== noteIndex);
        
        const newStudents = [...state.students];
        newStudents[studentIndex] = {
          ...student,
          notes: newNotes
        };
        
        return { students: newStudents };
      }),
      
      addInstrument: (instrument) => set((state) => {
        if (state.settings.instruments.includes(instrument)) return state;
        
        return {
          settings: {
            ...state.settings,
            instruments: [...state.settings.instruments, instrument]
          }
        };
      }),
      
      deleteInstrument: (instrument) => set((state) => ({
        settings: {
          ...state.settings,
          instruments: state.settings.instruments.filter(i => i !== instrument)
        }
      })),
      
      generateStudentId: () => {
        return Math.random().toString(36).substring(2, 12);
      },
      
      createStudent: ({ name, instrument, grade, day, time, contact, currentMaterial }) => {
        const id = get().generateStudentId();
        const newStudent = {
          id,
          name,
          instrument,
          grade,
          day,
          time,
          notes: [],
          contact,
          currentMaterial
        };
        
        get().addStudent(newStudent);
        return newStudent;
      },
      
      exportData: () => {
        if (typeof window === 'undefined') return;
        
        try {
          const data = {
            students: get().students,
            settings: get().settings
          };
          
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `student-progress-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Failed to export data:', error);
        }
      }
    }),
    {
      name: 'student-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ students: state.students, settings: state.settings }),
    }
  )
)

// Helper functions for derived state
export const useStudentSelectors = () => {
  const store = useStudentStore();
  
  const getCurrentStudent = () => {
    const { students, currentStudentId } = store;
    return students.find(student => student.id === currentStudentId) || null;
  };
  
  const getTodaysLessons = () => {
    const { students } = store;
    if (typeof window === 'undefined') return [];
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return students
      .filter(student => student.day === today)
      .sort((a, b) => a.time.localeCompare(b.time));
  };
  
  return {
    getCurrentStudent,
    getTodaysLessons
  };
}; 