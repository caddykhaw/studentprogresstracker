<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75" @click="closeModal"></div>
      </div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Settings</h3>
              
              <div class="mt-4">
                <h4 class="text-md font-medium text-gray-700 mb-2">Instruments</h4>
                
                <div class="flex items-center mb-4">
                  <input 
                    type="text" 
                    v-model="newInstrument" 
                    placeholder="Add new instrument" 
                    class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md mr-2"
                  />
                  <button 
                    @click="addInstrument" 
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                </div>
                
                <ul class="divide-y divide-gray-200">
                  <li 
                    v-for="instrument in instruments" 
                    :key="instrument" 
                    class="py-2 flex justify-between items-center"
                  >
                    <span>{{ instrument }}</span>
                    <button 
                      @click="deleteInstrument(instrument)" 
                      class="text-red-600 hover:text-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </li>
                </ul>
              </div>
              
              <div class="mt-6">
                <h4 class="text-md font-medium text-gray-700 mb-2">Data Management</h4>
                <div class="flex space-x-2">
                  <button 
                    @click="exportData" 
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Export Data
                  </button>
                  <label class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer">
                    Import Data
                    <input 
                      type="file" 
                      @change="importData" 
                      accept=".json" 
                      class="hidden"
                    />
                  </label>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStudentStore } from '~/stores/student';
import { useUIStore } from '~/stores/ui';
import { storeToRefs } from 'pinia';

// Initialize stores
const studentStore = useStudentStore();
const uiStore = useUIStore();

// Get reactive state from stores
const { instruments } = storeToRefs(studentStore);
const { settingsModalOpen } = storeToRefs(uiStore);

// Local state
const newInstrument = ref('');

// Computed properties
const isOpen = computed(() => settingsModalOpen.value);

// Methods
function closeModal() {
  uiStore.setSettingsModalOpen(false);
}

function addInstrument() {
  if (newInstrument.value.trim()) {
    studentStore.addInstrument(newInstrument.value.trim());
    newInstrument.value = '';
  }
}

function deleteInstrument(instrument) {
  if (process.client && confirm(`Are you sure you want to delete the instrument "${instrument}"?`)) {
    studentStore.deleteInstrument(instrument);
  }
}

function exportData() {
  studentStore.exportData();
}

function importData(event) {
  if (!process.client) return;
  
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      if (data.students) {
        studentStore.setStudents(data.students);
      }
      
      if (data.settings) {
        studentStore.setSettings(data.settings);
      }
      
      alert('Data imported successfully!');
    } catch (error) {
      console.error('Import error:', error);
      alert('Error importing data. Please check the file format.');
    }
  };
  
  reader.readAsText(file);
  event.target.value = null; // Reset the input
}
</script> 