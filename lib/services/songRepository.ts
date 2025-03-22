import { DatabaseService, DatabaseFactory } from './databaseService';
import { CacheService, CacheFactory } from './cacheService';
import { Song, SongUpdate } from '@/lib/types';

// Repository interface
export interface SongRepository {
  findAll(): Promise<Song[]>;
  findById(id: string): Promise<Song | null>;
  create(song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<Song>;
  update(id: string, songUpdate: SongUpdate): Promise<Song | null>;
  delete(id: string): Promise<boolean>;
}

// Cache keys object
export const SONG_CACHE_KEYS = {
  ALL_SONGS: 'songs:all',
  SONG_BY_ID: (id: string) => `songs:id:${id}`
};

// MongoDB repository implementation with caching
export class CachedSongRepository implements SongRepository {
  private dbService: DatabaseService;
  private cacheService: CacheService;
  private collectionName: string = 'songs';

  constructor(
    dbService: DatabaseService = DatabaseFactory.getDatabase(),
    cacheService: CacheService = CacheFactory.getServerCache()
  ) {
    this.dbService = dbService;
    this.cacheService = cacheService;
  }

  async findAll(): Promise<Song[]> {
    // Check cache first
    const cachedSongs = this.cacheService.get<Song[]>(SONG_CACHE_KEYS.ALL_SONGS);
    if (cachedSongs) {
      console.log('Repository: Returning cached songs data');
      return cachedSongs;
    }

    // If not in cache, get from database
    console.log('Repository: Fetching songs from database');
    const { db } = await this.dbService.connect();
    const songs = await db.collection<Song>(this.collectionName).find({}).toArray();
    
    // Increase cache duration to 5 minutes to reduce database load
    this.cacheService.set(SONG_CACHE_KEYS.ALL_SONGS, songs, 5 * 60 * 1000);
    
    return songs;
  }

  async findById(id: string): Promise<Song | null> {
    // Check cache first
    const cacheKey = SONG_CACHE_KEYS.SONG_BY_ID(id);
    const cachedSong = this.cacheService.get<Song>(cacheKey);
    
    if (cachedSong) {
      console.log(`Repository: Returning cached song data for id ${id}`);
      return cachedSong;
    }
    
    // If not in cache, get from database
    const { db } = await this.dbService.connect();
    const song = await db.collection<Song>(this.collectionName).findOne({ id }) as Song | null;
    
    if (song) {
      // Cache the result for future requests (cache for 1 minute)
      this.cacheService.set(cacheKey, song, 60 * 1000);
    }
    
    return song;
  }

  async create(songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<Song> {
    const { db } = await this.dbService.connect();
    
    // Create new song object
    const newSong: Song = {
      id: crypto.randomUUID(),
      ...songData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection<Song>(this.collectionName).insertOne(newSong);
    
    // Invalidate the cache after adding a new song
    this.cacheService.invalidate(SONG_CACHE_KEYS.ALL_SONGS);
    
    return newSong;
  }

  async update(id: string, songUpdate: SongUpdate): Promise<Song | null> {
    const { db } = await this.dbService.connect();
    
    // Check if song exists
    const existingSong = await db.collection<Song>(this.collectionName).findOne({ id });
    
    if (!existingSong) {
      return null;
    }
    
    // Update fields
    const updateData: Partial<Song> = {
      ...songUpdate,
      updatedAt: new Date()
    };
    
    await db.collection<Song>(this.collectionName).updateOne(
      { id },
      { $set: updateData }
    );
    
    // Get updated song
    const updatedSong = await db.collection<Song>(this.collectionName).findOne({ id }) as Song;
    
    // Invalidate caches
    this.cacheService.invalidate(SONG_CACHE_KEYS.SONG_BY_ID(id));
    this.cacheService.invalidate(SONG_CACHE_KEYS.ALL_SONGS);
    
    return updatedSong;
  }

  async delete(id: string): Promise<boolean> {
    const { db } = await this.dbService.connect();
    
    // Check if song exists
    const existingSong = await db.collection<Song>(this.collectionName).findOne({ id });
    
    if (!existingSong) {
      return false;
    }
    
    // Delete song
    await db.collection<Song>(this.collectionName).deleteOne({ id });
    
    // Invalidate caches
    this.cacheService.invalidate(SONG_CACHE_KEYS.SONG_BY_ID(id));
    this.cacheService.invalidate(SONG_CACHE_KEYS.ALL_SONGS);
    
    return true;
  }
}

// Repository factory
export class SongRepositoryFactory {
  private static instance: SongRepository | null = null;

  static getRepository(): SongRepository {
    if (!this.instance) {
      this.instance = new CachedSongRepository();
    }
    return this.instance;
  }
} 