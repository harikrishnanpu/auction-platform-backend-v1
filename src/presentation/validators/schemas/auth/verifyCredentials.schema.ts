import { OtpChannel, OtpPurpose } from '@domain/entities/otp/otp.entity';
import z from 'zod';

export const verifyCredentialsSchema = z.object({
    otp: z.string().min(6, 'Otp must be at least 6 characters long').trim(),
    email: z.email().trim().min(1, 'Email is required'),
    purpose: z.enum(OtpPurpose),
    channel: z.enum([OtpChannel.SMS, OtpChannel.EMAIL]),
});

export type ZodVerifyCredentialsInputType = z.infer<
    typeof verifyCredentialsSchema
>;
