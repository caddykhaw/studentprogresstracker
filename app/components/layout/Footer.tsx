export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 w-full">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Student Progress Tracker
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Made with ❤️ for music teachers
          </p>
        </div>
      </div>
    </footer>
  )
} 