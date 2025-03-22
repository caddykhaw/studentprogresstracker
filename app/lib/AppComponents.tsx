// This file helps with component registration and simplifies imports
// Export all components from a central location

export { default as StatsSection } from '../features/dashboard/StatsSection';
export { ThemeToggle } from '../components/ui/ThemeToggle';

// Add other component exports as needed 
export { default as Header } from '../components/layout/Header';
export { default as Modal } from '../components/modals/Modal';

// Feature components
export { default as TodaySchedule } from '../features/dashboard/TodaySchedule';
export { default as TodaysLessons } from '../features/dashboard/TodaysLessons';
export { default as StudentList } from '../features/students/StudentList';
export { default as StudentNotes } from '../features/students/StudentNotes';

// Modal components
export { default as AddStudentModal } from '../features/students/modals/AddStudentModal';
export { default as EditStudentModal } from '../features/students/modals/EditStudentModal';
export { default as StudentProfileModal } from '../features/students/modals/StudentProfileModal';
export { default as AddNoteModal } from '../features/students/modals/AddNoteModal';
export { default as EditNoteModal } from '../features/students/modals/EditNoteModal';
export { default as SettingsModal } from '../features/dashboard/modals/SettingsModal'; 