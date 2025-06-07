import express from 'express';
import balanceRoutes from './routes/balance.routes';
import { errorLogger } from './middlewares/error-logger.middleware';

const app = express();

// Routes
app.use('/', balanceRoutes);

// Error handling middleware
app.use(errorLogger);

// Global error handler
app.use(
  (error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Preserve the status code set by handleControllerError
    const statusCode = res.statusCode;
    res
      .status(statusCode)
      .json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
);

export default app;
