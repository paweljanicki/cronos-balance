import express, { Request, Response } from 'express';
import { config } from './config';
import { getCronosBalance, getCrc20Balance } from './services/cronos.service';

const app = express();

// Middleware
app.use(express.json());

app.get('/balance/:address', async (req: Request, res: Response) => {
  const balance = await getCronosBalance(req.params.address);
  res.json({ balance });
});

app.get('/token-balance/:address/:tokenAddress', async (req: Request, res: Response) => {
  const balance = await getCrc20Balance({
    walletAddress: req.params.address,
    tokenAddress: req.params.tokenAddress,
  });
  res.json({ balance });
});

// Start server
app.listen(config.server.port, () => {
  console.log(`Server is running on port ${config.server.port}`);
});
