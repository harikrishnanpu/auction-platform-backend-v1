import { Result } from '@domain/shared/result';

export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email;
  }

  public static create(email: string): Result<Email> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return Result.fail<Email>('Invalid email format');
    }

    return Result.ok(new Email(email.toLowerCase()));
  }

  public getValue(): string {
    return this.value;
  }
}
