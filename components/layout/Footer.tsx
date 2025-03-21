'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-blue-800 dark:bg-blue-900 text-white py-6 mt-auto transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Student Progress Tracker</h3>
            <p className="text-blue-200 text-sm">
              A simple tool to track student progress, manage song libraries, and organize teaching schedules.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-blue-200 hover:text-white text-sm transition-colors duration-200"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/songs" 
                  className="text-blue-200 hover:text-white text-sm transition-colors duration-200"
                >
                  Song Library
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Thanks</h3>
            <p className="text-blue-200 text-sm">
              Thank you for using our Student Progress Tracker application. We hope it helps you organize and improve your teaching experience.
            </p>
          </div>
        </div>
        
        <div className="border-t border-blue-700 mt-6 pt-6 text-center text-blue-200 text-sm">
          <p>© {currentYear} Student Progress Tracker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 