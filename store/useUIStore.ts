import { create } from 'zustand'

interface UIState {
  isSettingsModalOpen: boolean
  isSongModalOpen: boolean
  isSongDetailModalOpen: boolean
  studentProfileModalOpen: boolean
  addStudentModalOpen: boolean
  editStudentModalOpen: boolean
  addNoteModalOpen: boolean
  editNoteModalOpen: boolean
  
  // Actions
  setSettingsModalOpen: (open: boolean) => void
  setSongModalOpen: (open: boolean) => void
  setSongDetailModalOpen: (open: boolean) => void
  openSettingsModal: () => void
  closeSettingsModal: () => void
  openSongModal: () => void
  closeSongModal: () => void
  openSongDetailModal: () => void
  closeSongDetailModal: () => void
  setStudentProfileModalOpen: (isOpen: boolean) => void
  setAddStudentModalOpen: (isOpen: boolean) => void
  setEditStudentModalOpen: (isOpen: boolean) => void
  setAddNoteModalOpen: (isOpen: boolean) => void
  setEditNoteModalOpen: (isOpen: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  isSettingsModalOpen: false,
  isSongModalOpen: false,
  isSongDetailModalOpen: false,
  studentProfileModalOpen: false,
  addStudentModalOpen: false,
  editStudentModalOpen: false,
  addNoteModalOpen: false,
  editNoteModalOpen: false,
  
  setSettingsModalOpen: (open) => set({ isSettingsModalOpen: open }),
  setSongModalOpen: (open) => set({ isSongModalOpen: open }),
  setSongDetailModalOpen: (open) => set({ isSongDetailModalOpen: open }),
  
  openSettingsModal: () => set({ 
    isSettingsModalOpen: true,
    isSongModalOpen: false,
    isSongDetailModalOpen: false,
    studentProfileModalOpen: false,
    addStudentModalOpen: false,
    editStudentModalOpen: false,
    addNoteModalOpen: false,
    editNoteModalOpen: false
  }),
  
  closeSettingsModal: () => set({ isSettingsModalOpen: false }),
  
  openSongModal: () => set({ 
    isSongModalOpen: true,
    isSettingsModalOpen: false,
    isSongDetailModalOpen: false,
    studentProfileModalOpen: false,
    addStudentModalOpen: false,
    editStudentModalOpen: false,
    addNoteModalOpen: false,
    editNoteModalOpen: false
  }),
  
  closeSongModal: () => set({ isSongModalOpen: false }),
  
  openSongDetailModal: () => set({ 
    isSongDetailModalOpen: true,
    isSettingsModalOpen: false,
    isSongModalOpen: false,
    studentProfileModalOpen: false,
    addStudentModalOpen: false,
    editStudentModalOpen: false,
    addNoteModalOpen: false,
    editNoteModalOpen: false
  }),
  
  closeSongDetailModal: () => set({ isSongDetailModalOpen: false }),
  
  setStudentProfileModalOpen: (isOpen) => set({ studentProfileModalOpen: isOpen }),
  setAddStudentModalOpen: (isOpen) => set({ addStudentModalOpen: isOpen }),
  setEditStudentModalOpen: (isOpen) => set({ editStudentModalOpen: isOpen }),
  setAddNoteModalOpen: (isOpen) => set({ addNoteModalOpen: isOpen }),
  setEditNoteModalOpen: (isOpen) => set({ editNoteModalOpen: isOpen })
})) 