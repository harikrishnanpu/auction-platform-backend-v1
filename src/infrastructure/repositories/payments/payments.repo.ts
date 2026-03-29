import { TYPES } from '@di/types.di';
import {
    PaymentFor,
    PaymentPhase,
    PaymentStatus,
    Payments,
} from '@domain/entities/payments/payments.entity';
import {
    IFindSellerAuctionPaymentsOptions,
    IFindSellerAuctionPaymentsResult,
    IFindUserPayments,
    IFindUserPaymentsResult,
    IPaymentRepository,
    ISellerAuctionPaymentRow,
} from '@domain/repositories/IPaymentRepository';
import { Result } from '@domain/shared/result';
import { PaymentsMapper } from '@infrastructure/mappers/payments/payments.mapper';
import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';

@injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly _prisma: PrismaClient,
    ) {}

    async create(payment: Payments): Promise<Result<Payments>> {
        const saved = await this._prisma.payments.create({
            data: {
                id: payment.getId(),
                userId: payment.getUserId(),
                amount: payment.getAmount(),
                currency: payment.getCurrency(),
                status: payment.getStatus(),
                for: payment.getForPayment(),
                referenceId: payment.getReferenceId(),
                phase: payment.getPhase(),
                dueAt: payment.getDueAt(),
            },
        });

        return PaymentsMapper.toDomain(saved);
    }

    async update(payment: Payments): Promise<Result<Payments>> {
        const result = await this._prisma.payments.update({
            where: { id: payment.getId() },
            data: {
                status: payment.getStatus(),
            },
        });

        return PaymentsMapper.toDomain(result);
    }

    async findById(id: string): Promise<Result<Payments | null>> {
        const payment = await this._prisma.payments.findUnique({
            where: { id },
        });

        if (!payment) return Result.ok(null);
        return PaymentsMapper.toDomain(payment);
    }

    async findByReferenceAndUserId(
        referenceId: string,
        userId: string,
    ): Promise<Result<Payments | null>> {
        const payment = await this._prisma.payments.findFirst({
            where: { referenceId, userId },
            orderBy: { createdAt: 'desc' },
        });

        if (!payment) return Result.ok(null);
        return PaymentsMapper.toDomain(payment);
    }

    async findByReferenceUserAndPhase(
        referenceId: string,
        userId: string,
        phase: PaymentPhase,
    ): Promise<Result<Payments | null>> {
        const payment = await this._prisma.payments.findUnique({
            where: {
                referenceId_userId_phase: {
                    referenceId,
                    userId,
                    phase,
                },
            },
        });

        if (!payment) return Result.ok(null);
        return PaymentsMapper.toDomain(payment);
    }

    async findByUserId(
        userId: string,
        filters: IFindUserPayments,
    ): Promise<Result<IFindUserPaymentsResult>> {
        const where = { userId };

        const [rows, total] = await Promise.all([
            this._prisma.payments.findMany({
                where: {
                    ...where,
                    status:
                        filters.status === 'ALL' ? undefined : filters.status,
                },
                orderBy: { createdAt: 'desc' },
                skip: (filters.page - 1) * filters.limit,
                take: filters.limit,
            }),

            this._prisma.payments.count({ where }),
        ]);

        const payments: Payments[] = rows
            .map(PaymentsMapper.toDomain)
            .map((result) => result.getValue());
        return Result.ok({ payments, total });
    }

    async declineAllPendingForAuctionUser(
        auctionId: string,
        userId: string,
    ): Promise<Result<void>> {
        try {
            await this._prisma.payments.updateMany({
                where: {
                    referenceId: auctionId,
                    userId,
                    for: PaymentFor.AUCTION,
                    status: PaymentStatus.PENDING,
                },
                data: {
                    status: PaymentStatus.DECLINED,
                },
            });
            return Result.ok();
        } catch (e) {
            return Result.fail(
                e instanceof Error
                    ? e.message
                    : 'Failed to decline pending payments',
            );
        }
    }

    async findBySellerAuctions(
        sellerId: string,
        options: IFindSellerAuctionPaymentsOptions,
    ): Promise<Result<IFindSellerAuctionPaymentsResult>> {
        try {
            const auctions = await this._prisma.auction.findMany({
                where: { sellerId },
                select: { id: true, title: true },
            });

            const idToTitle = new Map(
                auctions.map((a) => [a.id, a.title] as const),
            );
            const auctionIds = auctions.map((a) => a.id);

            if (auctionIds.length === 0) {
                return Result.ok({ items: [], total: 0 });
            }

            const statusFilter =
                options.status === 'ALL' ? undefined : options.status;

            const where = {
                for: PaymentFor.AUCTION,
                referenceId: { in: auctionIds },
                ...(statusFilter ? { status: statusFilter } : {}),
            };

            const [rows, total] = await Promise.all([
                this._prisma.payments.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip: (options.page - 1) * options.limit,
                    take: options.limit,
                }),
                this._prisma.payments.count({ where }),
            ]);

            const items: ISellerAuctionPaymentRow[] = [];
            for (const raw of rows) {
                const mapped = PaymentsMapper.toDomain(raw);
                if (mapped.isFailure) {
                    return Result.fail(mapped.getError());
                }
                items.push({
                    payment: mapped.getValue(),
                    auctionTitle:
                        idToTitle.get(raw.referenceId) ?? 'Unknown auction',
                });
            }

            return Result.ok({ items, total });
        } catch (e) {
            return Result.fail(
                e instanceof Error
                    ? e.message
                    : 'Failed to load seller auction payments',
            );
        }
    }
}
