import {
    IGetSellerAuctionPaymentsInputDto,
    IGetSellerAuctionPaymentsOutputDto,
    ISellerAuctionPaymentItemDto,
} from '@application/dtos/seller/sellerAuctionPayments.dto';
import { IGetSellerAuctionPaymentsUsecase } from '@application/interfaces/usecases/seller/IGetSellerAuctionPaymentsUsecase';
import { TYPES } from '@di/types.di';
import { IPaymentRepository } from '@domain/repositories/IPaymentRepository';
import { Result } from '@domain/shared/result';
import { inject, injectable } from 'inversify';

@injectable()
export class GetSellerAuctionPaymentsUsecase implements IGetSellerAuctionPaymentsUsecase {
    constructor(
        @inject(TYPES.IPaymentRepository)
        private readonly _paymentRepository: IPaymentRepository,
    ) {}

    async execute(
        input: IGetSellerAuctionPaymentsInputDto,
    ): Promise<Result<IGetSellerAuctionPaymentsOutputDto>> {
        const found = await this._paymentRepository.findBySellerAuctions(
            input.sellerId,
            {
                status: input.status,
                page: input.page,
                limit: input.limit,
            },
        );

        if (found.isFailure) {
            return Result.fail(found.getError());
        }

        const { items, total } = found.getValue();
        const dtos: ISellerAuctionPaymentItemDto[] = items.map((row) => ({
            id: row.payment.getId(),
            amount: row.payment.getAmount(),
            currency: row.payment.getCurrency(),
            status: row.payment.getStatus(),
            phase: row.payment.getPhase(),
            dueAt: row.payment.getDueAt(),
            createdAt: row.payment.getCreatedAt(),
            auctionId: row.payment.getReferenceId(),
            auctionTitle: row.auctionTitle,
            buyerUserId: row.payment.getUserId(),
        }));

        const totalPages = Math.ceil(total / input.limit) || 1;

        return Result.ok({
            items: dtos,
            page: input.page,
            limit: input.limit,
            total,
            totalPages,
        });
    }
}
