import { AuthProviderType } from '@domain/entities/user/user.entity';
import { AuthProvider } from '@domain/value-objects/auth-provider.vo';
import { describe, expect, it } from 'vitest';

describe('AuthProvider Value Object', () => {
    it('should successfully create a valid local AuthProvider value object', () => {
        const authProvider = AuthProvider.createLocal('password');
        expect(authProvider.isSuccess).toBe(true);
        expect(authProvider.getValue().getType()).toBe(AuthProviderType.LOCAL);
        expect(authProvider.getValue().getPasswordHash().getValue()).toBe(
            'password',
        );
    });

    it('should successfully create a valid google AuthProvider value object', () => {
        const authProvider = AuthProvider.createOAuth(
            AuthProviderType.GOOGLE,
            'google-123',
        );
        expect(authProvider.isSuccess).toBe(true);
        expect(authProvider.getValue().getType()).toBe(AuthProviderType.GOOGLE);
        expect(authProvider.getValue().getProviderId()).toBe('google-123');
    });

    it('should fail to create a local AuthProvider value object if the password is not provided for local auth provider', () => {
        const authProvider = AuthProvider.createLocal('');
        expect(authProvider.isSuccess).toBe(false);
        expect(authProvider.getError()).toBe(
            'Password hash is required for local auth provider',
        );
    });

    it('should fail to create a google AuthProvider value object if the provider id is not provided for google auth provider', () => {
        const authProvider = AuthProvider.createOAuth(
            AuthProviderType.GOOGLE,
            '',
        );
        expect(authProvider.isSuccess).toBe(false);
        expect(authProvider.getError()).toBe(
            'Provider id is required for google auth provider',
        );
    });

    it('should fail to create a AuthProvider value object if the auth provider type is invalid', () => {
        const authProvider = AuthProvider.createOAuth(
            AuthProviderType.LOCAL,
            'google-123',
        );
        expect(authProvider.isSuccess).toBe(false);
        expect(authProvider.getError()).toBe(
            'Invalid auth provider type for OAuth',
        );
    });

    it('should fail to create a local AuthProvider value object if the password is not provided for local auth provider', () => {
        const authProvider = AuthProvider.createLocal('');
        expect(authProvider.isSuccess).toBe(false);
        expect(authProvider.getError()).toBe(
            'Password hash is required for local auth provider',
        );
    });
});
