import dotenv from 'dotenv';
import { createServer } from 'http';
import { app } from './main';
import { container } from '@di/container';
import { TYPES } from '@di/types.di';
import type { ILogger } from '@application/interfaces/services/ILogger';

dotenv.config();

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  const logger = container.get<ILogger>(TYPES.ILogger);

  try {
    const httpServer = createServer(app);
    httpServer.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`);
    });
  } catch (err) {
    logger.error(`Server failed to start: ${err}`);
    process.exit(1);
  }
};

startServer();
