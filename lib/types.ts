// Student type
export interface Student {
  id: string;
  name: string;
  instrument: string;
  grade: string;
  day: string;
  time: string;
  notes: Note[];
  contact?: string;
  currentMaterial?: string;
  attendance: string;
  lastActive: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Note type
export interface Note {
  id: string;
  content: string;
  date: string;
}

// Setting type
export interface Setting {
  id: string;
  name: string;
  value: string;
  type: string;
}

// Song type
export interface Song {
  id: string;
  title: string;
  artist: string;
  keyLetter: string;
  keyModifier?: string;
  keyMode?: string;
  bpm?: number;
  youtubeUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Song update type
export interface SongUpdate {
  title?: string;
  artist?: string;
  keyLetter?: string;
  keyModifier?: string;
  keyMode?: string;
  bpm?: number;
  youtubeUrl?: string;
}

// API response type
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: any;
  source?: 'cache' | 'database';
  count?: number;
  timestamp?: string;
} 