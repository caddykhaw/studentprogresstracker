# Student Progress Tracker

A modern web application for tracking student progress, built with Next.js 15 and Tailwind CSS.

## Features

- Manage student information (name, instrument, grade, lesson day and time)
- Track student progress with notes
- View today's lessons at a glance
- Manage instruments through settings
- Export and import data for backup and transfer

## Tech Stack

- **Next.js 15**: React framework for building modern web applications
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Zustand**: State management for React applications
- **MongoDB**: For data persistence
- **TypeScript**: For type safety and better developer experience
- **Zod**: For runtime data validation
- **Headless UI**: For accessible UI components
- **Heroicons**: For beautiful SVG icons

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/student-progress-tracker.git
   cd student-progress-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` with your MongoDB connection string and other required variables.

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Building for Production

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

## Project Structure

- `app/`: Next.js app directory (App Router)
  - `api/`: API routes
  - `components/`: React components
  - `pages/`: Page components
  - `store/`: Zustand store modules
- `lib/`: Utility functions and shared code
- `styles/`: Global CSS and Tailwind directives
- `public/`: Static assets
- `scripts/`: Utility scripts

## License

MIT 