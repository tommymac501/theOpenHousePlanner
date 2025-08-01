#!/bin/bash
set -e
echo "Installing all dependencies including devDependencies..."
npm ci
echo "Running database migrations..."
if npx drizzle-kit push; then
  echo "Database migration completed successfully"
else
  echo "Database migration failed - this will cause runtime errors"
  exit 1
fi
echo "Building frontend with Vite..."
npx vite build
echo "Building backend with esbuild..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
echo "Verifying built files..."
ls -la dist/
echo "Build completed successfully!"
