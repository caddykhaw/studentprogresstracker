import { useStudentStore } from '~/stores/student';

export default defineNuxtPlugin(() => {
  // Add a hook that runs only on client-side after hydration is complete
  if (process.client) {
    const nuxtApp = useNuxtApp();
    
    nuxtApp.hook('app:mounted', () => {
      try {
        const studentStore = useStudentStore();
        
        // Load data from localStorage
        const studentsData = localStorage.getItem('students');
        if (studentsData) {
          studentStore.setStudents(JSON.parse(studentsData));
        }
        
        const settingsData = localStorage.getItem('settings');
        if (settingsData) {
          studentStore.setSettings(JSON.parse(settingsData));
        }
        
        console.log('Data loaded from localStorage successfully');
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
      }
    });
  }
}); 