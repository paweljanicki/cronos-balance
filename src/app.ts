import express from 'express';
import balanceRoutes from './routes/balance.routes';
import { initializeCronosSDK } from './utils/cronos';

const app = express();

initializeCronosSDK();

app.use('/', balanceRoutes);

export default app;
