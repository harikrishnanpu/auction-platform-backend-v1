import { EXPIRY, MAX_OTP_ATTEMPTS } from '@domain/constants/otp.constants';
import { Result } from '@domain/shared/result';

export enum OtpPurpose {
  REGISTER = 'REGISTER',
  LOGIN = 'LOGIN',
  VERIFY_PHONE = 'VERIFY_PHONE',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  RESET_PASSWORD = 'RESET_PASSWORD',
  CHANGE_PROFILE_PASSWORD = 'CHANGE_PROFILE_PASSWORD',
  EDIT_PROFILE = 'EDIT_PROFILE',
}

export enum OtpChannel {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

export enum OtpStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  EXPIRED = 'EXPIRED',
  BLOCKED = 'BLOCKED',
}

export class Otp {
  private constructor(
    private readonly id: string,
    private readonly userId: string,
    private readonly purpose: OtpPurpose,
    private readonly channel: OtpChannel,
    private readonly otp: string,
    private readonly expiresAt: Date,
    private readonly maxAttempts: number,
    private attempts: number,
    private status: OtpStatus,
    private readonly createdAt: Date,
  ) {}

  public static create({
    id,
    userId,
    purpose,
    channel,
    otp,
    expiresAt,
    status,
    createdAt,
    attempts,
  }: {
    id: string;
    userId: string;
    purpose: OtpPurpose;
    channel: OtpChannel;
    otp: string;
    expiresAt: Date;
    status: OtpStatus;
    createdAt?: Date;
    attempts?: number;
  }): Result<Otp> {
    const maxAttempts = MAX_OTP_ATTEMPTS;
    const expiresAtDate = new Date(new Date().getTime() + EXPIRY);

    if (!expiresAt) {
      expiresAt = expiresAtDate;
    }

    if (!createdAt) {
      createdAt = new Date();
    }

    if (!attempts) {
      attempts = 0;
    }

    if (expiresAt < new Date()) {
      return Result.fail('otp creation failed: otp already expired');
    }

    return Result.ok<Otp>(
      new Otp(
        id,
        userId,
        purpose,
        channel,
        otp,
        expiresAt,
        maxAttempts,
        attempts,
        status,
        createdAt,
      ),
    );
  }

  public getId(): string {
    return this.id;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getOtp(): string {
    return this.otp;
  }

  public getOtpStatus(): OtpStatus {
    return this.status;
  }

  public getExpiresAt(): Date {
    return this.expiresAt;
  }

  public getPurpose(): OtpPurpose {
    return this.purpose;
  }

  public getChannel(): OtpChannel {
    return this.channel;
  }

  public isOtpExpired(): boolean {
    return this.expiresAt < new Date();
  }

  public isOtpBlocked(): boolean {
    return this.attempts >= 3;
  }

  public isOtpVerified(): boolean {
    return this.status === OtpStatus.VERIFIED;
  }

  public setOtpStatus(status: OtpStatus): void {
    this.status = status;
  }

  public incrementAttempts(): void {
    this.attempts++;
  }

  public getAttempts(): number {
    return this.attempts;
  }
}
