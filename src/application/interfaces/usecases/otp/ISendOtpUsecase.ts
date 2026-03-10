import { SendOtpInput } from '@application/dtos/otp/SendOtp.dto';
import { Result } from '@domain/shared/result';

export interface ISendOtpUsecase {
  execute(data: SendOtpInput): Promise<Result<void>>;
}
