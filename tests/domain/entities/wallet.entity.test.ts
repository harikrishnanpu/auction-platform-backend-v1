import { describe, expect, it } from 'vitest';
import { Wallet, WalletCurrency } from '@domain/entities/wallet/wallet.entity';

describe('Wallet Domain Entity', () => {
    it('should successfully create a valid Wallet entity', () => {
        const walletResult = Wallet.create({
            id: 'wal-1',
            userId: 'user-1',
            mainBalance: 1000,
            heldBalance: 200,
            currency: WalletCurrency.INR,
        });

        expect(walletResult.isSuccess).toBe(true);
        expect(walletResult.getValue().getMainBalance()).toBe(1000);
        expect(walletResult.getValue().getHeldBalance()).toBe(200);
        expect(walletResult.getValue().getTotalBalance()).toBe(1200);
        expect(walletResult.getValue().getCurrency()).toBe(WalletCurrency.INR);
    });

    it('should fail to create a Wallet if mainBalance is negative', () => {
        const walletResult = Wallet.create({
            id: 'wal-1',
            userId: 'user-1',
            mainBalance: -100,
        });

        expect(walletResult.isSuccess).toBe(false);
        expect(walletResult.getError()).toBe(
            'Wallet balance cannot be negative',
        );
    });

    it('should fail to create a Wallet if heldBalance is negative', () => {
        const walletResult = Wallet.create({
            id: 'wal-1',
            userId: 'user-1',
            heldBalance: -50,
        });

        expect(walletResult.isSuccess).toBe(false);
        expect(walletResult.getError()).toBe(
            'Wallet held balance cannot be negative',
        );
    });

    it('should support adding and debiting balance', () => {
        const wallet = Wallet.create({
            id: 'wal-1',
            userId: 'user-1',
            mainBalance: 1000,
        }).getValue();

        wallet.addToMainBalance(500);
        expect(wallet.getMainBalance()).toBe(1500);

        wallet.debitFromMainBalance(300);
        expect(wallet.getMainBalance()).toBe(1200);
    });

    it('should support holding and releasing balance', () => {
        const wallet = Wallet.create({
            id: 'wal-1',
            userId: 'user-1',
            mainBalance: 1000,
            heldBalance: 0,
        }).getValue();

        const holdResult = wallet.holdFromMainBalance(300);
        expect(holdResult.isSuccess).toBe(true);
        expect(wallet.getMainBalance()).toBe(700);
        expect(wallet.getHeldBalance()).toBe(300);

        const releaseResult = wallet.releaseHeldBalance(100);
        expect(releaseResult.isSuccess).toBe(true);
        expect(wallet.getMainBalance()).toBe(800);
        expect(wallet.getHeldBalance()).toBe(200);
    });

    it('should reject hold from main balance if funds are insufficient', () => {
        const wallet = Wallet.create({
            id: 'wal-1',
            userId: 'user-1',
            mainBalance: 100,
        }).getValue();

        const holdResult = wallet.holdFromMainBalance(500);
        expect(holdResult.isSuccess).toBe(false);
        expect(holdResult.getError()).toBe('Insufficient wallet balance');
        expect(wallet.getMainBalance()).toBe(100);
        expect(wallet.getHeldBalance()).toBe(0);
    });
});
