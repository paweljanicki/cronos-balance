import app from './src/app';
import { config } from './src/config';

app.listen(config.server.port, () => {
  console.log(`Server is running on port ${config.server.port}`);
});
