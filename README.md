# The Open House Planner

A mobile-first real estate listing management platform that transforms property discovery into an engaging, intelligent experience for real estate professionals.

## Repository

**GitHub Repository:** https://github.com/tommymac501/theOpenHousePlanner

## Overview

This is a full-stack open house management application built with React, TypeScript, Express, and PostgreSQL. The application allows users to track and manage real estate open houses with features like image upload, property details parsing, and visit tracking.

## Key Features

- **Property Management**: Add, edit, delete, and view open house details
- **Image Handling**: Upload images via file input or paste from clipboard
- **Data Parsing**: Extract property details from clipboard text or images using xAI/Grok vision
- **Monthly Payment Parsing**: Automatically extract estimated monthly payments from listings (e.g., "Est. $2,602/mo")
- **Visit Tracking**: Mark properties as visited, favorited, or disliked
- **Auto-Visit Logic**: Favoriting or disliking a property automatically marks it as visited
- **Waze Integration**: Direct navigation to properties via Waze app/website from Property Details page
- **Statistics Dashboard**: Show total properties, weekly count, and visit stats
- **Mobile Navigation**: Bottom tab navigation for mobile users

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for development and production builds
- Radix UI primitives with custom Tailwind CSS styling
- TanStack Query (React Query) for server state management
- React Hook Form with Zod validation
- Tailwind CSS with custom design system (shadcn/ui)
- Mobile-first responsive design

### Backend
- Node.js with Express.js
- TypeScript with ES modules
- Drizzle ORM with PostgreSQL
- Neon serverless PostgreSQL
- Express sessions with PostgreSQL storage
- Puppeteer for property data extraction
- Base64 image handling and OCR capabilities

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- xAI API key (for OCR functionality)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tommymac501/theOpenHousePlanner.git
cd theOpenHousePlanner
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your actual values:
DATABASE_URL=your_postgresql_connection_string
XAI_API_KEY=your_xai_api_key
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Database Schema

The application uses a single `open_houses` table with the following structure:

- `id`: Primary key
- `address`: Property address
- `price`: Listing price
- `zestimate`: Estimated value
- `monthlyPayment`: Estimated monthly payment
- `date`: Open house date
- `time`: Open house time
- `imageUrl`: Property image URL
- `imageData`: Base64 encoded image data
- `listingUrl`: Original listing URL
- `notes`: Property notes and details
- `visited`: Boolean flag for visit status
- `favorited`: Boolean flag for favorite status
- `disliked`: Boolean flag for dislike status
- `createdAt`: Timestamp

## API Endpoints

- `GET /api/open-houses` - Fetch all open houses
- `GET /api/open-houses/:id` - Fetch single open house
- `POST /api/open-houses` - Create new open house
- `PATCH /api/open-houses/:id` - Update open house
- `DELETE /api/open-houses/:id` - Delete open house
- `GET /api/stats` - Get dashboard statistics

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
- Frontend builds to `dist/public` directory
- Backend bundles to `dist/index.js`
- Express serves built frontend files
- Database via DATABASE_URL environment variable

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Repository Links

- **Main Repository**: https://github.com/tommymac501/theOpenHousePlanner
- **Issues**: https://github.com/tommymac501/theOpenHousePlanner/issues
- **Wiki**: https://github.com/tommymac501/theOpenHousePlanner/wiki