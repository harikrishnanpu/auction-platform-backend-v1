import { Result } from '@domain/shared/result';

export enum WalletCurrency {
    INR = 'INR',
    USD = 'USD',
}

export class Wallet {
    constructor(
        private readonly id: string,
        private readonly userId: string,
        private mainBalance: number,
        private heldBalance: number,
        private readonly currency: WalletCurrency,
    ) {}

    static create({
        id,
        userId,
        mainBalance = 0,
        heldBalance = 0,
        currency = WalletCurrency.INR,
    }: {
        id: string;
        userId: string;
        mainBalance?: number;
        heldBalance?: number;
        currency?: WalletCurrency;
    }): Result<Wallet> {
        if (mainBalance < 0) {
            return Result.fail('Wallet balance cannot be negative');
        }

        if (heldBalance < 0) {
            return Result.fail('Wallet held balance cannot be negative');
        }

        return Result.ok(
            new Wallet(id, userId, mainBalance, heldBalance, currency),
        );
    }

    getId(): string {
        return this.id;
    }

    getUserId(): string {
        return this.userId;
    }

    getMainBalance(): number {
        return this.mainBalance;
    }

    getHeldBalance(): number {
        return this.heldBalance;
    }

    getTotalBalance(): number {
        return this.mainBalance + this.heldBalance;
    }

    getCurrency(): WalletCurrency {
        return this.currency;
    }

    addToMainBalance(amount: number): Result<void> {
        this.mainBalance += amount;
        return Result.ok();
    }

    debitFromMainBalance(amount: number): Result<void> {
        this.mainBalance -= amount;
        return Result.ok();
    }

    holdFromMainBalance(amount: number): Result<void> {
        if (this.mainBalance < amount) {
            return Result.fail('Insufficient wallet balance');
        }
        this.mainBalance -= amount;
        this.heldBalance += amount;
        return Result.ok();
    }

    releaseHeldBalance(amount: number): Result<void> {
        this.heldBalance -= amount;
        this.mainBalance += amount;
        return Result.ok();
    }
}
