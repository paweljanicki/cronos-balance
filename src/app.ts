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
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default app;
