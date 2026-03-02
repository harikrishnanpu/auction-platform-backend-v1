import { AuthProvider } from '@domain/value-objects/auth-provider.vo';
import { Email } from '@domain/value-objects/email.vo';
import { Kyc } from '@domain/value-objects/kyc.vo';
import { UserRole } from '@domain/value-objects/user-roles.vo';

export enum UserRoleEnum {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
}

export enum AuthProviderType {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
}

export class User {
  private roles: Set<UserRole>;
  private kyc?: Kyc;
  private status: UserStatus;

  constructor(
    private readonly id: string,
    private name: string,
    private readonly email: Email,
    private readonly authProvider: AuthProvider,
    roles: UserRole[],
    status: UserStatus = UserStatus.ACTIVE,
    kyc?: Kyc,
  ) {
    if (roles.length === 0) {
      throw new Error('User must have at least one role');
    }

    this.roles = new Set(roles);
    this.status = status;
    this.kyc = kyc;
  }

  public addRole(role: UserRole) {
    if (role.equals(UserRole.SELLER)) {
      if (!this.kyc || !this.kyc.isVerified()) {
        throw new Error('invalid role assignment: kyc verification required');
      }
    }

    this.roles.add(role);
  }

  public removeRole(role: UserRole) {
    this.roles.delete(role);
  }

  public verifyKyc() {
    if (!this.kyc) {
      throw new Error('No KYC submitted');
    }

    this.kyc = this.kyc.verify();
  }

  public submitKyc(documentId: string) {
    this.kyc = new Kyc(false, documentId);
  }

  public hasRole(role: UserRole): boolean {
    return Array.from(this.roles).some((r) => r.equals(role));
  }

  public suspend() {
    this.status = UserStatus.SUSPENDED;
  }

  public isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  public getId() {
    return this.id;
  }

  public getEmail() {
    return this.email.getValue();
  }
}
