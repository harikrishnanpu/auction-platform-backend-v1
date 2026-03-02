import { UserRoleEnum } from '@domain/entities/user.entity';

export class UserRole {
  private constructor(private readonly value: UserRoleEnum) {}

  static USER = new UserRole(UserRoleEnum.USER);
  static ADMIN = new UserRole(UserRoleEnum.ADMIN);
  static SELLER = new UserRole(UserRoleEnum.SELLER);

  getValue() {
    return this.value;
  }

  equals(role: UserRole): boolean {
    return this.value === role.value;
  }
}
