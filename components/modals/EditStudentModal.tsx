'use client'

import { useState, useEffect } from 'react'
import { useStudentStore } from '@/store/useStudentStore'
import { useUIStore } from '@/store/useUIStore'
import Modal from './Modal'

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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : ''
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        
        <div>
          <label htmlFor="instrument" className="block text-sm font-medium text-gray-700">
            Instrument <span className="text-red-500">*</span>
          </label>
          <select
            id="instrument"
            name="instrument"
            value={formData.instrument}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.instrument ? 'border-red-500' : ''
            }`}
          >
            <option value="">Select an instrument</option>
            {settings.instruments.map(instrument => (
              <option key={instrument} value={instrument}>
                {instrument}
              </option>
            ))}
          </select>
          {errors.instrument && <p className="mt-1 text-sm text-red-600">{errors.instrument}</p>}
        </div>
        
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
            Grade/Level
          </label>
          <input
            type="text"
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., Beginner, Intermediate, Grade 5"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="day" className="block text-sm font-medium text-gray-700">
              Lesson Day <span className="text-red-500">*</span>
            </label>
            <select
              id="day"
              name="day"
              value={formData.day}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.day ? 'border-red-500' : ''
              }`}
            >
              {days.map(day => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            {errors.day && <p className="mt-1 text-sm text-red-600">{errors.day}</p>}
          </div>
          
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Lesson Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.time ? 'border-red-500' : ''
              }`}
            />
            {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
          </div>
        </div>
        
        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
            Contact Information
          </label>
          <input
            type="text"
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Phone number or email"
          />
        </div>
        
        <div>
          <label htmlFor="currentMaterial" className="block text-sm font-medium text-gray-700">
            Current Material
          </label>
          <textarea
            id="currentMaterial"
            name="currentMaterial"
            value={formData.currentMaterial}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Books, pieces, or exercises the student is working on"
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  )
} 