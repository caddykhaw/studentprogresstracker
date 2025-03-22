'use client'

import { useState, useEffect } from 'react'
import { useStudentStore } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'
import Modal from '@/app/components/modals/Modal'

export default function EditStudentModal() {
  const isOpen = useUIStore(state => state.editStudentModalOpen)
  const setIsOpen = useUIStore(state => state.setEditStudentModalOpen)
  
  const { updateStudent, settings, students, currentStudentId } = useStudentStore()
  
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
  
  // Load current student data when modal opens
  useEffect(() => {
    if (isOpen && currentStudentId) {
      const student = students.find(s => s.id === currentStudentId)
      if (student) {
        setFormData({
          name: student.name,
          instrument: student.instrument,
          grade: student.grade || '',
          day: student.day,
          time: student.time,
          contact: student.contact || '',
          currentMaterial: student.currentMaterial || ''
        })
      }
    }
  }, [isOpen, currentStudentId, students])
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !currentStudentId) return
    
    const currentStudent = students.find(s => s.id === currentStudentId)
    if (!currentStudent) return
    
    updateStudent({
      ...currentStudent,
      name: formData.name.trim(),
      instrument: formData.instrument,
      grade: formData.grade,
      day: formData.day,
      time: formData.time.trim(),
      contact: formData.contact.trim(),
      currentMaterial: formData.currentMaterial.trim()
    })
    
    handleClose()
  }
  
  const handleClose = () => {
    setIsOpen(false)
    setErrors({})
  }
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Student">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className={`mt-1 block w-full rounded-md border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-dark dark:text-text-light shadow-sm focus:border-primary focus:ring-primary ${
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
            className={`mt-1 block w-full rounded-md border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-dark dark:text-text-light shadow-sm focus:border-primary focus:ring-primary ${
              errors.instrument ? 'border-error' : ''
            }`}
          >
            <option value="">Select an instrument</option>
            {settings.instruments.map(instrument => (
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
            className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-dark dark:text-text-light shadow-sm focus:border-primary focus:ring-primary"
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
              className={`mt-1 block w-full rounded-md border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-dark dark:text-text-light shadow-sm focus:border-primary focus:ring-primary ${
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
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-dark dark:text-text-light shadow-sm focus:border-primary focus:ring-primary ${
                errors.time ? 'border-error' : ''
              }`}
            />
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
            className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-dark dark:text-text-light shadow-sm focus:border-primary focus:ring-primary"
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
            className="mt-1 block w-full rounded-md border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-text-dark dark:text-text-light shadow-sm focus:border-primary focus:ring-primary"
            placeholder="Books, pieces, or exercises the student is working on"
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark px-4 py-2 text-sm font-medium text-text-dark dark:text-text-light shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md border border-transparent bg-primary hover:bg-primary-dark px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  )
} 