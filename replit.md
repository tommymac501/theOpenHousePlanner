# The Open House Planner

**GitHub Repository:** https://github.com/tommymac501/theOpenHousePlanner

## Overview

This is a full-stack open house management application built with React, TypeScript, Express, and PostgreSQL. The application allows users to track and manage real estate open houses with features like image upload, property details parsing, and visit tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom Tailwind CSS styling
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom design system (shadcn/ui)
- **Mobile-First**: Responsive design with bottom navigation for mobile users

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon serverless PostgreSQL
- **Session Management**: Express sessions with PostgreSQL storage
- **Web Scraping**: Puppeteer for property data extraction
- **File Processing**: Base64 image handling and OCR capabilities

## Key Components

### Database Schema
- **open_houses table**: Stores property information including address, price, date/time, images, and user preferences
- **users table**: Stores user authentication data for Replit auth integration
- **sessions table**: Stores user session data for authentication persistence
- **Fields**: id, address, price, zestimate, monthlyPayment, date, time, imageUrl, imageData, listingUrl, notes, visited, favorited, disliked, createdAt

### API Endpoints
- `GET /api/open-houses` - Fetch all open houses
- `GET /api/open-houses/:id` - Fetch single open house
- `POST /api/open-houses` - Create new open house
- `PATCH /api/open-houses/:id` - Update open house
- `DELETE /api/open-houses/:id` - Delete open house
- `GET /api/stats` - Get dashboard statistics

### Frontend Pages
- **Landing Page**: Authentication entry point with feature previews and login options
- **Home**: Main dashboard with stats and open house listings
- **Add Open House**: Form for adding new properties with image upload and clipboard parsing
- **Open House Detail**: Detailed view with edit capabilities and map integration
- **Analytics**: Comprehensive analytics dashboard with insights, trends, and statistics

### Core Features
- **User Authentication**: Replit auth integration with session management, demo mode authentication, and development login bypass
- **Property Management**: Add, edit, delete, and view open house details
- **Image Handling**: Upload images via file input or paste from clipboard
- **Data Parsing**: Extract property details from clipboard text or images using xAI/Grok vision
- **Monthly Payment Parsing**: Automatically extract estimated monthly payments from listings (e.g., "Est. $2,602/mo")
- **Visit Tracking**: Mark properties as visited, favorited, or disliked
- **Auto-Visit Logic**: Favoriting or disliking a property automatically marks it as visited
- **Waze Integration**: Direct navigation to properties via Waze app/website from Property Details page
- **Analytics Dashboard**: Comprehensive insights including price analysis, visit preferences, recent activity, and personalized recommendations
- **Interactive Landing Features**: Clickable feature previews with detailed explanations and smooth animations
- **Mobile Navigation**: Bottom tab navigation for mobile users with analytics tab

## Data Flow

1. **User Input**: Users can add properties through forms or by pasting clipboard data
2. **Data Validation**: Zod schemas validate input on both client and server
3. **Database Storage**: Drizzle ORM handles all database operations
4. **Real-time Updates**: TanStack Query provides optimistic updates and cache management
5. **State Synchronization**: Client-side cache stays synchronized with server state

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Hook Form)
- UI libraries (Radix UI components, Lucide React icons)
- State management (TanStack Query)
- Styling (Tailwind CSS, class-variance-authority)
- Validation (Zod)
- Date handling (date-fns)

### Backend Dependencies
- Express.js web framework
- Database tools (Drizzle ORM, Neon serverless)
- Web scraping (Puppeteer, Cheerio)
- Session management (connect-pg-simple)
- Validation (Zod, drizzle-zod)

### Development Dependencies
- TypeScript for type safety
- Vite for fast development builds
- ESBuild for production builds
- Replit-specific plugins for development environment

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite dev server with HMR (Hot Module Replacement)
- **Backend**: tsx for TypeScript execution with auto-restart
- **Database**: Neon serverless PostgreSQL with migrations via Drizzle Kit
- **Environment**: Replit-optimized with specific plugins and configurations

### Production Build
- **Frontend**: Vite builds to `dist/public` directory
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Static Files**: Express serves built frontend files
- **Database**: Production PostgreSQL via DATABASE_URL environment variable

### Database Management
- **Migrations**: Drizzle Kit handles schema migrations
- **Schema**: Centralized in `shared/schema.ts` for type safety
- **Connection**: Neon serverless with WebSocket support for development

## Recent Changes

**August 1, 2025**: Fixed critical demo authentication system
- Resolved session middleware initialization in demo mode by moving session setup above REPL_ID check
- Fixed ES module import compatibility for production builds
- Enhanced build script to ensure database migrations succeed before deployment
- Added automatic demo user creation at server startup to prevent missing user errors
- Simplified frontend authentication logic to always use demo mode for reliability
- Demo authentication now works with persistent PostgreSQL sessions
- "Try Demo" button provides full feature access with proper user sessions

### Key Architectural Decisions

1. **Monorepo Structure**: Client and server code in same repository for easier development
2. **Shared Types**: Common schema definitions shared between frontend and backend
3. **Mobile-First Design**: Bottom navigation and touch-friendly interface
4. **Optimistic Updates**: Client-side state updates before server confirmation
5. **Image Handling**: Base64 encoding for simplicity, avoiding file storage complexity
6. **Serverless Database**: Neon for easy deployment and scaling
7. **TypeScript Throughout**: End-to-end type safety from database to UI components