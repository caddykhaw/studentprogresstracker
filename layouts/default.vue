<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-blue-600 text-white shadow-md">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold">Student Progress Tracker</h1>
        <div class="flex space-x-2">
          <button 
            @click="showSettings" 
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Settings
          </button>
        </div>
      </div>
    </header>
    
    <main class="container mx-auto px-4 py-6">
      <slot />
    </main>
    
    <ClientOnly>
      <SettingsModal />
    </ClientOnly>
  </div>
</template>

<script setup>
import { useUIStore } from '~/stores/ui';

const uiStore = useUIStore();

function showSettings() {
  uiStore.setSettingsModalOpen(true);
}
</script> 