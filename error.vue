<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <h1 class="text-2xl font-bold text-red-600 mb-4">{{ error.statusCode || 'Error' }}</h1>
      <p class="text-gray-700 mb-6">{{ error.message || 'Something went wrong' }}</p>
      <button 
        @click="handleError" 
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Go back home
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  error: Object
});

function handleError() {
  clearError({ redirect: '/' });
}
</script> 