# Student Progress Tracker

A modern web application for tracking student progress, built with Nuxt.js 3 and Tailwind CSS.

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

### Prerequisites

- Node.js (v16 or later)
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

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

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