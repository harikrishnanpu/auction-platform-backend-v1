import { SendVerificationCodeInputDto } from '@application/dtos/otp/SendOtp.dto';
import { Result } from '@domain/shared/result';

export interface ISendOtpUsecase {
    execute(data: SendVerificationCodeInputDto): Promise<Result<void>>;
}
