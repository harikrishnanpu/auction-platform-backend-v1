import { describe, expect, it } from 'vitest';
import { Kyc, KycStatus, KycFor } from '@domain/entities/kyc/kyc.entity';

describe('Kyc Domain Entity', () => {
    it('should successfully create a Kyc entity', () => {
        const kycResult = Kyc.create({
            id: 'kyc-1',
            userId: 'user-1',
            kycStatus: KycStatus.NOT_SUBMITTED,
            kycFor: KycFor.SELLER,
        });

        expect(kycResult.isSuccess).toBe(true);
        expect(kycResult.getValue().getStatus()).toBe(KycStatus.NOT_SUBMITTED);
    });

    it('should support submitting kyc, transitioning to PENDING', () => {
        const kyc = Kyc.create({
            id: 'kyc-1',
            userId: 'user-1',
            kycStatus: KycStatus.NOT_SUBMITTED,
            kycFor: KycFor.SELLER,
        }).getValue();

        const submitResult = kyc.submitKyc();
        expect(submitResult.isSuccess).toBe(true);
        expect(kyc.getStatus()).toBe(KycStatus.PENDING);
    });

    it('should support approving pending kyc', () => {
        const kyc = Kyc.create({
            id: 'kyc-1',
            userId: 'user-1',
            kycStatus: KycStatus.PENDING,
            kycFor: KycFor.SELLER,
        }).getValue();

        const approveResult = kyc.approveKyc();
        expect(approveResult.isSuccess).toBe(true);
        expect(kyc.getStatus()).toBe(KycStatus.APPROVED);
    });

    it('should support rejecting pending kyc', () => {
        const kyc = Kyc.create({
            id: 'kyc-1',
            userId: 'user-1',
            kycStatus: KycStatus.PENDING,
            kycFor: KycFor.SELLER,
        }).getValue();

        const rejectResult = kyc.rejectKyc('Documents incomplete');
        expect(rejectResult.isSuccess).toBe(true);
        expect(kyc.getStatus()).toBe(KycStatus.REJECTED);
        expect(kyc.getRejectionReason()).toBe('Documents incomplete');
    });

    it('should support resetting rejected kyc for resubmission', () => {
        const kyc = Kyc.create({
            id: 'kyc-1',
            userId: 'user-1',
            kycStatus: KycStatus.REJECTED,
            kycFor: KycFor.SELLER,
            rejectionReason: 'Documents incomplete',
        }).getValue();

        const resetResult = kyc.resetForResubmission();
        expect(resetResult.isSuccess).toBe(true);
        expect(kyc.getStatus()).toBe(KycStatus.NOT_SUBMITTED);
        expect(kyc.getRejectionReason()).toBeNull();
    });
});
