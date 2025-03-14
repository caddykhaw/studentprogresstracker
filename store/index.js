export const state = () => ({
  students: [],
  settings: {
    instruments: ['Guitar', 'Drums', 'Piano', 'Violin', 'Bass']
  },
  currentStudentId: null,
  currentNoteIndex: null
});

export const mutations = {
  setStudents(state, students) {
    state.students = students;
  },
  
  setSettings(state, settings) {
    state.settings = settings;
  },
  
  setCurrentStudentId(state, id) {
    state.currentStudentId = id;
  },
  
  setCurrentNoteIndex(state, index) {
    state.currentNoteIndex = index;
  },
  
  addStudent(state, student) {
    state.students.push(student);
    saveStudentsToLocalStorage(state.students);
  },
  
  updateStudent(state, updatedStudent) {
    const index = state.students.findIndex(s => s.id === updatedStudent.id);
    if (index !== -1) {
      state.students.splice(index, 1, updatedStudent);
      saveStudentsToLocalStorage(state.students);
    }
  },
  
  deleteStudent(state, studentId) {
    state.students = state.students.filter(s => s.id !== studentId);
    saveStudentsToLocalStorage(state.students);
  },
  
  addNote(state, { studentId, note }) {
    const student = state.students.find(s => s.id === studentId);
    if (student) {
      student.notes.push(note);
      saveStudentsToLocalStorage(state.students);
    }
  },
  
  updateNote(state, { studentId, noteIndex, text }) {
    const student = state.students.find(s => s.id === studentId);
    if (student && student.notes[noteIndex]) {
      student.notes[noteIndex].text = text;
      saveStudentsToLocalStorage(state.students);
    }
  },
  
  deleteNote(state, { studentId, noteIndex }) {
    const student = state.students.find(s => s.id === studentId);
    if (student && student.notes[noteIndex]) {
      student.notes.splice(noteIndex, 1);
      saveStudentsToLocalStorage(state.students);
    }
  },
  
  addInstrument(state, instrument) {
    if (!state.settings.instruments.includes(instrument)) {
      state.settings.instruments.push(instrument);
      saveSettingsToLocalStorage(state.settings);
    }
  },
  
  deleteInstrument(state, instrument) {
    state.settings.instruments = state.settings.instruments.filter(i => i !== instrument);
    saveSettingsToLocalStorage(state.settings);
  }
};

export const actions = {
  generateStudentId({ commit }) {
    return Math.random().toString(36).substring(2, 12);
  },
  
  async addStudent({ commit, dispatch }, { name, instrument, grade, day, time }) {
    const id = await dispatch('generateStudentId');
    const newStudent = {
      id,
      name,
      instrument,
      grade,
      day,
      time,
      notes: []
    };
    commit('addStudent', newStudent);
    return newStudent;
  },
  
  exportData({ state }) {
    const data = {
      students: state.students,
      settings: state.settings
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
  }
};

export const getters = {
  allStudents: state => state.students,
  
  studentById: state => id => {
    return state.students.find(student => student.id === id);
  },
  
  currentStudent: state => {
    return state.students.find(student => student.id === state.currentStudentId);
  },
  
  todaysLessons: state => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return state.students.filter(student => student.day === today)
      .sort((a, b) => a.time.localeCompare(b.time));
  },
  
  instruments: state => state.settings.instruments
};

// Helper functions
function saveStudentsToLocalStorage(students) {
  localStorage.setItem('students', JSON.stringify(students));
}

function saveSettingsToLocalStorage(settings) {
  localStorage.setItem('settings', JSON.stringify(settings));
} 