import {
    IAddAuctionParticipantInput,
    IAddAuctionParticipantOutput,
} from '@application/dtos/auction/addAuctionParticipant.dto';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IAddAuctionParticipantUsecase } from '@application/interfaces/usecases/auction/IAddAuctionParticipantUsecase';
import { TYPES } from '@di/types.di';
import { AUCTION_INTIAL_DEPOSIT_AMOUNT } from '@domain/constants/auction.constants';
import {
    AuctionParticipant,
    AuctionParticipantPaymentStatus,
} from '@domain/entities/auction/auction-participant.entity';
import {
    WalletTransaction,
    WalletTransactionType,
} from '@domain/entities/wallet/wallet.transactions.entity';
import { IAuctionParticipantRepository } from '@domain/repositories/IAuctionParticipantRepository';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IWalletRepository } from '@domain/repositories/IWalletRepository';
import { IWalletTransactionsRepository } from '@domain/repositories/IWallettransactionsRepo';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class AddAuctionParticipantUsecase implements IAddAuctionParticipantUsecase {
    constructor(
        @inject(TYPES.IAuctionParticipantRepository)
        private readonly _auctionParticipantRepository: IAuctionParticipantRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IWalletRepository)
        private readonly _walletRepository: IWalletRepository,
        @inject(TYPES.IWalletTransactionsRepository)
        private readonly _walletTransactionsRepository: IWalletTransactionsRepository,
    ) {}

    async execute(
        input: IAddAuctionParticipantInput,
    ): Promise<Result<IAddAuctionParticipantOutput>> {
        const userEntity = await this._userRepository.findById(input.userId);
        const auctionEntity = await this._auctionRepository.findById(
            input.auctionId,
        );
        const userWalletEntity = await this._walletRepository.findByUserId(
            input.userId,
        );

        if (userEntity.isFailure) {
            return Result.fail(userEntity.getError());
        }

        if (auctionEntity.isFailure) {
            return Result.fail(auctionEntity.getError());
        }

        if (userWalletEntity.isFailure) {
            return Result.fail(userWalletEntity.getError());
        }

        const userWallet = userWalletEntity.getValue();
        const user = userEntity.getValue();
        const auction = auctionEntity.getValue();
        if (!user) {
            return Result.fail('User not found');
        }
        if (!auction) {
            return Result.fail('Auction not found');
        }
        if (!userWallet) {
            return Result.fail('User wallet not found');
        }

        const intialDepositAmount =
            auction.getStartPrice() * AUCTION_INTIAL_DEPOSIT_AMOUNT.PERCENTAGE;
        const holdBalanceResult =
            userWallet.holdFromMainBalance(intialDepositAmount);
        if (holdBalanceResult.isFailure) {
            return Result.fail(holdBalanceResult.getError());
        }

        const wllettransaction = WalletTransaction.create({
            id: this._idGeneratingService.generateId(),
            walletId: userWallet.getId(),
            amount: intialDepositAmount,
            type: WalletTransactionType.HOLD,
        });

        if (wllettransaction.isFailure) {
            return Result.fail(wllettransaction.getError());
        }

        await this._walletTransactionsRepository.create(
            wllettransaction.getValue(),
        );

        const updatedWallet = await this._walletRepository.save(userWallet);

        if (updatedWallet.isFailure) {
            return Result.fail(updatedWallet.getError());
        }

        const auctionParticipantEntity = AuctionParticipant.create({
            id: this._idGeneratingService.generateId(),
            auctionId: input.auctionId,
            userId: input.userId,
            userName: user.getName(),
            intialAmount: AuctionParticipantPaymentStatus.PAID,
        });

        if (auctionParticipantEntity.isFailure) {
            return Result.fail(auctionParticipantEntity.getError());
        }

        await this._auctionParticipantRepository.save(
            auctionParticipantEntity.getValue(),
        );

        const auctionParticipants =
            await this._auctionParticipantRepository.findByAuctionId(
                input.auctionId,
            );
        if (auctionParticipants.isFailure) {
            return Result.fail(auctionParticipants.getError());
        }

        const output: IAddAuctionParticipantOutput = {
            auctionParticipants: auctionParticipants.getValue(),
        };

        return Result.ok(output);
    }
}
