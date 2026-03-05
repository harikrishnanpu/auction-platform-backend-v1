export class UserRole {
  private constructor(private readonly value: string) {}

  static USER = new UserRole('USER');
  static ADMIN = new UserRole('ADMIN');
  static SELLER = new UserRole('SELLER');

  getValue() {
    return this.value;
  }

  equals(role: UserRole): boolean {
    return this.value === role.value;
  }
}
