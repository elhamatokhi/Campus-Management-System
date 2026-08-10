import app from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`User Service running on port ${env.port}`);
});

