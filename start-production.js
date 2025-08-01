// Production startup script that handles authentication bypass
import('./dist/index.mjs')
  .then(() => {
    console.log('Production server started successfully');
  })
  .catch((error) => {
    console.error('Failed to start production server:', error);
    process.exit(1);
  });