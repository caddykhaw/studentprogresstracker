# Student Progress Tracker

A Next.js application for tracking student progress in music lessons.

## Architecture

This application follows a clean, modular architecture using the repository pattern and dependency injection. The key architectural principles include:

- **Separation of Concerns**: Clear boundaries between UI, business logic, and data access
- **Dependency Injection**: Components receive their dependencies rather than creating them
- **Repository Pattern**: Data access is abstracted behind repository interfaces
- **Caching Strategy**: Two-level caching (server-side and client-side)

See the [architecture documentation](./docs/architecture.md) for more details.

## Features

- Manage student information (name, instrument, grade, lesson day and time)
- Track student progress with notes
- View today's lessons at a glance
- Manage instruments through settings
- Export and import data for backup and transfer

## Tech Stack

- **Nuxt.js 3**: Vue.js framework for building modern web applications
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Pinia**: State management for Vue.js applications
- **Local Storage**: For data persistence

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://...
   ```
4. Run the development server:
   ```
   npm run dev
   ```

## Key Features

- Student management
- Music library with songs
- Progress tracking
- Performance analytics
- Import/Export functionality

## Project Structure

```
├── app/                # Next.js App Router
│   ├── api/            # API routes
│   └── components/     # UI components
│
├── lib/                # Core application code
│   ├── hooks/          # React hooks
│   ├── services/       # Service layer
│   │   ├── cacheService.ts        # Caching functionality
│   │   ├── databaseService.ts     # Database connectivity
│   │   ├── songRepository.ts      # Song data access
│   │   └── clientSongService.ts   # Client-side API service
│   ├── types.ts        # TypeScript type definitions
│   └── utils.ts        # Utility functions
│
└── docs/               # Documentation
    ├── architecture.md  # Architecture documentation
    └── api-caching.md   # API caching documentation
```

## API Structure

The application uses a RESTful API structure for data access. API routes are designed to be thin controllers that delegate to the repository layer, which handles data access and caching.

## Contributing

1. Follow the existing architecture and patterns
2. Use interfaces for dependency injection
3. Write tests for new features
4. Document architecture decisions

## Troubleshooting

If you encounter a 503 Service Unavailable error:

1. Delete the `.nuxt`, `.output`, and `node_modules` directories:
   ```bash
   rm -rf .nuxt .output node_modules
   ```

2. Reinstall dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server again:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Building for Production

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

## Generate Static Project

```bash
npm run generate
# or
yarn generate
```

## Migration Notes

This project was migrated from a vanilla JavaScript/HTML/CSS application to a modern Nuxt.js and Tailwind CSS stack. The migration process involved:

1. Setting up a new Nuxt.js project
2. Implementing Tailwind CSS for styling
3. Converting the HTML structure to Vue components
4. Migrating JavaScript logic to Vuex store and Vue components
5. Implementing data persistence using local storage

## Project Structure

- `assets/`: Contains CSS and other assets
- `components/`: Vue components (modals, UI elements)
- `layouts/`: Nuxt.js layouts
- `pages/`: Application pages
- `plugins/`: Vue.js plugins
- `store/`: Vuex store modules
- `static/`: Static files

## License

MIT 