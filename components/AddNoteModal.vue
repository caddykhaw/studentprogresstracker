<template>
  <div v-if="isOpen && student" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75" @click="closeModal"></div>
      </div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="saveNote">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Add Note for {{ student.name }}</h3>
                
                <div>
                  <label for="note-text" class="block text-sm font-medium text-gray-700">Note</label>
                  <textarea 
                    id="note-text" 
                    v-model="noteText" 
                    rows="4" 
                    required
                    class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter your note here..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="submit" 
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Save
            </button>
            <button 
              type="button" 
              @click="closeModal" 
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStudentStore } from '~/stores/student';
import { useUIStore } from '~/stores/ui';
import { storeToRefs } from 'pinia';

const studentStore = useStudentStore();
const uiStore = useUIStore();

const { currentStudent } = storeToRefs(studentStore);
const { addNoteModalOpen } = storeToRefs(uiStore);

const noteText = ref('');

const isOpen = computed(() => addNoteModalOpen.value);
const student = computed(() => currentStudent.value);

function closeModal() {
  uiStore.setAddNoteModalOpen(false);
  noteText.value = '';
}

function saveNote() {
  if (!noteText.value.trim()) return;
  
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  
  const note = {
    text: noteText.value.trim(),
    date: `${day}/${month}/${year}`
  };
  
  studentStore.addNote({
    studentId: student.value.id,
    note
  });
  
  closeModal();
}
</script> 