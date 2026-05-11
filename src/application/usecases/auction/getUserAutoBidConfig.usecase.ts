import {
    IAutoBidConfigOutputDto,
    IGetUserAutoBidConfigInputDto,
} from '@application/dtos/auction/autoBidConfig.dto';
import { IGetUserAutoBidConfigUsecase } from '@application/interfaces/usecases/auction/IGetUserAutoBidConfigUsecase';
import { TYPES } from '@di/types.di';
import { IAutoBidConfigRepository } from '@domain/repositories/IAutoBidConfigRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetUserAutoBidConfigUsecase implements IGetUserAutoBidConfigUsecase {
    constructor(
        @inject(TYPES.IAutoBidConfigRepository)
        private readonly _autoBidConfigRepository: IAutoBidConfigRepository,
    ) {}

    async execute(
        input: IGetUserAutoBidConfigInputDto,
    ): Promise<Result<IAutoBidConfigOutputDto | null>> {
        const result = await this._autoBidConfigRepository.findByUserAndAuction(
            input.userId,
            input.auctionId,
        );
        if (result.isFailure) return Result.fail(result.getError());
        const config = result.getValue();
        if (!config) return Result.ok(null);
        return Result.ok({
            id: config.getId(),
            strategy: config.getStrategy(),
            maxBidAmount: config.getMaxBidAmount(),
            isActive: config.getIsActive(),
        });
    }
}
