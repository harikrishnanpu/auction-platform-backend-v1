import { IEmailService } from '@application/interfaces/services/IEmailService';
import { Email } from '@domain/value-objects/email.vo';
import { EMAIL_TEMPLATES } from '@application/constants/template/email.template.constants';
import { EmailQueue } from '@infrastructure/queue/email.queue';
import { TYPES } from 'di/types.di';
import { inject, injectable } from 'inversify';
import { OtpPurpose } from '@domain/entities/otp/otp.entity';

export type EmailTemplate =
  (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES];

@injectable()
export class EmailService implements IEmailService {
  constructor(
    @inject(TYPES.EmailQueue)
    private _emailQueue: EmailQueue,
  ) {}

  async sendOtpEmail(
    email: Email,
    otp: string,
    purpose: OtpPurpose,
    template: EmailTemplate,
  ): Promise<void> {
    await this._emailQueue.addEmailJob({
      email: email.getValue(),
      otp,
      template,
    });
  }
}
