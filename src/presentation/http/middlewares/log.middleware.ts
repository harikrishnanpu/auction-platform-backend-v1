import { Request, Response, NextFunction } from 'express';
import type { ILogger } from '@application/interfaces/services/ILogger';

export function logMiddleware(logger: ILogger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const msg = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
      logger.info(msg);
    });

    next();
  };
}
