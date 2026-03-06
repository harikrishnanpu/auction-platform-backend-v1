import {
  CompleteProfileInput,
  CompleteProfileOutput,
} from '@application/dtos/auth/completeProfile.dto';
import { Result } from '@domain/shared/result';

export interface ICompleteProfileUsecase {
  execute(data: CompleteProfileInput): Promise<Result<CompleteProfileOutput>>;
}
