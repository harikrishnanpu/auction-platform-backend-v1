import { describe, expect, it, vi } from 'vitest';
import { SendOtpUseCase } from '@application/usecases/otp/send-otp.usecase';
import { User, UserStatus } from '@domain/entities/user/user.entity';
import {
    Otp,
    OtpStatus,
    OtpPurpose,
    OtpChannel,
} from '@domain/entities/otp/otp.entity';
import { Email } from '@domain/value-objects/email.vo';
import { Phone } from '@domain/value-objects/phone.vo';
import { AuthProvider } from '@domain/value-objects/auth-provider.vo';
import { UserRole } from '@domain/value-objects/user-roles.vo';
import { OtpPolicyService } from '@domain/policies/otp/otp-policy.service';
import { Result } from '@domain/shared/result';
import { AUTH_MESSAGES } from '@presentation/constants/auth/auth.constants';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IOtpService } from '@application/interfaces/services/IOtpService';
import { IIdGeneratingService } from '@application/interfaces/services/IIdGeneratingService';
import { IOtpRepository } from '@domain/repositories/IOtpRepository';
import { IEmailService } from '@application/interfaces/services/IEmailService';

describe('SendOtpUseCase', () => {
    const dummyEmail = Email.create('john.doe@example.com').getValue();
    const dummyPhone = Phone.create('9876543210').getValue();
    const dummyAuthProvider = AuthProvider.createLocal('hash').getValue();
    const dummyRoles = [UserRole.USER];

    const createDummyUser = (status: UserStatus = UserStatus.ACTIVE) => {
        return User.create({
            id: 'user-123',
            name: 'John Doe',
            email: dummyEmail,
            phone: dummyPhone,
            address: '123 Main St',
            authProvider: dummyAuthProvider,
            roles: dummyRoles,
            status,
        }).getValue();
    };

    const mockUserRepository = {
        findByEmail: vi.fn(),
        findById: vi.fn(),
        findByPhone: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findAll: vi.fn(),
        findAllActive: vi.fn(),
        findAllActiveAndVerified: vi.fn(),
    } as unknown as IUserRepository;

    const mockOtpService = {
        generateOtp: vi.fn(),
    } as unknown as IOtpService;

    const mockIdGeneratingService = {
        generateId: vi.fn(),
    } as unknown as IIdGeneratingService;

    const mockOtpRepository = {
        findRecentOtpsByUserIdAndPurpose: vi.fn(),
        create: vi.fn(),
    } as unknown as IOtpRepository;

    const mockEmailService = {
        sendOtpEmail: vi.fn(),
    } as unknown as IEmailService;

    const otpPolicyService = new OtpPolicyService();

    const useCase = new SendOtpUseCase(
        mockUserRepository,
        mockOtpService,
        mockIdGeneratingService,
        mockOtpRepository,
        otpPolicyService,
        mockEmailService,
    );

    it('should fail if email format is invalid', async () => {
        const result = await useCase.execute({
            email: 'invalid-email',
            purpose: OtpPurpose.LOGIN,
            channel: OtpChannel.EMAIL,
        });

        expect(result.isSuccess).toBe(false);
        expect(result.getError()).toBe('Invalid email format');
    });

    it('should fail if user search returns a failure', async () => {
        vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(
            Result.fail('User not found'),
        );

        const result = await useCase.execute({
            email: 'john.doe@example.com',
            purpose: OtpPurpose.LOGIN,
            channel: OtpChannel.EMAIL,
        });

        expect(result.isSuccess).toBe(false);
        expect(result.getError()).toBe('User not found');
        expect(mockUserRepository.findByEmail).toHaveBeenCalled();
    });

    it('should fail if user is blocked', async () => {
        const blockedUser = createDummyUser(UserStatus.BLOCKED);
        vi.mocked(mockUserRepository.findByEmail).mockResolvedValueOnce(
            Result.ok(blockedUser),
        );

        const result = await useCase.execute({
            email: 'john.doe@example.com',
            purpose: OtpPurpose.LOGIN,
            channel: OtpChannel.EMAIL,
        });

        expect(result.isSuccess).toBe(false);
        expect(result.getError()).toBe(AUTH_MESSAGES.ACCOUNT_BLOCKED);
    });

    it('should fail if user is suspended', async () => {
        const suspendedUser = createDummyUser(UserStatus.SUSPENDED);
        vi.mocked(mockUserRepository.findByEmail).mockResolvedValueOnce(
            Result.ok(suspendedUser),
        );

        const result = await useCase.execute({
            email: 'john.doe@example.com',
            purpose: OtpPurpose.LOGIN,
            channel: OtpChannel.EMAIL,
        });

        expect(result.isSuccess).toBe(false);
        expect(result.getError()).toBe(AUTH_MESSAGES.ACCOUNT_SUSPENDED);
    });

    it('should fail if too many OTPs have been sent already (policy check)', async () => {
        const user = createDummyUser();
        vi.mocked(mockUserRepository.findByEmail).mockResolvedValueOnce(
            Result.ok(user),
        );

        const otp1 = Otp.create({
            id: 'o-1',
            userId: user.getId(),
            purpose: OtpPurpose.LOGIN,
            channel: OtpChannel.EMAIL,
            otp: '111111',
            expiresAt: new Date(Date.now() + 100000),
            status: OtpStatus.PENDING,
        }).getValue();

        const otp2 = Otp.create({
            id: 'o-2',
            userId: user.getId(),
            purpose: OtpPurpose.LOGIN,
            channel: OtpChannel.EMAIL,
            otp: '222222',
            expiresAt: new Date(Date.now() + 100000),
            status: OtpStatus.PENDING,
        }).getValue();

        const otp3 = Otp.create({
            id: 'o-3',
            userId: user.getId(),
            purpose: OtpPurpose.LOGIN,
            channel: OtpChannel.EMAIL,
            otp: '333333',
            expiresAt: new Date(Date.now() + 100000),
            status: OtpStatus.PENDING,
        }).getValue();

        vi.mocked(
            mockOtpRepository.findRecentOtpsByUserIdAndPurpose,
        ).mockResolvedValueOnce([otp1, otp2, otp3]);

        const result = await useCase.execute({
            email: 'john.doe@example.com',
            purpose: OtpPurpose.LOGIN,
            channel: OtpChannel.EMAIL,
        });

        expect(result.isSuccess).toBe(false);
        expect(result.getError()).toBe('Too many otps sent');
    });

    it('should successfully generate, save, and send an OTP when valid', async () => {
        const user = createDummyUser();
        vi.mocked(mockUserRepository.findByEmail).mockResolvedValueOnce(
            Result.ok(user),
        );
        vi.mocked(
            mockOtpRepository.findRecentOtpsByUserIdAndPurpose,
        ).mockResolvedValueOnce([]);
        vi.mocked(mockOtpService.generateOtp).mockReturnValueOnce('123456');
        vi.mocked(mockIdGeneratingService.generateId).mockReturnValueOnce(
            'generated-otp-id',
        );
        vi.mocked(mockOtpRepository.create).mockResolvedValueOnce(undefined);
        vi.mocked(mockEmailService.sendOtpEmail).mockResolvedValueOnce(
            undefined,
        );

        const result = await useCase.execute({
            email: 'john.doe@example.com',
            purpose: OtpPurpose.LOGIN,
            channel: OtpChannel.EMAIL,
        });

        expect(result.isSuccess).toBe(true);
        expect(mockOtpService.generateOtp).toHaveBeenCalled();
        expect(mockIdGeneratingService.generateId).toHaveBeenCalled();
        expect(mockOtpRepository.create).toHaveBeenCalled();
        expect(mockEmailService.sendOtpEmail).toHaveBeenCalledWith(
            user.getEmail(),
            '123456',
            OtpPurpose.LOGIN,
            expect.any(String),
        );
    });

    it('should fail and catch unexpected errors elegantly', async () => {
        vi.mocked(mockUserRepository.findByEmail).mockRejectedValueOnce(
            new Error('Database exploded'),
        );

        const result = await useCase.execute({
            email: 'john.doe@example.com',
            purpose: OtpPurpose.LOGIN,
            channel: OtpChannel.EMAIL,
        });

        expect(result.isSuccess).toBe(false);
        expect(result.getError()).toBe(
            'UNEXPECTED ERROR FROM SEND OTP USECASE',
        );
    });
});
