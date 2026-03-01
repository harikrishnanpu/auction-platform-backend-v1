export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
}

export class User {
  constructor(
    private id: number,
    private name: string,
    private email: string,
    private password: string,
    private roles: UserRole[],
    private is_verified: boolean = false,
    private is_profile_complete: boolean = false,
    private is_blocked: boolean = false,
  ) {}

  public static create(
    id: number,
    username: string,
    email: string,
    password: string,
    roles: UserRole[],
    is_verified: boolean = false,
    is_profile_complete: boolean = false,
    is_blocked: boolean = false,
  ): User {
    return new User(
      id,
      username,
      email,
      password,
      roles,
      is_verified,
      is_profile_complete,
      is_blocked,
    );
  }
}
