import { describe, expect, it, vi } from 'vitest';
import { GetOrCreateWalletUsecase } from '@application/usecases/wallet/getOrCreateWallet.usecase';
import { Wallet, WalletCurrency } from '@domain/entities/wallet/wallet.entity';
import { Result } from '@domain/shared/result';
import { IWalletRepository } from '@domain/repositories/IWalletRepository';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';

describe('GetOrCreateWalletUsecase', () => {
    const mockWalletRepository = {
        findByUserId: vi.fn(),
        save: vi.fn(),
    } as unknown as IWalletRepository;

    const mockIdGeneratingService = {
        generateId: vi.fn(),
    } as unknown as IIdGeneratingService;

    const useCase = new GetOrCreateWalletUsecase(
        mockWalletRepository,
        mockIdGeneratingService,
    );

    const createDummyWallet = () => {
        return Wallet.create({
            id: 'wal-123',
            userId: 'user-123',
            mainBalance: 1200,
            heldBalance: 50,
            currency: WalletCurrency.INR,
        }).getValue();
    };

    it('should fail if repository findByUserId fails', async () => {
        vi.mocked(mockWalletRepository.findByUserId).mockResolvedValueOnce(
            Result.fail('Database failure'),
        );

        const result = await useCase.execute({
            userId: 'user-123',
        });

        expect(result.isSuccess).toBe(false);
        expect(result.getError()).toBe('Database failure');
        expect(mockWalletRepository.findByUserId).toHaveBeenCalledWith(
            'user-123',
        );
    });

    it('should return the existing wallet if it is found in repository', async () => {
        const existingWallet = createDummyWallet();
        vi.mocked(mockWalletRepository.findByUserId).mockResolvedValueOnce(
            Result.ok(existingWallet),
        );

        const result = await useCase.execute({
            userId: 'user-123',
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue()).toEqual({
            id: 'wal-123',
            userId: 'user-123',
            mainBalance: 1200,
            heldBalance: 50,
            currency: WalletCurrency.INR,
        });
        expect(mockWalletRepository.save).not.toHaveBeenCalled();
    });

    it('should create a new wallet, save it to the repository and return it when it does not exist yet', async () => {
        vi.mocked(mockWalletRepository.findByUserId).mockResolvedValueOnce(
            Result.ok(null),
        );
        vi.mocked(mockIdGeneratingService.generateId).mockReturnValueOnce(
            'new-wallet-id',
        );
        vi.mocked(mockWalletRepository.save).mockResolvedValueOnce(Result.ok());

        const result = await useCase.execute({
            userId: 'user-123',
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue()).toEqual({
            id: 'new-wallet-id',
            userId: 'user-123',
            mainBalance: 0,
            heldBalance: 0,
            currency: WalletCurrency.INR,
        });
        expect(mockIdGeneratingService.generateId).toHaveBeenCalled();
        expect(mockWalletRepository.save).toHaveBeenCalled();
    });

    it('should fail if saving a newly created wallet fails in the repository', async () => {
        vi.mocked(mockWalletRepository.findByUserId).mockResolvedValueOnce(
            Result.ok(null),
        );
        vi.mocked(mockIdGeneratingService.generateId).mockReturnValueOnce(
            'new-wallet-id',
        );
        vi.mocked(mockWalletRepository.save).mockResolvedValueOnce(
            Result.fail('Failed to save newly created wallet'),
        );

        const result = await useCase.execute({
            userId: 'user-123',
        });

        expect(result.isSuccess).toBe(false);
        expect(result.getError()).toBe('Failed to save newly created wallet');
    });
});
