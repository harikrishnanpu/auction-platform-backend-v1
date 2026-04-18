import { CompleteProfileOutput } from '@application/dtos/auth/completeProfile.dto';
import { Result } from '@domain/shared/result';
import { ZodCompleteProfileInputType } from '@presentation/validators/schemas/auth/completeProfile.schema';

export interface ICompleteProfileUsecase {
    execute(
        data: ZodCompleteProfileInputType,
    ): Promise<Result<CompleteProfileOutput>>;
}
