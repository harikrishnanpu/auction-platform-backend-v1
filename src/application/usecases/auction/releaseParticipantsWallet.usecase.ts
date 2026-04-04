import { IReleaseParticipantsWalletInputDto } from '@application/dtos/auction/releaseParticipantsWallet.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IReleaseParticipantsWalletUsecase } from '@application/interfaces/usecases/auction/IReleaseParticipantsWalletUsecase';
import { TYPES } from '@di/types.di';
import { AUCTION_INTIAL_DEPOSIT_AMOUNT } from '@domain/constants/auction.constants';
import {
    WalletTransaction,
    WalletTransactionType,
} from '@domain/entities/wallet/wallet.transactions.entity';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IWalletRepository } from '@domain/repositories/IWalletRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class ReleaseParticipantsWalletUsecase implements IReleaseParticipantsWalletUsecase {
    constructor(
        @inject(TYPES.IAuctionParticipantRepository)
        private readonly _auctionParticipantRepository: IAuctionParticipantRepository,
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IWalletRepository)
        private readonly _walletRepository: IWalletRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
    ) {}

    async execute(
        input: IReleaseParticipantsWalletInputDto,
    ): Promise<Result<void>> {
        const auctionResult = await this._auctionRepository.findById(
            input.auctionId,
        );
        const auctionParticipantsResult =
            await this._auctionParticipantRepository.findByAuctionId(
                input.auctionId,
            );

        if (auctionParticipantsResult.isFailure) {
            return Result.fail(auctionParticipantsResult.getError());
        }

        if (auctionResult.isFailure) {
            return Result.fail(auctionResult.getError());
        }

        const auctionParticipants = auctionParticipantsResult.getValue();
        const intialdepositedAmount =
            auctionResult.getValue().getStartPrice() *
            AUCTION_INTIAL_DEPOSIT_AMOUNT.PERCENTAGE;

        for (const auctionParticipant of auctionParticipants) {
            if (
                auctionParticipant.getUserId() ===
                auctionResult.getValue().getWinnerId()
            ) {
                continue;
                // --
            }

            const walletRes = await this._walletRepository.findByUserId(
                auctionParticipant.getUserId(),
            );

            if (walletRes.isFailure) {
                continue;
                // return Result.fail(walletRes.getError())
            }

            const wallet = walletRes.getValue();

            if (!wallet) {
                continue;
                // return Result.fail('Wallet not found')
            }

            const releaseBalanceResult = wallet.releaseHeldBalance(
                intialdepositedAmount,
            );

            if (releaseBalanceResult.isFailure) {
                return Result.fail(releaseBalanceResult.getError());
            }

            const walletTransaction = WalletTransaction.create({
                id: this._idGeneratingService.generateId(),
                walletId: wallet.getId(),
                amount: intialdepositedAmount,
                type: WalletTransactionType.RELEASE,
            });

            if (walletTransaction.isFailure) {
                return Result.fail(walletTransaction.getError());
            }

            await this._walletRepository.save(wallet!);
        }

        return Result.ok();
    }
}
