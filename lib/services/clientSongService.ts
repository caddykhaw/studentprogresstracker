import { CacheService, CacheFactory } from './cacheService';
import { Song, SongUpdate, ApiResponse } from '@/lib/types';

// API endpoints
export const API_ENDPOINTS = {
  SONGS: {
    ALL: '/api/songs',
    BY_ID: (id: string) => `/api/songs/${id}`
  }
};

// Client-side song service interface
export interface ClientSongService {
  getSongs(): Promise<Song[]>;
  getSong(id: string): Promise<Song | null>;
  createSong(songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<Song>;
  updateSong(id: string, songUpdate: SongUpdate): Promise<Song | null>;
  deleteSong(id: string): Promise<boolean>;
}

// Client-side song service implementation with caching
export class CachedClientSongService implements ClientSongService {
  private cacheService: CacheService;

  constructor(cacheService: CacheService = CacheFactory.getClientCache()) {
    this.cacheService = cacheService;
  }

  async getSongs(): Promise<Song[]> {
    // Check cache first
    const cacheKey = API_ENDPOINTS.SONGS.ALL;
    const cachedResponse = this.cacheService.get<ApiResponse<Song[]>>(cacheKey);
    
    if (cachedResponse?.data) {
      console.log('Client: Using cached songs data');
      return cachedResponse.data;
    }

    // Fetch from API
    console.log('Client: Fetching songs from API');
    const response = await fetch(cacheKey);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as ApiResponse<Song[]>;
    
    // Cache the result
    this.cacheService.set(cacheKey, data);
    
    return data.data || [];
  }

  async getSong(id: string): Promise<Song | null> {
    // Check cache first
    const cacheKey = API_ENDPOINTS.SONGS.BY_ID(id);
    const cachedResponse = this.cacheService.get<ApiResponse<Song>>(cacheKey);
    
    if (cachedResponse?.data) {
      console.log(`Client: Using cached song data for id ${id}`);
      return cachedResponse.data;
    }

    // Fetch from API
    console.log(`Client: Fetching song from API for id ${id}`);
    const response = await fetch(cacheKey);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as ApiResponse<Song>;
    
    // Cache the result
    this.cacheService.set(cacheKey, data);
    
    return data.data || null;
  }

  async createSong(songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<Song> {
    const response = await fetch(API_ENDPOINTS.SONGS.ALL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(songData)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as ApiResponse<Song>;
    
    // Invalidate cache after creating a song
    this.cacheService.invalidate(API_ENDPOINTS.SONGS.ALL);
    
    if (!data.data) {
      throw new Error('API returned no data');
    }
    
    return data.data;
  }

  async updateSong(id: string, songUpdate: SongUpdate): Promise<Song | null> {
    const response = await fetch(API_ENDPOINTS.SONGS.BY_ID(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(songUpdate)
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as ApiResponse<Song>;
    
    // Invalidate caches
    this.cacheService.invalidate(API_ENDPOINTS.SONGS.BY_ID(id));
    this.cacheService.invalidate(API_ENDPOINTS.SONGS.ALL);
    
    return data.data || null;
  }

  async deleteSong(id: string): Promise<boolean> {
    const response = await fetch(API_ENDPOINTS.SONGS.BY_ID(id), {
      method: 'DELETE'
    });
    
    if (response.status === 404) {
      return false;
    }
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    // Invalidate caches
    this.cacheService.invalidate(API_ENDPOINTS.SONGS.BY_ID(id));
    this.cacheService.invalidate(API_ENDPOINTS.SONGS.ALL);
    
    return true;
  }
}

// Factory for client song service
export class ClientSongServiceFactory {
  private static instance: ClientSongService | null = null;

  static getService(): ClientSongService {
    if (!this.instance) {
      this.instance = new CachedClientSongService();
    }
    return this.instance;
  }
} 