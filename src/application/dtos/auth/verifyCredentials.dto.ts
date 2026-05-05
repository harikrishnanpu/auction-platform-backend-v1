import { userResponseDto } from '@application/dtos/user/userResponse.dto';
import { OtpChannel, OtpPurpose } from '@domain/entities/otp/otp.entity';

export interface verifyCredentialsOutput {
    user: userResponseDto;
    accessToken: string;
    refreshToken: string;
}

export interface VerifyCredentialsInput {
    otp: string;
    email: string;
    purpose: OtpPurpose;
    channel: OtpChannel;
}
