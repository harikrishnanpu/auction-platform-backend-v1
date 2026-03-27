import { Result } from '@domain/shared/result';

export enum WalletTransactionType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAWAL = 'WITHDRAWAL',
    TRANSFER = 'TRANSFER',
    HOLD = 'HOLD',
    RELEASE = 'RELEASE',
}

export class WalletTransaction {
    constructor(
        private readonly id: string,
        private readonly walletId: string,
        private readonly amount: number,
        private readonly type: WalletTransactionType,
        private readonly createdAt: Date,
    ) {}

    static create({
        id,
        walletId,
        amount,
        type,
        createdAt = new Date(),
    }: {
        id: string;
        walletId: string;
        amount: number;
        type: WalletTransactionType;
        createdAt?: Date;
    }): Result<WalletTransaction> {
        return Result.ok(
            new WalletTransaction(id, walletId, amount, type, createdAt),
        );
    }

    getId(): string {
        return this.id;
    }

    getWalletId(): string {
        return this.walletId;
    }

    getAmount(): number {
        return this.amount;
    }

    getType(): WalletTransactionType {
        return this.type;
    }
}
