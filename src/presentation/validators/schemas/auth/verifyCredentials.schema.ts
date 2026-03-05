import { OtpChannel, OtpPurpose } from '@domain/entities/otp/otp.entity';
import z from 'zod';

export const verifyCredentialsSchema = z.object({
  otp: z.string().min(6, 'Otp must be at least 6 characters long').trim(),
  email: z.string().email().trim().min(1, 'Email is required'),
  purpose: z.enum([
    OtpPurpose.REGISTER,
    OtpPurpose.LOGIN,
    OtpPurpose.VERIFY_PHONE,
    OtpPurpose.VERIFY_EMAIL,
    OtpPurpose.RESET_PASSWORD,
  ]),
  channel: z.enum([OtpChannel.SMS, OtpChannel.EMAIL]),
});
