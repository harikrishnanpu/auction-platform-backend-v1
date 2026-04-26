import { OtpChannel, OtpPurpose } from '@domain/entities/otp/otp.entity';
import z from 'zod';

export const sendVerificationCodeSchema = z.object({
    email: z
        .string()
        .trim()
        .email('Invalid email')
        .max(50, 'Email cannot exceed 50 characters'),
    purpose: z.enum(OtpPurpose),
    channel: z.enum(OtpChannel),
});

export type ZodSendVerificationCodeInputType = z.infer<
    typeof sendVerificationCodeSchema
>;
