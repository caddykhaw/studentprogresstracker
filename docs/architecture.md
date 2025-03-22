# Student Progress Tracker Architecture

This document outlines the architecture of the Student Progress Tracker application after the refactoring to a more modular, loosely coupled design using dependency injection.

## Architecture Overview

The application follows a layered architecture with clear separation of concerns:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   UI Layer      │────▶│   Service Layer │────▶│   Data Layer    │
│  (Components)   │     │   (Services)    │     │(Repositories/DB)│
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Key Design Patterns

1. **Repository Pattern**: Abstracts data access and provides a clean API for CRUD operations
2. **Dependency Injection**: Services and repositories accept dependencies through their constructors
3. **Factory Pattern**: Factories manage singleton instances of services
4. **Service Layer**: Encapsulates business logic separate from data access
5. **Cache Decorators**: Caching added as a cross-cutting concern

## Component Breakdown

### Database Layer

- **`DatabaseService` Interface**: Defines the contract for database interactions
- **`MongoDBService` Implementation**: MongoDB-specific implementation
- **`DatabaseFactory`**: Creates and manages singleton database instances

### Caching Layer

- **`CacheService` Interface**: Defines generic caching operations
- **`MemoryCacheService` Implementation**: In-memory cache implementation
- **`CacheFactory`**: Creates and manages cache instances for client and server

### Repository Layer

- **`SongRepository` Interface**: Contract for song data operations
- **`CachedSongRepository` Implementation**: Implements repository with caching
- **`SongRepositoryFactory`**: Creates and manages repository instances

### Client Services

- **`ClientSongService` Interface**: Defines client-side song operations
- **`CachedClientSongService` Implementation**: Client-side implementation with caching
- **`ClientSongServiceFactory`**: Creates and manages client service instances

### React Hooks

- **`useSongs` Hook**: Provides React components with song operations and state management

### API Routes

- Clean, thin controllers that delegate to the repository layer

## Dependency Flow

This diagram illustrates the dependency injection flow:

```
┌─────────────┐     ┌───────────────┐     ┌────────────────┐
│             │     │               │     │                │
│   Factory   │────▶│   Service     │────▶│   Interface    │
│             │     │ Implementation│     │                │
└─────────────┘     └───────────────┘     └────────────────┘
      │                    ▲
      │                    │
      │                    │
      ▼                    │
┌─────────────┐     ┌─────────────┐
│             │     │             │
│  Consumer   │────▶│ Dependencies│
│             │     │             │
└─────────────┘     └─────────────┘
```

## Benefits of the New Architecture

1. **Loose Coupling**: Components depend on abstractions, not concrete implementations
2. **Testability**: Easy to mock dependencies for unit testing
3. **Maintainability**: Clear separation of concerns makes code easier to maintain
4. **Flexibility**: Implementations can be swapped out without changing consumers
5. **Scalability**: Independent layers can scale separately as needed

## Usage Examples

### Server-side Example

```typescript
// API route handler
import { SongRepositoryFactory } from '@/lib/services/songRepository';

export async function GET() {
  const songRepository = SongRepositoryFactory.getRepository();
  const songs = await songRepository.findAll();
  
  return NextResponse.json({ data: songs });
}
```

### Client-side Example

```typescript
// React component
import { useSongs } from '@/lib/hooks/useSongs';

export function SongsList() {
  const { songs, loading, error } = useSongs();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {songs.map(song => (
        <div key={song.id}>{song.title} by {song.artist}</div>
      ))}
    </div>
  );
}
```

### Testing Example

```typescript
// Unit test with mocked dependencies
it('should return cached songs when available', async () => {
  // Arrange
  const mockCache = {
    get: jest.fn().mockReturnValue(['song1', 'song2']),
    set: jest.fn(),
    invalidate: jest.fn()
  };
  const mockDb = {
    connect: jest.fn()
  };
  
  const repository = new CachedSongRepository(mockDb, mockCache);
  
  // Act
  const songs = await repository.findAll();
  
  // Assert
  expect(songs).toEqual(['song1', 'song2']);
  expect(mockCache.get).toHaveBeenCalledWith('songs:all');
  expect(mockDb.connect).not.toHaveBeenCalled();
});
``` 