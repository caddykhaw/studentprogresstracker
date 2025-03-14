<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Left column: Student List -->
      <div class="md:col-span-2">
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Students</h2>
            <button 
              @click="openAddStudentModal" 
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Add Student
            </button>
          </div>
          
          <div v-if="!students.length" class="text-center py-8 text-gray-500">
            No students added yet. Click "Add Student" to get started.
          </div>
          
          <ul v-else class="divide-y divide-gray-200">
            <li 
              v-for="student in students" 
              :key="student.id" 
              class="py-4 flex justify-between items-center hover:bg-gray-50 px-2 rounded cursor-pointer"
              @click="openStudentProfile(student.id)"
            >
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ student.name }}</h3>
                <div class="text-sm text-gray-500">
                  {{ student.instrument }} | {{ student.grade }} | {{ student.day }} {{ student.time }}
                </div>
              </div>
              <div class="flex space-x-2">
                <button 
                  @click.stop="openEditStudentModal(student.id)" 
                  class="text-blue-600 hover:text-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button 
                  @click.stop="confirmDeleteStudent(student.id)" 
                  class="text-red-600 hover:text-red-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Right column: Today's Lessons -->
      <div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">Today's Lessons</h2>
          
          <ClientOnly>
            <div v-if="!todaysLessons.length" class="text-center py-8 text-gray-500">
              No lessons scheduled for today.
            </div>
            
            <ul v-else class="divide-y divide-gray-200">
              <li 
                v-for="student in todaysLessons" 
                :key="student.id" 
                class="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded cursor-pointer"
                @click="openStudentProfile(student.id)"
              >
                <div>
                  <h3 class="text-lg font-medium text-gray-900">{{ student.name }}</h3>
                  <div class="text-sm text-gray-500">
                    {{ student.time }} | {{ student.instrument }}
                  </div>
                </div>
              </li>
            </ul>
            
            <template #fallback>
              <div class="text-center py-8 text-gray-500">
                Loading today's lessons...
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </div>
    
    <!-- Modals -->
    <ClientOnly>
      <AddStudentModal />
      <EditStudentModal />
      <StudentProfileModal />
    </ClientOnly>
  </div>
</template>

<script setup>
import { useStudentStore } from '~/stores/student';
import { useUIStore } from '~/stores/ui';
import { storeToRefs } from 'pinia';

// Initialize stores
const studentStore = useStudentStore();
const uiStore = useUIStore();

// Get reactive state from stores
const { students, todaysLessons } = storeToRefs(studentStore);

// Define methods
function openAddStudentModal() {
  uiStore.setAddStudentModalOpen(true);
}

function openEditStudentModal(studentId) {
  studentStore.setCurrentStudentId(studentId);
  uiStore.setEditStudentModalOpen(true);
}

function openStudentProfile(studentId) {
  studentStore.setCurrentStudentId(studentId);
  uiStore.setStudentProfileModalOpen(true);
}

function confirmDeleteStudent(studentId) {
  if (process.client && confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
    studentStore.deleteStudent(studentId);
  }
}
</script> 