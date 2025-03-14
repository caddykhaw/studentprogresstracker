import { defineStore } from 'pinia';

export const useUIStore = defineStore('ui', {
  state: () => ({
    settingsModalOpen: false,
    studentProfileModalOpen: false,
    addStudentModalOpen: false,
    editStudentModalOpen: false,
    addNoteModalOpen: false,
    editNoteModalOpen: false
  }),
  
  actions: {
    setSettingsModalOpen(isOpen) {
      this.settingsModalOpen = isOpen;
    },
    
    setStudentProfileModalOpen(isOpen) {
      this.studentProfileModalOpen = isOpen;
    },
    
    setAddStudentModalOpen(isOpen) {
      this.addStudentModalOpen = isOpen;
    },
    
    setEditStudentModalOpen(isOpen) {
      this.editStudentModalOpen = isOpen;
    },
    
    setAddNoteModalOpen(isOpen) {
      this.addNoteModalOpen = isOpen;
    },
    
    setEditNoteModalOpen(isOpen) {
      this.editNoteModalOpen = isOpen;
    }
  }
}); 