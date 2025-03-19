import { create } from 'zustand'

interface UIState {
  isAddStudentModalOpen: boolean
  isEditStudentModalOpen: boolean
  isStudentProfileModalOpen: boolean
  isSettingsModalOpen: boolean
  selectedStudentId: string | null
  
  // Modal actions
  openAddStudentModal: () => void
  closeAddStudentModal: () => void
  openEditStudentModal: (studentId: string) => void
  closeEditStudentModal: () => void
  openStudentProfileModal: (studentId: string) => void
  closeStudentProfileModal: () => void
  openSettingsModal: () => void
  closeSettingsModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  isAddStudentModalOpen: false,
  isEditStudentModalOpen: false,
  isStudentProfileModalOpen: false,
  isSettingsModalOpen: false,
  selectedStudentId: null,
  
  // Modal actions
  openAddStudentModal: () => {
    console.log('🔓 Opening Add Student Modal')
    set({ isAddStudentModalOpen: true })
  },
  closeAddStudentModal: () => {
    console.log('🔒 Closing Add Student Modal')
    set({ isAddStudentModalOpen: false })
  },
  
  openEditStudentModal: (studentId) => {
    console.log('🔓 Opening Edit Student Modal for:', studentId)
    set({ isEditStudentModalOpen: true, selectedStudentId: studentId })
  },
  closeEditStudentModal: () => {
    console.log('🔒 Closing Edit Student Modal')
    set({ isEditStudentModalOpen: false, selectedStudentId: null })
  },
  
  openStudentProfileModal: (studentId) => {
    console.log('🔓 Opening Student Profile Modal for:', studentId)
    set({ isStudentProfileModalOpen: true, selectedStudentId: studentId })
  },
  closeStudentProfileModal: () => {
    console.log('🔒 Closing Student Profile Modal')
    set({ isStudentProfileModalOpen: false, selectedStudentId: null })
  },
  
  openSettingsModal: () => {
    console.log('🔓 Opening Settings Modal')
    set({ isSettingsModalOpen: true })
  },
  closeSettingsModal: () => {
    console.log('🔒 Closing Settings Modal')
    set({ isSettingsModalOpen: false })
  }
})) 