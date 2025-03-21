'use client'

import { useState, useEffect } from 'react'
import { useStudentStore } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Student, Note } from '@/lib/types'
import Modal from '../ui/Modal'

export default function AddStudentModal() {
  const isOpen = useUIStore(state => state.isAddStudentModalOpen)
  const closeModal = useUIStore(state => state.closeAddStudentModal)
  
  const { addStudent } = useStudentStore()
  const { instruments } = useSettingsStore()
  
  const [formData, setFormData] = useState({
    name: '',
    instrument: '',
    grade: '',
    day: 'Monday',
    time: '',
    contact: '',
    currentMaterial: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Add loading state for better UX
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.instrument) {
      newErrors.instrument = 'Instrument is required'
    }
    
    if (!formData.day) {
      newErrors.day = 'Lesson day is required'
    }
    
    if (!formData.time.trim()) {
      newErrors.time = 'Lesson time is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setApiError(null)
    
    try {
      const newStudent: Student = {
        id: crypto.randomUUID(),
        name: formData.name.trim(),
        instrument: formData.instrument,
        grade: formData.grade || '',
        day: formData.day,
        time: formData.time,
        notes: [],
        contact: formData.contact || '',
        currentMaterial: formData.currentMaterial || '',
        attendance: 'Present',
        lastActive: 'Today',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      await addStudent(newStudent)
      handleClose()
    } catch (error) {
      console.error('Error adding student:', error)
      setApiError('Failed to add student. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleClose = () => {
    closeModal()
    setFormData({
      name: '',
      instrument: '',
      grade: '',
      day: 'Monday',
      time: '',
      contact: '',
      currentMaterial: ''
    })
    setErrors({})
    setApiError(null)
  }
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Student">
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <div className="px-4 py-3 rounded-md bg-red-50 text-red-800 text-sm">
            <p>{apiError}</p>
          </div>
        )}
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-dark dark:text-text-light">
            Name <span className="text-error">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-border-light dark:border-border-dark shadow-sm focus:border-primary focus:ring-primary ${
              errors.name ? 'border-error' : ''
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-error">{errors.name}</p>}
        </div>
        
        <div>
          <label htmlFor="instrument" className="block text-sm font-medium text-text-dark dark:text-text-light">
            Instrument <span className="text-error">*</span>
          </label>
          <select
            id="instrument"
            name="instrument"
            value={formData.instrument}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-border-light dark:border-border-dark shadow-sm focus:border-primary focus:ring-primary ${
              errors.instrument ? 'border-error' : ''
            }`}
          >
            <option value="">Select an instrument</option>
            {instruments?.map((instrument: string) => (
              <option key={instrument} value={instrument}>
                {instrument}
              </option>
            ))}
          </select>
          {errors.instrument && <p className="mt-1 text-sm text-error">{errors.instrument}</p>}
        </div>
        
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-text-dark dark:text-text-light">
            Grade/Level
          </label>
          <select
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="">Select a grade/level</option>
            <option value="Beginner">Beginner</option>
            <option value="Grade 1">Grade 1</option>
            <option value="Grade 2">Grade 2</option>
            <option value="Grade 3">Grade 3</option>
            <option value="Grade 4">Grade 4</option>
            <option value="Grade 5">Grade 5</option>
            <option value="Grade 6">Grade 6</option>
            <option value="Grade 7">Grade 7</option>
            <option value="Grade 8">Grade 8</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="day" className="block text-sm font-medium text-text-dark dark:text-text-light">
              Lesson Day <span className="text-error">*</span>
            </label>
            <select
              id="day"
              name="day"
              value={formData.day}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-border-light dark:border-border-dark shadow-sm focus:border-primary focus:ring-primary ${
                errors.day ? 'border-error' : ''
              }`}
            >
              {days.map(day => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            {errors.day && <p className="mt-1 text-sm text-error">{errors.day}</p>}
          </div>
          
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-text-dark dark:text-text-light">
              Lesson Time <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                id="hour"
                name="hour"
                value={formData.time.split(':')[0] || ''}
                onChange={(e) => {
                  const hour = e.target.value.padStart(2, '0')
                  const currentMinute = formData.time.split(':')[1] || '00'
                  setFormData(prev => ({ ...prev, time: `${hour}:${currentMinute}` }))
                }}
                className={`mt-1 block w-full rounded-md border-border-light dark:border-border-dark shadow-sm focus:border-primary focus:ring-primary`}
              >
                <option value="">Hour</option>
                {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                  <option key={hour} value={hour.toString().padStart(2, '0')}>
                    {hour.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
              <select
                id="minute"
                name="minute"
                value={formData.time.split(':')[1] || ''}
                onChange={(e) => {
                  const currentHour = formData.time.split(':')[0] || '00'
                  setFormData(prev => ({ ...prev, time: `${currentHour}:${e.target.value}` }))
                }}
                className={`mt-1 block w-full rounded-md border-border-light dark:border-border-dark shadow-sm focus:border-primary focus:ring-primary`}
              >
                <option value="">Min</option>
                <option value="00">00</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
              </select>
            </div>
            {errors.time && <p className="mt-1 text-sm text-error">{errors.time}</p>}
          </div>
        </div>
        
        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-text-dark dark:text-text-light">
            Contact Information
          </label>
          <input
            type="text"
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark shadow-sm focus:border-primary focus:ring-primary"
            placeholder="Phone number or email"
          />
        </div>
        
        <div>
          <label htmlFor="currentMaterial" className="block text-sm font-medium text-text-dark dark:text-text-light">
            Current Material
          </label>
          <textarea
            id="currentMaterial"
            name="currentMaterial"
            value={formData.currentMaterial}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark shadow-sm focus:border-primary focus:ring-primary"
            placeholder="Books, pieces, or exercises the student is working on"
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-4 py-2 text-sm font-medium text-text-dark dark:text-text-light shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md border border-transparent bg-primary hover:bg-primary-dark px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : 'Add Student'}
          </button>
        </div>
      </form>
    </Modal>
  )
} 
