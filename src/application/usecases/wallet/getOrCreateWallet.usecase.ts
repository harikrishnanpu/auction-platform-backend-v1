import {
    IGetOrCreateWalletInputDto,
    IWalletOutputDto,
} from '@application/dtos/wallet/wallet.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IGetOrCreateWalletUsecase } from '@application/interfaces/usecases/wallet/IGetOrCreateWalletUsecase';
import { TYPES } from '@di/types.di';
import { Wallet, WalletCurrency } from '@domain/entities/wallet/wallet.entity';
import { IWalletRepository } from '@domain/repositories/IWalletRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetOrCreateWalletUsecase implements IGetOrCreateWalletUsecase {
    constructor(
        @inject(TYPES.IWalletRepository)
        private readonly _walletRepository: IWalletRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
    ) {}

    async execute(
        input: IGetOrCreateWalletInputDto,
    ): Promise<Result<IWalletOutputDto>> {
        const existingResult = await this._walletRepository.findByUserId(
            input.userId,
        );
        if (existingResult.isFailure)
            return Result.fail(existingResult.getError());

        const existing = existingResult.getValue();

        if (existing) {
            return Result.ok({
                id: existing.getId(),
                userId: existing.getUserId(),
                mainBalance: existing.getMainBalance(),
                heldBalance: existing.getHeldBalance(),
                currency: existing.getCurrency(),
            });
        }

        const walletEntity = Wallet.create({
            id: this._idGeneratingService.generateId(),
            userId: input.userId,
            mainBalance: 0,
            heldBalance: 0,
            currency: WalletCurrency.INR,
        });

        const createdResult = await this._walletRepository.save(
            walletEntity.getValue(),
        );
        if (createdResult.isFailure)
            return Result.fail(createdResult.getError());

        return Result.ok({
            id: createdResult.getValue().getId(),
            userId: createdResult.getValue().getUserId(),
            mainBalance: createdResult.getValue().getMainBalance(),
            heldBalance: createdResult.getValue().getHeldBalance(),
            currency: createdResult.getValue().getCurrency(),
        });
    }
}
