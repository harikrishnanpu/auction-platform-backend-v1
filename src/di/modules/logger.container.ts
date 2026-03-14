import { ContainerModule } from 'inversify';
import { TYPES } from '@di/types.di';
import type { ILogger } from '@application/interfaces/services/ILogger';
import { PinoLogger } from '@infrastructure/services/logger/pino.logger';

export const loggerContainer = new ContainerModule(({ bind }) => {
  bind<ILogger>(TYPES.ILogger).to(PinoLogger).inSingletonScope();
});
