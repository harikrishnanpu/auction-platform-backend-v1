import { describe, expect, it } from 'vitest';
import { User, UserStatus } from '@domain/entities/user/user.entity';
import { Email } from '@domain/value-objects/email.vo';
import { Phone } from '@domain/value-objects/phone.vo';
import { AuthProvider } from '@domain/value-objects/auth-provider.vo';
import { UserRole } from '@domain/value-objects/user-roles.vo';

describe('User Domain Entity', () => {
    const dummyEmail = Email.create('john.doe@example.com').getValue();
    const dummyPhone = Phone.create('9876543210').getValue();
    const dummyAuthProvider = AuthProvider.createLocal('hash').getValue();
    const dummyRoles = [UserRole.USER];

    it('should successfully create a valid User entity', () => {
        const userResult = User.create({
            id: 'user-123',
            name: 'John Doe',
            email: dummyEmail,
            phone: dummyPhone,
            address: '123 Main St',
            authProvider: dummyAuthProvider,
            roles: dummyRoles,
            status: UserStatus.ACTIVE,
        });

        expect(userResult.isSuccess).toBe(true);
        expect(userResult.isFailure).toBe(false);
        expect(userResult.getValue().getId()).toBe('user-123');
        expect(userResult.getValue().getName()).toBe('John Doe');
        expect(userResult.getValue().isActive()).toBe(true);
        expect(userResult.getValue().isProfileCompleted()).toBe(true);
    });

    it('should fail to create a User if name is under 3 characters', () => {
        const userResult = User.create({
            id: 'user-123',
            name: 'Jo',
            email: dummyEmail,
            phone: dummyPhone,
            address: '123 Main St',
            authProvider: dummyAuthProvider,
            roles: dummyRoles,
            status: UserStatus.ACTIVE,
        });

        expect(userResult.isSuccess).toBe(false);
        expect(userResult.isFailure).toBe(true);
        expect(userResult.getError()).toBe(
            'name must be at least 3 characters long',
        );
    });

    it('should fail to create a User if roles is empty', () => {
        const userResult = User.create({
            id: 'user-123',
            name: 'John Doe',
            email: dummyEmail,
            phone: dummyPhone,
            address: '123 Main St',
            authProvider: dummyAuthProvider,
            roles: [],
            status: UserStatus.ACTIVE,
        });

        expect(userResult.isSuccess).toBe(false);
        expect(userResult.isFailure).toBe(true);
        expect(userResult.getError()).toBe('roles must be at least 1');
    });

    it('should support roles addition, deletion, and checks', () => {
        const user = User.create({
            id: 'user-123',
            name: 'John Doe',
            email: dummyEmail,
            phone: dummyPhone,
            address: '123 Main St',
            authProvider: dummyAuthProvider,
            roles: [UserRole.USER],
            status: UserStatus.ACTIVE,
        }).getValue();

        expect(user.hasRole(UserRole.USER)).toBe(true);
        expect(user.hasRole(UserRole.ADMIN)).toBe(false);

        user.addRole(UserRole.ADMIN);
        expect(user.hasRole(UserRole.ADMIN)).toBe(true);

        user.removeRole(UserRole.USER);
        expect(user.hasRole(UserRole.USER)).toBe(false);
    });

    it('should support status suspension', () => {
        const user = User.create({
            id: 'user-123',
            name: 'John Doe',
            email: dummyEmail,
            phone: dummyPhone,
            address: '123 Main St',
            authProvider: dummyAuthProvider,
            roles: dummyRoles,
            status: UserStatus.ACTIVE,
        }).getValue();

        expect(user.isActive()).toBe(true);
        expect(user.isSuspended()).toBe(false);

        user.suspend();
        expect(user.isActive()).toBe(false);
        expect(user.isSuspended()).toBe(true);
    });
});
