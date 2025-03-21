// Define the app configuration type
interface AppConfig {
  title: string;
  theme: {
    dark: boolean;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      error: string;
    }
  };
  ui: {
    notifications: {
      position: string;
    }
  }
}

// Helper function to define app configuration
function defineAppConfig(config: AppConfig): AppConfig {
  return config;
}

export default defineAppConfig({
  title: 'Student Progress Tracker',
  theme: {
    dark: false,
    colors: {
      primary: '#3B82F6', // blue-500
      secondary: '#10B981', // green-500
      accent: '#8B5CF6', // violet-500
      error: '#EF4444', // red-500
    }
  },
  ui: {
    notifications: {
      position: 'top-right'
    }
  }
}) 