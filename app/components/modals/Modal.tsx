'use client'

import { Dialog } from '@headlessui/react'
import { ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({ isOpen, onClose, children, title, size = 'md' }: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-3xl'
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`w-full ${sizeClasses[size]} rounded-lg bg-white dark:bg-gray-800`}>
          <Dialog.Title className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{title}</div>
          </Dialog.Title>
          
          <div className="p-6">
            {children}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 
