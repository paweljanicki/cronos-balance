import app from './app';
import { config } from './config';
import { initializeCronosSDK } from './utils/cronos';
import { initializeRedis } from './utils/redis';
import { ExternalAPIError } from './utils/errors';

const initializeServices = async () => {
  initializeCronosSDK();
  await initializeRedis();
};

// Initialize services before starting the server
initializeServices()
  .then(() => {
    app.listen(config.server.port, () => {
      console.log(`Server is running on port ${config.server.port}`);
    });
  })
  .catch(error => {
    if (error instanceof ExternalAPIError) {
      console.error(`Service initialization failed: ${error.message}`);
    } else {
      console.error('Unexpected error during initialization:', error);
    }
    process.exit(1);
  });
