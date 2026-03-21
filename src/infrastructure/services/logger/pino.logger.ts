import pino from 'pino';
import type { ILogger } from '@application/interfaces/services/ILogger';
import { injectable } from 'inversify';

const isDev = process.env.NODE_ENV !== 'production';

@injectable()
export class PinoLogger implements ILogger {
  private readonly _pino = pino({
    level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
    ...(isDev && {
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      },
    }),
  });

  info(msg: string): void {
    this._pino.info(msg);
  }

  warn(msg: string): void {
    this._pino.warn(msg);
  }

  error(msg: string): void {
    this._pino.error(msg);
  }
}
