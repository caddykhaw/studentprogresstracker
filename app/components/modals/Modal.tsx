'use client'

import { Fragment, useRef, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'md' | 'lg' | 'xl' // New size prop with default medium
  showCloseButton?: boolean // New prop to control close button visibility
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', // Default to medium size
  showCloseButton = true // Default to showing close button
}: ModalProps) {
  const cancelButtonRef = useRef(null)

  // Size classes mapping
  const sizeClasses = {
    md: 'sm:max-w-lg',      // Default size
    lg: 'sm:max-w-3xl',     // Wide size for notes
    xl: 'sm:max-w-5xl'      // Extra wide if needed
  }

  // Close modal with escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel 
                className={`relative transform overflow-hidden rounded-lg bg-bg-light dark:bg-bg-dark text-left shadow-xl transition-all sm:my-8 sm:w-full ${sizeClasses[size]}`}
              >
                <div className="bg-bg-light dark:bg-bg-dark px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  {showCloseButton && (
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                      <button
                        type="button"
                        className="rounded-md bg-bg-light dark:bg-bg-dark text-text-muted-dark hover:text-text-dark dark:hover:text-text-muted-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark transition-colors"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-text-dark dark:text-text-light mb-4"
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">{children}</div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 