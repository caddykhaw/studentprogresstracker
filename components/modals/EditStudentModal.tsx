'use client'

import { useState, useEffect, useCallback } from 'react'
import { useStudentStore } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import Modal from '../ui/Modal'

export default function EditStudentModal() {
  const isOpen = useUIStore(state => state.isEditStudentModalOpen)
  const closeModal = useUIStore(state => state.closeEditStudentModal)
  const selectedStudentId = useUIStore(state => state.selectedStudentId)
  
  const { updateStudent, students } = useStudentStore()
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
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  
  // Load current student data when modal opens - with optimization
  useEffect(() => {
    if (isOpen && selectedStudentId) {
      const student = students.find(s => s.id === selectedStudentId)
      if (student) {
        // Use a timeout to prevent layout thrashing during modal transition
        const timerId = setTimeout(() => {
          setFormData({
            name: student.name,
            instrument: student.instrument || '',
            grade: student.grade || '',
            day: student.day || 'Monday',
            time: student.time || '',
            contact: student.contact || '',
            currentMaterial: student.currentMaterial || ''
          })
        }, 50) // Small delay to avoid layout thrashing
        
        return () => clearTimeout(timerId)
      }
    }
  }, [isOpen, selectedStudentId, students])
  
  // Memoized change handler to avoid re-creating on every render
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    
    // Clear any API error when user makes changes
    if (apiError) {
      setApiError(null)
    }
  }, [errors, apiError])
  
  const validateForm = useCallback(() => {
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
  }, [formData])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !selectedStudentId) return
    
    const currentStudent = students.find(s => s.id === selectedStudentId)
    if (!currentStudent) return
    
    setIsLoading(true)
    setApiError(null)
    
    try {
      // Prepare updated student data
      const updatedStudent = {
        ...currentStudent,
        name: formData.name.trim(),
        instrument: formData.instrument,
        grade: formData.grade,
        day: formData.day,
        time: formData.time.trim(),
        contact: formData.contact.trim(),
        currentMaterial: formData.currentMaterial.trim()
      }
      
      // Update student in store and database
      const result = await updateStudent(updatedStudent)
      console.log('Student updated successfully:', result)
      handleClose()
    } catch (error) {
      console.error('Error updating student:', error)
      setApiError('Failed to update student. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleClose = () => {
    closeModal()
    setErrors({})
    setApiError(null)
    setIsLoading(false)
  }
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Student">
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
            disabled={isLoading}
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
            {instruments.map(instrument => (
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
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
} 
