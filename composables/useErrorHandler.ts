export const useErrorHandler = () => {
  const handleError = (error: any, context: string = 'operation') => {
    console.error(`Error during ${context}:`, error);
    
    // Show error to user if we're on the client
    if (process.client) {
      const errorMessage = error?.message || `An error occurred during ${context}`;
      alert(errorMessage);
    }
    
    // You could also use Nuxt's built-in error handling
    // const nuxtApp = useNuxtApp();
    // nuxtApp.callHook('app:error', error);
    
    return error;
  };
  
  return {
    handleError
  };
}; 