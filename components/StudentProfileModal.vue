<template>
  <div v-if="isOpen && student" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75" @click="closeModal"></div>
      </div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">{{ student.name }}</h3>
                <button 
                  @click="openEditStudentModal" 
                  class="text-blue-600 hover:text-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </div>
              
              <div class="bg-gray-100 p-4 rounded-lg mb-6">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Instrument</p>
                    <p class="font-medium">{{ student.instrument }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Grade</p>
                    <p class="font-medium">{{ student.grade }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Lesson Day</p>
                    <p class="font-medium">{{ student.day }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Lesson Time</p>
                    <p class="font-medium">{{ student.time }}</p>
                  </div>
                </div>
              </div>
              
              <div class="mb-4 flex justify-between items-center">
                <h4 class="text-md font-medium text-gray-700">Notes</h4>
                <button 
                  @click="openAddNoteModal" 
                  class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Note
                </button>
              </div>
              
              <div v-if="student.notes.length === 0" class="text-center py-4 text-gray-500 bg-gray-50 rounded">
                No notes added yet.
              </div>
              
              <div v-else class="space-y-3 max-h-60 overflow-y-auto">
                <div 
                  v-for="(note, index) in student.notes" 
                  :key="index" 
                  class="bg-gray-50 p-3 rounded-lg"
                >
                  <div class="flex justify-between items-start">
                    <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ note.text }}</p>
                    <div class="flex space-x-2 ml-2">
                      <button 
                        @click="openEditNoteModal(index)" 
                        class="text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        @click="deleteNote(index)" 
                        class="text-red-600 hover:text-red-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">{{ note.date }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button 
            @click="closeModal" 
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    
    <!-- Add Note Modal -->
    <ClientOnly>
      <AddNoteModal v-if="isOpen" />
      <EditNoteModal v-if="isOpen" />
    </ClientOnly>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStudentStore } from '~/stores/student';
import { useUIStore } from '~/stores/ui';
import { storeToRefs } from 'pinia';

const studentStore = useStudentStore();
const uiStore = useUIStore();

const { currentStudent } = storeToRefs(studentStore);
const { studentProfileModalOpen } = storeToRefs(uiStore);

const isOpen = computed(() => studentProfileModalOpen.value);
const student = computed(() => currentStudent.value);

function closeModal() {
  uiStore.setStudentProfileModalOpen(false);
}

function openEditStudentModal() {
  uiStore.setStudentProfileModalOpen(false);
  uiStore.setEditStudentModalOpen(true);
}

function openAddNoteModal() {
  uiStore.setAddNoteModalOpen(true);
}

function openEditNoteModal(noteIndex) {
  uiStore.setEditNoteModalOpen(true);
  studentStore.setCurrentNoteIndex(noteIndex);
}

function deleteNote(noteIndex) {
  if (confirm('Are you sure you want to delete this note?')) {
    studentStore.deleteNote({ 
      studentId: student.value.id, 
      noteIndex 
    });
  }
}
</script> 