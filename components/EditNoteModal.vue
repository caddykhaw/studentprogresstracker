<template>
  <div v-if="isOpen && student && currentNoteIndex !== null" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75" @click="closeModal"></div>
      </div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="updateNote">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Edit Note for {{ student.name }}</h3>
                
                <div>
                  <label for="edit-note-text" class="block text-sm font-medium text-gray-700">Note</label>
                  <textarea 
                    id="edit-note-text" 
                    v-model="noteText" 
                    rows="4" 
                    required
                    class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
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
              Update
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
import { ref, computed, watch } from 'vue';
import { useStudentStore } from '~/stores/student';
import { useUIStore } from '~/stores/ui';
import { storeToRefs } from 'pinia';

const studentStore = useStudentStore();
const uiStore = useUIStore();

const { currentStudent, currentNoteIndex } = storeToRefs(studentStore);
const { editNoteModalOpen } = storeToRefs(uiStore);

const noteText = ref('');

const isOpen = computed(() => editNoteModalOpen.value);
const student = computed(() => currentStudent.value);

const currentNote = computed(() => {
  if (student.value && currentNoteIndex.value !== null) {
    return student.value.notes[currentNoteIndex.value];
  }
  return null;
});

watch(currentNote, (newVal) => {
  if (newVal) {
    noteText.value = newVal.text;
  }
}, { immediate: true });

watch(isOpen, (newVal) => {
  if (newVal && currentNote.value) {
    noteText.value = currentNote.value.text;
  }
});

function closeModal() {
  uiStore.setEditNoteModalOpen(false);
  studentStore.setCurrentNoteIndex(null);
  noteText.value = '';
}

function updateNote() {
  if (!noteText.value.trim()) return;
  
  studentStore.updateNote({
    studentId: student.value.id,
    noteIndex: currentNoteIndex.value,
    text: noteText.value.trim()
  });
  
  closeModal();
}
</script> 