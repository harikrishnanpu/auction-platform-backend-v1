import {
    ICreateWalletTopupSessionInputDto,
    ICreateWalletTopupSessionOutputDto,
} from '@application/dtos/wallet/createWalletTopupSession.dto';
import { Result } from '@domain/shared/result';

export interface ICreateWalletTopupSessionUsecase {
    execute(
        input: ICreateWalletTopupSessionInputDto,
    ): Promise<Result<ICreateWalletTopupSessionOutputDto>>;
}
