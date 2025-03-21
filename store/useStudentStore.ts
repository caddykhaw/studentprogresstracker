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
  isLoading: boolean  // Add loading state
  instrumentsLoading: boolean  // Add loading state for instruments
  
  // Actions
  fetchStudents: () => Promise<void>
  fetchInstruments: () => Promise<void>  // Add new function
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
        instruments: []  // Initialize as empty array instead of hardcoded values
      },
      currentStudentId: null,
      currentNoteIndex: null,
      isLoading: false,
      instrumentsLoading: false,  // Initialize instruments loading state
      
      // Fetch instruments from API
      fetchInstruments: async () => {
        try {
          set({ instrumentsLoading: true });
          console.log('🎸 Fetching instruments from API...');
          
          const response = await fetch('/api/instruments');
          if (!response.ok) {
            throw new Error('Failed to fetch instruments');
          }
          const instruments = await response.json();
          console.log('📥 Received instruments from API:', instruments);
          
          if (!Array.isArray(instruments)) {
            console.error('❌ API returned invalid data format:', instruments);
            set({ instrumentsLoading: false });
            return;
          }
          
          set(state => ({
            settings: {
              ...state.settings,
              instruments
            },
            instrumentsLoading: false
          }));
        } catch (error) {
          console.error('❌ Error fetching instruments:', error);
          set({ instrumentsLoading: false });
          throw error;
        }
      },
      
      // Fetch students from API
      fetchStudents: async () => {
        try {
          set({ isLoading: true });
          console.log('🔄 Fetching students from API...');
          
          const response = await fetch('/api/students');
          if (!response.ok) {
            throw new Error('Failed to fetch students');
          }
          const students = await response.json();
          console.log('📥 Received students from API:', students);
          
          if (!Array.isArray(students)) {
            console.error('❌ API returned invalid data format:', students);
            set({ isLoading: false });
            return;
          }
          
          set({ students, isLoading: false });
        } catch (error) {
          console.error('❌ Error fetching students:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      setStudents: (students) => {
        console.log('✏️ Setting students:', students);
        set({ students });
      },
      
      setSettings: (settings) => set({ settings }),
      
      setCurrentStudentId: (id) => set({ currentStudentId: id }),
      
      setCurrentNoteIndex: (index) => set({ currentNoteIndex: index }),
      
      addStudent: (student) => {
        console.log('➕ Adding new student:', student);
        set((state) => ({ 
          students: [...state.students, student] 
        }));
      },
      
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
      
      addInstrument: (instrument) => {
        const state = get();
        if (state.settings.instruments.includes(instrument)) return;
        
        // Update local state immediately for responsive UI
        set((state) => ({
          settings: {
            ...state.settings,
            instruments: [...state.settings.instruments, instrument]
          }
        }));
        
        // Then sync with API (fire and forget)
        fetch('/api/instruments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ instrument }),
        }).catch(error => {
          console.error('❌ Error adding instrument to API:', error);
          // Revert the state change if API call fails
          set((state) => ({
            settings: {
              ...state.settings,
              instruments: state.settings.instruments.filter(i => i !== instrument)
            }
          }));
        });
      },
      
      deleteInstrument: (instrument) => {
        const state = get();
        
        // Store the current instruments for potential rollback
        const currentInstruments = [...state.settings.instruments];
        
        // Update local state immediately for responsive UI
        set((state) => ({
          settings: {
            ...state.settings,
            instruments: state.settings.instruments.filter(i => i !== instrument)
          }
        }));
        
        // Then sync with API (fire and forget)
        fetch(`/api/instruments?instrument=${encodeURIComponent(instrument)}`, {
          method: 'DELETE',
        }).catch(error => {
          console.error('❌ Error deleting instrument from API:', error);
          // Revert the state change if API call fails
          set((state) => ({
            settings: {
              ...state.settings,
              instruments: currentInstruments
            }
          }));
        });
      },
      
      generateStudentId: () => {
        const state = get();
        
        // Use a combination of timestamp, random string, and counter for uniqueness
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 10);
        const counter = state.students.length.toString(36);
        
        // Combine all parts to create a unique ID
        const id = `${timestamp}-${randomStr}-${counter}`;
        
        // Double-check that this ID is unique
        const isUnique = !state.students.some(student => student.id === id);
        
        // In the extremely unlikely case of a collision, add more randomness
        if (!isUnique) {
          return `${timestamp}-${randomStr}-${counter}-${Math.random().toString(36).substring(2, 6)}`;
        }
        
        return id;
      },
      
      createStudent: ({ name, instrument, grade, day, time, contact, currentMaterial }) => {
        const state = get();
        
        // Check if a student with the same name, instrument, day and time already exists
        const existingStudent = state.students.find(student => 
          student.name === name && 
          student.instrument === instrument && 
          student.day === day && 
          student.time === time
        );
        
        if (existingStudent) {
          console.warn('A student with the same details already exists');
          return existingStudent;
        }
        
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
    const { students, isLoading } = store;
    if (typeof window === 'undefined') return [];
    
    // Get the current date in the local timezone
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[now.getDay()];
    
    console.log('🕒 System time:', {
      raw: now.toString(),
      utc: now.toUTCString(),
      local: now.toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currentDay: today,
      dayIndex: now.getDay()
    });
    
    console.log('📚 Students state:', {
      total: students.length,
      isLoading,
      hasData: students && students.length > 0,
      studentDays: students.map(s => ({ name: s.name, day: s.day }))
    });
    
    if (isLoading) {
      console.log('⏳ Still loading students...');
      return [];
    }
    
    if (!students || students.length === 0) {
      console.log('⚠️ No students data available');
      return [];
    }
    
    const todaysStudents = students
      .filter(student => {
        const matches = student.day.toLowerCase() === today.toLowerCase();
        console.log(`🔍 Checking student ${student.name}: day=${student.day}, today=${today}, matches=${matches}`);
        return matches;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
    
    console.log('📅 Today\'s students:', todaysStudents);
    return todaysStudents;
  };
  
  return {
    getCurrentStudent,
    getTodaysLessons
  };
}; 