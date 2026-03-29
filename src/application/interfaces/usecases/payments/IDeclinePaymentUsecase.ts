import { Result } from '@domain/shared/result';

export interface IDeclinePaymentInputDto {
    userId: string;
    paymentId: string;
}

export interface IDeclinePaymentUsecase {
    execute(input: IDeclinePaymentInputDto): Promise<Result<void>>;
}
