# API Caching and Optimization

This document outlines the caching strategy implemented in the Student Progress Tracker to minimize redundant API calls and improve performance.

## Overview

The application implements a two-level caching strategy:

1. **Server-side caching**: Implemented in API route handlers to reduce database calls
2. **Client-side caching**: Implemented in the frontend to reduce API calls

## Server-Side Caching

The API routes use an in-memory cache to temporarily store database query results.

### How it works:

1. When an API endpoint is called, it first checks if the requested data exists in the cache
2. If found and not expired, it returns the cached data without querying the database
3. If not found, it fetches from the database, stores the result in cache, then returns it
4. When data is modified (via POST, PUT, DELETE), related cache entries are automatically invalidated

### Configuration:

- Default cache duration: 30 seconds (for most data), 60 seconds (for relatively static data)
- Cache keys follow a pattern: `collection:id` (e.g., `songs:id:123`)

## Client-Side Caching

The frontend uses a utility function `fetchWithCache` to avoid making redundant API calls.

### How to use:

```typescript
import { fetchWithCache, API_ENDPOINTS } from '@/lib/utils';

// Instead of:
// const response = await fetch('/api/songs');
// const data = await response.json();

// Use:
const data = await fetchWithCache(API_ENDPOINTS.SONGS.ALL);
```

### Configuration:

- Default client cache duration: 5 seconds
- Cache keys are the full API URLs

## Benefits

- Reduced database load
- Faster response times
- Less network traffic
- Improved user experience

## Best Practices

1. **Use API_ENDPOINTS constants**: Use the constants in `lib/utils.ts` for API URLs to ensure consistency
2. **Consider cache duration**: For static data, increase cache duration; for frequently updated data, reduce it
3. **Invalidate cache when needed**: After data mutations, invalidate relevant cache entries
4. **Consider state management**: For complex applications, combine this with a state management solution like React Query or SWR

## Examples

### Fetching all songs with caching:

```typescript
import { fetchWithCache, API_ENDPOINTS } from '@/lib/utils';

async function getSongs() {
  const response = await fetchWithCache(API_ENDPOINTS.SONGS.ALL);
  return response.data;
}
```

### Fetching individual song with caching:

```typescript
import { fetchWithCache, API_ENDPOINTS } from '@/lib/utils';

async function getSong(id: string) {
  const response = await fetchWithCache(API_ENDPOINTS.SONGS.BY_ID(id));
  return response.data;
}
```

### Creating a song and invalidating cache:

```typescript
import { invalidateClientCache, API_ENDPOINTS } from '@/lib/utils';

async function createSong(songData) {
  const response = await fetch(API_ENDPOINTS.SONGS.ALL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(songData)
  });
  
  // Invalidate songs cache after creating a new song
  invalidateClientCache('^/api/songs');
  
  return response.json();
}
``` 