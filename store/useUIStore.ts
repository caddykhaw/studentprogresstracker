import { create } from 'zustand'

interface UIState {
  settingsModalOpen: boolean
  studentProfileModalOpen: boolean
  addStudentModalOpen: boolean
  editStudentModalOpen: boolean
  addNoteModalOpen: boolean
  editNoteModalOpen: boolean
  
  // Actions
  setSettingsModalOpen: (isOpen: boolean) => void
  setStudentProfileModalOpen: (isOpen: boolean) => void
  setAddStudentModalOpen: (isOpen: boolean) => void
  setEditStudentModalOpen: (isOpen: boolean) => void
  setAddNoteModalOpen: (isOpen: boolean) => void
  setEditNoteModalOpen: (isOpen: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  settingsModalOpen: false,
  studentProfileModalOpen: false,
  addStudentModalOpen: false,
  editStudentModalOpen: false,
  addNoteModalOpen: false,
  editNoteModalOpen: false,
  
  setSettingsModalOpen: (isOpen) => set({ settingsModalOpen: isOpen }),
  setStudentProfileModalOpen: (isOpen) => set({ studentProfileModalOpen: isOpen }),
  setAddStudentModalOpen: (isOpen) => set({ addStudentModalOpen: isOpen }),
  setEditStudentModalOpen: (isOpen) => set({ editStudentModalOpen: isOpen }),
  setAddNoteModalOpen: (isOpen) => set({ addNoteModalOpen: isOpen }),
  setEditNoteModalOpen: (isOpen) => set({ editNoteModalOpen: isOpen })
})) 