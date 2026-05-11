import { IViewKycOutputDto } from '@application/dtos/admin/viewKyc.dto';
import { Result } from '@domain/shared/result';
export interface IValidatedViewKycInput {
    documentId: string;
    userId: string;
}

export interface IViewKycUsecase {
    execute(data: IValidatedViewKycInput): Promise<Result<IViewKycOutputDto>>;
    // stream
}
