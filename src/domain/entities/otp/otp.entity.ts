import { Result } from '@domain/shared/result';

export enum OtpPurpose {
  REGISTER = 'REGISTER',
  LOGIN = 'LOGIN',
  VERIFY_PHONE = 'VERIFY_PHONE',
  VERIFY_EMAIL = 'VERIFY_EMAIL',
  RESET_PASSWORD = 'RESET_PASSWORD',
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
    private readonly userId: string,
    private readonly purpose: OtpPurpose,
    private readonly channel: OtpChannel,
    private readonly otp: string,
    private readonly expiresAt: Date,
    private attempts: number,
    private status: OtpStatus,
  ) {}

  public static create({
    userId,
    purpose,
    channel,
    otp,
    expiresAt,
    status,
  }: {
    userId: string;
    purpose: OtpPurpose;
    channel: OtpChannel;
    otp: string;
    expiresAt: Date;
    status: OtpStatus;
  }): Result<Otp> {
    let maxAttempts = 2;

    if (purpose === OtpPurpose.REGISTER || purpose === OtpPurpose.LOGIN) {
      maxAttempts = 3;
      expiresAt = new Date(new Date().getTime() + 10 * 60 * 1000);
    }

    if (expiresAt < new Date()) {
      return Result.fail('otp creation failed: otp already expired');
    }

    return Result.ok<Otp>(
      new Otp(userId, purpose, channel, otp, expiresAt, maxAttempts, status),
    );
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
}
