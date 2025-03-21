import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Settings {
  instruments: string[]
  // Add more settings as needed
}

interface SettingsState extends Settings {
  // Actions
  setInstruments: (instruments: string[]) => void
  addInstrument: (instrument: string) => Promise<void>
  deleteInstrument: (instrument: string) => Promise<void>
  initializeSettings: () => Promise<void>
}

const defaultSettings: Settings = {
  instruments: ['Piano', 'Violin', 'Guitar', 'Drums', 'Voice', 'Bass', 'Ukulele', 'Flute']
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initialize with default values
      ...defaultSettings,

      setInstruments: (instruments) => {
        set({ instruments })
      },

      addInstrument: async (instrument) => {
        const state = get();
        
        if (state.instruments.includes(instrument)) return;
        
        const newInstruments = [...state.instruments, instrument];
        
        try {
          // Update MongoDB
          const response = await fetch('/api/settings', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ instruments: newInstruments }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update settings in database');
          }
          
          // Update local state only after successful API call
          set({ instruments: newInstruments });
        } catch (error) {
          console.error('Failed to add instrument:', error);
          throw error;
        }
      },

      deleteInstrument: async (instrument) => {
        const state = get();
        
        const newInstruments = state.instruments.filter(i => i !== instrument);
        
        try {
          // Update MongoDB
          const response = await fetch('/api/settings', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ instruments: newInstruments }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update settings in database');
          }
          
          // Update local state only after successful API call
          set({ instruments: newInstruments });
        } catch (error) {
          console.error('Failed to delete instrument:', error);
          throw error;
        }
      },

      initializeSettings: async () => {
        try {
          const response = await fetch('/api/settings');
          if (response.ok) {
            const data = await response.json();
            if (data && data.instruments) {
              set({ instruments: data.instruments });
              return;
            }
          }
          // Fallback to defaults if API fails
          set(defaultSettings);
        } catch (error) {
          console.error('Failed to initialize settings:', error);
          set(defaultSettings);
        }
      }
    }),
    {
      name: 'settings-storage',
    }
  )
) 