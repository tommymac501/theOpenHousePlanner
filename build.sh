#!/bin/bash
set -e
echo "Installing all dependencies including devDependencies..."
npm ci
echo "Building frontend with Vite..."
npx vite build
echo "Building backend with esbuild..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
echo "Running database migrations..."
npx drizzle-kit push
echo "Build completed successfully!"
