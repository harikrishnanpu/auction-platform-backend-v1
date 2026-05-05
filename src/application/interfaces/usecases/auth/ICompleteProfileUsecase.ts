import { CompleteProfileOutput } from '@application/dtos/auth/completeProfile.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedCompleteProfileInput {
    userId: string;
    phone: string;
    address: string;
}

export interface ICompleteProfileUsecase {
    execute(
        data: IValidatedCompleteProfileInput,
    ): Promise<Result<CompleteProfileOutput>>;
}
