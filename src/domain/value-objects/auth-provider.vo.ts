import { AuthProviderType } from '@domain/entities/user/user.entity';
import { Result } from '@domain/shared/result';

export class AuthProvider {
  private constructor(
    private readonly type: AuthProviderType,
    private readonly providerId: string | null,
    private readonly passwordHash?: string,
  ) {}

  public static createLocal(passwordHash: string): AuthProvider {
    return new AuthProvider(AuthProviderType.LOCAL, null, passwordHash);
  }

  public static createOAuth(
    type: AuthProviderType,
    providerId: string,
  ): AuthProvider {
    if (type === AuthProviderType.LOCAL) {
      Result.fail('Invalid auth provider type for OAuth');
    }

    return new AuthProvider(type, providerId);
  }

  getType() {
    return this.type;
  }

  getProviderId() {
    return this.providerId;
  }
}
