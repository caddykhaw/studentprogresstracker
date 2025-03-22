import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  instruments: string[]
  addInstrument: (instrument: string) => void
  removeInstrument: (instrument: string) => void
  setInstruments: (instruments: string[]) => void
  loadInstruments: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      instruments: ['Piano', 'Guitar', 'Violin', 'Drums', 'Voice'],
      
      addInstrument: async (instrument) => {
        try {
          const response = await fetch('/api/settings/instruments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instrument })
          });
          
          if (!response.ok) {
            throw new Error('Failed to add instrument');
          }
          
          set((state) => ({
            instruments: Array.from(new Set([...state.instruments, instrument]))
          }));
        } catch (error) {
          console.error('Failed to add instrument:', error);
          throw error;
        }
      },
      
      removeInstrument: async (instrument) => {
        try {
          const response = await fetch(`/api/settings/instruments/${encodeURIComponent(instrument)}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            throw new Error('Failed to remove instrument');
          }
          
          set((state) => ({
            instruments: state.instruments.filter(i => i !== instrument)
          }));
        } catch (error) {
          console.error('Failed to remove instrument:', error);
          throw error;
        }
      },
      
      setInstruments: (instruments) => set({ instruments }),
      
      loadInstruments: async () => {
        try {
          const response = await fetch('/api/settings/instruments');
          if (!response.ok) {
            throw new Error('Failed to load instruments');
          }
          const instruments = await response.json();
          set({ instruments });
        } catch (error) {
          console.error('Failed to load instruments:', error);
          throw error;
        }
      }
    }),
    {
      name: 'settings-storage',
    }
  )
) 