import { IAuctionWinnerFallbackQueue } from '@application/interfaces/queue/IWinnerFallbackQueue';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import {
    IDeclinePaymentInputDto,
    IDeclinePaymentUsecase,
} from '@application/interfaces/usecases/payments/IDeclinePaymentUsecase';
import { TYPES } from '@di/types.di';
import { AuctionStatus } from '@domain/entities/auction/auction.entity';
import {
    FraudReport,
    FraudReportCategory,
    FraudReporterType,
    FraudReportLevel,
} from '@domain/entities/fraud/fraud-report.entity';
import {
    PaymentFor,
    PaymentStatus,
} from '@domain/entities/payments/payments.entity';
import { IAuctionRepository } from '@domain/repositories/IAuctionRepository';
import { IFraudReportRepository } from '@domain/repositories/IFraudReportRepository';
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class DeclinePaymentUsecase implements IDeclinePaymentUsecase {
    constructor(
        @inject(TYPES.IPaymentRepository)
        private readonly _paymentRepository: IPaymentRepository,
        @inject(TYPES.IAuctionRepository)
        private readonly _auctionRepository: IAuctionRepository,
        @inject(TYPES.IAuctionWinnerFallbackQueue)
        private readonly _auctionWinnerFallbackQueue: IAuctionWinnerFallbackQueue,
        @inject(TYPES.IFraudReportRepository)
        private readonly _fraudReportRepository: IFraudReportRepository,
        @inject(TYPES.IIdGeneratingService)
        private readonly _idGeneratingService: IIdGeneratingService,
        @inject(TYPES.IUserRepository)
        private readonly _userRepository: IUserRepository,
    ) {}

    async execute(input: IDeclinePaymentInputDto): Promise<Result<void>> {
        try {
            const paymentResult = await this._paymentRepository.findById(
                input.paymentId,
            );
            if (paymentResult.isFailure) {
                return Result.fail(paymentResult.getError());
            }

            const payment = paymentResult.getValue();
            if (!payment) {
                return Result.fail('Payment not found');
            }

            if (payment.getUserId() !== input.userId) {
                return Result.fail('Not authorized to decline this payment');
            }

            if (payment.getStatus() === PaymentStatus.DECLINED) {
                return Result.ok();
            }

            if (payment.getStatus() !== PaymentStatus.PENDING) {
                return Result.fail('Only pending payments can be declined');
            }

            const marked = payment.markAsDeclined();
            if (marked.isFailure) {
                return Result.fail(marked.getError());
            }

            const updateResult = await this._paymentRepository.update(
                payment.getId(),
                payment,
            );
            if (updateResult.isFailure) {
                return Result.fail(updateResult.getError());
            }

            if (
                payment.getForPayment() === PaymentFor.AUCTION &&
                payment.getReferenceId()
            ) {
                const auctionResult = await this._auctionRepository.findById(
                    payment.getReferenceId(),
                );

                if (auctionResult.isSuccess) {
                    const auction = auctionResult.getValue();
                    if (auction) {
                        const status = auction.getStatus();
                        const ended = status === AuctionStatus.ENDED;

                        if (ended && auction.getWinnerId() === input.userId) {
                            await this._auctionWinnerFallbackQueue.enqueue({
                                auctionId: auction.getId(),
                                declinedUserId: input.userId,
                                paymentId: payment.getId(),
                            });
                        }
                    }
                }
            }

            const targetedUserResult = await this._userRepository.findById(
                input.userId,
            );
            if (targetedUserResult.isFailure) {
                return Result.fail(targetedUserResult.getError());
            }
            const targetedUser = targetedUserResult.getValue();

            const newFraudReport = FraudReport.create({
                id: this._idGeneratingService.generateId(),
                reportedUserId: payment.getUserId(),
                targetedUserId: payment.getUserId(),
                reason: 'Payment declined',
                category: FraudReportCategory.PAYMENT_CRITICAL,
                level: FraudReportLevel.MEDIUM,
                reporterType: FraudReporterType.SYSTEM,
                reportedUser: null,
                targetedUser: targetedUser,
                reviewedBy: null,
            });

            if (newFraudReport.isFailure) {
                return Result.fail(newFraudReport.getError());
            }

            const savedFraudReport = await this._fraudReportRepository.save(
                newFraudReport.getValue(),
            );

            if (savedFraudReport.isFailure) {
                return Result.fail(savedFraudReport.getError());
            }

            return Result.ok();
        } catch (error) {
            console.log(error);
            return Result.fail('UNEXPECTED ERROR FROM DECLINE PAYMENT USECASE');
        }
    }
}
