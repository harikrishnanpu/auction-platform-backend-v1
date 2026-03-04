import { IEmailService } from '@application/interfaces/services/IEmailService';
import { Email } from '@domain/value-objects/email.vo';
import { EmailQueue } from '@infrastructure/queue/email.queue';
import { REDIS_TYPES } from 'di/types/redis/redis.types';
import { inject, injectable } from 'inversify';

@injectable()
export class EmailService implements IEmailService {
  constructor(
    @inject(REDIS_TYPES.EmailQueue)
    private _emailQueue: EmailQueue,
  ) {}

  async sendVerificationEmail(email: Email, otp: string): Promise<void> {
    await this._emailQueue.addVerificationEmailJob(email.getValue(), otp);
  }
}
