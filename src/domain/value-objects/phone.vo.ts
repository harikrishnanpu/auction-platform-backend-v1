import { Result } from '@domain/shared/result';

export class Phone {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email;
  }

  static create(phone: string): Result<Phone> {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      Result.fail('Invalid phone number format');
    }
    const phoneVo = new Phone(phone);

    return Result.ok(phoneVo);
  }

  getValue() {
    return this.value;
  }
}
