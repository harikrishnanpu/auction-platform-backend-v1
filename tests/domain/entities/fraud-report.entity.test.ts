import { describe, expect, it } from 'vitest';
import {
    FraudReport,
    FraudReporterType,
    FraudReportCategory,
    FraudReportLevel,
    FraudReportStatus,
    FraudAdminDecision,
} from '@domain/entities/fraud/fraud-report.entity';
import { User, UserStatus } from '@domain/entities/user/user.entity';
import { Email } from '@domain/value-objects/email.vo';
import { Phone } from '@domain/value-objects/phone.vo';
import { AuthProvider } from '@domain/value-objects/auth-provider.vo';
import { UserRole } from '@domain/value-objects/user-roles.vo';

describe('FraudReport Domain Entity', () => {
    const dummyEmail = Email.create('john@example.com').getValue();
    const dummyPhone = Phone.create('9876543210').getValue();
    const dummyAuthProvider = AuthProvider.createLocal('hash').getValue();
    const dummyUser = User.create({
        id: 'user-1',
        name: 'John Doe',
        email: dummyEmail,
        phone: dummyPhone,
        authProvider: dummyAuthProvider,
        roles: [UserRole.USER],
        status: UserStatus.ACTIVE,
    }).getValue();

    it('should successfully create a FraudReport entity', () => {
        const reportResult = FraudReport.create({
            id: 'rep-1',
            reportedUserId: 'user-1',
            targetedUserId: 'user-2',
            reporterType: FraudReporterType.USER,
            category: FraudReportCategory.AUCTION_FRAUD_CRITICAL,
            level: FraudReportLevel.CRITICAL,
            reason: 'Fake bids',
            reportedUser: dummyUser,
            targetedUser: dummyUser,
            reviewedBy: null,
        });

        expect(reportResult.isSuccess).toBe(true);
        expect(reportResult.getValue().getStatus()).toBe(
            FraudReportStatus.OPEN,
        );
        expect(reportResult.getValue().getReason()).toBe('Fake bids');
    });

    it('should transition status to UNDER_REVIEW', () => {
        const report = FraudReport.create({
            id: 'rep-1',
            reportedUserId: 'user-1',
            targetedUserId: 'user-2',
            reporterType: FraudReporterType.USER,
            category: FraudReportCategory.AUCTION_FRAUD_CRITICAL,
            level: FraudReportLevel.CRITICAL,
            reason: 'Fake bids',
            reportedUser: dummyUser,
            targetedUser: dummyUser,
            reviewedBy: null,
        }).getValue();

        const reviewResult = report.markUnderReview();
        expect(reviewResult.isSuccess).toBe(true);
        expect(report.getStatus()).toBe(FraudReportStatus.UNDER_REVIEW);
    });

    it('should support resolution', () => {
        const report = FraudReport.create({
            id: 'rep-1',
            reportedUserId: 'user-1',
            targetedUserId: 'user-2',
            reporterType: FraudReporterType.USER,
            category: FraudReportCategory.AUCTION_FRAUD_CRITICAL,
            level: FraudReportLevel.CRITICAL,
            reason: 'Fake bids',
            reportedUser: dummyUser,
            targetedUser: dummyUser,
            reviewedBy: null,
        }).getValue();

        const resolveResult = report.resolve(
            'admin-1',
            FraudAdminDecision.FAULT_VERIFIED,
        );
        expect(resolveResult.isSuccess).toBe(true);
        expect(report.getStatus()).toBe(FraudReportStatus.RESOLVED);
        expect(report.getAdminDecision()).toBe(
            FraudAdminDecision.FAULT_VERIFIED,
        );
    });
});
