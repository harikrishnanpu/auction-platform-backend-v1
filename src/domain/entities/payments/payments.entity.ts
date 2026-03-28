import { Result } from '@domain/shared/result';

export enum PaymentFor {
    AUCTION = 'AUCTION',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export enum PaymentPhase {
    DEPOSIT = 'DEPOSIT',
    BALANCE = 'BALANCE',
}

export class Payments {
    constructor(
        private readonly id: string,
        private readonly userId: string,
        private readonly amount: number,
        private readonly currency: string,
        private status: PaymentStatus,
        private readonly forPayment: PaymentFor,
        private readonly referenceId: string,
        private readonly phase: PaymentPhase,
        private readonly dueAt: Date,
        private readonly createdAt: Date,
    ) {}

    static create({
        id,
        userId,
        amount,
        currency,
        status,
        forPayment,
        referenceId,
        phase,
        dueAt,
        createdAt = new Date(),
    }: {
        id: string;
        userId: string;
        amount: number;
        currency: string;
        status: PaymentStatus;
        forPayment: PaymentFor;
        referenceId: string;
        phase: PaymentPhase;
        dueAt: Date;
        createdAt?: Date;
    }): Result<Payments> {
        if (amount <= 0)
            return Result.fail('Payment amount must be greater than 0');

        return Result.ok(
            new Payments(
                id,
                userId,
                amount,
                currency,
                status,
                forPayment,
                referenceId,
                phase,
                dueAt,
                createdAt,
            ),
        );
    }

    markAsCompleted(): Result<void> {
        if (this.status !== PaymentStatus.PENDING) {
            return Result.fail('Payment is not pending');
        }

        this.status = PaymentStatus.COMPLETED;
        return Result.ok();
    }

    getId(): string {
        return this.id;
    }

    getUserId(): string {
        return this.userId;
    }

    getAmount(): number {
        return this.amount;
    }

    getPhase(): PaymentPhase {
        return this.phase;
    }

    getDueAt(): Date {
        return this.dueAt;
    }

    getCurrency(): string {
        return this.currency;
    }

    getStatus(): PaymentStatus {
        return this.status;
    }

    getForPayment(): PaymentFor {
        return this.forPayment;
    }

    getReferenceId(): string {
        return this.referenceId;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }
}
