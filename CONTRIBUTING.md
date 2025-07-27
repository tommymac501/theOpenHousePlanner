# Contributing to The Open House Planner

Thank you for your interest in contributing to The Open House Planner! This document provides guidelines for contributing to the project.

## Repository

**GitHub Repository:** https://github.com/tommymac501/theOpenHousePlanner

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/theOpenHousePlanner.git
   ```
3. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   # Add these to your environment
   DATABASE_URL=your_postgresql_connection_string
   XAI_API_KEY=your_xai_api_key
   ```

3. Run database migrations:
   ```bash
   npm run db:push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Code Style

- Use TypeScript throughout the project
- Follow the existing code formatting and naming conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure mobile-first responsive design

## Project Structure

- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared types and schemas
- `attached_assets/` - Project assets

## Making Changes

1. Make your changes in your feature branch
2. Test your changes thoroughly
3. Update documentation if needed
4. Commit your changes with descriptive commit messages
5. Push to your fork and create a Pull Request

## Pull Request Process

1. Ensure your PR has a clear title and description
2. Reference any related issues
3. Include screenshots for UI changes
4. Make sure all tests pass
5. Request review from maintainers

## Reporting Issues

Please use the GitHub Issues page to report bugs or request features:
https://github.com/tommymac501/theOpenHousePlanner/issues

## License

By contributing, you agree that your contributions will be licensed under the MIT License.