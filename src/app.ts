import express from 'express';
import balanceRoutes from './routes/balance.routes';
import { initializeCronosSDK } from './utils/cronos';
import { initializeRedis } from './utils/redis';

const app = express();

// Initialize services
initializeCronosSDK();
initializeRedis().catch(console.error);

app.use('/', balanceRoutes);

export default app;
