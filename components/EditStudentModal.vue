<template>
  <div v-if="isOpen && student" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75" @click="closeModal"></div>
      </div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="updateStudent">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Edit Student</h3>
                
                <div class="grid grid-cols-1 gap-4">
                  <div>
                    <label for="edit-name" class="block text-sm font-medium text-gray-700">Name</label>
                    <input 
                      type="text" 
                      id="edit-name" 
                      v-model="form.name" 
                      required
                      class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label for="edit-instrument" class="block text-sm font-medium text-gray-700">Instrument</label>
                    <select 
                      id="edit-instrument" 
                      v-model="form.instrument" 
                      required
                      class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="" disabled>Select an instrument</option>
                      <option v-for="instrument in instruments" :key="instrument" :value="instrument">
                        {{ instrument }}
                      </option>
                    </select>
                  </div>
                  
                  <div>
                    <label for="edit-grade" class="block text-sm font-medium text-gray-700">Grade</label>
                    <select 
                      id="edit-grade" 
                      v-model="form.grade" 
                      required
                      class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="" disabled>Select a grade</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div>
                    <label for="edit-day" class="block text-sm font-medium text-gray-700">Lesson Day</label>
                    <select 
                      id="edit-day" 
                      v-model="form.day" 
                      required
                      class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="" disabled>Select a day</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                  
                  <div>
                    <label for="edit-time" class="block text-sm font-medium text-gray-700">Lesson Time</label>
                    <input 
                      type="time" 
                      id="edit-time" 
                      v-model="form.time" 
                      required
                      class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
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

const { instruments, currentStudent } = storeToRefs(studentStore);
const { editStudentModalOpen } = storeToRefs(uiStore);

const form = ref({
  name: '',
  instrument: '',
  grade: '',
  day: '',
  time: ''
});

const isOpen = computed(() => editStudentModalOpen.value);
const student = computed(() => currentStudent.value);

watch(student, (newVal) => {
  if (newVal) {
    form.value = { ...newVal };
  }
}, { immediate: true });

watch(isOpen, (newVal) => {
  if (newVal && student.value) {
    form.value = { ...student.value };
  }
});

function closeModal() {
  uiStore.setEditStudentModalOpen(false);
}

function updateStudent() {
  const updatedStudent = {
    ...student.value,
    name: form.value.name,
    instrument: form.value.instrument,
    grade: form.value.grade,
    day: form.value.day,
    time: form.value.time
  };
  
  studentStore.updateStudent(updatedStudent);
  closeModal();
}
</script> 