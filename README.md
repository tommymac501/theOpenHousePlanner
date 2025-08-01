# Open House Planner

A comprehensive real estate open house management application built with React, TypeScript, Express, and PostgreSQL.

## Features

- **User Authentication**: Secure login with Replit auth integration
- **Property Management**: Add, edit, delete, and view open house details
- **Smart Data Parsing**: Extract property details from images and clipboard using AI
- **Visit Tracking**: Mark properties as visited, favorited, or disliked
- **Analytics Dashboard**: Comprehensive insights and trends about your property search
- **Waze Integration**: Direct navigation to properties
- **Mobile-First Design**: Responsive interface optimized for mobile devices

## Deployment to Render

This application is configured for deployment on Render using the included `render.yaml` configuration.

### Prerequisites

1. A Render account
2. A PostgreSQL database (can be created through Render)
3. Required environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `REPLIT_DOMAINS` - Your deployed domain(s)
   - `REPL_ID` - Replit application ID for auth
   - `SESSION_SECRET` - Secret for session management (auto-generated)
   - `XAI_API_KEY` - xAI API key for property parsing
   - `ANTHROPIC_API_KEY` - Anthropic API key for AI features

### Deployment Steps

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Use the included `render.yaml` configuration
4. Set up the required environment variables
5. Deploy

The build process will:
- Install dependencies
- Build the frontend with Vite
- Bundle the backend with esbuild
- Run database migrations
- Start the production server

### Environment Configuration

The application uses different authentication flows for development and production:
- **Development**: Includes dev login bypass for testing
- **Production**: Full Replit OAuth integration

### Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OAuth with session management
- **AI Integration**: xAI/Grok Vision for property data extraction

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

## License

MIT License