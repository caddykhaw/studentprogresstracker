// This file helps with component registration and simplifies imports
// Export all components from a central location

// UI Components
export { default as Modal } from '../components/ui/Modal';
export { default as ThemeToggle } from '../components/ui/ThemeToggle';

// Layout Components
export { default as Header } from '../components/layout/Header';
export { default as Providers } from '../components/layout/Providers';

// Student Components
export { default as StudentList } from '../components/students/StudentList';
export { default as StudentNotes } from '../components/students/StudentNotes';
export { default as TodaySchedule } from '../components/students/TodaySchedule';
export { default as TodaysLessons } from '../components/students/TodaysLessons';
export { default as StatsSection } from '../components/students/StatsSection';

// Modal Components
export { default as AddStudentModal } from '../components/modals/AddStudentModal';
export { default as EditStudentModal } from '../components/modals/EditStudentModal';
export { default as StudentProfileModal } from '../components/modals/StudentProfileModal';
export { default as AddNoteModal } from '../components/modals/AddNoteModal';
export { default as EditNoteModal } from '../components/modals/EditNoteModal';
export { default as SettingsModal } from '../components/modals/SettingsModal';

// Add other component exports as needed 
