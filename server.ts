import app from './src/app';
import { config } from './src/config';
import { initializeCronosSDK } from './src/utils/cronos';
import { initializeRedis } from './src/utils/redis';
import { ExternalAPIError } from './src/utils/errors';

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
