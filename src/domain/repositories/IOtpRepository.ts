import { Otp, OtpPurpose } from '@domain/entities/otp/otp.entity';
import { Result } from '@domain/shared/result';

export interface IOtpRepository {
    create(otp: Otp): Promise<Result<Otp>>;

    update(id: string, otp: Otp): Promise<Result<Otp>>;

    findRecentOtpByUserIdAndPurpose(
        userId: string,
        purpose: OtpPurpose,
    ): Promise<Otp | null>;

    findRecentOtpsByUserIdAndPurpose(
        userId: string,
        purpose: OtpPurpose,
    ): Promise<Otp[] | []>;
}
