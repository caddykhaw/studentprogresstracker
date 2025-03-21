'use client';

import { useState, FormEvent } from 'react';
import { Song, SongCreate } from '@/lib/types';
import Modal from '@/components/ui/Modal';

// Initial form state
const initialFormState: SongCreate = {
  title: '',
  artist: '',
  bpm: undefined,
  keyLetter: undefined,
  keyModifier: undefined,
  keyMode: 'major',
  youtubeUrl: '',
};

interface SongFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SongCreate) => Promise<void>;
  song?: Song; // If provided, edit mode
  priority?: number; // Modal priority for stacking
}

export default function SongForm({ isOpen, onClose, onSubmit, song, priority }: SongFormProps) {
  const [formData, setFormData] = useState<SongCreate>(song || initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditMode = !!song;
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value ? parseInt(value) : undefined,
      });
      return;
    }
    
    // Handle empty strings
    if (value === '') {
      setFormData({
        ...formData,
        [name]: undefined,
      });
      return;
    }
    
    // Handle all other inputs
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Song' : 'Add New Song'}
      size="md"
      priority={priority}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          {/* Artist */}
          <div>
            <label htmlFor="artist" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Artist
            </label>
            <input
              type="text"
              id="artist"
              name="artist"
              value={formData.artist || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          {/* Key */}
          <div className="flex space-x-2">
            <div className="flex-1">
              <label htmlFor="keyLetter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Key
              </label>
              <select
                id="keyLetter"
                name="keyLetter"
                value={formData.keyLetter || ''}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">-- Select --</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="G">G</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label htmlFor="keyModifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Modifier
              </label>
              <select
                id="keyModifier"
                name="keyModifier"
                value={formData.keyModifier || ''}
                onChange={handleChange}
                disabled={!formData.keyLetter}
                className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">Natural</option>
                <option value="♯">Sharp (♯)</option>
                <option value="♭">Flat (♭)</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label htmlFor="keyMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mode
              </label>
              <select
                id="keyMode"
                name="keyMode"
                value={formData.keyMode || 'major'}
                onChange={handleChange}
                disabled={!formData.keyLetter}
                className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="major">Major</option>
                <option value="minor">Minor</option>
              </select>
            </div>
          </div>
          
          {/* BPM */}
          <div>
            <label htmlFor="bpm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              BPM
            </label>
            <input
              type="number"
              id="bpm"
              name="bpm"
              min="1"
              max="300"
              value={formData.bpm || ''}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          {/* YouTube URL */}
          <div>
            <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              YouTube URL
            </label>
            <input
              type="url"
              id="youtubeUrl"
              name="youtubeUrl"
              value={formData.youtubeUrl || ''}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.title}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Song' : 'Add Song')}
          </button>
        </div>
      </form>
    </Modal>
  );
} 