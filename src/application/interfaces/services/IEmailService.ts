import { Email } from '@domain/value-objects/email.vo';

export interface IEmailService {
  sendVerificationEmail(email: Email, otp: string): Promise<void>;
}
