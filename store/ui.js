export const state = () => ({
  settingsModalOpen: false,
  studentProfileModalOpen: false,
  addStudentModalOpen: false,
  editStudentModalOpen: false,
  addNoteModalOpen: false,
  editNoteModalOpen: false
});

export const mutations = {
  setSettingsModalOpen(state, isOpen) {
    state.settingsModalOpen = isOpen;
  },
  
  setStudentProfileModalOpen(state, isOpen) {
    state.studentProfileModalOpen = isOpen;
  },
  
  setAddStudentModalOpen(state, isOpen) {
    state.addStudentModalOpen = isOpen;
  },
  
  setEditStudentModalOpen(state, isOpen) {
    state.editStudentModalOpen = isOpen;
  },
  
  setAddNoteModalOpen(state, isOpen) {
    state.addNoteModalOpen = isOpen;
  },
  
  setEditNoteModalOpen(state, isOpen) {
    state.editNoteModalOpen = isOpen;
  }
}; 