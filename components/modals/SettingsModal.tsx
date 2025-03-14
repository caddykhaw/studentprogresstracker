'use client'

import { useState, useRef } from 'react'
import { useStudentStore } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'
import Modal from './Modal'

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
      } catch (error) {
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
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Instruments</h3>
          
          <div className="flex items-start mb-4">
            <div className="flex-grow mr-2">
              <input
                type="text"
                value={newInstrument}
                onChange={(e) => {
                  setNewInstrument(e.target.value)
                  if (error) setError('')
                }}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  error ? 'border-red-500' : ''
                }`}
                placeholder="Add new instrument..."
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
            <button
              type="button"
              onClick={handleAddInstrument}
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Instruments:</h4>
            {settings.instruments.length === 0 ? (
              <p className="text-gray-500 italic">No instruments added yet</p>
            ) : (
              <ul className="space-y-2">
                {settings.instruments.map(instrument => (
                  <li key={instrument} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{instrument}</span>
                    <button
                      onClick={() => handleDeleteInstrument(instrument)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Data Management</h3>
          
          <button
            type="button"
            onClick={handleExportData}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Export Data
          </button>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={openFileDialog}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
        
        <div className="flex justify-end pt-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
} 