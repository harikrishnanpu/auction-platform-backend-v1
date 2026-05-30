import { describe, expect, it, vi } from 'vitest';
import { CreditWalletUsecase } from '@application/usecases/wallet/creditWallet.usecase';
import { Wallet, WalletCurrency } from '@domain/entities/wallet/wallet.entity';
import { Result } from '@domain/shared/result';
import { IWalletRepository } from '@domain/repositories/IWalletRepository';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IWalletTransactionsRepository } from '@domain/repositories/IWallettransactionsRepo';

describe('CreditWalletUsecase', () => {
    const mockWalletRepository = {
        findByUserId: vi.fn(),
        save: vi.fn(),
    } as unknown as IWalletRepository;

    const mockIdGeneratingService = {
        generateId: vi.fn(),
    } as unknown as IIdGeneratingService;

    const mockWalletTransactionsRepository = {
        create: vi.fn(),
    } as unknown as IWalletTransactionsRepository;

    const useCase = new CreditWalletUsecase(
        mockWalletRepository,
        mockIdGeneratingService,
        mockWalletTransactionsRepository,
    );

    const createDummyWallet = () => {
        return Wallet.create({
            id: 'wal-123',
            userId: 'user-123',
            mainBalance: 1000,
            heldBalance: 0,
            currency: WalletCurrency.INR,
        }).getValue();
    };

    it('should fail if findByUserId returns a failure result', async () => {
        vi.mocked(mockWalletRepository.findByUserId).mockResolvedValueOnce(
            Result.fail('Database failure'),
        );

        const result = await useCase.execute({
            userId: 'user-123',
            amount: 500,
        });

        expect(result.isSuccess).toBe(false);
        expect(result.getError()).toBe('Database failure');
        expect(mockWalletRepository.findByUserId).toHaveBeenCalledWith(
            'user-123',
        );
    });

    it('should fail if wallet is not found', async () => {
        vi.mocked(mockWalletRepository.findByUserId).mockResolvedValueOnce(
            Result.ok(null),
        );

        const result = await useCase.execute({
            userId: 'user-123',
            amount: 500,
        });

        expect(result.isSuccess).toBe(false);
        expect(result.getError()).toBe('Wallet not found');
    });

    it('should fail if wallet transaction creation fails due to invalid amount (e.g. negative amount)', async () => {
        const wallet = createDummyWallet();
        vi.mocked(mockWalletRepository.findByUserId).mockResolvedValueOnce(
            Result.ok(wallet),
        );
        vi.mocked(mockIdGeneratingService.generateId).mockReturnValueOnce(
            'tx-123',
        );

        const result = await useCase.execute({
            userId: 'user-123',
            amount: -100, // Invalid negative amount for DEPOSIT
        });

        expect(result.isSuccess).toBe(false);
        expect(result.getError()).toBe('Amount must be greater than 0');
    });

    it('should fail if repository fails to save updated wallet', async () => {
        const wallet = createDummyWallet();
        vi.mocked(mockWalletRepository.findByUserId).mockResolvedValueOnce(
            Result.ok(wallet),
        );
        vi.mocked(mockIdGeneratingService.generateId).mockReturnValueOnce(
            'tx-123',
        );
        vi.mocked(
            mockWalletTransactionsRepository.create,
        ).mockResolvedValueOnce(undefined);
        vi.mocked(mockWalletRepository.save).mockResolvedValueOnce(
            Result.fail('Save failed'),
        );

        const result = await useCase.execute({
            userId: 'user-123',
            amount: 500,
        });

        expect(result.isSuccess).toBe(false);
        expect(result.getError()).toBe('Save failed');
    });

    it('should successfully credit wallet, save balance, create transaction record and return updated details', async () => {
        const wallet = createDummyWallet();
        vi.mocked(mockWalletRepository.findByUserId).mockResolvedValueOnce(
            Result.ok(wallet),
        );
        vi.mocked(mockIdGeneratingService.generateId).mockReturnValueOnce(
            'tx-123',
        );
        vi.mocked(
            mockWalletTransactionsRepository.create,
        ).mockResolvedValueOnce(undefined);
        vi.mocked(mockWalletRepository.save).mockResolvedValueOnce(Result.ok());

        const result = await useCase.execute({
            userId: 'user-123',
            amount: 500,
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue()).toEqual({
            id: 'wal-123',
            userId: 'user-123',
            mainBalance: 1500,
            heldBalance: 0,
            currency: WalletCurrency.INR,
        });
        expect(mockWalletTransactionsRepository.create).toHaveBeenCalled();
        expect(mockWalletRepository.save).toHaveBeenCalledWith(wallet);
    });
});
