import { create } from 'zustand'
import { Student, Settings } from '@/app/lib/types'
import { api } from '@/app/lib/api'

interface LoadingState {
  students: boolean
  instruments: boolean
}

type SetState = (
  partial: StudentState | Partial<StudentState> | ((state: StudentState) => StudentState | Partial<StudentState>),
  replace?: boolean
) => void

type GetState = () => StudentState

interface StudentState {
  // State
  students: Student[]
  settings: Settings
  loading: LoadingState
  error: string | null
  initialized: boolean
  
  // Actions
  setStudents: (students: Student[]) => void
  addStudent: (student: Student) => void
  updateStudent: (student: Student) => void
  deleteStudent: (studentId: string) => void
  initialize: () => Promise<void>
}

// Create stable action creators outside of store
const createActions = (set: SetState, get: GetState) => ({
  setStudents: (students: Student[]) => set({ students }),
  
  addStudent: (student: Student) => 
    set((state: StudentState) => ({ students: [student, ...state.students] })),
  
  updateStudent: (updatedStudent: Student) => 
    set((state: StudentState) => ({
      students: state.students.map(student =>
        student.id === updatedStudent.id ? updatedStudent : student
      )
    })),
  
  deleteStudent: (studentId: string) => 
    set((state: StudentState) => ({
      students: state.students.filter(student => student.id !== studentId)
    })),
  
  initialize: async () => {
    const state = get()
    
    // Prevent multiple initializations
    if (state.initialized || (state.loading.students || state.loading.instruments)) {
      return
    }
    
    set({ 
      loading: { students: true, instruments: true },
      error: null 
    })
    
    try {
      const [students, instruments] = await Promise.all([
        api.students.getAll(),
        api.instruments.getAll()
      ])
      
      set({
        students,
        settings: { instruments },
        loading: { students: false, instruments: false },
        initialized: true
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize',
        loading: { students: false, instruments: false }
      })
      throw error
    }
  }
})

export const useStudentStore = create<StudentState>((set, get) => ({
  // Initial state
  students: [],
  settings: { instruments: [] },
  loading: { students: false, instruments: false },
  error: null,
  initialized: false,
  
  // Attach actions
  ...createActions(set, get)
}))

// Memoized selectors
export const studentSelectors = {
  useStudents: () => useStudentStore(state => state.students),
  useSettings: () => useStudentStore(state => state.settings),
  useLoading: () => useStudentStore(state => state.loading),
  useError: () => useStudentStore(state => state.error),
  useInitialized: () => useStudentStore(state => state.initialized),
  
  useTodaysLessons: () => {
    const students = useStudentStore(state => state.students)
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    return students
      .filter(student => student.day === today)
      .sort((a, b) => a.time.localeCompare(b.time))
  }
} 