# MongoDB to Turso Migration Plan

## Overview
This document outlines the step-by-step plan to migrate the Student Progress Tracker application's database from MongoDB to Turso. The migration will be done in phases to ensure data safety and minimal disruption.

## Table of Contents
1. [Phase 1: Data Backup](#phase-1-data-backup)
2. [Phase 2: Turso Setup](#phase-2-turso-setup)
3. [Phase 3: Schema Migration](#phase-3-schema-migration)
4. [Phase 4: Data Migration](#phase-4-data-migration)
5. [Phase 5: Application Updates](#phase-5-application-updates)
6. [Testing & Verification](#testing--verification)
7. [Rollback Plan](#rollback-plan)

## Phase 1: Data Backup

### Implemented Backup Solution
We have implemented a comprehensive backup solution in `scripts/download-mongodb-data.ts` that:
- Backs up all collections from MongoDB
- Creates timestamped backups
- Maintains both raw and readable formats
- Generates detailed metadata
- Creates a 'latest' symlink for easy access

### Running the Backup
```bash
# Install dependencies if needed
npm install mongodb

# Run the backup script
npm run download-mongodb
```

### Backup Structure
```
mongodb-backup/
├── 2024-03-22T12-34-56-789Z/    # Timestamped backup
│   ├── songs.json               # Human-readable format
│   ├── songs.raw.json          # Raw MongoDB format
│   ├── students.json           # (if exists)
│   ├── students.raw.json       # (if exists)
│   └── metadata.json           # Backup information
└── latest -> 2024-03-22T12-34-56-789Z/  # Latest backup link
```

## Phase 2: Turso Setup

### Installation
```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Install required dependencies
npm install @libsql/client drizzle-orm
npm install -D drizzle-kit
```

### Database Creation
```bash
# Create a new Turso database
turso db create student-progress-tracker

# Get the database URL
turso db show student-progress-tracker

# Create auth token
turso db tokens create student-progress-tracker
```

### Environment Setup
```env
# Add to .env.local
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=your_auth_token
```

## Phase 3: Schema Migration

### Schema Definition
```typescript
// db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const songs = sqliteTable('songs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  keyLetter: text('key_letter').notNull(),
  keyModifier: text('key_modifier'),
  keyMode: text('key_mode').default('major'),
  bpm: integer('bpm'),
  youtubeUrl: text('youtube_url'),
  createdAt: integer('created_at').notNull().$defaultFn(() => Date.now()),
  updatedAt: integer('updated_at').notNull().$defaultFn(() => Date.now())
});

// Add other tables as needed based on metadata.json
```

### Migration Script
```bash
# Generate migration
npm run generate-migration

# Apply migration
npm run migrate
```

## Phase 4: Data Migration

### Steps
1. Read backup data from `mongodb-backup/latest`
2. Transform data to match Turso schema
3. Import data in batches
4. Verify data integrity

### Migration Script Structure
```typescript
// scripts/migrate-to-turso.ts
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../db/schema';

async function migrateToTurso() {
  // Implementation coming soon
}
```

## Phase 5: Application Updates

### Repository Layer
1. Create new Turso repository implementation
2. Update repository factory
3. Add new database utilities

### API Routes
1. Update API routes to use new repository
2. Enhance error handling
3. Add performance monitoring

### Environment Updates
1. Update environment variables
2. Add database connection pooling
3. Configure caching strategy

## Testing & Verification

### Automated Tests
1. Unit tests for new repository
2. Integration tests for API routes
3. Performance comparison tests

### Manual Testing
1. Verify all CRUD operations
2. Check data consistency
3. Test error scenarios

### Performance Testing
1. Response time comparison
2. Connection handling
3. Query optimization

## Rollback Plan

### Triggers
- Critical performance issues
- Data inconsistency
- Unresolved bugs

### Rollback Steps
1. Switch back to MongoDB repository
2. Verify MongoDB connection
3. Run application tests
4. Monitor performance

## Success Criteria
1. All data successfully migrated
2. All tests passing
3. Equal or better performance
4. Zero data loss
5. All features working as expected

## Timeline
- Day 1: Backup & Turso Setup
- Day 2: Schema Migration & Testing
- Day 3: Data Migration & Verification
- Day 4: Application Updates
- Day 5: Testing & Deployment

## Next Steps
- [ ] Create Turso database
- [ ] Generate schema migrations
- [ ] Implement data migration script
- [ ] Update application code
- [ ] Run comprehensive tests 