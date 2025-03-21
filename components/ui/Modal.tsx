'use client'

import { Dialog } from '@headlessui/react'
import { ReactNode, useEffect, useId, useCallback } from 'react'

// Global modal stack to track open modals
if (typeof window !== 'undefined') {
  window.modalStack = window.modalStack || [];
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  priority?: number // Optional priority (higher = shown on top)
}

export default function Modal({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  size = 'md',
  priority = 0 
}: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
    'full': 'w-[95%]'
  }
  
  const modalId = useId();
  
  // Calculate z-index based on modal stack
  const getZIndex = useCallback(() => {
    if (typeof window === 'undefined') return 50;
    
    const baseZIndex = 50;
    const index = window.modalStack.indexOf(modalId);
    
    // If not found in stack or not open, use base z-index
    if (index === -1 || !isOpen) return baseZIndex;
    
    // Calculate z-index based on position in stack (and add priority)
    return baseZIndex + (index * 10) + priority;
  }, [modalId, isOpen, priority]);

  // Handle ESC key
  const handleClose = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Only close if this is the top-most modal
    if (window.modalStack.length > 0 && window.modalStack[window.modalStack.length - 1] === modalId) {
      onClose();
    }
  }, [modalId, onClose]);
  
  // Add global keyboard event listener
  useEffect(() => {
    if (typeof window === 'undefined' || !isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // First check if there's an embedded YouTube video playing
        const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com/embed"]');
        
        if (youtubeIframes.length > 0) {
          // Get the topmost YouTube iframe based on z-index/DOM position
          // We're assuming the highest in the DOM is likely the one we want to close
          const video = youtubeIframes[youtubeIframes.length - 1];
          // Check if the video is visible
          const videoContainer = video.closest('.fixed');
          
          if (videoContainer) {
            // Find and click its close button
            const closeButton = videoContainer.querySelector('button');
            if (closeButton) {
              e.preventDefault();
              e.stopPropagation();
              closeButton.click();
              return; // Stop here, don't close the modal
            }
          }
        }
        
        // If no video to close, then check if this is the top modal
        const topModalId = window.modalStack[window.modalStack.length - 1];
        
        // Only close if this is the top modal
        if (topModalId === modalId) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }
    };
    
    // Add event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, modalId, onClose]);
  
  // Manage modal stack
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (isOpen) {
      // Add this modal to the stack if not already present
      if (!window.modalStack.includes(modalId)) {
        window.modalStack.push(modalId);
      }
    } else {
      // Remove this modal from the stack
      window.modalStack = window.modalStack.filter(id => id !== modalId);
    }
    
    return () => {
      // Cleanup on unmount
      if (typeof window !== 'undefined') {
        window.modalStack = window.modalStack.filter(id => id !== modalId);
      }
    };
  }, [isOpen, modalId]);
  
  const zIndex = getZIndex();

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="relative"
      style={{ zIndex }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30" 
        aria-hidden="true"
        style={{ zIndex: zIndex - 1 }} 
      />
      
      {/* Full-screen container */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex }}
      >
        <Dialog.Panel className={`w-full ${sizeClasses[size]} rounded-lg bg-white dark:bg-gray-800 max-h-[90vh] flex flex-col`}>
          <Dialog.Title className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{title}</div>
          </Dialog.Title>
          
          <div className="p-6 overflow-y-auto">
            {children}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 
