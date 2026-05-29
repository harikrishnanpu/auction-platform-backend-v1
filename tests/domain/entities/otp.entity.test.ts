import { describe, expect, it } from 'vitest';
import {
    Otp,
    OtpPurpose,
    OtpChannel,
    OtpStatus,
} from '@domain/entities/otp/otp.entity';

describe('Otp Domain Entity', () => {
    it('should successfully create a valid Otp entity', () => {
        const expiresAt = new Date(Date.now() + 600000);
        const otpResult = Otp.create({
            id: 'otp-1',
            userId: 'user-1',
            purpose: OtpPurpose.REGISTER,
            channel: OtpChannel.EMAIL,
            otp: '123456',
            expiresAt,
            status: OtpStatus.PENDING,
        });

        expect(otpResult.isSuccess).toBe(true);
        expect(otpResult.getValue().getOtp()).toBe('123456');
        expect(otpResult.getValue().getOtpStatus()).toBe(OtpStatus.PENDING);
        expect(otpResult.getValue().isOtpExpired()).toBe(false);
    });

    it('should fail to create an Otp if expiresAt is in the past', () => {
        const expiresAt = new Date(Date.now() - 10000);
        const otpResult = Otp.create({
            id: 'otp-1',
            userId: 'user-1',
            purpose: OtpPurpose.REGISTER,
            channel: OtpChannel.EMAIL,
            otp: '123456',
            expiresAt,
            status: OtpStatus.PENDING,
        });

        expect(otpResult.isSuccess).toBe(false);
        expect(otpResult.getError()).toBe(
            'otp creation failed: otp already expired',
        );
    });

    it('should support tracking of attempts and block verification after 3 failures', () => {
        const expiresAt = new Date(Date.now() + 600000);
        const otp = Otp.create({
            id: 'otp-1',
            userId: 'user-1',
            purpose: OtpPurpose.REGISTER,
            channel: OtpChannel.EMAIL,
            otp: '123456',
            expiresAt,
            status: OtpStatus.PENDING,
        }).getValue();

        expect(otp.isOtpBlocked()).toBe(false);
        expect(otp.getAttempts()).toBe(0);

        otp.incrementAttempts();
        otp.incrementAttempts();
        otp.incrementAttempts();

        expect(otp.getAttempts()).toBe(3);
        expect(otp.isOtpBlocked()).toBe(true);
    });

    it('should support checking verification status', () => {
        const expiresAt = new Date(Date.now() + 600000);
        const otp = Otp.create({
            id: 'otp-1',
            userId: 'user-1',
            purpose: OtpPurpose.REGISTER,
            channel: OtpChannel.EMAIL,
            otp: '123456',
            expiresAt,
            status: OtpStatus.PENDING,
        }).getValue();

        expect(otp.isOtpVerified()).toBe(false);
        otp.setOtpStatus(OtpStatus.VERIFIED);
        expect(otp.isOtpVerified()).toBe(true);
    });
});
