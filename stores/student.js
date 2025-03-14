import { defineStore } from 'pinia';

// Helper functions
function saveStudentsToLocalStorage(students) {
  if (process.client) {
    try {
      localStorage.setItem('students', JSON.stringify(students));
    } catch (error) {
      console.error('Failed to save students to localStorage:', error);
    }
  }
}

function saveSettingsToLocalStorage(settings) {
  if (process.client) {
    try {
      localStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }
}

export const useStudentStore = defineStore('student', {
  state: () => ({
    students: [],
    settings: {
      instruments: ['Guitar', 'Drums', 'Piano', 'Violin', 'Bass']
    },
    currentStudentId: null,
    currentNoteIndex: null
  }),
  
  getters: {
    allStudents: (state) => state.students,
    
    studentById: (state) => (id) => {
      return state.students.find(student => student.id === id);
    },
    
    currentStudent: (state) => {
      return state.students.find(student => student.id === state.currentStudentId);
    },
    
    todaysLessons: (state) => {
      if (process.server) return []; // Return empty array on server-side
      
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[new Date().getDay()];
      return state.students.filter(student => student.day === today)
        .sort((a, b) => a.time.localeCompare(b.time));
    },
    
    instruments: (state) => state.settings.instruments
  },
  
  actions: {
    setStudents(students) {
      this.students = students;
    },
    
    setSettings(settings) {
      this.settings = settings;
    },
    
    setCurrentStudentId(id) {
      this.currentStudentId = id;
    },
    
    setCurrentNoteIndex(index) {
      this.currentNoteIndex = index;
    },
    
    addStudent(student) {
      this.students.push(student);
      saveStudentsToLocalStorage(this.students);
    },
    
    updateStudent(updatedStudent) {
      const index = this.students.findIndex(s => s.id === updatedStudent.id);
      if (index !== -1) {
        this.students.splice(index, 1, updatedStudent);
        saveStudentsToLocalStorage(this.students);
      }
    },
    
    deleteStudent(studentId) {
      this.students = this.students.filter(s => s.id !== studentId);
      saveStudentsToLocalStorage(this.students);
    },
    
    addNote({ studentId, note }) {
      const student = this.students.find(s => s.id === studentId);
      if (student) {
        student.notes.push(note);
        saveStudentsToLocalStorage(this.students);
      }
    },
    
    updateNote({ studentId, noteIndex, text }) {
      const student = this.students.find(s => s.id === studentId);
      if (student && student.notes[noteIndex]) {
        student.notes[noteIndex].text = text;
        saveStudentsToLocalStorage(this.students);
      }
    },
    
    deleteNote({ studentId, noteIndex }) {
      const student = this.students.find(s => s.id === studentId);
      if (student && student.notes[noteIndex]) {
        student.notes.splice(noteIndex, 1);
        saveStudentsToLocalStorage(this.students);
      }
    },
    
    addInstrument(instrument) {
      if (!this.settings.instruments.includes(instrument)) {
        this.settings.instruments.push(instrument);
        saveSettingsToLocalStorage(this.settings);
      }
    },
    
    deleteInstrument(instrument) {
      this.settings.instruments = this.settings.instruments.filter(i => i !== instrument);
      saveSettingsToLocalStorage(this.settings);
    },
    
    generateStudentId() {
      return Math.random().toString(36).substring(2, 12);
    },
    
    async createStudent({ name, instrument, grade, day, time }) {
      const id = this.generateStudentId();
      const newStudent = {
        id,
        name,
        instrument,
        grade,
        day,
        time,
        notes: []
      };
      this.addStudent(newStudent);
      return newStudent;
    },
    
    exportData() {
      if (!process.client) return;
      
      try {
        const data = {
          students: this.students,
          settings: this.settings
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
  }
}); 