import { ObjectId } from 'mongodb';

export interface Student {
  id: string;
  name: string;
  instrument: string;
  grade: string;
  day: string;
  time: string;
  contact?: string;
  currentMaterial?: string;
  notes: Note[];
  lastActive?: string;
  attendance?: string;
}

export interface Note {
  id: string;
  content: string;
  date: string;
}

export interface Settings {
  instruments: string[];
}

// Type for creating a new student (client-side)
export interface StudentCreate {
  name: string;
  grade: string;
  attendance?: string;
  lastActive?: string;
}

// Type for updating a student
export interface StudentUpdate extends Partial<StudentCreate> {
  id: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  stack?: string;
}

// Type for logging
export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
} 