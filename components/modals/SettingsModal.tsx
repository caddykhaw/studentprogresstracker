'use client'

import { useState, useRef } from 'react'
import { useStudentStore } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'
import Modal from './Modal'

// CSS variables for standardization
const styles = {
  button: {
    primary: "rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    secondary: "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    danger: "text-red-600 hover:text-red-800",
  },
  section: {
    title: "text-lg font-semibold text-gray-900 dark:text-white mb-4",
    subtitle: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
    container: "space-y-6",
    divider: "border-t border-gray-200 dark:border-gray-700 pt-5 mt-2",
  },
  input: {
    base: "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500",
    error: "border-red-500",
  },
  listItem: "flex justify-between items-center bg-gray-50 p-2 rounded",
  text: {
    error: "mt-1 text-sm text-red-600",
    muted: "text-gray-500 italic",
  },
  spacing: {
    standard: "space-x-3",
  }
}

export default function SettingsModal() {
  const isOpen = useUIStore(state => state.settingsModalOpen)
  const setIsOpen = useUIStore(state => state.setSettingsModalOpen)
  
  const { settings, addInstrument, deleteInstrument, exportData, setStudents, setSettings } = useStudentStore()
  
  const [newInstrument, setNewInstrument] = useState('')
  const [error, setError] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  
  const handleAddInstrument = () => {
    if (!newInstrument.trim()) {
      setError('Instrument name is required')
      return
    }
    
    const trimmedInstrument = newInstrument.trim()
    
    if (settings.instruments.includes(trimmedInstrument)) {
      setError('This instrument already exists')
      return
    }
    
    addInstrument(trimmedInstrument)
    setNewInstrument('')
    setError('')
  }
  
  const handleDeleteInstrument = (instrument: string) => {
    if (window.confirm(`Are you sure you want to delete "${instrument}"?`)) {
      deleteInstrument(instrument)
    }
  }
  
  const handleExportData = () => {
    exportData()
  }
  
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data.students && data.settings) {
          setStudents(data.students)
          setSettings(data.settings)
          alert('Data imported successfully!')
        } else {
          alert('Invalid data format')
        }
      } catch (error: any) {
        alert('Failed to import data: ' + error.message)
      }
    }
    reader.readAsText(file)
  }
  
  const openFileDialog = () => {
    fileInputRef.current?.click()
  }
  
  const handleClose = () => {
    setIsOpen(false)
    setNewInstrument('')
    setError('')
  }
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Settings">
      <div className={styles.section.container}>
        <div>
          <h3 className={styles.section.title}>Instruments</h3>
          
          <div className="flex items-start mb-4">
            <div className="flex-grow mr-2">
              <input
                type="text"
                value={newInstrument}
                onChange={(e) => {
                  setNewInstrument(e.target.value)
                  if (error) setError('')
                }}
                className={`${styles.input.base} ${
                  error ? styles.input.error : ''
                }`}
                placeholder="Add new instrument..."
              />
              {error && <p className={styles.text.error}>{error}</p>}
            </div>
            <button
              type="button"
              onClick={handleAddInstrument}
              className={styles.button.primary}
            >
              Add
            </button>
          </div>
          
          <div className="mt-4">
            <h4 className={styles.section.subtitle}>Current Instruments:</h4>
            {settings.instruments.length === 0 ? (
              <p className={styles.text.muted}>No instruments added yet</p>
            ) : (
              <ul className="space-y-2">
                {settings.instruments.map(instrument => (
                  <li key={instrument} className={styles.listItem}>
                    <span>{instrument}</span>
                    <button
                      onClick={() => handleDeleteInstrument(instrument)}
                      className={styles.button.danger}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className={styles.section.divider}>
          <h3 className={`${styles.section.title} text-xl`}>Data Management</h3>
          
          <div className={`flex ${styles.spacing.standard}`}>
            <button
              type="button"
              onClick={handleExportData}
              className={styles.button.secondary}
            >
              Export Data
            </button>
            
            <button
              type="button"
              onClick={openFileDialog}
              className={styles.button.secondary}
            >
              Import Data
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportData}
              accept="application/json"
              style={{ display: 'none' }}
            />
          </div>
        </div>
        
        <div className={`flex justify-end ${styles.section.divider}`}>
          <button
            type="button"
            onClick={handleClose}
            className={styles.button.primary}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
} 