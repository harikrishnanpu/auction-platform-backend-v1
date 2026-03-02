import { AuthProviderType } from '@domain/entities/user.entity';

export class AuthProvider {
  constructor(
    private readonly type: AuthProviderType,
    private readonly providerId: string,
  ) {}

  getType() {
    return this.type;
  }

  getProviderId() {
    return this.providerId;
  }
}
