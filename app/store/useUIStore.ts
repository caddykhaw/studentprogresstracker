import { create } from 'zustand'

interface UIState {
  isAddStudentModalOpen: boolean
  isEditStudentModalOpen: boolean
  isStudentProfileModalOpen: boolean
  isSettingsModalOpen: boolean
  isAddNoteModalOpen: boolean
  isEditNoteModalOpen: boolean
  selectedStudentId: string | null
  isTransitioning: boolean
  
  // Modal actions
  openAddStudentModal: () => void
  closeAddStudentModal: () => void
  openEditStudentModal: (studentId: string) => void
  closeEditStudentModal: () => void
  openStudentProfileModal: (studentId: string) => void
  closeStudentProfileModal: () => void
  openSettingsModal: () => void
  closeSettingsModal: () => void
  openAddNoteModal: () => void
  closeAddNoteModal: () => void
  openEditNoteModal: () => void
  closeEditNoteModal: () => void
  openEditStudentFromProfile: (studentId: string) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  isAddStudentModalOpen: false,
  isEditStudentModalOpen: false,
  isStudentProfileModalOpen: false,
  isSettingsModalOpen: false,
  isAddNoteModalOpen: false,
  isEditNoteModalOpen: false,
  selectedStudentId: null,
  isTransitioning: false,
  
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
  },
  
  openAddNoteModal: () => {
    console.log('🔓 Opening Add Note Modal')
    set({ isAddNoteModalOpen: true })
  },
  closeAddNoteModal: () => {
    console.log('🔒 Closing Add Note Modal')
    set({ isAddNoteModalOpen: false })
  },
  
  openEditNoteModal: () => {
    console.log('🔓 Opening Edit Note Modal')
    set({ isEditNoteModalOpen: true })
  },
  closeEditNoteModal: () => {
    console.log('🔒 Closing Edit Note Modal')
    set({ isEditNoteModalOpen: false })
  },
  
  // Helper method to handle transition from profile to edit modal
  openEditStudentFromProfile: (studentId) => {
    const state = get()
    
    // If student profile is open, close it first with a delay before opening edit modal
    if (state.isStudentProfileModalOpen) {
      console.log('🔄 Transitioning from profile to edit modal')
      set({ isTransitioning: true })
      
      // Close profile modal first
      set({ isStudentProfileModalOpen: false })
      
      // Then open edit modal after a small delay to prevent reflow
      setTimeout(() => {
        set({ 
          isEditStudentModalOpen: true, 
          selectedStudentId: studentId,
          isTransitioning: false
        })
        console.log('✅ Transition complete')
      }, 100)
    } else {
      // Direct open if no transition needed
      set({ isEditStudentModalOpen: true, selectedStudentId: studentId })
    }
  }
})) 