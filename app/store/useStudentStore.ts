import { create } from 'zustand'
import { Student } from '@/app/lib/types'

interface StudentState {
  students: Student[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setStudents: (students: Student[]) => void
  addStudent: (student: Student) => void
  updateStudent: (student: Student) => void
  deleteStudent: (studentId: string) => void
  fetchStudents: () => Promise<void>
}

export const useStudentStore = create<StudentState>((set) => ({
  students: [],
  isLoading: false,
  error: null,
  
  setStudents: (students) => {
    console.log('📚 Setting students in store:', students.length)
    set({ students })
  },
  
  addStudent: (student) => {
    console.log('➕ Adding student to store:', student.name)
    set((state) => ({
      students: [student, ...state.students]
    }))
  },
  
  updateStudent: (updatedStudent) => {
    console.log('✏️ Updating student in store:', updatedStudent.name)
    set((state) => ({
      students: state.students.map((student) =>
        student.id === updatedStudent.id ? updatedStudent : student
      )
    }))
  },
  
  deleteStudent: (studentId) => {
    console.log('🗑️ Deleting student from store:', studentId)
    set((state) => ({
      students: state.students.filter((student) => student.id !== studentId)
    }))
  },
  
  fetchStudents: async () => {
    console.log('🔄 Fetching students from API...')
    set({ isLoading: true, error: null })
    
    try {
      const response = await fetch('/api/students')
      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }
      
      const students = await response.json()
      console.log('✅ Successfully fetched students:', students.length)
      set({ students, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch students'
      console.error('❌ Error fetching students:', errorMessage)
      set({
        error: errorMessage,
        isLoading: false
      })
    }
  }
}))

// Selectors
export const useStudentSelectors = () => ({
  getTodaysLessons: () => {
    const students = useStudentStore.getState().students
    return students.filter(student => student.lastActive === 'Today')
  }
}) 