import { EMAIL_TEMPLATES } from '@application/constants/template/email.template.constants';
import { OtpPurpose } from '@domain/entities/otp/otp.entity';
import { Email } from '@domain/value-objects/email.vo';

export type EmailTemplate =
  (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES];

export interface IEmailService {
  sendOtpEmail(
    email: Email,
    otp: string,
    purpose: OtpPurpose,
    template: EmailTemplate,
  ): Promise<void>;
}
