import { Result } from '@domain/shared/result';
import { AuthProvider } from '@domain/value-objects/auth-provider.vo';
import { Email } from '@domain/value-objects/email.vo';
import { Kyc } from '@domain/value-objects/kyc.vo';
import { Phone } from '@domain/value-objects/phone.vo';
import { UserRole } from '@domain/value-objects/user-roles.vo';

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

  private constructor(
    private readonly id: string,
    private name: string,
    private readonly email: Email,
    private phone: Phone | null,
    private address: string | null,
    private avatar_url: string | null,
    private readonly authProvider: AuthProvider,
    roles: UserRole[],
    status: UserStatus = UserStatus.ACTIVE,
    kyc?: Kyc,
  ) {
    this.roles = new Set(roles);
    this.status = status;
    this.kyc = kyc;
  }

  public static create({
    id,
    name,
    email,
    phone = null,
    address = null,
    authProvider,
    avatar_url = null,
    roles = [],
    status,
  }: {
    id: string;
    name: string;
    email: Email;
    phone?: Phone | null;
    address?: string | null;
    authProvider: AuthProvider;
    avatar_url?: string | null;
    roles: UserRole[];
    status: UserStatus;
  }): Result<User> {
    if (!name.trim() || name.length < 3) {
      return Result.fail('name must be at least 3 characters long');
    }

    if (!roles || roles.length === 0) {
      return Result.fail('roles must be at least 1');
    }

    if (!status) {
      return Result.fail('status is required');
    }

    const user = new User(
      id,
      name,
      email,
      phone,
      address,
      avatar_url,
      authProvider,
      roles,
      status,
    );
    return Result.ok(user);
  }

  public addRole(role: UserRole) {
    if (role.equals(UserRole.SELLER)) {
      if (!this.kyc || !this.kyc.isVerified()) {
        return Result.fail(
          'invalid role assignment: kyc verification required',
        );
      }
    }

    this.roles.add(role);
  }

  public removeRole(role: UserRole) {
    this.roles.delete(role);
  }

  public verifyKyc() {
    if (!this.kyc) {
      return Result.fail('no KYC submitted');
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

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getEmail(): Email {
    return this.email;
  }

  public getPhone(): Phone | null {
    return this.phone;
  }

  public getAddress(): string | null {
    return this.address;
  }

  public getAuthProvider(): AuthProvider {
    return this.authProvider;
  }

  public getRoles(): UserRole[] {
    return Array.from(this.roles);
  }

  public getStatus(): UserStatus {
    return this.status;
  }

  public getAvatarUrl(): string | null {
    return this.avatar_url;
  }
}
