import { ISellerDashboardStatsDto } from '@application/dtos/seller/sellerDashboardStats.dto';
import { IGetSellerDashboardStatsUsecase } from '@application/interfaces/usecases/seller/IGetSellerDashboardStatsUsecase';
import { TYPES } from '@di/types.di';
import { Result } from '@domain/shared/result';
import { PaymentFor, PaymentStatus, PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

@injectable()
export class GetSellerDashboardStatsUsecase implements IGetSellerDashboardStatsUsecase {
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
    ) {}

    async execute(input: {
        sellerId: string;
    }): Promise<Result<ISellerDashboardStatsDto>> {
        const sellerId = input.sellerId;

        try {
            const [byAuctionStatus, sellerAuctions] = await Promise.all([
                this._prisma.auction.groupBy({
                    by: ['status'],
                    where: { sellerId },
                    _count: { _all: true },
                }),
                this._prisma.auction.findMany({
                    where: { sellerId },
                    select: { id: true },
                }),
            ]);

            const auctionRows = byAuctionStatus.map((r) => ({
                status: r.status,
                count: r._count._all,
            }));

            const totalAuctions = auctionRows.reduce((s, r) => s + r.count, 0);
            const liveListingsCount = auctionRows.reduce((sum, row) => {
                if (row.status === 'ACTIVE' || row.status === 'PAUSED') {
                    return sum + row.count;
                }
                return sum;
            }, 0);

            const auctionIds = sellerAuctions.map((a) => a.id);

            let paymentByStatus: Array<{ status: string; count: number }> = [];
            let paymentTotal = 0;
            let completedAmountSum = 0;

            if (auctionIds.length > 0) {
                const [grouped, sumAgg] = await Promise.all([
                    this._prisma.payments.groupBy({
                        by: ['status'],
                        where: {
                            for: PaymentFor.AUCTION,
                            referenceId: { in: auctionIds },
                        },
                        _count: { _all: true },
                    }),
                    this._prisma.payments.aggregate({
                        where: {
                            for: PaymentFor.AUCTION,
                            referenceId: { in: auctionIds },
                            status: PaymentStatus.COMPLETED,
                        },
                        _sum: { amount: true },
                    }),
                ]);

                paymentByStatus = grouped.map((g) => ({
                    status: g.status,
                    count: g._count._all,
                }));
                paymentTotal = paymentByStatus.reduce((s, r) => s + r.count, 0);
                completedAmountSum = sumAgg._sum.amount ?? 0;
            }

            return Result.ok({
                auctions: {
                    total: totalAuctions,
                    byStatus: auctionRows.map((r) => ({
                        status: r.status,
                        count: r.count,
                    })),
                    liveListingsCount,
                },
                payments: {
                    total: paymentTotal,
                    byStatus: paymentByStatus.map((r) => ({
                        status: r.status,
                        count: r.count,
                    })),
                    completedAmountSum,
                },
            });
        } catch {
            return Result.fail('Failed to load seller dashboard stats');
        }
    }
}
