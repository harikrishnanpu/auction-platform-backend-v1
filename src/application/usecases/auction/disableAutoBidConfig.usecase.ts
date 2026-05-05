import {
    IAutoBidConfigOutputDto,
    IDisableAutoBidConfigInputDto,
} from '@application/dtos/auction/autoBidConfig.dto';
import { IDisableAutoBidConfigUsecase } from '@application/interfaces/usecases/auction/IDisableAutoBidConfigUsecase';
import { TYPES } from '@di/types.di';
import { IAutoBidConfigRepository } from '@domain/repositories/IAutoBidConfigRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class DisableAutoBidConfigUsecase implements IDisableAutoBidConfigUsecase {
    constructor(
        @inject(TYPES.IAutoBidConfigRepository)
        private readonly _autoBidConfigRepository: IAutoBidConfigRepository,
    ) {}

    async execute(
        input: IDisableAutoBidConfigInputDto,
    ): Promise<Result<IAutoBidConfigOutputDto | null>> {
        const existingResult =
            await this._autoBidConfigRepository.findByUserAndAuction(
                input.userId,
                input.auctionId,
            );
        if (existingResult.isFailure) {
            return Result.fail(existingResult.getError());
        }

        const existing = existingResult.getValue();
        if (!existing) return Result.ok(null);

        existing.disable();
        const saved = await this._autoBidConfigRepository.save(existing);
        if (saved.isFailure) return Result.fail(saved.getError());

        const value = saved.getValue();
        return Result.ok({
            id: value.getId(),
            strategy: value.getStrategy(),
            maxBidAmount: value.getMaxBidAmount(),
            isActive: value.getIsActive(),
        });
    }
}
