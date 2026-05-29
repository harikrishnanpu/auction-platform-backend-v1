import { describe, expect, it } from 'vitest';
import {
    Payments,
    PaymentStatus,
    PaymentFor,
    PaymentPhase,
} from '@domain/entities/payments/payments.entity';

describe('Payments Domain Entity', () => {
    it('should successfully create a valid Payments entity', () => {
        const paymentResult = Payments.create({
            id: 'pay-1',
            userId: 'user-1',
            amount: 500,
            currency: 'INR',
            status: PaymentStatus.PENDING,
            forPayment: PaymentFor.AUCTION,
            referenceId: 'ref-1',
            phase: PaymentPhase.DEPOSIT,
            dueAt: new Date(Date.now() + 86400000),
        });

        expect(paymentResult.isSuccess).toBe(true);
        expect(paymentResult.getValue().getAmount()).toBe(500);
        expect(paymentResult.getValue().getStatus()).toBe(
            PaymentStatus.PENDING,
        );
    });

    it('should fail to create a Payments entity if amount is 0 or negative', () => {
        const paymentResult = Payments.create({
            id: 'pay-1',
            userId: 'user-1',
            amount: 0,
            currency: 'INR',
            status: PaymentStatus.PENDING,
            forPayment: PaymentFor.AUCTION,
            referenceId: 'ref-1',
            phase: PaymentPhase.DEPOSIT,
            dueAt: new Date(Date.now() + 86400000),
        });

        expect(paymentResult.isSuccess).toBe(false);
        expect(paymentResult.getError()).toBe(
            'Payment amount must be greater than 0',
        );
    });

    it('should transition status to COMPLETED', () => {
        const payment = Payments.create({
            id: 'pay-1',
            userId: 'user-1',
            amount: 500,
            currency: 'INR',
            status: PaymentStatus.PENDING,
            forPayment: PaymentFor.AUCTION,
            referenceId: 'ref-1',
            phase: PaymentPhase.DEPOSIT,
            dueAt: new Date(Date.now() + 86400000),
        }).getValue();

        const completeResult = payment.markAsCompleted();
        expect(completeResult.isSuccess).toBe(true);
        expect(payment.getStatus()).toBe(PaymentStatus.COMPLETED);
    });

    it('should transition status to DECLINED', () => {
        const payment = Payments.create({
            id: 'pay-1',
            userId: 'user-1',
            amount: 500,
            currency: 'INR',
            status: PaymentStatus.PENDING,
            forPayment: PaymentFor.AUCTION,
            referenceId: 'ref-1',
            phase: PaymentPhase.DEPOSIT,
            dueAt: new Date(Date.now() + 86400000),
        }).getValue();

        const declineResult = payment.markAsDeclined();
        expect(declineResult.isSuccess).toBe(true);
        expect(payment.getStatus()).toBe(PaymentStatus.DECLINED);
    });
});
