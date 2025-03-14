document.addEventListener('DOMContentLoaded', () => {
  // ==============================
  // 1️⃣ DOM ELEMENTS
  // ==============================
  const elements = {
    // Student List and Today's Lessons
    studentListElement: document.getElementById('studentList'),
    todaysLessonsListElement: document.getElementById('todaysLessonsList'),
    
    // Add Student related
    addStudentBtn: document.getElementById('addStudentBtn'),
    floatingButton: document.getElementById('addStudentBtn'),
    buttonIcon: document.getElementById('addStudentIcon'),
    buttonText: document.getElementById('addStudentText'),
    addStudentModal: document.getElementById('addStudentModal'),
    saveStudentBtn: document.getElementById('saveStudentBtn'),
    cancelStudentBtn: document.getElementById('cancelStudentBtn'),
    addStudentForm: document.getElementById('addStudentForm'),

    // Student Profile related
    studentProfileModal: document.getElementById('studentProfileModal'),
    studentProfileContent: document.getElementById('studentProfileContent'),
    closeStudentProfileBtn: document.getElementById('closeStudentProfileBtn'),

    // Notes related
    addNoteModal: document.getElementById('addNoteModal'),
    saveNoteBtn: document.getElementById('saveNoteBtn'),
    cancelNoteBtn: document.getElementById('cancelNoteBtn'),
    addNoteForm: document.getElementById('addNoteForm'),

    // Edit Student related
    editStudentModal: document.getElementById('editStudentModal'),
    updateStudentBtn: document.getElementById('updateStudentBtn'),
    cancelEditStudentBtn: document.getElementById('cancelEditStudentBtn'),
    editStudentForm: document.getElementById('editStudentForm'),

    // Edit Note related
    editNoteModal: document.getElementById('editNoteModal'),
    updateNoteBtn: document.getElementById('updateNoteBtn'),
    cancelEditNoteBtn: document.getElementById('cancelEditNoteBtn'),
    editNoteForm: document.getElementById('editNoteForm'),

    // Settings related
    settingsBtn: document.getElementById('settingsMenuBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsBtn: document.getElementById('closeSettingsModalBtn'),
    newInstrumentInput: document.getElementById('newInstrumentInput'),
    addInstrumentBtn: document.getElementById('addInstrumentBtn'),
    instrumentList: document.getElementById('instrumentList')
  };

  // Log found/missing elements
  console.log('Elements status:', Object.entries(elements).reduce((acc, [key, element]) => {
    acc[key] = element ? 'Found' : 'Missing';
    return acc;
  }, {}));

  // ==============================
  // 2️⃣ DATA MANAGEMENT
  // ==============================    
  let students = JSON.parse(localStorage.getItem('students')) || [];
  let selectedStudentId = null;
  let selectedNoteIndex = null;
  let settings = JSON.parse(localStorage.getItem('settings')) || {
    instruments: []
  };

  // ==============================
  // 3️⃣ HELPER FUNCTIONS
  // ==============================
  function generateStudentId() {
    return Math.random().toString(36).substring(2, 15);
  }

  function saveStudentsToLocalStorage() {
    localStorage.setItem('students', JSON.stringify(students));
  }

  function saveSettings() {
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  function closeStudentProfile() {
    console.log('Attempting to close student profile');
    const modal = document.getElementById('studentProfileModal');
    modal.style.display = 'none';
    modal.classList.add('hidden');
    selectedStudentId = null;
    console.log('Profile modal state after close:', {
      display: modal.style.display,
      classList: Array.from(modal.classList)
    });
  }

  function updateStats() {
    const todayCountElement = document.getElementById('todaysStudentCount');
    const totalCountElement = document.getElementById('totalStudentCount');
    
    if (!todayCountElement || !totalCountElement) {
      console.error('Stats elements not found!');
      return;
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaysCount = students.filter(student => student.day === today).length;
    
    todayCountElement.textContent = todaysCount;
    totalCountElement.textContent = students.length;
  }

  function renderInstruments() {
    const listContainer = document.getElementById('instrumentListContainer');
    const instrumentList = document.getElementById('instrumentList');
    
    if (!listContainer || !instrumentList) {
      console.error('Required elements not found:', { listContainer, instrumentList });
      return;
    }

    // Force container dimensions
    listContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      min-height: 50px;
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      background: white;
    `;

    const instruments = JSON.parse(localStorage.getItem('instruments') || '[]');
    console.log('Rendering instruments:', instruments);

    // Clear existing content
    while (instrumentList.firstChild) {
      instrumentList.removeChild(instrumentList.firstChild);
    }

    if (instruments.length === 0) {
      const emptyMessage = document.createElement('li');
      emptyMessage.className = 'p-3 text-gray-500 text-center';
      emptyMessage.textContent = 'No instruments added';
      instrumentList.appendChild(emptyMessage);
    } else {
      instruments.forEach((instrument, index) => {
        const li = document.createElement('li');
        li.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background-color: ${index % 2 === 0 ? '#f9fafb' : '#ffffff'};
          margin-bottom: 2px;
        `;
        
        // Create span for instrument name
        const span = document.createElement('span');
        span.textContent = instrument;
        span.style.flexGrow = '1';
        
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'text-red-500 hover:text-red-700 px-3 py-1 rounded';
        deleteBtn.dataset.instrument = instrument;
        
        // Add click handler
        deleteBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const updatedInstruments = instruments.filter(i => i !== instrument);
          localStorage.setItem('instruments', JSON.stringify(updatedInstruments));
          renderInstruments();
        });
        
        // Assemble the li element
        li.appendChild(span);
        li.appendChild(deleteBtn);
        instrumentList.appendChild(li);
      });
    }

    // Force layout recalculation
    requestAnimationFrame(() => {
      const height = instrumentList.scrollHeight;
      console.log('Forced layout calculation:', {
        containerHeight: listContainer.offsetHeight,
        listHeight: height,
        itemCount: instrumentList.children.length
      });
      
      // Ensure minimum height
      if (height > 0) {
        listContainer.style.minHeight = `${Math.min(height + 10, 300)}px`;
      }
    });
  }

  function updateInstrumentDropdowns() {
    const instrumentSelects = document.querySelectorAll('#instrument, #editInstrument');

    instrumentSelects.forEach((select) => {
      select.innerHTML = '';
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select Instrument';
      select.appendChild(defaultOption);

      settings.instruments.forEach((instrument) => {
        const option = document.createElement('option');
        option.value = instrument;
        option.textContent = instrument;
        select.appendChild(option);
      });
    });
  }

  function importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.students) {
        students = data.students;
        saveStudentsToLocalStorage();
      }
      
      if (data.settings) {
        settings = data.settings;
        saveSettings();
      }
      
      // Refresh UI
      displayStudents();
      displayTodaysLessons();
      updateStats();
      updateInstrumentDropdowns();
      renderInstruments();
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  function exportData() {
    const data = {
      students: students,
      settings: settings
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

  // ==============================
  // 4️⃣ CRUD OPERATIONS
  // ==============================

  // 🎓 CREATE STUDENT
  function addStudent(name, instrument, grade, day, time) {
    const newStudent = {
      id: generateStudentId(),
      name,
      instrument,
      grade,
      day,
      time,
      notes: []
    };
    students.push(newStudent);
    saveStudentsToLocalStorage();
    displayStudents();
    displayTodaysLessons();
    updateStats();
  }

  // 📖 READ STUDENTS
  function displayStudents() {
    if (!elements.studentListElement) {
      console.error('Student list element not found');
      return;
    }

    elements.studentListElement.innerHTML = '';
      const sortedStudents = students.slice().sort((a, b) => a.name.localeCompare(b.name));
      const groupedStudents = sortedStudents.reduce((acc, student) => {
        const firstLetter = student.name[0].toUpperCase();
        if (!acc[firstLetter]) acc[firstLetter] = [];
        acc[firstLetter].push(student);
        return acc;
      }, {});

      Object.keys(groupedStudents).sort().forEach(letter => {
        const divider = document.createElement('div');
        divider.className = 'bg-gray-200 p-2 font-bold text-gray-700 sticky top-0';
        divider.textContent = letter;
      elements.studentListElement.appendChild(divider);

        groupedStudents[letter].forEach(student => {
          const li = document.createElement('li');
          li.className = 'p-2 hover:bg-gray-50 cursor-pointer';
          li.textContent = `${student.name} - ${student.instrument} (${student.grade})`;
        li.addEventListener('click', () => openStudentProfile(student.id));
        elements.studentListElement.appendChild(li);
        });
      });
    }

  function displayTodaysLessons() {
    if (!elements.todaysLessonsListElement) {
      console.error('Today\'s lessons list element not found');
      return;
    }

    elements.todaysLessonsListElement.innerHTML = '';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaysStudents = students.filter(student => student.day === today);
    
    todaysStudents.forEach(student => {
      const listItem = document.createElement('li');
      listItem.className = 'p-2 hover:bg-gray-50 cursor-pointer';
      listItem.textContent = `${student.name} - ${student.instrument} at ${student.time}`;
      listItem.addEventListener('click', () => openStudentProfile(student.id));
      elements.todaysLessonsListElement.appendChild(listItem);
    });
  }

  function openStudentProfile(studentId) {
    console.log('1. Opening profile for studentId:', studentId);
  selectedStudentId = studentId;
  const student = students.find(s => s.id === studentId);
    
  if (student) {
      const modal = document.getElementById('studentProfileModal');
      
      // First display the profile content
    displayStudentProfile(student);
      
      // Ensure modal is at root level
      if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }
      
      // Show the modal
      modal.style.display = 'flex';
      modal.classList.remove('hidden');
      
      console.log('Modal visibility check:', {
        isInBody: modal.parentElement === document.body,
        display: window.getComputedStyle(modal).display,
        zIndex: window.getComputedStyle(modal).zIndex,
        isVisible: !modal.classList.contains('hidden')
      });
    }
}

function displayStudentProfile(student) {
    // Debounce the heavy DOM operations
    requestAnimationFrame(() => {
      // Create document fragment for better performance
      const fragment = document.createDocumentFragment();
      
      // Create the profile info section
      const profileInfo = document.createElement('div');
      profileInfo.className = 'space-y-2';
      
      // Build profile info using DocumentFragment
      const profileDetails = [
        ['Name', student.name],
        ['Instrument', student.instrument],
        ['Grade', student.grade],
        ['Day', student.day],
        ['Time', student.time]
      ];
      
      profileDetails.forEach(([label, value]) => {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${label}:</strong> ${value}`;
        profileInfo.appendChild(p);
      });
      
      fragment.appendChild(profileInfo);
      
      // Create notes container
      const notesContainer = document.createElement('div');
      notesContainer.className = 'notes-container mt-4';
      notesContainer.innerHTML = `
      <h4 class="font-semibold mb-2">Progress Notes:</h4>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white border">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-2 text-left border-b">Date</th>
              <th class="p-2 text-left border-b">Note</th>
              <th class="p-2 border-b w-10"></th>
            </tr>
          </thead>
          <tbody>
              ${student.notes.map((note, index) => `
                <tr class="hover:bg-gray-50" data-note-index="${index}">
                  <td class="p-2 border-b">${note.date}</td>
                  <td class="p-2 border-b whitespace-pre-line">${note.text.replace(/\n/g, '<br>')}</td>
                  <td class="p-2 border-b w-10">
                    <button class="text-red-500 hover:text-red-700 delete-note" data-note-index="${index}">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
      `;
      fragment.appendChild(notesContainer);

      // Create action buttons
      const actionButtons = document.createElement('div');
      actionButtons.className = 'mt-4 space-x-2';
      actionButtons.innerHTML = `
        <button id="editStudentBtn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Edit Student
        </button>
        <button id="addNoteProfileBtn" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Add Note
        </button>
        <button id="deleteStudentBtn" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Delete Student
        </button>
      `;
      fragment.appendChild(actionButtons);
      
      // Clear existing content and append fragment
      elements.studentProfileContent.innerHTML = '';
      elements.studentProfileContent.appendChild(fragment);
      
      // Add event listeners for buttons and notes
  document.getElementById('editStudentBtn').addEventListener('click', () => openEditStudentModal(student));
  document.getElementById('addNoteProfileBtn').addEventListener('click', () => openAddNoteModal(student.id));
  document.getElementById('deleteStudentBtn').addEventListener('click', () => deleteStudent(student.id));

  // Add click handlers for notes
      const noteRows = elements.studentProfileContent.querySelectorAll('[data-note-index]');
      noteRows.forEach(row => {
        row.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-note')) {
            selectedNoteIndex = parseInt(row.dataset.noteIndex);
        openEditNoteModal(student);
      }
    });
  });

  // Add delete handlers for notes
      const deleteButtons = elements.studentProfileContent.querySelectorAll('.delete-note');
      deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const noteIndex = parseInt(button.dataset.noteIndex);
      deleteNote(student.id, noteIndex);
        });
    });
  });
}

  // 📝 UPDATE STUDENT
  function updateStudent() {
    const studentId = document.getElementById('editStudentId').value;
    const student = students.find(s => s.id === studentId);

    if (student) {
      student.name = document.getElementById('editName').value.trim();
      student.instrument = document.getElementById('editInstrument').value;
      student.grade = document.getElementById('editGrade').value;
      student.day = document.getElementById('editDay').value;
      student.time = document.getElementById('editTime').value;

      saveStudentsToLocalStorage();
      displayStudents();
      displayTodaysLessons();
      displayStudentProfile(student);
      elements.editStudentModal.classList.add('hidden');
    }
  }

  function openEditStudentModal(student) {
    document.getElementById('editStudentId').value = student.id;
    document.getElementById('editName').value = student.name;
    document.getElementById('editInstrument').value = student.instrument;
    document.getElementById('editGrade').value = student.grade;
    document.getElementById('editDay').value = student.day;
    document.getElementById('editTime').value = student.time;
    elements.editStudentModal.classList.remove('hidden');
  }

  // 🗑️ DELETE STUDENT
  function deleteStudent(studentId) {
    students = students.filter(s => s.id !== studentId);
    saveStudentsToLocalStorage();
    displayStudents();
    displayTodaysLessons();
    closeStudentProfile();
    updateStats();
  }

  // 📝 UPDATE NOTE
  function addNote(studentId, noteText) {
    const student = students.find(s => s.id === studentId);
    if (student) {
      student.notes.push({
        text: noteText,
        date: new Date().toLocaleDateString()
      });
      saveStudentsToLocalStorage();
      displayStudentProfile(student);
    }
  }

  function updateNote() {
    if (selectedStudentId === null || selectedNoteIndex === null) return;

    const student = students.find(s => s.id === selectedStudentId);
    if (student && student.notes[selectedNoteIndex]) {
      const newText = document.getElementById('editNoteText').value.trim();
      if (newText) {
        student.notes[selectedNoteIndex].text = newText;
        student.notes[selectedNoteIndex].date = new Date().toLocaleDateString();
        saveStudentsToLocalStorage();
        displayStudentProfile(student);
        elements.editNoteModal.classList.add('hidden');
      }
    }
  }

  function openAddNoteModal(studentId) {
    selectedStudentId = studentId;
    elements.addNoteModal.classList.remove('hidden');
  }

  function openEditNoteModal(student) {
    if (selectedNoteIndex === null || !student.notes[selectedNoteIndex]) return;

    const note = student.notes[selectedNoteIndex];
    document.getElementById('editNoteText').value = note.text;
    elements.editNoteModal.classList.remove('hidden');
  }

  // 🗑️ DELETE NOTE
  function deleteNote(studentId, noteIndex) {
    const student = students.find(s => s.id === studentId);
    if (student && student.notes[noteIndex]) {
      if (confirm('Are you sure you want to delete this note?')) {
        student.notes.splice(noteIndex, 1);
        saveStudentsToLocalStorage();
        displayStudentProfile(student);
      }
    }
  }

  // ==============================
  // 5️⃣ EVENT LISTENERS
  // ==============================

  // Settings Modal
  function createSettingsModal() {
    // First, update the modal HTML structure to use absolute positioning
    const modalHTML = `
      <div id="newSettingsModal" class="fixed inset-0 bg-black bg-opacity-50" style="display: none; z-index: 9999;">
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    bg-white rounded-lg shadow-xl w-full max-w-md">
          <div class="p-6">
            <!-- Header -->
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold">Settings</h3>
              <button class="modal-close text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>

            <!-- Instruments Section -->
            <div class="mb-6">
              <h4 class="font-medium mb-2">Instruments</h4>
              <div class="flex gap-2 mb-4">
                <input type="text" 
                       id="newInstrumentInput" 
                       class="flex-1 border rounded px-3 py-2" 
                       placeholder="Add new instrument">
                <button id="addInstrumentBtn" 
                        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 whitespace-nowrap">
                  Add
                </button>
              </div>
              <!-- Updated instrument list container -->
              <div id="instrumentListContainer" style="
                position: relative;
                height: 200px;
                border: 1px solid #e5e7eb;
                border-radius: 0.375rem;
                background: white;
                overflow: hidden;
              ">
                <div id="instrumentList" style="
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  overflow-y: auto;
                  padding: 0.5rem;
                "></div>
              </div>
            </div>

            <!-- Backup Section -->
            <div class="border-t pt-4">
              <h4 class="font-medium mb-2">Backup and Restore</h4>
              <div class="space-y-3">
                <button id="exportDataBtn" 
                        class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Export Backup
                </button>
                <div class="flex flex-col sm:flex-row gap-2">
                  <input type="file" 
                         id="importDataInput" 
                         accept=".json" 
                         class="flex-1 text-sm">
                  <button id="importDataBtn" 
                          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 whitespace-nowrap">
                    Import
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Get modal elements
    const modal = document.getElementById('newSettingsModal');
    const listContainer = document.getElementById('instrumentListContainer');
    const instrumentList = document.getElementById('instrumentList');

    // Updated renderInstruments function with absolute positioning
    function renderInstruments() {
      if (!instrumentList) {
        console.error('Instrument list element not found');
        return;
      }

      const instruments = JSON.parse(localStorage.getItem('instruments') || '[]');
      console.log('Rendering instruments:', instruments);

      // Clear the list
      instrumentList.innerHTML = '';

      // Create and append items
      if (instruments.length === 0) {
        instrumentList.innerHTML = `
          <div class="flex items-center justify-center h-full">
            <span class="text-gray-500">No instruments added</span>
          </div>
        `;
    } else {
        const itemsHTML = instruments.map((instrument, index) => `
          <div class="instrument-item" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            background-color: ${index % 2 === 0 ? '#f9fafb' : '#ffffff'};
            border-bottom: 1px solid #e5e7eb;
          ">
            <span style="flex: 1;">${instrument}</span>
            <button class="delete-instrument bg-red-50 text-red-500 hover:text-red-700 px-3 py-1 rounded"
                    data-instrument="${instrument}">
              Delete
            </button>
          </div>
        `).join('');

        instrumentList.innerHTML = itemsHTML;

        // Add delete handlers
        instrumentList.querySelectorAll('.delete-instrument').forEach(button => {
          button.addEventListener('click', (e) => {
            const instrumentToDelete = e.target.dataset.instrument;
            const updatedInstruments = instruments.filter(i => i !== instrumentToDelete);
            localStorage.setItem('instruments', JSON.stringify(updatedInstruments));
            renderInstruments();
          });
        });
      }

      // Log dimensions
      console.log('List dimensions:', {
        container: {
          height: listContainer.offsetHeight,
          scroll: listContainer.scrollHeight
        },
        list: {
          height: instrumentList.offsetHeight,
          scroll: instrumentList.scrollHeight,
          items: instrumentList.children.length
        }
      });
    }

    // Updated showModal function
    function showModal() {
      console.log('Opening settings modal');
      modal.style.display = 'block';
      
      // Delay render slightly to ensure modal is visible
      setTimeout(() => {
    renderInstruments();
      }, 50);
    }

    function hideModal() {
      modal.style.display = 'none';
    }

    // Event Listeners
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', hideModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'block') hideModal();
    });

    // Add instrument functionality
    if (elements.addInstrumentBtn && elements.newInstrumentInput) {
      elements.addInstrumentBtn.addEventListener('click', () => {
        const instrument = elements.newInstrumentInput.value.trim();
        if (instrument) {
          const instruments = JSON.parse(localStorage.getItem('instruments') || '[]');
          if (!instruments.includes(instrument)) {
            instruments.push(instrument);
            localStorage.setItem('instruments', JSON.stringify(instruments));
            elements.newInstrumentInput.value = '';
      renderInstruments();
          }
        }
      });

      elements.newInstrumentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          elements.addInstrumentBtn.click();
        }
      });
    }

    // Export functionality
    if (elements.exportDataBtn) {
      elements.exportDataBtn.addEventListener('click', () => {
        const data = {
          students: JSON.parse(localStorage.getItem('students') || '[]'),
          instruments: JSON.parse(localStorage.getItem('instruments') || '[]'),
          lessons: JSON.parse(localStorage.getItem('lessons') || '[]')
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `music_school_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    // Import functionality
    if (elements.importDataBtn && elements.importDataInput) {
      elements.importDataBtn.addEventListener('click', () => {
        const file = elements.importDataInput.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const data = JSON.parse(e.target.result);
              if (data.students) localStorage.setItem('students', JSON.stringify(data.students));
              if (data.instruments) {
                localStorage.setItem('instruments', JSON.stringify(data.instruments));
                renderInstruments();
              }
              if (data.lessons) localStorage.setItem('lessons', JSON.stringify(data.lessons));
              alert('Data imported successfully!');
              window.location.reload();
            } catch (error) {
              console.error('Import error:', error);
              alert('Error importing data. Please check the file format.');
            }
          };
          reader.readAsText(file);
        }
      });
    }

    return { showModal, hideModal };
  }

  // Initialize modal
  const settingsModal = createSettingsModal();

  // Add click handler to settings button
  if (elements.settingsBtn) {
    elements.settingsBtn.addEventListener('click', () => {
      settingsModal.showModal();
    });
  }

  // ==============================
  // 6️⃣ INITIALIZATION
  // ==============================
  
  // Initialize display
  displayStudents();
  displayTodaysLessons();
  updateInstrumentDropdowns();
  renderInstruments();
  
  // Update stats if the function exists
  if (typeof updateStats === 'function') {
    updateStats();
  }

  // Initialize instruments if none exist
  const instruments = JSON.parse(localStorage.getItem('instruments') || '[]');
  if (instruments.length === 0) {
    // Add default instruments if none exist
    const defaultInstruments = ['Guitar', 'Piano', 'Drums', 'Vocal'];
    localStorage.setItem('instruments', JSON.stringify(defaultInstruments));
    console.log('Initialized default instruments');
  }
});